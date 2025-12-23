/**
 * Follow-up Workflow
 *
 * Sends follow-up messages after appointments are completed.
 * Runs periodically to check for appointments completed 24h ago.
 *
 * @module functions/workflows/follow-up
 */

import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { sendTextMessage } from '../whatsapp/client.js';
import type { ClinicWorkflowSettings, WorkflowExecutionLog } from './types.js';
import { DEFAULT_WORKFLOW_SETTINGS } from './types.js';

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Get workflow settings for a clinic.
 */
async function getWorkflowSettings(clinicId: string): Promise<ClinicWorkflowSettings> {
  const db = getFirestore();
  const settingsDoc = await db
    .collection('clinics')
    .doc(clinicId)
    .collection('settings')
    .doc('workflows')
    .get();

  if (!settingsDoc.exists) {
    return DEFAULT_WORKFLOW_SETTINGS;
  }

  return { ...DEFAULT_WORKFLOW_SETTINGS, ...settingsDoc.data() } as ClinicWorkflowSettings;
}

/**
 * Log workflow execution.
 */
async function logWorkflowExecution(log: WorkflowExecutionLog): Promise<void> {
  const db = getFirestore();
  await db
    .collection('clinics')
    .doc(log.clinicId)
    .collection('workflowLogs')
    .add(log);
}

/**
 * Check if follow-up was already sent for this appointment.
 */
async function wasFollowUpSent(clinicId: string, appointmentId: string): Promise<boolean> {
  const db = getFirestore();
  const logsSnapshot = await db
    .collection('clinics')
    .doc(clinicId)
    .collection('workflowLogs')
    .where('workflowType', '==', 'follow_up')
    .where('targetId', '==', appointmentId)
    .where('status', 'in', ['sent', 'delivered'])
    .limit(1)
    .get();

  return !logsSnapshot.empty;
}

// =============================================================================
// FOLLOW-UP MESSAGE TEMPLATES
// =============================================================================

const FOLLOW_UP_MESSAGES = {
  default: (patientName: string, professionalName: string, clinicName: string) =>
    `Ola ${patientName}! Esperamos que esteja bem apos sua consulta com ${professionalName}. ` +
    `Se tiver alguma duvida sobre as orientacoes recebidas, estamos a disposicao. ` +
    `Atenciosamente, ${clinicName}.`,

  withPrescription: (patientName: string, _professionalName: string, clinicName: string) =>
    `Ola ${patientName}! Lembramos que e importante seguir as orientacoes da receita. ` +
    `Se tiver efeitos colaterais ou duvidas, entre em contato. ` +
    `${clinicName}`,

  returnReminder: (patientName: string, professionalName: string, _clinicName: string) =>
    `Ola ${patientName}! ${professionalName} solicitou um retorno. ` +
    `Entre em contato para agendar quando puder.`,
};

// =============================================================================
// MAIN SCHEDULER
// =============================================================================

/**
 * Send follow-up messages for completed appointments.
 * Runs every 2 hours to check for appointments completed ~24h ago.
 */
export const sendFollowUpMessages = onSchedule(
  {
    schedule: 'every 2 hours',
    region: 'southamerica-east1',
    timeZone: 'America/Sao_Paulo',
  },
  async () => {
    const db = getFirestore();
    const now = new Date();

    // Window: appointments completed 24-26 hours ago
    const windowStart = new Date(now.getTime() - 26 * 60 * 60 * 1000);
    const windowEnd = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    logger.info('Starting follow-up check', {
      windowStart: windowStart.toISOString(),
      windowEnd: windowEnd.toISOString(),
    });

    // Get all clinics with follow-up enabled
    const clinicsSnapshot = await db.collection('clinics').get();

    let totalSent = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    for (const clinicDoc of clinicsSnapshot.docs) {
      const clinicId = clinicDoc.id;
      const clinic = clinicDoc.data();

      // Check if follow-up is enabled
      const settings = await getWorkflowSettings(clinicId);
      if (!settings.followUp.enabled) {
        continue;
      }

      // Find completed appointments in the window
      const appointmentsSnapshot = await db
        .collection('clinics')
        .doc(clinicId)
        .collection('appointments')
        .where('status', '==', 'Finalizado')
        .where('completedAt', '>=', windowStart.toISOString())
        .where('completedAt', '<=', windowEnd.toISOString())
        .get();

      for (const appointmentDoc of appointmentsSnapshot.docs) {
        const appointment = appointmentDoc.data();
        const appointmentId = appointmentDoc.id;

        // Skip if no phone
        if (!appointment.patientPhone) {
          totalSkipped++;
          continue;
        }

        // Skip if already sent
        const alreadySent = await wasFollowUpSent(clinicId, appointmentId);
        if (alreadySent) {
          totalSkipped++;
          continue;
        }

        try {
          // Build message
          const message = FOLLOW_UP_MESSAGES.default(
            appointment.patientName || 'Paciente',
            appointment.professional || 'seu medico',
            clinic.name || 'Clinica'
          );

          // Send WhatsApp (using free-form since patient interacted recently)
          const messageId = await sendTextMessage(
            appointment.patientPhone,
            message,
            clinicId
          );

          // Log success
          await logWorkflowExecution({
            clinicId,
            workflowType: 'follow_up',
            targetId: appointmentId,
            status: 'sent',
            channel: 'whatsapp',
            messageId,
            createdAt: now.toISOString(),
          });

          // Update appointment
          await appointmentDoc.ref.update({
            'followUp.sent': true,
            'followUp.sentAt': now.toISOString(),
            'followUp.messageId': messageId,
          });

          totalSent++;
          logger.info('Follow-up sent', { clinicId, appointmentId, messageId });
        } catch (error) {
          totalErrors++;
          logger.error('Failed to send follow-up', {
            clinicId,
            appointmentId,
            error: error instanceof Error ? error.message : 'Unknown error',
          });

          // Log failure
          await logWorkflowExecution({
            clinicId,
            workflowType: 'follow_up',
            targetId: appointmentId,
            status: 'failed',
            channel: 'whatsapp',
            error: error instanceof Error ? error.message : 'Unknown error',
            createdAt: now.toISOString(),
          });
        }
      }
    }

    logger.info('Follow-up batch complete', {
      sent: totalSent,
      skipped: totalSkipped,
      errors: totalErrors,
    });
  }
);
