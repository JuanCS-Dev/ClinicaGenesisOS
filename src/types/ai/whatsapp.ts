/**
 * WhatsApp Integration Types
 *
 * Types for WhatsApp reminders and configuration.
 */

import type { ReminderStatus } from '../appointment/status';

/**
 * WhatsApp integration config per clinic.
 * Stored in /clinics/{clinicId}/settings/integrations
 */
export interface WhatsAppConfig {
  enabled: boolean;
  phoneNumberId: string;
  accessToken: string; // Encrypted in Firestore
  businessAccountId: string;
  verifyToken: string; // For webhook verification
}

/**
 * WhatsApp reminder tracking for appointments.
 */
export interface AppointmentReminder {
  appointmentId: string;
  patientPhone: string;
  reminder24h: {
    status: ReminderStatus;
    sentAt?: string;
    messageId?: string;
  };
  reminder2h: {
    status: ReminderStatus;
    sentAt?: string;
    messageId?: string;
  };
  patientResponse?: {
    confirmed: boolean;
    respondedAt: string;
    message?: string;
  };
}
