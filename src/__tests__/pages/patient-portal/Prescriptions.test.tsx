/**
 * Patient Portal Prescriptions Tests
 *
 * Smoke tests for prescription viewing.
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

import { PatientPrescriptions } from '../../../pages/patient-portal/Prescriptions';

const renderPrescriptions = () => {
  return render(
    <MemoryRouter>
      <PatientPrescriptions />
    </MemoryRouter>
  );
};

describe('PatientPrescriptions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('smoke tests', () => {
    it('should render without crashing', () => {
      const { container } = renderPrescriptions();
      expect(container).toBeDefined();
    });
  });

  describe('header', () => {
    it('should render page title', () => {
      renderPrescriptions();
      expect(screen.getByText(/Minhas Receitas/i)).toBeInTheDocument();
    });
  });

  describe('search', () => {
    it('should render search input', () => {
      renderPrescriptions();
      expect(screen.getByPlaceholderText(/Buscar/i)).toBeInTheDocument();
    });
  });

  describe('prescriptions list', () => {
    it('should display medication names from mock data', () => {
      renderPrescriptions();
      expect(screen.getByText(/Losartana/i)).toBeInTheDocument();
    });

    it('should show doctor info', () => {
      renderPrescriptions();
      expect(screen.getByText(/Dr\. João Silva/i)).toBeInTheDocument();
    });
  });

  describe('status indicators', () => {
    it('should show active prescriptions', () => {
      renderPrescriptions();
      const activeElements = screen.getAllByText(/Ativa/i);
      expect(activeElements.length).toBeGreaterThan(0);
    });
  });
});
