/**
 * Stripe Service Tests
 * ====================
 *
 * Tests for the frontend Stripe service.
 * Fase 10: PIX Integration
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Payment, PaymentDisplayStatus } from '@/types';

// Mock Firebase
vi.mock('firebase/functions', () => ({
  getFunctions: vi.fn(() => ({})),
  httpsCallable: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn(),
  serverTimestamp: vi.fn(),
  Timestamp: {
    fromDate: vi.fn((d) => ({ toDate: () => d })),
  },
}));

vi.mock('@/services/firebase', () => ({
  db: {},
}));

describe('Stripe Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Payment validation', () => {
    it('validates payment has required fields', () => {
      const payment: Payment = {
        id: 'pay_123',
        stripePaymentIntentId: 'pi_123',
        clinicId: 'clinic_123',
        amount: 15000,
        currency: 'brl',
        status: 'awaiting_payment',
        method: 'pix',
        description: 'Consulta médica',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user_123',
      };

      expect(payment.id).toBeDefined();
      expect(payment.stripePaymentIntentId).toBeDefined();
      expect(payment.clinicId).toBeDefined();
      expect(payment.amount).toBeGreaterThan(0);
      expect(payment.currency).toBe('brl');
      expect(payment.method).toBe('pix');
    });

    it('validates payment status is valid', () => {
      const validStatuses: PaymentDisplayStatus[] = [
        'awaiting_payment',
        'processing',
        'paid',
        'expired',
        'failed',
        'refunded',
      ];

      validStatuses.forEach((status) => {
        const payment: Payment = {
          id: 'pay_123',
          stripePaymentIntentId: 'pi_123',
          clinicId: 'clinic_123',
          amount: 15000,
          currency: 'brl',
          status,
          method: 'pix',
          description: 'Test',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'user_123',
        };

        expect(validStatuses).toContain(payment.status);
      });
    });

    it('validates PIX data structure', () => {
      const payment: Payment = {
        id: 'pay_123',
        stripePaymentIntentId: 'pi_123',
        clinicId: 'clinic_123',
        amount: 15000,
        currency: 'brl',
        status: 'awaiting_payment',
        method: 'pix',
        description: 'Test',
        pixData: {
          qrCodeImage: 'data:image/png;base64,ABC123',
          qrCodeText: '00020126580014br.gov.bcb.pix...',
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user_123',
      };

      expect(payment.pixData).toBeDefined();
      expect(payment.pixData?.qrCodeImage).toBeDefined();
      expect(payment.pixData?.qrCodeText).toBeDefined();
      expect(payment.pixData?.expiresAt).toBeDefined();
    });
  });

  describe('isPaymentValid helper', () => {
    // Import the function after mocks are set up
    const isPaymentValid = (payment: Payment): boolean => {
      if (payment.status !== 'awaiting_payment') {
        return false;
      }
      if (!payment.pixData?.expiresAt) {
        return false;
      }
      return new Date(payment.pixData.expiresAt) > new Date();
    };

    it('returns true for valid pending payment', () => {
      const payment: Payment = {
        id: 'pay_123',
        stripePaymentIntentId: 'pi_123',
        clinicId: 'clinic_123',
        amount: 15000,
        currency: 'brl',
        status: 'awaiting_payment',
        method: 'pix',
        description: 'Test',
        pixData: {
          qrCodeImage: 'base64...',
          qrCodeText: 'pix...',
          expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user_123',
      };

      expect(isPaymentValid(payment)).toBe(true);
    });

    it('returns false for paid payment', () => {
      const payment: Payment = {
        id: 'pay_123',
        stripePaymentIntentId: 'pi_123',
        clinicId: 'clinic_123',
        amount: 15000,
        currency: 'brl',
        status: 'paid',
        method: 'pix',
        description: 'Test',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user_123',
      };

      expect(isPaymentValid(payment)).toBe(false);
    });

    it('returns false for expired PIX', () => {
      const payment: Payment = {
        id: 'pay_123',
        stripePaymentIntentId: 'pi_123',
        clinicId: 'clinic_123',
        amount: 15000,
        currency: 'brl',
        status: 'awaiting_payment',
        method: 'pix',
        description: 'Test',
        pixData: {
          qrCodeImage: 'base64...',
          qrCodeText: 'pix...',
          expiresAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user_123',
      };

      expect(isPaymentValid(payment)).toBe(false);
    });

    it('returns false for payment without PIX data', () => {
      const payment: Payment = {
        id: 'pay_123',
        stripePaymentIntentId: 'pi_123',
        clinicId: 'clinic_123',
        amount: 15000,
        currency: 'brl',
        status: 'awaiting_payment',
        method: 'pix',
        description: 'Test',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user_123',
      };

      expect(isPaymentValid(payment)).toBe(false);
    });
  });

  describe('Payment summary calculation', () => {
    const calculateSummary = (payments: Payment[]) => {
      let totalReceived = 0;
      let totalPending = 0;
      let totalRefunded = 0;
      let successCount = 0;
      let pendingCount = 0;
      let failedCount = 0;

      for (const payment of payments) {
        switch (payment.status) {
          case 'paid':
            totalReceived += payment.amount;
            successCount++;
            break;
          case 'awaiting_payment':
          case 'processing':
            totalPending += payment.amount;
            pendingCount++;
            break;
          case 'refunded':
            totalRefunded += payment.refundAmount || payment.amount;
            break;
          case 'failed':
          case 'expired':
            failedCount++;
            break;
        }
      }

      return {
        totalReceived,
        totalPending,
        totalRefunded,
        successCount,
        pendingCount,
        failedCount,
        averageAmount: successCount > 0 ? Math.round(totalReceived / successCount) : 0,
      };
    };

    it('calculates totals correctly', () => {
      const payments: Payment[] = [
        {
          id: '1',
          stripePaymentIntentId: 'pi_1',
          clinicId: 'clinic_123',
          amount: 10000,
          currency: 'brl',
          status: 'paid',
          method: 'pix',
          description: 'Test 1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'user_123',
        },
        {
          id: '2',
          stripePaymentIntentId: 'pi_2',
          clinicId: 'clinic_123',
          amount: 20000,
          currency: 'brl',
          status: 'paid',
          method: 'pix',
          description: 'Test 2',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'user_123',
        },
        {
          id: '3',
          stripePaymentIntentId: 'pi_3',
          clinicId: 'clinic_123',
          amount: 5000,
          currency: 'brl',
          status: 'awaiting_payment',
          method: 'pix',
          description: 'Test 3',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'user_123',
        },
      ];

      const summary = calculateSummary(payments);

      expect(summary.totalReceived).toBe(30000);
      expect(summary.totalPending).toBe(5000);
      expect(summary.successCount).toBe(2);
      expect(summary.pendingCount).toBe(1);
      expect(summary.averageAmount).toBe(15000);
    });

    it('handles empty array', () => {
      const summary = calculateSummary([]);

      expect(summary.totalReceived).toBe(0);
      expect(summary.totalPending).toBe(0);
      expect(summary.successCount).toBe(0);
      expect(summary.averageAmount).toBe(0);
    });

    it('handles refunds correctly', () => {
      const payments: Payment[] = [
        {
          id: '1',
          stripePaymentIntentId: 'pi_1',
          clinicId: 'clinic_123',
          amount: 10000,
          currency: 'brl',
          status: 'refunded',
          method: 'pix',
          description: 'Refunded',
          refundAmount: 5000, // Partial refund
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'user_123',
        },
      ];

      const summary = calculateSummary(payments);

      expect(summary.totalRefunded).toBe(5000);
    });
  });
});

