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
    const yesterday = subDays(today, 1);
    const thisMonth = startOfMonth(now);
    const lastMonth = subMonths(thisMonth, 1);
    const lastMonthEnd = endOfMonth(lastMonth);
    const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday

    // ============================================
    // TODAY'S APPOINTMENTS
    // ============================================
    const todayAppts = appointments.filter((apt) => {
      const aptDate = parseISO(apt.date);
      return isWithinInterval(aptDate, {
        start: today,
        end: endOfDay(today),
      });
    });

    const yesterdayAppts = appointments.filter((apt) => {
      const aptDate = parseISO(apt.date);
      return isWithinInterval(aptDate, {
        start: yesterday,
        end: endOfDay(yesterday),
      });
    });

    const todayCount = todayAppts.length;
    const yesterdayCount = yesterdayAppts.length;
    const todayChange =
      yesterdayCount > 0
        ? ((todayCount - yesterdayCount) / yesterdayCount) * 100
        : todayCount > 0
          ? 100
          : 0;

    // ============================================
    // ACTIVE PATIENTS
    // ============================================
    const activePatientCount = patients.length;

    // Estimate last month's patient count (simplified)
    const patientsLastMonth = new Set(
      appointments
        .filter((apt) => {
          const aptDate = parseISO(apt.date);
          return isWithinInterval(aptDate, {
            start: lastMonth,
            end: lastMonthEnd,
          });
        })
        .map((apt) => apt.patientId)
    ).size;

    const patientChange =
      patientsLastMonth > 0
        ? ((activePatientCount - patientsLastMonth) / patientsLastMonth) * 100
        : activePatientCount > 0
          ? 100
          : 0;

    // ============================================
    // REVENUE
    // ============================================
    const completedThisMonth = appointments.filter((apt) => {
      const aptDate = parseISO(apt.date);
      return (
        apt.status === Status.FINISHED &&
        isWithinInterval(aptDate, {
          start: thisMonth,
          end: now,
        })
      );
    });

    const completedLastMonth = appointments.filter((apt) => {
      const aptDate = parseISO(apt.date);
      return (
        apt.status === Status.FINISHED &&
        isWithinInterval(aptDate, {
          start: lastMonth,
          end: lastMonthEnd,
        })
      );
    });

    const revenueThisMonth = completedThisMonth.length * AVERAGE_TICKET;
    const revenueLastMonth = completedLastMonth.length * AVERAGE_TICKET;
    const revenueChange =
      revenueLastMonth > 0
        ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
        : revenueThisMonth > 0
          ? 100
          : 0;

    // ============================================
    // OCCUPANCY
    // ============================================
    // Calculate week's available slots
    let totalWeekSlots = 0;
    let bookedWeekSlots = 0;

    for (let i = 0; i < 7; i++) {
      const day = new Date(thisWeekStart);
      day.setDate(day.getDate() + i);
      const daySlots = calculateDaySlots(day);
      totalWeekSlots += daySlots;

      // Count appointments for this day
      const dayAppts = appointments.filter((apt) => {
        const aptDate = parseISO(apt.date);
        return isWithinInterval(aptDate, {
          start: startOfDay(day),
          end: endOfDay(day),
        });
      });

      // Calculate slots used (based on duration)
      const slotsUsed = dayAppts.reduce((sum, apt) => {
        const slotsForAppt = Math.ceil(apt.durationMin / WORKING_HOURS.slotDurationMin);
        return sum + slotsForAppt;
      }, 0);

      bookedWeekSlots += Math.min(slotsUsed, daySlots);
    }

    const occupancyRate = totalWeekSlots > 0 ? (bookedWeekSlots / totalWeekSlots) * 100 : 0;

    const occupancyTarget = 85;
    const occupancyStatus: OccupancyMetrics['status'] =
      occupancyRate >= 80 ? 'excellent' : occupancyRate >= 60 ? 'good' : 'needs-attention';

    // ============================================
    // APPOINTMENT BREAKDOWN
    // ============================================
    const breakdown: AppointmentBreakdown = {
      confirmed: todayAppts.filter((a) => a.status === Status.CONFIRMED).length,
      pending: todayAppts.filter((a) => a.status === Status.PENDING).length,
      completed: todayAppts.filter((a) => a.status === Status.FINISHED).length,
      noShow: todayAppts.filter((a) => a.status === Status.NO_SHOW).length,
      canceled: todayAppts.filter((a) => a.status === Status.CANCELED).length,
    };

    return {
      todayAppointments: {
        value: todayCount,
        previousValue: yesterdayCount,
        changePercent: todayChange,
        trend: getTrendDirection(todayChange),
        comparisonText: formatComparison(todayChange, 'ontem'),
      },
      activePatients: {
        value: activePatientCount,
        previousValue: patientsLastMonth,
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
        completedCount: completedThisMonth.length,
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
