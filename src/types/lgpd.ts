/**
 * LGPD Types Module
 * =================
 *
 * Types for LGPD (Lei Geral de Proteção de Dados) compliance.
 * Fase 11: LGPD Compliance
 *
 * References:
 * - LGPD Art. 7: Legal bases for processing
 * - LGPD Art. 18: Data subject rights
 * - LGPD Art. 37: Processing records requirement
 */

/**
 * Consent status for data processing.
 */
export type ConsentStatus = 'pending' | 'granted' | 'denied' | 'withdrawn'

/**
 * Types of data processing purposes.
 * Based on LGPD Art. 7 legal bases.
 */
export type ProcessingPurpose =
  | 'healthcare_provision' // Art. 7, II - Contract execution
  | 'legal_obligation' // Art. 7, II - Legal/regulatory compliance
  | 'vital_interests' // Art. 7, VII - Protection of life
  | 'legitimate_interest' // Art. 7, IX - Legitimate interest
  | 'consent_based' // Art. 7, I - Explicit consent
  | 'marketing' // Requires explicit consent
  | 'analytics' // Aggregated, anonymized
  | 'research' // Scientific research (Art. 7, IV)

/**
 * Categories of personal data collected.
 */
export type DataCategory =
  | 'identification' // Name, CPF, RG
  | 'contact' // Email, phone, address
  | 'health' // Medical records (sensitive)
  | 'financial' // Payment info
  | 'biometric' // Photos, fingerprints (sensitive)
  | 'genetic' // Genetic data (sensitive)
  | 'location' // Geographic data
  | 'behavioral' // Usage patterns

/**
 * LGPD Art. 18 - Data subject rights.
 */
export type DataSubjectRight =
  | 'access' // Art. 18, II - Confirm and access data
  | 'correction' // Art. 18, III - Correct incomplete/inaccurate
  | 'anonymization' // Art. 18, IV - Anonymize, block, or delete
  | 'portability' // Art. 18, V - Data portability
  | 'deletion' // Art. 18, VI - Delete data
  | 'information' // Art. 18, VII - Info about sharing
  | 'revocation' // Art. 18, IX - Revoke consent
  | 'opposition' // Art. 18, VIII - Object to processing

/**
 * Consent record for a specific purpose.
 */
export interface ConsentRecord {
  /** Unique identifier */
  id: string
  /** User/patient ID */
  userId: string
  /** Processing purpose */
  purpose: ProcessingPurpose
  /** Data categories covered */
  dataCategories: DataCategory[]
  /** Current status */
  status: ConsentStatus
  /** Consent version (for tracking policy changes) */
  version: string
  /** IP address at consent time */
  ipAddress?: string
  /** User agent at consent time */
  userAgent?: string
  /** Timestamp of consent */
  grantedAt?: string
  /** Timestamp of withdrawal */
  withdrawnAt?: string
  /** Expiration date (if applicable) */
  expiresAt?: string
  /** Created timestamp */
  createdAt: string
  /** Last update timestamp */
  updatedAt: string
}

/**
 * Input for creating/updating consent.
 */
export interface ConsentInput {
  purpose: ProcessingPurpose
  dataCategories: DataCategory[]
  status: ConsentStatus
  version?: string
}

/**
 * Audit log action types.
 */
export type AuditAction =
  | 'view' // Data access
  | 'create' // Data creation
  | 'update' // Data modification
  | 'delete' // Data deletion
  | 'export' // Data export
  | 'share' // Data sharing
  | 'login' // Authentication
  | 'logout' // Session end
  | 'consent_grant' // Consent given
  | 'consent_withdraw' // Consent revoked
  | 'data_request' // LGPD Art. 18 request
  | 'data_breach' // Security incident

/**
 * Resource types for audit logging.
 */
export type AuditResourceType =
  | 'patient'
  | 'appointment'
  | 'medical_record'
  | 'prescription'
  | 'lab_result'
  | 'transaction'
  | 'user'
  | 'consent'
  | 'document'
  | 'telemedicine_session'
  | 'conversation'
  | 'message'
  | 'record_version'
  | 'guia'
  | 'glosa'
  | 'task'
  | 'clinic'
  | 'operadora'

/**
 * Audit log entry (LGPD Art. 37 compliance).
 */
export interface AuditLogEntry {
  /** Unique identifier */
  id: string
  /** Clinic ID (multi-tenancy) */
  clinicId: string
  /** User who performed action */
  userId: string
  /** User display name (denormalized) */
  userName?: string
  /** Action performed */
  action: AuditAction
  /** Resource type accessed */
  resourceType: AuditResourceType
  /** Resource ID */
  resourceId: string
  /** Additional details */
  details?: Record<string, unknown>
  /** Fields that were modified (for updates) */
  modifiedFields?: string[]
  /** Previous values (for updates/deletes) */
  previousValues?: Record<string, unknown>
  /** New values (for creates/updates) */
  newValues?: Record<string, unknown>
  /** Client IP address */
  ipAddress?: string
  /** User agent string */
  userAgent?: string
  /** Geolocation (if available) */
  location?: {
    country?: string
    region?: string
    city?: string
  }
  /** Session ID for correlation */
  sessionId?: string
  /** Request ID for tracing */
  requestId?: string
  /** Timestamp */
  timestamp: string
}

/**
 * Input for creating audit log.
 */
export interface CreateAuditLogInput {
  action: AuditAction
  resourceType: AuditResourceType
  resourceId: string
  details?: Record<string, unknown>
  modifiedFields?: string[]
  previousValues?: Record<string, unknown>
  newValues?: Record<string, unknown>
}

/**
 * Data export request (LGPD Art. 18, V - Portability).
 */
