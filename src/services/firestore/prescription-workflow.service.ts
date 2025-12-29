/**
 * Prescription Workflow Service
 *
 * Handles prescription lifecycle operations: signing, sending, viewing,
 * filling, canceling, and expiration. Separated from CRUD for single
 * responsibility and better maintainability.
 *
 * Depends on: prescriptionService (core CRUD operations)
 */

import {
  getDocs,
  getDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  type UpdateData,
  type DocumentData,
} from 'firebase/firestore'
import type { Prescription, PrescriptionStatus, PrescriptionLogEntry } from '@/types'
import {
  getPrescriptionCollection,
  getLogsCollection,
  getPrescriptionDoc,
  statusToEventType,
} from './prescription.utils'
import { auditHelper, type AuditUserContext } from './lgpd/audit-helper'
import { addDoc } from 'firebase/firestore'

function buildAuditContext(clinicId: string, userId: string, userName: string): AuditUserContext {
  return { clinicId, userId, userName }
}

/**
 * Prescription workflow operations - lifecycle management.
 */
export const prescriptionWorkflowService = {
  /**
   * Update prescription status with automatic timestamps and audit logging.
   */
  async updateStatus(
    clinicId: string,
    prescriptionId: string,
    status: PrescriptionStatus,
    userId: string,
    userName: string,
    additionalData?: Partial<Prescription>
  ): Promise<void> {
    const docRef = getPrescriptionDoc(clinicId, prescriptionId)
    const previousDoc = await getDoc(docRef)
    const previousStatus = previousDoc.exists() ? previousDoc.data().status : null

    const updateData = {
      status,
      updatedAt: serverTimestamp(),
      ...additionalData,
    } as UpdateData<DocumentData>

    if (status === 'sent' && !additionalData?.sentAt) {
      ;(updateData as Record<string, unknown>).sentAt = new Date().toISOString()
    }
    if (status === 'viewed' && !additionalData?.viewedAt) {
      ;(updateData as Record<string, unknown>).viewedAt = new Date().toISOString()
    }
    if (status === 'filled' && !additionalData?.filledAt) {
      ;(updateData as Record<string, unknown>).filledAt = new Date().toISOString()
    }

    await updateDoc(docRef, updateData)

    await this.addLog(clinicId, prescriptionId, {
      prescriptionId,
      eventType: statusToEventType(status),
      userId,
      userName,
      details: additionalData,
    })

    await auditHelper.logUpdate(
      buildAuditContext(clinicId, userId, userName),
      'prescription',
      prescriptionId,
      { status: previousStatus },
      { status, ...additionalData }
    )
  },

  /**
   * Sign a prescription with digital certificate.
   */
  async sign(
    clinicId: string,
    prescriptionId: string,
    signature: NonNullable<Prescription['signature']>,
    userId: string,
    userName: string,
    getById: (clinicId: string, id: string) => Promise<Prescription | null>
  ): Promise<void> {
    const prescription = await getById(clinicId, prescriptionId)
    if (!prescription) throw new Error('Prescription not found')
    if (prescription.status !== 'draft' && prescription.status !== 'pending_signature') {
      throw new Error('Prescription cannot be signed in current status')
    }
    await this.updateStatus(clinicId, prescriptionId, 'signed', userId, userName, { signature })
  },

  /**
   * Send prescription to patient.
   */
  async sendToPatient(
    clinicId: string,
    prescriptionId: string,
    method: 'email' | 'sms' | 'whatsapp',
    userId: string,
    userName: string,
    getById: (clinicId: string, id: string) => Promise<Prescription | null>
  ): Promise<void> {
    const prescription = await getById(clinicId, prescriptionId)
    if (!prescription) throw new Error('Prescription not found')
    if (prescription.status !== 'signed') {
      throw new Error('Only signed prescriptions can be sent')
    }

    await this.updateStatus(clinicId, prescriptionId, 'sent', userId, userName)
    await this.addLog(clinicId, prescriptionId, {
      prescriptionId,
      eventType: 'sent',
      userId,
      userName,
      details: { method },
    })
  },

  /**
   * Mark prescription as viewed by patient.
   */
  async markAsViewed(
    clinicId: string,
    prescriptionId: string,
    getById: (clinicId: string, id: string) => Promise<Prescription | null>
  ): Promise<void> {
    const prescription = await getById(clinicId, prescriptionId)
    if (!prescription) throw new Error('Prescription not found')
    if (prescription.status === 'sent') {
      await this.updateStatus(clinicId, prescriptionId, 'viewed', 'patient', 'Paciente')
    }
  },

  /**
   * Mark prescription as filled by pharmacy.
   */
  async markAsFilled(
    clinicId: string,
    prescriptionId: string,
    pharmacyName: string,
    getById: (clinicId: string, id: string) => Promise<Prescription | null>
  ): Promise<void> {
    const prescription = await getById(clinicId, prescriptionId)
    if (!prescription) throw new Error('Prescription not found')
    if (!['sent', 'viewed'].includes(prescription.status)) {
      throw new Error('Prescription cannot be marked as filled in current status')
    }
    await this.updateStatus(clinicId, prescriptionId, 'filled', 'pharmacy', pharmacyName, {
      filledByPharmacy: pharmacyName,
    })
  },

  /**
   * Cancel a prescription.
   */
  async cancel(
    clinicId: string,
    prescriptionId: string,
    reason: string,
    userId: string,
    userName: string,
    getById: (clinicId: string, id: string) => Promise<Prescription | null>
  ): Promise<void> {
    const prescription = await getById(clinicId, prescriptionId)
    if (!prescription) throw new Error('Prescription not found')
    if (prescription.status === 'filled') {
      throw new Error('Filled prescriptions cannot be canceled')
    }

    await this.updateStatus(clinicId, prescriptionId, 'canceled', userId, userName)

    await this.addLog(clinicId, prescriptionId, {
      prescriptionId,
      eventType: 'canceled',
      userId,
      userName,
      details: { reason },
    })

    await auditHelper.logUpdate(
      buildAuditContext(clinicId, userId, userName),
      'prescription',
      prescriptionId,
      { status: prescription.status },
      { status: 'canceled', reason }
    )
  },

  /**
   * Check and update expired prescriptions (batch job).
   */
  async checkExpiredPrescriptions(clinicId: string): Promise<number> {
    const prescriptionsRef = getPrescriptionCollection(clinicId)
    const now = new Date().toISOString()
    const q = query(
      prescriptionsRef,
      where('status', 'in', ['signed', 'sent', 'viewed']),
      where('expiresAt', '<', now)
    )

    const querySnapshot = await getDocs(q)
    let count = 0

    for (const docSnap of querySnapshot.docs) {
      const docRef = getPrescriptionDoc(clinicId, docSnap.id)
      await updateDoc(docRef, { status: 'expired', updatedAt: serverTimestamp() })
      await this.addLog(clinicId, docSnap.id, {
        prescriptionId: docSnap.id,
        eventType: 'expired',
        userId: 'system',
        userName: 'Sistema',
      })
      count++
    }
    return count
  },

  /**
   * Add internal log entry.
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
}
