/**
 * Lote Management Module
 *
 * Handles creation, validation, and management of TISS guide batches (lotes).
 * A lote groups multiple guides for bulk submission to health insurance operators.
 *
 * @module functions/tiss/lote
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import type {
  CreateLoteRequest,
  CreateLoteResponse,
  LoteDocument,
  LoteStatus,
  LoteError,
} from './types';

// =============================================================================
// CONSTANTS
// =============================================================================

const LOTES_COLLECTION = 'lotes';
const GUIAS_COLLECTION = 'guias';

/** Maximum guides per lote (TISS limit) */
const MAX_GUIAS_PER_LOTE = 100;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Generate a unique lote number.
 * Format: YYYYMMDD-NNNN (date + sequence)
 */
async function generateLoteNumber(
  db: admin.firestore.Firestore,
  clinicId: string
): Promise<string> {
  const today = new Date();
  const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, '');

  // Get count of lotes created today for this clinic
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);

  const lotesRef = db
    .collection('clinics')
    .doc(clinicId)
    .collection(LOTES_COLLECTION);

  const todayLotes = await lotesRef
    .where('dataGeracao', '>=', startOfDay.toISOString())
    .get();

  const sequence = (todayLotes.size + 1).toString().padStart(4, '0');
  return `${datePrefix}-${sequence}`;
}

/**
 * Validate guia IDs exist and belong to the correct clinic/operadora.
 */
async function validateGuias(
  db: admin.firestore.Firestore,
  clinicId: string,
  operadoraId: string,
  guiaIds: string[]
): Promise<{
  valid: boolean;
  guias: admin.firestore.DocumentData[];
  errors: LoteError[];
}> {
  const errors: LoteError[] = [];
  const guias: admin.firestore.DocumentData[] = [];

  const guiasRef = db
    .collection('clinics')
    .doc(clinicId)
    .collection(GUIAS_COLLECTION);

  // Fetch all guias in parallel
  const guiaDocs = await Promise.all(
    guiaIds.map((id) => guiasRef.doc(id).get())
  );

  for (let i = 0; i < guiaDocs.length; i++) {
    const doc = guiaDocs[i];
    const guiaId = guiaIds[i];

    if (!doc.exists) {
      errors.push({
        guiaId,
        codigo: 'GUIA_NOT_FOUND',
        mensagem: `Guia ${guiaId} não encontrada`,
      });
      continue;
    }

    const guia = doc.data()!;

    // Check if guia belongs to the same operadora
    if (guia.registroANS !== operadoraId) {
      errors.push({
        guiaId,
        codigo: 'OPERADORA_MISMATCH',
        mensagem: `Guia ${guiaId} pertence a outra operadora`,
      });
      continue;
    }

    // Check if guia is in a valid status for submission
    const validStatuses = ['rascunho', 'validada'];
    if (!validStatuses.includes(guia.status)) {
      errors.push({
        guiaId,
        codigo: 'INVALID_STATUS',
        mensagem: `Guia ${guiaId} já foi enviada (status: ${guia.status})`,
      });
      continue;
    }

    guias.push({ id: doc.id, ...guia });
  }

  return {
    valid: errors.length === 0,
    guias,
    errors,
  };
}

/**
 * Calculate total value from guias.
 */
function calculateTotalValue(guias: admin.firestore.DocumentData[]): number {
  return guias.reduce((sum, guia) => sum + (guia.valorTotal || 0), 0);
}

/**
 * Get operadora info from registry.
 */
async function getOperadoraInfo(
  db: admin.firestore.Firestore,
  clinicId: string,
  registroANS: string
): Promise<{ nome: string } | null> {
  const operadoraDoc = await db
    .collection('clinics')
    .doc(clinicId)
    .collection('operadoras')
    .where('registroANS', '==', registroANS)
    .limit(1)
    .get();

  if (operadoraDoc.empty) {
    return null;
  }

  const data = operadoraDoc.docs[0].data();
  return { nome: data.nome || 'Operadora' };
}

// =============================================================================
// CLOUD FUNCTIONS
// =============================================================================

/**
 * Create a new lote from selected guias.
 *
 * This function:
 * 1. Validates all guia IDs exist and belong to the same operadora
 * 2. Creates a new lote document
 * 3. Updates guia statuses to indicate they're in a lote
 */
