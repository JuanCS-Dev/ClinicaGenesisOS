/**
 * Recurrence Utility Functions
 *
 * Handles expansion of recurring appointments into individual instances
 * for display in calendar views.
 */

import {
  addDays,
  addWeeks,
  addMonths,
  parseISO,
  format,
  isAfter,
  isBefore,
  startOfDay,
  getDay,
  setHours,
  setMinutes,
} from 'date-fns';
import type { Appointment, RecurrenceFrequency } from '@/types';

/**
 * Generate a unique ID for an expanded recurrence instance.
 *
 * @param parentId - The original appointment ID
 * @param instanceDate - The date of this specific instance
 * @returns Unique ID for this instance
 */
function generateInstanceId(parentId: string, instanceDate: Date): string {
  return `${parentId}_${format(instanceDate, 'yyyyMMdd')}`;
}

/**
 * Get the next occurrence date based on frequency.
 *
 * @param currentDate - Current occurrence date
 * @param frequency - Recurrence frequency
 * @returns Next occurrence date
 */
function getNextOccurrence(currentDate: Date, frequency: RecurrenceFrequency): Date {
  switch (frequency) {
    case 'daily':
      return addDays(currentDate, 1);
    case 'weekly':
      return addWeeks(currentDate, 1);
    case 'biweekly':
      return addWeeks(currentDate, 2);
    case 'monthly':
      return addMonths(currentDate, 1);
    default:
      return addDays(currentDate, 1);
  }
}

/**
 * Check if a date falls on one of the specified days of week.
 *
 * @param date - Date to check
 * @param daysOfWeek - Array of day numbers (0=Sunday, 6=Saturday)
 * @returns True if date is on one of the specified days
 */
function isOnAllowedDay(date: Date, daysOfWeek?: number[]): boolean {
  if (!daysOfWeek || daysOfWeek.length === 0) {
    return true;
  }
  return daysOfWeek.includes(getDay(date));
}

/**
 * Expand a single recurring appointment into multiple instances.
 *
 * @param appointment - The recurring appointment to expand
 * @param rangeStart - Start of the date range to generate instances for
 * @param rangeEnd - End of the date range to generate instances for
 * @returns Array of expanded appointment instances
 */
export function expandRecurringAppointment(
  appointment: Appointment,
  rangeStart: Date,
  rangeEnd: Date
): Appointment[] {
  const { recurrence } = appointment;

  // If no recurrence pattern, return the original appointment if in range
  if (!recurrence) {
    const appointmentDate = parseISO(appointment.date);
    if (
      !isBefore(appointmentDate, startOfDay(rangeStart)) &&
      !isAfter(appointmentDate, rangeEnd)
    ) {
      return [appointment];
    }
    return [];
  }

  const instances: Appointment[] = [];
  const originalDate = parseISO(appointment.date);
  const originalHour = originalDate.getHours();
  const originalMinutes = originalDate.getMinutes();

  // Determine the end date for recurrence
  const recurrenceEnd = recurrence.endDate
    ? parseISO(recurrence.endDate)
    : addMonths(rangeEnd, 12); // Default: generate up to 12 months if no end

  let currentDate = originalDate;

  // Generate instances within the range
  while (!isAfter(currentDate, rangeEnd) && !isAfter(currentDate, recurrenceEnd)) {
    // Check if this date falls within our display range
    if (!isBefore(currentDate, startOfDay(rangeStart))) {
      // For weekly recurrence, check if it's on an allowed day
      if (recurrence.frequency === 'weekly' && recurrence.daysOfWeek) {
        if (isOnAllowedDay(currentDate, recurrence.daysOfWeek)) {
          instances.push(createInstance(appointment, currentDate, originalHour, originalMinutes));
        }
      } else {
        instances.push(createInstance(appointment, currentDate, originalHour, originalMinutes));
      }
    }

    // Move to next occurrence
    currentDate = getNextOccurrence(currentDate, recurrence.frequency);
  }

  return instances;
}

/**
 * Create an appointment instance from a recurring parent.
 *
 * @param parent - Parent recurring appointment
 * @param instanceDate - Date for this instance
 * @param hour - Hour from original appointment
 * @param minutes - Minutes from original appointment
 * @returns New appointment instance
 */
function createInstance(
  parent: Appointment,
  instanceDate: Date,
  hour: number,
  minutes: number
): Appointment {
  const dateWithTime = setMinutes(setHours(instanceDate, hour), minutes);

  return {
    ...parent,
    id: generateInstanceId(parent.id, instanceDate),
    date: dateWithTime.toISOString(),
    recurrenceParentId: parent.id,
    // Remove recurrence from instances to prevent infinite expansion
    recurrence: undefined,
  };
}

/**
 * Expand all recurring appointments in a list.
 *
 * Takes a list of appointments (some may have recurrence patterns) and
 * returns a new list with recurring appointments expanded into instances.
 *
 * @param appointments - List of appointments to process
 * @param rangeStart - Start of date range
 * @param rangeEnd - End of date range
 * @returns Expanded list of appointments
 */
export function expandRecurringAppointments(
  appointments: Appointment[],
  rangeStart: Date,
  rangeEnd: Date
): Appointment[] {
  const expanded: Appointment[] = [];

  for (const appointment of appointments) {
    if (appointment.recurrence) {
      // Expand recurring appointment
      expanded.push(...expandRecurringAppointment(appointment, rangeStart, rangeEnd));
    } else if (!appointment.recurrenceParentId) {
      // Include non-recurring appointments that fall in range
      const appointmentDate = parseISO(appointment.date);
      if (
        !isBefore(appointmentDate, startOfDay(rangeStart)) &&
        !isAfter(appointmentDate, rangeEnd)
      ) {
        expanded.push(appointment);
      }
    }
    // Skip appointments with recurrenceParentId (they are already expanded instances)
  }

  return expanded;
}

/**
 * Check if an appointment is a recurring instance (not the parent).
 *
 * @param appointment - Appointment to check
 * @returns True if this is an expanded instance
 */
export function isRecurringInstance(appointment: Appointment): boolean {
  return !!appointment.recurrenceParentId;
}

/**
 * Check if an appointment is a recurring parent (has recurrence pattern).
 *
 * @param appointment - Appointment to check
 * @returns True if this is a recurring parent
 */
export function isRecurringParent(appointment: Appointment): boolean {
  return !!appointment.recurrence;
}

/**
 * Get the parent ID of a recurring instance.
 *
 * @param appointment - Appointment instance
 * @returns Parent ID or the appointment's own ID if not an instance
 */
export function getParentId(appointment: Appointment): string {
  return appointment.recurrenceParentId || appointment.id;
}
