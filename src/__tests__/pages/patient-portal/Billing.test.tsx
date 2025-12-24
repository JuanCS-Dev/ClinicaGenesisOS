/**
 * Patient Portal Billing Tests
 *
 * Smoke tests for financial/billing viewing.
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

import { PatientBilling } from '../../../pages/patient-portal/Billing';

const renderBilling = () => {
  return render(
    <MemoryRouter>
      <PatientBilling />
    </MemoryRouter>
  );
};

describe('PatientBilling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('smoke tests', () => {
    it('should render without crashing', () => {
      const { container } = renderBilling();
      expect(container).toBeDefined();
    });
  });

  describe('header', () => {
    it('should render page title', () => {
      renderBilling();
      const elements = screen.getAllByText(/Financeiro/i);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  describe('invoices list', () => {
    it('should display invoice descriptions from mock data', () => {
      renderBilling();
      const drElements = screen.getAllByText(/Dr\. João Silva/i);
      expect(drElements.length).toBeGreaterThan(0);
    });

    it('should show payment methods', () => {
      renderBilling();
      const pixElements = screen.getAllByText(/PIX/i);
      expect(pixElements.length).toBeGreaterThan(0);
    });
  });

  describe('status indicators', () => {
    it('should show paid status', () => {
      renderBilling();
      const paidElements = screen.getAllByText(/Pago/i);
      expect(paidElements.length).toBeGreaterThan(0);
    });

    it('should show pending status', () => {
      renderBilling();
      const pendingElements = screen.getAllByText(/Pendente/i);
      expect(pendingElements.length).toBeGreaterThan(0);
    });
  });
});
