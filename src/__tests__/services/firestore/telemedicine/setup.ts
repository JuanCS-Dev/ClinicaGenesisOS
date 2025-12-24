/**
 * Telemedicine Service Test Setup
 *
 * Shared mock data for telemedicine service tests.
 * NOTE: Mocks must be defined in each test file due to hoisting.
 */

import type { TelemedicineSession } from '@/types';

export const mockClinicId = 'clinic-123';
export const mockSessionId = 'session-456';
export const mockAppointmentId = 'appointment-789';

export const mockSession: TelemedicineSession = {
  id: mockSessionId,
  appointmentId: mockAppointmentId,
  patientId: 'patient-001',
  patientName: 'Maria Silva',
  professionalId: 'doctor-001',
  professionalName: 'Dr. João',
  roomName: 'genesis-clinic-123-session-456-12345-abc123',
  status: 'scheduled',
  participants: [],
  scheduledAt: '2025-12-21T10:00:00Z',
  createdAt: '2025-12-20T10:00:00Z',
  updatedAt: '2025-12-20T10:00:00Z',
};
