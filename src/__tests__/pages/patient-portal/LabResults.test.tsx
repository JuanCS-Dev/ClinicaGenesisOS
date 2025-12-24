/**
 * Patient Portal Lab Results Tests
 *
 * Smoke tests for lab results viewing.
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

import { PatientLabResults } from '../../../pages/patient-portal/LabResults';

const renderLabResults = () => {
  return render(
    <MemoryRouter>
      <PatientLabResults />
    </MemoryRouter>
  );
};

describe('PatientLabResults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('smoke tests', () => {
    it('should render without crashing', () => {
      const { container } = renderLabResults();
      expect(container).toBeDefined();
    });
  });

  describe('header', () => {
    it('should render page title', () => {
      renderLabResults();
      const elements = screen.getAllByText(/Exames/i);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  describe('search', () => {
    it('should render search input', () => {
      renderLabResults();
      expect(screen.getByPlaceholderText(/Buscar/i)).toBeInTheDocument();
    });
  });

  describe('lab results list', () => {
    it('should display exam names from mock data', () => {
      renderLabResults();
      const elements = screen.getAllByText(/Hemograma/i);
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should show doctor info', () => {
      renderLabResults();
      const drElements = screen.getAllByText(/Dr\. João Silva/i);
      expect(drElements.length).toBeGreaterThan(0);
    });
  });

  describe('status indicators', () => {
    it('should show ready status', () => {
      renderLabResults();
      const readyElements = screen.getAllByText(/Disponível/i);
      expect(readyElements.length).toBeGreaterThan(0);
    });
  });
});
