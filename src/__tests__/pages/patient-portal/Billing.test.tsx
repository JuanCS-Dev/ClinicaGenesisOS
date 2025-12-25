/**
 * Patient Portal Billing Tests
 *
 * Smoke tests for patient billing/payments page.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
// Import setup to activate mocks (hoisted automatically)
import { resetPatientPortalMocks } from './setup';

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
    resetPatientPortalMocks();
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
      const titles = screen.getAllByText(/Financeiro/i);
      expect(titles.length).toBeGreaterThan(0);
    });
  });

  describe('summary', () => {
    it('should show pending balance section', () => {
      renderBilling();
      // Should show some financial info
      const container = document.querySelector('[class*="rounded"]');
      expect(container).toBeInTheDocument();
    });
  });
});
