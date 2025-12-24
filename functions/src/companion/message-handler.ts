/**
 * Companion Message Handler
 * =========================
 *
 * Main orchestration layer for the health companion.
 * Processes incoming WhatsApp messages and generates responses.
 *
 * @module companion/message-handler
 */

import { logger } from 'firebase-functions'
import { sendTextMessage } from '../whatsapp/client.js'
import {
  getActiveSession,
  createSession,
  addMessage,
  getRecentMessages,
  updateSessionState,
  closeSession,
} from './session-manager.js'
import { buildPatientContext } from './context-builder.js'
import { generateCompanionResponse } from './ai-service.js'
import {
  checkGuardrails,
  sanitizeResponse,
  buildEmergencyResponse,
  buildHandoffResponse,
  detectLoop,
} from './guardrails.js'
import { createHandoff } from './handoff.js'
import type { ConversationSession, ConversationMessage, CompanionAIInput } from './types.js'
import { MAX_CONTEXT_MESSAGES, MAX_LOOPS_BEFORE_HANDOFF } from './types.js'

/**
 * Handle incoming message from WhatsApp.
 * Main entry point for companion flow.
 */
export async function handleCompanionMessage(
  clinicId: string,
  patientId: string,
  patientPhone: string,
  messageText: string,
  whatsappMessageId: string
): Promise<void> {
  const startTime = Date.now()

  logger.info('Companion message received', {
    clinicId,
    patientId,
    messageLength: messageText.length,
  })

  try {
    // Step 1: Pre-AI guardrails check
    const guardrailsResult = checkGuardrails(messageText)

    if (guardrailsResult.skipToHandoff) {
      await handleGuardrailsTriggered(
        clinicId,
        patientId,
        patientPhone,
        messageText,
        whatsappMessageId,
        guardrailsResult
      )
      return
    }

    // Step 2: Get or create session
    let session = await getActiveSession(clinicId, patientPhone)

    if (!session) {
      const context = await buildPatientContext(clinicId, patientId)
      session = await createSession(clinicId, patientId, patientPhone, context)

      // Send greeting for new session
      const greetingResponse = await sendGreeting(session)
      await addMessage(clinicId, session.id, {
        role: 'assistant',
        content: greetingResponse,
        timestamp: new Date().toISOString(),
      })
    }

    // Step 3: Store patient message
    await addMessage(clinicId, session.id, {
      role: 'patient',
      content: messageText,
      timestamp: new Date().toISOString(),
      whatsappMessageId,
    })

    // Step 4: Get recent messages for context
    const recentMessages = await getRecentMessages(clinicId, session.id, MAX_CONTEXT_MESSAGES)

    // Step 5: Check for conversation loop
    if (detectLoop(recentMessages, MAX_LOOPS_BEFORE_HANDOFF)) {
      await handleLoopDetected(session, patientPhone, recentMessages)
      return
    }

    // Step 6: Generate AI response
    const aiInput: CompanionAIInput = {
      message: messageText,
      state: session.state,
      context: session.context,
      conversationHistory: recentMessages,
      triageResult: session.triageResult,
    }

    const aiOutput = await generateCompanionResponse(aiInput)

    // Step 7: Check if AI wants handoff
    if (aiOutput.shouldHandoff && aiOutput.handoffDetails) {
      await handleAIHandoff(session, patientPhone, aiOutput)
      return
    }

    // Step 8: Sanitize response
    const sanitized = sanitizeResponse(aiOutput.response)

    if (sanitized.wasModified) {
      logger.warn('Response sanitized', {
        sessionId: session.id,
        removedPatterns: sanitized.removedPatterns,
      })
    }

    // Step 9: Send response
    await sendTextMessage(patientPhone, sanitized.text)

    // Step 10: Store assistant message
    await addMessage(clinicId, session.id, {
      role: 'assistant',
      content: sanitized.text,
      timestamp: new Date().toISOString(),
    })

    // Step 11: Update session state
    if (aiOutput.newState !== session.state) {
      await updateSessionState(clinicId, session.id, aiOutput.newState, aiOutput.triageResult)
    }

    // Step 12: Close session if conversation ended
    if (aiOutput.newState === 'closed') {
      await closeSession(clinicId, session.id)
    }

    logger.info('Companion message processed', {
      sessionId: session.id,
      processingTimeMs: Date.now() - startTime,
      newState: aiOutput.newState,
      confidence: aiOutput.confidence,
    })
  } catch (error) {
    logger.error('Companion message handler error', {
      clinicId,
      patientId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    // Send fallback message
    await sendTextMessage(
      patientPhone,
      'Desculpe, tive um problema técnico. Um atendente humano entrará em contato em breve.\n\n_Para emergências, ligue 192 (SAMU)_'
    )

    throw error
  }
}

/**
 * Send greeting message for new session.
 */
async function sendGreeting(session: ConversationSession): Promise<string> {
  const greeting = `Olá, ${session.context.name}! 👋

Sou a Geni, assistente virtual da Clínica Genesis.

Como posso ajudá-lo(a) hoje?

• Dúvidas sobre agendamentos
• Orientações gerais de saúde
• Preparação para exames

_Assistente de IA. Não substitui consulta médica. Emergências: 192_`

  await sendTextMessage(session.patientPhone, greeting)

  return greeting
}

/**
 * Handle when guardrails are triggered (emergency, human request, etc).
 */
async function handleGuardrailsTriggered(
  clinicId: string,
  patientId: string,
  patientPhone: string,
  messageText: string,
  whatsappMessageId: string,
  guardrailsResult: ReturnType<typeof checkGuardrails>
): Promise<void> {
  // Get or create session
  let session = await getActiveSession(clinicId, patientPhone)

  if (!session) {
    const context = await buildPatientContext(clinicId, patientId)
    session = await createSession(clinicId, patientId, patientPhone, context)
  }

  // Store patient message
  await addMessage(clinicId, session.id, {
    role: 'patient',
    content: messageText,
    timestamp: new Date().toISOString(),
    whatsappMessageId,
  })

  // Build appropriate response
  let response: string

  if (guardrailsResult.isEmergency) {
    response = buildEmergencyResponse(guardrailsResult.emergencyKeywords)
  } else {
    response = buildHandoffResponse(guardrailsResult.handoffReason!)
  }

  // Send response
  await sendTextMessage(patientPhone, response)

  // Store response
  await addMessage(clinicId, session.id, {
    role: 'assistant',
    content: response,
    timestamp: new Date().toISOString(),
  })

  // Create handoff
  const priority = guardrailsResult.isEmergency ? 'high' : 'medium'
  const reasonDetails = guardrailsResult.isEmergency
    ? `Palavras de emergência: ${guardrailsResult.emergencyKeywords.join(', ')}`
    : `Mensagem: ${messageText.slice(0, 100)}`

  await createHandoff(session, guardrailsResult.handoffReason!, reasonDetails, priority)

  // Update session state
  await updateSessionState(clinicId, session.id, 'handoff')

  logger.info('Guardrails triggered handoff', {
    sessionId: session.id,
    reason: guardrailsResult.handoffReason,
    isEmergency: guardrailsResult.isEmergency,
  })
}

/**
 * Handle when AI requests handoff.
 */
async function handleAIHandoff(
  session: ConversationSession,
  patientPhone: string,
  aiOutput: Awaited<ReturnType<typeof generateCompanionResponse>>
): Promise<void> {
  const handoffDetails = aiOutput.handoffDetails!

  // Send handoff response
  const response = buildHandoffResponse(handoffDetails.reason)
  await sendTextMessage(patientPhone, response)

  // Store response
  await addMessage(session.clinicId, session.id, {
    role: 'assistant',
    content: response,
    timestamp: new Date().toISOString(),
  })

  // Create handoff record
  await createHandoff(
    session,
    handoffDetails.reason,
    handoffDetails.reasonDetails,
    handoffDetails.priority
  )

  // Update session state
  await updateSessionState(session.clinicId, session.id, 'handoff')

  logger.info('AI requested handoff', {
    sessionId: session.id,
    reason: handoffDetails.reason,
    confidence: aiOutput.confidence,
  })
}

/**
 * Handle loop detection.
 */
async function handleLoopDetected(
  session: ConversationSession,
  patientPhone: string,
  recentMessages: ConversationMessage[]
): Promise<void> {
  const response = buildHandoffResponse('loop_detected')
  await sendTextMessage(patientPhone, response)

  await addMessage(session.clinicId, session.id, {
    role: 'assistant',
    content: response,
    timestamp: new Date().toISOString(),
  })

  await createHandoff(
    session,
    'loop_detected',
    'Paciente repetiu a mesma pergunta várias vezes',
    'low'
  )

  await updateSessionState(session.clinicId, session.id, 'handoff')

  logger.info('Loop detected, created handoff', {
    sessionId: session.id,
  })
}
