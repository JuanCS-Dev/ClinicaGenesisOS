/**
 * Patient Portal History Tests
 *
 * Smoke tests for medical history viewing.
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

import { PatientHistory } from '../../../pages/patient-portal/History';

const renderHistory = () => {
  return render(
    <MemoryRouter>
      <PatientHistory />
    </MemoryRouter>
  );
};

describe('PatientHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('smoke tests', () => {
    it('should render without crashing', () => {
      const { container } = renderHistory();
      expect(container).toBeDefined();
    });
  });

  describe('header', () => {
    it('should render page title', () => {
      renderHistory();
      const elements = screen.getAllByText(/Histórico/i);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  describe('records list', () => {
    it('should display records from mock data', () => {
      renderHistory();
      // Mock data should show provider names
      const drElements = screen.getAllByText(/Dr\. João Silva/i);
      expect(drElements.length).toBeGreaterThan(0);
    });

    it('should show consultation types', () => {
      renderHistory();
      const consultaElements = screen.getAllByText(/Consulta/i);
      expect(consultaElements.length).toBeGreaterThan(0);
    });
  });
});
