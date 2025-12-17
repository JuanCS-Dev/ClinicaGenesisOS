/**
 * usePatient Hook
 *
 * Provides real-time access to a single patient by ID.
 * Includes update operations and loading/error states.
 */

import { useState, useEffect, useCallback } from 'react';
import { useClinicContext } from '../contexts/ClinicContext';
import { patientService } from '../services/firestore';
import type { Patient } from '@/types';

/**
 * Return type for usePatient hook.
 */
export interface UsePatientReturn {
  /** The patient data or null if not found */
  patient: Patient | null;
  /** Loading state for initial fetch */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Update the patient */
  updatePatient: (data: Partial<Patient>) => Promise<void>;
  /** Add a tag to the patient */
  addTag: (tag: string) => Promise<void>;
  /** Remove a tag from the patient */
  removeTag: (tag: string) => Promise<void>;
  /** Delete the patient */
  deletePatient: () => Promise<void>;
}

/**
 * Hook for accessing a single patient with real-time updates.
 *
 * @param patientId - The ID of the patient to fetch
 * @returns Patient data and operations
 *
 * @example
 * const { patient, loading, updatePatient } = usePatient('abc123');
 *
 * if (loading) return <Spinner />;
 * if (!patient) return <NotFound />;
 *
 * return <PatientProfile patient={patient} />;
 */
export function usePatient(patientId: string | undefined): UsePatientReturn {
  const { clinicId } = useClinicContext();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Track subscription state
  const [hasReceived, setHasReceived] = useState(false);

  // Subscribe to real-time updates
  useEffect(() => {
    // Early return without setState - state is derived below
    if (!clinicId || !patientId) {
      return;
    }

    // Track active state for cleanup
    let isActive = true;

    const unsubscribe = patientService.subscribeToOne(clinicId, patientId, (data) => {
      if (isActive) {
        setPatient(data);
        setHasReceived(true);
        setError(null);
      }
    });

    return () => {
      isActive = false;
      setHasReceived(false);
      unsubscribe();
    };
  }, [clinicId, patientId]);

  // Derive final values when dependencies are missing
  const hasRequiredIds = !!clinicId && !!patientId;
  const effectivePatient = hasRequiredIds ? patient : null;
  const effectiveLoading = hasRequiredIds ? !hasReceived : false;

  /**
   * Update the patient.
   */
  const updatePatient = useCallback(
    async (data: Partial<Patient>): Promise<void> => {
      if (!clinicId || !patientId) {
        throw new Error('No patient selected');
      }
      await patientService.update(clinicId, patientId, data);
    },
    [clinicId, patientId]
  );

  /**
   * Add a tag to the patient.
   */
  const addTag = useCallback(
    async (tag: string): Promise<void> => {
      if (!clinicId || !patientId) {
        throw new Error('No patient selected');
      }
      await patientService.addTag(clinicId, patientId, tag);
    },
    [clinicId, patientId]
  );

  /**
   * Remove a tag from the patient.
   */
  const removeTag = useCallback(
    async (tag: string): Promise<void> => {
      if (!clinicId || !patientId) {
        throw new Error('No patient selected');
      }
      await patientService.removeTag(clinicId, patientId, tag);
    },
    [clinicId, patientId]
  );

  /**
   * Delete the patient.
   */
  const deletePatient = useCallback(async (): Promise<void> => {
    if (!clinicId || !patientId) {
      throw new Error('No patient selected');
    }
    await patientService.delete(clinicId, patientId);
  }, [clinicId, patientId]);

  return {
    patient: effectivePatient,
    loading: effectiveLoading,
    error,
    updatePatient,
    addTag,
    removeTag,
    deletePatient,
  };
}
