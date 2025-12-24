/**
 * TelemedicineModal Component Tests
 *
 * Uses real interface: TelemedicineModalProps from component
 * Props: isOpen, onClose, sessionId?, appointmentData?
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock useTelemedicine hook
vi.mock('../../../hooks/useTelemedicine', () => ({
  useTelemedicine: vi.fn(() => ({
    session: {
      id: 'session-123',
      appointmentId: 'apt-123',
      patientId: 'patient-123',
      patientName: 'Maria Santos',
      professionalId: 'prof-123',
      professionalName: 'Dr. João Silva',
      roomName: 'room-abc123',
      status: 'waiting',
      participants: [],
      scheduledAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    loading: false,
    error: null,
    startSession: vi.fn().mockResolvedValue('session-123'),
    joinWaitingRoom: vi.fn().mockResolvedValue(true),
    startCall: vi.fn().mockResolvedValue(true),
    endCall: vi.fn().mockResolvedValue(true),
  })),
}));

// Mock ClinicContext
vi.mock('../../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => ({
    clinicId: 'clinic-123',
    userProfile: {
      id: 'user-123',
      displayName: 'Dr. João Silva',
      role: 'professional',
    },
  })),
}));

import { TelemedicineModal } from '../../../components/telemedicine/TelemedicineModal';

describe('TelemedicineModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('smoke tests', () => {
    it('should render without crashing when open', () => {
      const { container } = render(
        <TelemedicineModal
          isOpen={true}
          onClose={mockOnClose}
          sessionId="session-123"
        />
      );
      expect(container).toBeDefined();
    });

    it('should not render when closed', () => {
      const { container } = render(
        <TelemedicineModal
          isOpen={false}
          onClose={mockOnClose}
          sessionId="session-123"
        />
      );
      // When closed, modal returns null
      expect(container.querySelector('[class*="fixed inset-0"]')).toBeFalsy();
    });
  });

  describe('modal content', () => {
    it('should show teleconsulta header when open', () => {
      render(
        <TelemedicineModal
          isOpen={true}
          onClose={mockOnClose}
          sessionId="session-123"
        />
      );
      // Header shows "Teleconsulta"
      const elements = screen.getAllByText(/Teleconsulta/i);
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should show patient name from session', () => {
      render(
        <TelemedicineModal
          isOpen={true}
          onClose={mockOnClose}
          sessionId="session-123"
        />
      );
      // Session has patientName "Maria Santos"
      const nameElements = screen.getAllByText(/Maria Santos/i);
      expect(nameElements.length).toBeGreaterThan(0);
    });

    it('should render with appointmentData for new session', () => {
      const { container } = render(
        <TelemedicineModal
          isOpen={true}
          onClose={mockOnClose}
          appointmentData={{
            appointmentId: 'apt-456',
            patientId: 'patient-456',
            patientName: 'João Oliveira',
            scheduledAt: new Date().toISOString(),
          }}
        />
      );
      expect(container).toBeDefined();
    });
  });
});
