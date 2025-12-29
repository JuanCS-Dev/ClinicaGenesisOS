/**
 * WhatsApp Webhook Handler
 *
 * Receives incoming messages and status updates from WhatsApp Cloud API.
 * Updates appointment status based on patient responses.
 *
 * @module functions/whatsapp/webhook
 */

import { onRequest } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { logger } from 'firebase-functions'
import { markAsRead } from './client.js'
import { handleCompanionMessage, findPatientByPhone } from '../companion/index.js'
import { WHATSAPP_VERIFY_TOKEN, WHATSAPP_SECRETS, getSecretOrUndefined } from '../config/secrets.js'

/**
 * Get verify token from Secret Manager with fallback.
 * The fallback is used only in development/testing.
 */
function getVerifyToken(): string {
  const token = getSecretOrUndefined(WHATSAPP_VERIFY_TOKEN)
  if (!token) {
    logger.warn('WHATSAPP_VERIFY_TOKEN not configured. Using default for development.')
    return 'genesis_verify_token'
  }
  return token
}

/** WhatsApp webhook payload structure. */
interface WhatsAppWebhookPayload {
  object: 'whatsapp_business_account'
  entry: Array<{
    id: string
    changes: Array<{
      value: {
        messaging_product: 'whatsapp'
        metadata: {
          display_phone_number: string
          phone_number_id: string
        }
        contacts?: Array<{
          profile: { name: string }
          wa_id: string
        }>
        messages?: Array<{
          from: string
          id: string
          timestamp: string
          type: 'text' | 'button' | 'interactive'
          text?: { body: string }
          button?: { text: string; payload: string }
          interactive?: {
            type: 'button_reply'
            button_reply: { id: string; title: string }
          }
        }>
        statuses?: Array<{
          id: string
          status: 'sent' | 'delivered' | 'read' | 'failed'
          timestamp: string
          recipient_id: string
          errors?: Array<{ code: number; title: string }>
        }>
      }
      field: string
    }>
  }>
}

/**
 * WhatsApp Webhook - Verification & Message Handler
 *
 * GET: Webhook verification (required by Meta)
 * POST: Incoming messages and status updates
 *
 * SECURITY: Uses Firebase Secret Manager for verify token.
 */
export const whatsappWebhook = onRequest(
  {
    cors: true,
    region: 'southamerica-east1',
    secrets: [...WHATSAPP_SECRETS],
  },
  async (req, res) => {
    // GET: Webhook verification
    if (req.method === 'GET') {
      const mode = req.query['hub.mode']
      const token = req.query['hub.verify_token']
      const challenge = req.query['hub.challenge']

      const expectedToken = getVerifyToken()

      if (mode === 'subscribe' && token === expectedToken) {
        logger.info('Webhook verified successfully')
        res.status(200).send(challenge)
        return
      }

      logger.warn('Webhook verification failed', { mode, tokenProvided: !!token })
      res.status(403).send('Verification failed')
      return
    }

    // POST: Incoming webhook
    if (req.method === 'POST') {
      try {
        const payload = req.body as WhatsAppWebhookPayload

        // Process each entry
        for (const entry of payload.entry) {
          for (const change of entry.changes) {
            const value = change.value

            // Process incoming messages
            if (value.messages) {
              for (const message of value.messages) {
                await processIncomingMessage(message, value.metadata.phone_number_id)
              }
            }

            // Process status updates
            if (value.statuses) {
              for (const status of value.statuses) {
                await processStatusUpdate(status)
              }
            }
          }
        }

        res.status(200).send('OK')
      } catch (error) {
        logger.error('Webhook processing error', error)
        res.status(500).send('Error processing webhook')
      }
      return
    }

    res.status(405).send('Method not allowed')
  }
)

/**
 * Process incoming message from patient.
 */
