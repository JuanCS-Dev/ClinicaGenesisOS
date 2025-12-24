/**
 * Companion Session Manager
 * =========================
 *
 * CRUD operations for conversation sessions in Firestore.
 * Handles session lifecycle: create, update, get, close, cleanup.
 *
 * @module companion/session-manager
 */

import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import type {
  ConversationSession,
  ConversationMessage,
  ConversationState,
  PatientCompanionContext,
  SymptomTriageResult,
  PhoneIndexEntry,
} from './types.js'

/**
 * Get Firestore reference for conversations collection.
 */
function getConversationsRef(clinicId: string) {
  return getFirestore().collection('clinics').doc(clinicId).collection('conversations')
}

/**
 * Get Firestore reference for messages subcollection.
 */
function getMessagesRef(clinicId: string, sessionId: string) {
  return getConversationsRef(clinicId).doc(sessionId).collection('messages')
}

/**
 * Get phone index reference.
 */
function getPhoneIndexRef(phone: string) {
  const normalized = normalizePhone(phone)
  return getFirestore().collection('phoneIndex').doc(normalized)
}

/**
 * Normalize phone number for consistent lookup.
 */
export function normalizePhone(phone: string): string {
  let normalized = phone.replace(/\D/g, '')
  // Add Brazil country code if missing
  if (normalized.length === 11 || normalized.length === 10) {
    normalized = '55' + normalized
  }
  return normalized
}

/**
 * Calculate session expiration timestamp.
 */
function getExpirationTimestamp(ttlHours: number = 24): string {
  const expiration = new Date()
  expiration.setHours(expiration.getHours() + ttlHours)
  return expiration.toISOString()
}

// ============================================================================
// SESSION OPERATIONS
// ============================================================================

/**
 * Get active session for a patient phone number.
 * Returns null if no active session exists.
 */
export async function getActiveSession(
  clinicId: string,
  patientPhone: string
): Promise<ConversationSession | null> {
  const normalized = normalizePhone(patientPhone)
  const now = new Date().toISOString()

  const snapshot = await getConversationsRef(clinicId)
    .where('patientPhone', '==', normalized)
    .where('expiresAt', '>', now)
    .where('state', 'not-in', ['closed', 'handoff'])
    .orderBy('expiresAt', 'desc')
    .limit(1)
    .get()

  if (snapshot.empty) {
    return null
  }

  const doc = snapshot.docs[0]
  return {
    id: doc.id,
    ...doc.data(),
  } as ConversationSession
}

/**
 * Get session by ID.
 */
export async function getSessionById(
  clinicId: string,
  sessionId: string
): Promise<ConversationSession | null> {
  const doc = await getConversationsRef(clinicId).doc(sessionId).get()

  if (!doc.exists) {
    return null
  }

  return {
    id: doc.id,
    ...doc.data(),
  } as ConversationSession
}

/**
 * Create a new conversation session.
 */
export async function createSession(
  clinicId: string,
  patientId: string,
  patientPhone: string,
  context: PatientCompanionContext
): Promise<ConversationSession> {
  const normalized = normalizePhone(patientPhone)
  const now = new Date().toISOString()

  const sessionData: Omit<ConversationSession, 'id'> = {
    clinicId,
    patientId,
    patientPhone: normalized,
    state: 'greeting',
    context,
    createdAt: now,
    expiresAt: getExpirationTimestamp(24),
    lastActivityAt: now,
    messageCount: 0,
  }

  // Create session document
  const docRef = await getConversationsRef(clinicId).add(sessionData)

  // Update phone index for O(1) lookup
  await getPhoneIndexRef(normalized).set(
    {
      clinicId,
      patientId,
      updatedAt: now,
    } as PhoneIndexEntry,
    { merge: true }
  )

  return {
    id: docRef.id,
    ...sessionData,
  }
}

/**
 * Update session state and optional triage result.
 */
export async function updateSessionState(
  clinicId: string,
  sessionId: string,
  newState: ConversationState,
  triageResult?: SymptomTriageResult
): Promise<void> {
  const updateData: Record<string, unknown> = {
    state: newState,
    lastActivityAt: new Date().toISOString(),
  }

  if (triageResult) {
    updateData.triageResult = triageResult
  }

  await getConversationsRef(clinicId).doc(sessionId).update(updateData)
}

/**
 * Add a message to the session.
 */
export async function addMessage(
  clinicId: string,
  sessionId: string,
  message: Omit<ConversationMessage, 'id'>
): Promise<ConversationMessage> {
  const messagesRef = getMessagesRef(clinicId, sessionId)
  const sessionRef = getConversationsRef(clinicId).doc(sessionId)

  // Add message to subcollection
  const messageDoc = await messagesRef.add(message)

  // Update session activity and message count
  await sessionRef.update({
    lastActivityAt: new Date().toISOString(),
    messageCount: FieldValue.increment(1),
  })

  return {
    id: messageDoc.id,
    ...message,
  }
}

/**
 * Get recent messages from session (for context window).
 */
export async function getRecentMessages(
  clinicId: string,
  sessionId: string,
  limit: number = 10
): Promise<ConversationMessage[]> {
  const snapshot = await getMessagesRef(clinicId, sessionId)
    .orderBy('timestamp', 'desc')
    .limit(limit)
    .get()

  const messages = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as ConversationMessage[]

  // Return in chronological order
  return messages.reverse()
}

/**
 * Close a session.
 */
export async function closeSession(clinicId: string, sessionId: string): Promise<void> {
  await getConversationsRef(clinicId).doc(sessionId).update({
    state: 'closed',
    lastActivityAt: new Date().toISOString(),
  })
}

// ============================================================================
// PHONE INDEX OPERATIONS
// ============================================================================

/**
 * Find patient by phone number using index.
 */
export async function findPatientByPhone(phone: string): Promise<PhoneIndexEntry | null> {
  const doc = await getPhoneIndexRef(phone).get()

  if (!doc.exists) {
    return null
  }

  return doc.data() as PhoneIndexEntry
}

/**
 * Update or create phone index entry.
 */
export async function updatePhoneIndex(
  phone: string,
  clinicId: string,
  patientId: string
): Promise<void> {
  await getPhoneIndexRef(phone).set({
    clinicId,
    patientId,
    updatedAt: new Date().toISOString(),
  } as PhoneIndexEntry)
}

// ============================================================================
// CLEANUP OPERATIONS
// ============================================================================

/**
 * Get expired sessions for cleanup.
 * Used by scheduled cleanup function.
 */
export async function getExpiredSessions(
  clinicId: string,
  batchSize: number = 100
): Promise<ConversationSession[]> {
  const now = new Date().toISOString()

  const snapshot = await getConversationsRef(clinicId)
    .where('expiresAt', '<', now)
    .limit(batchSize)
    .get()

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as ConversationSession[]
}

/**
 * Delete session and its messages.
 */
export async function deleteSession(clinicId: string, sessionId: string): Promise<void> {
  const db = getFirestore()
  const sessionRef = getConversationsRef(clinicId).doc(sessionId)
  const messagesRef = getMessagesRef(clinicId, sessionId)

  // Delete messages in batches
  const messages = await messagesRef.limit(500).get()
  const batch = db.batch()

  messages.docs.forEach(doc => {
    batch.delete(doc.ref)
  })

  // Delete session document
  batch.delete(sessionRef)

  await batch.commit()
}
