/**
 * useReports Hook
 *
 * Provides aggregated report data from Firestore.
 * Includes patient demographics, procedure stats, and financial metrics.
 *
 * Fase 4: Financeiro & Relatórios
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useClinicContext } from '../contexts/ClinicContext';
import { patientService } from '../services/firestore/patient.service';
import { appointmentService } from '../services/firestore/appointment.service';
import type { Patient, Appointment, SpecialtyType, DateRange } from '@/types';

/**
 * Report filter options.
 */
export interface ReportFilters {
  dateRange?: DateRange;
  specialty?: SpecialtyType;
  professional?: string;
}

/**
 * Demographics data for charts.
 */
export interface DemographicsData {
  gender: { name: string; value: number; color: string }[];
  ageGroups: { name: string; value: number }[];
}

/**
 * Procedure statistics.
 */
export interface ProcedureStats {
  name: string;
  value: number;
}

/**
 * Key metrics for the clinic.
 */
export interface ClinicMetrics {
  totalPatients: number;
  activePatients: number;
  avgTicket: number;
  ltv: number;
  appointmentsCount: number;
  completionRate: number;
}

/**
 * Return type for useReports hook.
 */
export interface UseReportsReturn {
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Demographics data */
  demographics: DemographicsData | null;
  /** Procedure statistics */
  procedureStats: ProcedureStats[];
  /** Key metrics */
  metrics: ClinicMetrics | null;
  /** Current filters */
  filters: ReportFilters;
  /** Set filters */
  setFilters: (filters: ReportFilters) => void;
  /** Refresh data */
  refresh: () => Promise<void>;
}

/**
 * Calculate age from birth date.
 */
function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Get age group label.
 */
function getAgeGroup(age: number): string {
  if (age < 18) return '< 18';
  if (age <= 25) return '18-25';
  if (age <= 35) return '26-35';
  if (age <= 45) return '36-45';
  if (age <= 55) return '46-55';
  return '56+';
}

/**
 * Get date range for current month.
 */
function getCurrentMonthRange(): DateRange {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
}

/**
 * Hook for generating clinic reports with real data.
 */
export function useReports(): UseReportsReturn {
  const { clinicId } = useClinicContext();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: getCurrentMonthRange(),
  });

  // Fetch all data
  const fetchData = useCallback(async () => {
    if (!clinicId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [patientsData, appointmentsData] = await Promise.all([
        patientService.getAll(clinicId),
        appointmentService.getAll(clinicId),
      ]);

      setPatients(patientsData);
      setAppointments(appointmentsData);
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter appointments by date range
  const filteredAppointments = useMemo(() => {
    let result = appointments;

    if (filters.dateRange) {
      const start = new Date(filters.dateRange.startDate);
      const end = new Date(filters.dateRange.endDate);
      result = result.filter((a) => {
        const date = new Date(a.date);
        return date >= start && date <= end;
      });
    }

    if (filters.specialty) {
      result = result.filter((a) => a.specialty === filters.specialty);
    }

    if (filters.professional) {
      result = result.filter((a) => a.professional === filters.professional);
    }

    return result;
  }, [appointments, filters]);

  // Calculate demographics
  const demographics = useMemo((): DemographicsData | null => {
    if (patients.length === 0) return null;

    // Gender distribution
    const genderCounts = patients.reduce(
      (acc, p) => {
        const gender = p.gender?.toLowerCase() || 'outro';
        if (gender === 'feminino' || gender === 'f') {
          acc.feminino++;
        } else if (gender === 'masculino' || gender === 'm') {
          acc.masculino++;
        } else {
          acc.outro++;
        }
        return acc;
      },
      { feminino: 0, masculino: 0, outro: 0 }
    );

    const total = patients.length;
    const gender = [
      {
        name: 'Feminino',
        value: Math.round((genderCounts.feminino / total) * 100),
        color: '#22C55E',
      },
      {
        name: 'Masculino',
        value: Math.round((genderCounts.masculino / total) * 100),
        color: '#3B82F6',
      },
    ];

    if (genderCounts.outro > 0) {
      gender.push({
        name: 'Outro',
        value: Math.round((genderCounts.outro / total) * 100),
        color: '#8B5CF6',
      });
    }

    // Age distribution
    const ageCounts: Record<string, number> = {};
    for (const p of patients) {
      if (p.birthDate) {
        const age = calculateAge(p.birthDate);
        const group = getAgeGroup(age);
        ageCounts[group] = (ageCounts[group] || 0) + 1;
      }
    }

    const ageOrder = ['< 18', '18-25', '26-35', '36-45', '46-55', '56+'];
    const ageGroups = ageOrder
      .filter((group) => ageCounts[group])
      .map((name) => ({
        name,
        value: Math.round((ageCounts[name] / total) * 100),
      }));

    return { gender, ageGroups };
  }, [patients]);

  // Calculate procedure stats
  const procedureStats = useMemo((): ProcedureStats[] => {
    if (filteredAppointments.length === 0) return [];

    const procedureCounts: Record<string, number> = {};
    for (const a of filteredAppointments) {
      const procedure = a.procedure || 'Outros';
      procedureCounts[procedure] = (procedureCounts[procedure] || 0) + 1;
    }

    return Object.entries(procedureCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [filteredAppointments]);

  // Calculate key metrics
  const metrics = useMemo((): ClinicMetrics | null => {
    if (patients.length === 0) return null;

    // Count patients with appointments in the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const patientsWithRecentAppts = new Set<string>();
    for (const a of appointments) {
      if (new Date(a.date) >= sixMonthsAgo) {
        patientsWithRecentAppts.add(a.patientId);
      }
    }

    // Calculate completion rate
    const completed = filteredAppointments.filter(
      (a) => a.status === 'Finalizado'
    ).length;
    const completionRate =
      filteredAppointments.length > 0
        ? Math.round((completed / filteredAppointments.length) * 100)
        : 0;

    return {
      totalPatients: patients.length,
      activePatients: patientsWithRecentAppts.size,
      avgTicket: 0, // Will be calculated from transactions
      ltv: 0, // Will be calculated from transactions
      appointmentsCount: filteredAppointments.length,
      completionRate,
    };
  }, [patients, appointments, filteredAppointments]);

  return {
    loading,
    error,
    demographics,
    procedureStats,
    metrics,
    filters,
    setFilters,
    refresh: fetchData,
  };
}

export default useReports;
