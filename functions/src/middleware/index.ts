/**
 * Middleware Module
 *
 * Exports authentication and rate limiting middleware.
 *
 * @module functions/middleware
 */

export {
  // v2 style (onCall from v2/https)
  requireAuth,
  requireRole,
  requireClinicAccess,
  requireAuthAndClinic,
  requireAuthRoleAndClinic,
  type AuthenticatedRequest,
  // v1 style (functions.https.onCall)
  requireAuthV1,
  requireRoleV1,
  requireClinicAccessV1,
  requireAuthAndClinicV1,
  requireAuthRoleAndClinicV1,
  type ValidatedAuthContext,
} from './auth.js'

export {
  checkRateLimit,
  checkRateLimitForUser,
  cleanupRateLimits,
  RATE_LIMITS,
  type RateLimitConfig,
} from './rate-limit.js'

export {
  verifyWebhookSignature,
  validateWebhookRequest,
  generateWebhookSignature,
  type WebhookValidationResult,
} from './webhook-auth.js'
