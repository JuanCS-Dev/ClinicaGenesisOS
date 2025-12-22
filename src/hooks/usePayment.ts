/**
 * Payment Hooks
 * =============
 *
 * React hooks for PIX payment management.
 * Provides real-time payment state, creation, and tracking.
 *
 * Fase 10: PIX Integration
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useClinicContext } from '../contexts/ClinicContext';
import { stripeService } from '../services/stripe.service';
import type {
  Payment,
  PaymentSummary,
  PaymentFilters,
  CreatePixPaymentInput,
  PaymentIntentResponse,
  PaymentDisplayStatus,
} from '@/types';

/**
 * Hook state for payments list.
 */
interface UsePaymentsState {
  payments: Payment[];
  loading: boolean;
  error: string | null;
  summary: PaymentSummary | null;
}

/**
 * Hook return type for payments list.
 */
interface UsePaymentsReturn extends UsePaymentsState {
  refresh: () => Promise<void>;
  filterByStatus: (status: PaymentDisplayStatus | null) => void;
}

/**
 * Hook for managing payments list with real-time updates.
 *
 * @param filters - Optional initial filters
 * @returns Payments state and actions
 *
 * @example
 * ```tsx
 * const { payments, loading, summary } = usePayments();
 * ```
 */
export function usePayments(filters?: PaymentFilters): UsePaymentsReturn {
  const { clinic } = useClinicContext();
  const [state, setState] = useState<UsePaymentsState>({
    payments: [],
    loading: true,
    error: null,
    summary: null,
  });
  const [statusFilter, setStatusFilter] = useState<PaymentDisplayStatus | null>(
    filters?.status || null
  );

  // Load payments with real-time subscription
  useEffect(() => {
    if (!clinic?.id) {
      setState((prev) => ({ ...prev, loading: false, payments: [] }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    const unsubscribe = stripeService.subscribe(
      clinic.id,
      (payments) => {
        // Apply status filter if set
        const filtered = statusFilter
          ? payments.filter((p) => p.status === statusFilter)
          : payments;

        setState((prev) => ({
          ...prev,
          payments: filtered,
          loading: false,
        }));
      },
      (error) => {
        setState((prev) => ({
          ...prev,
          error: error.message,
          loading: false,
        }));
      }
    );

    return () => unsubscribe();
  }, [clinic?.id, statusFilter]);

  // Load summary
  useEffect(() => {
    if (!clinic?.id) return;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    stripeService
      .getSummary(
        clinic.id,
        startOfMonth.toISOString(),
        endOfMonth.toISOString()
      )
      .then((summary) => {
        setState((prev) => ({ ...prev, summary }));
      })
      .catch((error) => {
        console.error('Failed to load payment summary:', error);
      });
  }, [clinic?.id, state.payments]);

  const refresh = useCallback(async () => {
    if (!clinic?.id) return;

    setState((prev) => ({ ...prev, loading: true }));

    try {
      const payments = await stripeService.getPayments(clinic.id, {
        status: statusFilter || undefined,
      });
      setState((prev) => ({ ...prev, payments, loading: false }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to refresh',
        loading: false,
      }));
    }
  }, [clinic?.id, statusFilter]);

  const filterByStatus = useCallback((status: PaymentDisplayStatus | null) => {
    setStatusFilter(status);
  }, []);

  return {
    ...state,
    refresh,
    filterByStatus,
  };
}

/**
 * Hook state for single payment.
 */
interface UsePaymentState {
  payment: Payment | null;
  loading: boolean;
  error: string | null;
  timeRemaining: { minutes: number; seconds: number } | null;
  isExpired: boolean;
}

/**
 * Hook return type for single payment.
 */
interface UsePaymentReturn extends UsePaymentState {
  cancel: () => Promise<void>;
  refund: (amount?: number) => Promise<void>;
}

/**
 * Hook for tracking a single payment with real-time updates.
 *
 * @param paymentId - Payment document ID
 * @returns Payment state and actions
 *
 * @example
 * ```tsx
 * const { payment, timeRemaining, isExpired } = usePayment(paymentId);
 * ```
 */
export function usePayment(paymentId: string | null): UsePaymentReturn {
  const { clinic } = useClinicContext();
  const [state, setState] = useState<UsePaymentState>({
    payment: null,
    loading: true,
    error: null,
    timeRemaining: null,
    isExpired: false,
  });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Subscribe to payment updates
  useEffect(() => {
    if (!clinic?.id || !paymentId) {
      setState((prev) => ({ ...prev, loading: false, payment: null }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    const unsubscribe = stripeService.subscribeToPayment(
      clinic.id,
      paymentId,
      (payment) => {
        setState((prev) => ({
          ...prev,
          payment,
          loading: false,
        }));
      },
      (error) => {
        setState((prev) => ({
          ...prev,
          error: error.message,
          loading: false,
        }));
      }
    );

    return () => unsubscribe();
  }, [clinic?.id, paymentId]);

  // Update time remaining for PIX payments
  useEffect(() => {
    const payment = state.payment;

    if (
      !payment ||
      payment.status !== 'awaiting_payment' ||
      !payment.pixData?.expiresAt
    ) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const updateTimeRemaining = () => {
      const expiresAt = new Date(payment.pixData!.expiresAt).getTime();
      const now = Date.now();
      const diff = expiresAt - now;

      if (diff <= 0) {
        setState((prev) => ({
          ...prev,
          timeRemaining: { minutes: 0, seconds: 0 },
          isExpired: true,
        }));
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      setState((prev) => ({
        ...prev,
        timeRemaining: { minutes, seconds },
        isExpired: false,
      }));
    };

    // Update immediately
    updateTimeRemaining();

    // Update every second
    timerRef.current = setInterval(updateTimeRemaining, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [state.payment]);

  const cancel = useCallback(async () => {
    if (!clinic?.id || !paymentId) return;

    try {
      await stripeService.cancelPayment(clinic.id, paymentId);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to cancel',
      }));
      throw error;
    }
  }, [clinic?.id, paymentId]);

  const refund = useCallback(
    async (amount?: number) => {
      if (!clinic?.id || !paymentId) return;

      try {
        await stripeService.refundPayment(clinic.id, paymentId, amount);
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to refund',
        }));
        throw error;
      }
    },
    [clinic?.id, paymentId]
  );

  return {
    ...state,
    cancel,
    refund,
  };
}

/**
 * Hook state for creating PIX payment.
 */
interface UseCreatePixPaymentState {
  creating: boolean;
  error: string | null;
  paymentIntent: PaymentIntentResponse | null;
  paymentId: string | null;
}

/**
 * Hook return type for creating PIX payment.
 */
interface UseCreatePixPaymentReturn extends UseCreatePixPaymentState {
  createPayment: (input: CreatePixPaymentInput) => Promise<PaymentIntentResponse>;
  reset: () => void;
}

/**
 * Hook for creating PIX payments.
 *
 * @returns Create payment state and actions
 *
 * @example
 * ```tsx
 * const { createPayment, creating, paymentIntent } = useCreatePixPayment();
 *
 * const handleCreate = async () => {
 *   const result = await createPayment({
 *     amount: 15000, // R$ 150,00
 *     description: 'Consulta médica',
 *   });
 *   // result.pix?.qrCodeImage contains the QR code
 * };
 * ```
 */
export function useCreatePixPayment(): UseCreatePixPaymentReturn {
  const { clinic } = useClinicContext();
  const [state, setState] = useState<UseCreatePixPaymentState>({
    creating: false,
    error: null,
    paymentIntent: null,
    paymentId: null,
  });

  const createPayment = useCallback(
    async (input: CreatePixPaymentInput): Promise<PaymentIntentResponse> => {
      if (!clinic?.id) {
        throw new Error('Clinic not found');
      }

      setState((prev) => ({
        ...prev,
        creating: true,
        error: null,
      }));

      try {
        const paymentIntent = await stripeService.createPixPayment(
          clinic.id,
          input
        );

        setState((prev) => ({
          ...prev,
          creating: false,
          paymentIntent,
          paymentId: paymentIntent.id,
        }));

        return paymentIntent;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to create payment';

        setState((prev) => ({
          ...prev,
          creating: false,
          error: message,
        }));

        throw error;
      }
    },
    [clinic?.id]
  );

  const reset = useCallback(() => {
    setState({
      creating: false,
      error: null,
      paymentIntent: null,
      paymentId: null,
    });
  }, []);

  return {
    ...state,
    createPayment,
    reset,
  };
}

/**
 * Hook for getting pending payments for a patient.
 *
 * @param patientId - Patient ID
 * @returns Array of pending payments
 */
export function usePatientPendingPayments(patientId: string | null): {
  payments: Payment[];
  loading: boolean;
} {
  const { clinic } = useClinicContext();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clinic?.id || !patientId) {
      setPayments([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    stripeService
      .getPendingPaymentsForPatient(clinic.id, patientId)
      .then(setPayments)
      .catch((error) => {
        console.error('Failed to load pending payments:', error);
        setPayments([]);
      })
      .finally(() => setLoading(false));
  }, [clinic?.id, patientId]);

  return { payments, loading };
}

