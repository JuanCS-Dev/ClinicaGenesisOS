/**
 * Boleto Payment Cloud Functions
 * ==============================
 *
 * Callable functions for Boleto payment management via Stripe.
 * Fase 10: Payment Integration
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import {
  getStripeClient,
  DEFAULT_BOLETO_EXPIRATION_DAYS,
  MIN_BOLETO_AMOUNT,
  MAX_BOLETO_AMOUNT,
  isStripeConfigured,
} from './config.js';
import type {
  CreatePaymentInput,
  PaymentIntentResponse,
  PaymentRecord,
  BoletoData,
} from './types.js';

/**
 * Creates a Boleto payment intent.
 *
 * @param clinicId - Clinic ID for multi-tenancy
 * @param input - Payment input data
 * @returns PaymentIntentResponse with boleto URL
 */
export const createBoletoPayment = onCall<{
  clinicId: string;
  input: CreatePaymentInput;
}>(
  {
    region: 'southamerica-east1',
    memory: '256MiB',
    timeoutSeconds: 30,
  },
  async (request) => {
    // Validate authentication
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Validate Stripe configuration
    if (!isStripeConfigured()) {
      throw new HttpsError(
        'failed-precondition',
        'Stripe not configured. Contact support.'
      );
    }

    const { clinicId, input } = request.data;

    // Validate required fields
    if (!clinicId) {
      throw new HttpsError('invalid-argument', 'clinicId is required');
    }

    if (!input?.amount) {
      throw new HttpsError('invalid-argument', 'amount is required');
    }

    if (!input?.description) {
      throw new HttpsError('invalid-argument', 'description is required');
    }

    // Boleto requires customer info
    if (!input?.customerName) {
      throw new HttpsError('invalid-argument', 'customerName is required for Boleto');
    }

    if (!input?.customerTaxId) {
      throw new HttpsError('invalid-argument', 'customerTaxId (CPF/CNPJ) is required for Boleto');
    }

    if (!input?.customerEmail) {
      throw new HttpsError('invalid-argument', 'customerEmail is required for Boleto');
    }

    if (!input?.customerAddress) {
      throw new HttpsError('invalid-argument', 'customerAddress is required for Boleto');
    }

    // Validate amount range
    if (input.amount < MIN_BOLETO_AMOUNT) {
      throw new HttpsError(
        'invalid-argument',
        `Minimum amount is R$ ${(MIN_BOLETO_AMOUNT / 100).toFixed(2)}`
      );
    }

    if (input.amount > MAX_BOLETO_AMOUNT) {
      throw new HttpsError(
        'invalid-argument',
        `Maximum amount is R$ ${(MAX_BOLETO_AMOUNT / 100).toFixed(2)}`
      );
    }

    const stripe = getStripeClient();
    const db = getFirestore();

    // Calculate expiration (default 3 days for Boleto)
    const expirationDays = input.expirationMinutes
      ? Math.ceil(input.expirationMinutes / 1440)
      : DEFAULT_BOLETO_EXPIRATION_DAYS;
    const expiresAt = new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000);

    // Create or get Stripe customer
    const customers = await stripe.customers.list({
      email: input.customerEmail,
      limit: 1,
    });

    let customerId: string;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: input.customerEmail,
        name: input.customerName,
        tax_id_data: [
          {
            type: input.customerTaxId.length === 11 ? 'br_cpf' : 'br_cnpj',
            value: input.customerTaxId,
          },
        ],
        address: {
          line1: input.customerAddress.line1,
          city: input.customerAddress.city,
          state: input.customerAddress.state,
          postal_code: input.customerAddress.postalCode,
          country: input.customerAddress.country || 'BR',
        },
      });
      customerId = customer.id;
    }

    // Create Stripe PaymentIntent with Boleto
    const paymentIntent = await stripe.paymentIntents.create({
      amount: input.amount,
      currency: 'brl',
      customer: customerId,
      payment_method_types: ['boleto'],
      description: input.description,
      receipt_email: input.customerEmail,
      metadata: {
        clinicId,
        patientId: input.patientId || '',
        patientName: input.patientName || '',
        appointmentId: input.appointmentId || '',
        transactionId: input.transactionId || '',
        createdBy: request.auth.uid,
      },
      payment_method_options: {
        boleto: {
          expires_after_days: expirationDays,
        },
      },
    });

    // Extract Boleto data from next_action if available
    let boletoData: BoletoData | undefined;
    const boletoAction = paymentIntent.next_action?.boleto_display_details;

    if (boletoAction) {
      boletoData = {
        barcodeNumber: boletoAction.number || '',
        hostedVoucherUrl: boletoAction.hosted_voucher_url || '',
        expiresAt: expiresAt.toISOString(),
      };
    }

    // Store payment record in Firestore
    const paymentRecord: Omit<PaymentRecord, 'createdAt' | 'updatedAt'> & {
      createdAt: FieldValue;
      updatedAt: FieldValue;
    } = {
      stripePaymentIntentId: paymentIntent.id,
      clinicId,
      amount: input.amount,
      currency: 'brl',
      status: 'awaiting_payment',
      method: 'boleto',
      customerEmail: input.customerEmail,
      patientId: input.patientId,
      patientName: input.patientName,
      appointmentId: input.appointmentId,
      transactionId: input.transactionId,
      description: input.description,
      boletoData,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy: request.auth.uid,
    };

    const docRef = await db
      .collection('clinics')
      .doc(clinicId)
      .collection('payments')
      .add(paymentRecord);

    // Return response
    const response: PaymentIntentResponse = {
      id: docRef.id,
      clientSecret: paymentIntent.client_secret || '',
      amount: input.amount,
      currency: 'brl',
      status: paymentIntent.status as PaymentIntentResponse['status'],
      method: 'boleto',
      boleto: boletoData,
      metadata: {
        clinicId,
        patientId: input.patientId || '',
        appointmentId: input.appointmentId || '',
      },
      createdAt: new Date().toISOString(),
    };

    return response;
  }
);

