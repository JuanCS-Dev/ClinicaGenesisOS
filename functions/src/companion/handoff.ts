/**
 * Human Handoff Service
 * =====================
 *
 * Manages escalation to human staff when AI cannot handle the request.
 * Creates handoff records and triggers notifications.
 *
 * @module companion/handoff
 */

import { getFirestore } from 'firebase-admin/firestore'
import { logger } from 'firebase-functions'
import type { HandoffRecord, HandoffReason, HandoffPriority, ConversationSession } from './types.js'

/**
 * Get handoffs collection reference.
 */
function getHandoffsRef(clinicId: string) {
  return getFirestore().collection('clinics').doc(clinicId).collection('handoffs')
}

/**
 * Create a human handoff record.
 */
export async function createHandoff(
  session: ConversationSession,
  reason: HandoffReason,
  reasonDetails: string,
  priority: HandoffPriority
): Promise<HandoffRecord> {
  const now = new Date().toISOString()

  const handoffData: Omit<HandoffRecord, 'id'> = {
    clinicId: session.clinicId,
    patientId: session.patientId,
    sessionId: session.id,
    patientPhone: session.patientPhone,
    reason,
    reasonDetails,
    priority,
    status: 'pending',
    createdAt: now,
  }

  const docRef = await getHandoffsRef(session.clinicId).add(handoffData)

  logger.info('Handoff created', {
    handoffId: docRef.id,
    reason,
    priority,
    patientId: session.patientId,
    clinicId: session.clinicId,
  })

  // Notify staff based on priority
  await notifyStaff(session.clinicId, docRef.id, priority, reason)

  return {
    id: docRef.id,
    ...handoffData,
  }
}

/**
 * Notify clinic staff about handoff.
 */
async function notifyStaff(
  clinicId: string,
  handoffId: string,
  priority: HandoffPriority,
  reason: HandoffReason
): Promise<void> {
  const db = getFirestore()

  // Create notification in clinic's notifications collection
  const notificationData = {
    type: 'companion_handoff',
    handoffId,
    priority,
    reason,
    message: getNotificationMessage(reason, priority),
    read: false,
    createdAt: new Date().toISOString(),
  }

  await db.collection('clinics').doc(clinicId).collection('notifications').add(notificationData)

  logger.info('Staff notification created', {
    clinicId,
    handoffId,
    priority,
  })

  // For high priority (emergencies), also log prominently
  if (priority === 'high') {
    logger.warn('HIGH PRIORITY HANDOFF', {
      clinicId,
      handoffId,
      reason,
      message: 'Possible emergency - immediate attention required',
    })
  }
}

/**
 * Get notification message based on reason.
 */
function getNotificationMessage(reason: HandoffReason, priority: HandoffPriority): string {
  const priorityEmoji = priority === 'high' ? '🚨' : priority === 'medium' ? '⚠️' : 'ℹ️'

  switch (reason) {
    case 'emergency':
      return `${priorityEmoji} EMERGÊNCIA: Paciente relatou sintomas de emergência no WhatsApp. Verificar imediatamente.`

    case 'patient_request':
      return `${priorityEmoji} Paciente solicitou atendimento humano via WhatsApp.`

    case 'frustration':
      return `${priorityEmoji} Paciente demonstrou frustração com assistente virtual. Atendimento humano necessário.`

    case 'low_confidence':
      return `${priorityEmoji} Assistente virtual não conseguiu responder adequadamente. Revisão necessária.`

    case 'loop_detected':
      return `${priorityEmoji} Conversa com paciente em loop. Intervenção humana recomendada.`

    case 'out_of_scope':
      return `${priorityEmoji} Paciente fez pergunta fora do escopo do assistente. Atendimento necessário.`

    default:
      return `${priorityEmoji} Handoff do assistente virtual para atendimento humano.`
  }
}

/**
 * Get pending handoffs for a clinic.
 */
export async function getPendingHandoffs(
  clinicId: string,
  limit: number = 50
): Promise<HandoffRecord[]> {
  const snapshot = await getHandoffsRef(clinicId)
    .where('status', '==', 'pending')
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get()

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as HandoffRecord[]
}

/**
 * Assign handoff to a staff member.
 */
export async function assignHandoff(
  clinicId: string,
  handoffId: string,
  staffId: string
): Promise<void> {
  await getHandoffsRef(clinicId).doc(handoffId).update({
    status: 'assigned',
    assignedTo: staffId,
  })

  logger.info('Handoff assigned', {
    handoffId,
    staffId,
    clinicId,
  })
}

/**
 * Resolve a handoff.
 */
export async function resolveHandoff(
  clinicId: string,
  handoffId: string,
  resolutionNotes: string
): Promise<void> {
  await getHandoffsRef(clinicId).doc(handoffId).update({
    status: 'resolved',
    resolvedAt: new Date().toISOString(),
    resolutionNotes,
  })

  logger.info('Handoff resolved', {
    handoffId,
    clinicId,
  })
}

/**
 * Get handoff by ID.
 */
export async function getHandoffById(
  clinicId: string,
  handoffId: string
): Promise<HandoffRecord | null> {
  const doc = await getHandoffsRef(clinicId).doc(handoffId).get()

  if (!doc.exists) {
    return null
  }

  return {
    id: doc.id,
    ...doc.data(),
  } as HandoffRecord
}