async function processIncomingMessage(
  message: NonNullable<WhatsAppWebhookPayload['entry'][0]['changes'][0]['value']['messages']>[0],
  _phoneNumberId: string
): Promise<void> {
  const db = getFirestore()
  const patientPhone = message.from
  const messageId = message.id

  logger.info('Processing incoming message', {
    from: patientPhone,
    type: message.type,
  })

  // Extract response text
  let responseText = ''
  let isConfirmation = false
  let isReschedule = false

  if (message.type === 'text' && message.text) {
    responseText = message.text.body.toLowerCase().trim()
    isConfirmation = ['sim', 'ok', 'confirmo', 'confirmado', 'yes', '1'].includes(responseText)
    isReschedule = ['não', 'nao', 'remarcar', 'cancelar', 'no', '2'].includes(responseText)
  } else if (message.type === 'button' && message.button) {
    responseText = message.button.payload || message.button.text
    isConfirmation = responseText.toLowerCase().includes('confirm')
    isReschedule = responseText.toLowerCase().includes('remarcar')
  } else if (message.type === 'interactive' && message.interactive?.button_reply) {
    responseText = message.interactive.button_reply.id
    isConfirmation = responseText.toLowerCase().includes('confirm')
    isReschedule = responseText.toLowerCase().includes('remarcar')
  }

  // Find pending appointment for this patient
  const appointmentsSnapshot = await db
    .collectionGroup('appointments')
    .where('patientPhone', '==', normalizePhone(patientPhone))
    .where('status', '==', 'Pendente')
    .orderBy('date', 'asc')
    .limit(1)
    .get()

  if (appointmentsSnapshot.empty) {
    logger.info('No pending appointment found, routing to companion', { patientPhone })

    // Try to find patient by phone and route to companion
    const patientEntry = await findPatientByPhone(patientPhone)

    if (patientEntry) {
      try {
        await handleCompanionMessage(
          patientEntry.clinicId,
          patientEntry.patientId,
          patientPhone,
          responseText || 'Olá',
          messageId
        )
      } catch (error) {
        logger.error('Companion handler error', {
          patientPhone,
          error: error instanceof Error ? error.message : 'Unknown',
        })
      }
    } else {
      logger.info('Patient not found in phone index', { patientPhone })
    }

    // Mark as read anyway
    await markAsRead(messageId)
    return
  }

  const appointmentDoc = appointmentsSnapshot.docs[0]
  const appointmentRef = appointmentDoc.ref

  // Update appointment based on response
  if (isConfirmation) {
    await appointmentRef.update({
      status: 'Confirmado',
      'reminder.patientResponse': {
        confirmed: true,
        respondedAt: new Date().toISOString(),
        message: responseText,
      },
      'reminder.lastInteraction': FieldValue.serverTimestamp(),
    })
    logger.info('Appointment confirmed', { appointmentId: appointmentDoc.id })
  } else if (isReschedule) {
    await appointmentRef.update({
      'reminder.patientResponse': {
        confirmed: false,
        respondedAt: new Date().toISOString(),
        message: responseText,
        needsReschedule: true,
      },
      'reminder.lastInteraction': FieldValue.serverTimestamp(),
    })
    logger.info('Patient requested reschedule', { appointmentId: appointmentDoc.id })
  } else {
    // Any response opens the 24h window
    await appointmentRef.update({
      'reminder.lastInteraction': FieldValue.serverTimestamp(),
      'reminder.patientResponse': {
        respondedAt: new Date().toISOString(),
        message: responseText,
      },
    })
  }

  // Mark message as read
  await markAsRead(messageId)
}

/**
 * Process status update for sent message.
 */
async function processStatusUpdate(
  status: NonNullable<WhatsAppWebhookPayload['entry'][0]['changes'][0]['value']['statuses']>[0]
): Promise<void> {
  const db = getFirestore()
  const messageId = status.id
  const newStatus = status.status

  logger.info('Processing status update', { messageId, status: newStatus })

  // Find reminder with this message ID and update status
  const remindersSnapshot = await db
    .collectionGroup('appointments')
    .where('reminder.messageId', '==', messageId)
    .limit(1)
    .get()

  if (remindersSnapshot.empty) {
    // Try 24h reminder
    const reminder24hSnapshot = await db
      .collectionGroup('appointments')
      .where('reminder.reminder24h.messageId', '==', messageId)
      .limit(1)
      .get()

    if (!reminder24hSnapshot.empty) {
      await reminder24hSnapshot.docs[0].ref.update({
        'reminder.reminder24h.status': newStatus,
      })
    }

    // Try 2h reminder
    const reminder2hSnapshot = await db
      .collectionGroup('appointments')
      .where('reminder.reminder2h.messageId', '==', messageId)
      .limit(1)
      .get()

    if (!reminder2hSnapshot.empty) {
      await reminder2hSnapshot.docs[0].ref.update({
        'reminder.reminder2h.status': newStatus,
      })
    }

    return
  }

  // Update main reminder status
  await remindersSnapshot.docs[0].ref.update({
    'reminder.status': newStatus,
  })
}

/**
 * Normalize phone number for comparison.
 */
function normalizePhone(phone: string): string {
  let normalized = phone.replace(/\D/g, '')
  if (normalized.length === 11 || normalized.length === 10) {
    normalized = '55' + normalized
  }
  return normalized
}
