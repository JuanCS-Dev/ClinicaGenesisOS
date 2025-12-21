/**
 * Telemedicine Service Tests
 *
 * Tests for the telemedicine Firestore service.
 * Uses mocked Firebase to test CRUD operations.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { TelemedicineSession, CreateTelemedicineSessionInput } from '@/types';

// Mock Firebase - all mocks must be self-contained (hoisted to top)
vi.mock('firebase/firestore', () => {
  // Create a mock Timestamp class inside factory
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
import { getDocs, getDoc, addDoc, updateDoc, onSnapshot } from 'firebase/firestore';

describe('telemedicineService', () => {
  const mockClinicId = 'clinic-123';
  const mockSessionId = 'session-456';
  const mockAppointmentId = 'appointment-789';

  const mockSession: TelemedicineSession = {
    id: mockSessionId,
    appointmentId: mockAppointmentId,
    patientId: 'patient-001',
    patientName: 'Maria Silva',
    professionalId: 'doctor-001',
    professionalName: 'Dr. João',
    roomName: 'genesis-clinic-123-session-456-12345-abc123',
    status: 'scheduled',
    participants: [],
    scheduledAt: '2025-12-21T10:00:00Z',
    createdAt: '2025-12-20T10:00:00Z',
    updatedAt: '2025-12-20T10:00:00Z',
  };

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

  describe('updateStatus', () => {
    it('updates session status', async () => {
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      await telemedicineService.updateStatus(mockClinicId, mockSessionId, 'in_progress');

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'in_progress',
        })
      );
    });

    it('sets startedAt when status changes to in_progress', async () => {
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      await telemedicineService.updateStatus(mockClinicId, mockSessionId, 'in_progress');

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'in_progress',
          startedAt: expect.any(String),
        })
      );
    });

    it('sets endedAt when status changes to completed', async () => {
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      await telemedicineService.updateStatus(mockClinicId, mockSessionId, 'completed');

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'completed',
          endedAt: expect.any(String),
        })
      );
    });
  });

  describe('subscribe', () => {
    it('sets up real-time listener for a session', () => {
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();

      vi.mocked(onSnapshot).mockReturnValue(mockUnsubscribe);

      const unsubscribe = telemedicineService.subscribe(
        mockClinicId,
        mockSessionId,
        mockCallback
      );

      expect(onSnapshot).toHaveBeenCalled();
      expect(unsubscribe).toBe(mockUnsubscribe);
    });
  });

  describe('addParticipant', () => {
    it('adds new participant to session', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: mockSessionId,
        data: () => ({
          ...mockSession,
          participants: [],
        }),
      } as never);
      vi.mocked(updateDoc).mockResolvedValue(undefined);
      vi.mocked(addDoc).mockResolvedValue({ id: 'log-id' } as never);

      await telemedicineService.addParticipant(mockClinicId, mockSessionId, {
        id: 'patient-001',
        displayName: 'Maria Silva',
        role: 'patient',
      });

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          participants: expect.arrayContaining([
            expect.objectContaining({
              id: 'patient-001',
              displayName: 'Maria Silva',
              role: 'patient',
              joinedAt: expect.any(String),
            }),
          ]),
        })
      );
    });

    it('throws error when session not found', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as never);

      await expect(
        telemedicineService.addParticipant(mockClinicId, 'non-existent', {
          id: 'patient-001',
          displayName: 'Maria',
          role: 'patient',
        })
      ).rejects.toThrow('Session not found');
    });
  });

  describe('endSession', () => {
    it('calculates duration and updates status', async () => {
      const startedAt = new Date(Date.now() - 30 * 60 * 1000).toISOString(); // 30 minutes ago

      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: mockSessionId,
        data: () => ({
          ...mockSession,
          status: 'in_progress',
          startedAt,
          participants: [
            { id: 'doctor-001', displayName: 'Dr. João', role: 'professional' },
            { id: 'patient-001', displayName: 'Maria', role: 'patient' },
          ],
        }),
      } as never);
      vi.mocked(updateDoc).mockResolvedValue(undefined);
      vi.mocked(addDoc).mockResolvedValue({ id: 'log-id' } as never);

      await telemedicineService.endSession(mockClinicId, mockSessionId, 'doctor-001');

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'completed',
          endedAt: expect.any(String),
          durationSeconds: expect.any(Number),
        })
      );
    });

    it('marks all participants as left', async () => {
      const startedAt = new Date(Date.now() - 10 * 60 * 1000).toISOString();

      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: mockSessionId,
        data: () => ({
          ...mockSession,
          startedAt,
          participants: [
            { id: 'doctor-001', displayName: 'Dr. João', role: 'professional', joinedAt: startedAt },
            { id: 'patient-001', displayName: 'Maria', role: 'patient', joinedAt: startedAt },
          ],
        }),
      } as never);
      vi.mocked(updateDoc).mockResolvedValue(undefined);
      vi.mocked(addDoc).mockResolvedValue({ id: 'log-id' } as never);

      await telemedicineService.endSession(mockClinicId, mockSessionId, 'doctor-001');

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          participants: expect.arrayContaining([
            expect.objectContaining({ leftAt: expect.any(String) }),
            expect.objectContaining({ leftAt: expect.any(String) }),
          ]),
        })
      );
    });

    it('throws error when session not found', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as never);

      await expect(
        telemedicineService.endSession(mockClinicId, 'non-existent', 'doctor-001')
      ).rejects.toThrow('Session not found');
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

  describe('removeParticipant', () => {
    it('marks participant as left', async () => {
      const joinedAt = new Date().toISOString();
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: mockSessionId,
        data: () => ({
          ...mockSession,
          participants: [
            { id: 'doctor-001', displayName: 'Dr. João', role: 'professional', joinedAt },
            { id: 'patient-001', displayName: 'Maria', role: 'patient', joinedAt },
          ],
        }),
      } as never);
      vi.mocked(updateDoc).mockResolvedValue(undefined);
      vi.mocked(addDoc).mockResolvedValue({ id: 'log-id' } as never);

      await telemedicineService.removeParticipant(mockClinicId, mockSessionId, 'patient-001');

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          participants: expect.arrayContaining([
            expect.objectContaining({ id: 'patient-001', leftAt: expect.any(String) }),
          ]),
        })
      );
    });

    it('throws error when session not found', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as never);

      await expect(
        telemedicineService.removeParticipant(mockClinicId, 'non-existent', 'patient-001')
      ).rejects.toThrow('Session not found');
    });
  });

  describe('addNotes', () => {
    it('updates session with notes', async () => {
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      await telemedicineService.addNotes(mockClinicId, mockSessionId, 'Paciente relatou melhora');

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          notes: 'Paciente relatou melhora',
        })
      );
    });
  });

  describe('reportTechnicalIssue', () => {
    it('adds technical issue to session', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: mockSessionId,
        data: () => ({
          ...mockSession,
          technicalIssues: ['Issue anterior'],
        }),
      } as never);
      vi.mocked(updateDoc).mockResolvedValue(undefined);
      vi.mocked(addDoc).mockResolvedValue({ id: 'log-id' } as never);

      await telemedicineService.reportTechnicalIssue(
        mockClinicId,
        mockSessionId,
        'Áudio falhou',
        'doctor-001'
      );

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          technicalIssues: ['Issue anterior', 'Áudio falhou'],
        })
      );
    });

    it('creates new technical issues array if none exists', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: mockSessionId,
        data: () => ({
          ...mockSession,
          technicalIssues: undefined,
        }),
      } as never);
      vi.mocked(updateDoc).mockResolvedValue(undefined);
      vi.mocked(addDoc).mockResolvedValue({ id: 'log-id' } as never);

      await telemedicineService.reportTechnicalIssue(
        mockClinicId,
        mockSessionId,
        'Vídeo travou',
        'patient-001'
      );

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          technicalIssues: ['Vídeo travou'],
        })
      );
    });

    it('throws error when session not found', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as never);

      await expect(
        telemedicineService.reportTechnicalIssue(mockClinicId, 'non-existent', 'Issue', 'user-001')
      ).rejects.toThrow('Session not found');
    });
  });

  describe('getLogs', () => {
    it('returns all logs for a session', async () => {
      const mockLogs = [
        {
          id: 'log-1',
          data: () => ({
            sessionId: mockSessionId,
            eventType: 'session_created',
            userId: 'doctor-001',
            timestamp: '2025-12-21T10:00:00Z',
          }),
        },
        {
          id: 'log-2',
          data: () => ({
            sessionId: mockSessionId,
            eventType: 'participant_joined',
            userId: 'patient-001',
            timestamp: '2025-12-21T10:01:00Z',
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValue({
        docs: mockLogs,
      } as never);

      const logs = await telemedicineService.getLogs(mockClinicId, mockSessionId);

      expect(logs).toHaveLength(2);
      expect(logs[0].eventType).toBe('session_created');
      expect(logs[1].eventType).toBe('participant_joined');
    });
  });

  describe('addLog', () => {
    it('creates a log entry', async () => {
      vi.mocked(addDoc).mockResolvedValue({ id: 'new-log-id' } as never);

      const logId = await telemedicineService.addLog(mockClinicId, mockSessionId, {
        sessionId: mockSessionId,
        eventType: 'call_started',
        userId: 'doctor-001',
      });

      expect(logId).toBe('new-log-id');
      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          sessionId: mockSessionId,
          eventType: 'call_started',
          userId: 'doctor-001',
        })
      );
    });
  });

  describe('subscribeActive', () => {
    it('sets up real-time listener for active sessions', () => {
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();

      vi.mocked(onSnapshot).mockReturnValue(mockUnsubscribe);

      const unsubscribe = telemedicineService.subscribeActive(mockClinicId, mockCallback);

      expect(onSnapshot).toHaveBeenCalled();
      expect(unsubscribe).toBe(mockUnsubscribe);
    });
  });

  describe('addParticipant - rejoining', () => {
    it('updates existing participant when rejoining', async () => {
      const previousJoinedAt = '2025-12-21T10:00:00Z';
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: mockSessionId,
        data: () => ({
          ...mockSession,
          participants: [
            {
              id: 'patient-001',
              displayName: 'Maria Silva',
              role: 'patient',
              joinedAt: previousJoinedAt,
              leftAt: '2025-12-21T10:05:00Z',
            },
          ],
        }),
      } as never);
      vi.mocked(updateDoc).mockResolvedValue(undefined);
      vi.mocked(addDoc).mockResolvedValue({ id: 'log-id' } as never);

      await telemedicineService.addParticipant(mockClinicId, mockSessionId, {
        id: 'patient-001',
        displayName: 'Maria Silva',
        role: 'patient',
      });

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          participants: expect.arrayContaining([
            expect.objectContaining({
              id: 'patient-001',
              leftAt: undefined,
            }),
          ]),
        })
      );
    });
  });
});
