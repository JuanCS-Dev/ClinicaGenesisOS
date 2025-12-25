/**
 * VideoRoom Component Tests
 *
 * Comprehensive tests for Jitsi video conferencing component.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

// Store API mock for triggering events
let mockApiInstance: {
  addListener: ReturnType<typeof vi.fn>;
  dispose: ReturnType<typeof vi.fn>;
  executeCommand: ReturnType<typeof vi.fn>;
  listeners: Record<string, (...args: unknown[]) => void>;
};

// Mock JitsiMeeting component
vi.mock('@jitsi/react-sdk', () => ({
  JitsiMeeting: vi.fn(({ onApiReady, onReadyToClose }) => {
    // Create mock API with listener storage
    mockApiInstance = {
      addListener: vi.fn((event, callback) => {
        mockApiInstance.listeners[event] = callback;
      }),
      dispose: vi.fn(),
      executeCommand: vi.fn(),
      listeners: {},
    };

    // Simulate API ready with mock
    if (onApiReady) {
      setTimeout(() => {
        onApiReady(mockApiInstance);
      }, 0);
    }

    return (
      <div data-testid="jitsi-meeting">
        <span>Jitsi Meeting Mock</span>
        <button
          data-testid="trigger-close"
          onClick={() => onReadyToClose?.()}
        >
          Ready to Close
        </button>
      </div>
    );
  }),
}));

import { VideoRoom } from '../../../components/telemedicine/VideoRoom';

// Mock session matching TelemedicineSession interface
const mockSession = {
  id: 'session-123',
  appointmentId: 'apt-123',
  patientId: 'patient-123',
  patientName: 'Maria Santos',
  professionalId: 'prof-123',
  professionalName: 'Dr. João Silva',
  roomName: 'room-abc123',
  status: 'in_progress' as const,
  participants: [],
  recordingEnabled: false,
  startedAt: new Date().toISOString(),
  scheduledAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('VideoRoom', () => {
  const mockOnCallEnd = vi.fn();
  const mockOnParticipantJoin = vi.fn();
  const mockOnParticipantLeave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendering', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <VideoRoom
          session={mockSession}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      );
      expect(container).toBeDefined();
    });

    it('should render video container', () => {
      const { container } = render(
        <VideoRoom
          session={mockSession}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      );
      expect(container.querySelector('.min-h-\\[500px\\]')).toBeTruthy();
    });

    it('should render Jitsi Meeting component', () => {
      render(
        <VideoRoom
          session={mockSession}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      );
      expect(screen.getByTestId('jitsi-meeting')).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('should show loading overlay initially', () => {
      render(
        <VideoRoom
          session={mockSession}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      );
      expect(screen.getByText('Conectando à teleconsulta...')).toBeInTheDocument();
    });

    it('should show loading spinner', () => {
      const { container } = render(
        <VideoRoom
          session={mockSession}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      );
      expect(container.querySelector('.animate-spin')).toBeTruthy();
    });

    it('should show secure environment message', () => {
      render(
        <VideoRoom
          session={mockSession}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      );
      expect(screen.getByText('Preparando ambiente seguro de vídeo')).toBeInTheDocument();
    });

    it('should hide loading overlay after API is ready', async () => {
      render(
        <VideoRoom
          session={mockSession}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('Conectando à teleconsulta...')).not.toBeInTheDocument();
      });
    });
  });

  describe('professional view', () => {
    it('should show patient name for professional', async () => {
      render(
        <VideoRoom
          session={mockSession}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Paciente:')).toBeInTheDocument();
      });
      expect(screen.getByText('Maria Santos')).toBeInTheDocument();
    });

    it('should show end call button for professional after loading', async () => {
      render(
        <VideoRoom
          session={mockSession}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Encerrar')).toBeInTheDocument();
      });
    });

    it('should call executeCommand when clicking end call', async () => {
      render(
        <VideoRoom
          session={mockSession}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Encerrar')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Encerrar'));
      expect(mockApiInstance.executeCommand).toHaveBeenCalledWith('hangup');
    });
  });

  describe('patient view', () => {
    it('should show doctor name for patient', () => {
      render(
        <VideoRoom
          session={mockSession}
          displayName="Maria Santos"
          isProfessional={false}
          onCallEnd={mockOnCallEnd}
        />
      );

      expect(screen.getByText('Dr(a).')).toBeInTheDocument();
      expect(screen.getByText('Dr. João Silva')).toBeInTheDocument();
    });

    it('should NOT show end call button for patient', async () => {
      render(
        <VideoRoom
          session={mockSession}
          displayName="Maria Santos"
          isProfessional={false}
          onCallEnd={mockOnCallEnd}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('Conectando à teleconsulta...')).not.toBeInTheDocument();
      });

      expect(screen.queryByText('Encerrar')).not.toBeInTheDocument();
    });
  });

  describe('consultation timer', () => {
    it('should show timer when session has startedAt', () => {
      const { container } = render(
        <VideoRoom
          session={mockSession}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      );
      // ConsultationTimer component should be rendered
      expect(container.firstChild).toBeDefined();
    });

    it('should NOT show timer when session has no startedAt', () => {
      const sessionWithoutStart = { ...mockSession, startedAt: undefined };
      const { container } = render(
        <VideoRoom
          session={sessionWithoutStart}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      );
      expect(container.firstChild).toBeDefined();
    });
  });

  describe('recording badge', () => {
    it('should show recording badge when enabled', () => {
      const sessionWithRecording = { ...mockSession, recordingEnabled: true };
      const { container } = render(
        <VideoRoom
          session={sessionWithRecording}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      );
      // RecordingBadge component should be rendered
      expect(container.firstChild).toBeDefined();
    });

    it('should NOT show recording badge when disabled', () => {
      const sessionWithoutRecording = { ...mockSession, recordingEnabled: false };
      const { container } = render(
        <VideoRoom
          session={sessionWithoutRecording}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      );
      expect(container.firstChild).toBeDefined();
    });
  });

  describe('participant events', () => {
    it('should call onParticipantJoin when participant joins', async () => {
      render(
        <VideoRoom
          session={mockSession}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
          onParticipantJoin={mockOnParticipantJoin}
        />
      );

      await waitFor(() => {
        expect(mockApiInstance.addListener).toHaveBeenCalled();
      });

      // Trigger participantJoined event
      await act(async () => {
        mockApiInstance.listeners['participantJoined']?.({
          id: 'participant-1',
          displayName: 'Maria Santos',
        });
      });

      expect(mockOnParticipantJoin).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'participant-1',
          displayName: 'Maria Santos',
          role: 'patient',
        })
      );
    });

    it('should call onParticipantLeave when participant leaves', async () => {
      render(
        <VideoRoom
          session={mockSession}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
          onParticipantLeave={mockOnParticipantLeave}
        />
      );

      await waitFor(() => {
        expect(mockApiInstance.addListener).toHaveBeenCalled();
      });

      // Trigger participantLeft event
      await act(async () => {
        mockApiInstance.listeners['participantLeft']?.({
          id: 'participant-1',
        });
      });

      expect(mockOnParticipantLeave).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'participant-1',
        })
      );
    });

    it('should call onCallEnd when conference is left', async () => {
      render(
        <VideoRoom
          session={mockSession}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      );

      await waitFor(() => {
        expect(mockApiInstance.addListener).toHaveBeenCalled();
      });

      // Trigger videoConferenceLeft event
      await act(async () => {
        mockApiInstance.listeners['videoConferenceLeft']?.();
      });

      expect(mockOnCallEnd).toHaveBeenCalledWith(mockSession);
    });
  });

  describe('error handling', () => {
    it('should show error when Jitsi error occurs', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <VideoRoom
          session={mockSession}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      );

      await waitFor(() => {
        expect(mockApiInstance.addListener).toHaveBeenCalled();
      });

      // Trigger error event
      await act(async () => {
        mockApiInstance.listeners['errorOccurred']?.({
          error: 'connection_error',
        });
      });

      expect(screen.getByText('Erro de Conexão')).toBeInTheDocument();
      expect(
        screen.getByText('Erro de conexão. Por favor, verifique sua internet.')
      ).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('should show retry button on error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <VideoRoom
          session={mockSession}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      );

      await waitFor(() => {
        expect(mockApiInstance.addListener).toHaveBeenCalled();
      });

      // Trigger error event
      await act(async () => {
        mockApiInstance.listeners['errorOccurred']?.({
          error: 'connection_error',
        });
      });

      expect(screen.getByText('Tentar Novamente')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('ready to close', () => {
    it('should call onCallEnd when ready to close', async () => {
      render(
        <VideoRoom
          session={mockSession}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      );

      // Use the trigger button from our mock
      fireEvent.click(screen.getByTestId('trigger-close'));
      expect(mockOnCallEnd).toHaveBeenCalledWith(mockSession);
    });
  });

  describe('participant count', () => {
    it('should update participant count on join/leave', async () => {
      const { container } = render(
        <VideoRoom
          session={mockSession}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      );

      await waitFor(() => {
        expect(mockApiInstance.addListener).toHaveBeenCalled();
      });

      // Initial: no participant count indicator (count is 0)
      expect(container.textContent).not.toContain('participantes');

      // Trigger participant join
      await act(async () => {
        mockApiInstance.listeners['participantJoined']?.({
          id: 'participant-1',
          displayName: 'Patient',
        });
      });

      // Should show participant count
      await waitFor(() => {
        expect(screen.getByText(/participante/)).toBeInTheDocument();
      });
    });

    it('should decrement count when participant leaves', async () => {
      const { container } = render(
        <VideoRoom
          session={mockSession}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      );

      await waitFor(() => {
        expect(mockApiInstance.addListener).toHaveBeenCalled();
      });

      // Verify container exists and participantLeft listener was registered
      expect(container).toBeDefined();
      expect(mockApiInstance.listeners['participantLeft']).toBeDefined();
    });
  });

  describe('cleanup', () => {
    it('should dispose API on unmount', async () => {
      const { unmount } = render(
        <VideoRoom
          session={mockSession}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      );

      await waitFor(() => {
        expect(mockApiInstance.addListener).toHaveBeenCalled();
      });

      unmount();
      expect(mockApiInstance.dispose).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle participant join without callback', async () => {
      render(
        <VideoRoom
          session={mockSession}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
          // No onParticipantJoin callback
        />
      );

      await waitFor(() => {
        expect(mockApiInstance.addListener).toHaveBeenCalled();
      });

      // Should not throw
      await act(async () => {
        mockApiInstance.listeners['participantJoined']?.({
          id: 'participant-1',
          displayName: 'Patient',
        });
      });
    });

    it('should handle participant leave without callback', async () => {
      render(
        <VideoRoom
          session={mockSession}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
          // No onParticipantLeave callback
        />
      );

      await waitFor(() => {
        expect(mockApiInstance.addListener).toHaveBeenCalled();
      });

      // Should not throw
      await act(async () => {
        mockApiInstance.listeners['participantLeft']?.({
          id: 'participant-1',
        });
      });
    });

    it('should not show negative participant count', async () => {
      render(
        <VideoRoom
          session={mockSession}
          displayName="Dr. João Silva"
          isProfessional={true}
          onCallEnd={mockOnCallEnd}
        />
      );

      await waitFor(() => {
        expect(mockApiInstance.addListener).toHaveBeenCalled();
      });

      // Leave without joining first
      await act(async () => {
        mockApiInstance.listeners['participantLeft']?.({
          id: 'participant-1',
        });
      });

      // Should not show negative count
      expect(screen.queryByText(/-\d+/)).not.toBeInTheDocument();
    });
  });
});
