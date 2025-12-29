/**
 * Google Meet Integration via Calendar API
 * =========================================
 *
 * Creates Google Calendar events with automatic Meet links.
 * Based on official Google documentation:
 * https://developers.google.com/workspace/calendar/api/guides/create-events
 *
 * Quota (FREE):
 * - 1,000,000 queries/day
 * - spaces.create: 100/min project, 10/min user
 *
 * SECURITY: Service account credentials stored in Firebase Secret Manager
 *
 * @module functions/calendar/google-meet
 */

import * as functions from 'firebase-functions'
import { google, calendar_v3 } from 'googleapis'
import {
  GOOGLE_SERVICE_ACCOUNT_JSON,
  GOOGLE_CALENDAR_SECRETS,
  validateSecret,
} from '../config/secrets.js'

// OAuth scope for Calendar API (events only)
const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events'

/**
 * Input for creating a Meet session via Calendar API.
 */
export interface CreateMeetSessionInput {
  /** Appointment ID for correlation/idempotency */
  appointmentId: string
  /** Patient display name */
  patientName: string
  /** Patient email for calendar invite */
  patientEmail: string
  /** Professional display name */
  professionalName: string
  /** Professional email for calendar invite */
  professionalEmail: string
  /** Scheduled start time (ISO 8601) */
  scheduledAt: string
  /** Duration in minutes (default: 30) */
  durationMinutes?: number
  /** Clinic name for event description */
  clinicName: string
}

/**
 * Output from Meet session creation.
 */
export interface CreateMeetSessionOutput {
  /** Google Meet link (e.g., https://meet.google.com/xxx-yyyy-zzz) */
  meetLink: string
  /** Google Calendar event ID */
  calendarEventId: string
  /** Meeting code extracted from link */
  meetingCode: string
}

/**
 * Creates Google Auth client from service account credentials.
 *
 * SECURITY: Credentials loaded from Firebase Secret Manager.
 *
 * @throws {HttpsError} If credentials are not configured or invalid
 */
function getAuthClient(): ReturnType<typeof google.auth.GoogleAuth.prototype.getClient> {
  let credentials: string

  try {
    credentials = validateSecret(GOOGLE_SERVICE_ACCOUNT_JSON, 'GOOGLE_SERVICE_ACCOUNT_JSON')
  } catch {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'GOOGLE_SERVICE_ACCOUNT_JSON secret not configured. ' +
        'Run: firebase functions:secrets:set GOOGLE_SERVICE_ACCOUNT_JSON'
    )
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(credentials),
      scopes: [CALENDAR_SCOPE],
    })

    return auth.getClient()
  } catch (error) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Invalid GOOGLE_SERVICE_ACCOUNT_JSON format. Ensure it contains valid JSON.'
    )
  }
}

/**
 * Validates input data for createMeetSession.
 */
function validateInput(data: CreateMeetSessionInput): void {
  const required = [
    'appointmentId',
    'patientName',
    'patientEmail',
    'professionalEmail',
    'scheduledAt',
    'clinicName',
  ] as const

  for (const field of required) {
    if (!data[field]) {
      throw new functions.https.HttpsError('invalid-argument', `Campo obrigatorio: ${field}`)
    }
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(data.patientEmail)) {
    throw new functions.https.HttpsError('invalid-argument', 'Email do paciente invalido')
  }
  if (!emailRegex.test(data.professionalEmail)) {
    throw new functions.https.HttpsError('invalid-argument', 'Email do profissional invalido')
  }

  // Validate date format (ISO 8601)
  const date = new Date(data.scheduledAt)
  if (isNaN(date.getTime())) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Data agendada invalida (use ISO 8601)'
    )
  }
}

