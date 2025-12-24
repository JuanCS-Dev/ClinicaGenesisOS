/**
 * LGPD Consent Management
 *
 * Consent recording and management functions.
 *
 * @module services/firestore/lgpd/consent
 */

import {
  addDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import type {
  ConsentRecord,
  ConsentInput,
  ConsentStatus,
} from '@/types/lgpd';
import { getConsentsRef, getConsentDoc } from './collection-refs';
import { consentConverter } from './converters';
import { logAuditEvent } from './audit';

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
  const ref = getConsentDoc(clinicId, consentId);

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
