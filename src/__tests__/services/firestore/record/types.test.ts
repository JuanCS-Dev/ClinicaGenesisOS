/**
 * Record Service Type Conversion Tests
 *
 * Tests for polymorphic record type conversion.
 */

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { recordService } from '@/services/firestore/record.service';
import type {
  SoapRecord,
  TextRecord,
  PrescriptionRecord,
  ExamRequestRecord,
  PsychoSessionRecord,
  AnthropometryRecord,
} from '@/types';
import { mockClinicId, mockRecordId, mockSoapData } from './setup';

describe('recordService - Type Conversion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('toRecord conversion - polymorphic types', () => {
    it('should convert SOAP record correctly', async () => {
      const soapData = {
        patientId: 'patient-1',
        date: '2025-01-15T10:00:00.000Z',
        professional: 'Dr. Test',
        type: 'soap',
        specialty: 'medicina',
        subjective: 'S',
        objective: 'O',
        assessment: 'A',
        plan: 'P',
      };

      const mockDocSnap = {
        exists: () => true,
        id: mockRecordId,
        data: () => soapData,
      };

      (doc as Mock).mockReturnValue({});
      (getDoc as Mock).mockResolvedValue(mockDocSnap);

      const record = await recordService.getById(mockClinicId, mockRecordId);

      expect(record?.type).toBe('soap');
      expect((record as SoapRecord).subjective).toBe('S');
    });

    it('should convert note record correctly', async () => {
      const noteData = {
        patientId: 'patient-1',
        date: '2025-01-15T10:00:00.000Z',
        professional: 'Dr. Test',
        type: 'note',
        specialty: 'medicina',
        title: 'Test Note',
        content: 'Note content',
      };

      const mockDocSnap = {
        exists: () => true,
        id: mockRecordId,
        data: () => noteData,
      };

      (doc as Mock).mockReturnValue({});
      (getDoc as Mock).mockResolvedValue(mockDocSnap);

      const record = await recordService.getById(mockClinicId, mockRecordId);

      expect(record?.type).toBe('note');
      expect((record as TextRecord).title).toBe('Test Note');
    });

    it('should convert prescription record correctly', async () => {
      const prescriptionData = {
        patientId: 'patient-1',
        date: '2025-01-15T10:00:00.000Z',
        professional: 'Dr. Test',
        type: 'prescription',
        specialty: 'medicina',
        medications: [{ name: 'Test Med', dosage: '10mg' }],
      };

      const mockDocSnap = {
        exists: () => true,
        id: mockRecordId,
        data: () => prescriptionData,
      };

      (doc as Mock).mockReturnValue({});
      (getDoc as Mock).mockResolvedValue(mockDocSnap);

      const record = await recordService.getById(mockClinicId, mockRecordId);

      expect(record?.type).toBe('prescription');
      expect((record as PrescriptionRecord).medications).toHaveLength(1);
    });

    it('should convert exam_request record correctly', async () => {
      const examData = {
        patientId: 'patient-1',
        date: '2025-01-15T10:00:00.000Z',
        professional: 'Dr. Test',
        type: 'exam_request',
        specialty: 'medicina',
        exams: ['Blood test', 'X-ray'],
        justification: 'Routine checkup',
      };

      const mockDocSnap = {
        exists: () => true,
        id: mockRecordId,
        data: () => examData,
      };

      (doc as Mock).mockReturnValue({});
      (getDoc as Mock).mockResolvedValue(mockDocSnap);

      const record = await recordService.getById(mockClinicId, mockRecordId);

      expect(record?.type).toBe('exam_request');
      expect((record as ExamRequestRecord).exams).toHaveLength(2);
    });

    it('should convert psycho_session record correctly', async () => {
      const psychoData = {
        patientId: 'patient-1',
        date: '2025-01-15T10:00:00.000Z',
        professional: 'Dr. Test',
        type: 'psycho_session',
        specialty: 'psicologia',
        mood: 'anxious',
        summary: 'Session summary',
        privateNotes: 'Private notes',
      };

      const mockDocSnap = {
        exists: () => true,
        id: mockRecordId,
        data: () => psychoData,
      };

      (doc as Mock).mockReturnValue({});
      (getDoc as Mock).mockResolvedValue(mockDocSnap);

      const record = await recordService.getById(mockClinicId, mockRecordId);

      expect(record?.type).toBe('psycho_session');
      expect((record as PsychoSessionRecord).mood).toBe('anxious');
    });

    it('should convert anthropometry record correctly', async () => {
      const anthropometryData = {
        patientId: 'patient-1',
        date: '2025-01-15T10:00:00.000Z',
        professional: 'Dr. Test',
        type: 'anthropometry',
        specialty: 'nutricao',
        weight: 70,
        height: 175,
        imc: 22.86,
        waist: 80,
        hip: 95,
      };

      const mockDocSnap = {
        exists: () => true,
        id: mockRecordId,
        data: () => anthropometryData,
      };

      (doc as Mock).mockReturnValue({});
      (getDoc as Mock).mockResolvedValue(mockDocSnap);

      const record = await recordService.getById(mockClinicId, mockRecordId);

      expect(record?.type).toBe('anthropometry');
      expect((record as AnthropometryRecord).weight).toBe(70);
    });

    it('should handle unknown record type as note', async () => {
      const unknownData = {
        patientId: 'patient-1',
        date: '2025-01-15T10:00:00.000Z',
        professional: 'Dr. Test',
        type: 'unknown_type',
        specialty: 'medicina',
        customField: 'custom value',
      };

      const mockDocSnap = {
        exists: () => true,
        id: mockRecordId,
        data: () => unknownData,
      };

      (doc as Mock).mockReturnValue({});
      (getDoc as Mock).mockResolvedValue(mockDocSnap);

      const record = await recordService.getById(mockClinicId, mockRecordId);

      expect(record?.type).toBe('note');
      expect((record as TextRecord).title).toBe('Unknown Record');
    });

    it('should handle Timestamp date conversion', async () => {
      const mockTimestamp = Timestamp.fromDate(new Date('2025-01-15T10:00:00.000Z'));
      const dataWithTimestamp = {
        ...mockSoapData,
        date: mockTimestamp,
      };

      const mockDocSnap = {
        exists: () => true,
        id: mockRecordId,
        data: () => dataWithTimestamp,
      };

      (doc as Mock).mockReturnValue({});
      (getDoc as Mock).mockResolvedValue(mockDocSnap);

      const record = await recordService.getById(mockClinicId, mockRecordId);

      expect(record?.date).toBe('2025-01-15T10:00:00.000Z');
    });
  });
});
