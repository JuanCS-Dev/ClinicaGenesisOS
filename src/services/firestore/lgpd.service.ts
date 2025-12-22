/**
 * LGPD Service
 * ============
 *
 * Service for LGPD compliance operations.
 * Handles audit logging, consent management, and data export requests.
 *
 * Fase 11: LGPD Compliance
 *
 * LGPD References:
 * - Art. 37: Processing records requirement
 * - Art. 18: Data subject rights
 * - Art. 46: Security measures
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import type {
  AuditLogEntry,
  CreateAuditLogInput,
  ConsentRecord,
  ConsentInput,
  DataExportRequest,
  CreateDataExportInput,
  ConsentStatus,
  AuditAction,
  AuditResourceType,
} from '@/types/lgpd';

// ============================================
// Collection References
// ============================================

/**
 * Get audit logs collection reference.
 */
function getAuditLogsRef(clinicId: string) {
  return collection(db, 'clinics', clinicId, 'auditLogs');
}

/**
 * Get consents collection reference.
 */
function getConsentsRef(clinicId: string) {
  return collection(db, 'clinics', clinicId, 'consents');
}

/**
 * Get data export requests collection reference.
 */
function getExportRequestsRef(clinicId: string) {
  return collection(db, 'clinics', clinicId, 'dataExportRequests');
}

// ============================================
// Converters
// ============================================

/**
 * Convert Firestore doc to AuditLogEntry.
 */
function auditLogConverter(
  doc: QueryDocumentSnapshot<DocumentData>
): AuditLogEntry {
  const data = doc.data();
  return {
    id: doc.id,
    clinicId: data.clinicId,
    userId: data.userId,
    userName: data.userName,
    action: data.action,
    resourceType: data.resourceType,
    resourceId: data.resourceId,
    details: data.details,
    modifiedFields: data.modifiedFields,
    previousValues: data.previousValues,
    newValues: data.newValues,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
    location: data.location,
    sessionId: data.sessionId,
    requestId: data.requestId,
    timestamp: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
  };
}

/**
 * Convert Firestore doc to ConsentRecord.
 */
function consentConverter(
  doc: QueryDocumentSnapshot<DocumentData>
): ConsentRecord {
  const data = doc.data();
  return {
    id: doc.id,
    userId: data.userId,
    purpose: data.purpose,
    dataCategories: data.dataCategories || [],
    status: data.status,
    version: data.version,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
    grantedAt: data.grantedAt?.toDate?.()?.toISOString(),
    withdrawnAt: data.withdrawnAt?.toDate?.()?.toISOString(),
    expiresAt: data.expiresAt?.toDate?.()?.toISOString(),
    createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  };
}

/**
 * Convert Firestore doc to DataExportRequest.
 */
function exportRequestConverter(
  doc: QueryDocumentSnapshot<DocumentData>
): DataExportRequest {
  const data = doc.data();
  return {
    id: doc.id,
    clinicId: data.clinicId,
    userId: data.userId,
    type: data.type,
    status: data.status,
    dataCategories: data.dataCategories || [],
    format: data.format,
    downloadUrl: data.downloadUrl,
    downloadExpiresAt: data.downloadExpiresAt?.toDate?.()?.toISOString(),
    reason: data.reason,
    notes: data.notes,
    errorMessage: data.errorMessage,
    createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    completedAt: data.completedAt?.toDate?.()?.toISOString(),
  };
}

// ============================================
// Audit Logging
// ============================================

/**
 * Log an audit event (LGPD Art. 37 compliance).
 *
 * @param clinicId - Clinic ID
 * @param userId - User performing action
 * @param userName - User display name
 * @param input - Audit log input
 * @returns Created audit log ID
 */
export async function logAuditEvent(
  clinicId: string,
  userId: string,
  userName: string,
  input: CreateAuditLogInput
): Promise<string> {
  const ref = getAuditLogsRef(clinicId);

  const entry = {
    clinicId,
    userId,
    userName,
    action: input.action,
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    details: input.details || null,
    modifiedFields: input.modifiedFields || null,
    previousValues: input.previousValues || null,
    newValues: input.newValues || null,
    ipAddress: null, // Set by caller if available
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    location: null,
    sessionId: null,
    requestId: crypto.randomUUID(),
    timestamp: serverTimestamp(),
  };

  const docRef = await addDoc(ref, entry);
  return docRef.id;
}

/**
 * Get audit logs for a resource.
 *
 * @param clinicId - Clinic ID
 * @param resourceType - Type of resource
 * @param resourceId - Resource ID
 * @param maxResults - Maximum results (default 100)
 * @returns List of audit log entries
 */
