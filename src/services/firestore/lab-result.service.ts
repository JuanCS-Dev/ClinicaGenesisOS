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
   */
  async create(clinicId: string, data: CreateLabResultInput): Promise<string> {
    const resultsRef = getLabResultsCollection(clinicId)

    const resultData = {
      ...data,
      clinicId,
      status: data.status || 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const docRef = await addDoc(resultsRef, resultData)
    return docRef.id
  },

  /**
   * Update a lab result.
   */
  async update(clinicId: string, resultId: string, data: UpdateLabResultInput): Promise<void> {
    const docRef = getLabResultDoc(clinicId, resultId)
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    })
  },

  /**
   * Update lab result status.
   */
  async updateStatus(clinicId: string, resultId: string, status: LabResultStatus): Promise<void> {
    const updateData: Record<string, unknown> = {
      status,
      updatedAt: serverTimestamp(),
    }

    if (status === 'ready') {
      updateData.completedAt = new Date().toISOString()
    }
    if (status === 'viewed') {
      updateData.viewedAt = new Date().toISOString()
    }

    const docRef = getLabResultDoc(clinicId, resultId)
    await updateDoc(docRef, updateData)
  },

  /**
   * Upload result file (PDF or image).
   */
  async uploadFile(
    clinicId: string,
    resultId: string,
    file: File
  ): Promise<{ fileUrl: string; fileName: string; fileSize: number }> {
    const fileType = file.type.includes('pdf') ? 'pdf' : 'image'
    const fileName = `${resultId}_${Date.now()}_${file.name}`
    const storagePath = `clinics/${clinicId}/lab-results/${fileName}`

    const storageRef = ref(storage, storagePath)
    await uploadBytes(storageRef, file)
    const fileUrl = await getDownloadURL(storageRef)

    // Update the lab result with file info
    await this.update(clinicId, resultId, {
      fileUrl,
      fileType,
      fileName: file.name,
      fileSize: file.size,
      status: 'ready',
      completedAt: new Date().toISOString(),
    })

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
   */
  async delete(clinicId: string, resultId: string): Promise<void> {
    // Delete file first if exists
    await this.deleteFile(clinicId, resultId)

    const docRef = getLabResultDoc(clinicId, resultId)
    await deleteDoc(docRef)
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
