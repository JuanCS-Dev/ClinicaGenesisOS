/**
 * Payment Types Module
 * ====================
 *
 * Types for PIX, Boleto, and Stripe payment integration.
 * Fase 10: Payment Integration (PIX + Boleto)
 *
 * Stripe Payment Flow:
 * 1. Create PaymentIntent with payment_method_types: ['pix'] or ['boleto']
 * 2. For PIX: Generate QR code from pix.qr_code
 * 3. For Boleto: Generate PDF/barcode from boleto.hosted_voucher_url
 * 4. Customer pays via bank app / lotérica
 * 5. Webhook confirms payment
 * 6. Transaction marked as paid
 */

/**
 * Payment provider options.
 */
export type PaymentProvider = 'stripe' | 'manual';

/**
 * PIX payment status from Stripe.
 */
export type PixPaymentStatus =
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'requires_action'
  | 'processing'
  | 'requires_capture'
  | 'canceled'
  | 'succeeded';

/**
 * Payment intent status mapped to user-friendly status.
 */
export type PaymentDisplayStatus =
  | 'awaiting_payment'
  | 'processing'
  | 'paid'
  | 'expired'
  | 'failed'
  | 'refunded';

/**
 * Supported instant payment methods.
 */
export type InstantPaymentMethod = 'pix' | 'boleto';

/**
 * PIX provider - direct (free) or via Stripe (with fees).
 */
export type PixProvider = 'direct' | 'stripe';

/**
 * PIX key types.
 */
export type PixKeyType = 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';

/**
 * Clinic PIX configuration.
 */
export interface ClinicPixConfig {
  /** PIX key value */
  pixKey: string;
  /** PIX key type */
  pixKeyType: PixKeyType;
  /** Receiver name (will appear on payer's app) */
  receiverName: string;
  /** Receiver city */
  receiverCity: string;
  /** Whether PIX is enabled */
  enabled: boolean;
}

/**
 * PIX QR Code data from Stripe.
 */
export interface PixQRCode {
  /** Base64 encoded QR code image */
  qrCodeImage: string;
  /** PIX copy-paste code (copia e cola) */
  qrCodeText: string;
  /** Expiration timestamp (ISO string) */
  expiresAt: string;
}

/**
 * Boleto data from Stripe.
 */
export interface BoletoData {
  /** Boleto barcode number (linha digitável) */
  barcodeNumber: string;
  /** URL to hosted boleto PDF */
  hostedVoucherUrl: string;
  /** Expiration date (ISO string) */
  expiresAt: string;
}

/**
 * Stripe Payment Intent response (frontend-safe subset).
 */
export interface PaymentIntentResponse {
  /** Stripe PaymentIntent ID */
  id: string;
  /** Client secret for frontend confirmation */
  clientSecret: string;
  /** Amount in cents */
  amount: number;
  /** Currency (BRL) */
  currency: string;
  /** Current status */
  status: PixPaymentStatus;
  /** Payment method used */
  method: InstantPaymentMethod;
  /** PIX-specific data */
  pix?: PixQRCode;
  /** Boleto-specific data */
  boleto?: BoletoData;
  /** Metadata attached to payment */
  metadata?: Record<string, string>;
  /** Created timestamp */
  createdAt: string;
}

/**
 * Input for creating a payment (PIX or Boleto).
 */
export interface CreatePaymentInput {
  /** Payment method: 'pix' or 'boleto' */
  method: InstantPaymentMethod;
  /** Amount in cents (BRL) */
  amount: number;
  /** Payment description */
  description: string;
  /** Related patient ID (optional) */
  patientId?: string;
  /** Related patient name (optional) */
  patientName?: string;
  /** Related appointment ID (optional) */
  appointmentId?: string;
  /** Related transaction ID (optional) */
  transactionId?: string;
  /** Customer email for receipt */
  customerEmail?: string;
  /** Customer CPF/CNPJ (required for Boleto) */
  customerTaxId?: string;
  /** Customer name (required for Boleto) */
  customerName?: string;
  /** Customer address (required for Boleto) */
  customerAddress?: {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
  };
  /** Expiration in minutes (PIX: default 60, Boleto: default 3 days) */
  expirationMinutes?: number;
}

/**
 * @deprecated Use CreatePaymentInput instead
 */
export type CreatePixPaymentInput = CreatePaymentInput;

/**
 * Payment record stored in Firestore.
 */
