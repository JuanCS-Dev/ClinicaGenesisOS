/**
 * useDashboardMetrics Hook
 *
 * Calculates real-time dashboard metrics with temporal comparisons.
 * Provides KPIs with trend indicators and percentage changes.
 *
 * Inspired by: athenahealth Executive Summary, Elation three-panel dashboard
 */

import { useMemo } from 'react';
import {
  startOfDay,
  endOfDay,
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfWeek,
  isWithinInterval,
  parseISO,
} from 'date-fns';
import { useAppointments } from './useAppointments';
import { usePatients } from './usePatients';
import { Status } from '@/types';

/**
 * Trend direction for KPI comparison.
 */
export type TrendDirection = 'up' | 'down' | 'stable';

/**
 * A single metric with comparison data.
 */
export interface MetricWithTrend {
  /** Current value */
  value: number;
  /** Previous period value */
  previousValue: number;
  /** Percentage change from previous period */
  changePercent: number;
  /** Trend direction */
  trend: TrendDirection;
  /** Human-readable comparison text */
  comparisonText: string;
}

/**
 * Occupancy metrics for the clinic.
 */
export interface OccupancyMetrics {
  /** Current occupancy percentage (0-100) */
  rate: number;
  /** Target occupancy (typically 85%) */
  target: number;
  /** Number of booked slots */
  bookedSlots: number;
  /** Total available slots */
  totalSlots: number;
  /** Status: excellent, good, or needs-attention */
  status: 'excellent' | 'good' | 'needs-attention';
}

/**
 * Revenue metrics with breakdown.
 */
export interface RevenueMetrics extends MetricWithTrend {
  /** Average ticket per appointment */
  averageTicket: number;
  /** Number of completed appointments */
  completedCount: number;
}

/**
 * Appointment status breakdown.
 */
export interface AppointmentBreakdown {
  confirmed: number;
  pending: number;
  completed: number;
  noShow: number;
  canceled: number;
}

/**
 * Full dashboard metrics return type.
 */
export interface DashboardMetrics {
  /** Today's appointments with trend vs yesterday */
  todayAppointments: MetricWithTrend;
  /** Active patients with trend vs last month */
  activePatients: MetricWithTrend;
  /** Revenue with trend vs last month */
  revenue: RevenueMetrics;
  /** Occupancy rate */
  occupancy: OccupancyMetrics;
  /** Appointment status breakdown for today */
  breakdown: AppointmentBreakdown;
  /** Loading state */
  loading: boolean;
}

/**
 * Default working hours configuration.
 * TODO: Make this configurable per clinic.
 */
const WORKING_HOURS = {
  startHour: 8, // 8 AM
  endHour: 18, // 6 PM
  slotDurationMin: 30, // 30 min slots
  workDays: [1, 2, 3, 4, 5], // Monday to Friday
};

/**
 * Average ticket value in BRL.
 * TODO: Calculate from actual billing data.
 */
const AVERAGE_TICKET = 350;

/**
 * Calculate the number of available slots for a given day.
 */
function calculateDaySlots(date: Date): number {
  const dayOfWeek = date.getDay();

  // Check if it's a work day
  if (!WORKING_HOURS.workDays.includes(dayOfWeek)) {
    return 0;
  }

  const hoursPerDay = WORKING_HOURS.endHour - WORKING_HOURS.startHour;
  const slotsPerHour = 60 / WORKING_HOURS.slotDurationMin;

  return hoursPerDay * slotsPerHour;
}

/**
 * Calculate trend direction based on change percentage.
 */
function getTrendDirection(change: number): TrendDirection {
  if (change > 2) return 'up';
  if (change < -2) return 'down';
  return 'stable';
}

/**
 * Format comparison text for display.
 */
function formatComparison(change: number, period: string): string {
  if (Math.abs(change) < 1) {
    return `Igual ${period}`;
  }

  const direction = change > 0 ? '+' : '';
  return `${direction}${Math.round(change)}% vs ${period}`;
}

/**
 * Hook for calculating dashboard metrics with real-time updates.
 *
 * @returns Dashboard metrics with trends and comparisons
 *
 * @example
 * const { todayAppointments, revenue, occupancy, loading } = useDashboardMetrics();
 *
 * if (loading) return <Skeleton />;
 *
 * return (
 *   <KPICard
 *     value={todayAppointments.value}
 *     trend={todayAppointments.trend}
 *     change={todayAppointments.comparisonText}
 *   />
 * );
 */
