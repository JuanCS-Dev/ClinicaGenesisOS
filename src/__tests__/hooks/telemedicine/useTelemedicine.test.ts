/**
 * useTelemedicine Hook Tests
 *
 * Tests for teleconsultation session management.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { TelemedicineSession } from '@/types';

// Mock dependencies
vi.mock('@/contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => ({
    clinicId: 'clinic-123',
    userProfile: {
      id: 'user-123',
      displayName: 'Dr. João Silva',
      role: 'professional',
    },
  })),
}));

vi.mock('@/services/firestore', () => ({
  telemedicineService: {
    subscribe: vi.fn(),
    subscribeActive: vi.fn(),
    create: vi.fn(),
    getById: vi.fn(),
    addParticipant: vi.fn(),
    updateStatus: vi.fn(),
    addLog: vi.fn(),
    endSession: vi.fn(),
    getByAppointment: vi.fn(),
  },
}));

import { useTelemedicine } from '@/hooks/useTelemedicine';
import { telemedicineService } from '@/services/firestore';
import { useClinicContext } from '@/contexts/ClinicContext';
import { mockSession, waitForLoaded } from './setup';

describe('useTelemedicine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useClinicContext).mockReturnValue({
      clinicId: 'clinic-123',
      userProfile: {
        id: 'user-123',
        displayName: 'Dr. João Silva',
        role: 'professional',
      },
    } as unknown as ReturnType<typeof useClinicContext>);

    vi.mocked(telemedicineService.subscribe).mockImplementation(
      (_clinicId, _sessionId, callback) => {
        setTimeout(() => callback(mockSession), 0);
        return vi.fn();
      }
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state without sessionId', () => {
    it('should start with no session and not loading', async () => {
      const { result } = renderHook(() => useTelemedicine());

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.session).toBe(null);
      expect(result.current.isInWaitingRoom).toBe(false);
      expect(result.current.isInCall).toBe(false);
    });
  });

  describe('with sessionId', () => {
    it('should load session on mount', async () => {
      const { result } = renderHook(() => useTelemedicine('session-123'));

      await waitFor(() => expect(result.current.session).not.toBe(null));
      expect(result.current.session?.id).toBe('session-123');
    });

    it('should update isInWaitingRoom when status is waiting', async () => {
      vi.mocked(telemedicineService.subscribe).mockImplementation(
        (_clinicId, _sessionId, callback) => {
          setTimeout(() => callback({ ...mockSession, status: 'waiting' }), 0);
          return vi.fn();
        }
      );

      const { result } = renderHook(() => useTelemedicine('session-123'));

      await waitFor(() => expect(result.current.isInWaitingRoom).toBe(true));
      expect(result.current.isInCall).toBe(false);
    });

    it('should update isInCall when status is in_progress', async () => {
      vi.mocked(telemedicineService.subscribe).mockImplementation(
        (_clinicId, _sessionId, callback) => {
          setTimeout(() => callback({ ...mockSession, status: 'in_progress' }), 0);
          return vi.fn();
        }
      );

      const { result } = renderHook(() => useTelemedicine('session-123'));

      await waitFor(() => expect(result.current.isInCall).toBe(true));
      expect(result.current.isInWaitingRoom).toBe(false);
    });
  });

  describe('when clinic is not set', () => {
    it('should return null session', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
        userProfile: null,
      } as unknown as ReturnType<typeof useClinicContext>);

      const { result } = renderHook(() => useTelemedicine('session-123'));

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.session).toBe(null);
    });
  });

  describe('startSession', () => {
    it('should create a new telemedicine session', async () => {
      vi.mocked(telemedicineService.create).mockResolvedValue('new-session-id');

      const { result } = renderHook(() => useTelemedicine());

      await waitFor(() => expect(result.current.loading).toBe(false));

      let sessionId: string | undefined;
      await act(async () => {
        sessionId = await result.current.startSession({
          appointmentId: 'appointment-123',
          patientId: 'patient-123',
          patientName: 'Maria Santos',
          professionalId: 'user-123',
          professionalName: 'Dr. João Silva',
          scheduledAt: new Date().toISOString(),
        });
      });

      expect(telemedicineService.create).toHaveBeenCalledWith(
        'clinic-123',
        expect.objectContaining({
          appointmentId: 'appointment-123',
          patientId: 'patient-123',
        })
      );
      expect(sessionId).toBe('new-session-id');
    });

    it('should throw error when no clinic selected', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
        userProfile: null,
      } as unknown as ReturnType<typeof useClinicContext>);

      const { result } = renderHook(() => useTelemedicine());

      await expect(
        act(async () => {
          await result.current.startSession({
            appointmentId: 'appointment-123',
            patientId: 'patient-123',
            patientName: 'Maria Santos',
            professionalId: 'user-123',
            professionalName: 'Dr. João Silva',
            scheduledAt: new Date().toISOString(),
          });
        })
      ).rejects.toThrow('No clinic selected');
    });
  });

  describe('joinWaitingRoom', () => {
    it('should add participant and update status', async () => {
      vi.mocked(telemedicineService.addParticipant).mockResolvedValue(undefined);
      vi.mocked(telemedicineService.getById).mockResolvedValue(mockSession);
      vi.mocked(telemedicineService.updateStatus).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTelemedicine());

      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.joinWaitingRoom('session-123');
      });

      expect(telemedicineService.addParticipant).toHaveBeenCalledWith(
        'clinic-123',
        'session-123',
        expect.objectContaining({
          id: 'user-123',
          displayName: 'Dr. João Silva',
          role: 'professional',
        })
      );
      expect(result.current.isInWaitingRoom).toBe(true);
    });

    it('should throw error when no user context', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: 'clinic-123',
        userProfile: null,
      } as unknown as ReturnType<typeof useClinicContext>);

      const { result } = renderHook(() => useTelemedicine());

      await expect(
        act(async () => {
          await result.current.joinWaitingRoom('session-123');
        })
      ).rejects.toThrow('No clinic or user context');
    });
  });

  describe('startCall', () => {
    it('should start the video call', async () => {
      vi.mocked(telemedicineService.subscribe).mockImplementation(
        (_clinicId, _sessionId, callback) => {
          setTimeout(() => callback({ ...mockSession, status: 'waiting' }), 0);
          return vi.fn();
        }
      );
      vi.mocked(telemedicineService.updateStatus).mockResolvedValue(undefined);
      vi.mocked(telemedicineService.addLog).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTelemedicine('session-123'));

      await waitFor(() => expect(result.current.session).not.toBe(null));

      await act(async () => {
        await result.current.startCall();
      });

      expect(telemedicineService.updateStatus).toHaveBeenCalledWith(
        'clinic-123',
        'session-123',
        'in_progress',
        expect.objectContaining({
          startedAt: expect.any(String),
        })
      );
      expect(telemedicineService.addLog).toHaveBeenCalledWith(
        'clinic-123',
        'session-123',
        expect.objectContaining({
          eventType: 'call_started',
        })
      );
      expect(result.current.isInCall).toBe(true);
    });

    it('should throw error when no session', async () => {
      const { result } = renderHook(() => useTelemedicine());

      await waitFor(() => expect(result.current.loading).toBe(false));

      await expect(
        act(async () => {
          await result.current.startCall();
        })
      ).rejects.toThrow('No session to start');
    });
  });

  describe('endCall', () => {
    it('should end the video call', async () => {
      vi.mocked(telemedicineService.subscribe).mockImplementation(
        (_clinicId, _sessionId, callback) => {
          setTimeout(() => callback({ ...mockSession, status: 'in_progress' }), 0);
          return vi.fn();
        }
      );
      vi.mocked(telemedicineService.endSession).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTelemedicine('session-123'));

      await waitFor(() => expect(result.current.session).not.toBe(null));

      await act(async () => {
        await result.current.endCall();
      });

      expect(telemedicineService.endSession).toHaveBeenCalledWith(
        'clinic-123',
        'session-123',
        'user-123'
      );
      expect(result.current.isInCall).toBe(false);
    });

    it('should throw error when no session', async () => {
      const { result } = renderHook(() => useTelemedicine());

      await waitFor(() => expect(result.current.loading).toBe(false));

      await expect(
        act(async () => {
          await result.current.endCall();
        })
      ).rejects.toThrow('No session to end');
    });
  });

  describe('cancelSession', () => {
    it('should cancel a session', async () => {
      vi.mocked(telemedicineService.updateStatus).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTelemedicine());

      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.cancelSession('session-123', 'Patient unavailable');
      });

      expect(telemedicineService.updateStatus).toHaveBeenCalledWith(
        'clinic-123',
        'session-123',
        'canceled',
        { notes: 'Patient unavailable' }
      );
    });

    it('should reset state when canceling current session', async () => {
      vi.mocked(telemedicineService.subscribe).mockImplementation(
        (_clinicId, _sessionId, callback) => {
          setTimeout(() => callback({ ...mockSession, status: 'waiting' }), 0);
          return vi.fn();
        }
      );
      vi.mocked(telemedicineService.updateStatus).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTelemedicine('session-123'));

      await waitFor(() => expect(result.current.isInWaitingRoom).toBe(true));

      await act(async () => {
        await result.current.cancelSession('session-123');
      });

      expect(result.current.isInWaitingRoom).toBe(false);
      expect(result.current.isInCall).toBe(false);
    });
  });

  describe('getSessionByAppointment', () => {
    it('should get session by appointment ID', async () => {
      vi.mocked(telemedicineService.getByAppointment).mockResolvedValue(mockSession);

      const { result } = renderHook(() => useTelemedicine());

      await waitFor(() => expect(result.current.loading).toBe(false));

      let session: TelemedicineSession | null = null;
      await act(async () => {
        session = await result.current.getSessionByAppointment('appointment-123');
      });

      expect(telemedicineService.getByAppointment).toHaveBeenCalledWith(
        'clinic-123',
        'appointment-123'
      );
      expect(session?.id).toBe('session-123');
    });

    it('should return null when not found', async () => {
      vi.mocked(telemedicineService.getByAppointment).mockResolvedValue(null);

      const { result } = renderHook(() => useTelemedicine());

      await waitFor(() => expect(result.current.loading).toBe(false));

      let session: TelemedicineSession | null = mockSession;
      await act(async () => {
        session = await result.current.getSessionByAppointment('unknown');
      });

      expect(session).toBe(null);
    });
  });

  describe('cleanup', () => {
    it('should unsubscribe on unmount', async () => {
      const unsubscribeMock = vi.fn();
      vi.mocked(telemedicineService.subscribe).mockImplementation(
        (_clinicId, _sessionId, callback) => {
          setTimeout(() => callback(mockSession), 0);
          return unsubscribeMock;
        }
      );

      const { unmount } = renderHook(() => useTelemedicine('session-123'));

      await waitFor(() => {
        expect(telemedicineService.subscribe).toHaveBeenCalled();
      });

      unmount();

      expect(unsubscribeMock).toHaveBeenCalled();
    });
  });
});
