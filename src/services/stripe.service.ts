/**
 * Stripe Service (Frontend)
 * =========================
 *
 * Handles PIX payment integration with Stripe via Cloud Functions.
 * This service communicates with the backend Cloud Functions that
 * actually interact with the Stripe API.
 *
 * Fase 10: PIX Integration
 *
 * Flow:
 * 1. Frontend calls createPixPayment → Cloud Function creates PaymentIntent
 * 2. Cloud Function returns QR code data
 * 3. Frontend displays QR code
 * 4. Customer pays via banking app
 * 5. Stripe webhook notifies Cloud Function
 * 6. Cloud Function updates Firestore
 * 7. Frontend receives real-time update via Firestore listener
 */

import { httpsCallable, getFunctions } from 'firebase/functions';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  Payment,
  PaymentIntentResponse,
  CreatePixPaymentInput,
  PaymentFilters,
  PaymentSummary,
  PaymentDisplayStatus,
} from '@/types';

/**
 * Gets the payments collection reference for a clinic.
 */
function getPaymentsCollection(clinicId: string) {
  return collection(db, 'clinics', clinicId, 'payments');
}

/**
 * Converts Firestore document data to Payment type.
 */
function toPayment(id: string, data: Record<string, unknown>): Payment {
  return {
    id,
    stripePaymentIntentId: data.stripePaymentIntentId as string,
    clinicId: data.clinicId as string,
    amount: data.amount as number,
    currency: data.currency as string,
    status: data.status as PaymentDisplayStatus,
    method: 'pix',
    customerEmail: data.customerEmail as string | undefined,
    patientId: data.patientId as string | undefined,
    patientName: data.patientName as string | undefined,
    appointmentId: data.appointmentId as string | undefined,
    transactionId: data.transactionId as string | undefined,
    description: data.description as string,
    pixData: data.pixData as Payment['pixData'],
    receiptUrl: data.receiptUrl as string | undefined,
    refundAmount: data.refundAmount as number | undefined,
    failureReason: data.failureReason as string | undefined,
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : (data.createdAt as string),
    updatedAt:
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate().toISOString()
        : (data.updatedAt as string),
    paidAt: data.paidAt as string | undefined,
    createdBy: data.createdBy as string,
  };
}

/**
 * Stripe service for PIX payments.
 */
