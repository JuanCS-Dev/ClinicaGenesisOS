/**
 * Record Service CRUD Tests
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
} from 'firebase/firestore';
import { recordService } from '@/services/firestore/record.service';
import { RecordType, type CreateSoapRecordInput } from '@/types';
import { mockClinicId, mockRecordId, mockSoapData } from './setup';

describe('recordService - CRUD', () => {
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
      const mockDocs = [{ id: 'record-1', data: () => mockSoapData }];

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
    it('should update record fields with versioning', async () => {
      (getDoc as Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ ...mockSoapData, version: 1 }),
      });
      (doc as Mock).mockReturnValue({});
      (collection as Mock).mockReturnValue({});
      (addDoc as Mock).mockResolvedValue({ id: 'version-1' });
      (updateDoc as Mock).mockResolvedValue(undefined);

      await recordService.update(mockClinicId, mockRecordId, {
        specialty: 'nutricao',
      });

      expect(getDoc).toHaveBeenCalled();
      expect(addDoc).toHaveBeenCalled();
      expect(updateDoc).toHaveBeenCalled();

      const updateDocCall = (updateDoc as Mock).mock.calls[0];
      expect(updateDocCall[1]).toHaveProperty('version', 2);
    });

    it('should remove undefined values before update', async () => {
      (getDoc as Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ ...mockSoapData, version: 1 }),
      });
      (doc as Mock).mockReturnValue({});
      (collection as Mock).mockReturnValue({});
      (addDoc as Mock).mockResolvedValue({ id: 'version-1' });
      (updateDoc as Mock).mockResolvedValue(undefined);

      await recordService.update(mockClinicId, mockRecordId, {
        specialty: 'psicologia',
        patientId: undefined,
      } as Record<string, unknown>);

      const updateDocCall = (updateDoc as Mock).mock.calls[0];
      expect(updateDocCall[1]).not.toHaveProperty('patientId');
      expect(updateDocCall[1]).toHaveProperty('specialty');
    });

    it('should throw error if record not found', async () => {
      (getDoc as Mock).mockResolvedValue({
        exists: () => false,
      });
      (doc as Mock).mockReturnValue({});

      await expect(
        recordService.update(mockClinicId, mockRecordId, { specialty: 'nutricao' })
      ).rejects.toThrow('Record not found');
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
      const mockDocs = [{ id: 'record-1', data: () => mockSoapData }];

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
});
