/**
 * Record Service Tests
 *
 * Tests for Firestore medical record CRUD operations.
 */

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { recordService } from '../../../services/firestore/record.service';
import { RecordType, type CreateSoapRecordInput, type SoapRecord } from '@/types';

describe('recordService', () => {
  const mockClinicId = 'clinic-123';
  const mockRecordId = 'record-456';

  const mockSoapData = {
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all records sorted by date', async () => {
      const mockDocs = [
        {
          id: 'record-1',
          data: () => ({
            ...mockSoapData,
            date: '2025-01-15T09:00:00.000Z',
          }),
        },
        {
          id: 'record-2',
          data: () => ({
            ...mockSoapData,
            date: '2025-01-15T10:00:00.000Z',
          }),
        },
      ];

      (getDocs as Mock).mockResolvedValue({ docs: mockDocs });
      (collection as Mock).mockReturnValue({});
      (query as Mock).mockReturnValue({});

      const records = await recordService.getAll(mockClinicId);

      expect(collection).toHaveBeenCalled();
      expect(query).toHaveBeenCalled();
      expect(getDocs).toHaveBeenCalled();
      expect(records).toHaveLength(2);
    });

    it('should return empty array when no records exist', async () => {
      (getDocs as Mock).mockResolvedValue({ docs: [] });
      (collection as Mock).mockReturnValue({});
      (query as Mock).mockReturnValue({});

      const records = await recordService.getAll(mockClinicId);

      expect(records).toHaveLength(0);
    });
  });

  describe('getByPatient', () => {
    it('should return records for a specific patient', async () => {
      const mockDocs = [
        { id: 'record-1', data: () => mockSoapData },
      ];

      (getDocs as Mock).mockResolvedValue({ docs: mockDocs });
      (collection as Mock).mockReturnValue({});
      (query as Mock).mockReturnValue({});

      const records = await recordService.getByPatient(mockClinicId, 'patient-1');

      expect(query).toHaveBeenCalled();
      expect(records).toHaveLength(1);
    });
  });

  describe('getById', () => {
    it('should return record by id', async () => {
      const mockDocSnap = {
        exists: () => true,
        id: mockRecordId,
        data: () => mockSoapData,
      };

      (doc as Mock).mockReturnValue({});
      (getDoc as Mock).mockResolvedValue(mockDocSnap);

      const record = await recordService.getById(mockClinicId, mockRecordId);

      expect(doc).toHaveBeenCalled();
      expect(getDoc).toHaveBeenCalled();
      expect(record).not.toBeNull();
      expect(record?.type).toBe(RecordType.SOAP);
    });

    it('should return null when record does not exist', async () => {
      const mockDocSnap = { exists: () => false };

      (doc as Mock).mockReturnValue({});
      (getDoc as Mock).mockResolvedValue(mockDocSnap);

      const record = await recordService.getById(mockClinicId, 'nonexistent');

      expect(record).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new record and return id', async () => {
      const mockDocRef = { id: 'new-record-id' };

      (collection as Mock).mockReturnValue({});
      (addDoc as Mock).mockResolvedValue(mockDocRef);

      const recordData: CreateSoapRecordInput = {
        patientId: 'patient-1',
        type: RecordType.SOAP,
        specialty: 'medicina',
        subjective: 'Test',
        objective: 'Test',
        assessment: 'Test',
        plan: 'Test',
      };

      const recordId = await recordService.create(mockClinicId, recordData, 'Dr. Test');

      expect(addDoc).toHaveBeenCalled();
      expect(recordId).toBe('new-record-id');
    });
  });

  describe('update', () => {
    it('should update record fields', async () => {
      (doc as Mock).mockReturnValue({});
      (updateDoc as Mock).mockResolvedValue(undefined);

      await recordService.update(mockClinicId, mockRecordId, {
        specialty: 'nutricao',
      });

      expect(doc).toHaveBeenCalled();
      expect(updateDoc).toHaveBeenCalled();
    });

    it('should remove undefined values before update', async () => {
      (doc as Mock).mockReturnValue({});
      (updateDoc as Mock).mockResolvedValue(undefined);

      await recordService.update(mockClinicId, mockRecordId, {
        specialty: 'psicologia',
        patientId: undefined,
      } as Record<string, unknown>);

      const updateDocCall = (updateDoc as Mock).mock.calls[0];
      expect(updateDocCall[1]).not.toHaveProperty('patientId');
      expect(updateDocCall[1]).toHaveProperty('specialty');
    });
  });

  describe('delete', () => {
    it('should delete record by id', async () => {
      (doc as Mock).mockReturnValue({});
      (deleteDoc as Mock).mockResolvedValue(undefined);

      await recordService.delete(mockClinicId, mockRecordId);

      expect(doc).toHaveBeenCalled();
      expect(deleteDoc).toHaveBeenCalled();
    });
  });

  describe('subscribe', () => {
    it('should subscribe to real-time updates', () => {
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();

      (collection as Mock).mockReturnValue({});
      (query as Mock).mockReturnValue({});
      (onSnapshot as Mock).mockImplementation((_, callback) => {
        callback({
          docs: [{ id: 'record-1', data: () => mockSoapData }],
        });
        return mockUnsubscribe;
      });

      const unsubscribe = recordService.subscribe(mockClinicId, mockCallback);

      expect(onSnapshot).toHaveBeenCalled();
      expect(mockCallback).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });

    it('should handle errors gracefully', () => {
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();

      (collection as Mock).mockReturnValue({});
      (query as Mock).mockReturnValue({});
      (onSnapshot as Mock).mockImplementation((_, __, errorCallback) => {
        errorCallback(new Error('Firestore error'));
        return mockUnsubscribe;
      });

      recordService.subscribe(mockClinicId, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith([]);
    });
  });

  describe('subscribeByPatient', () => {
    it('should subscribe to patient records', () => {
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();

      (collection as Mock).mockReturnValue({});
      (query as Mock).mockReturnValue({});
      (onSnapshot as Mock).mockImplementation((_, callback) => {
        callback({
          docs: [{ id: 'record-1', data: () => mockSoapData }],
        });
        return mockUnsubscribe;
      });

      const unsubscribe = recordService.subscribeByPatient(mockClinicId, 'patient-1', mockCallback);

      expect(onSnapshot).toHaveBeenCalled();
      expect(mockCallback).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });

    it('should handle errors in subscribeByPatient', () => {
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();

      (collection as Mock).mockReturnValue({});
      (query as Mock).mockReturnValue({});
      (onSnapshot as Mock).mockImplementation((_, __, errorCallback) => {
        errorCallback(new Error('Firestore error'));
        return mockUnsubscribe;
      });

      recordService.subscribeByPatient(mockClinicId, 'patient-1', mockCallback);

      expect(mockCallback).toHaveBeenCalledWith([]);
    });
  });

  describe('getByPatientAndType', () => {
    it('should return records of specific type for patient', async () => {
      const mockDocs = [
        { id: 'record-1', data: () => mockSoapData },
      ];

      (getDocs as Mock).mockResolvedValue({ docs: mockDocs });
      (collection as Mock).mockReturnValue({});
      (query as Mock).mockReturnValue({});

      const records = await recordService.getByPatientAndType(
        mockClinicId,
        'patient-1',
        RecordType.SOAP
      );

      expect(query).toHaveBeenCalled();
      expect(records).toHaveLength(1);
    });
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
      expect((record as any).subjective).toBe('S');
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
      expect((record as any).title).toBe('Test Note');
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
      expect((record as any).medications).toHaveLength(1);
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
      expect((record as any).exams).toHaveLength(2);
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
      expect((record as any).mood).toBe('anxious');
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
      expect((record as any).weight).toBe(70);
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
      expect((record as any).title).toBe('Unknown Record');
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