export interface Payment {
  /** Document ID */
  id: string;
  /** Stripe PaymentIntent ID */
  stripePaymentIntentId: string;
  /** Clinic ID (multi-tenancy) */
  clinicId: string;
  /** Amount in cents */
  amount: number;
  /** Currency */
  currency: string;
  /** Current status */
  status: PaymentDisplayStatus;
  /** Payment method */
  method: InstantPaymentMethod;
  /** Customer email */
  customerEmail?: string;
  /** Related patient ID */
  patientId?: string;
  /** Patient name (denormalized) */
  patientName?: string;
  /** Related appointment ID */
  appointmentId?: string;
  /** Related transaction ID */
  transactionId?: string;
  /** Description */
  description: string;
  /** PIX QR code data (only while awaiting) */
  pixData?: PixQRCode;
  /** Boleto data (only while awaiting) */
  boletoData?: BoletoData;
  /** Stripe receipt URL (after payment) */
  receiptUrl?: string;
  /** Refund amount if refunded */
  refundAmount?: number;
  /** Failure reason if failed */
  failureReason?: string;
  /** Created timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
  /** Paid timestamp */
  paidAt?: string;
  /** Created by user ID */
  createdBy: string;
}

/**
 * Input for creating a Payment record in Firestore.
 */
export interface CreatePaymentRecordInput {
  stripePaymentIntentId: string;
  method: InstantPaymentMethod;
  amount: number;
  currency: string;
  customerEmail?: string;
  patientId?: string;
  patientName?: string;
  appointmentId?: string;
  transactionId?: string;
  description: string;
  pixData?: PixQRCode;
  boletoData?: BoletoData;
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
 * Stripe webhook payload (simplified).
 */
export interface StripeWebhookPayload {
  id: string;
  type: StripeWebhookEventType;
  data: {
    object: {
      id: string;
      amount: number;
      currency: string;
      status: PixPaymentStatus;
      metadata?: Record<string, string>;
      receipt_url?: string;
      last_payment_error?: {
        message: string;
      };
    };
  };
}

/**
 * Invoice data for PDF generation.
 */
export interface Invoice {
  /** Invoice number */
  number: string;
  /** Clinic info */
  clinic: {
    name: string;
    cnpj: string;
    address: string;
    phone: string;
    email: string;
  };
  /** Customer info */
  customer: {
    name: string;
    cpf?: string;
    email?: string;
    phone?: string;
  };
  /** Line items */
  items: InvoiceItem[];
  /** Subtotal in cents */
  subtotal: number;
  /** Discount in cents */
  discount?: number;
  /** Total in cents */
  total: number;
  /** Issue date (ISO string) */
  issuedAt: string;
  /** Due date (ISO string) */
  dueDate?: string;
  /** Payment method */
  paymentMethod: 'pix' | 'boleto' | 'credit_card' | 'cash' | 'bank_transfer';
  /** Status */
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  /** Notes */
  notes?: string;
}

/**
 * Invoice line item.
 */
export interface InvoiceItem {
  /** Item description */
  description: string;
  /** Quantity */
  quantity: number;
  /** Unit price in cents */
  unitPrice: number;
  /** Total (quantity * unitPrice) in cents */
  total: number;
}

/**
 * Payment summary for dashboard.
 */
export interface PaymentSummary {
  /** Total received in cents */
  totalReceived: number;
  /** Total pending in cents */
  totalPending: number;
  /** Total refunded in cents */
  totalRefunded: number;
  /** Number of successful payments */
  successCount: number;
  /** Number of pending payments */
  pendingCount: number;
  /** Number of failed payments */
  failedCount: number;
  /** Average payment amount in cents */
  averageAmount: number;
}

/**
 * Payment filters for queries.
 */
export interface PaymentFilters {
  status?: PaymentDisplayStatus;
  startDate?: string;
  endDate?: string;
  patientId?: string;
  minAmount?: number;
  maxAmount?: number;
}

/**
 * Status labels in Portuguese.
 */
export const PAYMENT_STATUS_LABELS: Record<PaymentDisplayStatus, string> = {
  awaiting_payment: 'Aguardando Pagamento',
  processing: 'Processando',
  paid: 'Pago',
  expired: 'Expirado',
  failed: 'Falhou',
  refunded: 'Estornado',
};

/**
 * Status colors for UI.
 */
export const PAYMENT_STATUS_COLORS: Record<PaymentDisplayStatus, string> = {
  awaiting_payment: '#F59E0B', // amber
  processing: '#3B82F6', // blue
  paid: '#22C55E', // green
  expired: '#6B7280', // gray
  failed: '#EF4444', // red
  refunded: '#8B5CF6', // purple
};

/**
 * Maps Stripe status to display status.
 */
export function mapStripeStatus(stripeStatus: PixPaymentStatus): PaymentDisplayStatus {
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

/**
 * Checks if a PIX payment has expired.
 */
export function isPixExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date();
}

/**
 * Calculates remaining time for PIX payment.
 */
export function getPixTimeRemaining(expiresAt: string): {
  minutes: number;
  seconds: number;
  expired: boolean;
} {
  const now = new Date().getTime();
  const expiry = new Date(expiresAt).getTime();
  const diff = expiry - now;

  if (diff <= 0) {
    return { minutes: 0, seconds: 0, expired: true };
  }

  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  return { minutes, seconds, expired: false };
}

/**
 * Formats amount from cents to BRL currency string.
 */
export function formatPaymentAmount(amountInCents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amountInCents / 100);
}

