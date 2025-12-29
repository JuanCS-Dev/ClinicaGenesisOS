/**
 * PIX Payment Cloud Functions
 * ===========================
 *
 * Callable functions for PIX payment management.
 * Fase 10: PIX Integration
 *
 * SECURITY: API keys stored in Firebase Secret Manager
 *
 * @module functions/stripe/pix-payment
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import {
  getStripeClient,
  DEFAULT_PIX_EXPIRATION_MINUTES,
  MIN_PIX_AMOUNT,
  MAX_PIX_AMOUNT,
  isStripeConfigured,
} from './config.js'
import { STRIPE_SECRET_KEY } from '../config/secrets.js'
import type {
  CreatePaymentInput,
  PaymentIntentResponse,
  PaymentRecord,
  PixQRCode,
} from './types.js'

/**
 * Creates a PIX payment intent.
 *
 * @param clinicId - Clinic ID for multi-tenancy
 * @param input - Payment input data
 * @returns PaymentIntentResponse with QR code
 */
export const createPixPayment = onCall<{
  clinicId: string
  input: CreatePaymentInput
}>(
  {
    region: 'southamerica-east1',
    memory: '256MiB',
    timeoutSeconds: 30,
    secrets: [STRIPE_SECRET_KEY],
  },
  async request => {
    // Validate authentication
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated')
    }

    // Validate Stripe configuration
    if (!isStripeConfigured()) {
      throw new HttpsError('failed-precondition', 'Stripe not configured. Contact support.')
    }

    const { clinicId, input } = request.data

    // Validate required fields
    if (!clinicId) {
      throw new HttpsError('invalid-argument', 'clinicId is required')
    }

    if (!input?.amount) {
      throw new HttpsError('invalid-argument', 'amount is required')
    }

    if (!input?.description) {
      throw new HttpsError('invalid-argument', 'description is required')
    }

    // Validate amount range
    if (input.amount < MIN_PIX_AMOUNT) {
      throw new HttpsError(
        'invalid-argument',
        `Minimum amount is R$ ${(MIN_PIX_AMOUNT / 100).toFixed(2)}`
      )
    }

    if (input.amount > MAX_PIX_AMOUNT) {
      throw new HttpsError(
        'invalid-argument',
        `Maximum amount is R$ ${(MAX_PIX_AMOUNT / 100).toFixed(2)}`
      )
    }

    const stripe = getStripeClient()
    const db = getFirestore()

    // Calculate expiration
    const expirationMinutes = input.expirationMinutes || DEFAULT_PIX_EXPIRATION_MINUTES
    const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000)

    // Create Stripe PaymentIntent with PIX
    const paymentIntent = await stripe.paymentIntents.create({
      amount: input.amount,
      currency: 'brl',
      payment_method_types: ['pix'],
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
        pix: {
          expires_after_seconds: expirationMinutes * 60,
        },
      },
    })

    // Extract PIX data from next_action if available
    let pixData: PixQRCode | undefined
    const pixAction = paymentIntent.next_action?.pix_display_qr_code

    if (pixAction) {
      pixData = {
        qrCodeImage: pixAction.image_url_png || '',
        qrCodeText: pixAction.data || '',
        expiresAt: expiresAt.toISOString(),
      }
    }

    // Store payment record in Firestore
    const paymentRecord: Omit<PaymentRecord, 'createdAt' | 'updatedAt'> & {
      createdAt: FieldValue
      updatedAt: FieldValue
    } = {
      stripePaymentIntentId: paymentIntent.id,
      clinicId,
      amount: input.amount,
      currency: 'brl',
      status: 'awaiting_payment',
      method: 'pix',
      customerEmail: input.customerEmail,
      patientId: input.patientId,
      patientName: input.patientName,
      appointmentId: input.appointmentId,
      transactionId: input.transactionId,
      description: input.description,
      pixData,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy: request.auth.uid,
    }

    const docRef = await db
      .collection('clinics')
      .doc(clinicId)
      .collection('payments')
      .add(paymentRecord)

    // Return response
    const response: PaymentIntentResponse = {
      id: docRef.id,
      clientSecret: paymentIntent.client_secret || '',
      amount: input.amount,
      currency: 'brl',
      status: paymentIntent.status as PaymentIntentResponse['status'],
      method: 'pix',
      pix: pixData,
      metadata: {
        clinicId,
        patientId: input.patientId || '',
        appointmentId: input.appointmentId || '',
      },
      createdAt: new Date().toISOString(),
    }

    return response
  }
)

/**
 * Cancels a pending PIX payment.
 */
export const cancelPixPayment = onCall<{
  clinicId: string
  paymentId: string
}>(
  {
    region: 'southamerica-east1',
    memory: '256MiB',
    timeoutSeconds: 30,
    secrets: [STRIPE_SECRET_KEY],
  },
  async request => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated')
    }

    const { clinicId, paymentId } = request.data

    if (!clinicId || !paymentId) {
      throw new HttpsError('invalid-argument', 'clinicId and paymentId are required')
    }

    const stripe = getStripeClient()
    const db = getFirestore()

    // Get payment record
    const paymentDoc = await db
      .collection('clinics')
      .doc(clinicId)
      .collection('payments')
      .doc(paymentId)
      .get()

    if (!paymentDoc.exists) {
      throw new HttpsError('not-found', 'Payment not found')
    }

    const payment = paymentDoc.data() as PaymentRecord

    // Only allow cancelling pending payments
    if (payment.status !== 'awaiting_payment') {
      throw new HttpsError('failed-precondition', 'Only pending payments can be cancelled')
    }

    // Cancel on Stripe
    await stripe.paymentIntents.cancel(payment.stripePaymentIntentId)

    // Update Firestore
    await paymentDoc.ref.update({
      status: 'expired',
      updatedAt: FieldValue.serverTimestamp(),
    })

    return { success: true }
  }
)

/**
 * Refunds a completed PIX payment.
 */
export const refundPixPayment = onCall<{
  clinicId: string
  paymentId: string
  amount?: number
}>(
  {
    region: 'southamerica-east1',
    memory: '256MiB',
    timeoutSeconds: 30,
    secrets: [STRIPE_SECRET_KEY],
  },
  async request => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated')
    }

    const { clinicId, paymentId, amount } = request.data

    if (!clinicId || !paymentId) {
      throw new HttpsError('invalid-argument', 'clinicId and paymentId are required')
    }

    const stripe = getStripeClient()
    const db = getFirestore()

    // Get payment record
    const paymentDoc = await db
      .collection('clinics')
      .doc(clinicId)
      .collection('payments')
      .doc(paymentId)
      .get()

    if (!paymentDoc.exists) {
      throw new HttpsError('not-found', 'Payment not found')
    }

    const payment = paymentDoc.data() as PaymentRecord

    // Only allow refunding paid payments
    if (payment.status !== 'paid') {
      throw new HttpsError('failed-precondition', 'Only completed payments can be refunded')
    }

    // Validate refund amount
    const refundAmount = amount || payment.amount
    if (refundAmount > payment.amount) {
      throw new HttpsError('invalid-argument', 'Refund amount cannot exceed payment amount')
    }

    // Create refund on Stripe
    await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      amount: refundAmount,
    })

    // Update Firestore
    await paymentDoc.ref.update({
      status: 'refunded',
      refundAmount,
      updatedAt: FieldValue.serverTimestamp(),
    })

    return { success: true }
  }
)
