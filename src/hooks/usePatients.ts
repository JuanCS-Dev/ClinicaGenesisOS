/**
 * usePatients Hook
 *
 * Provides real-time access to all patients in the current clinic.
 * Includes CRUD operations and loading/error states.
 */

import { useState, useEffect, useCallback } from 'react';
import { useClinicContext } from '../contexts/ClinicContext';
import { patientService } from '../services/firestore';
import type { Patient, CreatePatientInput } from '@/types';

/**
 * Return type for usePatients hook.
 */
export interface UsePatientsReturn {
  /** Array of patients in the clinic */
  patients: Patient[];
  /** Loading state for initial fetch */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Create a new patient */
  addPatient: (data: CreatePatientInput) => Promise<string>;
  /** Update an existing patient */
  updatePatient: (id: string, data: Partial<Patient>) => Promise<void>;
  /** Delete a patient */
  deletePatient: (id: string) => Promise<void>;
  /** Refresh patients list */
  refresh: () => Promise<void>;
}

/**
 * Hook for managing patients with real-time updates.
 *
 * @returns Patients data and CRUD operations
 *
 * @example
 * const { patients, loading, addPatient } = usePatients();
 *
 * if (loading) return <Spinner />;
 *
 * return (
 *   <ul>
 *     {patients.map(p => <li key={p.id}>{p.name}</li>)}
 *   </ul>
 * );
 */
export function usePatients(): UsePatientsReturn {
  const { clinicId } = useClinicContext();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Track subscription state
  const [hasReceived, setHasReceived] = useState(false);

  // Subscribe to real-time updates
  useEffect(() => {
    // Early return without setState - state is derived below
    if (!clinicId) {
      return;
    }

    // Reset received flag on clinicId change via cleanup
    let isActive = true;

    const unsubscribe = patientService.subscribe(clinicId, (data) => {
      if (isActive) {
        setPatients(data);
        setHasReceived(true);
        setError(null);
      }
    });

    return () => {
      isActive = false;
      setHasReceived(false);
      unsubscribe();
    };
  }, [clinicId]);

  // Derive final values based on clinicId presence
  const effectivePatients = clinicId ? patients : [];
  const effectiveLoading = clinicId ? !hasReceived : false;

  /**
   * Create a new patient.
   */
  const addPatient = useCallback(
    async (data: CreatePatientInput): Promise<string> => {
      if (!clinicId) {
        throw new Error('No clinic selected');
      }
      return patientService.create(clinicId, data);
    },
    [clinicId]
  );

  /**
   * Update an existing patient.
   */
  const updatePatient = useCallback(
    async (id: string, data: Partial<Patient>): Promise<void> => {
      if (!clinicId) {
        throw new Error('No clinic selected');
      }
      await patientService.update(clinicId, id, data);
    },
    [clinicId]
  );

  /**
   * Delete a patient.
   */
  const deletePatient = useCallback(
    async (id: string): Promise<void> => {
      if (!clinicId) {
        throw new Error('No clinic selected');
      }
      await patientService.delete(clinicId, id);
    },
    [clinicId]
  );

  /**
   * Manually refresh patients list.
   */
  const refresh = useCallback(async (): Promise<void> => {
    if (!clinicId) {
      return;
    }
    const data = await patientService.getAll(clinicId);
    setPatients(data);
  }, [clinicId]);

  return {
    patients: effectivePatients,
    loading: effectiveLoading,
    error,
    addPatient,
    updatePatient,
    deletePatient,
    refresh,
  };
}
