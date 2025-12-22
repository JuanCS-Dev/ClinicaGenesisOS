/**
 * Prescription Utils Tests
 *
 * Tests for prescription utility functions.
 */

import { describe, it, expect, vi } from 'vitest';
import type { PrescriptionMedication } from '@/types';

// Mock Firebase
vi.mock('firebase/firestore', () => {
  class MockTimestamp {
    seconds: number;
    nanoseconds: number;
    
    constructor(seconds?: number, nanoseconds?: number) {
      this.seconds = seconds ?? Math.floor(Date.now() / 1000);
      this.nanoseconds = nanoseconds ?? 0;
    }
    
    toDate() {
      return new Date('2025-12-21T10:00:00Z');
    }
  }
  return {
    collection: vi.fn(() => 'mocked-collection'),
    doc: vi.fn(() => 'mocked-doc'),
    Timestamp: MockTimestamp,
  };
});

vi.mock('@/services/firebase', () => ({
  db: {},
}));

// Import after mocks
import {
  generateValidationCode,
  calculateExpirationDate,
  determinePrescriptionType,
  statusToEventType,
  toPrescription,
  toLogEntry,
  getPrescriptionCollection,
  getLogsCollection,
  getPrescriptionDoc,
} from '@/services/firestore/prescription.utils';
// Create mock timestamp instances using the mocked Timestamp class
function createMockTimestamp() {
  // Dynamic import from the mocked module
  const { Timestamp } = require('firebase/firestore');
  return new Timestamp(0, 0);
}

