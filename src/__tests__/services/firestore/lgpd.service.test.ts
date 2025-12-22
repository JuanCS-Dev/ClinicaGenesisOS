/**
 * LGPD Service Tests
 * ==================
 *
 * Unit tests for LGPD service functions.
 * Fase 11: LGPD Compliance
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  addDoc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  updateDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  Timestamp: {
    fromDate: vi.fn((date: Date) => ({ toDate: () => date })),
  },
  serverTimestamp: vi.fn(() => ({ _serverTimestamp: true })),
}));

vi.mock('@/services/firebase', () => ({
  db: {},
}));

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
} from 'firebase/firestore';
import {
  logAuditEvent,
  getResourceAuditLogs,
  getUserAuditLogs,
  getAuditLogsByAction,
  recordConsent,
  getUserConsents,
  updateConsentStatus,
  hasValidConsent,
  createDataExportRequest,
  getDataExportRequest,
  getUserExportRequests,
  updateExportRequestStatus,
} from '../../../services/firestore/lgpd.service';

describe('LGPD Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('logAuditEvent', () => {
    it('creates an audit log entry', async () => {
      const mockDocRef = { id: 'audit-123' };
      vi.mocked(addDoc).mockResolvedValue(mockDocRef as never);

      const result = await logAuditEvent(
        'clinic-1',
        'user-1',
        'Dr. Silva',
        {
          action: 'view',
          resourceType: 'patient',
          resourceId: 'patient-1',
          details: { reason: 'Consulta' },
        }
      );

      expect(result).toBe('audit-123');
      expect(addDoc).toHaveBeenCalledTimes(1);
    });

    it('includes all required fields', async () => {
      const mockDocRef = { id: 'audit-123' };
      vi.mocked(addDoc).mockResolvedValue(mockDocRef as never);

      await logAuditEvent('clinic-1', 'user-1', 'Dr. Silva', {
        action: 'update',
        resourceType: 'medical_record',
        resourceId: 'record-1',
        modifiedFields: ['diagnosis', 'notes'],
        previousValues: { diagnosis: 'Old' },
        newValues: { diagnosis: 'New' },
      });

      const callArgs = vi.mocked(addDoc).mock.calls[0][1];
      expect(callArgs).toMatchObject({
        clinicId: 'clinic-1',
        userId: 'user-1',
        userName: 'Dr. Silva',
        action: 'update',
        resourceType: 'medical_record',
        resourceId: 'record-1',
        modifiedFields: ['diagnosis', 'notes'],
      });
    });
  });

  describe('getResourceAuditLogs', () => {
    it('queries logs for a specific resource', async () => {
      const mockDocs = [
        createMockDoc('log-1', {
          action: 'view',
          resourceType: 'patient',
          resourceId: 'patient-1',
          userId: 'user-1',
          timestamp: { toDate: () => new Date() },
        }),
      ];
      vi.mocked(getDocs).mockResolvedValue({ docs: mockDocs } as never);

      const logs = await getResourceAuditLogs('clinic-1', 'patient', 'patient-1');

      expect(query).toHaveBeenCalled();
      expect(logs).toHaveLength(1);
      expect(logs[0].action).toBe('view');
    });

    it('respects maxResults limit', async () => {
      vi.mocked(getDocs).mockResolvedValue({ docs: [] } as never);

      await getResourceAuditLogs('clinic-1', 'patient', 'patient-1', 50);

      expect(query).toHaveBeenCalled();
    });
  });

  describe('getUserAuditLogs', () => {
    it('queries logs for a specific user', async () => {
      vi.mocked(getDocs).mockResolvedValue({ docs: [] } as never);

      await getUserAuditLogs('clinic-1', 'user-1');

      expect(query).toHaveBeenCalled();
    });
  });

  describe('getAuditLogsByAction', () => {
    it('queries logs by action type', async () => {
      vi.mocked(getDocs).mockResolvedValue({ docs: [] } as never);

      await getAuditLogsByAction('clinic-1', 'login');

      expect(query).toHaveBeenCalled();
    });
  });

  describe('recordConsent', () => {
    it('creates a consent record', async () => {
      const mockDocRef = { id: 'consent-123' };
      vi.mocked(addDoc).mockResolvedValue(mockDocRef as never);

      const result = await recordConsent('clinic-1', 'user-1', {
        purpose: 'healthcare_provision',
        dataCategories: ['identification', 'health'],
        status: 'granted',
      });

      expect(result).toBe('consent-123');
      expect(addDoc).toHaveBeenCalled();
    });

    it('logs consent grant action', async () => {
      const mockDocRef = { id: 'consent-123' };
      vi.mocked(addDoc).mockResolvedValue(mockDocRef as never);

      await recordConsent('clinic-1', 'user-1', {
        purpose: 'marketing',
        dataCategories: ['contact'],
        status: 'granted',
      });

      // Should be called twice: once for consent, once for audit log
      expect(addDoc).toHaveBeenCalledTimes(2);
    });

    it('logs consent withdraw action', async () => {
      const mockDocRef = { id: 'consent-123' };
      vi.mocked(addDoc).mockResolvedValue(mockDocRef as never);

      await recordConsent('clinic-1', 'user-1', {
        purpose: 'marketing',
        dataCategories: ['contact'],
        status: 'withdrawn',
      });

      expect(addDoc).toHaveBeenCalledTimes(2);
    });
  });

  describe('getUserConsents', () => {
    it('returns user consents', async () => {
      const mockDocs = [
        createMockDoc('consent-1', {
          userId: 'user-1',
          purpose: 'healthcare_provision',
          dataCategories: ['health'],
          status: 'granted',
          version: '1.0.0',
          createdAt: { toDate: () => new Date() },
          updatedAt: { toDate: () => new Date() },
        }),
      ];
      vi.mocked(getDocs).mockResolvedValue({ docs: mockDocs } as never);

      const consents = await getUserConsents('clinic-1', 'user-1');

      expect(consents).toHaveLength(1);
      expect(consents[0].purpose).toBe('healthcare_provision');
    });
  });

  describe('updateConsentStatus', () => {
    it('updates consent to granted', async () => {
      await updateConsentStatus('clinic-1', 'consent-1', 'granted');

      expect(updateDoc).toHaveBeenCalled();
    });

    it('updates consent to withdrawn', async () => {
      await updateConsentStatus('clinic-1', 'consent-1', 'withdrawn');

      expect(updateDoc).toHaveBeenCalled();
    });
  });

  describe('hasValidConsent', () => {
    it('returns true when valid consent exists', async () => {
      const mockDocs = [
        createMockDoc('consent-1', {
          status: 'granted',
          expiresAt: null,
        }),
      ];
      vi.mocked(getDocs).mockResolvedValue({
        empty: false,
        docs: mockDocs,
      } as never);

      const hasConsent = await hasValidConsent(
        'clinic-1',
        'user-1',
        'healthcare_provision'
      );

      expect(hasConsent).toBe(true);
    });

    it('returns false when no consent exists', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        empty: true,
        docs: [],
      } as never);

      const hasConsent = await hasValidConsent(
        'clinic-1',
        'user-1',
        'marketing'
      );

      expect(hasConsent).toBe(false);
    });

    it('returns false when consent is expired', async () => {
      const expiredDate = new Date(Date.now() - 86400000); // Yesterday
      const mockDocs = [
        createMockDoc('consent-1', {
          status: 'granted',
          expiresAt: { toDate: () => expiredDate },
        }),
      ];
      vi.mocked(getDocs).mockResolvedValue({
        empty: false,
        docs: mockDocs,
      } as never);

      const hasConsent = await hasValidConsent(
        'clinic-1',
        'user-1',
        'marketing'
      );

      expect(hasConsent).toBe(false);
    });
  });

  describe('createDataExportRequest', () => {
    it('creates a data export request', async () => {
      const mockDocRef = { id: 'request-123' };
      vi.mocked(addDoc).mockResolvedValue(mockDocRef as never);

      const result = await createDataExportRequest('clinic-1', 'user-1', {
        type: 'access',
        dataCategories: ['identification', 'health'],
        format: 'pdf',
      });

      expect(result).toBe('request-123');
      expect(addDoc).toHaveBeenCalled();
    });

    it('logs the data request action', async () => {
      const mockDocRef = { id: 'request-123' };
      vi.mocked(addDoc).mockResolvedValue(mockDocRef as never);

      await createDataExportRequest('clinic-1', 'user-1', {
        type: 'portability',
        dataCategories: ['health'],
        format: 'json',
        reason: 'Mudando de clínica',
      });

      // Should be called twice: once for request, once for audit log
      expect(addDoc).toHaveBeenCalledTimes(2);
    });
  });

  describe('getDataExportRequest', () => {
    it('returns request when found', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: 'request-1',
        data: () => ({
          clinicId: 'clinic-1',
          userId: 'user-1',
          type: 'access',
          status: 'pending',
          dataCategories: ['health'],
          format: 'pdf',
          createdAt: { toDate: () => new Date() },
        }),
      } as never);

      const request = await getDataExportRequest('clinic-1', 'request-1');

      expect(request).not.toBeNull();
      expect(request?.type).toBe('access');
    });

    it('returns null when not found', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as never);

      const request = await getDataExportRequest('clinic-1', 'nonexistent');

      expect(request).toBeNull();
    });
  });

  describe('getUserExportRequests', () => {
    it('returns user export requests', async () => {
      const mockDocs = [
        createMockDoc('request-1', {
          clinicId: 'clinic-1',
          userId: 'user-1',
          type: 'access',
          status: 'completed',
          dataCategories: ['health'],
          format: 'pdf',
          downloadUrl: 'https://example.com/download',
          createdAt: { toDate: () => new Date() },
          completedAt: { toDate: () => new Date() },
        }),
      ];
      vi.mocked(getDocs).mockResolvedValue({ docs: mockDocs } as never);

      const requests = await getUserExportRequests('clinic-1', 'user-1');

      expect(requests).toHaveLength(1);
      expect(requests[0].status).toBe('completed');
    });
  });

  describe('updateExportRequestStatus', () => {
    it('updates request status', async () => {
      await updateExportRequestStatus('clinic-1', 'request-1', 'processing');

      expect(updateDoc).toHaveBeenCalled();
    });

    it('updates with download URL when completed', async () => {
      await updateExportRequestStatus(
        'clinic-1',
        'request-1',
        'completed',
        'https://example.com/download'
      );

      const updateCall = vi.mocked(updateDoc).mock.calls[0][1];
      expect(updateCall).toMatchObject({
        status: 'completed',
        downloadUrl: 'https://example.com/download',
      });
    });
  });
});

// Helper to create mock Firestore documents
function createMockDoc(
  id: string,
  data: DocumentData
): QueryDocumentSnapshot<DocumentData> {
  return {
    id,
    data: () => data,
    exists: () => true,
  } as QueryDocumentSnapshot<DocumentData>;
}

