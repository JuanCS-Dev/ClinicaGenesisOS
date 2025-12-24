/**
 * LGPD Audit Logging
 *
 * Audit logging functions for LGPD compliance (Art. 37).
 *
 * @module services/firestore/lgpd/audit
 */

import {
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import type {
  AuditLogEntry,
  CreateAuditLogInput,
  AuditAction,
  AuditResourceType,
} from '@/types/lgpd';
import { getAuditLogsRef } from './collection-refs';
import { auditLogConverter } from './converters';

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
