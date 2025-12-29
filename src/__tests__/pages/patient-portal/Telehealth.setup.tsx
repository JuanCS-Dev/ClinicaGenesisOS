/**
 * Telehealth Test Setup
 * Shared mocks, fixtures, and utilities for Telehealth tests.
 * @module __tests__/pages/patient-portal/Telehealth.setup
 */

import { vi } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { PatientTelehealth } from '../../../pages/patient-portal/Telehealth'
import { usePatientTelehealth } from '../../../hooks/usePatientTelehealth'

export const mockUsePatientTelehealth = usePatientTelehealth as ReturnType<typeof vi.fn>

export const renderTelehealth = () => {
  return render(
    <MemoryRouter>
      <PatientTelehealth />
    </MemoryRouter>
  )
}

export const mockDefaultAppointment = {
  id: 'apt-tele-1',
  patientId: 'patient-123',
  patientName: 'Maria Santos',
  professional: 'Dr. João Silva',
  specialty: 'Cardiologia',
  date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
  time: '14:00',
  status: 'scheduled',
  type: 'teleconsulta',
}

export const mockMeetSession = {
  id: 'session-123',
  meetLink: 'https://meet.google.com/abc-defg-hij',
  calendarEventId: 'cal-123',
}

export const mockJitsiSession = {
  id: 'session-123',
  roomName: 'genesis-apt-123',
}

/** Default hook return value for waiting state */
export const defaultHookReturn = {
  nextTeleconsulta: {
    appointment: mockDefaultAppointment,
    session: null,
  },
  loading: false,
  error: null,
  canJoin: false,
  minutesUntilJoin: 60,
  meetLink: null,
  isMeetSession: false,
  joinWaitingRoom: vi.fn().mockResolvedValue(undefined),
  openMeet: vi.fn(),
  refresh: vi.fn(),
}

/** Hook return value for loading state */
export const loadingHookReturn = {
  nextTeleconsulta: { appointment: null, session: null },
  loading: true,
  error: null,
  canJoin: false,
  minutesUntilJoin: null,
  meetLink: null,
  isMeetSession: false,
  joinWaitingRoom: vi.fn(),
  openMeet: vi.fn(),
  refresh: vi.fn(),
}

/** Hook return value for no appointment */
export const noAppointmentHookReturn = {
  nextTeleconsulta: { appointment: null, session: null },
  loading: false,
  error: null,
  canJoin: false,
  minutesUntilJoin: null,
  meetLink: null,
  isMeetSession: false,
  joinWaitingRoom: vi.fn(),
  openMeet: vi.fn(),
  refresh: vi.fn(),
}

/** Hook return value for ready to join */
export const canJoinHookReturn = {
  ...defaultHookReturn,
  canJoin: true,
  minutesUntilJoin: 0,
}

/** Hook return value for Google Meet session */
export const meetSessionHookReturn = {
  nextTeleconsulta: {
    appointment: mockDefaultAppointment,
    session: mockMeetSession,
  },
  loading: false,
  error: null,
  canJoin: true,
  minutesUntilJoin: 0,
  meetLink: 'https://meet.google.com/abc-defg-hij',
  isMeetSession: true,
  joinWaitingRoom: vi.fn(),
  openMeet: vi.fn(),
  refresh: vi.fn(),
}

/** Hook return value for Jitsi session */
export const jitsiSessionHookReturn = {
  nextTeleconsulta: {
    appointment: mockDefaultAppointment,
    session: mockJitsiSession,
  },
  loading: false,
  error: null,
  canJoin: true,
  minutesUntilJoin: 0,
  meetLink: null,
  isMeetSession: false,
  joinWaitingRoom: vi.fn(),
  openMeet: vi.fn(),
  refresh: vi.fn(),
}

/** Setup clipboard mock */
export function setupClipboardMock() {
  Object.assign(navigator, {
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
  })
}

/** Setup window.open mock */
export function setupWindowOpenMock() {
  vi.spyOn(window, 'open').mockImplementation(() => null)
}
