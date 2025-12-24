/**
 * LGPD Document Converters
 *
 * Converters for LGPD Firestore documents.
 *
 * @module services/firestore/lgpd/converters
 */

import type {
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import type {
  AuditLogEntry,
  ConsentRecord,
  DataExportRequest,
} from '@/types/lgpd';

/**
 * Convert Firestore doc to AuditLogEntry.
 */
export function auditLogConverter(
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
export function consentConverter(
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
export function exportRequestConverter(
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
