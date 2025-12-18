/**
 * useRecords Hook
 *
 * Provides real-time access to medical records for a patient.
 * Includes CRUD operations and loading/error states.
 */

import { useState, useEffect, useCallback } from 'react';
import { useClinicContext } from '../contexts/ClinicContext';
import { recordService } from '../services/firestore';
import type { MedicalRecord, CreateRecordInput, RecordVersion } from '@/types';

/**
 * Return type for useRecords hook.
 */
export interface UseRecordsReturn {
  /** Array of medical records for the patient */
  records: MedicalRecord[];
  /** Loading state for initial fetch */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Create a new medical record */
  addRecord: (data: CreateRecordInput) => Promise<string>;
  /** Update an existing record with optional change reason for audit trail */
  updateRecord: (id: string, data: Partial<MedicalRecord>, changeReason?: string) => Promise<void>;
  /** Delete a record */
  deleteRecord: (id: string) => Promise<void>;
  /** Get version history for a record */
  getVersionHistory: (recordId: string) => Promise<RecordVersion[]>;
  /** Restore a record to a previous version */
  restoreVersion: (recordId: string, versionNumber: number) => Promise<number>;
}

/**
 * Hook for managing a patient's medical records with real-time updates.
 *
 * @param patientId - The ID of the patient
 * @returns Records data and CRUD operations
 *
 * @example
 * const { records, loading, addRecord } = useRecords('patient123');
 *
 * if (loading) return <Spinner />;
 *
 * return (
 *   <ul>
 *     {records.map(r => <RecordCard key={r.id} record={r} />)}
 *   </ul>
 * );
 */
export function useRecords(patientId: string | undefined): UseRecordsReturn {
  const { clinicId, userProfile } = useClinicContext();

  const [records, setRecords] = useState<MedicalRecord[]>([]);
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

    const unsubscribe = recordService.subscribeByPatient(clinicId, patientId, (data) => {
      if (isActive) {
        setRecords(data);
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
  const effectiveRecords = hasRequiredIds ? records : [];
  const effectiveLoading = hasRequiredIds ? !hasReceived : false;

  /**
   * Create a new medical record.
   */
  const addRecord = useCallback(
    async (data: CreateRecordInput): Promise<string> => {
      if (!clinicId) {
        throw new Error('No clinic selected');
      }
      if (!patientId) {
        throw new Error('No patient selected');
      }

      const professional = userProfile?.displayName || 'Profissional';

      return recordService.create(
        clinicId,
        { ...data, patientId },
        professional
      );
    },
    [clinicId, patientId, userProfile?.displayName]
  );

  /**
   * Update an existing record with versioning.
   */
  const updateRecord = useCallback(
    async (id: string, data: Partial<MedicalRecord>, changeReason?: string): Promise<void> => {
      if (!clinicId) {
        throw new Error('No clinic selected');
      }
      const updatedBy = userProfile?.displayName || 'Profissional';
      await recordService.update(clinicId, id, data, updatedBy, changeReason);
    },
    [clinicId, userProfile?.displayName]
  );

  /**
   * Delete a record.
   */
  const deleteRecord = useCallback(
    async (id: string): Promise<void> => {
      if (!clinicId) {
        throw new Error('No clinic selected');
      }
      await recordService.delete(clinicId, id);
    },
    [clinicId]
  );

  /**
   * Get version history for a record.
   */
  const getVersionHistory = useCallback(
    async (recordId: string): Promise<RecordVersion[]> => {
      if (!clinicId) {
        throw new Error('No clinic selected');
      }
      return recordService.getVersionHistory(clinicId, recordId);
    },
    [clinicId]
  );

  /**
   * Restore a record to a previous version.
   */
  const restoreVersion = useCallback(
    async (recordId: string, versionNumber: number): Promise<number> => {
      if (!clinicId) {
        throw new Error('No clinic selected');
      }
      const restoredBy = userProfile?.displayName || 'Profissional';
      return recordService.restoreVersion(clinicId, recordId, versionNumber, restoredBy);
    },
    [clinicId, userProfile?.displayName]
  );

  return {
    records: effectiveRecords,
    loading: effectiveLoading,
    error,
    addRecord,
    updateRecord,
    deleteRecord,
    getVersionHistory,
    restoreVersion,
  };
}

/**
 * Hook for accessing all records in a clinic.
 *
 * @returns All records data and operations
 */
export function useAllRecords(): UseRecordsReturn {
  const { clinicId, userProfile } = useClinicContext();

  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [error, setError] = useState<Error | null>(null);

  // Track subscription state
  const [hasReceivedAll, setHasReceivedAll] = useState(false);

  // Subscribe to real-time updates
  useEffect(() => {
    // Early return without setState - state is derived below
    if (!clinicId) {
      return;
    }

    // Track active state for cleanup
    let isActive = true;

    const unsubscribe = recordService.subscribe(clinicId, (data) => {
      if (isActive) {
        setRecords(data);
        setHasReceivedAll(true);
        setError(null);
      }
    });

    return () => {
      isActive = false;
      setHasReceivedAll(false);
      unsubscribe();
    };
  }, [clinicId]);

  // Derive final values based on clinicId presence
  const effectiveAllRecords = clinicId ? records : [];
  const effectiveAllLoading = clinicId ? !hasReceivedAll : false;

  /**
   * Create a new medical record.
   */
  const addRecord = useCallback(
    async (data: CreateRecordInput): Promise<string> => {
      if (!clinicId) {
        throw new Error('No clinic selected');
      }

      const professional = userProfile?.displayName || 'Profissional';

      return recordService.create(clinicId, data, professional);
    },
    [clinicId, userProfile?.displayName]
  );

  /**
   * Update an existing record with versioning.
   */
  const updateRecord = useCallback(
    async (id: string, data: Partial<MedicalRecord>, changeReason?: string): Promise<void> => {
      if (!clinicId) {
        throw new Error('No clinic selected');
      }
      const updatedBy = userProfile?.displayName || 'Profissional';
      await recordService.update(clinicId, id, data, updatedBy, changeReason);
    },
    [clinicId, userProfile?.displayName]
  );

  /**
   * Delete a record.
   */
  const deleteRecord = useCallback(
    async (id: string): Promise<void> => {
      if (!clinicId) {
        throw new Error('No clinic selected');
      }
      await recordService.delete(clinicId, id);
    },
    [clinicId]
  );

  /**
   * Get version history for a record.
   */
  const getVersionHistory = useCallback(
    async (recordId: string): Promise<RecordVersion[]> => {
      if (!clinicId) {
        throw new Error('No clinic selected');
      }
      return recordService.getVersionHistory(clinicId, recordId);
    },
    [clinicId]
  );

  /**
   * Restore a record to a previous version.
   */
  const restoreVersion = useCallback(
    async (recordId: string, versionNumber: number): Promise<number> => {
      if (!clinicId) {
        throw new Error('No clinic selected');
      }
      const restoredBy = userProfile?.displayName || 'Profissional';
      return recordService.restoreVersion(clinicId, recordId, versionNumber, restoredBy);
    },
    [clinicId, userProfile?.displayName]
  );

  return {
    records: effectiveAllRecords,
    loading: effectiveAllLoading,
    error,
    addRecord,
    updateRecord,
    deleteRecord,
    getVersionHistory,
    restoreVersion,
  };
}
