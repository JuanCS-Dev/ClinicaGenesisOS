/**
 * Labs Integration Webhook
 *
 * Receives lab results from external laboratories.
 * Notifies patients and doctors when results are ready.
 *
 * @module functions/workflows/labs-webhook
 */

import { onRequest } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { createHmac } from 'crypto';
import { sendTextMessage } from '../whatsapp/client.js';
import type {
  ClinicWorkflowSettings,
  LabResultWebhookPayload,
  LabResult,
  WorkflowExecutionLog,
} from './types.js';
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
 * Verify webhook signature using HMAC.
 */
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = createHmac('sha256', secret).update(payload).digest('hex');
  return signature === `sha256=${expectedSignature}`;
}

/**
 * Find patient by identifier (CPF or internal ID).
 */
async function findPatient(
  clinicId: string,
  identifier: string
): Promise<{ id: string; name: string; phone?: string; email?: string } | null> {
  const db = getFirestore();

  // Try to find by CPF
  const patientSnapshot = await db
    .collection('clinics')
    .doc(clinicId)
    .collection('patients')
    .where('cpf', '==', identifier.replace(/\D/g, ''))
    .limit(1)
    .get();

  // If not found, try by internal ID
  if (patientSnapshot.empty) {
    const patientDoc = await db
      .collection('clinics')
      .doc(clinicId)
      .collection('patients')
      .doc(identifier)
      .get();

    if (patientDoc.exists) {
      const data = patientDoc.data()!;
      return {
        id: patientDoc.id,
        name: data.name,
        phone: data.phone,
        email: data.email,
      };
    }
    return null;
  }

  const patientDoc = patientSnapshot.docs[0];
  const data = patientDoc.data();
  return {
    id: patientDoc.id,
    name: data.name,
    phone: data.phone,
    email: data.email,
  };
}

/**
 * Find the doctor who ordered the exam.
 */
async function findOrderingDoctor(
  clinicId: string,
  patientId: string,
  examType: string
): Promise<{ id: string; name: string; phone?: string } | null> {
  const db = getFirestore();

  // Find recent appointment with this exam ordered
  const appointmentsSnapshot = await db
    .collection('clinics')
    .doc(clinicId)
    .collection('appointments')
    .where('patientId', '==', patientId)
    .where('status', '==', 'Finalizado')
    .orderBy('date', 'desc')
    .limit(5)
    .get();

  for (const appointmentDoc of appointmentsSnapshot.docs) {
    const appointment = appointmentDoc.data();

    // Check if this appointment ordered the exam
    const examsOrdered = appointment.examsOrdered || [];
    if (examsOrdered.some((exam: string) => exam.toLowerCase().includes(examType.toLowerCase()))) {
      // Get professional info
      const professionalId = appointment.professionalId;
      if (professionalId) {
        const professionalDoc = await db
          .collection('clinics')
          .doc(clinicId)
          .collection('professionals')
          .doc(professionalId)
          .get();

        if (professionalDoc.exists) {
          const data = professionalDoc.data()!;
          return {
            id: professionalDoc.id,
            name: data.name,
            phone: data.phone,
          };
        }
      }
    }
  }

  return null;
}

// =============================================================================
// NOTIFICATION MESSAGES
// =============================================================================

const PATIENT_MESSAGES = {
  normal: (patientName: string, examType: string, clinicName: string) =>
    `Ola ${patientName}! O resultado do seu exame de ${examType} ja esta disponivel. ` +
    `Acesse o portal do paciente ou entre em contato com ${clinicName} para mais informacoes.`,

  critical: (patientName: string, examType: string, clinicName: string) =>
    `Ola ${patientName}! O resultado do seu exame de ${examType} esta disponivel ` +
    `e requer atencao. Por favor, entre em contato com ${clinicName} o mais breve possivel.`,
};

const DOCTOR_MESSAGE = (
  patientName: string,
  examType: string,
  hasCriticalValues: boolean
) =>
  `Resultado disponivel: ${examType} de ${patientName}` +
  (hasCriticalValues ? ' [VALORES CRITICOS]' : '');

// =============================================================================
// MAIN WEBHOOK
// =============================================================================

/**
 * Webhook to receive lab results from external laboratories.
 *
 * Headers:
 * - X-Clinic-Id: The clinic ID this result belongs to
 * - X-Signature: HMAC signature for verification
 */
