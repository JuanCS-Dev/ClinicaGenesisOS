/**
 * PixPaymentModal Component Tests
 *
 * Uses real interface: PixPaymentModalProps from component
 * Props: isOpen, onClose, patient?, appointmentId?, transactionId?, initialAmount?, initialDescription?, onComplete?
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock useCreatePixPayment hook
vi.mock('../../../hooks/usePayment', () => ({
  useCreatePixPayment: vi.fn(() => ({
    createPayment: vi.fn().mockResolvedValue({ id: 'payment-123' }),
    creating: false,
    paymentIntent: null,
    error: null,
    reset: vi.fn(),
  })),
}));

import { PixPaymentModal } from '../../../components/payments/PixPaymentModal';

describe('PixPaymentModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('smoke tests', () => {
    it('should render without crashing when open', () => {
      const { container } = render(
        <PixPaymentModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );
      expect(container).toBeDefined();
    });

    it('should not render content when closed', () => {
      render(
        <PixPaymentModal
          isOpen={false}
          onClose={mockOnClose}
        />
      );
      // Modal content should not be visible when closed
      expect(screen.queryByText(/Novo Pagamento PIX/i)).not.toBeInTheDocument();
    });
  });

  describe('modal content', () => {
    it('should show form step title when open', () => {
      render(
        <PixPaymentModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );
      // Initial step is 'form' with title "Novo Pagamento PIX"
      expect(screen.getByText(/Novo Pagamento PIX/i)).toBeInTheDocument();
    });

    it('should show patient name in description when provided', () => {
      render(
        <PixPaymentModal
          isOpen={true}
          onClose={mockOnClose}
          patient={{
            id: 'patient-123',
            name: 'Maria Santos',
            email: 'maria@email.com',
          }}
        />
      );
      // Patient name appears in description
      const patientElements = screen.getAllByText(/Maria Santos/i);
      expect(patientElements.length).toBeGreaterThan(0);
    });

    it('should have amount input', () => {
      render(
        <PixPaymentModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );
      // Amount input exists (with R$ prefix)
      const amountInput = screen.getByPlaceholderText('0,00');
      expect(amountInput).toBeInTheDocument();
    });

    it('should show initial amount when provided', () => {
      render(
        <PixPaymentModal
          isOpen={true}
          onClose={mockOnClose}
          initialAmount={15000}
        />
      );
      // initialAmount is in cents, divided by 100 for display
      const amountInput = screen.getByDisplayValue('150');
      expect(amountInput).toBeInTheDocument();
    });

    it('should have description input', () => {
      render(
        <PixPaymentModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByPlaceholderText(/Ex: Consulta médica/i)).toBeInTheDocument();
    });
  });
});
