/**
 * NPS Survey Workflow
 *
 * Sends NPS surveys after appointments and processes responses.
 * Calculates clinic NPS score and alerts on detractors.
 *
 * @module functions/workflows/nps
 */

import { onSchedule } from 'firebase-functions/v2/scheduler'
import { onRequest } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { logger } from 'firebase-functions'
import { sendTextMessage } from '../whatsapp/client.js'
import { validateWebhookRequest } from '../middleware/webhook-auth.js'
import type { ClinicWorkflowSettings, NPSResponse, WorkflowExecutionLog } from './types.js'
import { DEFAULT_WORKFLOW_SETTINGS, getNPSCategory } from './types.js'

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Get workflow settings for a clinic.
 */
async function getWorkflowSettings(clinicId: string): Promise<ClinicWorkflowSettings> {
  const db = getFirestore()
  const settingsDoc = await db
    .collection('clinics')
    .doc(clinicId)
    .collection('settings')
    .doc('workflows')
    .get()

  if (!settingsDoc.exists) {
    return DEFAULT_WORKFLOW_SETTINGS
  }

  return { ...DEFAULT_WORKFLOW_SETTINGS, ...settingsDoc.data() } as ClinicWorkflowSettings
}

/**
 * Log workflow execution.
 */
async function logWorkflowExecution(log: WorkflowExecutionLog): Promise<void> {
  const db = getFirestore()
  await db.collection('clinics').doc(log.clinicId).collection('workflowLogs').add(log)
}

/**
 * Check if NPS was already sent for this appointment.
 */
async function wasNPSSent(clinicId: string, appointmentId: string): Promise<boolean> {
  const db = getFirestore()
  const logsSnapshot = await db
    .collection('clinics')
    .doc(clinicId)
    .collection('workflowLogs')
    .where('workflowType', '==', 'nps')
    .where('targetId', '==', appointmentId)
    .where('status', 'in', ['sent', 'delivered'])
    .limit(1)
    .get()

  return !logsSnapshot.empty
}

/**
 * Generate unique survey link.
 */
function generateSurveyLink(clinicId: string, appointmentId: string): string {
  const token = Buffer.from(`${clinicId}:${appointmentId}:${Date.now()}`).toString('base64url')
  // In production, this would be your actual domain
  return `https://app.clinicagenesis.com.br/nps/${token}`
}

// =============================================================================
// NPS MESSAGE
// =============================================================================

const NPS_MESSAGE = (patientName: string, clinicName: string, surveyLink: string) =>
  `Ola ${patientName}! Como foi sua experiencia na ${clinicName}? ` +
  `Sua opiniao e muito importante para nos.\n\n` +
  `Responda de 0 a 10: Qual a probabilidade de recomendar nossa clinica?\n\n` +
  `Ou acesse: ${surveyLink}`

// =============================================================================
// MAIN SCHEDULER
// =============================================================================

/**
 * Send NPS surveys for completed appointments.
 * Runs every hour to check for appointments completed 2-3 hours ago.
 */
