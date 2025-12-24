/**
 * Telemedicine Service CRUD Tests
 *
 * Tests for getAll, getById, create, getByAppointment, getActiveByPatient.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { CreateTelemedicineSessionInput } from '@/types';

// Mock Firebase - all mocks must be self-contained (hoisted to top)
vi.mock('firebase/firestore', () => {
  class MockTimestamp {
    toDate() {
      return new Date();
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
    onSnapshot: vi.fn(),
    serverTimestamp: vi.fn(() => ({ _serverTimestamp: true })),
    Timestamp: MockTimestamp,
  };
});

vi.mock('@/services/firebase', () => ({
  db: {},
}));

// Import after mocks
import { telemedicineService } from '@/services/firestore/telemedicine.service';
import { getDocs, getDoc, addDoc } from 'firebase/firestore';
import { mockClinicId, mockSessionId, mockAppointmentId, mockSession } from './setup';

describe('telemedicineService - CRUD', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('returns all sessions for a clinic', async () => {
      const mockDocs = [
        { id: 'session-1', data: () => ({ ...mockSession, id: undefined }) },
        { id: 'session-2', data: () => ({ ...mockSession, id: undefined }) },
      ];

      vi.mocked(getDocs).mockResolvedValue({
        docs: mockDocs,
      } as never);

      const sessions = await telemedicineService.getAll(mockClinicId);

      expect(sessions).toHaveLength(2);
      expect(sessions[0].id).toBe('session-1');
      expect(sessions[1].id).toBe('session-2');
    });
  });

  describe('getById', () => {
    it('returns session when found', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: mockSessionId,
        data: () => ({ ...mockSession, id: undefined }),
      } as never);

      const session = await telemedicineService.getById(mockClinicId, mockSessionId);

      expect(session).not.toBeNull();
      expect(session?.id).toBe(mockSessionId);
      expect(session?.patientName).toBe('Maria Silva');
    });

    it('returns null when session not found', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as never);

      const session = await telemedicineService.getById(mockClinicId, 'non-existent');

      expect(session).toBeNull();
    });
  });

  describe('create', () => {
    it('creates a new session with generated room name', async () => {
      const input: CreateTelemedicineSessionInput = {
        appointmentId: mockAppointmentId,
        patientId: 'patient-001',
        patientName: 'Maria Silva',
        professionalId: 'doctor-001',
        professionalName: 'Dr. João',
        scheduledAt: '2025-12-21T10:00:00Z',
      };

      vi.mocked(addDoc).mockResolvedValue({ id: 'new-session-id' } as never);

      const sessionId = await telemedicineService.create(mockClinicId, input);

      expect(sessionId).toBe('new-session-id');
      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          appointmentId: mockAppointmentId,
          patientId: 'patient-001',
          patientName: 'Maria Silva',
          professionalId: 'doctor-001',
          professionalName: 'Dr. João',
          status: 'scheduled',
          participants: [],
          recordingEnabled: false,
        })
      );
    });

    it('generates unique room name with clinic and appointment prefix', async () => {
      const input: CreateTelemedicineSessionInput = {
        appointmentId: 'appt-12345678',
        patientId: 'patient-001',
        patientName: 'Maria Silva',
        professionalId: 'doctor-001',
        professionalName: 'Dr. João',
        scheduledAt: '2025-12-21T10:00:00Z',
      };

      vi.mocked(addDoc).mockResolvedValue({ id: 'new-session-id' } as never);

      await telemedicineService.create('clinic-abcdefgh', input);

      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          roomName: expect.stringContaining('genesis-clinic-a-appt-123'),
        })
      );
    });
  });

  describe('getByAppointment', () => {
    it('returns session when found by appointment ID', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        empty: false,
        docs: [{ id: mockSessionId, data: () => ({ ...mockSession, id: undefined }) }],
      } as never);

      const session = await telemedicineService.getByAppointment(mockClinicId, mockAppointmentId);

      expect(session).not.toBeNull();
      expect(session?.appointmentId).toBe(mockAppointmentId);
    });

    it('returns null when no session found for appointment', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        empty: true,
        docs: [],
      } as never);

      const session = await telemedicineService.getByAppointment(mockClinicId, 'non-existent');

      expect(session).toBeNull();
    });
  });

  describe('getActiveByPatient', () => {
    it('returns active session for patient', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        empty: false,
        docs: [{ id: mockSessionId, data: () => ({ ...mockSession, status: 'waiting' }) }],
      } as never);

      const session = await telemedicineService.getActiveByPatient(mockClinicId, 'patient-001');

      expect(session).not.toBeNull();
      expect(session?.status).toBe('waiting');
    });

    it('returns null when no active session for patient', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        empty: true,
        docs: [],
      } as never);

      const session = await telemedicineService.getActiveByPatient(mockClinicId, 'patient-001');

      expect(session).toBeNull();
    });
  });
});