export interface DataExportRequest {
  /** Unique identifier */
  id: string
  /** Clinic ID */
  clinicId: string
  /** Requesting user ID */
  userId: string
  /** Type of export */
  type: DataSubjectRight
  /** Status of request */
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired'
  /** Data categories requested */
  dataCategories: DataCategory[]
  /** Format of export */
  format: 'json' | 'pdf' | 'csv'
  /** Download URL (when completed) */
  downloadUrl?: string
  /** Expiration of download link */
  downloadExpiresAt?: string
  /** Reason for request (optional) */
  reason?: string
  /** Processing notes */
  notes?: string
  /** Error message if failed */
  errorMessage?: string
  /** Created timestamp */
  createdAt: string
  /** Completed timestamp */
  completedAt?: string
}

/**
 * Input for creating data export request.
 */
export interface CreateDataExportInput {
  type: DataSubjectRight
  dataCategories: DataCategory[]
  format: 'json' | 'pdf' | 'csv'
  reason?: string
}

/**
 * Privacy policy version tracking.
 */
export interface PrivacyPolicyVersion {
  /** Version identifier (e.g., "2.0.0") */
  version: string
  /** Effective date */
  effectiveDate: string
  /** Summary of changes */
  changesSummary: string
  /** Full policy text URL */
  policyUrl: string
  /** Whether users need to re-consent */
  requiresReconsent: boolean
  /** Created timestamp */
  createdAt: string
}

/**
 * DPO (Data Protection Officer) info.
 */
export interface DPOInfo {
  /** DPO name */
  name: string
  /** DPO email */
  email: string
  /** DPO phone (optional) */
  phone?: string
  /** Registration with ANPD (if applicable) */
  anpdRegistration?: string
}

/**
 * LGPD compliance status for a clinic.
 */
export interface LGPDComplianceStatus {
  /** Clinic ID */
  clinicId: string
  /** DPO information */
  dpo?: DPOInfo
  /** Current privacy policy version */
  currentPolicyVersion: string
  /** DPIA (Data Protection Impact Assessment) status */
  dpiaStatus: 'not_started' | 'in_progress' | 'completed' | 'needs_review'
  /** Date of last DPIA */
  lastDpiaDate?: string
  /** Consent collection enabled */
  consentEnabled: boolean
  /** Audit logging enabled */
  auditLoggingEnabled: boolean
  /** Data retention policy (days) */
  retentionDays: number
  /** Last compliance review date */
  lastReviewDate?: string
  /** Next scheduled review */
  nextReviewDate?: string
}

/**
 * Purpose labels in Portuguese.
 */
export const PURPOSE_LABELS: Record<ProcessingPurpose, string> = {
  healthcare_provision: 'Prestação de Serviços de Saúde',
  legal_obligation: 'Cumprimento de Obrigação Legal',
  vital_interests: 'Proteção da Vida',
  legitimate_interest: 'Interesse Legítimo',
  consent_based: 'Consentimento',
  marketing: 'Marketing e Comunicações',
  analytics: 'Análise e Melhoria de Serviços',
  research: 'Pesquisa Científica',
}

/**
 * Data category labels in Portuguese.
 */
export const DATA_CATEGORY_LABELS: Record<DataCategory, string> = {
  identification: 'Dados de Identificação',
  contact: 'Dados de Contato',
  health: 'Dados de Saúde',
  financial: 'Dados Financeiros',
  biometric: 'Dados Biométricos',
  genetic: 'Dados Genéticos',
  location: 'Dados de Localização',
  behavioral: 'Dados Comportamentais',
}

/**
 * Data subject right labels in Portuguese.
 */
export const RIGHT_LABELS: Record<DataSubjectRight, string> = {
  access: 'Acesso aos Dados',
  correction: 'Correção de Dados',
  anonymization: 'Anonimização',
  portability: 'Portabilidade',
  deletion: 'Exclusão de Dados',
  information: 'Informações sobre Compartilhamento',
  revocation: 'Revogação do Consentimento',
  opposition: 'Oposição ao Tratamento',
}

/**
 * Audit action labels in Portuguese.
 */
export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  view: 'Visualização',
  create: 'Criação',
  update: 'Atualização',
  delete: 'Exclusão',
  export: 'Exportação',
  share: 'Compartilhamento',
  login: 'Login',
  logout: 'Logout',
  consent_grant: 'Consentimento Concedido',
  consent_withdraw: 'Consentimento Revogado',
  data_request: 'Solicitação LGPD',
  data_breach: 'Incidente de Segurança',
}

/**
 * Check if data category is sensitive (requires explicit consent).
 */
export function isSensitiveCategory(category: DataCategory): boolean {
  const sensitiveCategories: DataCategory[] = ['health', 'biometric', 'genetic']
  return sensitiveCategories.includes(category)
}

/**
 * Check if purpose requires explicit consent.
 */
export function requiresExplicitConsent(purpose: ProcessingPurpose): boolean {
  const consentRequired: ProcessingPurpose[] = ['consent_based', 'marketing', 'research']
  return consentRequired.includes(purpose)
}

/**
 * Get legal basis for purpose (LGPD Art. 7).
 */
export function getLegalBasis(purpose: ProcessingPurpose): string {
  const legalBases: Record<ProcessingPurpose, string> = {
    healthcare_provision: 'Art. 7, II - Execução de contrato',
    legal_obligation: 'Art. 7, II - Cumprimento de obrigação legal',
    vital_interests: 'Art. 7, VII - Proteção da vida',
    legitimate_interest: 'Art. 7, IX - Interesse legítimo',
    consent_based: 'Art. 7, I - Consentimento',
    marketing: 'Art. 7, I - Consentimento',
    analytics: 'Art. 7, IX - Interesse legítimo',
    research: 'Art. 7, IV - Pesquisa',
  }
  return legalBases[purpose]
}
