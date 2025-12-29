/**
 * Digital Prescription Service
 *
 * Handles CRUD operations for digital prescriptions in Firestore.
 * Supports Memed integration for medication database and digital signing.
 * Prescriptions are stored as subcollections under clinics for multi-tenancy.
 *
 * Collection: /clinics/{clinicId}/prescriptions/{prescriptionId}
 * Logs: /clinics/{clinicId}/prescriptions/{prescriptionId}/logs/{logId}
 */

import {
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  limit,
} from 'firebase/firestore'
import type {
  Prescription,
  PrescriptionStatus,
  CreatePrescriptionInput,
  UpdatePrescriptionInput,
  PrescriptionLogEntry,
} from '@/types'
import {
  getPrescriptionCollection,
  getLogsCollection,
  getPrescriptionDoc,
  generateValidationCode,
  calculateExpirationDate,
  toPrescription,
  toLogEntry,
  determinePrescriptionType,
} from './prescription.utils'
import { auditHelper, type AuditUserContext } from './lgpd/audit-helper'
import { prescriptionWorkflowService } from './prescription-workflow.service'

/**
 * Build audit context for LGPD logging.
 */
function buildAuditContext(clinicId: string, userId: string, userName: string): AuditUserContext {
  return { clinicId, userId, userName }
}

/**
 * Digital Prescription service for Firestore operations.
 */
