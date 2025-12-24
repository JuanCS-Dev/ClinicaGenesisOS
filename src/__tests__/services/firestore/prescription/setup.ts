/**
 * Prescription Service Test Setup
 *
 * Shared mocks and test data for prescription service tests.
 */

import { vi } from 'vitest';
import type { Prescription, PrescriptionMedication } from '@/types';

// Mock Firebase - all mocks must be self-contained (hoisted to top)
export function setupFirebaseMocks() {
  vi.mock('firebase/firestore', () => {
    class MockTimestamp {
      toDate() {
        return new Date('2025-12-21T10:00:00Z');
      }
    }

    return {
      collection: vi.fn(() => 'mocked-collection'),
      doc: vi.fn(() => 'mocked-doc'),
      getDocs: vi.fn(),
      getDoc: vi.fn(),
      addDoc: vi.fn(),
      updateDoc: vi.fn(),
      query: vi.fn(() => 'mocked-query'),
      where: vi.fn(),
      orderBy: vi.fn(),
      limit: vi.fn(),
      onSnapshot: vi.fn(),
      serverTimestamp: vi.fn(() => ({ _serverTimestamp: true })),
      Timestamp: MockTimestamp,
    };
  });

  vi.mock('@/services/firebase', () => ({
    db: {},
  }));
}

// Test IDs
export const mockClinicId = 'clinic-123';
export const mockPrescriptionId = 'prescription-456';
export const mockPatientId = 'patient-789';

// Mock data
export const mockMedication: PrescriptionMedication = {
  id: 'med-001',
  name: 'Dipirona 500mg',
  dosage: '1 comprimido',
  unit: 'comprimido',
  route: 'oral',
  frequency: '8 em 8 horas',
  duration: '5 dias',
  quantity: 15,
  isControlled: false,
  continuousUse: false,
};

export const mockPrescription: Prescription = {
  id: mockPrescriptionId,
  clinicId: mockClinicId,
  patientId: mockPatientId,
  patientName: 'Maria Silva',
  patientCpf: '123.456.789-00',
  professionalId: 'doctor-001',
  professionalName: 'Dr. João Santos',
  professionalCrm: '12345',
  professionalCrmState: 'SP',
  type: 'common',
  status: 'draft',
  medications: [mockMedication],
  validityDays: 60,
  prescribedAt: '2025-12-21T10:00:00Z',
  expiresAt: '2025-02-19T10:00:00Z',
  validationCode: 'ABC12345',
  createdAt: '2025-12-21T10:00:00Z',
  updatedAt: '2025-12-21T10:00:00Z',
};

export const mockProfessional = {
  id: 'doctor-001',
  name: 'Dr. João Santos',
  crm: '12345',
  crmState: 'SP',
};
