/**
 * Medical Record Service
 *
 * Handles CRUD operations for medical records in Firestore.
 * Records are polymorphic (SOAP, Prescription, etc.) and stored as
 * subcollections under clinics for multi-tenancy.
 *
 * Collection: /clinics/{clinicId}/records/{recordId}
 *
 * @see record.utils.ts - Type conversion and helper functions
 * @see record-version.service.ts - Version history operations
 */

import {
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  type UpdateData,
  type DocumentData,
} from 'firebase/firestore'
import { recordVersionService } from './record-version.service'
import { auditHelper } from './lgpd/audit-helper'
import {
  getRecordsCollection,
  getRecordDoc,
  buildAuditContext,
  toRecord,
  type RecordServiceAuditContext,
} from './record.utils'
import type {
  MedicalRecord,
  RecordType,
  CreateRecordInput,
  RecordVersion,
  RecordAttachment,
} from '@/types'

// Re-export for backward compatibility
export type { RecordServiceAuditContext } from './record.utils'

/**
 * Medical record service for Firestore operations.
 */
export const recordService = {
  /**
   * Get all records for a clinic.
   */
  async getAll(clinicId: string): Promise<MedicalRecord[]> {
    const recordsRef = getRecordsCollection(clinicId)
    const q = query(recordsRef, orderBy('date', 'desc'))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map(docSnap => toRecord(docSnap.id, docSnap.data()))
  },

  /**
   * Get records for a specific patient.
   */
  async getByPatient(clinicId: string, patientId: string): Promise<MedicalRecord[]> {
    const recordsRef = getRecordsCollection(clinicId)
    const q = query(recordsRef, where('patientId', '==', patientId), orderBy('date', 'desc'))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map(docSnap => toRecord(docSnap.id, docSnap.data()))
  },

  /**
   * Get a record by ID.
   *
   * @param auditCtx - Optional audit context for LGPD logging
   */
  async getById(
    clinicId: string,
    recordId: string,
    auditCtx?: RecordServiceAuditContext
  ): Promise<MedicalRecord | null> {
    const docRef = getRecordDoc(clinicId, recordId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return null
    }

    const record = toRecord(docSnap.id, docSnap.data())

    // Log PHI access for LGPD/HIPAA compliance
    const ctx = buildAuditContext(clinicId, auditCtx)
    if (ctx) {
      await auditHelper.logView(ctx, 'medical_record', recordId, {
        patientId: record.patientId,
        recordType: record.type,
        accessedFields: ['all_phi_fields'],
      })
    }

    return record
  },

  /**
   * Create a new medical record.
   *
   * @param auditCtx - Optional audit context for LGPD logging
   */
  async create(
    clinicId: string,
    data: CreateRecordInput,
    professional: string,
    auditCtx?: RecordServiceAuditContext
  ): Promise<string> {
    const recordsRef = getRecordsCollection(clinicId)

    const recordData = {
      ...data,
      professional,
      date: serverTimestamp(),
      version: 1,
    }

    const docRef = await addDoc(recordsRef, recordData)

    // Log PHI creation for LGPD/HIPAA compliance
    const ctx = buildAuditContext(clinicId, auditCtx)
    if (ctx) {
      await auditHelper.logCreate(ctx, 'medical_record', docRef.id, {
        patientId: data.patientId,
        recordType: data.type,
        professional,
      })
    }

    return docRef.id
  },

  /**
   * Update an existing record with versioning.
   * Saves current state to versions subcollection before applying changes.
   *
   * @param updatedBy - Name of the professional making the update
   * @param changeReason - Optional reason for the change (for audit trail)
   * @param auditCtx - Optional audit context for LGPD logging
   */
  async update(
    clinicId: string,
    recordId: string,
    data: Partial<Omit<MedicalRecord, 'id' | 'date' | 'professional'>>,
    updatedBy?: string,
    changeReason?: string,
    auditCtx?: RecordServiceAuditContext
  ): Promise<void> {
    const docRef = getRecordDoc(clinicId, recordId)

    // Get current record state before update
    const currentDoc = await getDoc(docRef)
    if (!currentDoc.exists()) {
      throw new Error('Record not found')
    }

    const currentData = currentDoc.data()
    const currentVersion = (currentData.version as number) || 1

    // Save current state to versions subcollection
    await recordVersionService.saveVersion(
      clinicId,
      recordId,
      currentData,
      currentVersion,
      updatedBy || (currentData.professional as string),
      changeReason
    )

    // Prepare update data
    const updateData = { ...data } as UpdateData<DocumentData>

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if ((updateData as Record<string, unknown>)[key] === undefined) {
        delete (updateData as Record<string, unknown>)[key]
      }
    })

    // Add versioning metadata
    ;(updateData as Record<string, unknown>).version = currentVersion + 1
    ;(updateData as Record<string, unknown>).updatedAt = serverTimestamp()
    if (updatedBy) {
      ;(updateData as Record<string, unknown>).updatedBy = updatedBy
    }

    await updateDoc(docRef, updateData)

    // Log PHI modification for LGPD/HIPAA compliance
    const ctx = buildAuditContext(clinicId, auditCtx)
    if (ctx) {
      const previousValues: Record<string, unknown> = {}
      Object.keys(data).forEach(key => {
        if (key in currentData) {
          previousValues[key] = currentData[key]
        }
      })

      await auditHelper.logUpdate(
        ctx,
        'medical_record',
        recordId,
        previousValues,
        data as Record<string, unknown>
      )
    }
  },

  /**
   * Delete a record.
   *
   * @param auditCtx - Optional audit context for LGPD logging
   */
  async delete(
    clinicId: string,
    recordId: string,
    auditCtx?: RecordServiceAuditContext
  ): Promise<void> {
    const docRef = getRecordDoc(clinicId, recordId)

    // Get record data before deletion for audit log
    const ctx = buildAuditContext(clinicId, auditCtx)
    let previousValues: Record<string, unknown> | undefined
    if (ctx) {
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        previousValues = docSnap.data()
      }
    }

    await deleteDoc(docRef)

    // Log PHI deletion for LGPD/HIPAA compliance
    if (ctx) {
      await auditHelper.logDelete(ctx, 'medical_record', recordId, previousValues)
    }
  },

  // =========================================================================
  // Subscription Methods
  // =========================================================================

  /**
   * Subscribe to real-time updates for all records.
   */
  subscribe(clinicId: string, callback: (records: MedicalRecord[]) => void): () => void {
    const recordsRef = getRecordsCollection(clinicId)
    const q = query(recordsRef, orderBy('date', 'desc'))

    return onSnapshot(
      q,
      querySnapshot => {
        const records = querySnapshot.docs.map(docSnap => toRecord(docSnap.id, docSnap.data()))
        callback(records)
      },
      error => {
        console.error('Error subscribing to records:', error)
        callback([])
      }
    )
  },

  /**
   * Subscribe to real-time updates for a patient's records.
   */
  subscribeByPatient(
    clinicId: string,
    patientId: string,
    callback: (records: MedicalRecord[]) => void
  ): () => void {
    const recordsRef = getRecordsCollection(clinicId)
    const q = query(recordsRef, where('patientId', '==', patientId), orderBy('date', 'desc'))

    return onSnapshot(
      q,
      querySnapshot => {
        const records = querySnapshot.docs.map(docSnap => toRecord(docSnap.id, docSnap.data()))
        callback(records)
      },
      error => {
        console.error('Error subscribing to patient records:', error)
        callback([])
      }
    )
  },

  // =========================================================================
  // Query Methods
  // =========================================================================

  /**
   * Get records of a specific type for a patient.
   */
  async getByPatientAndType(
    clinicId: string,
    patientId: string,
    recordType: RecordType
  ): Promise<MedicalRecord[]> {
    const recordsRef = getRecordsCollection(clinicId)
    const q = query(
      recordsRef,
      where('patientId', '==', patientId),
      where('type', '==', recordType),
      orderBy('date', 'desc')
    )
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map(docSnap => toRecord(docSnap.id, docSnap.data()))
  },

  // =========================================================================
  // Attachment Methods
  // =========================================================================

  /**
   * Add an attachment to a record.
   */
  async addAttachment(
    clinicId: string,
    recordId: string,
    attachment: RecordAttachment
  ): Promise<void> {
    const docRef = getRecordDoc(clinicId, recordId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      throw new Error('Record not found')
    }

    const currentData = docSnap.data()
    const currentAttachments = (currentData.attachments as RecordAttachment[]) || []

    await updateDoc(docRef, {
      attachments: [...currentAttachments, attachment],
    })
  },

  /**
   * Remove an attachment from a record.
   */
  async removeAttachment(clinicId: string, recordId: string, attachmentId: string): Promise<void> {
    const docRef = getRecordDoc(clinicId, recordId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      throw new Error('Record not found')
    }

    const currentData = docSnap.data()
    const currentAttachments = (currentData.attachments as RecordAttachment[]) || []
    const updatedAttachments = currentAttachments.filter(a => a.id !== attachmentId)

    await updateDoc(docRef, {
      attachments: updatedAttachments,
    })
  },

  // =========================================================================
  // Version History Methods (delegated to recordVersionService)
  // =========================================================================

  /**
   * Get version history for a record.
   * @see recordVersionService.getHistory
   */
  async getVersionHistory(clinicId: string, recordId: string): Promise<RecordVersion[]> {
    return recordVersionService.getHistory(clinicId, recordId)
  },

  /**
   * Get a specific version of a record.
   * @see recordVersionService.getVersion
   */
  async getVersion(
    clinicId: string,
    recordId: string,
    versionNumber: number
  ): Promise<RecordVersion | null> {
    return recordVersionService.getVersion(clinicId, recordId, versionNumber)
  },

  /**
   * Restore a record to a previous version.
   * @see recordVersionService.restore
   */
  async restoreVersion(
    clinicId: string,
    recordId: string,
    versionNumber: number,
    restoredBy: string
  ): Promise<number> {
    return recordVersionService.restore(clinicId, recordId, versionNumber, restoredBy)
  },
}
