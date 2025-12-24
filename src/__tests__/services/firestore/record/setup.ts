/**
 * Record Service Test Setup
 *
 * Shared mock data for record service tests.
 */

import { RecordType } from '@/types';

export const mockClinicId = 'clinic-123';
export const mockRecordId = 'record-456';

export const mockSoapData = {
  patientId: 'patient-1',
  date: '2025-01-15T10:00:00.000Z',
  professional: 'Dr. Test',
  type: RecordType.SOAP,
  specialty: 'medicina',
  subjective: 'Patient reports headache',
  objective: 'BP 120/80',
  assessment: 'Tension headache',
  plan: 'Rest and hydration',
};