export const prescriptionService = {
  /**
   * Get all prescriptions for a clinic.
   *
   * @param clinicId - The clinic ID
   * @param options - Optional filters
   * @returns Array of prescriptions sorted by date (descending)
   */
  async getAll(
    clinicId: string,
    options?: {
      patientId?: string
      professionalId?: string
      status?: PrescriptionStatus
      limitCount?: number
    }
  ): Promise<Prescription[]> {
    const prescriptionsRef = getPrescriptionCollection(clinicId)
    let q = query(prescriptionsRef, orderBy('prescribedAt', 'desc'))

    if (options?.patientId) {
      q = query(q, where('patientId', '==', options.patientId))
    }
    if (options?.professionalId) {
      q = query(q, where('professionalId', '==', options.professionalId))
    }
    if (options?.status) {
      q = query(q, where('status', '==', options.status))
    }
    if (options?.limitCount) {
      q = query(q, limit(options.limitCount))
    }

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(docSnap => toPrescription(docSnap.id, docSnap.data()))
  },

  /**
   * Get prescriptions for a specific patient.
   */
  async getByPatient(clinicId: string, patientId: string): Promise<Prescription[]> {
    return this.getAll(clinicId, { patientId })
  },

  /**
   * Get a prescription by ID.
   */
  async getById(clinicId: string, prescriptionId: string): Promise<Prescription | null> {
    const docRef = getPrescriptionDoc(clinicId, prescriptionId)
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) return null
    return toPrescription(docSnap.id, docSnap.data())
  },

  /**
   * Get prescription by validation code.
   */
  async getByValidationCode(
    clinicId: string,
    validationCode: string
  ): Promise<Prescription | null> {
    const prescriptionsRef = getPrescriptionCollection(clinicId)
    const q = query(prescriptionsRef, where('validationCode', '==', validationCode), limit(1))
    const querySnapshot = await getDocs(q)
    if (querySnapshot.empty) return null
    const docSnap = querySnapshot.docs[0]
    return toPrescription(docSnap.id, docSnap.data())
  },

  /**
   * Create a new prescription.
   */
  async create(
    clinicId: string,
    data: CreatePrescriptionInput,
    professional: { id: string; name: string; crm: string; crmState: string }
  ): Promise<string> {
    const prescriptionsRef = getPrescriptionCollection(clinicId)
    const prescribedAt = new Date().toISOString()
    const type = data.type || determinePrescriptionType(data.medications)
    const expiresAt = calculateExpirationDate(prescribedAt, type)
    const validationCode = generateValidationCode()

    const prescriptionData = {
      clinicId,
      patientId: data.patientId,
      patientName: data.patientName,
      patientCpf: data.patientCpf || null,
      professionalId: professional.id,
      professionalName: professional.name,
      professionalCrm: professional.crm,
      professionalCrmState: professional.crmState,
      type,
      status: 'draft' as PrescriptionStatus,
      medications: data.medications,
      observations: data.observations || null,
      validityDays: data.validityDays || 60,
      prescribedAt,
      expiresAt,
      validationCode,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const docRef = await addDoc(prescriptionsRef, prescriptionData)

    // Internal log
    await this.addLog(clinicId, docRef.id, {
      prescriptionId: docRef.id,
      eventType: 'created',
      userId: professional.id,
      userName: professional.name,
      details: { medicationCount: data.medications.length },
    })

    // LGPD audit log
    await auditHelper.logCreate(
      buildAuditContext(clinicId, professional.id, professional.name),
      'prescription',
      docRef.id,
      {
        patientId: data.patientId,
        medicationCount: data.medications.length,
        type,
      }
    )

    return docRef.id
  },

  /**
   * Update a prescription (only drafts can be updated).
   */
  async update(
    clinicId: string,
    prescriptionId: string,
    data: UpdatePrescriptionInput,
    userId: string,
    userName: string
  ): Promise<void> {
    const prescription = await this.getById(clinicId, prescriptionId)
    if (!prescription) throw new Error('Prescription not found')
    if (prescription.status !== 'draft') {
      throw new Error('Only draft prescriptions can be updated')
    }

    const docRef = getPrescriptionDoc(clinicId, prescriptionId)
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() })

    // Internal log
    await this.addLog(clinicId, prescriptionId, {
      prescriptionId,
      eventType: 'updated',
      userId,
      userName,
      details: { fields: Object.keys(data) },
    })

    // LGPD audit log
    await auditHelper.logUpdate(
      buildAuditContext(clinicId, userId, userName),
      'prescription',
      prescriptionId,
      { status: prescription.status },
      data as Record<string, unknown>
    )
  },

  // =========================================================================
  // Workflow Operations (delegated to prescription-workflow.service.ts)
  // =========================================================================

  /** Update prescription status with automatic timestamps and audit. */
  updateStatus: prescriptionWorkflowService.updateStatus.bind(prescriptionWorkflowService),

  /** Sign a prescription with digital certificate. */
  async sign(
    clinicId: string,
    prescriptionId: string,
    signature: NonNullable<Prescription['signature']>,
    userId: string,
    userName: string
  ): Promise<void> {
    return prescriptionWorkflowService.sign(
      clinicId,
      prescriptionId,
      signature,
      userId,
      userName,
      this.getById.bind(this)
    )
  },

  /** Send prescription to patient. */
  async sendToPatient(
    clinicId: string,
    prescriptionId: string,
    method: 'email' | 'sms' | 'whatsapp',
    userId: string,
    userName: string
  ): Promise<void> {
    return prescriptionWorkflowService.sendToPatient(
      clinicId,
      prescriptionId,
      method,
      userId,
      userName,
      this.getById.bind(this)
    )
  },

  /** Mark prescription as viewed by patient. */
  async markAsViewed(clinicId: string, prescriptionId: string): Promise<void> {
    return prescriptionWorkflowService.markAsViewed(
      clinicId,
      prescriptionId,
      this.getById.bind(this)
    )
  },

  /** Mark prescription as filled by pharmacy. */
  async markAsFilled(
    clinicId: string,
    prescriptionId: string,
    pharmacyName: string
  ): Promise<void> {
    return prescriptionWorkflowService.markAsFilled(
      clinicId,
      prescriptionId,
      pharmacyName,
      this.getById.bind(this)
    )
  },

  /** Cancel a prescription. */
  async cancel(
    clinicId: string,
    prescriptionId: string,
    reason: string,
    userId: string,
    userName: string
  ): Promise<void> {
    return prescriptionWorkflowService.cancel(
      clinicId,
      prescriptionId,
      reason,
      userId,
      userName,
      this.getById.bind(this)
    )
  },

  /** Check and update expired prescriptions (batch job). */
  checkExpiredPrescriptions: prescriptionWorkflowService.checkExpiredPrescriptions.bind(
    prescriptionWorkflowService
  ),

  /**
   * Add a log entry for audit purposes.
   */
  async addLog(
    clinicId: string,
    prescriptionId: string,
    log: Omit<PrescriptionLogEntry, 'id' | 'timestamp'>
  ): Promise<string> {
    const logsRef = getLogsCollection(clinicId, prescriptionId)
    const docRef = await addDoc(logsRef, { ...log, timestamp: serverTimestamp() })
    return docRef.id
  },

  /**
   * Get all logs for a prescription.
   */
  async getLogs(clinicId: string, prescriptionId: string): Promise<PrescriptionLogEntry[]> {
    const logsRef = getLogsCollection(clinicId, prescriptionId)
    const q = query(logsRef, orderBy('timestamp', 'asc'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(docSnap => toLogEntry(docSnap.id, docSnap.data()))
  },

  /**
   * Subscribe to real-time updates for a prescription.
   */
  subscribe(
    clinicId: string,
    prescriptionId: string,
    callback: (prescription: Prescription | null) => void
  ): () => void {
    const docRef = getPrescriptionDoc(clinicId, prescriptionId)
    return onSnapshot(
      docRef,
      docSnap => {
        callback(docSnap.exists() ? toPrescription(docSnap.id, docSnap.data()) : null)
      },
      error => {
        console.error('Error subscribing to prescription:', error)
        callback(null)
      }
    )
  },

  /**
   * Subscribe to prescriptions for a patient.
   */
  subscribeByPatient(
    clinicId: string,
    patientId: string,
    callback: (prescriptions: Prescription[]) => void
  ): () => void {
    const prescriptionsRef = getPrescriptionCollection(clinicId)
    const q = query(
      prescriptionsRef,
      where('patientId', '==', patientId),
      orderBy('prescribedAt', 'desc')
    )

    return onSnapshot(
      q,
      querySnapshot => {
        callback(querySnapshot.docs.map(docSnap => toPrescription(docSnap.id, docSnap.data())))
      },
      error => {
        console.error('Error subscribing to patient prescriptions:', error)
        callback([])
      }
    )
  },

  /**
   * Get prescription statistics for a clinic.
   */
  async getStatistics(
    clinicId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    total: number
    byStatus: Record<PrescriptionStatus, number>
    byType: Record<string, number>
    controlled: number
  }> {
    const prescriptionsRef = getPrescriptionCollection(clinicId)
    const q = query(
      prescriptionsRef,
      where('prescribedAt', '>=', startDate),
      where('prescribedAt', '<=', endDate)
    )

    const querySnapshot = await getDocs(q)
    const prescriptions = querySnapshot.docs.map(d => toPrescription(d.id, d.data()))

    const byStatus: Record<string, number> = {}
    const byType: Record<string, number> = {}
    let controlled = 0

    for (const p of prescriptions) {
      byStatus[p.status] = (byStatus[p.status] || 0) + 1
      byType[p.type] = (byType[p.type] || 0) + 1
      if (p.type !== 'common') controlled++
    }

    return {
      total: prescriptions.length,
      byStatus: byStatus as Record<PrescriptionStatus, number>,
      byType,
      controlled,
    }
  },
}