describe('prescription.utils', () => {
  describe('generateValidationCode', () => {
    it('generates an 8-character code', () => {
      const code = generateValidationCode();
      expect(code).toHaveLength(8);
    });

    it('generates only alphanumeric characters', () => {
      const code = generateValidationCode();
      expect(code).toMatch(/^[A-Z0-9]+$/);
    });

    it('excludes ambiguous characters (0, O, I, l, 1)', () => {
      // Generate multiple codes to increase probability of catching issues
      for (let i = 0; i < 50; i++) {
        const code = generateValidationCode();
        expect(code).not.toMatch(/[0OIl1]/);
      }
    });

    it('generates unique codes', () => {
      const codes = new Set<string>();
      for (let i = 0; i < 100; i++) {
        codes.add(generateValidationCode());
      }
      // With high probability, all codes should be unique
      expect(codes.size).toBe(100);
    });
  });

  describe('calculateExpirationDate', () => {
    const baseDate = '2025-01-15T10:00:00Z';

    it('returns 60 days for common prescriptions', () => {
      const expiresAt = calculateExpirationDate(baseDate, 'common');
      const expected = new Date('2025-03-16T10:00:00Z');
      expect(new Date(expiresAt).toDateString()).toBe(expected.toDateString());
    });

    it('returns 30 days for special_white prescriptions', () => {
      const expiresAt = calculateExpirationDate(baseDate, 'special_white');
      const expected = new Date('2025-02-14T10:00:00Z');
      expect(new Date(expiresAt).toDateString()).toBe(expected.toDateString());
    });

    it('returns 30 days for blue prescriptions', () => {
      const expiresAt = calculateExpirationDate(baseDate, 'blue');
      const expected = new Date('2025-02-14T10:00:00Z');
      expect(new Date(expiresAt).toDateString()).toBe(expected.toDateString());
    });

    it('returns 30 days for yellow prescriptions', () => {
      const expiresAt = calculateExpirationDate(baseDate, 'yellow');
      const expected = new Date('2025-02-14T10:00:00Z');
      expect(new Date(expiresAt).toDateString()).toBe(expected.toDateString());
    });

    it('returns 10 days for antimicrobial prescriptions', () => {
      const expiresAt = calculateExpirationDate(baseDate, 'antimicrobial');
      const expected = new Date('2025-01-25T10:00:00Z');
      expect(new Date(expiresAt).toDateString()).toBe(expected.toDateString());
    });
  });

  describe('determinePrescriptionType', () => {
    const baseMedication: PrescriptionMedication = {
      id: 'med-1',
      name: 'Test Med',
      dosage: '1 comprimido',
      unit: 'comprimido',
      route: 'oral',
      frequency: '8h',
      duration: '7 dias',
      quantity: 21,
      isControlled: false,
      continuousUse: false,
    };

    it('returns "common" for non-controlled medications', () => {
      const medications = [{ ...baseMedication }];
      expect(determinePrescriptionType(medications)).toBe('common');
    });

    it('returns "yellow" for A-type controlled medications', () => {
      const medications = [{
        ...baseMedication,
        isControlled: true,
        controlType: 'A1',
      }];
      expect(determinePrescriptionType(medications)).toBe('yellow');
    });

    it('returns "yellow" for A2-type controlled medications', () => {
      const medications = [{
        ...baseMedication,
        isControlled: true,
        controlType: 'A2',
      }];
      expect(determinePrescriptionType(medications)).toBe('yellow');
    });

    it('returns "yellow" for A3-type controlled medications', () => {
      const medications = [{
        ...baseMedication,
        isControlled: true,
        controlType: 'A3',
      }];
      expect(determinePrescriptionType(medications)).toBe('yellow');
    });

    it('returns "blue" for B-type controlled medications', () => {
      const medications = [{
        ...baseMedication,
        isControlled: true,
        controlType: 'B1',
      }];
      expect(determinePrescriptionType(medications)).toBe('blue');
    });

    it('returns "blue" for B2-type controlled medications', () => {
      const medications = [{
        ...baseMedication,
        isControlled: true,
        controlType: 'B2',
      }];
      expect(determinePrescriptionType(medications)).toBe('blue');
    });

    it('returns "special_white" for C-type controlled medications', () => {
      const medications = [{
        ...baseMedication,
        isControlled: true,
        controlType: 'C1',
      }];
      expect(determinePrescriptionType(medications)).toBe('special_white');
    });

    it('returns "special_white" for C5-type controlled medications', () => {
      const medications = [{
        ...baseMedication,
        isControlled: true,
        controlType: 'C5',
      }];
      expect(determinePrescriptionType(medications)).toBe('special_white');
    });

    it('returns "antimicrobial" for antimicrobial medications', () => {
      const medications = [{
        ...baseMedication,
        isControlled: false,
        controlType: 'antimicrobial',
      }];
      expect(determinePrescriptionType(medications)).toBe('antimicrobial');
    });

    it('returns most restrictive type when mixed (yellow > blue)', () => {
      const medications = [
        { ...baseMedication, isControlled: true, controlType: 'A1' },
        { ...baseMedication, isControlled: true, controlType: 'B1' },
      ];
      expect(determinePrescriptionType(medications)).toBe('yellow');
    });

    it('returns most restrictive type when mixed (blue > special_white)', () => {
      const medications = [
        { ...baseMedication, isControlled: true, controlType: 'B1' },
        { ...baseMedication, isControlled: true, controlType: 'C1' },
      ];
      expect(determinePrescriptionType(medications)).toBe('blue');
    });

    it('handles multiple non-controlled medications', () => {
      const medications = [
        { ...baseMedication },
        { ...baseMedication, id: 'med-2', name: 'Another Med' },
      ];
      expect(determinePrescriptionType(medications)).toBe('common');
    });
  });

  describe('statusToEventType', () => {
    it('maps draft to updated', () => {
      expect(statusToEventType('draft')).toBe('updated');
    });

    it('maps pending_signature to updated', () => {
      expect(statusToEventType('pending_signature')).toBe('updated');
    });

    it('maps signed to signed', () => {
      expect(statusToEventType('signed')).toBe('signed');
    });

    it('maps sent to sent', () => {
      expect(statusToEventType('sent')).toBe('sent');
    });

    it('maps viewed to viewed', () => {
      expect(statusToEventType('viewed')).toBe('viewed');
    });

    it('maps filled to filled', () => {
      expect(statusToEventType('filled')).toBe('filled');
    });

    it('maps expired to expired', () => {
      expect(statusToEventType('expired')).toBe('expired');
    });

    it('maps canceled to canceled', () => {
      expect(statusToEventType('canceled')).toBe('canceled');
    });
  });

  describe('toPrescription', () => {
    it('converts document data to Prescription type', () => {
      const data = {
        clinicId: 'clinic-1',
        patientId: 'patient-1',
        patientName: 'John Doe',
        patientCpf: '123.456.789-00',
        professionalId: 'doctor-1',
        professionalName: 'Dr. Smith',
        professionalCrm: '12345',
        professionalCrmState: 'SP',
        type: 'common',
        status: 'draft',
        medications: [],
        observations: 'Take with food',
        validityDays: 60,
        prescribedAt: '2025-01-15T10:00:00Z',
        expiresAt: '2025-03-16T10:00:00Z',
        createdAt: '2025-01-15T10:00:00Z',
        updatedAt: '2025-01-15T10:00:00Z',
      };

      const prescription = toPrescription('presc-1', data);

      expect(prescription.id).toBe('presc-1');
      expect(prescription.clinicId).toBe('clinic-1');
      expect(prescription.patientName).toBe('John Doe');
      expect(prescription.type).toBe('common');
      expect(prescription.status).toBe('draft');
    });

    it('handles string timestamps for createdAt/updatedAt', () => {
      const data = {
        clinicId: 'clinic-1',
        patientId: 'patient-1',
        patientName: 'John Doe',
        professionalId: 'doctor-1',
        professionalName: 'Dr. Smith',
        professionalCrm: '12345',
        professionalCrmState: 'SP',
        type: 'common',
        status: 'draft',
        medications: [],
        validityDays: 60,
        prescribedAt: '2025-01-15T10:00:00Z',
        expiresAt: '2025-03-16T10:00:00Z',
        createdAt: '2025-12-21T10:00:00.000Z',
        updatedAt: '2025-12-21T10:00:00.000Z',
      };

      const prescription = toPrescription('presc-1', data);

      expect(prescription.createdAt).toBe('2025-12-21T10:00:00.000Z');
      expect(prescription.updatedAt).toBe('2025-12-21T10:00:00.000Z');
    });

    it('handles optional fields', () => {
      const data = {
        clinicId: 'clinic-1',
        patientId: 'patient-1',
        patientName: 'John Doe',
        professionalId: 'doctor-1',
        professionalName: 'Dr. Smith',
        professionalCrm: '12345',
        professionalCrmState: 'SP',
        type: 'common',
        status: 'draft',
        medications: [],
        validityDays: 60,
        prescribedAt: '2025-01-15T10:00:00Z',
        expiresAt: '2025-03-16T10:00:00Z',
        createdAt: '2025-01-15T10:00:00Z',
        updatedAt: '2025-01-15T10:00:00Z',
        signature: { signedBy: 'Dr. Smith', signedAt: '2025-01-15T11:00:00Z', certificateSerial: 'ABC', signatureHash: 'XYZ' },
        memedPrescriptionId: 'memed-123',
        sncr: { status: 'validated' },
      };

      const prescription = toPrescription('presc-1', data);

      expect(prescription.signature?.signedBy).toBe('Dr. Smith');
      expect(prescription.memedPrescriptionId).toBe('memed-123');
      expect(prescription.sncr?.status).toBe('validated');
    });
  });

  describe('toLogEntry', () => {
    it('converts document data to PrescriptionLogEntry type', () => {
      const data = {
        prescriptionId: 'presc-1',
        eventType: 'created',
        userId: 'user-1',
        userName: 'John Doe',
        details: { action: 'initial creation' },
        timestamp: '2025-01-15T10:00:00Z',
      };

      const log = toLogEntry('log-1', data);

      expect(log.id).toBe('log-1');
      expect(log.prescriptionId).toBe('presc-1');
      expect(log.eventType).toBe('created');
      expect(log.userId).toBe('user-1');
      expect(log.userName).toBe('John Doe');
      expect(log.details).toEqual({ action: 'initial creation' });
    });

    it('handles string timestamp', () => {
      const data = {
        prescriptionId: 'presc-1',
        eventType: 'signed',
        userId: 'user-1',
        userName: 'John Doe',
        timestamp: '2025-12-21T10:00:00.000Z',
      };

      const log = toLogEntry('log-1', data);

      expect(log.timestamp).toBe('2025-12-21T10:00:00.000Z');
    });
  });

  describe('Collection references', () => {
    it('getPrescriptionCollection returns collection reference', () => {
      const ref = getPrescriptionCollection('clinic-1');
      expect(ref).toBe('mocked-collection');
    });

    it('getLogsCollection returns collection reference', () => {
      const ref = getLogsCollection('clinic-1', 'presc-1');
      expect(ref).toBe('mocked-collection');
    });

    it('getPrescriptionDoc returns document reference', () => {
      const ref = getPrescriptionDoc('clinic-1', 'presc-1');
      expect(ref).toBe('mocked-doc');
    });
  });
});
