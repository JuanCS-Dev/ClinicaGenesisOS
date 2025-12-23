/**
 * TISS Glosa Triggers
 *
 * Firestore triggers for glosa (billing denial) events.
 * Sends notifications when glosas are created or when deadlines approach.
 *
 * @module functions/tiss/glosa-triggers
 */

import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';

// =============================================================================
// TYPES
// =============================================================================

interface GlosaNotification {
  type: 'glosa_criada' | 'prazo_recurso' | 'recurso_resposta';
  clinicId: string;
  glosaId: string;
  numeroGuia: string;
  valorGlosado: number;
  prazoRecurso?: string;
  diasRestantes?: number;
}

// =============================================================================
// NOTIFICATION HELPERS
// =============================================================================

/**
 * Create in-app notification for glosa event.
 */
async function createInAppNotification(
  clinicId: string,
  notification: GlosaNotification
): Promise<void> {
  const db = getFirestore();
  const notificationsRef = db.collection('clinics').doc(clinicId).collection('notifications');

  const titles: Record<GlosaNotification['type'], string> = {
    glosa_criada: 'Nova glosa recebida',
    prazo_recurso: 'Prazo de recurso se aproxima',
    recurso_resposta: 'Resposta ao recurso de glosa',
  };

  const messages: Record<GlosaNotification['type'], string> = {
    glosa_criada: `Guia ${notification.numeroGuia} foi glosada. Valor: R$ ${notification.valorGlosado.toFixed(2)}`,
    prazo_recurso: `Restam ${notification.diasRestantes} dias para recursar a glosa da guia ${notification.numeroGuia}`,
    recurso_resposta: `A operadora respondeu ao recurso da guia ${notification.numeroGuia}`,
  };

  await notificationsRef.add({
    type: notification.type,
    title: titles[notification.type],
    message: messages[notification.type],
    glosaId: notification.glosaId,
    numeroGuia: notification.numeroGuia,
    valorGlosado: notification.valorGlosado,
    read: false,
    createdAt: new Date().toISOString(),
  });
}

/**
 * Update clinic billing metrics.
 */
