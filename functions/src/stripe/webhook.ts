/**
 * Stripe Webhook Handler
 * ======================
 *
 * Handles Stripe webhook events for PIX payments.
 * Fase 10: PIX Integration
 *
 * Events handled:
 * - payment_intent.succeeded: Payment completed
 * - payment_intent.payment_failed: Payment failed
 * - payment_intent.canceled: Payment cancelled/expired
 * - charge.refunded: Payment refunded
 */

import { onRequest } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStripeClient, getWebhookSecret, isStripeConfigured } from './config.js';
import type { PaymentDisplayStatus } from './types.js';
import type Stripe from 'stripe';

/**
 * Stripe webhook endpoint.
 * Receives events from Stripe and updates Firestore accordingly.
 */
export const stripeWebhook = onRequest(
  {
    region: 'southamerica-east1',
    memory: '256MiB',
    timeoutSeconds: 60,
    // Raw body is needed for signature verification
    invoker: 'public',
  },
  async (req, res) => {
    // Only accept POST requests
    if (req.method !== 'POST') {
      res.status(405).send('Method not allowed');
      return;
    }

    // Check if Stripe is configured
    if (!isStripeConfigured()) {
      console.error('Stripe not configured');
      res.status(500).send('Stripe not configured');
      return;
    }

    const stripe = getStripeClient();
    const webhookSecret = getWebhookSecret();
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      console.error('Missing stripe-signature header');
      res.status(400).send('Missing signature');
      return;
    }

    let event: Stripe.Event;

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      res.status(400).send('Invalid signature');
      return;
    }

    const db = getFirestore();

    try {
      // Handle event based on type
      switch (event.type) {
        case 'payment_intent.succeeded':
          await handlePaymentSucceeded(db, event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.payment_failed':
          await handlePaymentFailed(db, event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.canceled':
          await handlePaymentCanceled(db, event.data.object as Stripe.PaymentIntent);
          break;

        case 'charge.refunded':
          await handleChargeRefunded(db, event.data.object as Stripe.Charge);
          break;

        default:
          logger.info(`Unhandled event type: ${event.type}`);
      }

      res.status(200).json({ received: true });
    } catch (err) {
      console.error('Error handling webhook event:', err);
      res.status(500).send('Webhook handler error');
    }
  }
);

/**
 * Handles successful payment.
 */
async function handlePaymentSucceeded(
  db: FirebaseFirestore.Firestore,
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  const clinicId = paymentIntent.metadata?.clinicId;
  if (!clinicId) {
    console.error('Missing clinicId in payment metadata');
    return;
  }

  // Find payment by Stripe ID
  const snapshot = await db
    .collection('clinics')
    .doc(clinicId)
    .collection('payments')
    .where('stripePaymentIntentId', '==', paymentIntent.id)
    .limit(1)
    .get();

  if (snapshot.empty) {
    console.error(`Payment not found for PaymentIntent: ${paymentIntent.id}`);
    return;
  }

  const paymentDoc = snapshot.docs[0];

  // Get receipt URL from latest charge
  let receiptUrl: string | undefined;
  if (paymentIntent.latest_charge) {
    try {
      const stripe = getStripeClient();
      const charge = await stripe.charges.retrieve(
        paymentIntent.latest_charge as string
      );
      receiptUrl = charge.receipt_url || undefined;
    } catch (err) {
      console.error('Error fetching charge:', err);
    }
  }

  // Update payment status
  await paymentDoc.ref.update({
    status: 'paid' as PaymentDisplayStatus,
    receiptUrl,
    paidAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    // Clear PIX data as it's no longer needed
    pixData: FieldValue.delete(),
  });

  logger.info(`Payment ${paymentDoc.id} marked as paid`);

  // Update related transaction if exists
  const transactionId = paymentIntent.metadata?.transactionId;
  if (transactionId) {
    await db
      .collection('clinics')
      .doc(clinicId)
      .collection('transactions')
      .doc(transactionId)
      .update({
        status: 'paid',
        paidAt: new Date().toISOString(),
        paymentMethod: 'pix',
        updatedAt: FieldValue.serverTimestamp(),
      });

    logger.info(`Transaction ${transactionId} marked as paid`);
  }
}

/**
 * Handles failed payment.
 */
async function handlePaymentFailed(
  db: FirebaseFirestore.Firestore,
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  const clinicId = paymentIntent.metadata?.clinicId;
  if (!clinicId) return;

  const snapshot = await db
    .collection('clinics')
    .doc(clinicId)
    .collection('payments')
    .where('stripePaymentIntentId', '==', paymentIntent.id)
    .limit(1)
    .get();

  if (snapshot.empty) return;

  const paymentDoc = snapshot.docs[0];
  const failureMessage =
    paymentIntent.last_payment_error?.message || 'Payment failed';

  await paymentDoc.ref.update({
    status: 'failed' as PaymentDisplayStatus,
    failureReason: failureMessage,
    updatedAt: FieldValue.serverTimestamp(),
  });

  logger.info(`Payment ${paymentDoc.id} marked as failed: ${failureMessage}`);
}

/**
 * Handles cancelled/expired payment.
 */
async function handlePaymentCanceled(
  db: FirebaseFirestore.Firestore,
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  const clinicId = paymentIntent.metadata?.clinicId;
  if (!clinicId) return;

  const snapshot = await db
    .collection('clinics')
    .doc(clinicId)
    .collection('payments')
    .where('stripePaymentIntentId', '==', paymentIntent.id)
    .limit(1)
    .get();

  if (snapshot.empty) return;

  const paymentDoc = snapshot.docs[0];

  await paymentDoc.ref.update({
    status: 'expired' as PaymentDisplayStatus,
    updatedAt: FieldValue.serverTimestamp(),
    pixData: FieldValue.delete(),
  });

  logger.info(`Payment ${paymentDoc.id} marked as expired`);
}

/**
 * Handles refunded charge.
 */
async function handleChargeRefunded(
  db: FirebaseFirestore.Firestore,
  charge: Stripe.Charge
): Promise<void> {
  const paymentIntentId = charge.payment_intent as string;
  if (!paymentIntentId) return;

  // Get the PaymentIntent to find clinicId
  const stripe = getStripeClient();
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  const clinicId = paymentIntent.metadata?.clinicId;
  if (!clinicId) return;

  const snapshot = await db
    .collection('clinics')
    .doc(clinicId)
    .collection('payments')
    .where('stripePaymentIntentId', '==', paymentIntentId)
    .limit(1)
    .get();

  if (snapshot.empty) return;

  const paymentDoc = snapshot.docs[0];
  const refundAmount = charge.amount_refunded;

  await paymentDoc.ref.update({
    status: 'refunded' as PaymentDisplayStatus,
    refundAmount,
    updatedAt: FieldValue.serverTimestamp(),
  });

  logger.info(`Payment ${paymentDoc.id} refunded: ${refundAmount} cents`);

  // Update related transaction if exists
  const transactionId = paymentIntent.metadata?.transactionId;
  if (transactionId) {
    await db
      .collection('clinics')
      .doc(clinicId)
      .collection('transactions')
      .doc(transactionId)
      .update({
        status: 'refunded',
        updatedAt: FieldValue.serverTimestamp(),
      });
  }
}

