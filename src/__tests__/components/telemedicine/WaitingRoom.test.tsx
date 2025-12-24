/**
 * WaitingRoom Component Tests
 *
 * Uses real interface: WaitingRoomProps from @/types/telemedicine
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import { WaitingRoom } from '../../../components/telemedicine/WaitingRoom';

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

describe('WaitingRoom', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('smoke tests', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <WaitingRoom
          session={mockSession}
          displayName="Maria Santos"
          isProfessional={false}
          onReady={vi.fn()}
          onCancel={vi.fn()}
        />
      );
      expect(container).toBeDefined();
    });
  });

  describe('waiting room content', () => {
    it('should display professional name for patient view', () => {
      render(
        <WaitingRoom
          session={mockSession}
          displayName="Maria Santos"
          isProfessional={false}
          onReady={vi.fn()}
          onCancel={vi.fn()}
        />
      );
      // Patient sees professional name
      const nameElements = screen.getAllByText(/Dr\. João Silva|João Silva/i);
      expect(nameElements.length).toBeGreaterThan(0);
    });

    it('should display patient name for professional view', () => {
      render(
        <WaitingRoom
          session={mockSession}
          displayName="Dr. João Silva"
          isProfessional={true}
          onReady={vi.fn()}
          onCancel={vi.fn()}
        />
      );
      // Professional sees patient name
      const nameElements = screen.getAllByText(/Maria Santos/i);
      expect(nameElements.length).toBeGreaterThan(0);
    });

    it('should have action buttons', () => {
      const { container } = render(
        <WaitingRoom
          session={mockSession}
          displayName="Maria Santos"
          isProfessional={false}
          onReady={vi.fn()}
          onCancel={vi.fn()}
        />
      );
      expect(container.querySelectorAll('button').length).toBeGreaterThan(0);
    });
  });
});