export const stripeService = {
  /**
   * Creates a PIX payment intent via Cloud Function.
   *
   * @param clinicId - Clinic ID for multi-tenancy
   * @param input - Payment input data
   * @returns PaymentIntentResponse with QR code data
   * @throws Error if Cloud Function fails
   */
  async createPixPayment(
    clinicId: string,
    input: CreatePixPaymentInput
  ): Promise<PaymentIntentResponse> {
    const functions = getFunctions();
    const createPixPaymentFn = httpsCallable<
      { clinicId: string; input: CreatePixPaymentInput },
      PaymentIntentResponse
    >(functions, 'createPixPayment');

    const result = await createPixPaymentFn({ clinicId, input });
    return result.data;
  },

  /**
   * Cancels a pending PIX payment.
   *
   * @param clinicId - Clinic ID
   * @param paymentId - Payment document ID
   * @throws Error if payment cannot be cancelled
   */
  async cancelPayment(clinicId: string, paymentId: string): Promise<void> {
    const functions = getFunctions();
    const cancelPaymentFn = httpsCallable<
      { clinicId: string; paymentId: string },
      { success: boolean }
    >(functions, 'cancelPixPayment');

    await cancelPaymentFn({ clinicId, paymentId });
  },

  /**
   * Requests a refund for a completed payment.
   *
   * @param clinicId - Clinic ID
   * @param paymentId - Payment document ID
   * @param amount - Amount to refund in cents (optional, full refund if not provided)
   * @throws Error if refund fails
   */
  async refundPayment(
    clinicId: string,
    paymentId: string,
    amount?: number
  ): Promise<void> {
    const functions = getFunctions();
    const refundPaymentFn = httpsCallable<
      { clinicId: string; paymentId: string; amount?: number },
      { success: boolean }
    >(functions, 'refundPixPayment');

    await refundPaymentFn({ clinicId, paymentId, amount });
  },

  /**
   * Gets a payment by ID.
   *
   * @param clinicId - Clinic ID
   * @param paymentId - Payment document ID
   * @returns Payment or null if not found
   */
  async getPayment(clinicId: string, paymentId: string): Promise<Payment | null> {
    const docRef = doc(db, 'clinics', clinicId, 'payments', paymentId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return toPayment(docSnap.id, docSnap.data());
  },

  /**
   * Gets all payments for a clinic with optional filters.
   *
   * @param clinicId - Clinic ID
   * @param filters - Optional filters
   * @returns Array of payments
   */
  async getPayments(clinicId: string, filters?: PaymentFilters): Promise<Payment[]> {
    const paymentsRef = getPaymentsCollection(clinicId);
    let q = query(paymentsRef, orderBy('createdAt', 'desc'));

    if (filters?.status) {
      q = query(
        paymentsRef,
        where('status', '==', filters.status),
        orderBy('createdAt', 'desc')
      );
    }

    const snapshot = await getDocs(q);
    let payments = snapshot.docs.map((docSnap) =>
      toPayment(docSnap.id, docSnap.data())
    );

    // Apply client-side filters
    if (filters?.startDate && filters?.endDate) {
      payments = payments.filter((p) => {
        const date = new Date(p.createdAt);
        return (
          date >= new Date(filters.startDate!) &&
          date <= new Date(filters.endDate!)
        );
      });
    }

    if (filters?.patientId) {
      payments = payments.filter((p) => p.patientId === filters.patientId);
    }

    if (filters?.minAmount !== undefined) {
      payments = payments.filter((p) => p.amount >= filters.minAmount!);
    }

    if (filters?.maxAmount !== undefined) {
      payments = payments.filter((p) => p.amount <= filters.maxAmount!);
    }

    return payments;
  },

  /**
   * Subscribes to real-time payment updates.
   *
   * @param clinicId - Clinic ID
   * @param onData - Callback for payment updates
   * @param onError - Optional error callback
   * @returns Unsubscribe function
   */
  subscribe(
    clinicId: string,
    onData: (payments: Payment[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    const paymentsRef = getPaymentsCollection(clinicId);
    const q = query(paymentsRef, orderBy('createdAt', 'desc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const payments = snapshot.docs.map((docSnap) =>
          toPayment(docSnap.id, docSnap.data())
        );
        onData(payments);
      },
      (error) => {
        console.error('Payment subscription error:', error);
        onError?.(error);
      }
    );
  },

  /**
   * Subscribes to a single payment for real-time status updates.
   *
   * @param clinicId - Clinic ID
   * @param paymentId - Payment document ID
   * @param onData - Callback for payment updates
   * @param onError - Optional error callback
   * @returns Unsubscribe function
   */
  subscribeToPayment(
    clinicId: string,
    paymentId: string,
    onData: (payment: Payment | null) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    const docRef = doc(db, 'clinics', clinicId, 'payments', paymentId);

    return onSnapshot(
      docRef,
      (docSnap) => {
        if (!docSnap.exists()) {
          onData(null);
          return;
        }
        onData(toPayment(docSnap.id, docSnap.data()));
      },
      (error) => {
        console.error('Payment subscription error:', error);
        onError?.(error);
      }
    );
  },

  /**
   * Gets payment summary for a period.
   *
   * @param clinicId - Clinic ID
   * @param startDate - Start date (ISO string)
   * @param endDate - End date (ISO string)
   * @returns Payment summary
   */
  async getSummary(
    clinicId: string,
    startDate: string,
    endDate: string
  ): Promise<PaymentSummary> {
    const payments = await this.getPayments(clinicId, { startDate, endDate });

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

    const averageAmount =
      successCount > 0 ? Math.round(totalReceived / successCount) : 0;

    return {
      totalReceived,
      totalPending,
      totalRefunded,
      successCount,
      pendingCount,
      failedCount,
      averageAmount,
    };
  },

  /**
   * Gets pending payments for a patient.
   *
   * @param clinicId - Clinic ID
   * @param patientId - Patient ID
   * @returns Array of pending payments
   */
  async getPendingPaymentsForPatient(
    clinicId: string,
    patientId: string
  ): Promise<Payment[]> {
    return this.getPayments(clinicId, {
      patientId,
      status: 'awaiting_payment',
    });
  },

  /**
   * Checks if a payment is still valid (not expired).
   *
   * @param payment - Payment to check
   * @returns true if payment is still valid
   */
  isPaymentValid(payment: Payment): boolean {
    if (payment.status !== 'awaiting_payment') {
      return false;
    }

    if (!payment.pixData?.expiresAt) {
      return false;
    }

    return new Date(payment.pixData.expiresAt) > new Date();
  },
};

export default stripeService;

