/**
 * VideoRoom Test Setup
 * ====================
 *
 * Shared mocks, fixtures, and utilities for VideoRoom tests.
 *
 * @module __tests__/components/telemedicine/VideoRoom.setup
 */

import { vi } from 'vitest'

// =============================================================================
// MOCK API INSTANCE
// =============================================================================

export interface MockJitsiApi {
  addListener: ReturnType<typeof vi.fn>
  dispose: ReturnType<typeof vi.fn>
  executeCommand: ReturnType<typeof vi.fn>
  listeners: Record<string, (...args: unknown[]) => void>
}

export let mockApiInstance: MockJitsiApi

// =============================================================================
// MOCKS SETUP
// =============================================================================

/**
 * Setup all mocks for VideoRoom tests.
 * Call this at the top of your test file.
 */
export function setupVideoRoomMocks() {
  // Mock sonner toast
  vi.mock('sonner', () => ({
    toast: {
      success: vi.fn(),
      error: vi.fn(),
    },
  }))

  // Mock JitsiMeeting component
  vi.mock('@jitsi/react-sdk', () => ({
    JitsiMeeting: vi.fn(({ onApiReady, onReadyToClose }) => {
      mockApiInstance = {
        addListener: vi.fn((event: string, callback: (...args: unknown[]) => void) => {
          mockApiInstance.listeners[event] = callback
        }),
        dispose: vi.fn(),
        executeCommand: vi.fn(),
        listeners: {},
      }

      if (onApiReady) {
        setTimeout(() => {
          onApiReady(mockApiInstance)
        }, 0)
      }

      return {
        type: 'div',
        props: {
          'data-testid': 'jitsi-meeting',
          children: [
            { type: 'span', props: { children: 'Jitsi Meeting Mock' } },
            {
              type: 'button',
              props: {
                'data-testid': 'trigger-close',
                onClick: () => onReadyToClose?.(),
                children: 'Ready to Close',
              },
            },
          ],
        },
      }
    }),
  }))
}

// =============================================================================
// FIXTURES
// =============================================================================

/**
 * Mock Jitsi session (no meetLink).
 */
export const mockJitsiSession = {
  id: 'session-123',
  appointmentId: 'apt-123',
  patientId: 'patient-123',
  patientName: 'Maria Santos',
  professionalId: 'prof-123',
  professionalName: 'Dr. João Silva',
  roomName: 'room-abc123',
  status: 'in_progress' as const,
  participants: [],
  recordingEnabled: false,
  startedAt: new Date().toISOString(),
  scheduledAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

/**
 * Mock Google Meet session (with meetLink).
 */
export const mockMeetSession = {
  id: 'session-456',
  appointmentId: 'apt-456',
  patientId: 'patient-456',
  patientName: 'Joana Silva',
  professionalId: 'prof-456',
  professionalName: 'Dr. Carlos Mendes',
  roomName: 'room-xyz789',
  meetLink: 'https://meet.google.com/abc-defg-hij',
  calendarEventId: 'calendar-event-456',
  status: 'in_progress' as const,
  participants: [],
  recordingEnabled: false,
  startedAt: new Date().toISOString(),
  scheduledAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

/**
 * Mock session without startedAt (for timer tests).
 */
export const mockSessionWithoutStart = {
  ...mockJitsiSession,
  id: 'session-no-start',
  startedAt: undefined,
}

/**
 * Mock session with recording enabled.
 */
export const mockSessionWithRecording = {
  ...mockJitsiSession,
  id: 'session-recording',
  recordingEnabled: true,
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Get the mock API instance.
 */
export function getMockApi(): MockJitsiApi {
  return mockApiInstance
}

/**
 * Trigger a Jitsi event on the mock API.
 */
export function triggerJitsiEvent(event: string, ...args: unknown[]) {
  if (mockApiInstance?.listeners[event]) {
    mockApiInstance.listeners[event](...args)
  }
}

/**
 * Setup clipboard mock for copy tests.
 */
export function setupClipboardMock() {
  Object.assign(navigator, {
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
  })
}

/**
 * Setup window.open mock for Meet link tests.
 */
export function setupWindowOpenMock() {
  vi.spyOn(window, 'open').mockImplementation(() => null)
}
