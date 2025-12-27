/**
 * Patient Portal Billing Tests
 *
 * Tests for patient billing/payments page including PIX functionality.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
// Import setup to activate mocks (hoisted automatically)
import { resetPatientPortalMocks } from './setup';

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock PIX service
vi.mock('../../../services/pix.service', () => ({
  generateDirectPixQRCode: vi.fn().mockResolvedValue({
    qrCodeDataUrl: 'data:image/png;base64,test',
    pixCopiaECola: '00020126580014br.gov.bcb.pix',
  }),
}));

// Mock PIX config
vi.mock('../../../config/pix', () => ({
  PIX_CONFIG: {
    pixKey: 'test@email.com',
    pixKeyType: 'email',
    receiverName: 'CLINICA TEST',
    receiverCity: 'SAO PAULO',
    enabled: true,
  },
  isPixConfigured: vi.fn(() => true),
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
    resetPatientPortalMocks();
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
      const titles = screen.getAllByText(/Financeiro/i);
      expect(titles.length).toBeGreaterThan(0);
    });

    it('should render subtitle', () => {
      renderBilling();
      expect(screen.getByText(/Faturas, pagamentos e histórico/i)).toBeInTheDocument();
    });
  });

  describe('summary cards', () => {
    it('should show Total Pago section', () => {
      renderBilling();
      expect(screen.getByText('Total Pago')).toBeInTheDocument();
    });

    it('should show Pendente section', () => {
      renderBilling();
      const pendenteElements = screen.getAllByText('Pendente');
      expect(pendenteElements.length).toBeGreaterThan(0);
    });
  });

  describe('invoices list', () => {
    it('should render invoices list header', () => {
      renderBilling();
      expect(screen.getByText('Histórico de Faturas')).toBeInTheDocument();
    });

    it('should display transaction description', () => {
      renderBilling();
      expect(screen.getByText('Consulta Cardiologia')).toBeInTheDocument();
    });
  });

  describe('payment functionality', () => {
    it('should render pay button for pending transactions', () => {
      renderBilling();
      const payButtons = screen.getAllByText('Pagar');
      expect(payButtons.length).toBeGreaterThan(0);
    });

    it('should open PIX modal when pay button is clicked', async () => {
      renderBilling();

      const payButton = screen.getByText('Pagar');
      fireEvent.click(payButton);

      await waitFor(() => {
        expect(screen.getByText('Pagar com PIX')).toBeInTheDocument();
      });
    });

    it('should display transaction amount in modal', async () => {
      renderBilling();

      const payButton = screen.getByText('Pagar');
      fireEvent.click(payButton);

      await waitFor(() => {
        expect(screen.getByText('Valor a pagar')).toBeInTheDocument();
      });
    });

    it('should close modal when fechar button is clicked', async () => {
      renderBilling();

      const payButton = screen.getByText('Pagar');
      fireEvent.click(payButton);

      await waitFor(() => {
        expect(screen.getByText('Pagar com PIX')).toBeInTheDocument();
      });

      const closeButton = screen.getByRole('button', { name: /fechar/i });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Pagar com PIX')).not.toBeInTheDocument();
      });
    });
  });
});
