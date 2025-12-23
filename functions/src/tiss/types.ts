/**
 * TISS Cloud Functions Types
 *
 * Types specific to Cloud Functions for TISS billing operations.
 * These types complement the frontend types in src/types/tiss/.
 *
 * @module functions/tiss/types
 */

// =============================================================================
// CERTIFICATE TYPES
// =============================================================================

/**
 * Certificate validation request payload.
 */
export interface ValidateCertificateRequest {
  /** Base64-encoded PFX/P12 file content */
  certificateBase64: string;
  /** Certificate password */
  password: string;
  /** Clinic ID for multi-tenant isolation */
  clinicId: string;
}

/**
 * Certificate validation response.
 */
export interface ValidateCertificateResponse {
  valid: boolean;
  info?: CertificateInfo;
  error?: string;
}

/**
 * Extracted certificate information.
 */
export interface CertificateInfo {
  /** Certificate holder's legal name (razão social) */
  subject: string;
  /** CNPJ extracted from certificate */
  cnpj: string;
  /** Certificate issuer (Certisign, Serasa, etc.) */
  issuer: string;
  /** Certificate serial number */
  serialNumber: string;
  /** Valid from date (ISO string) */
  validFrom: string;
  /** Valid until date (ISO string) */
  validUntil: string;
  /** Certificate type (A1, A3) */
  type: 'A1' | 'A3';
  /** Days until expiration */
  daysUntilExpiry: number;
}

/**
 * Stored certificate data (encrypted).
 */
export interface StoredCertificate {
  /** Encrypted certificate content */
  encryptedData: string;
  /** Encryption IV */
  iv: string;
  /** Certificate info (not encrypted) */
  info: CertificateInfo;
  /** Upload timestamp */
  uploadedAt: string;
  /** User who uploaded */
  uploadedBy: string;
}

// =============================================================================
// LOTE (BATCH) TYPES
// =============================================================================

/**
 * Create lote request payload.
 */
export interface CreateLoteRequest {
  clinicId: string;
  operadoraId: string;
  guiaIds: string[];
}

/**
 * Create lote response.
 */
export interface CreateLoteResponse {
  success: boolean;
  loteId?: string;
  numeroLote?: string;
  quantidadeGuias?: number;
  valorTotal?: number;
  error?: string;
}

/**
 * Send lote request payload.
 */
export interface SendLoteRequest {
  clinicId: string;
  loteId: string;
}

/**
 * Send lote response.
 */
export interface SendLoteResponse {
  success: boolean;
  protocolo?: string;
  dataEnvio?: string;
  xmlEnviado?: string;
  xmlResposta?: string;
  error?: string;
  errorCode?: string;
}

/**
 * Lote status in Firestore.
 */
export type LoteStatus =
  | 'rascunho'
  | 'validando'
  | 'pronto'
  | 'enviando'
  | 'enviado'
  | 'processando'
  | 'processado'
  | 'erro'
  | 'parcial';

/**
 * Lote document structure.
 */
export interface LoteDocument {
  id: string;
  clinicId: string;
  operadoraId: string;
  registroANS: string;
  nomeOperadora: string;
  numeroLote: string;
  guiaIds: string[];
  quantidadeGuias: number;
  valorTotal: number;
  status: LoteStatus;
  xmlContent?: string;
  xmlHash?: string;
  protocolo?: string;
  dataGeracao: string;
  dataEnvio?: string;
  dataProcessamento?: string;
  erros?: LoteError[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

/**
 * Lote error structure.
 */
export interface LoteError {
  guiaId?: string;
  codigo: string;
  mensagem: string;
  campo?: string;
}

// =============================================================================
// XML SIGNING TYPES
// =============================================================================

/**
 * Sign XML request payload.
 */
export interface SignXmlRequest {
  clinicId: string;
  xml: string;
}

/**
 * Sign XML response.
 */
export interface SignXmlResponse {
  success: boolean;
  signedXml?: string;
  error?: string;
}

// =============================================================================
// OPERADORA WEBSERVICE TYPES
// =============================================================================

/**
 * WebService configuration for an operadora.
 */
export interface WebServiceConfig {
  url: string;
  versaoTISS: string;
  timeout: number;
  /** Authentication type */
  authType: 'certificate' | 'basic' | 'token';
  /** Basic auth credentials (encrypted) */
  username?: string;
  password?: string;
  /** Bearer token (encrypted) */
  token?: string;
}

/**
 * WebService response from operadora.
 */
export interface WebServiceResponse {
  success: boolean;
  protocolo?: string;
  mensagem?: string;
  xmlResposta?: string;
  httpStatus?: number;
  errors?: WebServiceError[];
}

/**
 * WebService error structure.
 */
export interface WebServiceError {
  codigo: string;
  mensagem: string;
  detalhe?: string;
}

// =============================================================================
// GUIA STATUS TYPES (for updates)
// =============================================================================

/**
 * Guia status values.
 */
export type GuiaStatus =
  | 'rascunho'
  | 'validada'
  | 'enviada'
  | 'em_analise'
  | 'autorizada'
  | 'negada'
  | 'glosada_parcial'
  | 'glosada_total'
  | 'paga'
  | 'recurso';

/**
 * Batch update guias request.
 */
export interface UpdateGuiasStatusRequest {
  clinicId: string;
  guiaIds: string[];
  status: GuiaStatus;
  loteId?: string;
  protocolo?: string;
}

// =============================================================================
// ENCRYPTION TYPES
// =============================================================================

/**
 * Encryption result structure.
 */
export interface EncryptionResult {
  encryptedData: string;
  iv: string;
  authTag: string;
}

/**
 * Decryption request.
 */
export interface DecryptionRequest {
  encryptedData: string;
  iv: string;
  authTag: string;
}
