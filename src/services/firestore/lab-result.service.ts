/**
 * Lab Result Service
 *
 * Handles CRUD operations for laboratory exam results.
 * Supports file uploads to Firebase Storage.
 *
 * Collection: /clinics/{clinicId}/lab-results/{resultId}
 */

import {
  collection,
  doc,
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
  limit,
  Timestamp,
  type UpdateData,
  type DocumentData,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '../firebase'
import type {
  LabResult,
  CreateLabResultInput,
  UpdateLabResultInput,
  LabResultFilters,
  LabResultStatus,
} from '@/types'
import { auditHelper, type AuditUserContext } from './lgpd/audit-helper'

/**
 * Audit context for lab result operations.
 */
export interface LabResultAuditContext {
  userId: string
  userName: string
}

/**
 * Build audit context for lab result operations.
 */
function buildAuditContext(clinicId: string, ctx?: LabResultAuditContext): AuditUserContext | null {
  if (!ctx) return null
  return { clinicId, userId: ctx.userId, userName: ctx.userName }
}

/**
 * Get lab results collection reference.
 */
function getLabResultsCollection(clinicId: string) {
  return collection(db, 'clinics', clinicId, 'lab-results')
}

/**
 * Get lab result document reference.
 */
function getLabResultDoc(clinicId: string, resultId: string) {
  return doc(db, 'clinics', clinicId, 'lab-results', resultId)
}

/**
 * Convert Firestore document to LabResult.
 */
function toLabResult(id: string, data: Record<string, unknown>): LabResult {
  return {
    id,
    patientId: data.patientId as string,
    patientName: data.patientName as string,
    examName: data.examName as string,
    examType: data.examType as LabResult['examType'],
    status: data.status as LabResult['status'],
    requestedAt: data.requestedAt as string,
    completedAt: data.completedAt as string | undefined,
    viewedAt: data.viewedAt as string | undefined,
    fileUrl: data.fileUrl as string | undefined,
    fileType: data.fileType as LabResult['fileType'],
    fileName: data.fileName as string | undefined,
    fileSize: data.fileSize as number | undefined,
    requestedBy: data.requestedBy as string,
    requestedByName: data.requestedByName as string | undefined,
    notes: data.notes as string | undefined,
    clinicId: data.clinicId as string,
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : (data.createdAt as string),
    updatedAt:
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate().toISOString()
        : (data.updatedAt as string),
  }
}

/**
 * Lab Result service for Firestore operations.
 */
export const labResultService = {
  /**
   * Get all lab results for a clinic with optional filters.
   */
  async getAll(clinicId: string, filters?: LabResultFilters): Promise<LabResult[]> {
    const resultsRef = getLabResultsCollection(clinicId)
    let q = query(resultsRef, orderBy('requestedAt', 'desc'))

    if (filters?.patientId) {
      q = query(q, where('patientId', '==', filters.patientId))
    }
    if (filters?.examType) {
      q = query(q, where('examType', '==', filters.examType))
    }
    if (filters?.status) {
      q = query(q, where('status', '==', filters.status))
    }
    if (filters?.requestedBy) {
      q = query(q, where('requestedBy', '==', filters.requestedBy))
    }
    if (filters?.limitCount) {
      q = query(q, limit(filters.limitCount))
    }

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(docSnap => toLabResult(docSnap.id, docSnap.data()))
  },

  /**
   * Get lab results for a specific patient.
   */
  async getByPatient(clinicId: string, patientId: string): Promise<LabResult[]> {
    return this.getAll(clinicId, { patientId })
  },

  /**
   * Get a lab result by ID.
   */
  async getById(clinicId: string, resultId: string): Promise<LabResult | null> {
    const docRef = getLabResultDoc(clinicId, resultId)
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) return null
    return toLabResult(docSnap.id, docSnap.data())
  },

  /**
   * Create a new lab result.
   *
   * @param clinicId - Clinic ID
   * @param data - Lab result data
   * @param auditCtx - Optional audit context
   */
  async create(
    clinicId: string,
    data: CreateLabResultInput,
    auditCtx?: LabResultAuditContext
  ): Promise<string> {
    const resultsRef = getLabResultsCollection(clinicId)

    const resultData = {
      ...data,
      clinicId,
      status: data.status || 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const docRef = await addDoc(resultsRef, resultData)

    // LGPD audit log - new lab result (PHI)
    const ctx = buildAuditContext(clinicId, auditCtx)
    if (ctx) {
      await auditHelper.logCreate(ctx, 'lab_result', docRef.id, {
        patientId: data.patientId,
        examName: data.examName,
        examType: data.examType,
        requestedBy: data.requestedBy,
      })
    }

    return docRef.id
  },

  /**
   * Update a lab result.
   *
   * @param clinicId - Clinic ID
   * @param resultId - Result ID
   * @param data - Fields to update
   * @param auditCtx - Optional audit context
   */
  async update(
    clinicId: string,
    resultId: string,
    data: UpdateLabResultInput,
    auditCtx?: LabResultAuditContext
  ): Promise<void> {
    const docRef = getLabResultDoc(clinicId, resultId)

    // Get previous values for audit
    const ctx = buildAuditContext(clinicId, auditCtx)
    let previousValues: Record<string, unknown> | undefined
    if (ctx) {
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        previousValues = {}
        Object.keys(data).forEach(key => {
          const docData = docSnap.data()
          if (key in docData) {
            previousValues![key] = docData[key]
          }
        })
      }
    }

    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    })

    // LGPD audit log
    if (ctx && previousValues) {
      await auditHelper.logUpdate(
        ctx,
        'lab_result',
        resultId,
        previousValues,
        data as Record<string, unknown>
      )
    }
  },

  /**
   * Update lab result status.
   *
   * @param clinicId - Clinic ID
   * @param resultId - Result ID
   * @param status - New status
   * @param auditCtx - Optional audit context
   */
  async updateStatus(
    clinicId: string,
    resultId: string,
    status: LabResultStatus,
    auditCtx?: LabResultAuditContext
  ): Promise<void> {
    const docRef = getLabResultDoc(clinicId, resultId)

    // Get previous status for audit
    const ctx = buildAuditContext(clinicId, auditCtx)
    let previousStatus: string | undefined
    if (ctx) {
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        previousStatus = docSnap.data().status
      }
    }

    const updateData = {
      status,
      updatedAt: serverTimestamp(),
    } as UpdateData<DocumentData>

    if (status === 'ready') {
      ;(updateData as Record<string, unknown>).completedAt = new Date().toISOString()
    }
    if (status === 'viewed') {
      ;(updateData as Record<string, unknown>).viewedAt = new Date().toISOString()
    }

    await updateDoc(docRef, updateData)

    // LGPD audit log
    if (ctx) {
      await auditHelper.logUpdate(
        ctx,
        'lab_result',
        resultId,
        { status: previousStatus },
        { status }
      )
    }
  },

  /**
   * Upload result file (PDF or image).
   *
   * @param clinicId - Clinic ID
   * @param resultId - Result ID
   * @param file - File to upload
   * @param auditCtx - Optional audit context
   */
  async uploadFile(
    clinicId: string,
    resultId: string,
    file: File,
    auditCtx?: LabResultAuditContext
  ): Promise<{ fileUrl: string; fileName: string; fileSize: number }> {
    const fileType = file.type.includes('pdf') ? 'pdf' : 'image'
    const fileName = `${resultId}_${Date.now()}_${file.name}`
    const storagePath = `clinics/${clinicId}/lab-results/${fileName}`

    const storageRef = ref(storage, storagePath)
    await uploadBytes(storageRef, file)
    const fileUrl = await getDownloadURL(storageRef)

    // Update the lab result with file info
    await this.update(
      clinicId,
      resultId,
      {
        fileUrl,
        fileType,
        fileName: file.name,
        fileSize: file.size,
        status: 'ready',
        completedAt: new Date().toISOString(),
      },
      auditCtx
    )

    // LGPD audit log - file upload (sensitive PHI document)
    const ctx = buildAuditContext(clinicId, auditCtx)
    if (ctx) {
      await auditHelper.logCreate(ctx, 'document', resultId, {
        action: 'upload',
        documentType: 'lab_result',
        fileName: file.name,
        fileSize: file.size,
        fileType,
      })
    }

    return { fileUrl, fileName: file.name, fileSize: file.size }
  },

  /**
   * Delete result file from storage.
   */
  async deleteFile(clinicId: string, resultId: string): Promise<void> {
    const result = await this.getById(clinicId, resultId)
    if (!result?.fileUrl) return

    try {
      const storageRef = ref(storage, result.fileUrl)
      await deleteObject(storageRef)
    } catch (error) {
      console.error('Error deleting file from storage:', error)
    }

    await this.update(clinicId, resultId, {
      fileUrl: undefined,
      fileType: undefined,
      fileName: undefined,
      fileSize: undefined,
    })
  },

  /**
   * Delete a lab result.
   *
   * @param clinicId - Clinic ID
   * @param resultId - Result ID
   * @param auditCtx - Optional audit context
   */
  async delete(
    clinicId: string,
    resultId: string,
    auditCtx?: LabResultAuditContext
  ): Promise<void> {
    // Get data for audit before deletion
    const ctx = buildAuditContext(clinicId, auditCtx)
    let deletedData: Record<string, unknown> | undefined
    if (ctx) {
      const result = await this.getById(clinicId, resultId)
      if (result) {
        deletedData = {
          patientId: result.patientId,
          examName: result.examName,
          examType: result.examType,
          status: result.status,
          hasFile: !!result.fileUrl,
        }
      }
    }

    // Delete file first if exists
    await this.deleteFile(clinicId, resultId)

    const docRef = getLabResultDoc(clinicId, resultId)
    await deleteDoc(docRef)

    // LGPD audit log - lab result deletion (PHI)
    if (ctx && deletedData) {
      await auditHelper.logDelete(ctx, 'lab_result', resultId, deletedData)
    }
  },

  /**
   * Mark result as viewed by patient.
   */
  async markAsViewed(clinicId: string, resultId: string): Promise<void> {
    const result = await this.getById(clinicId, resultId)
    if (result && result.status === 'ready') {
      await this.updateStatus(clinicId, resultId, 'viewed')
    }
  },

  /**
   * Subscribe to real-time updates for patient's lab results.
   */
  subscribeByPatient(
    clinicId: string,
    patientId: string,
    callback: (results: LabResult[]) => void
  ): () => void {
    const resultsRef = getLabResultsCollection(clinicId)
    const q = query(resultsRef, where('patientId', '==', patientId), orderBy('requestedAt', 'desc'))

    return onSnapshot(
      q,
      querySnapshot => {
        callback(querySnapshot.docs.map(docSnap => toLabResult(docSnap.id, docSnap.data())))
      },
      error => {
        console.error('Error subscribing to lab results:', error)
        callback([])
      }
    )
  },

  /**
   * Subscribe to all lab results for a clinic.
   */
  subscribe(clinicId: string, callback: (results: LabResult[]) => void): () => void {
    const resultsRef = getLabResultsCollection(clinicId)
    const q = query(resultsRef, orderBy('requestedAt', 'desc'))

    return onSnapshot(
      q,
      querySnapshot => {
        callback(querySnapshot.docs.map(docSnap => toLabResult(docSnap.id, docSnap.data())))
      },
      error => {
        console.error('Error subscribing to lab results:', error)
        callback([])
      }
    )
  },

  /**
   * Get statistics for lab results.
   */
  async getStatistics(
    clinicId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    total: number
    pending: number
    ready: number
    viewed: number
    byType: Record<string, number>
  }> {
    const resultsRef = getLabResultsCollection(clinicId)
    const q = query(
      resultsRef,
      where('requestedAt', '>=', startDate),
      where('requestedAt', '<=', endDate)
    )

    const querySnapshot = await getDocs(q)
    const results = querySnapshot.docs.map(d => toLabResult(d.id, d.data()))

    const byType: Record<string, number> = {}
    let pending = 0
    let ready = 0
    let viewed = 0

    for (const r of results) {
      byType[r.examType] = (byType[r.examType] || 0) + 1
      if (r.status === 'pending') pending++
      else if (r.status === 'ready') ready++
      else if (r.status === 'viewed') viewed++
    }

    return {
      total: results.length,
      pending,
      ready,
      viewed,
      byType,
    }
  },
}
