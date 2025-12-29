/**
 * Agenda Test Setup
 * @module __tests__/pages/Agenda.setup
 */

import { vi } from 'vitest'

export const mockSetFilters = vi.fn()
export const mockUpdateAppointment = vi.fn().mockResolvedValue(undefined)
export const mockAddAppointment = vi.fn()
export const mockDeleteAppointment = vi.fn()

export const mockDefaultAppointments = [
  {
    id: 'apt-1',
    patientId: 'p1',
    patientName: 'Maria Santos',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '09:30',
    durationMin: 30,
    status: 'Confirmado',
    specialty: 'medicina',
  },
  {
    id: 'apt-2',
    patientId: 'p2',
    patientName: 'João Silva',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '10:30',
    durationMin: 30,
    status: 'Pendente',
    specialty: 'cardiologia',
  },
]

export const defaultAppointmentsHook = {
  appointments: mockDefaultAppointments,
  loading: false,
  error: null,
  setFilters: mockSetFilters,
  updateAppointment: mockUpdateAppointment,
  addAppointment: mockAddAppointment,
  deleteAppointment: mockDeleteAppointment,
}

export const loadingAppointmentsHook = {
  ...defaultAppointmentsHook,
  appointments: [],
  loading: true,
}

export const emptyAppointmentsHook = {
  ...defaultAppointmentsHook,
  appointments: [],
}
