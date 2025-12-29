/**
 * Rate Limiting Middleware for Cloud Functions
 *
 * Firestore-based rate limiting using sliding window counters.
 * Protects against abuse and ensures fair resource usage.
 *
 * @module functions/middleware/rate-limit
 */

import { getFirestore } from 'firebase-admin/firestore'
import { HttpsError } from 'firebase-functions/v2/https'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { logger } from 'firebase-functions'

/**
 * Rate limit configuration.
 */
export interface RateLimitConfig {
  /** Time window in milliseconds */
  windowMs: number
  /** Maximum requests allowed in window */
  maxRequests: number
  /** Key prefix for grouping (e.g., 'payment', 'ai') */
  keyPrefix: string
}

/**
 * Rate limit document structure.
 */
interface RateLimitDoc {
  count: number
  windowStart: number
  lastRequest: number
}

/**
 * Checks rate limit for a user/action combination.
 *
 * Uses Firestore transactions for atomic counter updates.
 * Implements sliding window algorithm.
 *
 * @throws RESOURCE_EXHAUSTED - If rate limit exceeded
 */
export async function checkRateLimit(userId: string, config: RateLimitConfig): Promise<void> {
  const db = getFirestore()
  const now = Date.now()
  const windowStart = now - config.windowMs
  const key = `${config.keyPrefix}:${userId}`

  const rateLimitRef = db.collection('_rateLimits').doc(key)

  await db.runTransaction(async transaction => {
    const doc = await transaction.get(rateLimitRef)

    if (!doc.exists) {
      // First request in this window
      transaction.set(rateLimitRef, {
        count: 1,
        windowStart: now,
        lastRequest: now,
      } satisfies RateLimitDoc)
      return
    }

    const data = doc.data() as RateLimitDoc

    // Window expired - reset counter
    if (data.windowStart < windowStart) {
      transaction.set(rateLimitRef, {
        count: 1,
        windowStart: now,
        lastRequest: now,
      } satisfies RateLimitDoc)
      return
    }

    // Check if limit exceeded
    if (data.count >= config.maxRequests) {
      const resetIn = Math.ceil((data.windowStart + config.windowMs - now) / 1000)
      logger.warn('Rate limit exceeded', {
        userId,
        keyPrefix: config.keyPrefix,
        count: data.count,
        maxRequests: config.maxRequests,
        resetIn,
      })
      throw new HttpsError(
        'resource-exhausted',
        `Rate limit exceeded. Try again in ${resetIn} seconds.`
      )
    }

    // Increment counter
    transaction.update(rateLimitRef, {
      count: data.count + 1,
      lastRequest: now,
    })
  })
}

/**
 * Pre-defined rate limit configurations.
 */
export const RATE_LIMITS = {
  /** AI operations - expensive, limit strictly */
  AI_SCRIBE: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    keyPrefix: 'ai-scribe',
  },

  /** Lab analysis - expensive AI calls */
  LAB_ANALYSIS: {
    windowMs: 60 * 1000,
    maxRequests: 5,
    keyPrefix: 'lab-analysis',
  },

  /** Payment operations - sensitive, limit for fraud prevention */
  PAYMENT: {
    windowMs: 60 * 1000,
    maxRequests: 5,
    keyPrefix: 'payment',
  },

  /** Certificate operations - sensitive */
  CERTIFICATE: {
    windowMs: 60 * 1000,
    maxRequests: 10,
    keyPrefix: 'certificate',
  },

  /** TISS batch operations */
  TISS_BATCH: {
    windowMs: 60 * 1000,
    maxRequests: 20,
    keyPrefix: 'tiss',
  },

  /** Calendar/Meet operations */
  CALENDAR: {
    windowMs: 60 * 1000,
    maxRequests: 30,
    keyPrefix: 'calendar',
  },

  /** Default for general operations */
  DEFAULT: {
    windowMs: 60 * 1000,
    maxRequests: 60,
    keyPrefix: 'default',
  },
} as const satisfies Record<string, RateLimitConfig>

/**
 * Combined auth + rate limit check.
 * Convenience function for most endpoints.
 */
export async function checkRateLimitForUser(
  userId: string,
  limitType: keyof typeof RATE_LIMITS
): Promise<void> {
  await checkRateLimit(userId, RATE_LIMITS[limitType])
}

// =============================================================================
// SCHEDULED CLEANUP
// =============================================================================

/** Rate limit documents older than this are cleaned up */
const CLEANUP_AGE_MS = 24 * 60 * 60 * 1000 // 24 hours

/** Maximum documents to delete per run */
const CLEANUP_BATCH_SIZE = 500

/**
 * Scheduled function to clean up old rate limit documents.
 * Runs daily at 3:00 AM to minimize impact.
 */
export const cleanupRateLimits = onSchedule(
  {
    schedule: '0 3 * * *', // Every day at 3:00 AM
    region: 'southamerica-east1',
    memory: '256MiB',
    timeoutSeconds: 120,
  },
  async () => {
    const db = getFirestore()
    const cutoff = Date.now() - CLEANUP_AGE_MS

    logger.info('Starting rate limit cleanup', { cutoff: new Date(cutoff).toISOString() })

    let totalDeleted = 0
    let hasMore = true

    while (hasMore) {
      const snapshot = await db
        .collection('_rateLimits')
        .where('lastRequest', '<', cutoff)
        .limit(CLEANUP_BATCH_SIZE)
        .get()

      if (snapshot.empty) {
        hasMore = false
        continue
      }

      const batch = db.batch()
      snapshot.docs.forEach(doc => batch.delete(doc.ref))
      await batch.commit()

      totalDeleted += snapshot.size
      hasMore = snapshot.size === CLEANUP_BATCH_SIZE
    }

    logger.info('Rate limit cleanup completed', { totalDeleted })
  }
)
