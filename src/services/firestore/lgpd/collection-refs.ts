/**
 * LGPD Collection References
 *
 * Firestore collection references for LGPD compliance.
 *
 * @module services/firestore/lgpd/collection-refs
 */

import { collection, doc } from 'firebase/firestore';
import { db } from '@/services/firebase';

/**
 * Get audit logs collection reference.
 */
export function getAuditLogsRef(clinicId: string) {
  return collection(db, 'clinics', clinicId, 'auditLogs');
}

/**
 * Get consents collection reference.
 */
export function getConsentsRef(clinicId: string) {
  return collection(db, 'clinics', clinicId, 'consents');
}

/**
 * Get data export requests collection reference.
 */
export function getExportRequestsRef(clinicId: string) {
  return collection(db, 'clinics', clinicId, 'dataExportRequests');
}

/**
 * Get consent document reference.
 */
export function getConsentDoc(clinicId: string, consentId: string) {
  return doc(db, 'clinics', clinicId, 'consents', consentId);
}

/**
 * Get export request document reference.
 */
export function getExportRequestDoc(clinicId: string, requestId: string) {
  return doc(db, 'clinics', clinicId, 'dataExportRequests', requestId);
}
