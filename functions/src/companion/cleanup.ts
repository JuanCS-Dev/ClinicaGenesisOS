/**
 * Session Cleanup Function
 * ========================
 *
 * Scheduled function to clean up expired conversation sessions.
 * Runs periodically to maintain database hygiene.
 *
 * @module companion/cleanup
 */

import { onSchedule } from 'firebase-functions/v2/scheduler'
import { getFirestore } from 'firebase-admin/firestore'
import { logger } from 'firebase-functions'
import { getExpiredSessions, deleteSession } from './session-manager.js'

const BATCH_SIZE = 100

/**
 * Scheduled cleanup function.
 * Runs every hour to delete expired sessions.
 */
export const cleanupExpiredSessions = onSchedule(
  {
    schedule: 'every 1 hours',
    region: 'southamerica-east1',
    timeoutSeconds: 300,
    memory: '256MiB',
  },
  async () => {
    logger.info('Starting session cleanup')

    const db = getFirestore()
    let totalDeleted = 0

    try {
      // Get all clinic IDs
      const clinicsSnapshot = await db.collection('clinics').get()

      for (const clinicDoc of clinicsSnapshot.docs) {
        const clinicId = clinicDoc.id

        // Get expired sessions for this clinic
        const expiredSessions = await getExpiredSessions(clinicId, BATCH_SIZE)

        if (expiredSessions.length === 0) {
          continue
        }

        logger.info(`Found ${expiredSessions.length} expired sessions`, {
          clinicId,
        })

        // Delete each expired session
        for (const session of expiredSessions) {
          try {
            await deleteSession(clinicId, session.id)
            totalDeleted++
          } catch (error) {
            logger.error('Failed to delete session', {
              sessionId: session.id,
              clinicId,
              error: error instanceof Error ? error.message : 'Unknown error',
            })
          }
        }
      }

      logger.info('Session cleanup completed', {
        totalDeleted,
      })
    } catch (error) {
      logger.error('Session cleanup failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      throw error
    }
  }
)

/**
 * Cleanup old handoff records (older than 30 days).
 * Runs daily.
 */
export const cleanupOldHandoffs = onSchedule(
  {
    schedule: 'every 24 hours',
    region: 'southamerica-east1',
    timeoutSeconds: 300,
    memory: '256MiB',
  },
  async () => {
    logger.info('Starting handoff cleanup')

    const db = getFirestore()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const cutoffDate = thirtyDaysAgo.toISOString()

    let totalDeleted = 0

    try {
      const clinicsSnapshot = await db.collection('clinics').get()

      for (const clinicDoc of clinicsSnapshot.docs) {
        const clinicId = clinicDoc.id

        // Find old resolved handoffs
        const handoffsSnapshot = await db
          .collection('clinics')
          .doc(clinicId)
          .collection('handoffs')
          .where('status', '==', 'resolved')
          .where('resolvedAt', '<', cutoffDate)
          .limit(BATCH_SIZE)
          .get()

        if (handoffsSnapshot.empty) {
          continue
        }

        // Delete in batch
        const batch = db.batch()
        handoffsSnapshot.docs.forEach(doc => {
          batch.delete(doc.ref)
        })

        await batch.commit()
        totalDeleted += handoffsSnapshot.docs.length

        logger.info(`Deleted ${handoffsSnapshot.docs.length} old handoffs`, {
          clinicId,
        })
      }

      logger.info('Handoff cleanup completed', {
        totalDeleted,
      })
    } catch (error) {
      logger.error('Handoff cleanup failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      throw error
    }
  }
)