export const labsResultWebhook = onRequest(
  { cors: true, region: 'southamerica-east1' },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method not allowed');
      return;
    }

    const clinicId = req.headers['x-clinic-id'] as string;
    const signature = req.headers['x-signature'] as string;

    if (!clinicId) {
      res.status(400).send('Missing X-Clinic-Id header');
      return;
    }

    try {
      const db = getFirestore();
      const now = new Date().toISOString();

      // Get clinic settings
      const settings = await getWorkflowSettings(clinicId);

      if (!settings.labsIntegration.enabled) {
        res.status(403).send('Labs integration not enabled for this clinic');
        return;
      }

      // Verify signature if webhook secret is configured
      if (settings.labsIntegration.webhookSecret && signature) {
        const isValid = verifySignature(
          JSON.stringify(req.body),
          signature,
          settings.labsIntegration.webhookSecret
        );

        if (!isValid) {
          logger.warn('Invalid webhook signature', { clinicId });
          res.status(401).send('Invalid signature');
          return;
        }
      }

      const payload = req.body as LabResultWebhookPayload;

      // Validate required fields
      if (!payload.patientIdentifier || !payload.examType || !payload.orderId) {
        res.status(400).send('Missing required fields');
        return;
      }

      // Find patient
      const patient = await findPatient(clinicId, payload.patientIdentifier);
      if (!patient) {
        logger.warn('Patient not found', {
          clinicId,
          patientIdentifier: payload.patientIdentifier,
        });
        res.status(404).send('Patient not found');
        return;
      }

      // Get clinic info
      const clinicDoc = await db.collection('clinics').doc(clinicId).get();
      const clinic = clinicDoc.data();

      // Save lab result
      const labResult: LabResult = {
        clinicId,
        patientId: patient.id,
        patientName: patient.name,
        orderId: payload.orderId,
        examType: payload.examType,
        laboratoryName: payload.laboratoryName || 'Laboratorio Externo',
        resultDate: payload.resultDate || now,
        hasCriticalValues: payload.hasCriticalValues || false,
        resultUrl: payload.resultUrl,
        resultData: payload.resultData,
        notifiedPatient: false,
        notifiedDoctor: false,
        createdAt: now,
      };

      const labResultRef = await db
        .collection('clinics')
        .doc(clinicId)
        .collection('labResults')
        .add(labResult);

      logger.info('Lab result saved', {
        clinicId,
        labResultId: labResultRef.id,
        examType: payload.examType,
        hasCriticalValues: payload.hasCriticalValues,
      });

      // Notify patient if enabled and has phone
      if (settings.labsIntegration.notifyPatient && patient.phone) {
        try {
          const message = payload.hasCriticalValues
            ? PATIENT_MESSAGES.critical(patient.name, payload.examType, clinic?.name || 'Clinica')
            : PATIENT_MESSAGES.normal(patient.name, payload.examType, clinic?.name || 'Clinica');

          const messageId = await sendTextMessage(patient.phone, message, clinicId);

          await labResultRef.update({ notifiedPatient: true });

          await logWorkflowExecution({
            clinicId,
            workflowType: 'lab_result',
            targetId: labResultRef.id,
            status: 'sent',
            channel: 'whatsapp',
            messageId,
            createdAt: now,
          });

          logger.info('Patient notified of lab result', {
            clinicId,
            patientId: patient.id,
            messageId,
          });
        } catch (error) {
          logger.error('Failed to notify patient', {
            clinicId,
            patientId: patient.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      // Notify doctor if enabled and critical values
      if (settings.labsIntegration.notifyDoctor && payload.hasCriticalValues) {
        const doctor = await findOrderingDoctor(clinicId, patient.id, payload.examType);

        if (doctor?.phone) {
          try {
            const message = DOCTOR_MESSAGE(
              patient.name,
              payload.examType,
              payload.hasCriticalValues
            );

            await sendTextMessage(doctor.phone, message, clinicId);
            await labResultRef.update({ notifiedDoctor: true });

            logger.info('Doctor notified of critical lab result', {
              clinicId,
              doctorId: doctor.id,
            });
          } catch (error) {
            logger.error('Failed to notify doctor', {
              clinicId,
              doctorId: doctor.id,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        }

        // Also create in-app notification for critical values
        await db.collection('clinics').doc(clinicId).collection('notifications').add({
          type: 'lab_result_critical',
          title: 'Resultado com Valores Criticos',
          message: `Exame ${payload.examType} de ${patient.name} apresenta valores criticos`,
          patientId: patient.id,
          labResultId: labResultRef.id,
          priority: 'high',
          read: false,
          createdAt: now,
        });
      }

      res.status(200).json({
        success: true,
        labResultId: labResultRef.id,
        notifiedPatient: labResult.notifiedPatient,
        notifiedDoctor: labResult.notifiedDoctor,
      });
    } catch (error) {
      logger.error('Labs webhook error', error);
      res.status(500).send('Error processing lab result');
    }
  }
);

// =============================================================================
// STATISTICS
// =============================================================================

/**
 * Get lab results statistics for a clinic.
 */
export async function getLabResultsStats(
  clinicId: string,
  periodDays: number = 30
): Promise<{
  totalResults: number;
  criticalResults: number;
  notificationsSent: number;
  resultsByLab: Record<string, number>;
  resultsByExamType: Record<string, number>;
}> {
  const db = getFirestore();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - periodDays);

  const resultsSnapshot = await db
    .collection('clinics')
    .doc(clinicId)
    .collection('labResults')
    .where('createdAt', '>=', startDate.toISOString())
    .get();

  let totalResults = 0;
  let criticalResults = 0;
  let notificationsSent = 0;
  const resultsByLab: Record<string, number> = {};
  const resultsByExamType: Record<string, number> = {};

  resultsSnapshot.docs.forEach((doc) => {
    const result = doc.data() as LabResult;
    totalResults++;

    if (result.hasCriticalValues) criticalResults++;
    if (result.notifiedPatient) notificationsSent++;

    resultsByLab[result.laboratoryName] = (resultsByLab[result.laboratoryName] || 0) + 1;
    resultsByExamType[result.examType] = (resultsByExamType[result.examType] || 0) + 1;
  });

  return {
    totalResults,
    criticalResults,
    notificationsSent,
    resultsByLab,
    resultsByExamType,
  };
}
