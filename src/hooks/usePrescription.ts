/**
 * usePrescription Hook
 *
 * Provides real-time access to digital prescriptions.
 * Manages prescription lifecycle: create, sign, send, track fulfillment.
 *
 * This hook enables doctors to issue digital prescriptions that:
 * - Can be digitally signed with e-CPF certificates
 * - Are sent directly to patients via email/SMS/WhatsApp
 * - Can be validated by pharmacies via unique codes
 * - Support controlled substances (receita azul/amarela)
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useClinicContext } from '../contexts/ClinicContext';
import { prescriptionService } from '../services/firestore';
import type {
  Prescription,
  CreatePrescriptionInput,
  UpdatePrescriptionInput,
  UsePrescriptionReturn,
  UsePrescriptionHistoryReturn,
} from '@/types';

/**
 * Hook for managing a single prescription with real-time updates.
 *
 * @param prescriptionId - Optional prescription ID to subscribe to
 * @returns Prescription data and operations
 *
 * @example
 * // Create a new prescription
 * const { createPrescription, prescription } = usePrescription();
 *
 * // View an existing prescription
 * const { prescription, signPrescription, sendToPatient } = usePrescription(prescriptionId);
 */
export function usePrescription(prescriptionId?: string): UsePrescriptionReturn {
  const { clinicId, userProfile } = useClinicContext();

  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [hasReceived, setHasReceived] = useState(false);

  // Subscribe to prescription updates if prescriptionId is provided
  useEffect(() => {
    if (!clinicId || !prescriptionId) {
      setPrescription(null);
      setHasReceived(true);
      return;
    }

    let isActive = true;

    const unsubscribe = prescriptionService.subscribe(
      clinicId,
      prescriptionId,
      (updatedPrescription) => {
        if (isActive) {
          setPrescription(updatedPrescription);
          setHasReceived(true);
          setError(null);
        }
      }
    );

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [clinicId, prescriptionId]);

  // Derive loading state
  const loading = useMemo(() => {
    if (!clinicId) return false;
    if (!prescriptionId) return false;
    return !hasReceived;
  }, [clinicId, prescriptionId, hasReceived]);

  /**
   * Create a new prescription.
   * Returns the created prescription ID.
   */
  const createPrescription = useCallback(
    async (input: CreatePrescriptionInput): Promise<string> => {
      if (!clinicId || !userProfile) {
        throw new Error('No clinic or user context');
      }

      try {
        const professional = {
          id: userProfile.id,
          name: userProfile.displayName,
          crm: (userProfile as unknown as { crm?: string }).crm || 'CRM não informado',
          crmState: (userProfile as unknown as { crmState?: string }).crmState || 'SP',
        };

        const newPrescriptionId = await prescriptionService.create(clinicId, input, professional);
        return newPrescriptionId;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to create prescription');
        setError(error);
        throw error;
      }
    },
    [clinicId, userProfile]
  );

  /**
   * Update an existing prescription.
   * Only draft prescriptions can be updated.
   */
  const updatePrescription = useCallback(
    async (id: string, input: UpdatePrescriptionInput): Promise<void> => {
      if (!clinicId || !userProfile) {
        throw new Error('No clinic or user context');
      }

      try {
        await prescriptionService.update(
          clinicId,
          id,
          input,
          userProfile.id,
          userProfile.displayName
        );
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to update prescription');
        setError(error);
        throw error;
      }
    },
    [clinicId, userProfile]
  );

  /**
   * Sign a prescription with digital certificate.
   * Updates status to 'signed'.
   */
  const signPrescription = useCallback(
    async (id: string): Promise<void> => {
      if (!clinicId || !userProfile) {
        throw new Error('No clinic or user context');
      }

      try {
        // In a real implementation, this would call the digital certificate signing service
        const signature = {
          signedBy: userProfile.displayName,
          signedAt: new Date().toISOString(),
          certificateSerial: 'PENDING_CERTIFICATE',
          signatureHash: `SIG-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
        };

        await prescriptionService.sign(
          clinicId,
          id,
          signature,
          userProfile.id,
          userProfile.displayName
        );
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to sign prescription');
        setError(error);
        throw error;
      }
    },
    [clinicId, userProfile]
  );

  /**
   * Send prescription to patient.
   * Prescription must be signed first.
   */
  const sendToPatient = useCallback(
    async (id: string, method: 'email' | 'sms' | 'whatsapp'): Promise<void> => {
      if (!clinicId || !userProfile) {
        throw new Error('No clinic or user context');
      }

      try {
        await prescriptionService.sendToPatient(
          clinicId,
          id,
          method,
          userProfile.id,
          userProfile.displayName
        );
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to send prescription');
        setError(error);
        throw error;
      }
    },
    [clinicId, userProfile]
  );

  /**
   * Cancel a prescription.
   * Filled prescriptions cannot be canceled.
   */
  const cancelPrescription = useCallback(
    async (id: string, reason: string): Promise<void> => {
      if (!clinicId || !userProfile) {
        throw new Error('No clinic or user context');
      }

      try {
        await prescriptionService.cancel(
          clinicId,
          id,
          reason,
          userProfile.id,
          userProfile.displayName
        );
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to cancel prescription');
        setError(error);
        throw error;
      }
    },
    [clinicId, userProfile]
  );

  /**
   * Get a prescription by ID.
   */
  const getPrescription = useCallback(
    async (id: string): Promise<Prescription | null> => {
      if (!clinicId) {
        throw new Error('No clinic selected');
      }

      try {
        return await prescriptionService.getById(clinicId, id);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to get prescription');
        setError(error);
        throw error;
      }
    },
    [clinicId]
  );

  return {
    prescription,
    loading,
    error,
    createPrescription,
    updatePrescription,
    signPrescription,
    sendToPatient,
    cancelPrescription,
    getPrescription,
  };
}

/**
 * Hook for accessing prescription history for a patient.
 *
 * @param patientId - The patient ID to get prescriptions for
 * @returns Array of prescriptions and operations
 *
 * @example
 * const { prescriptions, loading, refresh } = usePrescriptionHistory(patientId);
 */
export function usePrescriptionHistory(patientId: string): UsePrescriptionHistoryReturn {
  const { clinicId } = useClinicContext();

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [hasReceived, setHasReceived] = useState(false);

  // Subscribe to patient prescriptions
  useEffect(() => {
    if (!clinicId || !patientId) {
      setPrescriptions([]);
      setHasReceived(true);
      return;
    }

    let isActive = true;

    const unsubscribe = prescriptionService.subscribeByPatient(
      clinicId,
      patientId,
      (updatedPrescriptions) => {
        if (isActive) {
          setPrescriptions(updatedPrescriptions);
          setHasReceived(true);
          setError(null);
        }
      }
    );

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [clinicId, patientId]);

  const loading = useMemo(() => {
    if (!clinicId) return false;
    if (!patientId) return false;
    return !hasReceived;
  }, [clinicId, patientId, hasReceived]);

  /**
   * Manually refresh the prescription list.
   */
  const refresh = useCallback(async (): Promise<void> => {
    if (!clinicId || !patientId) {
      return;
    }

    try {
      const updatedPrescriptions = await prescriptionService.getByPatient(clinicId, patientId);
      setPrescriptions(updatedPrescriptions);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to refresh prescriptions');
      setError(error);
      throw error;
    }
  }, [clinicId, patientId]);

  return {
    prescriptions,
    loading,
    error,
    refresh,
  };
}

/**
 * Hook for validating a prescription by its validation code.
 * Used by pharmacies to verify prescription authenticity.
 *
 * @returns Validation function and state
 *
 * @example
 * const { validateCode, prescription, loading } = usePrescriptionValidation();
 * await validateCode('ABC123XY');
 */
export function usePrescriptionValidation(): {
  prescription: Prescription | null;
  loading: boolean;
  error: Error | null;
  validateCode: (code: string) => Promise<Prescription | null>;
  markAsFilled: (pharmacyName: string) => Promise<void>;
} {
  const { clinicId } = useClinicContext();

  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Validate a prescription by its unique code.
   */
  const validateCode = useCallback(
    async (code: string): Promise<Prescription | null> => {
      if (!clinicId) {
        throw new Error('No clinic selected');
      }

      setLoading(true);
      setError(null);

      try {
        const found = await prescriptionService.getByValidationCode(clinicId, code);
        setPrescription(found);
        return found;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to validate code');
        setError(error);
        setPrescription(null);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [clinicId]
  );

  /**
   * Mark the validated prescription as filled.
   */
  const markAsFilled = useCallback(
    async (pharmacyName: string): Promise<void> => {
      if (!clinicId || !prescription) {
        throw new Error('No prescription to mark as filled');
      }

      try {
        await prescriptionService.markAsFilled(clinicId, prescription.id, pharmacyName);
        // Refresh the prescription data
        const updated = await prescriptionService.getById(clinicId, prescription.id);
        setPrescription(updated);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to mark as filled');
        setError(error);
        throw error;
      }
    },
    [clinicId, prescription]
  );

  return {
    prescription,
    loading,
    error,
    validateCode,
    markAsFilled,
  };
}

/**
 * Hook for prescription statistics.
 *
 * @param startDate - Start date for the period
 * @param endDate - End date for the period
 * @returns Statistics data
 *
 * @example
 * const { stats, loading } = usePrescriptionStats('2025-01-01', '2025-12-31');
 */
export function usePrescriptionStats(
  startDate: string,
  endDate: string
): {
  stats: {
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    controlled: number;
  } | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
} {
  const { clinicId } = useClinicContext();

  const [stats, setStats] = useState<{
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    controlled: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    if (!clinicId) {
      setStats(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await prescriptionService.getStatistics(clinicId, startDate, endDate);
      setStats(data);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get statistics');
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [clinicId, startDate, endDate]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
  };
}
