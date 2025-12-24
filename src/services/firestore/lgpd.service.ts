/**
 * LGPD Service - Re-export
 *
 * This file re-exports from the modular lgpd/ directory.
 * Maintains backward compatibility with existing imports.
 *
 * @module services/firestore/lgpd.service
 * @see services/firestore/lgpd
 */

export {
  // Audit logging
  logAuditEvent,
  getResourceAuditLogs,
  getUserAuditLogs,
  getAuditLogsByAction,
  // Consent management
  recordConsent,
  getUserConsents,
  updateConsentStatus,
  hasValidConsent,
  // Data export requests
  createDataExportRequest,
  getDataExportRequest,
  getUserExportRequests,
  updateExportRequestStatus,
  // Collection references
  getAuditLogsRef,
  getConsentsRef,
  getExportRequestsRef,
  getConsentDoc,
  getExportRequestDoc,
  // Converters
  auditLogConverter,
  consentConverter,
  exportRequestConverter,
} from './lgpd';
