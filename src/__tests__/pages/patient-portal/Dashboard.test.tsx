/**
 * Patient Portal Dashboard Tests
 *
 * Smoke tests for patient portal main page.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../contexts/PatientAuthContext', () => ({
  usePatientAuth: vi.fn(() => ({
    profile: {
      id: 'patient-123',
      name: 'Maria Santos',
      email: 'maria@email.com',
    },
    patient: {
      id: 'patient-123',
      name: 'Maria Santos',
      email: 'maria@email.com',
    },
    isAuthenticated: true,
  })),
}));

import { PatientDashboard } from '../../../pages/patient-portal/Dashboard';

const renderDashboard = () => {
  return render(
    <MemoryRouter>
      <PatientDashboard />
    </MemoryRouter>
  );
};

describe('PatientDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('smoke tests', () => {
    it('should render without crashing', () => {
      const { container } = renderDashboard();
      expect(container).toBeDefined();
    });
  });

  describe('header', () => {
    it('should display welcome message with patient name', () => {
      renderDashboard();
      const mariaElements = screen.getAllByText(/Maria/i);
      expect(mariaElements.length).toBeGreaterThan(0);
    });
  });

  describe('quick actions', () => {
    it('should render agendar consulta link', () => {
      renderDashboard();
      const elements = screen.getAllByText(/Agendar Consulta/i);
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should render ver exames link', () => {
      renderDashboard();
      const elements = screen.getAllByText(/Ver Exames/i);
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should render receitas link', () => {
      renderDashboard();
      const elements = screen.getAllByText(/Receitas/i);
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should render mensagens link', () => {
      renderDashboard();
      const elements = screen.getAllByText(/Mensagens/i);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  describe('next appointment', () => {
    it('should show next appointment section', () => {
      renderDashboard();
      expect(screen.getByText(/Próxima Consulta/i)).toBeInTheDocument();
    });
  });

  describe('notifications', () => {
    it('should show notifications section', () => {
      renderDashboard();
      expect(screen.getByText(/Notificações/i)).toBeInTheDocument();
    });
  });
});