export const sendNPSSurveys = onSchedule(
  {
    schedule: 'every 1 hours',
    region: 'southamerica-east1',
    timeZone: 'America/Sao_Paulo',
  },
  async () => {
    const db = getFirestore()
    const now = new Date()

    // Window: appointments completed 2-3 hours ago
    const windowStart = new Date(now.getTime() - 3 * 60 * 60 * 1000)
    const windowEnd = new Date(now.getTime() - 2 * 60 * 60 * 1000)

    logger.info('Starting NPS survey check', {
      windowStart: windowStart.toISOString(),
      windowEnd: windowEnd.toISOString(),
    })

    const clinicsSnapshot = await db.collection('clinics').get()

    let totalSent = 0
    let totalSkipped = 0
    let totalErrors = 0

    for (const clinicDoc of clinicsSnapshot.docs) {
      const clinicId = clinicDoc.id
      const clinic = clinicDoc.data()

      // Check if NPS is enabled
      const settings = await getWorkflowSettings(clinicId)
      if (!settings.nps.enabled) {
        continue
      }

      // Find completed appointments in the window
      const appointmentsSnapshot = await db
        .collection('clinics')
        .doc(clinicId)
        .collection('appointments')
        .where('status', '==', 'Finalizado')
        .where('completedAt', '>=', windowStart.toISOString())
        .where('completedAt', '<=', windowEnd.toISOString())
        .get()

      for (const appointmentDoc of appointmentsSnapshot.docs) {
        const appointment = appointmentDoc.data()
        const appointmentId = appointmentDoc.id

        // Skip if no phone
        if (!appointment.patientPhone) {
          totalSkipped++
          continue
        }

        // Skip if already sent
        const alreadySent = await wasNPSSent(clinicId, appointmentId)
        if (alreadySent) {
          totalSkipped++
          continue
        }

        try {
          const surveyLink = generateSurveyLink(clinicId, appointmentId)
          const message = NPS_MESSAGE(
            appointment.patientName || 'Paciente',
            clinic.name || 'Clinica',
            surveyLink
          )

          // Send WhatsApp
          const messageId = await sendTextMessage(appointment.patientPhone, message, clinicId)

          // Log success
          await logWorkflowExecution({
            clinicId,
            workflowType: 'nps',
            targetId: appointmentId,
            status: 'sent',
            channel: 'whatsapp',
            messageId,
            createdAt: now.toISOString(),
          })

          // Update appointment
          await appointmentDoc.ref.update({
            'nps.surveySent': true,
            'nps.sentAt': now.toISOString(),
            'nps.surveyLink': surveyLink,
          })

          totalSent++
          logger.info('NPS survey sent', { clinicId, appointmentId, messageId })
        } catch (error) {
          totalErrors++
          logger.error('Failed to send NPS survey', {
            clinicId,
            appointmentId,
            error: error instanceof Error ? error.message : 'Unknown error',
          })

          await logWorkflowExecution({
            clinicId,
            workflowType: 'nps',
            targetId: appointmentId,
            status: 'failed',
            channel: 'whatsapp',
            error: error instanceof Error ? error.message : 'Unknown error',
            createdAt: now.toISOString(),
          })
        }
      }
    }

    logger.info('NPS survey batch complete', {
      sent: totalSent,
      skipped: totalSkipped,
      errors: totalErrors,
    })
  }
)

// =============================================================================
// NPS RESPONSE WEBHOOK
// =============================================================================

interface NPSWebhookPayload {
  token: string
  score: number
  feedback?: string
}

/**
 * Webhook to receive NPS responses from survey page or WhatsApp.
 *
 * Headers:
 * - X-Signature: HMAC signature for verification (optional but recommended)
 */
