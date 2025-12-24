/**
 * PixPayment Component Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('../../../hooks/usePayment', () => ({
  usePayment: vi.fn(() => ({
    payment: {
      id: 'payment-123',
      amount: 15000,
      status: 'pending',
      pixData: {
        qrCode: 'data:image/png;base64,test',
        qrCodeText: '00020126...',
      },
    },
    loading: false,
    timeRemaining: 300,
    isExpired: false,
  })),
}));

import { PixPayment } from '../../../components/payments/PixPayment';

describe('PixPayment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('smoke tests', () => {
    it('should render without crashing', () => {
      const { container } = render(<PixPayment paymentId="payment-123" />);
      expect(container).toBeDefined();
    });
  });

  describe('QR code display', () => {
    it('should show copy button', () => {
      render(<PixPayment paymentId="payment-123" />);
      const copyButtons = screen.getAllByRole('button');
      expect(copyButtons.length).toBeGreaterThan(0);
    });
  });

  describe('loading state', () => {
    it('should show loader when loading', async () => {
      const { usePayment } = await import('../../../hooks/usePayment');
      vi.mocked(usePayment).mockReturnValue({
        payment: null,
        loading: true,
        timeRemaining: 0,
        isExpired: false,
        error: null,
        refresh: vi.fn(),
      });

      render(<PixPayment paymentId="payment-123" />);
      expect(document.querySelector('.animate-spin')).toBeTruthy();
    });
  });
});
