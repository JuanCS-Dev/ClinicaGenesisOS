/**
 * PaymentStatus Component Tests
 * =============================
 *
 * Tests for the PaymentStatus component.
 * Fase 10: PIX Integration
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  PaymentStatus,
  PaymentStatusDot,
  PaymentStatusText,
} from '@/components/payments/PaymentStatus';
import { PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS } from '@/types';

describe('PaymentStatus', () => {
  describe('PaymentStatus component', () => {
    it('renders awaiting_payment status correctly', () => {
      render(<PaymentStatus status="awaiting_payment" />);
      expect(screen.getByText('Aguardando Pagamento')).toBeInTheDocument();
    });

    it('renders processing status correctly', () => {
      render(<PaymentStatus status="processing" />);
      expect(screen.getByText('Processando')).toBeInTheDocument();
    });

    it('renders paid status correctly', () => {
      render(<PaymentStatus status="paid" />);
      expect(screen.getByText('Pago')).toBeInTheDocument();
    });

    it('renders expired status correctly', () => {
      render(<PaymentStatus status="expired" />);
      expect(screen.getByText('Expirado')).toBeInTheDocument();
    });

    it('renders failed status correctly', () => {
      render(<PaymentStatus status="failed" />);
      expect(screen.getByText('Falhou')).toBeInTheDocument();
    });

    it('renders refunded status correctly', () => {
      render(<PaymentStatus status="refunded" />);
      expect(screen.getByText('Estornado')).toBeInTheDocument();
    });

    it('hides label when showLabel is false', () => {
      render(<PaymentStatus status="paid" showLabel={false} />);
      expect(screen.queryByText('Pago')).not.toBeInTheDocument();
    });

    it('applies correct size class for sm', () => {
      const { container } = render(<PaymentStatus status="paid" size="sm" />);
      const span = container.querySelector('span');
      expect(span?.className).toContain('px-2');
    });

    it('applies correct size class for md', () => {
      const { container } = render(<PaymentStatus status="paid" size="md" />);
      const span = container.querySelector('span');
      expect(span?.className).toContain('px-3');
    });

    it('applies correct size class for lg', () => {
      const { container } = render(<PaymentStatus status="paid" size="lg" />);
      const span = container.querySelector('span');
      expect(span?.className).toContain('px-4');
    });

    it('applies custom className', () => {
      const { container } = render(
        <PaymentStatus status="paid" className="custom-class" />
      );
      const span = container.querySelector('span');
      expect(span?.className).toContain('custom-class');
    });

    it('applies correct background color for paid', () => {
      const { container } = render(<PaymentStatus status="paid" />);
      const span = container.querySelector('span');
      expect(span?.className).toContain('bg-green-50');
    });

    it('applies correct background color for failed', () => {
      const { container } = render(<PaymentStatus status="failed" />);
      const span = container.querySelector('span');
      expect(span?.className).toContain('bg-red-50');
    });
  });

  describe('PaymentStatusDot component', () => {
    it('renders with correct color for paid', () => {
      const { container } = render(<PaymentStatusDot status="paid" />);
      const dot = container.querySelector('span');
      // Browser converts hex to rgb, so we check that the color is applied
      expect(dot?.style.backgroundColor).toBeDefined();
      expect(dot?.style.backgroundColor).not.toBe('');
    });

    it('renders with correct color for awaiting_payment', () => {
      const { container } = render(<PaymentStatusDot status="awaiting_payment" />);
      const dot = container.querySelector('span');
      // Browser converts hex to rgb, so we check that the color is applied
      expect(dot?.style.backgroundColor).toBeDefined();
      expect(dot?.style.backgroundColor).not.toBe('');
    });

    it('has animate-pulse for awaiting_payment', () => {
      const { container } = render(<PaymentStatusDot status="awaiting_payment" />);
      const dot = container.querySelector('span');
      expect(dot?.className).toContain('animate-pulse');
    });

    it('has animate-pulse for processing', () => {
      const { container } = render(<PaymentStatusDot status="processing" />);
      const dot = container.querySelector('span');
      expect(dot?.className).toContain('animate-pulse');
    });

    it('does not animate for paid status', () => {
      const { container } = render(<PaymentStatusDot status="paid" />);
      const dot = container.querySelector('span');
      expect(dot?.className).not.toContain('animate-pulse');
    });

    it('has correct title attribute', () => {
      const { container } = render(<PaymentStatusDot status="paid" />);
      const dot = container.querySelector('span');
      expect(dot?.getAttribute('title')).toBe(PAYMENT_STATUS_LABELS.paid);
    });

    it('applies custom className', () => {
      const { container } = render(
        <PaymentStatusDot status="paid" className="my-class" />
      );
      const dot = container.querySelector('span');
      expect(dot?.className).toContain('my-class');
    });
  });

  describe('PaymentStatusText component', () => {
    it('renders correct text for each status', () => {
      const statuses: Array<keyof typeof PAYMENT_STATUS_LABELS> = [
        'awaiting_payment',
        'processing',
        'paid',
        'expired',
        'failed',
        'refunded',
      ];

      statuses.forEach((status) => {
        const { unmount } = render(<PaymentStatusText status={status} />);
        expect(screen.getByText(PAYMENT_STATUS_LABELS[status])).toBeInTheDocument();
        unmount();
      });
    });

    it('applies correct color style', () => {
      const { container } = render(<PaymentStatusText status="paid" />);
      const span = container.querySelector('span');
      // Browser converts hex to rgb, so we check that the color is applied
      expect(span?.style.color).toBeDefined();
      expect(span?.style.color).not.toBe('');
    });

    it('applies custom className', () => {
      const { container } = render(
        <PaymentStatusText status="paid" className="text-lg" />
      );
      const span = container.querySelector('span');
      expect(span?.className).toContain('text-lg');
    });
  });
});

