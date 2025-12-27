/**
 * Google Meet Cloud Function Tests
 * =================================
 *
 * Tests for the createMeetSession, cancelMeetSession, and updateMeetSession functions.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

/** Type for Firebase callable functions in tests */
type CallableHandler<T, R> = (data: T, context: { auth: { uid: string } | null }) => Promise<R>

// Mock googleapis
const mockCalendarInsert = vi.fn()
const mockCalendarDelete = vi.fn()
const mockCalendarPatch = vi.fn()

vi.mock('googleapis', () => ({
  google: {
    auth: {
      GoogleAuth: vi.fn().mockImplementation(() => ({
        getClient: vi.fn().mockResolvedValue({}),
      })),
    },
    calendar: vi.fn().mockReturnValue({
      events: {
        insert: mockCalendarInsert,
        delete: mockCalendarDelete,
        patch: mockCalendarPatch,
      },
    }),
  },
}))

// Mock firebase-functions
vi.mock('firebase-functions', () => ({
  https: {
    onCall: <T, R>(handler: CallableHandler<T, R>) => handler,
    HttpsError: class extends Error {
      code: string
      constructor(code: string, message: string) {
        super(message)
        this.code = code
        this.name = 'HttpsError'
      }
    },
  },
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}))

import type { CreateMeetSessionInput } from '../../calendar/google-meet'

// Test data
const mockInput: CreateMeetSessionInput = {
  appointmentId: 'apt-123',
  patientName: 'Maria Santos',
  patientEmail: 'maria@email.com',
  professionalName: 'Dr. Joao Silva',
  professionalEmail: 'joao@clinica.com',
  scheduledAt: '2025-01-15T10:00:00-03:00',
  durationMinutes: 30,
  clinicName: 'Clinica Genesis',
}

const mockContext = {
  auth: { uid: 'user-123' },
}

const mockCalendarResponse = {
  data: {
    id: 'calendar-event-123',
    hangoutLink: 'https://meet.google.com/abc-defg-hij',
    htmlLink: 'https://calendar.google.com/event/123',
    conferenceData: {
      entryPoints: [
        {
          entryPointType: 'video',
          uri: 'https://meet.google.com/abc-defg-hij',
        },
      ],
    },
  },
}

