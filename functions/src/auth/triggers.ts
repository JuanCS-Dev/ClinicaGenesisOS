/**
 * Authentication Triggers
 *
 * Firestore triggers for automatic claim management.
 *
 * @module functions/auth/triggers
 */

import { onDocumentCreated } from 'firebase-functions/v2/firestore'
import { logger } from 'firebase-functions'
import { setOwnerClaimsInternal } from './claims.js'

/**
 * Sets owner claims when a new clinic is created.
 *
 * This trigger automatically assigns the 'owner' role to the user
 * who created the clinic, ensuring they have full access.
 */
export const onClinicCreated = onDocumentCreated(
  {
    document: 'clinics/{clinicId}',
    region: 'southamerica-east1',
  },
  async event => {
    const snapshot = event.data
    if (!snapshot) {
      logger.error('No data in clinic creation event')
      return
    }

    const clinicId = event.params.clinicId
    const clinicData = snapshot.data()
    const ownerId = clinicData?.ownerId as string | undefined

    if (!ownerId) {
      logger.error('Clinic created without ownerId', { clinicId })
      return
    }

    try {
      await setOwnerClaimsInternal(ownerId, clinicId)
      logger.info('Owner claims set via trigger', { clinicId, ownerId })
    } catch (error) {
      logger.error('Failed to set owner claims', {
        clinicId,
        ownerId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
)
