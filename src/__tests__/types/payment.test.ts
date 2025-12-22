/**
 * Payment Types Tests
 * ===================
 *
 * Tests for payment type helpers and utilities.
 * Fase 10: PIX Integration
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  mapStripeStatus,
  isPixExpired,
  getPixTimeRemaining,
  formatPaymentAmount,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
} from '@/types/payment';

describe('Payment Types', () => {
  describe('mapStripeStatus', () => {
    it('maps succeeded to paid', () => {
      expect(mapStripeStatus('succeeded')).toBe('paid');
    });

    it('maps canceled to expired', () => {
      expect(mapStripeStatus('canceled')).toBe('expired');
    });

    it('maps processing to processing', () => {
      expect(mapStripeStatus('processing')).toBe('processing');
    });

    it('maps requires_payment_method to awaiting_payment', () => {
      expect(mapStripeStatus('requires_payment_method')).toBe('awaiting_payment');
    });

    it('maps requires_confirmation to awaiting_payment', () => {
      expect(mapStripeStatus('requires_confirmation')).toBe('awaiting_payment');
    });

    it('maps requires_action to awaiting_payment', () => {
      expect(mapStripeStatus('requires_action')).toBe('awaiting_payment');
    });

    it('maps requires_capture to awaiting_payment', () => {
      expect(mapStripeStatus('requires_capture')).toBe('awaiting_payment');
    });
  });

  describe('isPixExpired', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns false for future expiration', () => {
      const now = new Date('2025-12-22T10:00:00Z');
      vi.setSystemTime(now);

      const futureDate = new Date('2025-12-22T11:00:00Z').toISOString();
      expect(isPixExpired(futureDate)).toBe(false);
    });

    it('returns true for past expiration', () => {
      const now = new Date('2025-12-22T12:00:00Z');
      vi.setSystemTime(now);

      const pastDate = new Date('2025-12-22T11:00:00Z').toISOString();
      expect(isPixExpired(pastDate)).toBe(true);
    });

    it('returns true for time just passed (edge case)', () => {
      const now = new Date('2025-12-22T10:00:01Z');
      vi.setSystemTime(now);

      // 1 second ago
      const justPassed = new Date('2025-12-22T10:00:00Z').toISOString();
      expect(isPixExpired(justPassed)).toBe(true);
    });
  });

  describe('getPixTimeRemaining', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('calculates remaining time correctly', () => {
      const now = new Date('2025-12-22T10:00:00Z');
      vi.setSystemTime(now);

      // 30 minutes and 45 seconds from now
      const expiresAt = new Date('2025-12-22T10:30:45Z').toISOString();
      const result = getPixTimeRemaining(expiresAt);

      expect(result.minutes).toBe(30);
      expect(result.seconds).toBe(45);
      expect(result.expired).toBe(false);
    });

    it('returns zero and expired for past time', () => {
      const now = new Date('2025-12-22T12:00:00Z');
      vi.setSystemTime(now);

      const expiresAt = new Date('2025-12-22T11:00:00Z').toISOString();
      const result = getPixTimeRemaining(expiresAt);

      expect(result.minutes).toBe(0);
      expect(result.seconds).toBe(0);
      expect(result.expired).toBe(true);
    });

    it('handles exact expiration time', () => {
      const now = new Date('2025-12-22T10:00:00Z');
      vi.setSystemTime(now);

      const expiresAt = now.toISOString();
      const result = getPixTimeRemaining(expiresAt);

      expect(result.minutes).toBe(0);
      expect(result.seconds).toBe(0);
      expect(result.expired).toBe(true);
    });

    it('handles hours correctly', () => {
      const now = new Date('2025-12-22T10:00:00Z');
      vi.setSystemTime(now);

      // 1 hour 30 minutes from now
      const expiresAt = new Date('2025-12-22T11:30:00Z').toISOString();
      const result = getPixTimeRemaining(expiresAt);

      expect(result.minutes).toBe(90);
      expect(result.seconds).toBe(0);
      expect(result.expired).toBe(false);
    });
  });

  describe('formatPaymentAmount', () => {
    it('formats small amounts correctly', () => {
      const result = formatPaymentAmount(100);
      expect(result).toMatch(/R\$\s*1[,.]00/);
    });

    it('formats large amounts correctly', () => {
      const result = formatPaymentAmount(15000);
      expect(result).toMatch(/R\$\s*150[,.]00/);
    });

    it('formats amounts with cents correctly', () => {
      const result = formatPaymentAmount(15099);
      expect(result).toMatch(/R\$\s*150[,.]99/);
    });

    it('formats zero correctly', () => {
      const result = formatPaymentAmount(0);
      expect(result).toMatch(/R\$\s*0[,.]00/);
    });

    it('formats very large amounts', () => {
      const result = formatPaymentAmount(1000000);
      expect(result).toContain('10');
    });
  });

  describe('PAYMENT_STATUS_LABELS', () => {
    it('has labels for all statuses', () => {
      expect(PAYMENT_STATUS_LABELS.awaiting_payment).toBe('Aguardando Pagamento');
      expect(PAYMENT_STATUS_LABELS.processing).toBe('Processando');
      expect(PAYMENT_STATUS_LABELS.paid).toBe('Pago');
      expect(PAYMENT_STATUS_LABELS.expired).toBe('Expirado');
      expect(PAYMENT_STATUS_LABELS.failed).toBe('Falhou');
      expect(PAYMENT_STATUS_LABELS.refunded).toBe('Estornado');
    });
  });

  describe('PAYMENT_STATUS_COLORS', () => {
    it('has colors for all statuses', () => {
      expect(PAYMENT_STATUS_COLORS.awaiting_payment).toBe('#F59E0B');
      expect(PAYMENT_STATUS_COLORS.processing).toBe('#3B82F6');
      expect(PAYMENT_STATUS_COLORS.paid).toBe('#22C55E');
      expect(PAYMENT_STATUS_COLORS.expired).toBe('#6B7280');
      expect(PAYMENT_STATUS_COLORS.failed).toBe('#EF4444');
      expect(PAYMENT_STATUS_COLORS.refunded).toBe('#8B5CF6');
    });

    it('colors are valid hex colors', () => {
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

      Object.values(PAYMENT_STATUS_COLORS).forEach((color) => {
        expect(color).toMatch(hexColorRegex);
      });
    });
  });
});

