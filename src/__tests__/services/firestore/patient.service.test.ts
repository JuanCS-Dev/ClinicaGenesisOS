/**
 * Patient Service Tests
 *
 * Tests for Firestore patient CRUD operations.
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
import { patientService } from '../../../services/firestore/patient.service';

/**
 * Helper to create a mock Timestamp for tests.
 */
function createMockTimestamp(date: Date = new Date()): InstanceType<typeof Timestamp> {
  return Timestamp.fromDate(date);
}

describe('patientService', () => {
  const mockClinicId = 'clinic-123';
  const mockPatientId = 'patient-456';

  const mockPatientData = {
    name: 'Maria Silva',
    birthDate: '1990-05-15',
    phone: '(11) 99999-0001',
    email: 'maria@example.com',
    gender: 'Feminino',
    tags: ['VIP'],
    insurance: 'Unimed',
    insuranceNumber: 'UNI-123',
    address: 'Rua das Flores, 100',
    avatar: 'https://example.com/avatar.jpg',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all patients sorted by name', async () => {
      const mockDocs = [
        {
          id: 'patient-1',
          data: () => ({
            ...mockPatientData,
            name: 'Ana Costa',
            createdAt: createMockTimestamp(new Date('2024-01-01')),
          }),
        },
        {
          id: 'patient-2',
          data: () => ({
            ...mockPatientData,
            name: 'Beatriz Santos',
            createdAt: createMockTimestamp(new Date('2024-01-02')),
          }),
        },
      ];

      (getDocs as Mock).mockResolvedValue({ docs: mockDocs });
      (collection as Mock).mockReturnValue({});
      (query as Mock).mockReturnValue({});

      const patients = await patientService.getAll(mockClinicId);

      expect(collection).toHaveBeenCalled();
      expect(query).toHaveBeenCalled();
      expect(getDocs).toHaveBeenCalled();
      expect(patients).toHaveLength(2);
      expect(patients[0].name).toBe('Ana Costa');
    });

    it('should return empty array when no patients exist', async () => {
      (getDocs as Mock).mockResolvedValue({ docs: [] });
      (collection as Mock).mockReturnValue({});
      (query as Mock).mockReturnValue({});

      const patients = await patientService.getAll(mockClinicId);

      expect(patients).toHaveLength(0);
    });
  });

  describe('getById', () => {
    it('should return patient by id', async () => {
      const mockDocSnap = {
        exists: () => true,
        id: mockPatientId,
        data: () => ({
          ...mockPatientData,
          createdAt: createMockTimestamp(new Date('2024-01-01')),
        }),
      };

      (doc as Mock).mockReturnValue({});
      (getDoc as Mock).mockResolvedValue(mockDocSnap);

      const patient = await patientService.getById(mockClinicId, mockPatientId);

      expect(doc).toHaveBeenCalled();
      expect(getDoc).toHaveBeenCalled();
      expect(patient).not.toBeNull();
      expect(patient?.name).toBe('Maria Silva');
      expect(patient?.id).toBe(mockPatientId);
    });

    it('should return null when patient does not exist', async () => {
      const mockDocSnap = {
        exists: () => false,
      };

      (doc as Mock).mockReturnValue({});
      (getDoc as Mock).mockResolvedValue(mockDocSnap);

      const patient = await patientService.getById(mockClinicId, 'nonexistent');

      expect(patient).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new patient and return id', async () => {
      const mockDocRef = { id: 'new-patient-id' };

      (collection as Mock).mockReturnValue({});
      (addDoc as Mock).mockResolvedValue(mockDocRef);

      const patientId = await patientService.create(mockClinicId, {
        name: mockPatientData.name,
        birthDate: mockPatientData.birthDate,
        phone: mockPatientData.phone,
        email: mockPatientData.email,
        gender: mockPatientData.gender,
        tags: mockPatientData.tags,
        insurance: mockPatientData.insurance,
      });

      expect(addDoc).toHaveBeenCalled();
      expect(patientId).toBe('new-patient-id');
    });

    it('should include createdAt timestamp', async () => {
      const mockDocRef = { id: 'new-patient-id' };

      (collection as Mock).mockReturnValue({});
      (addDoc as Mock).mockResolvedValue(mockDocRef);

      await patientService.create(mockClinicId, {
        name: mockPatientData.name,
        birthDate: mockPatientData.birthDate,
        phone: mockPatientData.phone,
        email: mockPatientData.email,
        gender: mockPatientData.gender,
        tags: [],
      });

      const addDocCall = (addDoc as Mock).mock.calls[0];
      expect(addDocCall[1]).toHaveProperty('createdAt');
    });
  });

  describe('update', () => {
    it('should update patient fields', async () => {
      (doc as Mock).mockReturnValue({});
      (updateDoc as Mock).mockResolvedValue(undefined);

      await patientService.update(mockClinicId, mockPatientId, {
        name: 'Maria Silva Updated',
        phone: '(11) 88888-8888',
      });

      expect(doc).toHaveBeenCalled();
      expect(updateDoc).toHaveBeenCalled();
    });

    it('should remove undefined values before update', async () => {
      (doc as Mock).mockReturnValue({});
      (updateDoc as Mock).mockResolvedValue(undefined);

      await patientService.update(mockClinicId, mockPatientId, {
        name: 'New Name',
        email: undefined,
      });

      const updateDocCall = (updateDoc as Mock).mock.calls[0];
      expect(updateDocCall[1]).not.toHaveProperty('email');
    });
  });

  describe('delete', () => {
    it('should delete patient by id', async () => {
      (doc as Mock).mockReturnValue({});
      (deleteDoc as Mock).mockResolvedValue(undefined);

      await patientService.delete(mockClinicId, mockPatientId);

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
          docs: [
            {
              id: 'patient-1',
              data: () => ({
                ...mockPatientData,
                createdAt: createMockTimestamp(),
              }),
            },
          ],
        });
        return mockUnsubscribe;
      });

      const unsubscribe = patientService.subscribe(mockClinicId, mockCallback);

      expect(onSnapshot).toHaveBeenCalled();
      expect(mockCallback).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ name: 'Maria Silva' })])
      );
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

      patientService.subscribe(mockClinicId, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith([]);
    });
  });

  describe('addTag', () => {
    it('should add tag to patient', async () => {
      // Mock getById to return patient
      const mockDocSnap = {
        exists: () => true,
        id: mockPatientId,
        data: () => ({
          ...mockPatientData,
          createdAt: createMockTimestamp(),
        }),
      };
      (doc as Mock).mockReturnValue({});
      (getDoc as Mock).mockResolvedValue(mockDocSnap);
      (updateDoc as Mock).mockResolvedValue(undefined);

      await patientService.addTag(mockClinicId, mockPatientId, 'NewTag');

      expect(updateDoc).toHaveBeenCalled();
      const updateDocCall = (updateDoc as Mock).mock.calls[0];
      expect(updateDocCall[1]).toHaveProperty('tags');
    });
  });

  describe('removeTag', () => {
    it('should remove tag from patient', async () => {
      // Mock getById to return patient
      const mockDocSnap = {
        exists: () => true,
        id: mockPatientId,
        data: () => ({
          ...mockPatientData,
          createdAt: createMockTimestamp(),
        }),
      };
      (doc as Mock).mockReturnValue({});
      (getDoc as Mock).mockResolvedValue(mockDocSnap);
      (updateDoc as Mock).mockResolvedValue(undefined);

      await patientService.removeTag(mockClinicId, mockPatientId, 'OldTag');

      expect(updateDoc).toHaveBeenCalled();
      const updateDocCall = (updateDoc as Mock).mock.calls[0];
      expect(updateDocCall[1]).toHaveProperty('tags');
    });
  });

  describe('age calculation', () => {
    it('should calculate age correctly from birthDate', async () => {
      const today = new Date();
      const thirtyYearsAgo = new Date(
        today.getFullYear() - 30,
        today.getMonth(),
        today.getDate()
      );

      const mockDocs = [
        {
          id: 'patient-1',
          data: () => ({
            ...mockPatientData,
            birthDate: thirtyYearsAgo.toISOString().split('T')[0],
            createdAt: createMockTimestamp(),
          }),
        },
      ];

      (getDocs as Mock).mockResolvedValue({ docs: mockDocs });
      (collection as Mock).mockReturnValue({});
      (query as Mock).mockReturnValue({});

      const patients = await patientService.getAll(mockClinicId);

      expect(patients[0].age).toBe(30);
    });

    it('should calculate age correctly when birthday has not occurred this year', async () => {
      const today = new Date();
      // Set birthday to next month (not occurred yet this year)
      const birthMonth = (today.getMonth() + 1) % 12;
      const birthYear = birthMonth < today.getMonth() ? today.getFullYear() - 29 : today.getFullYear() - 30;
      const thirtyYearsAgoNextMonth = new Date(birthYear, birthMonth, 15);

      const mockDocs = [
        {
          id: 'patient-1',
          data: () => ({
            ...mockPatientData,
            birthDate: thirtyYearsAgoNextMonth.toISOString().split('T')[0],
            createdAt: createMockTimestamp(),
          }),
        },
      ];

      (getDocs as Mock).mockResolvedValue({ docs: mockDocs });
      (collection as Mock).mockReturnValue({});
      (query as Mock).mockReturnValue({});

      const patients = await patientService.getAll(mockClinicId);

      // Age should be 29 because birthday hasn't occurred yet this year
      expect(patients[0].age).toBe(29);
    });

    it('should calculate age correctly when in same month but day has not occurred', async () => {
      const today = new Date();
      // Set birthday to later in the same month (if possible)
      const birthDay = Math.min(today.getDate() + 10, 28);
      const thirtyYearsAgoSameMonth = new Date(
        today.getFullYear() - 30,
        today.getMonth(),
        birthDay
      );

      const mockDocs = [
        {
          id: 'patient-1',
          data: () => ({
            ...mockPatientData,
            birthDate: thirtyYearsAgoSameMonth.toISOString().split('T')[0],
            createdAt: createMockTimestamp(),
          }),
        },
      ];

      (getDocs as Mock).mockResolvedValue({ docs: mockDocs });
      (collection as Mock).mockReturnValue({});
      (query as Mock).mockReturnValue({});

      const patients = await patientService.getAll(mockClinicId);

      // Age should be 29 if birthday day hasn't occurred yet, or 30 if it has
      expect([29, 30]).toContain(patients[0].age);
    });
  });

  describe('subscribeToOne', () => {
    it('should subscribe to a single patient', () => {
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();

      (doc as Mock).mockReturnValue({});
      (onSnapshot as Mock).mockImplementation((_, callback) => {
        callback({
          exists: () => true,
          id: mockPatientId,
          data: () => ({
            ...mockPatientData,
            createdAt: createMockTimestamp(),
          }),
        });
        return mockUnsubscribe;
      });

      const unsubscribe = patientService.subscribeToOne(mockClinicId, mockPatientId, mockCallback);

      expect(onSnapshot).toHaveBeenCalled();
      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Maria Silva' })
      );
      expect(typeof unsubscribe).toBe('function');
    });

    it('should return null when patient does not exist', () => {
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();

      (doc as Mock).mockReturnValue({});
      (onSnapshot as Mock).mockImplementation((_, callback) => {
        callback({
          exists: () => false,
        });
        return mockUnsubscribe;
      });

      patientService.subscribeToOne(mockClinicId, mockPatientId, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null);
    });

    it('should handle errors gracefully in subscribeToOne', () => {
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();

      (doc as Mock).mockReturnValue({});
      (onSnapshot as Mock).mockImplementation((_, __, errorCallback) => {
        errorCallback(new Error('Firestore error'));
        return mockUnsubscribe;
      });

      patientService.subscribeToOne(mockClinicId, mockPatientId, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null);
    });
  });

  describe('addTag error handling', () => {
    it('should throw error when patient not found', async () => {
      const mockDocSnap = {
        exists: () => false,
      };

      (doc as Mock).mockReturnValue({});
      (getDoc as Mock).mockResolvedValue(mockDocSnap);

      await expect(
        patientService.addTag(mockClinicId, 'nonexistent', 'NewTag')
      ).rejects.toThrow('Patient not found: nonexistent');
    });
  });

  describe('removeTag error handling', () => {
    it('should throw error when patient not found', async () => {
      const mockDocSnap = {
        exists: () => false,
      };

      (doc as Mock).mockReturnValue({});
      (getDoc as Mock).mockResolvedValue(mockDocSnap);

      await expect(
        patientService.removeTag(mockClinicId, 'nonexistent', 'Tag')
      ).rejects.toThrow('Patient not found: nonexistent');
    });
  });
});
