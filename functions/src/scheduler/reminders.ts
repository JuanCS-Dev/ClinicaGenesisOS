/**
 * Appointment Reminder Scheduler
 *
 * Runs periodically to send appointment reminders.
 * - 24h reminder: Sends template message
 * - 2h reminder: Sends free text if within window, template otherwise
 */

import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { sendReminder24h, sendReminder2h, type AppointmentData } from '../whatsapp/templates.js';

/**
 * Send 24h appointment reminders.
 * Runs every hour, checks for appointments in the next 24-25 hours.
 */
export const sendReminders24h = onSchedule(
  {
    schedule: 'every 1 hours',
    region: 'southamerica-east1',
    timeZone: 'America/Sao_Paulo',
  },
  async () => {
    const db = getFirestore();
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    logger.info('Starting 24h reminder check', {
      windowStart: in24h.toISOString(),
      windowEnd: in25h.toISOString(),
    });

    // Find appointments that need 24h reminder
    const appointmentsSnapshot = await db
      .collectionGroup('appointments')
      .where('date', '>=', in24h.toISOString())
      .where('date', '<=', in25h.toISOString())
      .where('status', 'in', ['Pendente', 'Confirmado'])
      .get();

    logger.info(`Found ${appointmentsSnapshot.size} appointments for 24h reminder`);

    let sent = 0;
    let skipped = 0;
    let errors = 0;

    for (const doc of appointmentsSnapshot.docs) {
      const appointment = doc.data();
      const appointmentRef = doc.ref;

      // Skip if already sent
      if (appointment.reminder?.reminder24h?.status === 'sent' ||
          appointment.reminder?.reminder24h?.status === 'delivered') {
        skipped++;
        continue;
      }

      // Skip if no phone
      if (!appointment.patientPhone) {
        logger.warn('No phone for appointment', { appointmentId: doc.id });
        skipped++;
        continue;
      }

      try {
        // Get clinic info for the message
        const clinicDoc = await appointmentRef.parent.parent?.get();
        const clinic = clinicDoc?.data();

        const appointmentData: AppointmentData = {
          patientName: appointment.patientName || 'Paciente',
          patientPhone: appointment.patientPhone,
          date: formatDate(appointment.date),
          time: formatTime(appointment.date),
          professionalName: appointment.professional || 'Profissional',
          clinicName: clinic?.name || 'Clínica',
          clinicAddress: clinic?.address,
        };

        // Send reminder
        const messageId = await sendReminder24h(
          appointmentData,
          clinicDoc?.id
        );

        // Update appointment with reminder info
        await appointmentRef.update({
          'reminder.reminder24h': {
            status: 'sent',
            sentAt: new Date().toISOString(),
            messageId,
          },
        });

        sent++;
        logger.info('24h reminder sent', {
          appointmentId: doc.id,
          messageId,
        });
      } catch (error) {
        errors++;
        logger.error('Failed to send 24h reminder', {
          appointmentId: doc.id,
          error,
        });

        // Mark as failed
        await appointmentRef.update({
          'reminder.reminder24h': {
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            attemptedAt: new Date().toISOString(),
          },
        });
      }
    }

    logger.info('24h reminder batch complete', { sent, skipped, errors });
  }
);

/**
 * Send 2h appointment reminders.
 * Runs every 30 minutes, checks for appointments in the next 2-2.5 hours.
 */
export const sendReminders2h = onSchedule(
  {
    schedule: 'every 30 minutes',
    region: 'southamerica-east1',
    timeZone: 'America/Sao_Paulo',
  },
  async () => {
    const db = getFirestore();
    const now = new Date();
    const in2h = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const in2h30 = new Date(now.getTime() + 2.5 * 60 * 60 * 1000);

    logger.info('Starting 2h reminder check', {
      windowStart: in2h.toISOString(),
      windowEnd: in2h30.toISOString(),
    });

    // Find appointments that need 2h reminder
    const appointmentsSnapshot = await db
      .collectionGroup('appointments')
      .where('date', '>=', in2h.toISOString())
      .where('date', '<=', in2h30.toISOString())
      .where('status', 'in', ['Pendente', 'Confirmado'])
      .get();

    logger.info(`Found ${appointmentsSnapshot.size} appointments for 2h reminder`);

    let sent = 0;
    let skipped = 0;
    let errors = 0;

    for (const doc of appointmentsSnapshot.docs) {
      const appointment = doc.data();
      const appointmentRef = doc.ref;

      // Skip if already sent
      if (appointment.reminder?.reminder2h?.status === 'sent' ||
          appointment.reminder?.reminder2h?.status === 'delivered') {
        skipped++;
        continue;
      }

      // Skip if no phone
      if (!appointment.patientPhone) {
        skipped++;
        continue;
      }

      try {
        // Get clinic info
        const clinicDoc = await appointmentRef.parent.parent?.get();
        const clinic = clinicDoc?.data();

        const appointmentData: AppointmentData = {
          patientName: appointment.patientName || 'Paciente',
          patientPhone: appointment.patientPhone,
          date: formatDate(appointment.date),
          time: formatTime(appointment.date),
          professionalName: appointment.professional || 'Profissional',
          clinicName: clinic?.name || 'Clínica',
          clinicAddress: clinic?.address,
        };

        // Check if within 24h window (patient interacted recently)
        const lastInteraction = appointment.reminder?.lastInteraction;
        const isWithinWindow = lastInteraction &&
          (now.getTime() - toDate(lastInteraction).getTime()) < 24 * 60 * 60 * 1000;

        // Send reminder (free text if within window, template otherwise)
        const messageId = await sendReminder2h(
          appointmentData,
          !isWithinWindow, // useTemplate = true if NOT within window
          clinicDoc?.id
        );

        // Update appointment
        await appointmentRef.update({
          'reminder.reminder2h': {
            status: 'sent',
            sentAt: new Date().toISOString(),
            messageId,
            usedTemplate: !isWithinWindow,
          },
        });

        sent++;
        logger.info('2h reminder sent', {
          appointmentId: doc.id,
          messageId,
          usedFreeMessage: isWithinWindow,
        });
      } catch (error) {
        errors++;
        logger.error('Failed to send 2h reminder', {
          appointmentId: doc.id,
          error,
        });

        await appointmentRef.update({
          'reminder.reminder2h': {
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            attemptedAt: new Date().toISOString(),
          },
        });
      }
    }

    logger.info('2h reminder batch complete', { sent, skipped, errors });
  }
);

/**
 * Format date for display (DD/MM/YYYY).
 */
function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Format time for display (HH:mm).
 */
function formatTime(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Convert Firestore Timestamp or ISO string to Date.
 */
function toDate(value: Timestamp | string | Date): Date {
  if (value instanceof Timestamp) {
    return value.toDate();
  }
  if (value instanceof Date) {
    return value;
  }
  return new Date(value);
}
