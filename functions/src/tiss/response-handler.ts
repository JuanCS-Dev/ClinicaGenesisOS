/**
 * TISS Response Handler
 *
 * Cloud Functions for handling incoming responses from health insurance
 * operators (operadoras). Processes demonstrativos, creates glosa records,
 * and updates guia/lote statuses.
 *
 * @module functions/tiss/response-handler
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import type { LoteStatus, GuiaStatus, WebServiceResponse } from './types';
import {
  parseDemonstrativoXml,
  calculatePrazoRecurso,
  type DemonstrativoAnalise,
  type DemonstrativoGuia,
  type ItemGlosado,
} from './demonstrativo-parser';

// Re-export parser for convenience
export { parseDemonstrativoXml } from './demonstrativo-parser';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Glosa document structure in Firestore.
 */
export interface GlosaDocument {
  id: string;
  clinicId: string;
  guiaId: string;
  loteId: string;
  operadoraId: string;
  numeroGuiaPrestador: string;
  tipoGuia: string;
  dataRecebimento: string;
  valorOriginal: number;
  valorGlosado: number;
  valorAprovado: number;
  itensGlosados: ItemGlosado[];
  prazoRecurso: string;
  status: 'pendente' | 'em_recurso' | 'resolvida';
  observacaoOperadora?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request payload for receiving responses.
 */
export interface ReceiveResponseRequest {
  clinicId: string;
  loteId: string;
  xmlResponse?: string;
  demonstrativo?: DemonstrativoAnalise;
}

/**
 * Response from processing demonstrativo.
 */
export interface ReceiveResponseResult {
  success: boolean;
  loteId?: string;
  guiasProcessadas?: number;
  glosasIdentificadas?: number;
  valorGlosadoTotal?: number;
  error?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const GUIAS_COLLECTION = 'guias';
const LOTES_COLLECTION = 'lotes';
const GLOSAS_COLLECTION = 'glosas';

// =============================================================================
// GLOSA CREATION
// =============================================================================

/**
 * Create glosa document from demonstrativo guia.
 */
function createGlosaFromDemonstrativo(
  clinicId: string,
  guiaId: string,
  loteId: string,
  operadoraId: string,
  guia: DemonstrativoGuia,
  tipoGuia: string
): Omit<GlosaDocument, 'id'> {
  const now = new Date().toISOString();

  const itensGlosados: ItemGlosado[] =
    guia.itensGlosados && guia.itensGlosados.length > 0
      ? guia.itensGlosados
      : guia.valorGlosado > 0
        ? [
            {
              sequencialItem: 1,
              codigoProcedimento: '',
              descricaoProcedimento: 'Valor glosado',
              valorGlosado: guia.valorGlosado,
              codigoGlosa: 'outros',
              descricaoGlosa: 'Motivo não especificado pela operadora',
            },
          ]
        : [];

  return {
    clinicId,
    guiaId,
    loteId,
    operadoraId,
    numeroGuiaPrestador: guia.numeroGuiaPrestador,
    tipoGuia,
    dataRecebimento: guia.dataExecucao,
    valorOriginal: guia.valorInformado,
    valorGlosado: guia.valorGlosado,
    valorAprovado: guia.valorProcessado,
    itensGlosados,
    prazoRecurso: calculatePrazoRecurso(guia.dataExecucao),
    status: 'pendente',
    createdAt: now,
    updatedAt: now,
  };
}

// =============================================================================
// DATABASE OPERATIONS
// =============================================================================

/**
 * Find guia by numeroGuiaPrestador.
 */
async function findGuiaByNumero(
  clinicId: string,
  numeroGuiaPrestador: string
): Promise<{ id: string; tipoGuia: string } | null> {
  const db = admin.firestore();
  const guiasRef = db.collection('clinics').doc(clinicId).collection(GUIAS_COLLECTION);
  const query = await guiasRef.where('numeroGuia', '==', numeroGuiaPrestador).limit(1).get();

  if (query.empty) return null;

  const doc = query.docs[0];
  return { id: doc.id, tipoGuia: doc.data().tipoGuia || 'consulta' };
}

/**
 * Update guia status based on demonstrativo result.
 */
async function updateGuiaFromDemonstrativo(
  clinicId: string,
  guiaId: string,
  guia: DemonstrativoGuia
): Promise<void> {
  const db = admin.firestore();
  const guiaRef = db.collection('clinics').doc(clinicId).collection(GUIAS_COLLECTION).doc(guiaId);

  const statusMap: Record<DemonstrativoGuia['status'], GuiaStatus> = {
    aprovada: 'autorizada',
    glosada_parcial: 'glosada_parcial',
    glosada_total: 'glosada_total',
    pendente: 'em_analise',
  };

  await guiaRef.update({
    status: statusMap[guia.status],
    valorProcessado: guia.valorProcessado,
    valorGlosado: guia.valorGlosado,
    numeroGuiaOperadora: guia.numeroGuiaOperadora,
    dataProcessamento: guia.dataExecucao,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Create glosa record in Firestore.
 */
async function createGlosaRecord(
  clinicId: string,
  glosaData: Omit<GlosaDocument, 'id'>
): Promise<string> {
  const db = admin.firestore();
  const glosasRef = db.collection('clinics').doc(clinicId).collection(GLOSAS_COLLECTION);
  const docRef = await glosasRef.add(glosaData);
  return docRef.id;
}

/**
 * Update lote status after processing response.
 */
async function updateLoteFromResponse(
  clinicId: string,
  loteId: string,
  demonstrativo: DemonstrativoAnalise
): Promise<void> {
  const db = admin.firestore();
  const loteRef = db.collection('clinics').doc(clinicId).collection(LOTES_COLLECTION).doc(loteId);

  const allGlosadas = demonstrativo.guias.every((g) => g.status === 'glosada_total');
  const someGlosadas = demonstrativo.guias.some(
    (g) => g.status === 'glosada_parcial' || g.status === 'glosada_total'
  );

  let status: LoteStatus = 'processado';
  if (allGlosadas) {
    status = 'erro';
  } else if (someGlosadas) {
    status = 'parcial';
  }

  await loteRef.update({
    status,
    dataProcessamento: demonstrativo.dataProcessamento,
    valorProcessado: demonstrativo.valorProcessado,
    valorGlosado: demonstrativo.valorGlosado,
    updatedAt: new Date().toISOString(),
  });
}

// =============================================================================
// CLOUD FUNCTIONS
// =============================================================================

/**
 * Process demonstrativo de análise response from operadora.
 *
 * This function:
 * 1. Parses the XML response (if raw XML provided)
 * 2. Updates each guia status based on the result
 * 3. Creates glosa records for rejected/partial items
 * 4. Updates the lote status
 * 5. Returns summary of processing
 */
export const receiveResponse = functions
  .runWith({ timeoutSeconds: 120, memory: '256MB' })
  .https.onCall(
    async (
      request: ReceiveResponseRequest,
      context: functions.https.CallableContext
    ): Promise<ReceiveResponseResult> => {
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
      }

      const { clinicId, loteId, xmlResponse, demonstrativo: providedDemonstrativo } = request;

      if (!clinicId || !loteId) {
        return { success: false, error: 'Missing required fields: clinicId, loteId' };
      }

      if (!xmlResponse && !providedDemonstrativo) {
        return { success: false, error: 'Must provide either xmlResponse or demonstrativo' };
      }

      functions.logger.info('Processing demonstrativo response', {
        clinicId,
        loteId,
        hasXml: !!xmlResponse,
        userId: context.auth.uid,
      });

      try {
        const demonstrativo = providedDemonstrativo || parseDemonstrativoXml(xmlResponse!);

        let guiasProcessadas = 0;
        let glosasIdentificadas = 0;
        let valorGlosadoTotal = 0;

        for (const guiaDemo of demonstrativo.guias) {
          const guiaInfo = await findGuiaByNumero(clinicId, guiaDemo.numeroGuiaPrestador);

          if (!guiaInfo) {
            functions.logger.warn('Guia not found in system', {
              numeroGuiaPrestador: guiaDemo.numeroGuiaPrestador,
              clinicId,
            });
            continue;
          }

          await updateGuiaFromDemonstrativo(clinicId, guiaInfo.id, guiaDemo);
          guiasProcessadas++;

          if (guiaDemo.valorGlosado > 0) {
            const glosaData = createGlosaFromDemonstrativo(
              clinicId,
              guiaInfo.id,
              loteId,
              demonstrativo.registroANS,
              guiaDemo,
              guiaInfo.tipoGuia
            );

            await createGlosaRecord(clinicId, glosaData);
            glosasIdentificadas++;
            valorGlosadoTotal += guiaDemo.valorGlosado;

            const db = admin.firestore();
            await db
              .collection('clinics')
              .doc(clinicId)
              .collection(GUIAS_COLLECTION)
              .doc(guiaInfo.id)
              .update({ temGlosa: true, updatedAt: new Date().toISOString() });
          }
        }

        await updateLoteFromResponse(clinicId, loteId, demonstrativo);

        functions.logger.info('Demonstrativo processed successfully', {
          clinicId,
          loteId,
          guiasProcessadas,
          glosasIdentificadas,
          valorGlosadoTotal,
        });

        return { success: true, loteId, guiasProcessadas, glosasIdentificadas, valorGlosadoTotal };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        functions.logger.error('Failed to process demonstrativo', { clinicId, loteId, error: message });
        return { success: false, error: `Failed to process response: ${message}` };
      }
    }
  );

/**
 * HTTP endpoint for receiving webhook callbacks from operadoras.
 *
 * Some operadoras send results via HTTP POST to a configured URL.
 * This endpoint receives those callbacks and stores them for processing.
 */
export const webhookReceiver = functions
  .runWith({ timeoutSeconds: 60, memory: '256MB' })
  .https.onRequest(async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method not allowed');
      return;
    }

    try {
      const contentType = req.get('content-type') || '';
      let xmlContent: string;

      if (contentType.includes('application/xml') || contentType.includes('text/xml')) {
        xmlContent = req.body;
      } else if (contentType.includes('application/json')) {
        xmlContent = req.body.xml || req.body.content || JSON.stringify(req.body);
      } else {
        xmlContent = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      }

      const clinicId = (req.get('X-Clinic-Id') || req.query.clinicId) as string;
      const loteId = (req.get('X-Lote-Id') || req.query.loteId) as string;

      if (!clinicId || !loteId) {
        const parsedDemo = parseDemonstrativoXml(xmlContent);
        functions.logger.warn('Received webhook without clinic/lote identification', {
          numeroLote: parsedDemo.numeroLote,
          protocolo: parsedDemo.protocolo,
        });

        const db = admin.firestore();
        await db.collection('pending_responses').add({
          xmlContent,
          receivedAt: new Date().toISOString(),
          numeroLote: parsedDemo.numeroLote,
          protocolo: parsedDemo.protocolo,
          status: 'pending_identification',
        });

        res.status(202).json({
          status: 'accepted',
          message: 'Response stored for manual processing',
          numeroLote: parsedDemo.numeroLote,
        });
        return;
      }

      const demonstrativo = parseDemonstrativoXml(xmlContent);
      const db = admin.firestore();

      await db
        .collection('clinics')
        .doc(clinicId)
        .collection(LOTES_COLLECTION)
        .doc(loteId)
        .update({ xmlResposta: xmlContent, responseReceivedAt: new Date().toISOString() });

      functions.logger.info('Webhook response received', {
        clinicId,
        loteId,
        numeroLote: demonstrativo.numeroLote,
        guiasCount: demonstrativo.guias.length,
      });

      res.status(200).json({
        status: 'received',
        numeroLote: demonstrativo.numeroLote,
        guiasCount: demonstrativo.guias.length,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      functions.logger.error('Webhook processing failed', { error: message });
      res.status(500).json({ status: 'error', message: 'Failed to process webhook' });
    }
  });

/**
 * Check status of a lote with the operadora.
 *
 * @returns Current status from Firestore (polling WebService not yet implemented)
 */
export const checkLoteStatus = functions.https.onCall(
  async (
    request: { clinicId: string; loteId: string },
    context: functions.https.CallableContext
  ): Promise<WebServiceResponse> => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    const { clinicId, loteId } = request;

    if (!clinicId || !loteId) {
      return { success: false, mensagem: 'Missing required fields: clinicId, loteId' };
    }

    const db = admin.firestore();
    const loteRef = db.collection('clinics').doc(clinicId).collection(LOTES_COLLECTION).doc(loteId);
    const loteDoc = await loteRef.get();

    if (!loteDoc.exists) {
      return { success: false, mensagem: 'Lote não encontrado' };
    }

    const lote = loteDoc.data()!;
    return { success: true, protocolo: lote.protocolo, mensagem: `Status atual: ${lote.status}` };
  }
);
