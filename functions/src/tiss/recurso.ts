/**
 * TISS Recurso de Glosa (Appeal) Module
 *
 * Handles creating, managing, and sending appeals for billing denials (glosas).
 * Implements the TISS standard for recurso de glosa.
 *
 * @module functions/tiss/recurso
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { signXmlDocument } from './xml-signer';
import { getCertificateForSigning } from './certificate';
import {
  generateRecursoXml,
  generateNumeroRecurso,
  type ItemContestado,
  type RecursoForXml,
} from './recurso-xml';

// Re-export types for convenience
export type { ItemContestado, RecursoForXml } from './recurso-xml';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Recurso document structure.
 */
export interface RecursoDocument extends RecursoForXml {
  clinicId: string;
  glosaId: string;
  guiaId: string;
  operadoraId: string;
  dataEnvio?: string;
  valorContestado: number;
  documentosAnexos?: string[];
  status: 'rascunho' | 'enviado' | 'em_analise' | 'aceito' | 'negado' | 'aceito_parcial';
  protocolo?: string;
  respostaOperadora?: string;
  dataResposta?: string;
  valorRecuperado?: number;
  xmlContent?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

/**
 * Create recurso request.
 */
export interface CreateRecursoRequest {
  clinicId: string;
  glosaId: string;
  itensContestados: Array<{
    sequencialItem: number;
    justificativa: string;
    documentosAnexos?: string[];
  }>;
  justificativaGeral?: string;
  documentosAnexos?: string[];
}

/**
 * Create recurso response.
 */
export interface CreateRecursoResponse {
  success: boolean;
  recursoId?: string;
  valorContestado?: number;
  error?: string;
}

/**
 * Send recurso request.
 */
export interface SendRecursoRequest {
  clinicId: string;
  recursoId: string;
}

/**
 * Send recurso response.
 */
export interface SendRecursoResponse {
  success: boolean;
  protocolo?: string;
  dataEnvio?: string;
  error?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const GLOSAS_COLLECTION = 'glosas';
const RECURSOS_COLLECTION = 'recursos';
const OPERADORAS_COLLECTION = 'operadoras';

// =============================================================================
// DATABASE OPERATIONS
// =============================================================================

/**
 * Get glosa by ID.
 *
 * @param clinicId - Clinic identifier
 * @param glosaId - Glosa document ID
 * @returns Glosa document data or null if not found
 */
async function getGlosa(
  clinicId: string,
  glosaId: string
): Promise<FirebaseFirestore.DocumentData | null> {
  const db = admin.firestore();
  const glosaRef = db
    .collection('clinics')
    .doc(clinicId)
    .collection(GLOSAS_COLLECTION)
    .doc(glosaId);

  const doc = await glosaRef.get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

/**
 * Get operadora by ANS registry number.
 *
 * @param clinicId - Clinic identifier
 * @param operadoraId - ANS registry number
 * @returns Operadora document data or null if not found
 */
async function getOperadora(
  clinicId: string,
  operadoraId: string
): Promise<FirebaseFirestore.DocumentData | null> {
  const db = admin.firestore();
  const operadorasRef = db
    .collection('clinics')
    .doc(clinicId)
    .collection(OPERADORAS_COLLECTION);

  const query = await operadorasRef.where('registroANS', '==', operadoraId).limit(1).get();

  if (query.empty) {
    return null;
  }

  return { id: query.docs[0].id, ...query.docs[0].data() };
}

/**
 * Update glosa status after recurso creation.
 *
 * @param clinicId - Clinic identifier
 * @param glosaId - Glosa document ID
 * @param status - New status
 * @param recursoId - Associated recurso ID
 */
async function updateGlosaStatus(
  clinicId: string,
  glosaId: string,
  status: string,
  recursoId: string
): Promise<void> {
  const db = admin.firestore();
  await db
    .collection('clinics')
    .doc(clinicId)
    .collection(GLOSAS_COLLECTION)
    .doc(glosaId)
    .update({
      status,
      recursoId,
      updatedAt: new Date().toISOString(),
    });
}

// =============================================================================
// CLOUD FUNCTIONS
// =============================================================================

/**
 * Create a recurso de glosa (appeal).
 *
 * This function:
 * 1. Validates the glosa exists and is within deadline
 * 2. Creates the recurso record
 * 3. Updates the glosa status
 *
 * @returns CreateRecursoResponse with success status and recurso ID
 */
export const createRecurso = functions.https.onCall(
  async (
    request: CreateRecursoRequest,
    context: functions.https.CallableContext
  ): Promise<CreateRecursoResponse> => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    const { clinicId, glosaId, itensContestados, justificativaGeral, documentosAnexos } = request;

    if (!clinicId || !glosaId || !itensContestados || itensContestados.length === 0) {
      return {
        success: false,
        error: 'Missing required fields: clinicId, glosaId, itensContestados',
      };
    }

    functions.logger.info('Creating recurso de glosa', {
      clinicId,
      glosaId,
      itensCount: itensContestados.length,
      userId: context.auth.uid,
    });

    try {
      const glosa = await getGlosa(clinicId, glosaId);
      if (!glosa) {
        return { success: false, error: 'Glosa não encontrada' };
      }

      const prazoDate = new Date(glosa.prazoRecurso);
      const today = new Date();
      if (today > prazoDate) {
        return {
          success: false,
          error: `Prazo para recurso expirado em ${glosa.prazoRecurso}`,
        };
      }

      if (glosa.status === 'em_recurso') {
        return {
          success: false,
          error: 'Esta glosa já possui um recurso em andamento',
        };
      }

      const fullItensContestados: ItemContestado[] = itensContestados.map((item) => {
        const glosaItem = glosa.itensGlosados?.find(
          (gi: { sequencialItem: number }) => gi.sequencialItem === item.sequencialItem
        );

        return {
          sequencialItem: item.sequencialItem,
          codigoProcedimento: glosaItem?.codigoProcedimento || '',
          valorOriginal: glosaItem?.valorOriginal || 0,
          valorGlosado: glosaItem?.valorGlosado || 0,
          codigoGlosa: glosaItem?.codigoGlosa || '',
          justificativa: item.justificativa,
          documentosAnexos: item.documentosAnexos,
        };
      });

      const valorContestado = fullItensContestados.reduce((sum, item) => sum + item.valorGlosado, 0);

      const now = new Date().toISOString();
      const recursoId = generateNumeroRecurso(clinicId);

      const recursoData: Omit<RecursoDocument, 'id'> = {
        clinicId,
        glosaId,
        guiaId: glosa.guiaId,
        operadoraId: glosa.operadoraId,
        numeroGuiaPrestador: glosa.numeroGuiaPrestador,
        itensContestados: fullItensContestados,
        valorContestado,
        justificativaGeral,
        documentosAnexos,
        status: 'rascunho',
        createdAt: now,
        updatedAt: now,
        createdBy: context.auth.uid,
      };

      const db = admin.firestore();
      await db
        .collection('clinics')
        .doc(clinicId)
        .collection(RECURSOS_COLLECTION)
        .doc(recursoId)
        .set(recursoData);

      await updateGlosaStatus(clinicId, glosaId, 'em_recurso', recursoId);

      functions.logger.info('Recurso created successfully', {
        clinicId,
        recursoId,
        valorContestado,
      });

      return { success: true, recursoId, valorContestado };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      functions.logger.error('Failed to create recurso', { clinicId, glosaId, error: message });
      return { success: false, error: message };
    }
  }
);

/**
 * Send recurso to operadora.
 *
 * This function:
 * 1. Gets the recurso and validates it's ready
 * 2. Generates and signs the XML
 * 3. Updates status with protocol
 *
 * @returns SendRecursoResponse with success status and protocol
 */
export const sendRecurso = functions
  .runWith({ timeoutSeconds: 120, memory: '512MB' })
  .https.onCall(
    async (
      request: SendRecursoRequest,
      context: functions.https.CallableContext
    ): Promise<SendRecursoResponse> => {
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
      }

      const { clinicId, recursoId } = request;

      if (!clinicId || !recursoId) {
        return { success: false, error: 'Missing required fields: clinicId, recursoId' };
      }

      functions.logger.info('Sending recurso', {
        clinicId,
        recursoId,
        userId: context.auth.uid,
      });

      try {
        const db = admin.firestore();

        const recursoRef = db
          .collection('clinics')
          .doc(clinicId)
          .collection(RECURSOS_COLLECTION)
          .doc(recursoId);

        const recursoDoc = await recursoRef.get();
        if (!recursoDoc.exists) {
          return { success: false, error: 'Recurso não encontrado' };
        }

        const recurso = { id: recursoDoc.id, ...recursoDoc.data() } as RecursoDocument;

        if (recurso.status !== 'rascunho') {
          return {
            success: false,
            error: `Recurso já foi enviado (status: ${recurso.status})`,
          };
        }

        const operadora = await getOperadora(clinicId, recurso.operadoraId);
        if (!operadora) {
          return { success: false, error: 'Operadora não encontrada' };
        }

        const xml = generateRecursoXml(
          recurso,
          operadora.codigoPrestador || '',
          operadora.registroANS
        );

        const certData = await getCertificateForSigning(clinicId);
        const signedXml = signXmlDocument(xml, certData.pfxBase64, certData.password);

        const now = new Date().toISOString();
        const protocolo = `PROT${Date.now().toString(36).toUpperCase()}`;

        await recursoRef.update({
          status: 'enviado',
          dataEnvio: now,
          protocolo,
          xmlContent: signedXml,
          updatedAt: now,
        });

        functions.logger.info('Recurso sent successfully', { clinicId, recursoId, protocolo });

        return { success: true, protocolo, dataEnvio: now };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        functions.logger.error('Failed to send recurso', { clinicId, recursoId, error: message });
        return { success: false, error: message };
      }
    }
  );

/**
 * Get recurso status and details.
 *
 * @returns Status information for the recurso
 */
export const getRecursoStatus = functions.https.onCall(
  async (
    request: { clinicId: string; recursoId: string },
    context: functions.https.CallableContext
  ): Promise<{
    success: boolean;
    status?: string;
    protocolo?: string;
    dataEnvio?: string;
    dataResposta?: string;
    respostaOperadora?: string;
    valorRecuperado?: number;
    error?: string;
  }> => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    const { clinicId, recursoId } = request;

    if (!clinicId || !recursoId) {
      return { success: false, error: 'Missing required fields: clinicId, recursoId' };
    }

    try {
      const db = admin.firestore();
      const recursoRef = db
        .collection('clinics')
        .doc(clinicId)
        .collection(RECURSOS_COLLECTION)
        .doc(recursoId);

      const recursoDoc = await recursoRef.get();
      if (!recursoDoc.exists) {
        return { success: false, error: 'Recurso não encontrado' };
      }

      const recurso = recursoDoc.data() as RecursoDocument;

      return {
        success: true,
        status: recurso.status,
        protocolo: recurso.protocolo,
        dataEnvio: recurso.dataEnvio,
        dataResposta: recurso.dataResposta,
        respostaOperadora: recurso.respostaOperadora,
        valorRecuperado: recurso.valorRecuperado,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }
);
