/**
 * useAppointments Hook
 *
 * Provides real-time access to appointments with filtering options.
 * Includes CRUD operations and loading/error states.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useClinicContext } from '../contexts/ClinicContext';
import { appointmentService } from '../services/firestore';
import type { Appointment, Status, CreateAppointmentInput } from '@/types';

/**
 * Filter options for appointments.
 */
export interface AppointmentFilters {
  /** Filter by specific date (YYYY-MM-DD) */
  date?: string;
  /** Filter by patient ID */
  patientId?: string;
}

/**
 * Return type for useAppointments hook.
 */
export interface UseAppointmentsReturn {
  /** Array of appointments (filtered) */
  appointments: Appointment[];
  /** Today's appointments (convenience) */
  todaysAppointments: Appointment[];
  /** Loading state for initial fetch */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Create a new appointment */
  addAppointment: (data: CreateAppointmentInput) => Promise<string>;
  /** Update an existing appointment */
  updateAppointment: (id: string, data: Partial<Appointment>) => Promise<void>;
  /** Update appointment status */
  updateStatus: (id: string, status: Status) => Promise<void>;
  /** Delete an appointment */
  deleteAppointment: (id: string) => Promise<void>;
  /** Set filters */
  setFilters: (filters: AppointmentFilters) => void;
  /** Clear filters */
  clearFilters: () => void;
}

/**
 * Get today's date in YYYY-MM-DD format.
 */
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Hook for managing appointments with real-time updates.
 *
 * @param initialFilters - Optional initial filter settings
 * @returns Appointments data and CRUD operations
 *
 * @example
 * const { appointments, todaysAppointments, addAppointment } = useAppointments();
 *
 * // Or with filters
 * const { appointments } = useAppointments({ date: '2025-01-15' });
 */
export function useAppointments(
  initialFilters: AppointmentFilters = {}
): UseAppointmentsReturn {
  const { clinicId } = useClinicContext();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<AppointmentFilters>(initialFilters);

  // Track subscription state
  const [hasReceived, setHasReceived] = useState(false);

  // Subscribe to real-time updates
  useEffect(() => {
    // Early return without setState - state is derived below
    if (!clinicId) {
      return;
    }

    // Track active state for cleanup
    let isActive = true;
    let unsubscribe: () => void;

    const handleData = (data: Appointment[]) => {
      if (isActive) {
        setAppointments(data);
        setHasReceived(true);
        setError(null);
      }
    };

    if (filters.patientId) {
      // Subscribe to patient's appointments
      unsubscribe = appointmentService.subscribeByPatient(
        clinicId,
        filters.patientId,
        handleData
      );
    } else if (filters.date) {
      // Subscribe to appointments for a specific date
      unsubscribe = appointmentService.subscribeByDate(clinicId, filters.date, handleData);
    } else {
      // Subscribe to all appointments
      unsubscribe = appointmentService.subscribe(clinicId, handleData);
    }

    return () => {
      isActive = false;
      setHasReceived(false);
      unsubscribe();
    };
  }, [clinicId, filters.date, filters.patientId]);

  // Derive final values based on clinicId presence
  const effectiveAppointments = clinicId ? appointments : [];
  const effectiveLoading = clinicId ? !hasReceived : false;

  /**
   * Today's appointments (filtered from all appointments).
   */
  const todaysAppointments = useMemo(() => {
    const today = getTodayDate();
    return effectiveAppointments.filter((apt) => apt.date.startsWith(today));
  }, [effectiveAppointments]);

  /**
   * Create a new appointment.
   */
  const addAppointment = useCallback(
    async (data: CreateAppointmentInput): Promise<string> => {
      if (!clinicId) {
        throw new Error('No clinic selected');
      }
      return appointmentService.create(clinicId, data);
    },
    [clinicId]
  );

  /**
   * Update an existing appointment.
   */
  const updateAppointment = useCallback(
    async (id: string, data: Partial<Appointment>): Promise<void> => {
      if (!clinicId) {
        throw new Error('No clinic selected');
      }
      await appointmentService.update(clinicId, id, data);
    },
    [clinicId]
  );

  /**
   * Update appointment status.
   */
  const updateStatus = useCallback(
    async (id: string, status: Status): Promise<void> => {
      if (!clinicId) {
        throw new Error('No clinic selected');
      }
      await appointmentService.updateStatus(clinicId, id, status);
    },
    [clinicId]
  );

  /**
   * Delete an appointment.
   */
  const deleteAppointment = useCallback(
    async (id: string): Promise<void> => {
      if (!clinicId) {
        throw new Error('No clinic selected');
      }
      await appointmentService.delete(clinicId, id);
    },
    [clinicId]
  );

  /**
   * Clear all filters.
   */
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  return {
    appointments: effectiveAppointments,
    todaysAppointments,
    loading: effectiveLoading,
    error,
    addAppointment,
    updateAppointment,
    updateStatus,
    deleteAppointment,
    setFilters,
    clearFilters,
  };
}

/**
 * Hook for accessing a patient's appointments.
 *
 * @param patientId - The patient ID
 * @returns Appointments data and operations for the patient
 */
export function usePatientAppointments(patientId: string | undefined) {
  return useAppointments(patientId ? { patientId } : {});
}
