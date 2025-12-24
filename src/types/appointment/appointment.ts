/**
 * Appointment Types
 *
 * Core appointment entity and recurrence patterns.
 */

import type { Status, ReminderStatus } from './status';
import type { SpecialtyType } from '../records/base';

/** Recurrence frequency options. */
export type RecurrenceFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';

/** Recurrence pattern for appointments. */
export interface RecurrencePattern {
  /** Frequency of recurrence */
  frequency: RecurrenceFrequency;
  /** End date for recurrence (ISO date) - null means no end */
  endDate: string | null;
  /** Days of week for weekly recurrence (0=Sunday, 1=Monday, etc.) */
  daysOfWeek?: number[];
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string; // Denormalized for performance
  patientPhone?: string; // For WhatsApp reminders
  date: string; // ISO Date
  durationMin: number;
  procedure: string;
  status: Status;
  professional: string;
  specialty: SpecialtyType;
  notes?: string;
  /** Recurrence pattern (if recurring) */
  recurrence?: RecurrencePattern;
  /** Parent appointment ID (for expanded recurring instances) */
  recurrenceParentId?: string;
  /** WhatsApp reminder tracking */
  reminder?: {
    confirmation?: {
      status: ReminderStatus;
      sentAt?: string;
      messageId?: string;
    };
    reminder24h?: {
      status: ReminderStatus;
      sentAt?: string;
      messageId?: string;
    };
    reminder2h?: {
      status: ReminderStatus;
      sentAt?: string;
      messageId?: string;
      usedTemplate?: boolean;
    };
    lastInteraction?: string;
    patientResponse?: {
      confirmed?: boolean;
      respondedAt: string;
      message?: string;
      needsReschedule?: boolean;
    };
  };
}

/**
 * Input type for creating a new appointment (without auto-generated fields).
 */
export type CreateAppointmentInput = Omit<Appointment, 'id'>;
