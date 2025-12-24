/**
 * TelemedicineButton Component Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { TelemedicineButton } from '../../../components/telemedicine/TelemedicineButton';

const mockAppointment = {
  id: 'apt-123',
  patientId: 'patient-123',
  patientName: 'Maria Santos',
  professionalId: 'prof-123',
  professionalName: 'Dr. João Silva',
  date: '2024-12-28',
  time: '14:30',
  status: 'Confirmado' as const,
  type: 'Teleconsulta' as const,
};

describe('TelemedicineButton', () => {
  const mockOnStart = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('smoke tests', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <TelemedicineButton
          appointment={mockAppointment}
          onStart={mockOnStart}
        />
      );
      expect(container).toBeDefined();
    });
  });

  describe('button behavior', () => {
    it('should call onStart when clicked', () => {
      render(
        <TelemedicineButton
          appointment={mockAppointment}
          onStart={mockOnStart}
        />
      );
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(mockOnStart).toHaveBeenCalledWith(mockAppointment);
    });

    it('should not render for canceled appointments', () => {
      const canceledAppointment = { ...mockAppointment, status: 'Cancelado' as const };
      const { container } = render(
        <TelemedicineButton
          appointment={canceledAppointment}
          onStart={mockOnStart}
        />
      );
      expect(container.querySelector('button')).toBeFalsy();
    });
  });

  describe('states', () => {
    it('should show different style with active session', () => {
      const { container } = render(
        <TelemedicineButton
          appointment={mockAppointment}
          onStart={mockOnStart}
          hasActiveSession={true}
        />
      );
      expect(container.querySelector('.bg-success')).toBeTruthy();
    });

    it('should disable button when loading', () => {
      render(
        <TelemedicineButton
          appointment={mockAppointment}
          onStart={mockOnStart}
          loading={true}
        />
      );
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });
});
