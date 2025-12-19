/**
 * WhatsApp Metrics Service
 *
 * Aggregates appointment reminder data into actionable metrics.
 * Optimized for performance with memoization-friendly data structures.
 */

import { Appointment, ReminderStatus, Status } from '../types';

export interface WhatsAppMetrics {
  // Core KPIs
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  totalFailed: number;
  totalConfirmed: number;
  totalNeedReschedule: number;

  // Rates (percentages)
  deliveryRate: number;
  readRate: number;
  confirmationRate: number;
  responseRate: number;

  // By Type
  confirmation: StatusCounts;
  reminder24h: StatusCounts;
  reminder2h: StatusCounts;

  // Time Series (for charts)
  dailyStats: DailyStats[];

  // No-show impact
  noShowsWithReminder: number;
  noShowsWithoutReminder: number;
  noShowReduction: number;
}

export interface StatusCounts {
  pending: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  total: number;
}

export interface DailyStats {
  date: string;
  sent: number;
  delivered: number;
  read: number;
  confirmed: number;
}

const REMINDER_STATUSES: ReminderStatus[] = ['pending', 'sent', 'delivered', 'read', 'failed'];

function createEmptyStatusCounts(): StatusCounts {
  return { pending: 0, sent: 0, delivered: 0, read: 0, failed: 0, total: 0 };
}

function countStatus(status: ReminderStatus | undefined, counts: StatusCounts): void {
  if (!status) return;
  if (REMINDER_STATUSES.includes(status)) {
    counts[status]++;
    counts.total++;
  }
}

/**
 * Calculate WhatsApp metrics from appointments.
 * Pure function - safe for memoization.
 */
export function calculateWhatsAppMetrics(appointments: Appointment[]): WhatsAppMetrics {
  const confirmation = createEmptyStatusCounts();
  const reminder24h = createEmptyStatusCounts();
  const reminder2h = createEmptyStatusCounts();

  let totalConfirmed = 0;
  let totalNeedReschedule = 0;
  let noShowsWithReminder = 0;
  let noShowsWithoutReminder = 0;

  const dailyMap = new Map<string, DailyStats>();

  for (const apt of appointments) {
    const reminder = apt.reminder;
    if (!reminder) {
      // No reminder sent - track for no-show comparison
      if (apt.status === Status.NO_SHOW) {
        noShowsWithoutReminder++;
      }
      continue;
    }

    // Count by type
    countStatus(reminder.confirmation?.status, confirmation);
    countStatus(reminder.reminder24h?.status, reminder24h);
    countStatus(reminder.reminder2h?.status, reminder2h);

    // Patient responses
    if (reminder.patientResponse?.confirmed) {
      totalConfirmed++;
    }
    if (reminder.patientResponse?.needsReschedule) {
      totalNeedReschedule++;
    }

    // No-show with reminder
    if (apt.status === Status.NO_SHOW) {
      noShowsWithReminder++;
    }

    // Daily aggregation (use appointment date)
    const dateKey = apt.date.split('T')[0];
    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, { date: dateKey, sent: 0, delivered: 0, read: 0, confirmed: 0 });
    }
    const daily = dailyMap.get(dateKey)!;

    // Count any sent message for daily stats
    if (reminder.reminder24h?.status && reminder.reminder24h.status !== 'pending') {
      daily.sent++;
      if (['delivered', 'read'].includes(reminder.reminder24h.status)) {
        daily.delivered++;
      }
      if (reminder.reminder24h.status === 'read') {
        daily.read++;
      }
    }
    if (reminder.patientResponse?.confirmed) {
      daily.confirmed++;
    }
  }

  // Aggregate totals
  const totalSent = confirmation.sent + confirmation.delivered + confirmation.read +
                    reminder24h.sent + reminder24h.delivered + reminder24h.read +
                    reminder2h.sent + reminder2h.delivered + reminder2h.read;

  const totalDelivered = confirmation.delivered + confirmation.read +
                         reminder24h.delivered + reminder24h.read +
                         reminder2h.delivered + reminder2h.read;

  const totalRead = confirmation.read + reminder24h.read + reminder2h.read;
  const totalFailed = confirmation.failed + reminder24h.failed + reminder2h.failed;

  // Calculate rates (avoid division by zero)
  const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
  const readRate = totalDelivered > 0 ? (totalRead / totalDelivered) * 100 : 0;

  const totalWithReminder = confirmation.total + reminder24h.total + reminder2h.total;
  const totalResponses = totalConfirmed + totalNeedReschedule;
  const responseRate = totalWithReminder > 0 ? (totalResponses / totalWithReminder) * 100 : 0;
  const confirmationRate = totalResponses > 0 ? (totalConfirmed / totalResponses) * 100 : 0;

  // No-show reduction calculation
  const totalNoShows = noShowsWithReminder + noShowsWithoutReminder;
  const noShowReduction = totalNoShows > 0
    ? ((noShowsWithoutReminder - noShowsWithReminder) / totalNoShows) * 100
    : 0;

  // Sort daily stats by date
  const dailyStats = Array.from(dailyMap.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30); // Last 30 days

  return {
    totalSent,
    totalDelivered,
    totalRead,
    totalFailed,
    totalConfirmed,
    totalNeedReschedule,
    deliveryRate,
    readRate,
    confirmationRate,
    responseRate,
    confirmation,
    reminder24h,
    reminder2h,
    dailyStats,
    noShowsWithReminder,
    noShowsWithoutReminder,
    noShowReduction,
  };
}

/**
 * Format percentage for display.
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Get status color class.
 */
export function getStatusColor(status: ReminderStatus): string {
  switch (status) {
    case 'read':
      return 'text-blue-600 bg-blue-50 border-blue-100';
    case 'delivered':
      return 'text-green-600 bg-green-50 border-green-100';
    case 'sent':
      return 'text-amber-600 bg-amber-50 border-amber-100';
    case 'failed':
      return 'text-red-600 bg-red-50 border-red-100';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-100';
  }
}
