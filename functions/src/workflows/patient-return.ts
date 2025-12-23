/**
 * Patient Return Reminder Workflow
 *
 * Sends reminders to patients who haven't visited in a long time.
 * Useful for chronic condition follow-ups and preventive care.
 *
 * @module functions/workflows/patient-return
 */

import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { sendTemplateMessage } from '../whatsapp/client.js';
import type { ClinicWorkflowSettings, PatientForReturn, WorkflowExecutionLog } from './types.js';
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
  await db.collection('clinics').doc(log.clinicId).collection('workflowLogs').add(log);
}

/**
 * Calculate days since last visit.
 */
function daysSince(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Check if reminder was sent recently.
 */
async function wasReminderSentRecently(
  clinicId: string,
  patientId: string,
  frequencyDays: number
): Promise<boolean> {
  const db = getFirestore();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - frequencyDays);

  const logsSnapshot = await db
    .collection('clinics')
    .doc(clinicId)
    .collection('workflowLogs')
    .where('workflowType', '==', 'patient_return')
    .where('targetId', '==', patientId)
    .where('status', 'in', ['sent', 'delivered'])
    .where('createdAt', '>=', cutoffDate.toISOString())
    .limit(1)
    .get();

  return !logsSnapshot.empty;
}

// =============================================================================
// FIND INACTIVE PATIENTS
// =============================================================================

/**
 * Find patients who haven't visited in a while.
 */
async function findInactivePatients(
  clinicId: string,
  inactiveDays: number
): Promise<PatientForReturn[]> {
  const db = getFirestore();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - inactiveDays);

  // Get all patients
  const patientsSnapshot = await db
    .collection('clinics')
    .doc(clinicId)
    .collection('patients')
    .where('active', '==', true)
    .get();

  const inactivePatients: PatientForReturn[] = [];

  for (const patientDoc of patientsSnapshot.docs) {
    const patient = patientDoc.data();

    // Skip if no phone
    if (!patient.phone) continue;

    // Find last appointment
    const lastAppointment = await db
      .collection('clinics')
      .doc(clinicId)
      .collection('appointments')
      .where('patientId', '==', patientDoc.id)
      .where('status', '==', 'Finalizado')
      .orderBy('date', 'desc')
      .limit(1)
      .get();

    if (lastAppointment.empty) continue;

    const lastVisit = lastAppointment.docs[0].data().date;
    const daysSinceLastVisit = daysSince(lastVisit);

    if (daysSinceLastVisit >= inactiveDays) {
      inactivePatients.push({
        id: patientDoc.id,
        clinicId,
        name: patient.name || 'Paciente',
        phone: patient.phone,
        email: patient.email,
        lastVisit,
        daysSinceLastVisit,
        conditions: patient.chronicConditions || [],
      });
    }
  }

  return inactivePatients;
}

// =============================================================================
// MESSAGE TEMPLATES
// =============================================================================

interface ReturnReminderParams {
  patientName: string;
  clinicName: string;
  daysSinceLastVisit: number;
  hasChronicCondition: boolean;
}

function buildReturnMessage(params: ReturnReminderParams): string {
  const { patientName, clinicName, daysSinceLastVisit, hasChronicCondition } = params;

  if (hasChronicCondition) {
    return (
      `Ola ${patientName}! Notamos que faz ${daysSinceLastVisit} dias desde sua ultima consulta. ` +
      `Para o acompanhamento adequado da sua saude, recomendamos agendar um retorno. ` +
      `Entre em contato conosco! ${clinicName}`
    );
  }

  if (daysSinceLastVisit > 180) {
    return (
      `Ola ${patientName}! Ja faz mais de 6 meses desde sua ultima visita a ${clinicName}. ` +
      `Que tal agendar um check-up? Cuidar da saude e sempre importante!`
    );
  }

  return (
    `Ola ${patientName}! Faz algum tempo que nao nos vemos na ${clinicName}. ` +
    `Se precisar de algum atendimento, estamos a disposicao!`
  );
}

// =============================================================================
// MAIN SCHEDULER
// =============================================================================

/**
 * Send return reminders to inactive patients.
 * Runs daily at 10:00 AM.
 */