export const createLote = functions.https.onCall(
  async (
    request: CreateLoteRequest,
    context: functions.https.CallableContext
  ): Promise<CreateLoteResponse> => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    const { clinicId, operadoraId, guiaIds } = request;

    // Validate input
    if (!clinicId || !operadoraId || !guiaIds || guiaIds.length === 0) {
      return {
        success: false,
        error: 'Missing required fields: clinicId, operadoraId, guiaIds',
      };
    }

    if (guiaIds.length > MAX_GUIAS_PER_LOTE) {
      return {
        success: false,
        error: `Máximo de ${MAX_GUIAS_PER_LOTE} guias por lote`,
      };
    }

    functions.logger.info('Creating lote', {
      clinicId,
      operadoraId,
      guiaCount: guiaIds.length,
      userId: context.auth.uid,
    });

    const db = admin.firestore();

    try {
      // Validate guias
      const validation = await validateGuias(db, clinicId, operadoraId, guiaIds);

      if (!validation.valid) {
        functions.logger.warn('Lote validation failed', {
          clinicId,
          errors: validation.errors,
        });

        return {
          success: false,
          error: `Validação falhou: ${validation.errors[0].mensagem}`,
        };
      }

      // Get operadora info
      const operadora = await getOperadoraInfo(db, clinicId, operadoraId);
      if (!operadora) {
        return {
          success: false,
          error: 'Operadora não encontrada',
        };
      }

      // Generate lote number
      const numeroLote = await generateLoteNumber(db, clinicId);

      // Calculate totals
      const valorTotal = calculateTotalValue(validation.guias);
      const now = new Date().toISOString();

      // Create lote document
      const loteData: Omit<LoteDocument, 'id'> = {
        clinicId,
        operadoraId,
        registroANS: operadoraId,
        nomeOperadora: operadora.nome,
        numeroLote,
        guiaIds,
        quantidadeGuias: guiaIds.length,
        valorTotal,
        status: 'rascunho' as LoteStatus,
        dataGeracao: now,
        createdAt: now,
        updatedAt: now,
        createdBy: context.auth.uid,
      };

      // Use transaction for atomicity
      const loteId = await db.runTransaction(async (transaction) => {
        // Create lote
        const loteRef = db
          .collection('clinics')
          .doc(clinicId)
          .collection(LOTES_COLLECTION)
          .doc();

        transaction.set(loteRef, { id: loteRef.id, ...loteData });

        // Update guias to reference this lote
        const guiasRef = db
          .collection('clinics')
          .doc(clinicId)
          .collection(GUIAS_COLLECTION);

        for (const guiaId of guiaIds) {
          transaction.update(guiasRef.doc(guiaId), {
            loteId: loteRef.id,
            numeroLote,
            updatedAt: now,
          });
        }

        return loteRef.id;
      });

      functions.logger.info('Lote created successfully', {
        clinicId,
        loteId,
        numeroLote,
        quantidadeGuias: guiaIds.length,
        valorTotal,
      });

      return {
        success: true,
        loteId,
        numeroLote,
        quantidadeGuias: guiaIds.length,
        valorTotal,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      functions.logger.error('Failed to create lote', {
        clinicId,
        error: message,
      });

      return {
        success: false,
        error: message,
      };
    }
  }
);

/**
 * Delete/cancel a lote (only if not yet sent).
 */
export const deleteLote = functions.https.onCall(
  async (
    request: { clinicId: string; loteId: string },
    context: functions.https.CallableContext
  ): Promise<{ success: boolean; error?: string }> => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    const { clinicId, loteId } = request;

    if (!clinicId || !loteId) {
      return { success: false, error: 'Missing clinicId or loteId' };
    }

    const db = admin.firestore();

    try {
      const loteRef = db
        .collection('clinics')
        .doc(clinicId)
        .collection(LOTES_COLLECTION)
        .doc(loteId);

      const loteDoc = await loteRef.get();

      if (!loteDoc.exists) {
        return { success: false, error: 'Lote não encontrado' };
      }

      const lote = loteDoc.data() as LoteDocument;

      // Can only delete if not sent
      if (!['rascunho', 'pronto', 'erro'].includes(lote.status)) {
        return {
          success: false,
          error: 'Não é possível excluir um lote já enviado',
        };
      }

      const now = new Date().toISOString();

      // Transaction to delete lote and update guias
      await db.runTransaction(async (transaction) => {
        // Delete lote
        transaction.delete(loteRef);

        // Update guias to remove lote reference
        const guiasRef = db
          .collection('clinics')
          .doc(clinicId)
          .collection(GUIAS_COLLECTION);

        for (const guiaId of lote.guiaIds) {
          transaction.update(guiasRef.doc(guiaId), {
            loteId: admin.firestore.FieldValue.delete(),
            numeroLote: admin.firestore.FieldValue.delete(),
            updatedAt: now,
          });
        }
      });

      functions.logger.info('Lote deleted', { clinicId, loteId });

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }
);

/**
 * Update lote status.
 */
export async function updateLoteStatus(
  clinicId: string,
  loteId: string,
  status: LoteStatus,
  additionalData?: Partial<LoteDocument>
): Promise<void> {
  const db = admin.firestore();
  const loteRef = db
    .collection('clinics')
    .doc(clinicId)
    .collection(LOTES_COLLECTION)
    .doc(loteId);

  await loteRef.update({
    status,
    updatedAt: new Date().toISOString(),
    ...additionalData,
  });
}

/**
 * Get lote by ID.
 */
export async function getLote(
  clinicId: string,
  loteId: string
): Promise<LoteDocument | null> {
  const db = admin.firestore();
  const doc = await db
    .collection('clinics')
    .doc(clinicId)
    .collection(LOTES_COLLECTION)
    .doc(loteId)
    .get();

  if (!doc.exists) {
    return null;
  }

  return doc.data() as LoteDocument;
}
