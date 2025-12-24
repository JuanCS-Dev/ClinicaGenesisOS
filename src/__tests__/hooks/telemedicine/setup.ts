/**
 * Telemedicine Hooks Test Setup
 *
 * Shared mock data for telemedicine hook tests.
 */

import type { TelemedicineSession } from '@/types';

export const mockSession: TelemedicineSession = {
  id: 'session-123',
  clinicId: 'clinic-123',
  appointmentId: 'appointment-123',
  patientId: 'patient-123',
  patientName: 'Maria Santos',
  professionalId: 'user-123',
  professionalName: 'Dr. João Silva',
  status: 'scheduled',
  scheduledAt: new Date().toISOString(),
  participants: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/** Helper: Wait for hook to finish loading */
export const waitForLoaded = async (result: { current: { loading: boolean } }) => {
  const { waitFor } = await import('@testing-library/react');
  await waitFor(() => {
    if (result.current.loading) {
      throw new Error('Still loading');
    }
  });
};
