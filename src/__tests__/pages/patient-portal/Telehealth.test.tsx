/**
 * Patient Portal Telehealth Tests
 *
 * Smoke tests for video consultation interface.
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

import { PatientTelehealth } from '../../../pages/patient-portal/Telehealth';

const renderTelehealth = () => {
  return render(
    <MemoryRouter>
      <PatientTelehealth />
    </MemoryRouter>
  );
};

describe('PatientTelehealth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('smoke tests', () => {
    it('should render without crashing', () => {
      const { container } = renderTelehealth();
      expect(container).toBeDefined();
    });
  });

  describe('header', () => {
    it('should render page title', () => {
      renderTelehealth();
      const elements = screen.getAllByText(/Teleconsulta/i);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  describe('appointment info', () => {
    it('should display provider info from mock data', () => {
      renderTelehealth();
      expect(screen.getByText(/Dr\. João Silva/i)).toBeInTheDocument();
    });
  });

  describe('device check', () => {
    it('should render device verification section', () => {
      renderTelehealth();
      expect(screen.getByText(/Verificar Dispositivos/i)).toBeInTheDocument();
    });
  });
});
