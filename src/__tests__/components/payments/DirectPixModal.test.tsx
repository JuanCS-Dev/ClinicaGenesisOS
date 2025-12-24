/**
 * DirectPixModal Component Tests
 *
 * Uses real interface: DirectPixModalProps from component
 * Props: amountInCents, description, transactionId?, onClose, onConfirmPayment
 * Note: No isOpen prop - modal renders when component is mounted
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock pix config BEFORE importing component
vi.mock('../../../config/pix', () => ({
  PIX_CONFIG: {
    pixKey: 'test@email.com',
    pixKeyType: 'email',
    receiverName: 'CLINICA GENESIS',
    receiverCity: 'SAO PAULO',
    isEnabled: true,
  },
  isPixConfigured: vi.fn(() => true),
}));

// Mock pix service to avoid QR code generation
vi.mock('../../../services/pix.service', () => ({
  generateDirectPixQRCode: vi.fn().mockResolvedValue({
    qrCodeDataUrl: 'data:image/png;base64,test',
    pixCopiaECola: '00020126...',
  }),
  formatPixAmount: vi.fn((cents: number) => `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`),
}));

import { DirectPixModal } from '../../../components/payments/DirectPixModal';

describe('DirectPixModal', () => {
  const mockOnClose = vi.fn();
  const mockOnConfirmPayment = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('smoke tests', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <DirectPixModal
          amountInCents={15000}
          description="Consulta médica"
          onClose={mockOnClose}
          onConfirmPayment={mockOnConfirmPayment}
        />
      );
      expect(container).toBeDefined();
    });
  });

  describe('modal content', () => {
    it('should show PIX title', () => {
      render(
        <DirectPixModal
          amountInCents={15000}
          description="Consulta médica"
          onClose={mockOnClose}
          onConfirmPayment={mockOnConfirmPayment}
        />
      );
      // Modal title is "Pagamento PIX"
      const pixElements = screen.getAllByText(/PIX/i);
      expect(pixElements.length).toBeGreaterThan(0);
    });

    it('should render with transaction ID', () => {
      const { container } = render(
        <DirectPixModal
          amountInCents={25000}
          description="Exame laboratorial"
          transactionId="tx-123"
          onClose={mockOnClose}
          onConfirmPayment={mockOnConfirmPayment}
        />
      );
      expect(container).toBeDefined();
    });
  });
});
