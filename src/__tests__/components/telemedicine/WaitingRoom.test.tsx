/**
 * WaitingRoom Component Tests
 *
 * Comprehensive tests for the pre-call waiting room.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';

import { WaitingRoom } from '../../../components/telemedicine/WaitingRoom';

// Mock navigator.mediaDevices
const mockGetUserMedia = vi.fn();

beforeEach(() => {
  // Default: grant permissions
  mockGetUserMedia.mockResolvedValue({
    getTracks: () => [
      { enabled: true, stop: vi.fn(), kind: 'video' },
      { enabled: true, stop: vi.fn(), kind: 'audio' },
    ],
    getVideoTracks: () => [{ enabled: true, stop: vi.fn() }],
    getAudioTracks: () => [{ enabled: true, stop: vi.fn() }],
  });

  Object.defineProperty(global.navigator, 'mediaDevices', {
    value: { getUserMedia: mockGetUserMedia },
    writable: true,
  });
});

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

// Mock session based on real TelemedicineSession interface
const mockSession = {
  id: 'session-123',
  appointmentId: 'apt-123',
  patientId: 'patient-123',
  patientName: 'Maria Santos',
  professionalId: 'prof-123',
  professionalName: 'Dr. João Silva',
  roomName: 'room-abc123',
  status: 'waiting' as const,
  participants: [],
  scheduledAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockOnReady = vi.fn();
const mockOnCancel = vi.fn();

const renderWaitingRoom = (props = {}) => {
  return render(
    <WaitingRoom
      session={mockSession}
      displayName="Maria Santos"
      isProfessional={false}
      onReady={mockOnReady}
      onCancel={mockOnCancel}
      {...props}
    />
  );
};

describe('WaitingRoom', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render without crashing', () => {
      const { container } = renderWaitingRoom();
      expect(container).toBeDefined();
    });

    it('should render gradient background', () => {
      const { container } = renderWaitingRoom();
      expect(container.querySelector('.bg-gradient-to-br')).toBeTruthy();
    });
  });

  describe('patient view', () => {
    it('should show "Aguardando o Médico" title', () => {
      renderWaitingRoom({ isProfessional: false });
      expect(screen.getByText('Aguardando o Médico')).toBeInTheDocument();
    });

    it('should display professional name', () => {
      renderWaitingRoom({ isProfessional: false });
      expect(screen.getByText(/Dr\(a\)\. Dr\. João Silva/)).toBeInTheDocument();
    });

    it('should show "Entrar na Consulta" button', () => {
      renderWaitingRoom({ isProfessional: false });
      expect(screen.getByText('Entrar na Consulta')).toBeInTheDocument();
    });

    it('should show waiting timer', () => {
      renderWaitingRoom({ isProfessional: false });
      expect(screen.getByText(/Aguardando há/)).toBeInTheDocument();
    });
  });

  describe('professional view', () => {
    it('should show "Sala de Espera" title', () => {
      renderWaitingRoom({ isProfessional: true, displayName: 'Dr. João Silva' });
      expect(screen.getByText('Sala de Espera')).toBeInTheDocument();
    });

    it('should display patient name', () => {
      renderWaitingRoom({ isProfessional: true, displayName: 'Dr. João Silva' });
      expect(screen.getByText(/Paciente: Maria Santos/)).toBeInTheDocument();
    });

    it('should show "Iniciar Consulta" button', () => {
      renderWaitingRoom({ isProfessional: true, displayName: 'Dr. João Silva' });
      expect(screen.getByText('Iniciar Consulta')).toBeInTheDocument();
    });

    it('should not show waiting timer', () => {
      renderWaitingRoom({ isProfessional: true, displayName: 'Dr. João Silva' });
      expect(screen.queryByText(/Aguardando há/)).not.toBeInTheDocument();
    });
  });

  describe('display name', () => {
    it('should show display name in overlay', () => {
      renderWaitingRoom({ displayName: 'Teste User' });
      expect(screen.getByText('Teste User')).toBeInTheDocument();
    });
  });

  describe('media controls', () => {
    it('should have camera toggle button', () => {
      renderWaitingRoom();
      const cameraButtons = screen.getAllByText('Câmera');
      expect(cameraButtons.length).toBeGreaterThan(0);
    });

    it('should have microphone toggle button', () => {
      renderWaitingRoom();
      const micButtons = screen.getAllByText('Microfone');
      expect(micButtons.length).toBeGreaterThan(0);
    });

    it('should have media control buttons', () => {
      const { container } = renderWaitingRoom();
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThanOrEqual(4); // Camera, Mic, Cancel, Join
    });
  });

  describe('action buttons', () => {
    it('should have cancel button', () => {
      renderWaitingRoom();
      expect(screen.getByText('Cancelar')).toBeInTheDocument();
    });

    it('should call onCancel when clicking cancel', () => {
      renderWaitingRoom();
      fireEvent.click(screen.getByText('Cancelar'));
      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should call onReady when clicking join button', async () => {
      renderWaitingRoom();

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      fireEvent.click(screen.getByText('Entrar na Consulta'));
      expect(mockOnReady).toHaveBeenCalled();
    });
  });

  describe('device status indicators', () => {
    it('should show camera status', () => {
      renderWaitingRoom();
      const cameraLabels = screen.getAllByText('Câmera');
      expect(cameraLabels.length).toBeGreaterThan(0);
    });

    it('should show microphone status', () => {
      renderWaitingRoom();
      const micLabels = screen.getAllByText('Microfone');
      expect(micLabels.length).toBeGreaterThan(0);
    });
  });

  describe('permission denied', () => {
    beforeEach(() => {
      const error = new Error('Permission denied');
      error.name = 'NotAllowedError';
      mockGetUserMedia.mockRejectedValue(error);
    });

    it('should show warning when permissions denied', async () => {
      renderWaitingRoom();

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      expect(
        screen.getByText(/você precisa permitir o acesso à câmera e microfone/)
      ).toBeInTheDocument();
    });

    it('should disable join button when permissions denied', async () => {
      renderWaitingRoom();

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      const joinButton = screen.getByText('Entrar na Consulta');
      expect(joinButton).toBeDisabled();
    });

    it('should show camera denied message in preview', async () => {
      renderWaitingRoom();

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      expect(screen.getByText('Câmera sem permissão')).toBeInTheDocument();
    });
  });

  describe('media error', () => {
    beforeEach(() => {
      const error = new Error('Device not found');
      error.name = 'NotFoundError';
      mockGetUserMedia.mockRejectedValue(error);
    });

    it('should handle generic media errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      renderWaitingRoom();

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Media access error:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('video preview', () => {
    it('should have video preview area', () => {
      const { container } = renderWaitingRoom();
      // Video preview is a container with video or user icon
      const previewArea = container.querySelector('.aspect-video');
      expect(previewArea).toBeInTheDocument();
    });
  });

  describe('waiting timer', () => {
    it('should format time as mm:ss', async () => {
      vi.useFakeTimers();

      renderWaitingRoom({ isProfessional: false });

      // Initial should be 00:00
      expect(screen.getByText(/00:00/)).toBeInTheDocument();

      // Advance 65 seconds
      await act(async () => {
        vi.advanceTimersByTime(65000);
      });

      // Should show 01:05
      expect(screen.getByText(/01:05/)).toBeInTheDocument();

      vi.useRealTimers();
    });
  });
});
