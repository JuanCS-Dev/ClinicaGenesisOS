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
import { getStripeClient, DEFAULT_PIX_EXPIRATION_MINUTES, isStripeConfigured } from './config.js'
import { STRIPE_SECRET_KEY } from '../config/secrets.js'
import { requireAuthRoleAndClinic, checkRateLimitForUser } from '../middleware/index.js'
import type { PaymentIntentResponse, PaymentRecord, PixQRCode } from './types.js'
import {
  CreatePixPaymentRequestSchema,
  CancelPaymentRequestSchema,
  RefundPaymentRequestSchema,
  formatZodError,
  type CreatePixPaymentRequest,
  type CancelPaymentRequest,
  type RefundPaymentRequest,
} from './payment-schemas.js'

/**
 * Creates a PIX payment intent.
 *
 * @param clinicId - Clinic ID for multi-tenancy
 * @param input - Payment input data
 * @returns PaymentIntentResponse with QR code
 */
export const createPixPayment = onCall<CreatePixPaymentRequest>(
  {
    region: 'southamerica-east1',
    memory: '256MiB',
    timeoutSeconds: 30,
    secrets: [STRIPE_SECRET_KEY],
  },
  async request => {
    // Validate input with Zod schema
    const parseResult = CreatePixPaymentRequestSchema.safeParse(request.data)
    if (!parseResult.success) {
      throw new HttpsError('invalid-argument', formatZodError(parseResult.error))
    }

    const { clinicId, input } = parseResult.data

    // Validate auth, role (professional+), and clinic access
    const authRequest = requireAuthRoleAndClinic(request, clinicId, [
      'owner',
      'admin',
      'professional',
    ])

    // Rate limiting for payment operations
    await checkRateLimitForUser(authRequest.userId, 'PAYMENT')

    // Validate Stripe configuration
    if (!isStripeConfigured()) {
      throw new HttpsError('failed-precondition', 'Stripe not configured. Contact support.')
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
        createdBy: authRequest.userId,
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
      createdBy: authRequest.userId,
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
export const cancelPixPayment = onCall<CancelPaymentRequest>(
  {
    region: 'southamerica-east1',
    memory: '256MiB',
    timeoutSeconds: 30,
    secrets: [STRIPE_SECRET_KEY],
  },
  async request => {
    // Validate input with Zod schema
    const parseResult = CancelPaymentRequestSchema.safeParse(request.data)
    if (!parseResult.success) {
      throw new HttpsError('invalid-argument', formatZodError(parseResult.error))
    }

    const { clinicId, paymentId } = parseResult.data

    // Validate auth, role (professional+), and clinic access
    const authRequest = requireAuthRoleAndClinic(request, clinicId, [
      'owner',
      'admin',
      'professional',
    ])

    // Rate limiting
    await checkRateLimitForUser(authRequest.userId, 'PAYMENT')

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
 * Requires admin+ role.
 */
export const refundPixPayment = onCall<RefundPaymentRequest>(
  {
    region: 'southamerica-east1',
    memory: '256MiB',
    timeoutSeconds: 30,
    secrets: [STRIPE_SECRET_KEY],
  },
  async request => {
    // Validate input with Zod schema
    const parseResult = RefundPaymentRequestSchema.safeParse(request.data)
    if (!parseResult.success) {
      throw new HttpsError('invalid-argument', formatZodError(parseResult.error))
    }

    const { clinicId, paymentId, amount } = parseResult.data

    // Validate auth, role (admin+ for refunds), and clinic access
    const authRequest = requireAuthRoleAndClinic(request, clinicId, ['owner', 'admin'])

    // Rate limiting
    await checkRateLimitForUser(authRequest.userId, 'PAYMENT')

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
