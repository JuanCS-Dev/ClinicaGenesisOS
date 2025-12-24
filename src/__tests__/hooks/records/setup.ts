/**
 * Records Hooks Test Setup
 *
 * Shared mock data for records hook tests.
 */

import { RecordType, type SoapRecord } from '@/types';

export const mockClinicId = 'test-clinic-123';
export const mockUserProfile = { displayName: 'Dr. Test' };

/**
 * Create a mock SOAP record for testing.
 */
export function createMockRecord(overrides: Partial<SoapRecord> = {}): SoapRecord {
  return {
    id: 'record-1',
    patientId: 'patient-1',
    date: '2025-01-15T10:00:00.000Z',
    professional: 'Dr. Test',
    type: RecordType.SOAP,
    specialty: 'medicina',
    subjective: 'Patient reports headache',
    objective: 'BP 120/80',
    assessment: 'Tension headache',
    plan: 'Rest and hydration',
    ...overrides,
  };
}
