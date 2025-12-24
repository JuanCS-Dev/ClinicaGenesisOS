/**
 * Payment Hooks Test Setup
 *
 * Shared mock data for payment hook tests.
 */

import type { Payment, PaymentSummary, PaymentIntentResponse } from '@/types';

export const mockPayment: Payment = {
  id: 'payment-123',
  clinicId: 'clinic-123',
  amount: 15000,
  currency: 'brl',
  status: 'awaiting_payment',
  description: 'Consulta médica',
  patientId: 'patient-123',
  patientName: 'João Silva',
  patientEmail: 'joao@email.com',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  pixData: {
    qrCode: 'pix-qr-code',
    qrCodeImage: 'data:image/png;base64,abc123',
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  },
};

export const mockSummary: PaymentSummary = {
  totalReceived: 50000,
  totalPending: 15000,
  totalRefunded: 5000,
  count: 10,
  periodStart: new Date().toISOString(),
  periodEnd: new Date().toISOString(),
};

export const mockPaymentIntent: PaymentIntentResponse = {
  id: 'pi_123',
  clientSecret: 'secret_123',
  status: 'requires_payment_method',
  amount: 15000,
  pix: {
    qrCode: 'pix-qr-code',
    qrCodeImage: 'data:image/png;base64,abc123',
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  },
};

/** Helper: Wait for hook to finish loading */
export const waitForLoaded = async (result: { current: { loading: boolean } }) => {
  const { waitFor } = await import('@testing-library/react');
  await waitFor(() => {
    if (result.current.loading) {
      throw new Error('Still loading');
    }
  });
};