describe('Google Meet Cloud Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Set the required environment variable
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON = JSON.stringify({
      type: 'service_account',
      project_id: 'test-project',
      private_key: 'test-key',
      client_email: 'test@test.iam.gserviceaccount.com',
    })
  })

  describe('createMeetSession', () => {
    beforeEach(() => {
      mockCalendarInsert.mockResolvedValue(mockCalendarResponse)
    })

    it('should create a calendar event with Meet link', async () => {
      // Import after mocks are set
      const { createMeetSession } = await import('../../calendar/google-meet')

      const result = await (createMeetSession as CallableHandler<typeof mockInput, unknown>)(mockInput, mockContext)

      expect(result).toEqual({
        meetLink: 'https://meet.google.com/abc-defg-hij',
        calendarEventId: 'calendar-event-123',
        meetingCode: 'abc-defg-hij',
      })
    })

    it('should call calendar API with correct parameters', async () => {
      const { createMeetSession } = await import('../../calendar/google-meet')

      await (createMeetSession as CallableHandler<typeof mockInput, unknown>)(mockInput, mockContext)

      expect(mockCalendarInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          calendarId: 'primary',
          conferenceDataVersion: 1,
          sendUpdates: 'all',
        })
      )
    })

    it('should include attendees in the event', async () => {
      const { createMeetSession } = await import('../../calendar/google-meet')

      await (createMeetSession as CallableHandler<typeof mockInput, unknown>)(mockInput, mockContext)

      const callArgs = mockCalendarInsert.mock.calls[0][0]
      expect(callArgs.requestBody.attendees).toEqual([
        { email: 'maria@email.com', displayName: 'Maria Santos' },
        { email: 'joao@clinica.com', displayName: 'Dr. Joao Silva' },
      ])
    })

    it('should throw error when not authenticated', async () => {
      const { createMeetSession } = await import('../../calendar/google-meet')

      await expect((createMeetSession as CallableHandler<typeof mockInput, unknown>)(mockInput, { auth: null })).rejects.toThrow(
        'Usuario nao autenticado'
      )
    })

    it('should throw error when patientEmail is missing', async () => {
      const { createMeetSession } = await import('../../calendar/google-meet')

      const invalidInput = { ...mockInput, patientEmail: '' }

      await expect((createMeetSession as CallableHandler<typeof mockInput, unknown>)(invalidInput, mockContext)).rejects.toThrow(
        'Campo obrigatorio: patientEmail'
      )
    })

    it('should throw error when patientEmail is invalid', async () => {
      const { createMeetSession } = await import('../../calendar/google-meet')

      const invalidInput = { ...mockInput, patientEmail: 'invalid-email' }

      await expect((createMeetSession as CallableHandler<typeof mockInput, unknown>)(invalidInput, mockContext)).rejects.toThrow(
        'Email do paciente invalido'
      )
    })

    it('should throw error when scheduledAt is invalid', async () => {
      const { createMeetSession } = await import('../../calendar/google-meet')

      const invalidInput = { ...mockInput, scheduledAt: 'not-a-date' }

      await expect((createMeetSession as CallableHandler<typeof mockInput, unknown>)(invalidInput, mockContext)).rejects.toThrow(
        'Data agendada invalida'
      )
    })

    it('should throw error when Meet link is not generated', async () => {
      mockCalendarInsert.mockResolvedValue({
        data: { id: 'event-123', hangoutLink: null },
      })

      const { createMeetSession } = await import('../../calendar/google-meet')

      await expect((createMeetSession as CallableHandler<typeof mockInput, unknown>)(mockInput, mockContext)).rejects.toThrow(
        'Google Meet link nao foi gerado'
      )
    })

    it('should throw error when service account is not configured', async () => {
      delete process.env.GOOGLE_SERVICE_ACCOUNT_JSON

      const { createMeetSession } = await import('../../calendar/google-meet')

      await expect((createMeetSession as CallableHandler<typeof mockInput, unknown>)(mockInput, mockContext)).rejects.toThrow(
        'GOOGLE_SERVICE_ACCOUNT_JSON secret not configured'
      )
    })

    it('should use default duration when not provided', async () => {
      const { createMeetSession } = await import('../../calendar/google-meet')

      const inputWithoutDuration = { ...mockInput, durationMinutes: undefined }

      await (createMeetSession as CallableHandler<typeof mockInput, unknown>)(inputWithoutDuration, mockContext)

      const callArgs = mockCalendarInsert.mock.calls[0][0]
      const startTime = new Date(inputWithoutDuration.scheduledAt)
      const endTime = new Date(startTime.getTime() + 30 * 60 * 1000) // Default 30 min

      expect(callArgs.requestBody.end.dateTime).toBe(endTime.toISOString())
    })
  })

  describe('cancelMeetSession', () => {
    beforeEach(() => {
      mockCalendarDelete.mockResolvedValue({})
    })

    it('should delete the calendar event', async () => {
      const { cancelMeetSession } = await import('../../calendar/google-meet')

      const result = await (cancelMeetSession as CallableHandler<{ calendarEventId: string }, { success: boolean }>)(
        { calendarEventId: 'event-123' },
        mockContext
      )

      expect(result).toEqual({ success: true })
      expect(mockCalendarDelete).toHaveBeenCalledWith({
        calendarId: 'primary',
        eventId: 'event-123',
        sendUpdates: 'all',
      })
    })

    it('should throw error when not authenticated', async () => {
      const { cancelMeetSession } = await import('../../calendar/google-meet')

      await expect(
        (cancelMeetSession as CallableHandler<{ calendarEventId: string }, { success: boolean }>)({ calendarEventId: 'event-123' }, { auth: null })
      ).rejects.toThrow('Usuario nao autenticado')
    })

    it('should throw error when calendarEventId is missing', async () => {
      const { cancelMeetSession } = await import('../../calendar/google-meet')

      await expect(
        (cancelMeetSession as CallableHandler<{ calendarEventId: string }, { success: boolean }>)({ calendarEventId: '' }, mockContext)
      ).rejects.toThrow('calendarEventId e obrigatorio')
    })

    it('should return success when event is already deleted (404)', async () => {
      mockCalendarDelete.mockRejectedValue(new Error('404 Not Found'))

      const { cancelMeetSession } = await import('../../calendar/google-meet')

      const result = await (cancelMeetSession as CallableHandler<{ calendarEventId: string }, { success: boolean }>)(
        { calendarEventId: 'event-123' },
        mockContext
      )

      expect(result).toEqual({ success: true })
    })
  })

  describe('updateMeetSession', () => {
    beforeEach(() => {
      mockCalendarPatch.mockResolvedValue({})
    })

    it('should update the calendar event with new time', async () => {
      const { updateMeetSession } = await import('../../calendar/google-meet')

      const result = await (updateMeetSession as CallableHandler<{ calendarEventId: string; newScheduledAt: string; newDurationMinutes?: number }, { success: boolean }>)(
        {
          calendarEventId: 'event-123',
          newScheduledAt: '2025-01-16T14:00:00-03:00',
          newDurationMinutes: 45,
        },
        mockContext
      )

      expect(result.success).toBe(true)
      expect(mockCalendarPatch).toHaveBeenCalledWith(
        expect.objectContaining({
          calendarId: 'primary',
          eventId: 'event-123',
          sendUpdates: 'all',
        })
      )
    })

    it('should throw error when not authenticated', async () => {
      const { updateMeetSession } = await import('../../calendar/google-meet')

      await expect(
        (updateMeetSession as CallableHandler<{ calendarEventId: string; newScheduledAt: string; newDurationMinutes?: number }, { success: boolean }>)(
          { calendarEventId: 'event-123', newScheduledAt: '2025-01-16T14:00:00-03:00' },
          { auth: null }
        )
      ).rejects.toThrow('Usuario nao autenticado')
    })

    it('should throw error when calendarEventId is missing', async () => {
      const { updateMeetSession } = await import('../../calendar/google-meet')

      await expect(
        (updateMeetSession as CallableHandler<{ calendarEventId: string; newScheduledAt: string; newDurationMinutes?: number }, { success: boolean }>)(
          { calendarEventId: '', newScheduledAt: '2025-01-16T14:00:00-03:00' },
          mockContext
        )
      ).rejects.toThrow('calendarEventId e newScheduledAt sao obrigatorios')
    })

    it('should use default duration when not provided', async () => {
      const { updateMeetSession } = await import('../../calendar/google-meet')

      await (updateMeetSession as CallableHandler<{ calendarEventId: string; newScheduledAt: string; newDurationMinutes?: number }, { success: boolean }>)(
        {
          calendarEventId: 'event-123',
          newScheduledAt: '2025-01-16T14:00:00-03:00',
        },
        mockContext
      )

      const callArgs = mockCalendarPatch.mock.calls[0][0]
      const startTime = new Date('2025-01-16T14:00:00-03:00')
      const endTime = new Date(startTime.getTime() + 30 * 60 * 1000) // Default 30 min

      expect(callArgs.requestBody.end.dateTime).toBe(endTime.toISOString())
    })
  })
})
