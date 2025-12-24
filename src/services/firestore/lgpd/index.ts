/**
 * LGPD Service Module
 *
 * Service for LGPD compliance operations.
 * Handles audit logging, consent management, and data export requests.
 *
 * LGPD References:
 * - Art. 37: Processing records requirement
 * - Art. 18: Data subject rights
 * - Art. 46: Security measures
 *
 * @module services/firestore/lgpd
 */

// Audit logging
export {
  logAuditEvent,
  getResourceAuditLogs,
  getUserAuditLogs,
  getAuditLogsByAction,
} from './audit';

// Consent management
export {
  recordConsent,
  getUserConsents,
  updateConsentStatus,
  hasValidConsent,
} from './consent';

// Data export requests
export {
  createDataExportRequest,
  getDataExportRequest,
  getUserExportRequests,
  updateExportRequestStatus,
} from './export';

// Collection references (for advanced usage)
export {
  getAuditLogsRef,
  getConsentsRef,
  getExportRequestsRef,
  getConsentDoc,
  getExportRequestDoc,
} from './collection-refs';

// Converters (for advanced usage)
export {
  auditLogConverter,
  consentConverter,
  exportRequestConverter,
} from './converters';