export const npsResponseWebhook = onRequest(
  { cors: true, region: 'southamerica-east1' },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method not allowed')
      return
    }

    try {
      const payload = req.body as NPSWebhookPayload
      const signature = req.headers['x-signature'] as string | undefined

      // Decode token to get clinicId first
      const decoded = Buffer.from(payload.token, 'base64url').toString()
      const [clinicId, appointmentId] = decoded.split(':')

      if (!clinicId || !appointmentId) {
        res.status(400).send('Invalid token')
        return
      }

      // Get workflow settings for signature validation
      const settings = await getWorkflowSettings(clinicId)

      // Validate webhook signature if configured
      // NPS webhooks are less sensitive (patient-initiated responses),
      // so we don't require signature but validate if secret is configured
      const validationResult = validateWebhookRequest(
        JSON.stringify(req.body),
        signature,
        settings.nps.webhookSecret,
        false // Not mandatory - patient responses may come from forms
      )

      if (!validationResult.isValid) {
        logger.warn('NPS webhook validation failed', { clinicId, error: validationResult.error })
        res.status(401).send(validationResult.error || 'Unauthorized')
        return
      }

      // Validate score
      const score = Math.min(10, Math.max(0, Math.round(payload.score)))
      const category = getNPSCategory(score)

      const db = getFirestore()
      const now = new Date().toISOString()

      // Get appointment data
      const appointmentDoc = await db
        .collection('clinics')
        .doc(clinicId)
        .collection('appointments')
        .doc(appointmentId)
        .get()

      if (!appointmentDoc.exists) {
        res.status(404).send('Appointment not found')
        return
      }

      const appointment = appointmentDoc.data()!

      // Create NPS response
      const npsResponse: NPSResponse = {
        clinicId,
        appointmentId,
        patientId: appointment.patientId || '',
        patientName: appointment.patientName || '',
        professionalId: appointment.professionalId || '',
        professionalName: appointment.professional || '',
        score,
        feedback: payload.feedback,
        category,
        createdAt: now,
      }

      // Save response
      const npsRef = await db
        .collection('clinics')
        .doc(clinicId)
        .collection('npsResponses')
        .add(npsResponse)

      // Update appointment
      await appointmentDoc.ref.update({
        'nps.response': {
          id: npsRef.id,
          score,
          category,
          respondedAt: now,
        },
      })

      // Update clinic NPS metrics
      await updateNPSMetrics(clinicId, score, category)

      // If detractor, create alert notification
      if (category === 'detractor') {
        await createDetractorAlert(clinicId, npsResponse)
      }

      logger.info('NPS response received', {
        clinicId,
        appointmentId,
        score,
        category,
      })

      res.status(200).json({ success: true, category })
    } catch (error) {
      logger.error('NPS webhook error', error)
      res.status(500).send('Error processing response')
    }
  }
)

// =============================================================================
// NPS METRICS
// =============================================================================

/**
 * Update clinic NPS metrics.
 */
async function updateNPSMetrics(
  clinicId: string,
  score: number,
  category: NPSResponse['category']
): Promise<void> {
  const db = getFirestore()
  const metricsRef = db.collection('clinics').doc(clinicId).collection('metrics').doc('nps')

  const categoryField = `total${category.charAt(0).toUpperCase() + category.slice(1)}s`

  await metricsRef.set(
    {
      totalResponses: FieldValue.increment(1),
      totalScore: FieldValue.increment(score),
      [categoryField]: FieldValue.increment(1),
      lastResponseAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  )
}

/**
 * Create alert for detractor response.
 */
async function createDetractorAlert(clinicId: string, nps: NPSResponse): Promise<void> {
  const db = getFirestore()
  await db
    .collection('clinics')
    .doc(clinicId)
    .collection('notifications')
    .add({
      type: 'nps_detractor',
      title: 'Paciente insatisfeito',
      message: `${nps.patientName} deu nota ${nps.score} na pesquisa NPS. ${nps.feedback ? `Feedback: "${nps.feedback}"` : ''}`,
      appointmentId: nps.appointmentId,
      patientId: nps.patientId,
      score: nps.score,
      feedback: nps.feedback,
      priority: 'high',
      read: false,
      createdAt: new Date().toISOString(),
    })
}

// =============================================================================
// NPS SCORE CALCULATION
// =============================================================================

/**
 * Calculate current NPS score for a clinic.
 * NPS = (% Promoters - % Detractors) * 100
 */
export async function calculateNPSScore(
  clinicId: string,
  periodDays: number = 30
): Promise<{
  score: number
  totalResponses: number
  promoters: number
  passives: number
  detractors: number
}> {
  const db = getFirestore()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - periodDays)

  const responsesSnapshot = await db
    .collection('clinics')
    .doc(clinicId)
    .collection('npsResponses')
    .where('createdAt', '>=', startDate.toISOString())
    .get()

  let promoters = 0
  let passives = 0
  let detractors = 0

  responsesSnapshot.docs.forEach(doc => {
    const response = doc.data() as NPSResponse
    switch (response.category) {
      case 'promoter':
        promoters++
        break
      case 'passive':
        passives++
        break
      case 'detractor':
        detractors++
        break
    }
  })

  const totalResponses = promoters + passives + detractors
  const score =
    totalResponses > 0 ? Math.round(((promoters - detractors) / totalResponses) * 100) : 0

  return { score, totalResponses, promoters, passives, detractors }
}
