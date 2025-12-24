/**
 * Prescription Hooks Test Setup
 *
 * Shared test data for prescription hook tests.
 * NOTE: Mocks must be defined in each test file due to hoisting.
 */

import type { Prescription } from '@/types';

export const mockPrescription: Prescription = {
  id: 'rx-123',
  clinicId: 'clinic-123',
  patientId: 'patient-123',
  patientName: 'Maria Santos',
  professional: {
    id: 'user-123',
    name: 'Dr. João Silva',
    crm: '123456',
    crmState: 'SP',
  },
  medications: [
    {
      name: 'Dipirona 500mg',
      dosage: '1 comprimido',
      frequency: 'A cada 6 horas',
      duration: '5 dias',
      instructions: 'Tomar com água',
      quantity: 20,
    },
  ],
  diagnosis: 'Gripe comum',
  status: 'draft',
  type: 'simple',
  validationCode: 'ABC123XY',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'user-123',
  updatedBy: 'user-123',
} as Prescription;

export const mockStats = {
  total: 50,
  byStatus: { draft: 5, signed: 20, sent: 15, filled: 10 },
  byType: { simple: 40, controlled: 10 },
  controlled: 10,
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
