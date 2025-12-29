/**
 * Audit Helper Tests
 *
 * Tests for the LGPD/HIPAA audit logging helper.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  auditHelper,
  type AuditUserContext,
} from '../../../../services/firestore/lgpd/audit-helper'
import * as auditModule from '../../../../services/firestore/lgpd/audit'

// Mock the audit module
vi.mock('../../../../services/firestore/lgpd/audit', () => ({
  logAuditEvent: vi.fn().mockResolvedValue(undefined),
}))

describe('auditHelper', () => {
  const mockContext: AuditUserContext = {
    userId: 'user-123',
    userName: 'Dr. Maria Santos',
    clinicId: 'clinic-456',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('logView', () => {
    it('should log view event with correct parameters', async () => {
      await auditHelper.logView(mockContext, 'patient', 'patient-789', {
        accessedFields: ['name', 'cpf', 'birthDate'],
      })

      expect(auditModule.logAuditEvent).toHaveBeenCalledWith(
        'clinic-456',
        'user-123',
        'Dr. Maria Santos',
        {
          action: 'view',
          resourceType: 'patient',
          resourceId: 'patient-789',
          details: {
            accessedFields: ['name', 'cpf', 'birthDate'],
          },
        }
      )
    })

    it('should log view event without details', async () => {
      await auditHelper.logView(mockContext, 'medical_record', 'record-123')

      expect(auditModule.logAuditEvent).toHaveBeenCalledWith(
        'clinic-456',
        'user-123',
        'Dr. Maria Santos',
        {
          action: 'view',
          resourceType: 'medical_record',
          resourceId: 'record-123',
          details: undefined,
        }
      )
    })
  })

  describe('logCreate', () => {
    it('should log create event with new values', async () => {
      const newPatient = {
        name: 'João Silva',
        email: 'joao@email.com',
        phone: '11999999999',
      }

      await auditHelper.logCreate(mockContext, 'patient', 'patient-new', newPatient)

      expect(auditModule.logAuditEvent).toHaveBeenCalledWith(
        'clinic-456',
        'user-123',
        'Dr. Maria Santos',
        {
          action: 'create',
          resourceType: 'patient',
          resourceId: 'patient-new',
          newValues: newPatient,
        }
      )
    })

    it('should log create event for medical records', async () => {
      await auditHelper.logCreate(mockContext, 'medical_record', 'record-new', {
        patientId: 'patient-123',
        recordType: 'soap',
        professional: 'Dr. Maria Santos',
      })

      expect(auditModule.logAuditEvent).toHaveBeenCalledWith(
        'clinic-456',
        'user-123',
        'Dr. Maria Santos',
        expect.objectContaining({
          action: 'create',
          resourceType: 'medical_record',
        })
      )
    })
  })

  describe('logUpdate', () => {
    it('should log update event with before and after values', async () => {
      const previousValues = { name: 'João Silva', phone: '11999999999' }
      const newValues = { name: 'João Silva Santos', phone: '11888888888' }

      await auditHelper.logUpdate(mockContext, 'patient', 'patient-789', previousValues, newValues)

      expect(auditModule.logAuditEvent).toHaveBeenCalledWith(
        'clinic-456',
        'user-123',
        'Dr. Maria Santos',
        {
          action: 'update',
          resourceType: 'patient',
          resourceId: 'patient-789',
          modifiedFields: ['name', 'phone'],
          previousValues,
          newValues,
        }
      )
    })

    it('should correctly identify modified fields', async () => {
      const previousValues = { status: 'Pendente' }
      const newValues = { status: 'Confirmado', notes: 'Confirmado pelo paciente' }

      await auditHelper.logUpdate(mockContext, 'appointment', 'apt-123', previousValues, newValues)

      expect(auditModule.logAuditEvent).toHaveBeenCalledWith(
        'clinic-456',
        'user-123',
        'Dr. Maria Santos',
        expect.objectContaining({
          modifiedFields: ['status', 'notes'],
        })
      )
    })
  })

  describe('logDelete', () => {
    it('should log delete event with previous values', async () => {
      const previousValues = {
        name: 'Paciente Teste',
        cpf: '12345678901',
        email: 'teste@email.com',
      }

      await auditHelper.logDelete(mockContext, 'patient', 'patient-deleted', previousValues)

      expect(auditModule.logAuditEvent).toHaveBeenCalledWith(
        'clinic-456',
        'user-123',
        'Dr. Maria Santos',
        {
          action: 'delete',
          resourceType: 'patient',
          resourceId: 'patient-deleted',
          previousValues,
        }
      )
    })

    it('should log delete event without previous values', async () => {
      await auditHelper.logDelete(mockContext, 'medical_record', 'record-deleted')

      expect(auditModule.logAuditEvent).toHaveBeenCalledWith(
        'clinic-456',
        'user-123',
        'Dr. Maria Santos',
        {
          action: 'delete',
          resourceType: 'medical_record',
          resourceId: 'record-deleted',
          previousValues: undefined,
        }
      )
    })
  })

  describe('logExport', () => {
    it('should log export event for LGPD data portability', async () => {
      await auditHelper.logExport(mockContext, 'patient', 'patient-789', {
        format: 'json',
        includesHealthData: true,
      })

      expect(auditModule.logAuditEvent).toHaveBeenCalledWith(
        'clinic-456',
        'user-123',
        'Dr. Maria Santos',
        {
          action: 'export',
          resourceType: 'patient',
          resourceId: 'patient-789',
          details: {
            format: 'json',
            includesHealthData: true,
          },
        }
      )
    })
  })

  describe('log (generic)', () => {
    it('should log generic event with custom input', async () => {
      await auditHelper.log(mockContext, {
        action: 'view',
        resourceType: 'prescription',
        resourceId: 'rx-123',
        details: { printed: true },
      })

      expect(auditModule.logAuditEvent).toHaveBeenCalledWith(
        'clinic-456',
        'user-123',
        'Dr. Maria Santos',
        {
          action: 'view',
          resourceType: 'prescription',
          resourceId: 'rx-123',
          details: { printed: true },
        }
      )
    })
  })
})