/**
 * Creates a teleconsultation session with Google Meet.
 *
 * Uses Google Calendar API to create an event with conferenceData,
 * which automatically generates a Meet link.
 *
 * SECURITY: Service account credentials loaded from Secret Manager.
 *
 * @param data - Session creation input
 * @param context - Firebase callable context
 * @returns Meet link, calendar event ID, and meeting code
 *
 * @example
 * ```typescript
 * const result = await functions.httpsCallable('createMeetSession')({
 *   appointmentId: 'apt-123',
 *   patientName: 'Maria Santos',
 *   patientEmail: 'maria@email.com',
 *   professionalName: 'Dr. Joao Silva',
 *   professionalEmail: 'joao@clinica.com',
 *   scheduledAt: '2025-01-15T10:00:00-03:00',
 *   durationMinutes: 30,
 *   clinicName: 'Clinica Genesis'
 * });
 * console.log(result.data.meetLink);
 * // https://meet.google.com/abc-defg-hij
 * ```
 */
export const createMeetSession = functions
  .runWith({ secrets: [...GOOGLE_CALENDAR_SECRETS] })
  .https.onCall(async (data: CreateMeetSessionInput, context): Promise<CreateMeetSessionOutput> => {
    // Require authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Usuario nao autenticado')
    }

    // Validate input
    validateInput(data)

    const {
      appointmentId,
      patientName,
      patientEmail,
      professionalName,
      professionalEmail,
      scheduledAt,
      durationMinutes = 30,
      clinicName,
    } = data

    try {
      // Get authenticated client
      const authClient = await getAuthClient()
      const calendar = google.calendar({ version: 'v3', auth: authClient as never })

      // Calculate end time
      const startTime = new Date(scheduledAt)
      const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000)

      // Build calendar event with Meet conference
      // CRITICAL: conferenceData.createRequest triggers Meet link generation
      const event: calendar_v3.Schema$Event = {
        summary: `Teleconsulta - ${professionalName}`,
        description: [
          `Consulta online com ${patientName}`,
          '',
          `Clinica: ${clinicName}`,
          `Profissional: ${professionalName}`,
          '',
          'Este link foi gerado automaticamente pelo sistema Genesis.',
        ].join('\n'),
        start: {
          dateTime: startTime.toISOString(),
          timeZone: 'America/Sao_Paulo',
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'America/Sao_Paulo',
        },
        attendees: [
          { email: patientEmail, displayName: patientName },
          { email: professionalEmail, displayName: professionalName },
        ],
        // CRITICAL: This creates the Meet link automatically
        conferenceData: {
          createRequest: {
            requestId: appointmentId, // Idempotency key
            conferenceSolutionKey: {
              type: 'hangoutsMeet', // Official type for Google Meet
            },
          },
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 60 }, // 1 hour before
            { method: 'popup', minutes: 15 }, // 15 min before
          ],
        },
      }

      // Insert event into calendar
      // CRITICAL: conferenceDataVersion: 1 is REQUIRED for Meet link
      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
        conferenceDataVersion: 1, // REQUIRED!
        sendUpdates: 'all', // Send email invites to attendees
      })

      const createdEvent = response.data

      // Extract Meet link from response
      if (!createdEvent.hangoutLink) {
        throw new functions.https.HttpsError(
          'internal',
          'Google Meet link nao foi gerado. Verifique configuracoes do Google Workspace.'
        )
      }

      // Extract meeting code (xxx-yyyy-zzz) from link
      const meetingCode = createdEvent.hangoutLink.split('/').pop() || ''

      functions.logger.info('Meet session created', {
        appointmentId,
        meetLink: createdEvent.hangoutLink,
        calendarEventId: createdEvent.id,
      })

      return {
        meetLink: createdEvent.hangoutLink,
        calendarEventId: createdEvent.id || '',
        meetingCode,
      }
    } catch (error) {
      functions.logger.error('Error creating Meet session', { error, appointmentId })

      if (error instanceof functions.https.HttpsError) {
        throw error
      }

      if (error instanceof Error) {
        // Handle specific Google API errors
        if (error.message.includes('invalid_grant')) {
          throw new functions.https.HttpsError(
            'failed-precondition',
            'Credenciais do Google expiradas. Contate o administrador.'
          )
        }
        if (error.message.includes('quotaExceeded')) {
          throw new functions.https.HttpsError(
            'resource-exhausted',
            'Limite de criacao de reunioes atingido. Tente novamente mais tarde.'
          )
        }

        throw new functions.https.HttpsError(
          'internal',
          `Falha ao criar teleconsulta: ${error.message}`
        )
      }

      throw new functions.https.HttpsError('internal', 'Erro desconhecido ao criar teleconsulta')
    }
  })

