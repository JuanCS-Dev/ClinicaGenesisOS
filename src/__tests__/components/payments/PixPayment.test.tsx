/**
 * PixPayment Component Tests
 *
 * Comprehensive tests for PIX payment component with all states.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const mockRefresh = vi.fn();

vi.mock('../../../hooks/usePayment', () => ({
  usePayment: vi.fn(() => ({
    payment: {
      id: 'payment-123',
      amount: 15000,
      status: 'pending',
      pixData: {
        qrCodeImage: 'data:image/png;base64,test-qr-code',
        qrCodeText: '00020126580014br.gov.bcb.pix0136...',
      },
    },
    loading: false,
    timeRemaining: { minutes: 5, seconds: 0 },
    isExpired: false,
    error: null,
    refresh: mockRefresh,
  })),
}));

// Import after mock
import { usePayment } from '../../../hooks/usePayment';
const mockUsePayment = usePayment as ReturnType<typeof vi.fn>;

import { PixPayment } from '../../../components/payments/PixPayment';

describe('PixPayment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to default mock
    mockUsePayment.mockReturnValue({
      payment: {
        id: 'payment-123',
        amount: 15000,
        status: 'pending',
        pixData: {
          qrCodeImage: 'data:image/png;base64,test-qr-code',
          qrCodeText: '00020126580014br.gov.bcb.pix0136...',
        },
      },
      loading: false,
      timeRemaining: { minutes: 5, seconds: 0 },
      isExpired: false,
      error: null,
      refresh: mockRefresh,
    });

    // Mock clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('loading state', () => {
    beforeEach(() => {
      mockUsePayment.mockReturnValue({
        payment: null,
        loading: true,
        timeRemaining: null,
        isExpired: false,
        error: null,
        refresh: mockRefresh,
      });
    });

    it('should show loading spinner', () => {
      render(<PixPayment paymentId="payment-123" />);
      expect(document.querySelector('.animate-spin')).toBeTruthy();
    });

    it('should show loading text', () => {
      render(<PixPayment paymentId="payment-123" />);
      expect(screen.getByText('Carregando pagamento...')).toBeInTheDocument();
    });
  });

  describe('payment not found', () => {
    beforeEach(() => {
      mockUsePayment.mockReturnValue({
        payment: null,
        loading: false,
        timeRemaining: null,
        isExpired: false,
        error: null,
        refresh: mockRefresh,
      });
    });

    it('should show not found message', () => {
      render(<PixPayment paymentId="payment-123" />);
      expect(screen.getByText('Pagamento não encontrado')).toBeInTheDocument();
    });
  });

  describe('payment completed', () => {
    beforeEach(() => {
      mockUsePayment.mockReturnValue({
        payment: {
          id: 'payment-123',
          amount: 15000,
          status: 'paid',
          receiptUrl: 'https://receipt.example.com/123',
        },
        loading: false,
        timeRemaining: null,
        isExpired: false,
        error: null,
        refresh: mockRefresh,
      });
    });

    it('should show confirmation message', () => {
      render(<PixPayment paymentId="payment-123" />);
      expect(screen.getByText('Pagamento Confirmado!')).toBeInTheDocument();
    });

    it('should show payment amount', () => {
      render(<PixPayment paymentId="payment-123" />);
      expect(screen.getByText('R$ 150,00')).toBeInTheDocument();
    });

    it('should show receipt link when available', () => {
      render(<PixPayment paymentId="payment-123" />);
      expect(screen.getByText('Ver comprovante')).toBeInTheDocument();
    });

    it('should call onComplete callback', () => {
      const onComplete = vi.fn();
      render(<PixPayment paymentId="payment-123" onComplete={onComplete} />);
      expect(onComplete).toHaveBeenCalled();
    });
  });

  describe('payment expired', () => {
    beforeEach(() => {
      mockUsePayment.mockReturnValue({
        payment: {
          id: 'payment-123',
          amount: 15000,
          status: 'expired',
        },
        loading: false,
        timeRemaining: null,
        isExpired: true,
        error: null,
        refresh: mockRefresh,
      });
    });

    it('should show expired message', () => {
      render(<PixPayment paymentId="payment-123" />);
      expect(screen.getByText('PIX Expirado')).toBeInTheDocument();
    });

    it('should show expired description', () => {
      render(<PixPayment paymentId="payment-123" />);
      expect(screen.getByText('O tempo para pagamento expirou')).toBeInTheDocument();
    });

    it('should show retry button when onRetry provided', () => {
      render(<PixPayment paymentId="payment-123" onRetry={vi.fn()} />);
      expect(screen.getByText('Gerar novo PIX')).toBeInTheDocument();
    });

    it('should call onRetry when clicking retry button', () => {
      const onRetry = vi.fn();
      render(<PixPayment paymentId="payment-123" onRetry={onRetry} />);
      fireEvent.click(screen.getByText('Gerar novo PIX'));
      expect(onRetry).toHaveBeenCalled();
    });

    it('should call onExpire callback', () => {
      const onExpire = vi.fn();
      render(<PixPayment paymentId="payment-123" onExpire={onExpire} />);
      expect(onExpire).toHaveBeenCalled();
    });
  });

  describe('payment failed', () => {
    beforeEach(() => {
      mockUsePayment.mockReturnValue({
        payment: {
          id: 'payment-123',
          amount: 15000,
          status: 'failed',
          failureReason: 'Saldo insuficiente',
        },
        loading: false,
        timeRemaining: null,
        isExpired: false,
        error: null,
        refresh: mockRefresh,
      });
    });

    it('should show failed message', () => {
      render(<PixPayment paymentId="payment-123" />);
      expect(screen.getByText('Pagamento Falhou')).toBeInTheDocument();
    });

    it('should show failure reason', () => {
      render(<PixPayment paymentId="payment-123" />);
      expect(screen.getByText('Saldo insuficiente')).toBeInTheDocument();
    });

    it('should show retry button when onRetry provided', () => {
      render(<PixPayment paymentId="payment-123" onRetry={vi.fn()} />);
      expect(screen.getByText('Tentar novamente')).toBeInTheDocument();
    });

    it('should show generic failure message when no reason provided', () => {
      mockUsePayment.mockReturnValue({
        payment: {
          id: 'payment-123',
          amount: 15000,
          status: 'failed',
        },
        loading: false,
        timeRemaining: null,
        isExpired: false,
        error: null,
        refresh: mockRefresh,
      });

      render(<PixPayment paymentId="payment-123" />);
      expect(screen.getByText('Erro no processamento do pagamento')).toBeInTheDocument();
    });
  });

  describe('active payment - QR code', () => {
    it('should show PIX header', () => {
      render(<PixPayment paymentId="payment-123" />);
      expect(screen.getByText('PIX')).toBeInTheDocument();
    });

    it('should show payment amount', () => {
      render(<PixPayment paymentId="payment-123" />);
      expect(screen.getByText('R$ 150,00')).toBeInTheDocument();
    });

    it('should show QR code image', () => {
      render(<PixPayment paymentId="payment-123" />);
      const img = screen.getByAltText('QR Code PIX');
      expect(img).toBeInTheDocument();
    });

    it('should show countdown timer', () => {
      render(<PixPayment paymentId="payment-123" />);
      expect(screen.getByText(/Expira em/)).toBeInTheDocument();
    });

    it('should show copy button', () => {
      render(<PixPayment paymentId="payment-123" />);
      expect(screen.getByText('Copiar código PIX')).toBeInTheDocument();
    });

    it('should show payment instructions', () => {
      render(<PixPayment paymentId="payment-123" />);
      expect(
        screen.getByText(/Abra o app do seu banco e escolha pagar com PIX/)
      ).toBeInTheDocument();
    });

    it('should copy QR code text when clicking copy button', async () => {
      render(<PixPayment paymentId="payment-123" />);
      fireEvent.click(screen.getByText('Copiar código PIX'));

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
          '00020126580014br.gov.bcb.pix0136...'
        );
      });
    });

    it('should show "Copiado" after copying', async () => {
      render(<PixPayment paymentId="payment-123" />);
      fireEvent.click(screen.getByText('Copiar código PIX'));

      await waitFor(() => {
        expect(screen.getByText('Código copiado!')).toBeInTheDocument();
      });
    });
  });

  describe('compact mode', () => {
    it('should render compact version', () => {
      const { container } = render(
        <PixPayment paymentId="payment-123" compact />
      );
      // Compact mode has different classes
      expect(container.querySelector('.flex.items-center.gap-4')).toBeTruthy();
    });

    it('should show QR code in compact mode', () => {
      render(<PixPayment paymentId="payment-123" compact />);
      const img = screen.getByAltText('QR Code PIX');
      expect(img).toBeInTheDocument();
    });

    it('should show copy link in compact mode', () => {
      render(<PixPayment paymentId="payment-123" compact />);
      expect(screen.getByText('Copiar código')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle missing qrCodeImage gracefully', () => {
      mockUsePayment.mockReturnValue({
        payment: {
          id: 'payment-123',
          amount: 15000,
          status: 'pending',
          pixData: {
            qrCodeText: '00020126...',
          },
        },
        loading: false,
        timeRemaining: { minutes: 5, seconds: 0 },
        isExpired: false,
        error: null,
        refresh: mockRefresh,
      });

      const { container } = render(<PixPayment paymentId="payment-123" />);
      expect(container).toBeDefined();
    });

    it('should handle missing qrCodeText gracefully', () => {
      mockUsePayment.mockReturnValue({
        payment: {
          id: 'payment-123',
          amount: 15000,
          status: 'pending',
          pixData: {
            qrCodeImage: 'data:image/png;base64,test',
          },
        },
        loading: false,
        timeRemaining: { minutes: 5, seconds: 0 },
        isExpired: false,
        error: null,
        refresh: mockRefresh,
      });

      render(<PixPayment paymentId="payment-123" />);
      expect(screen.queryByText('Copiar código PIX')).not.toBeInTheDocument();
    });

    it('should handle copy error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn().mockRejectedValue(new Error('Copy failed')),
        },
      });

      render(<PixPayment paymentId="payment-123" />);
      fireEvent.click(screen.getByText('Copiar código PIX'));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to copy:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });
});
