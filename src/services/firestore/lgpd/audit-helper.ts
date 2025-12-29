/**
 * Audit Helper
 *
 * Simplified interface for audit logging in services.
 * Wraps the audit service with common patterns.
 *
 * @module services/firestore/lgpd/audit-helper
 */

import { logAuditEvent } from './audit'
import type { AuditAction, AuditResourceType, CreateAuditLogInput } from '@/types/lgpd'

/**
 * User context for audit logging.
 */
export interface AuditUserContext {
  userId: string
  userName: string
  clinicId: string
}

/**
 * Audit helper for simplified logging.
 */
export const auditHelper = {
  /**
   * Log a view/access event.
   */
  async logView(
    ctx: AuditUserContext,
    resourceType: AuditResourceType,
    resourceId: string,
    details?: Record<string, unknown>
  ): Promise<void> {
    await logAuditEvent(ctx.clinicId, ctx.userId, ctx.userName, {
      action: 'view',
      resourceType,
      resourceId,
      details,
    })
  },

  /**
   * Log a create event.
   */
  async logCreate(
    ctx: AuditUserContext,
    resourceType: AuditResourceType,
    resourceId: string,
    newValues?: Record<string, unknown>
  ): Promise<void> {
    await logAuditEvent(ctx.clinicId, ctx.userId, ctx.userName, {
      action: 'create',
      resourceType,
      resourceId,
      newValues,
    })
  },

  /**
   * Log an update event with before/after values.
   */
  async logUpdate(
    ctx: AuditUserContext,
    resourceType: AuditResourceType,
    resourceId: string,
    previousValues: Record<string, unknown>,
    newValues: Record<string, unknown>
  ): Promise<void> {
    const modifiedFields = Object.keys(newValues)

    await logAuditEvent(ctx.clinicId, ctx.userId, ctx.userName, {
      action: 'update',
      resourceType,
      resourceId,
      modifiedFields,
      previousValues,
      newValues,
    })
  },

  /**
   * Log a delete event.
   */
  async logDelete(
    ctx: AuditUserContext,
    resourceType: AuditResourceType,
    resourceId: string,
    previousValues?: Record<string, unknown>
  ): Promise<void> {
    await logAuditEvent(ctx.clinicId, ctx.userId, ctx.userName, {
      action: 'delete',
      resourceType,
      resourceId,
      previousValues,
    })
  },

  /**
   * Log a data export event.
   */
  async logExport(
    ctx: AuditUserContext,
    resourceType: AuditResourceType,
    resourceId: string,
    details?: Record<string, unknown>
  ): Promise<void> {
    await logAuditEvent(ctx.clinicId, ctx.userId, ctx.userName, {
      action: 'export',
      resourceType,
      resourceId,
      details,
    })
  },

  /**
   * Log a generic audit event.
   */
  async log(ctx: AuditUserContext, input: CreateAuditLogInput): Promise<void> {
    await logAuditEvent(ctx.clinicId, ctx.userId, ctx.userName, input)
  },
}