/**
 * Input for canceling a Meet session.
 */
export interface CancelMeetSessionInput {
  /** Google Calendar event ID */
  calendarEventId: string
  /** Optional cancellation reason */
  reason?: string
}

/**
 * Cancels/deletes a teleconsultation calendar event.
 *
 * SECURITY: Service account credentials loaded from Secret Manager.
 *
 * @param data - Calendar event ID and optional reason
 * @param context - Firebase callable context
 * @returns Success indicator
 */
export const cancelMeetSession = functions
  .runWith({ secrets: [...GOOGLE_CALENDAR_SECRETS] })
  .https.onCall(async (data: CancelMeetSessionInput, context): Promise<{ success: boolean }> => {
    // Require authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Usuario nao autenticado')
    }

    const { calendarEventId, reason } = data

    if (!calendarEventId) {
      throw new functions.https.HttpsError('invalid-argument', 'calendarEventId e obrigatorio')
    }

    try {
      const authClient = await getAuthClient()
      const calendar = google.calendar({ version: 'v3', auth: authClient as never })

      // Delete the calendar event (also cancels Meet)
      await calendar.events.delete({
        calendarId: 'primary',
        eventId: calendarEventId,
        sendUpdates: 'all', // Notify attendees of cancellation
      })

      functions.logger.info('Meet session canceled', { calendarEventId, reason })

      return { success: true }
    } catch (error) {
      functions.logger.error('Error canceling Meet session', { error, calendarEventId })

      if (error instanceof Error && error.message.includes('404')) {
        // Event already deleted - consider it a success
        return { success: true }
      }

      throw new functions.https.HttpsError('internal', 'Falha ao cancelar teleconsulta')
    }
  })

/**
 * Input for updating/rescheduling a Meet session.
 */
export interface UpdateMeetSessionInput {
  /** Google Calendar event ID */
  calendarEventId: string
  /** New scheduled time (ISO 8601) */
  newScheduledAt: string
  /** New duration in minutes */
  newDurationMinutes?: number
}

/**
 * Updates/reschedules a teleconsultation calendar event.
 * The Meet link remains the same.
 *
 * SECURITY: Service account credentials loaded from Secret Manager.
 *
 * @param data - Calendar event ID and new time
 * @param context - Firebase callable context
 * @returns Updated event details
 */
export const updateMeetSession = functions
  .runWith({ secrets: [...GOOGLE_CALENDAR_SECRETS] })
  .https.onCall(
    async (
      data: UpdateMeetSessionInput,
      context
    ): Promise<{ success: boolean; newStartTime: string; newEndTime: string }> => {
      // Require authentication
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Usuario nao autenticado')
      }

      const { calendarEventId, newScheduledAt, newDurationMinutes = 30 } = data

      if (!calendarEventId || !newScheduledAt) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'calendarEventId e newScheduledAt sao obrigatorios'
        )
      }

      try {
        const authClient = await getAuthClient()
        const calendar = google.calendar({ version: 'v3', auth: authClient as never })

        // Calculate new times
        const startTime = new Date(newScheduledAt)
        const endTime = new Date(startTime.getTime() + newDurationMinutes * 60 * 1000)

        // Update the event
        await calendar.events.patch({
          calendarId: 'primary',
          eventId: calendarEventId,
          requestBody: {
            start: {
              dateTime: startTime.toISOString(),
              timeZone: 'America/Sao_Paulo',
            },
            end: {
              dateTime: endTime.toISOString(),
              timeZone: 'America/Sao_Paulo',
            },
          },
          sendUpdates: 'all', // Notify attendees of change
        })

        functions.logger.info('Meet session updated', {
          calendarEventId,
          newStartTime: startTime.toISOString(),
        })

        return {
          success: true,
          newStartTime: startTime.toISOString(),
          newEndTime: endTime.toISOString(),
        }
      } catch (error) {
        functions.logger.error('Error updating Meet session', { error, calendarEventId })

        throw new functions.https.HttpsError('internal', 'Falha ao reagendar teleconsulta')
      }
    }
  )
