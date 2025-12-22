/**
 * Stripe Types for Cloud Functions
 * =================================
 *
 * Type definitions for Stripe payment integration.
 * Fase 10: Payment Integration (PIX + Boleto)
 */

/**
 * Supported payment methods.
 */
export type PaymentMethod = 'pix' | 'boleto';

/**
 * Payment status from Stripe.
 */
export type StripePaymentStatus =
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'requires_action'
  | 'processing'
  | 'requires_capture'
  | 'canceled'
  | 'succeeded';

/**
 * Display status for UI.
 */
export type PaymentDisplayStatus =
  | 'awaiting_payment'
  | 'processing'
  | 'paid'
  | 'expired'
  | 'failed'
  | 'refunded';

/**
 * PIX QR code data.
 */
export interface PixQRCode {
  qrCodeImage: string;
  qrCodeText: string;
  expiresAt: string;
}

/**
 * Boleto data.
 */
export interface BoletoData {
  barcodeNumber: string;
  hostedVoucherUrl: string;
  expiresAt: string;
}

/**
 * Input for creating a payment (generic).
 */
export interface CreatePaymentInput {
  method: PaymentMethod;
  amount: number;
  description: string;
  patientId?: string;
  patientName?: string;
  appointmentId?: string;
  transactionId?: string;
  customerEmail?: string;
  // Boleto-specific fields
  customerName?: string;
  customerTaxId?: string; // CPF or CNPJ
  customerAddress?: {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
  };
  expirationMinutes?: number;
}

/**
 * @deprecated Use CreatePaymentInput instead
 */
export type CreatePixPaymentInput = CreatePaymentInput;

/**
 * Payment intent response for frontend.
 */
export interface PaymentIntentResponse {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: StripePaymentStatus;
  method: PaymentMethod;
  pix?: PixQRCode;
  boleto?: BoletoData;
  metadata?: Record<string, string>;
  createdAt: string;
}

/**
 * Payment record in Firestore.
 */
export interface PaymentRecord {
  stripePaymentIntentId: string;
  clinicId: string;
  amount: number;
  currency: string;
  status: PaymentDisplayStatus;
  method: PaymentMethod;
  customerEmail?: string;
  patientId?: string;
  patientName?: string;
  appointmentId?: string;
  transactionId?: string;
  description: string;
  pixData?: PixQRCode;
  boletoData?: BoletoData;
  receiptUrl?: string;
  refundAmount?: number;
  failureReason?: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  paidAt?: FirebaseFirestore.Timestamp;
  createdBy: string;
}

/**
 * Stripe webhook event types we handle.
 */
export type StripeWebhookEventType =
  | 'payment_intent.succeeded'
  | 'payment_intent.payment_failed'
  | 'payment_intent.canceled'
  | 'charge.refunded';

/**
 * Maps Stripe status to display status.
 */
export function mapStripeStatus(stripeStatus: StripePaymentStatus): PaymentDisplayStatus {
  switch (stripeStatus) {
    case 'succeeded':
      return 'paid';
    case 'canceled':
      return 'expired';
    case 'processing':
      return 'processing';
    case 'requires_payment_method':
    case 'requires_confirmation':
    case 'requires_action':
    case 'requires_capture':
      return 'awaiting_payment';
    default:
      return 'awaiting_payment';
  }
}