/**
 * Cancels a pending Boleto payment.
 */
export const cancelBoletoPayment = onCall<{
  clinicId: string;
  paymentId: string;
}>(
  {
    region: 'southamerica-east1',
    memory: '256MiB',
    timeoutSeconds: 30,
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { clinicId, paymentId } = request.data;

    if (!clinicId || !paymentId) {
      throw new HttpsError('invalid-argument', 'clinicId and paymentId are required');
    }

    const stripe = getStripeClient();
    const db = getFirestore();

    // Get payment record
    const paymentDoc = await db
      .collection('clinics')
      .doc(clinicId)
      .collection('payments')
      .doc(paymentId)
      .get();

    if (!paymentDoc.exists) {
      throw new HttpsError('not-found', 'Payment not found');
    }

    const payment = paymentDoc.data() as PaymentRecord;

    // Only allow cancelling pending payments
    if (payment.status !== 'awaiting_payment') {
      throw new HttpsError(
        'failed-precondition',
        'Only pending payments can be cancelled'
      );
    }

    // Cancel on Stripe
    await stripe.paymentIntents.cancel(payment.stripePaymentIntentId);

    // Update Firestore
    await paymentDoc.ref.update({
      status: 'expired',
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { success: true };
  }
);

/**
 * Refunds a completed Boleto payment.
 */
export const refundBoletoPayment = onCall<{
  clinicId: string;
  paymentId: string;
  amount?: number;
}>(
  {
    region: 'southamerica-east1',
    memory: '256MiB',
    timeoutSeconds: 30,
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { clinicId, paymentId, amount } = request.data;

    if (!clinicId || !paymentId) {
      throw new HttpsError('invalid-argument', 'clinicId and paymentId are required');
    }

    const stripe = getStripeClient();
    const db = getFirestore();

    // Get payment record
    const paymentDoc = await db
      .collection('clinics')
      .doc(clinicId)
      .collection('payments')
      .doc(paymentId)
      .get();

    if (!paymentDoc.exists) {
      throw new HttpsError('not-found', 'Payment not found');
    }

    const payment = paymentDoc.data() as PaymentRecord;

    // Only allow refunding paid payments
    if (payment.status !== 'paid') {
      throw new HttpsError(
        'failed-precondition',
        'Only completed payments can be refunded'
      );
    }

    // Validate refund amount
    const refundAmount = amount || payment.amount;
    if (refundAmount > payment.amount) {
      throw new HttpsError(
        'invalid-argument',
        'Refund amount cannot exceed payment amount'
      );
    }

    // Create refund on Stripe
    await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      amount: refundAmount,
    });

    // Update Firestore
    await paymentDoc.ref.update({
      status: 'refunded',
      refundAmount,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { success: true };
  }
);

