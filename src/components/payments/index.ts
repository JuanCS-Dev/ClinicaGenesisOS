/**
 * Payments Components Module
 * ==========================
 *
 * Re-exports all payment-related components.
 * Fase 10: Payment Integration (PIX + Boleto)
 */

// Direct PIX (0% fees - uses clinic's PIX key from .env)
export { DirectPixPayment } from './DirectPixPayment';
export { DirectPixModal } from './DirectPixModal';

// Stripe-based payments (for webhook tracking)
export { PixPayment } from './PixPayment';
export { PaymentStatus, PaymentStatusDot, PaymentStatusText } from './PaymentStatus';
export { InvoiceGenerator } from './InvoiceGenerator';
export { PixPaymentModal } from './PixPaymentModal';