export async function getResourceAuditLogs(
  clinicId: string,
  resourceType: AuditResourceType,
  resourceId: string,
  maxResults: number = 100
): Promise<AuditLogEntry[]> {
  const ref = getAuditLogsRef(clinicId);
  const q = query(
    ref,
    where('resourceType', '==', resourceType),
    where('resourceId', '==', resourceId),
    orderBy('timestamp', 'desc'),
    limit(maxResults)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(auditLogConverter);
}

/**
 * Get audit logs for a user.
 *
 * @param clinicId - Clinic ID
 * @param userId - User ID
 * @param maxResults - Maximum results (default 100)
 * @returns List of audit log entries
 */
export async function getUserAuditLogs(
  clinicId: string,
  userId: string,
  maxResults: number = 100
): Promise<AuditLogEntry[]> {
  const ref = getAuditLogsRef(clinicId);
  const q = query(
    ref,
    where('userId', '==', userId),
    orderBy('timestamp', 'desc'),
    limit(maxResults)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(auditLogConverter);
}

/**
 * Get audit logs by action type.
 *
 * @param clinicId - Clinic ID
 * @param action - Action type
 * @param maxResults - Maximum results (default 100)
 * @returns List of audit log entries
 */
export async function getAuditLogsByAction(
  clinicId: string,
  action: AuditAction,
  maxResults: number = 100
): Promise<AuditLogEntry[]> {
  const ref = getAuditLogsRef(clinicId);
  const q = query(
    ref,
    where('action', '==', action),
    orderBy('timestamp', 'desc'),
    limit(maxResults)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(auditLogConverter);
}

// ============================================
// Consent Management
// ============================================

/**
 * Record user consent.
 *
 * @param clinicId - Clinic ID
 * @param userId - User/patient ID
 * @param input - Consent input
 * @returns Created consent ID
 */
export async function recordConsent(
  clinicId: string,
  userId: string,
  input: ConsentInput
): Promise<string> {
  const ref = getConsentsRef(clinicId);

  const record = {
    userId,
    purpose: input.purpose,
    dataCategories: input.dataCategories,
    status: input.status,
    version: input.version || '1.0.0',
    ipAddress: null, // Set by caller
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    grantedAt: input.status === 'granted' ? serverTimestamp() : null,
    withdrawnAt: input.status === 'withdrawn' ? serverTimestamp() : null,
    expiresAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(ref, record);

  // Log consent action
  await logAuditEvent(clinicId, userId, '', {
    action: input.status === 'granted' ? 'consent_grant' : 'consent_withdraw',
    resourceType: 'consent',
    resourceId: docRef.id,
    details: {
      purpose: input.purpose,
      dataCategories: input.dataCategories,
    },
  });

  return docRef.id;
}

/**
 * Get user consents.
 *
 * @param clinicId - Clinic ID
 * @param userId - User/patient ID
 * @returns List of consent records
 */
export async function getUserConsents(
  clinicId: string,
  userId: string
): Promise<ConsentRecord[]> {
  const ref = getConsentsRef(clinicId);
  const q = query(
    ref,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(consentConverter);
}

/**
 * Update consent status.
 *
 * @param clinicId - Clinic ID
 * @param consentId - Consent ID
 * @param status - New status
 */
export async function updateConsentStatus(
  clinicId: string,
  consentId: string,
  status: ConsentStatus
): Promise<void> {
  const ref = doc(db, 'clinics', clinicId, 'consents', consentId);

  const updates: Record<string, unknown> = {
    status,
    updatedAt: serverTimestamp(),
  };

  if (status === 'granted') {
    updates.grantedAt = serverTimestamp();
  } else if (status === 'withdrawn') {
    updates.withdrawnAt = serverTimestamp();
  }

  await updateDoc(ref, updates);
}

/**
 * Check if user has granted consent for a purpose.
 *
 * @param clinicId - Clinic ID
 * @param userId - User/patient ID
 * @param purpose - Processing purpose
 * @returns True if consent is granted and valid
 */
export async function hasValidConsent(
  clinicId: string,
  userId: string,
  purpose: string
): Promise<boolean> {
  const ref = getConsentsRef(clinicId);
  const q = query(
    ref,
    where('userId', '==', userId),
    where('purpose', '==', purpose),
    where('status', '==', 'granted'),
    limit(1)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return false;
  }

  const consent = snapshot.docs[0].data();

  // Check expiration
  if (consent.expiresAt) {
    const expiresAt = consent.expiresAt.toDate();
    if (expiresAt < new Date()) {
      return false;
    }
  }

  return true;
}

// ============================================
// Data Export Requests
// ============================================

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
  const ref = getExportRequestsRef(clinicId);

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
  };

  const docRef = await addDoc(ref, request);

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
  });

  return docRef.id;
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
  const ref = doc(db, 'clinics', clinicId, 'dataExportRequests', requestId);
  const docSnap = await getDoc(ref);

  if (!docSnap.exists()) {
    return null;
  }

  return exportRequestConverter(docSnap as QueryDocumentSnapshot<DocumentData>);
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
  const ref = getExportRequestsRef(clinicId);
  const q = query(
    ref,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(exportRequestConverter);
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
  const ref = doc(db, 'clinics', clinicId, 'dataExportRequests', requestId);

  const updates: Record<string, unknown> = {
    status,
  };

  if (status === 'completed' && downloadUrl) {
    updates.downloadUrl = downloadUrl;
    updates.completedAt = serverTimestamp();
    // Link expires in 24 hours
    updates.downloadExpiresAt = Timestamp.fromDate(
      new Date(Date.now() + 24 * 60 * 60 * 1000)
    );
  }

  await updateDoc(ref, updates);
}

