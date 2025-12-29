/**
 * LGPD Data Export Requests
 *
 * Data export request management for LGPD Art. 18 compliance.
 *
 * @module services/firestore/lgpd/export
 */

import {
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
  type UpdateData,
} from 'firebase/firestore'
import type { DataExportRequest, CreateDataExportInput } from '@/types/lgpd'
import { getExportRequestsRef, getExportRequestDoc } from './collection-refs'
import { exportRequestConverter } from './converters'
import { logAuditEvent } from './audit'

/**
 * Create a data export request (LGPD Art. 18).
 *
 * @param clinicId - Clinic ID
 * @param userId - Requesting user ID
 * @param input - Export request input
 * @returns Created request ID
 */
export async function createDataExportRequest(
  clinicId: string,
  userId: string,
  input: CreateDataExportInput
): Promise<string> {
  const ref = getExportRequestsRef(clinicId)

  const request = {
    clinicId,
    userId,
    type: input.type,
    status: 'pending',
    dataCategories: input.dataCategories,
    format: input.format,
    downloadUrl: null,
    downloadExpiresAt: null,
    reason: input.reason || null,
    notes: null,
    errorMessage: null,
    createdAt: serverTimestamp(),
    completedAt: null,
  }

  const docRef = await addDoc(ref, request)

  // Log the request
  await logAuditEvent(clinicId, userId, '', {
    action: 'data_request',
    resourceType: 'user',
    resourceId: userId,
    details: {
      requestId: docRef.id,
      type: input.type,
      dataCategories: input.dataCategories,
    },
  })

  return docRef.id
}

/**
 * Get data export request by ID.
 *
 * @param clinicId - Clinic ID
 * @param requestId - Request ID
 * @returns Data export request or null
 */
export async function getDataExportRequest(
  clinicId: string,
  requestId: string
): Promise<DataExportRequest | null> {
  const ref = getExportRequestDoc(clinicId, requestId)
  const docSnap = await getDoc(ref)

  if (!docSnap.exists()) {
    return null
  }

  return exportRequestConverter(docSnap as QueryDocumentSnapshot<DocumentData>)
}

/**
 * Get user's data export requests.
 *
 * @param clinicId - Clinic ID
 * @param userId - User ID
 * @returns List of export requests
 */
export async function getUserExportRequests(
  clinicId: string,
  userId: string
): Promise<DataExportRequest[]> {
  const ref = getExportRequestsRef(clinicId)
  const q = query(ref, where('userId', '==', userId), orderBy('createdAt', 'desc'))

  const snapshot = await getDocs(q)
  return snapshot.docs.map(exportRequestConverter)
}

/**
 * Update data export request status.
 *
 * @param clinicId - Clinic ID
 * @param requestId - Request ID
 * @param status - New status
 * @param downloadUrl - Download URL (if completed)
 */
export async function updateExportRequestStatus(
  clinicId: string,
  requestId: string,
  status: DataExportRequest['status'],
  downloadUrl?: string
): Promise<void> {
  const ref = getExportRequestDoc(clinicId, requestId)

  const updates = {
    status,
  } as UpdateData<DocumentData>

  if (status === 'completed' && downloadUrl) {
    ;(updates as Record<string, unknown>).downloadUrl = downloadUrl
    ;(updates as Record<string, unknown>).completedAt = serverTimestamp()
    // Link expires in 24 hours
    ;(updates as Record<string, unknown>).downloadExpiresAt = Timestamp.fromDate(
      new Date(Date.now() + 24 * 60 * 60 * 1000)
    )
  }

  await updateDoc(ref, updates)
}