async function updateBillingMetrics(
  clinicId: string,
  valorGlosado: number
): Promise<void> {
  const db = getFirestore();
  const metricsRef = db
    .collection('clinics')
    .doc(clinicId)
    .collection('metrics')
    .doc('billing');

  await metricsRef.set(
    {
      totalGlosas: FieldValue.increment(1),
      valorTotalGlosado: FieldValue.increment(valorGlosado),
      lastGlosaAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

// =============================================================================
// TRIGGERS
// =============================================================================

/**
 * Trigger when a new glosa is created.
 * Sends notifications and updates metrics.
 */
export const onGlosaCreated = onDocumentCreated(
  {
    document: 'clinics/{clinicId}/glosas/{glosaId}',
    region: 'southamerica-east1',
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      logger.warn('No data in glosa create event');
      return;
    }

    const glosa = snapshot.data();
    const clinicId = event.params.clinicId;
    const glosaId = event.params.glosaId;

    logger.info('New glosa created', {
      clinicId,
      glosaId,
      numeroGuia: glosa.numeroGuiaPrestador,
      valorGlosado: glosa.valorGlosado,
    });

    try {
      // Create in-app notification
      await createInAppNotification(clinicId, {
        type: 'glosa_criada',
        clinicId,
        glosaId,
        numeroGuia: glosa.numeroGuiaPrestador,
        valorGlosado: glosa.valorGlosado,
        prazoRecurso: glosa.prazoRecurso,
      });

      // Update billing metrics
      await updateBillingMetrics(clinicId, glosa.valorGlosado);

      logger.info('Glosa notification sent', { clinicId, glosaId });
    } catch (error) {
      logger.error('Failed to process glosa creation', {
        clinicId,
        glosaId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * Scheduled job to check for approaching glosa appeal deadlines.
 * Runs daily at 9:00 AM Brazil time.
 */
export const checkGlosaDeadlines = onSchedule(
  {
    schedule: '0 9 * * *', // Every day at 9:00 AM
    timeZone: 'America/Sao_Paulo',
    region: 'southamerica-east1',
  },
  async () => {
    logger.info('Running glosa deadline check');

    const db = getFirestore();

    // Calculate dates for 7 days and 3 days from now
    const today = new Date();
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);

    // Get all clinics
    const clinicsSnapshot = await db.collection('clinics').get();

    for (const clinicDoc of clinicsSnapshot.docs) {
      const clinicId = clinicDoc.id;
      const glosasRef = db.collection('clinics').doc(clinicId).collection('glosas');

      // Find glosas with approaching deadlines (pending status only)
      const approachingDeadlines = await glosasRef
        .where('status', '==', 'pendente')
        .where('prazoRecurso', '<=', sevenDaysFromNow.toISOString().split('T')[0])
        .where('prazoRecurso', '>=', today.toISOString().split('T')[0])
        .get();

      for (const glosaDoc of approachingDeadlines.docs) {
        const glosa = glosaDoc.data();
        const prazoDate = new Date(glosa.prazoRecurso);
        const diasRestantes = Math.ceil(
          (prazoDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Only notify at 7 days and 3 days
        if (diasRestantes === 7 || diasRestantes === 3 || diasRestantes === 1) {
          // Check if we already notified today
          const notificationsRef = db
            .collection('clinics')
            .doc(clinicId)
            .collection('notifications');

          const existingNotification = await notificationsRef
            .where('type', '==', 'prazo_recurso')
            .where('glosaId', '==', glosaDoc.id)
            .where('createdAt', '>=', today.toISOString().split('T')[0])
            .limit(1)
            .get();

          if (existingNotification.empty) {
            await createInAppNotification(clinicId, {
              type: 'prazo_recurso',
              clinicId,
              glosaId: glosaDoc.id,
              numeroGuia: glosa.numeroGuiaPrestador,
              valorGlosado: glosa.valorGlosado,
              prazoRecurso: glosa.prazoRecurso,
              diasRestantes,
            });

            logger.info('Deadline notification sent', {
              clinicId,
              glosaId: glosaDoc.id,
              diasRestantes,
            });
          }
        }
      }
    }

    logger.info('Glosa deadline check completed');
  }
);

/**
 * Get glosa statistics for a clinic.
 * Callable function for dashboard data.
 */
export const getGlosaStats = async (
  clinicId: string,
  period: 'month' | 'quarter' | 'year' = 'month'
): Promise<{
  totalGlosas: number;
  valorTotalGlosado: number;
  valorRecuperado: number;
  taxaRecuperacao: number;
  glosasPerStatus: Record<string, number>;
  principaisMotivos: Array<{ motivo: string; quantidade: number; valor: number }>;
}> => {
  const db = getFirestore();
  const glosasRef = db.collection('clinics').doc(clinicId).collection('glosas');

  // Calculate period start date
  const now = new Date();
  const startDate = new Date();
  switch (period) {
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      startDate.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
  }

  const glosasSnapshot = await glosasRef
    .where('createdAt', '>=', startDate.toISOString())
    .get();

  let totalGlosas = 0;
  let valorTotalGlosado = 0;
  let valorRecuperado = 0;
  const glosasPerStatus: Record<string, number> = {};
  const motivoMap = new Map<string, { quantidade: number; valor: number }>();

  glosasSnapshot.docs.forEach((doc) => {
    const glosa = doc.data();
    totalGlosas++;
    valorTotalGlosado += glosa.valorGlosado || 0;

    // Count by status
    const status = glosa.status || 'pendente';
    glosasPerStatus[status] = (glosasPerStatus[status] || 0) + 1;

    // Calculate recovered value
    if (glosa.status === 'resolvida') {
      valorRecuperado += glosa.valorAprovado || 0;
    }

    // Count motivos
    if (glosa.itensGlosados && Array.isArray(glosa.itensGlosados)) {
      glosa.itensGlosados.forEach((item: { codigoGlosa: string; valorGlosado: number }) => {
        const existing = motivoMap.get(item.codigoGlosa) || { quantidade: 0, valor: 0 };
        existing.quantidade++;
        existing.valor += item.valorGlosado || 0;
        motivoMap.set(item.codigoGlosa, existing);
      });
    }
  });

  const principaisMotivos = Array.from(motivoMap.entries())
    .map(([motivo, stats]) => ({ motivo, ...stats }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 10);

  return {
    totalGlosas,
    valorTotalGlosado,
    valorRecuperado,
    taxaRecuperacao: valorTotalGlosado > 0 ? (valorRecuperado / valorTotalGlosado) * 100 : 0,
    glosasPerStatus,
    principaisMotivos,
  };
};