export const sendPatientReturnReminders = onSchedule(
  {
    schedule: '0 10 * * *', // Every day at 10:00 AM
    region: 'southamerica-east1',
    timeZone: 'America/Sao_Paulo',
  },
  async () => {
    const db = getFirestore();
    const now = new Date();

    logger.info('Starting patient return reminder check');

    const clinicsSnapshot = await db.collection('clinics').get();

    let totalSent = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    for (const clinicDoc of clinicsSnapshot.docs) {
      const clinicId = clinicDoc.id;
      const clinic = clinicDoc.data();

      // Check if patient return reminders are enabled
      const settings = await getWorkflowSettings(clinicId);
      if (!settings.patientReturn.enabled) {
        continue;
      }

      const { inactiveDays, reminderFrequencyDays } = settings.patientReturn;

      // Find inactive patients
      const inactivePatients = await findInactivePatients(clinicId, inactiveDays);

      logger.info(`Found ${inactivePatients.length} inactive patients`, { clinicId });

      // Limit to 50 per clinic per day to avoid spam
      const patientsToContact = inactivePatients.slice(0, 50);

      for (const patient of patientsToContact) {
        // Check if reminder was sent recently
        const recentlySent = await wasReminderSentRecently(
          clinicId,
          patient.id,
          reminderFrequencyDays
        );

        if (recentlySent) {
          totalSkipped++;
          continue;
        }

        try {
          const message = buildReturnMessage({
            patientName: patient.name,
            clinicName: clinic.name || 'Clinica',
            daysSinceLastVisit: patient.daysSinceLastVisit,
            hasChronicCondition: (patient.conditions?.length || 0) > 0,
          });

          // Try to use template first, fall back to text if within 24h window
          let messageId: string;
          try {
            messageId = await sendTemplateMessage(
              patient.phone!,
              'retorno_lembrete',
              'pt_BR',
              [{
                type: 'body',
                parameters: [
                  { type: 'text', text: patient.name },
                  { type: 'text', text: clinic.name || 'Clinica' },
                ],
              }],
              clinicId
            );
          } catch {
            // Template might not exist, skip this patient
            logger.warn('Template not available, skipping patient', {
              clinicId,
              patientId: patient.id,
            });
            totalSkipped++;
            continue;
          }

          // Log success
          await logWorkflowExecution({
            clinicId,
            workflowType: 'patient_return',
            targetId: patient.id,
            status: 'sent',
            channel: 'whatsapp',
            messageId,
            createdAt: now.toISOString(),
          });

          // Update patient record
          await db
            .collection('clinics')
            .doc(clinicId)
            .collection('patients')
            .doc(patient.id)
            .update({
              'returnReminder.lastSent': now.toISOString(),
              'returnReminder.messageId': messageId,
            });

          totalSent++;
          logger.info('Return reminder sent', {
            clinicId,
            patientId: patient.id,
            daysSinceLastVisit: patient.daysSinceLastVisit,
          });
        } catch (error) {
          totalErrors++;
          logger.error('Failed to send return reminder', {
            clinicId,
            patientId: patient.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          });

          await logWorkflowExecution({
            clinicId,
            workflowType: 'patient_return',
            targetId: patient.id,
            status: 'failed',
            channel: 'whatsapp',
            error: error instanceof Error ? error.message : 'Unknown error',
            createdAt: now.toISOString(),
          });
        }
      }
    }

    logger.info('Patient return reminder batch complete', {
      sent: totalSent,
      skipped: totalSkipped,
      errors: totalErrors,
    });
  }
);

// =============================================================================
// STATISTICS
// =============================================================================

/**
 * Get patient return statistics for a clinic.
 */
export async function getPatientReturnStats(clinicId: string): Promise<{
  totalInactivePatients: number;
  totalRemindersSent: number;
  totalReturned: number;
  returnRate: number;
}> {
  const db = getFirestore();
  const settings = await getWorkflowSettings(clinicId);
  const inactiveDays = settings.patientReturn.inactiveDays || 90;

  // Count inactive patients
  const inactivePatients = await findInactivePatients(clinicId, inactiveDays);
  const totalInactivePatients = inactivePatients.length;

  // Count reminders sent (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const remindersSnapshot = await db
    .collection('clinics')
    .doc(clinicId)
    .collection('workflowLogs')
    .where('workflowType', '==', 'patient_return')
    .where('status', '==', 'sent')
    .where('createdAt', '>=', thirtyDaysAgo.toISOString())
    .get();

  const totalRemindersSent = remindersSnapshot.size;

  // Count patients who returned after reminder
  let totalReturned = 0;
  for (const logDoc of remindersSnapshot.docs) {
    const log = logDoc.data();
    const patientId = log.targetId;

    // Check if patient had appointment after reminder
    const appointmentAfter = await db
      .collection('clinics')
      .doc(clinicId)
      .collection('appointments')
      .where('patientId', '==', patientId)
      .where('date', '>=', log.createdAt)
      .where('status', '==', 'Finalizado')
      .limit(1)
      .get();

    if (!appointmentAfter.empty) {
      totalReturned++;
    }
  }

  const returnRate = totalRemindersSent > 0 ? (totalReturned / totalRemindersSent) * 100 : 0;

  return {
    totalInactivePatients,
    totalRemindersSent,
    totalReturned,
    returnRate,
  };
}
