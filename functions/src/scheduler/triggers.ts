/**
 * Firestore Triggers for Appointments
 *
 * Automatically sends confirmation when appointment is created.
 * Tracks changes for audit and reminders.
 */

import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { sendAppointmentConfirmation, type AppointmentData } from '../whatsapp/templates.js';
import { isFeatureEnabled } from '../utils/config.js';

/**
 * Send confirmation when new appointment is created.
 * Path: /clinics/{clinicId}/appointments/{appointmentId}
 */
export const onAppointmentCreated = onDocumentCreated(
  {
    document: 'clinics/{clinicId}/appointments/{appointmentId}',
    region: 'southamerica-east1',
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      logger.warn('No data in appointment create event');
      return;
    }

    const appointment = snapshot.data();
    const clinicId = event.params.clinicId;
    const appointmentId = event.params.appointmentId;

    logger.info('New appointment created', { clinicId, appointmentId });

    // Check if WhatsApp is enabled
    const whatsappEnabled = await isFeatureEnabled(clinicId, 'whatsapp');
    if (!whatsappEnabled) {
      logger.info('WhatsApp not enabled for clinic', { clinicId });
      return;
    }

    // Skip if no phone
    if (!appointment.patientPhone) {
      logger.info('No patient phone, skipping confirmation', { appointmentId });
      return;
    }

    try {
      // Get clinic info
      const db = getFirestore();
      const clinicDoc = await db.collection('clinics').doc(clinicId).get();
      const clinic = clinicDoc.data();

      const appointmentData: AppointmentData = {
        patientName: appointment.patientName || 'Paciente',
        patientPhone: appointment.patientPhone,
        date: formatDate(appointment.date),
        time: formatTime(appointment.date),
        professionalName: appointment.professional || 'Profissional',
        clinicName: clinic?.name || 'Clínica',
        clinicAddress: clinic?.address,
      };

      // Send confirmation
      const messageId = await sendAppointmentConfirmation(appointmentData, clinicId);

      // Update appointment with confirmation info
      await snapshot.ref.update({
        'reminder.confirmation': {
          status: 'sent',
          sentAt: new Date().toISOString(),
          messageId,
        },
      });

      logger.info('Appointment confirmation sent', { appointmentId, messageId });
    } catch (error) {
      logger.error('Failed to send appointment confirmation', {
        appointmentId,
        error,
      });

      // Mark as failed but don't block
      await snapshot.ref.update({
        'reminder.confirmation': {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          attemptedAt: new Date().toISOString(),
        },
      });
    }
  }
);

/**
 * Track appointment status changes for metrics.
 */
export const onAppointmentUpdated = onDocumentUpdated(
  {
    document: 'clinics/{clinicId}/appointments/{appointmentId}',
    region: 'southamerica-east1',
  },
  async (event) => {
    const before = event.data?.before?.data();
    const after = event.data?.after?.data();

    if (!before || !after) return;

    const clinicId = event.params.clinicId;
    const appointmentId = event.params.appointmentId;

    // Track status changes
    if (before.status !== after.status) {
      logger.info('Appointment status changed', {
        clinicId,
        appointmentId,
        from: before.status,
        to: after.status,
      });

      // If confirmed via WhatsApp, track as successful reminder
      if (after.status === 'Confirmado' && after.reminder?.patientResponse?.confirmed) {
        const db = getFirestore();
        const metricsRef = db
          .collection('clinics')
          .doc(clinicId)
          .collection('metrics')
          .doc('whatsapp');

        await metricsRef.set(
          {
            totalConfirmed: FieldValue.increment(1),
            lastConfirmedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }

      // If canceled or no-show, track for metrics
      if (after.status === 'Cancelado' || after.status === 'NoShow') {
        const db = getFirestore();
        const metricsRef = db
          .collection('clinics')
          .doc(clinicId)
          .collection('metrics')
          .doc('whatsapp');

        const field = after.status === 'Cancelado' ? 'totalCanceled' : 'totalNoShow';
        await metricsRef.set(
          {
            [field]: FieldValue.increment(1),
          },
          { merge: true }
        );
      }
    }
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
