/**
 * Patient Portal Appointments Tests
 *
 * Smoke tests for appointment viewing and management.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../contexts/PatientAuthContext', () => ({
  usePatientAuth: vi.fn(() => ({
    patient: { id: 'patient-123', name: 'Maria Santos' },
    isAuthenticated: true,
  })),
}));

import { PatientAppointments } from '../../../pages/patient-portal/Appointments';

const renderAppointments = () => {
  return render(
    <MemoryRouter>
      <PatientAppointments />
    </MemoryRouter>
  );
};

describe('PatientAppointments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('smoke tests', () => {
    it('should render without crashing', () => {
      const { container } = renderAppointments();
      expect(container).toBeDefined();
    });
  });

  describe('header', () => {
    it('should render page title', () => {
      renderAppointments();
      expect(screen.getByText(/Minhas Consultas/i)).toBeInTheDocument();
    });

    it('should render new appointment button', () => {
      renderAppointments();
      expect(screen.getByText(/Nova Consulta/i)).toBeInTheDocument();
    });
  });

  describe('filters', () => {
    it('should render filter tabs', () => {
      renderAppointments();
      const todasElements = screen.getAllByText(/Todas/i);
      const proximasElements = screen.getAllByText(/Próximas/i);
      expect(todasElements.length).toBeGreaterThan(0);
      expect(proximasElements.length).toBeGreaterThan(0);
    });
  });

  describe('appointment cards', () => {
    it('should display appointment data', () => {
      renderAppointments();
      // Mock data should show professional name
      const drElements = screen.getAllByText(/Dr\. João Silva/i);
      expect(drElements.length).toBeGreaterThan(0);
    });
  });
});