export function useDashboardMetrics(): DashboardMetrics {
  const { appointments, loading: appointmentsLoading } = useAppointments();
  const { patients, loading: patientsLoading } = usePatients();

  const metrics = useMemo(() => {
    const now = new Date();
    const today = startOfDay(now);
    const todayEnd = endOfDay(today);
    const yesterday = subDays(today, 1);
    const yesterdayEnd = endOfDay(yesterday);
    const thisMonth = startOfMonth(now);
    const lastMonth = subMonths(thisMonth, 1);
    const lastMonthEnd = endOfMonth(lastMonth);
    const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday

    // Pre-calculate week day boundaries for occupancy
    const weekDays: Array<{ start: Date; end: Date; slots: number }> = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(thisWeekStart);
      day.setDate(day.getDate() + i);
      weekDays.push({
        start: startOfDay(day),
        end: endOfDay(day),
        slots: calculateDaySlots(day),
      });
    }

    // ============================================
    // SINGLE-PASS AGGREGATION
    // Instead of 12+ filter passes, we do ONE pass through appointments
    // ============================================
    const aggregated = {
      todayCount: 0,
      yesterdayCount: 0,
      completedThisMonth: 0,
      completedLastMonth: 0,
      patientsLastMonth: new Set<string>(),
      weekSlots: new Array(7).fill(0), // slots used per day
      // Today's breakdown by status
      todayByStatus: {
        [Status.CONFIRMED]: 0,
        [Status.PENDING]: 0,
        [Status.FINISHED]: 0,
        [Status.NO_SHOW]: 0,
        [Status.CANCELED]: 0,
      } as Record<Status, number>,
    };

    // Single pass through all appointments
    for (const apt of appointments) {
      const aptDate = parseISO(apt.date);

      // Today's appointments
      if (isWithinInterval(aptDate, { start: today, end: todayEnd })) {
        aggregated.todayCount++;
        // Count by status for breakdown
        if (apt.status in aggregated.todayByStatus) {
          aggregated.todayByStatus[apt.status]++;
        }
      }

      // Yesterday's appointments
      if (isWithinInterval(aptDate, { start: yesterday, end: yesterdayEnd })) {
        aggregated.yesterdayCount++;
      }

      // Completed this month
      if (apt.status === Status.FINISHED && isWithinInterval(aptDate, { start: thisMonth, end: now })) {
        aggregated.completedThisMonth++;
      }

      // Completed last month
      if (apt.status === Status.FINISHED && isWithinInterval(aptDate, { start: lastMonth, end: lastMonthEnd })) {
        aggregated.completedLastMonth++;
      }

      // Patients from last month (for patient growth calculation)
      if (isWithinInterval(aptDate, { start: lastMonth, end: lastMonthEnd })) {
        aggregated.patientsLastMonth.add(apt.patientId);
      }

      // Week occupancy - check each day
      for (let i = 0; i < 7; i++) {
        if (isWithinInterval(aptDate, { start: weekDays[i].start, end: weekDays[i].end })) {
          const slotsForAppt = Math.ceil(apt.durationMin / WORKING_HOURS.slotDurationMin);
          aggregated.weekSlots[i] += slotsForAppt;
          break; // An appointment can only be on one day
        }
      }
    }

    // ============================================
    // CALCULATE METRICS FROM AGGREGATED DATA
    // ============================================

    // Today's appointments change
    const todayChange =
      aggregated.yesterdayCount > 0
        ? ((aggregated.todayCount - aggregated.yesterdayCount) / aggregated.yesterdayCount) * 100
        : aggregated.todayCount > 0 ? 100 : 0;

    // Active patients
    const activePatientCount = patients.length;
    const patientsLastMonthCount = aggregated.patientsLastMonth.size;
    const patientChange =
      patientsLastMonthCount > 0
        ? ((activePatientCount - patientsLastMonthCount) / patientsLastMonthCount) * 100
        : activePatientCount > 0 ? 100 : 0;

    // Revenue
    const revenueThisMonth = aggregated.completedThisMonth * AVERAGE_TICKET;
    const revenueLastMonth = aggregated.completedLastMonth * AVERAGE_TICKET;
    const revenueChange =
      revenueLastMonth > 0
        ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
        : revenueThisMonth > 0 ? 100 : 0;

    // Occupancy
    let totalWeekSlots = 0;
    let bookedWeekSlots = 0;
    for (let i = 0; i < 7; i++) {
      totalWeekSlots += weekDays[i].slots;
      bookedWeekSlots += Math.min(aggregated.weekSlots[i], weekDays[i].slots);
    }
    const occupancyRate = totalWeekSlots > 0 ? (bookedWeekSlots / totalWeekSlots) * 100 : 0;
    const occupancyTarget = 85;
    const occupancyStatus: OccupancyMetrics['status'] =
      occupancyRate >= 80 ? 'excellent' : occupancyRate >= 60 ? 'good' : 'needs-attention';

    // Breakdown (from aggregated today data)
    const breakdown: AppointmentBreakdown = {
      confirmed: aggregated.todayByStatus[Status.CONFIRMED] || 0,
      pending: aggregated.todayByStatus[Status.PENDING] || 0,
      completed: aggregated.todayByStatus[Status.FINISHED] || 0,
      noShow: aggregated.todayByStatus[Status.NO_SHOW] || 0,
      canceled: aggregated.todayByStatus[Status.CANCELED] || 0,
    };

    return {
      todayAppointments: {
        value: aggregated.todayCount,
        previousValue: aggregated.yesterdayCount,
        changePercent: todayChange,
        trend: getTrendDirection(todayChange),
        comparisonText: formatComparison(todayChange, 'ontem'),
      },
      activePatients: {
        value: activePatientCount,
        previousValue: patientsLastMonthCount,
        changePercent: patientChange,
        trend: getTrendDirection(patientChange),
        comparisonText: formatComparison(patientChange, 'mês ant.'),
      },
      revenue: {
        value: revenueThisMonth,
        previousValue: revenueLastMonth,
        changePercent: revenueChange,
        trend: getTrendDirection(revenueChange),
        comparisonText: formatComparison(revenueChange, 'mês ant.'),
        averageTicket: AVERAGE_TICKET,
        completedCount: aggregated.completedThisMonth,
      },
      occupancy: {
        rate: Math.round(occupancyRate),
        target: occupancyTarget,
        bookedSlots: bookedWeekSlots,
        totalSlots: totalWeekSlots,
        status: occupancyStatus,
      },
      breakdown,
    };
  }, [appointments, patients]);

  return {
    ...metrics,
    loading: appointmentsLoading || patientsLoading,
  };
}

export default useDashboardMetrics;
