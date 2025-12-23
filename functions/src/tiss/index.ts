/**
 * TISS Module - Cloud Functions
 *
 * Exports all TISS-related Cloud Functions for health insurance billing.
 * Implements TISS 4.02.00 standard for Brazilian healthcare.
 *
 * @module functions/tiss
 */

// Certificate management
export {
  validateCertificate,
  storeCertificate,
  deleteCertificate,
} from './certificate';

// Lote (batch) management
export { createLote, deleteLote } from './lote';

// XML signing
export { signXml } from './xml-signer';

// Sending to operadoras
export { sendLote, retrySendLote } from './sender';

// Response handling (demonstrativos, glosas)
export {
  receiveResponse,
  webhookReceiver,
  checkLoteStatus,
  parseDemonstrativoXml,
} from './response-handler';

// Demonstrativo parsing (re-exported from response-handler, also directly available)
export type {
  DemonstrativoAnalise,
  DemonstrativoGuia,
  ItemGlosado,
} from './demonstrativo-parser';

// Glosa triggers and notifications
export {
  onGlosaCreated,
  checkGlosaDeadlines,
  getGlosaStats,
} from './glosa-triggers';

// Recurso de glosa (appeals)
export {
  createRecurso,
  sendRecurso,
  getRecursoStatus,
} from './recurso';

// Recurso types
export type {
  RecursoDocument,
  CreateRecursoRequest,
  CreateRecursoResponse,
  SendRecursoRequest,
  SendRecursoResponse,
  ItemContestado,
} from './recurso';

// XML generation utilities (internal use)
export { generateRecursoXml, escapeXml } from './recurso-xml';

// Types (for internal use)
export type * from './types';
