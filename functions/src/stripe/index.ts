/**
 * Stripe Module Exports
 * =====================
 *
 * Re-exports all Stripe-related Cloud Functions.
 * Fase 10: Payment Integration (PIX + Boleto)
 */

// PIX payments (requires Stripe PIX capability - may not be available)
export { createPixPayment, cancelPixPayment, refundPixPayment } from './pix-payment.js';

// Boleto payments (active and available)
export { createBoletoPayment, cancelBoletoPayment, refundBoletoPayment } from './boleto-payment.js';

// Webhook handler for payment status updates
export { stripeWebhook } from './webhook.js';

