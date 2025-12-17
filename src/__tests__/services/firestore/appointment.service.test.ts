/**
 * Appointment Service Tests
 *
 * Tests for Firestore appointment CRUD operations.
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
import { appointmentService } from '../../../services/firestore/appointment.service';
import { Status } from '@/types';

describe('appointmentService', () => {
  const mockClinicId = 'clinic-123';
  const mockAppointmentId = 'apt-456';

  const mockAppointmentData = {
    patientId: 'patient-1',
    patientName: 'Maria Silva',
    date: '2025-01-15T10:00:00.000Z',
    durationMin: 60,
    procedure: 'Consulta',
    status: Status.CONFIRMED,
    professional: 'Dr. Test',
    specialty: 'medicina',
    notes: 'Test notes',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all appointments sorted by date', async () => {
      const mockDocs = [
        {
          id: 'apt-1',
          data: () => ({
            ...mockAppointmentData,
            date: '2025-01-15T09:00:00.000Z',
          }),
        },
        {
          id: 'apt-2',
          data: () => ({
            ...mockAppointmentData,
            date: '2025-01-15T10:00:00.000Z',
          }),
        },
      ];

      (getDocs as Mock).mockResolvedValue({ docs: mockDocs });
      (collection as Mock).mockReturnValue({});
      (query as Mock).mockReturnValue({});

      const appointments = await appointmentService.getAll(mockClinicId);

      expect(collection).toHaveBeenCalled();
      expect(query).toHaveBeenCalled();
      expect(getDocs).toHaveBeenCalled();
      expect(appointments).toHaveLength(2);
      expect(appointments[0].id).toBe('apt-1');
    });

    it('should return empty array when no appointments exist', async () => {
      (getDocs as Mock).mockResolvedValue({ docs: [] });
      (collection as Mock).mockReturnValue({});
      (query as Mock).mockReturnValue({});

      const appointments = await appointmentService.getAll(mockClinicId);

      expect(appointments).toHaveLength(0);
    });
  });

  describe('getByDate', () => {
    it('should return appointments for a specific date', async () => {
      const mockDocs = [
        {
          id: 'apt-1',
          data: () => mockAppointmentData,
        },
      ];

      (getDocs as Mock).mockResolvedValue({ docs: mockDocs });
      (collection as Mock).mockReturnValue({});
      (query as Mock).mockReturnValue({});

      const appointments = await appointmentService.getByDate(mockClinicId, '2025-01-15');

      expect(query).toHaveBeenCalled();
      expect(appointments).toHaveLength(1);
    });

    it('should return empty array when no appointments on date', async () => {
      (getDocs as Mock).mockResolvedValue({ docs: [] });
      (collection as Mock).mockReturnValue({});
      (query as Mock).mockReturnValue({});

      const appointments = await appointmentService.getByDate(mockClinicId, '2025-01-20');

      expect(appointments).toHaveLength(0);
    });
  });

  describe('getByPatient', () => {
    it('should return appointments for a specific patient', async () => {
      const mockDocs = [
        {
          id: 'apt-1',
          data: () => mockAppointmentData,
        },
        {
          id: 'apt-2',
          data: () => ({
            ...mockAppointmentData,
            date: '2025-01-16T10:00:00.000Z',
          }),
        },
      ];

      (getDocs as Mock).mockResolvedValue({ docs: mockDocs });
      (collection as Mock).mockReturnValue({});
      (query as Mock).mockReturnValue({});

      const appointments = await appointmentService.getByPatient(mockClinicId, 'patient-1');

      expect(query).toHaveBeenCalled();
      expect(appointments).toHaveLength(2);
    });

    it('should return empty array when patient has no appointments', async () => {
      (getDocs as Mock).mockResolvedValue({ docs: [] });
      (collection as Mock).mockReturnValue({});
      (query as Mock).mockReturnValue({});

      const appointments = await appointmentService.getByPatient(mockClinicId, 'patient-nonexistent');

      expect(appointments).toHaveLength(0);
    });
  });

  describe('getById', () => {
    it('should return appointment by id', async () => {
      const mockDocSnap = {
        exists: () => true,
        id: mockAppointmentId,
        data: () => mockAppointmentData,
      };

      (doc as Mock).mockReturnValue({});
      (getDoc as Mock).mockResolvedValue(mockDocSnap);

      const appointment = await appointmentService.getById(mockClinicId, mockAppointmentId);

      expect(doc).toHaveBeenCalled();
      expect(getDoc).toHaveBeenCalled();
      expect(appointment).not.toBeNull();
      expect(appointment?.patientName).toBe('Maria Silva');
      expect(appointment?.id).toBe(mockAppointmentId);
    });

    it('should return null when appointment does not exist', async () => {
      const mockDocSnap = {
        exists: () => false,
      };

      (doc as Mock).mockReturnValue({});
      (getDoc as Mock).mockResolvedValue(mockDocSnap);

      const appointment = await appointmentService.getById(mockClinicId, 'nonexistent');

      expect(appointment).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new appointment and return id', async () => {
      const mockDocRef = { id: 'new-apt-id' };

      (collection as Mock).mockReturnValue({});
      (addDoc as Mock).mockResolvedValue(mockDocRef);

      const appointmentId = await appointmentService.create(mockClinicId, {
        patientId: mockAppointmentData.patientId,
        patientName: mockAppointmentData.patientName,
        date: mockAppointmentData.date,
        durationMin: mockAppointmentData.durationMin,
        procedure: mockAppointmentData.procedure,
        status: mockAppointmentData.status,
        professional: mockAppointmentData.professional,
        specialty: mockAppointmentData.specialty as 'medicina',
      });

      expect(addDoc).toHaveBeenCalled();
      expect(appointmentId).toBe('new-apt-id');
    });

    it('should include createdAt timestamp', async () => {
      const mockDocRef = { id: 'new-apt-id' };

      (collection as Mock).mockReturnValue({});
      (addDoc as Mock).mockResolvedValue(mockDocRef);

      await appointmentService.create(mockClinicId, {
        patientId: mockAppointmentData.patientId,
        patientName: mockAppointmentData.patientName,
        date: mockAppointmentData.date,
        durationMin: mockAppointmentData.durationMin,
        procedure: mockAppointmentData.procedure,
        status: mockAppointmentData.status,
        professional: mockAppointmentData.professional,
        specialty: mockAppointmentData.specialty as 'medicina',
      });

      const addDocCall = (addDoc as Mock).mock.calls[0];
      expect(addDocCall[1]).toHaveProperty('createdAt');
    });

    it('should handle notes as null when not provided', async () => {
      const mockDocRef = { id: 'new-apt-id' };

      (collection as Mock).mockReturnValue({});
      (addDoc as Mock).mockResolvedValue(mockDocRef);

      await appointmentService.create(mockClinicId, {
        patientId: mockAppointmentData.patientId,
        patientName: mockAppointmentData.patientName,
        date: mockAppointmentData.date,
        durationMin: mockAppointmentData.durationMin,
        procedure: mockAppointmentData.procedure,
        status: mockAppointmentData.status,
        professional: mockAppointmentData.professional,
        specialty: mockAppointmentData.specialty as 'medicina',
      });

      const addDocCall = (addDoc as Mock).mock.calls[0];
      expect(addDocCall[1].notes).toBeNull();
    });
  });

  describe('update', () => {
    it('should update appointment fields', async () => {
      (doc as Mock).mockReturnValue({});
      (updateDoc as Mock).mockResolvedValue(undefined);

      await appointmentService.update(mockClinicId, mockAppointmentId, {
        procedure: 'Updated Procedure',
        durationMin: 45,
      });

      expect(doc).toHaveBeenCalled();
      expect(updateDoc).toHaveBeenCalled();
    });

    it('should remove undefined values before update', async () => {
      (doc as Mock).mockReturnValue({});
      (updateDoc as Mock).mockResolvedValue(undefined);

      await appointmentService.update(mockClinicId, mockAppointmentId, {
        procedure: 'New Procedure',
        notes: undefined,
      });

      const updateDocCall = (updateDoc as Mock).mock.calls[0];
      expect(updateDocCall[1]).not.toHaveProperty('notes');
      expect(updateDocCall[1]).toHaveProperty('procedure');
    });
  });

  describe('updateStatus', () => {
    it('should update appointment status', async () => {
      (doc as Mock).mockReturnValue({});
      (updateDoc as Mock).mockResolvedValue(undefined);

      await appointmentService.updateStatus(mockClinicId, mockAppointmentId, Status.FINISHED);

      expect(doc).toHaveBeenCalled();
      expect(updateDoc).toHaveBeenCalled();
      const updateDocCall = (updateDoc as Mock).mock.calls[0];
      expect(updateDocCall[1]).toEqual({ status: Status.FINISHED });
    });
  });

  describe('delete', () => {
    it('should delete appointment by id', async () => {
      (doc as Mock).mockReturnValue({});
      (deleteDoc as Mock).mockResolvedValue(undefined);

      await appointmentService.delete(mockClinicId, mockAppointmentId);

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
              id: 'apt-1',
              data: () => mockAppointmentData,
            },
          ],
        });
        return mockUnsubscribe;
      });

      const unsubscribe = appointmentService.subscribe(mockClinicId, mockCallback);

      expect(onSnapshot).toHaveBeenCalled();
      expect(mockCallback).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ patientName: 'Maria Silva' })])
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

      appointmentService.subscribe(mockClinicId, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith([]);
    });
  });

  describe('subscribeByDate', () => {
    it('should subscribe to appointments for a specific date', () => {
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();

      (collection as Mock).mockReturnValue({});
      (query as Mock).mockReturnValue({});
      (onSnapshot as Mock).mockImplementation((_, callback) => {
        callback({
          docs: [
            {
              id: 'apt-1',
              data: () => mockAppointmentData,
            },
          ],
        });
        return mockUnsubscribe;
      });

      const unsubscribe = appointmentService.subscribeByDate(mockClinicId, '2025-01-15', mockCallback);

      expect(onSnapshot).toHaveBeenCalled();
      expect(mockCallback).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });

    it('should handle errors in subscribeByDate', () => {
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();

      (collection as Mock).mockReturnValue({});
      (query as Mock).mockReturnValue({});
      (onSnapshot as Mock).mockImplementation((_, __, errorCallback) => {
        errorCallback(new Error('Firestore error'));
        return mockUnsubscribe;
      });

      appointmentService.subscribeByDate(mockClinicId, '2025-01-15', mockCallback);

      expect(mockCallback).toHaveBeenCalledWith([]);
    });
  });

  describe('subscribeByPatient', () => {
    it('should subscribe to appointments for a specific patient', () => {
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();

      (collection as Mock).mockReturnValue({});
      (query as Mock).mockReturnValue({});
      (onSnapshot as Mock).mockImplementation((_, callback) => {
        callback({
          docs: [
            {
              id: 'apt-1',
              data: () => mockAppointmentData,
            },
          ],
        });
        return mockUnsubscribe;
      });

      const unsubscribe = appointmentService.subscribeByPatient(mockClinicId, 'patient-1', mockCallback);

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

      appointmentService.subscribeByPatient(mockClinicId, 'patient-1', mockCallback);

      expect(mockCallback).toHaveBeenCalledWith([]);
    });
  });

  describe('toAppointment conversion', () => {
    it('should correctly convert document data to Appointment type', async () => {
      const mockDocSnap = {
        exists: () => true,
        id: mockAppointmentId,
        data: () => ({
          patientId: 'patient-1',
          patientName: 'Test Patient',
          date: '2025-01-15T10:00:00.000Z',
          durationMin: 30,
          procedure: 'Procedure',
          status: Status.PENDING,
          professional: 'Doctor',
          specialty: 'nutricao',
          notes: 'Some notes',
        }),
      };

      (doc as Mock).mockReturnValue({});
      (getDoc as Mock).mockResolvedValue(mockDocSnap);

      const appointment = await appointmentService.getById(mockClinicId, mockAppointmentId);

      expect(appointment).toEqual({
        id: mockAppointmentId,
        patientId: 'patient-1',
        patientName: 'Test Patient',
        date: '2025-01-15T10:00:00.000Z',
        durationMin: 30,
        procedure: 'Procedure',
        status: Status.PENDING,
        professional: 'Doctor',
        specialty: 'nutricao',
        notes: 'Some notes',
      });
    });
  });
});
