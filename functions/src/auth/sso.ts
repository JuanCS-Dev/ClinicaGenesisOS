/**
 * SSO Configuration Cloud Functions
 *
 * Provides endpoints for SSO/SAML configuration and lookup.
 * Works with Firebase Identity Platform SAML providers.
 *
 * @module functions/auth/sso
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

const REGION = 'southamerica-east1'

export interface SSOConfig {
  enabled: boolean
  providerId?: string
  providerName?: string
  domains?: string[]
}

interface ClinicSSOSettings {
  ssoEnabled: boolean
  ssoProviderId: string
  ssoProviderName: string
  ssoDomains: string[]
  ssoIdpEntityId?: string
  ssoSsoUrl?: string
  ssoSpEntityId?: string
}

/**
 * Get SSO configuration for a clinic by clinic ID
 */
export const getClinicSSOConfig = onCall(
  {
    region: REGION,
    maxInstances: 10,
  },
  async (request): Promise<SSOConfig> => {
    const { clinicId } = request.data as { clinicId?: string }

    if (!clinicId) {
      throw new HttpsError('invalid-argument', 'Clinic ID is required')
    }

    const db = getFirestore()
    const clinicDoc = await db.doc(`clinics/${clinicId}`).get()

    if (!clinicDoc.exists) {
      return { enabled: false }
    }

    const clinicData = clinicDoc.data() as ClinicSSOSettings | undefined

    if (!clinicData?.ssoEnabled || !clinicData.ssoProviderId) {
      return { enabled: false }
    }

    return {
      enabled: true,
      providerId: clinicData.ssoProviderId,
      providerName: clinicData.ssoProviderName,
      domains: clinicData.ssoDomains,
    }
  }
)

/**
 * Get SSO configuration by email domain
 * Used for auto-detection when user enters their email
 */
export const getSSOConfigByDomain = onCall(
  {
    region: REGION,
    maxInstances: 10,
  },
  async (request): Promise<SSOConfig> => {
    const { domain } = request.data as { domain?: string }

    if (!domain) {
      throw new HttpsError('invalid-argument', 'Domain is required')
    }

    const db = getFirestore()

    // Find clinic with this SSO domain
    const clinicsQuery = await db
      .collection('clinics')
      .where('ssoEnabled', '==', true)
      .where('ssoDomains', 'array-contains', domain.toLowerCase())
      .limit(1)
      .get()

    if (clinicsQuery.empty) {
      return { enabled: false }
    }

    const clinicData = clinicsQuery.docs[0].data() as ClinicSSOSettings

    return {
      enabled: true,
      providerId: clinicData.ssoProviderId,
      providerName: clinicData.ssoProviderName,
      domains: clinicData.ssoDomains,
    }
  }
)

/**
 * Configure SAML provider for a clinic (admin only)
 * This creates/updates the SAML provider in Firebase Auth
 */
export const configureSAMLProvider = onCall(
  {
    region: REGION,
    maxInstances: 5,
  },
  async request => {
    // Verify admin/owner
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required')
    }

    const claims = request.auth.token
    if (claims.role !== 'owner') {
      throw new HttpsError('permission-denied', 'Only clinic owners can configure SSO')
    }

    const { clinicId, displayName, idpEntityId, ssoURL, x509Certificates, domains } =
      request.data as {
        clinicId: string
        displayName: string
        idpEntityId: string
        ssoURL: string
        x509Certificates: string[]
        domains: string[]
      }

    if (!clinicId || !displayName || !idpEntityId || !ssoURL || !x509Certificates?.length) {
      throw new HttpsError('invalid-argument', 'Missing required SSO configuration')
    }

    const providerId = `saml.genesis-clinic-${clinicId}`
    const spEntityId = `urn:genesis:clinic:${clinicId}`
    const callbackURL = `https://clinicagenesis.app/__/auth/handler`

    const db = getFirestore()
    const authAdmin = getAuth()

    try {
      // Check if provider exists
      const existingProviders = await authAdmin.listProviderConfigs({
        type: 'saml',
        maxResults: 100,
      })

      const existingProvider = existingProviders.providerConfigs.find(
        p => p.providerId === providerId
      )

      const providerConfig = {
        displayName,
        enabled: true,
        idpEntityId,
        ssoURL,
        x509Certificates,
        rpEntityId: spEntityId,
        callbackURL,
      }

      if (existingProvider) {
        // Update existing provider
        await authAdmin.updateProviderConfig(providerId, providerConfig)
      } else {
        // Create new provider
        await authAdmin.createProviderConfig({
          providerId,
          ...providerConfig,
        })
      }

      // Update clinic document with SSO settings
      await db.doc(`clinics/${clinicId}`).update({
        ssoEnabled: true,
        ssoProviderId: providerId,
        ssoProviderName: displayName,
        ssoDomains: domains.map(d => d.toLowerCase()),
        ssoIdpEntityId: idpEntityId,
        ssoSsoUrl: ssoURL,
        ssoSpEntityId: spEntityId,
        ssoConfiguredAt: new Date().toISOString(),
        ssoConfiguredBy: request.auth.uid,
      })

      return {
        success: true,
        providerId,
        spEntityId,
        callbackURL,
      }
    } catch (error) {
      console.error('Error configuring SAML provider:', error)
      throw new HttpsError(
        'internal',
        error instanceof Error ? error.message : 'Failed to configure SSO'
      )
    }
  }
)

/**
 * Disable SSO for a clinic (admin only)
 */
export const disableSSO = onCall(
  {
    region: REGION,
    maxInstances: 5,
  },
  async request => {
    // Verify admin/owner
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required')
    }

    const claims = request.auth.token
    if (claims.role !== 'owner') {
      throw new HttpsError('permission-denied', 'Only clinic owners can disable SSO')
    }

    const { clinicId } = request.data as { clinicId: string }

    if (!clinicId) {
      throw new HttpsError('invalid-argument', 'Clinic ID is required')
    }

    const db = getFirestore()

    // Get clinic to find provider ID
    const clinicDoc = await db.doc(`clinics/${clinicId}`).get()
    const clinicData = clinicDoc.data() as ClinicSSOSettings | undefined

    if (clinicData?.ssoProviderId) {
      try {
        // Disable the provider (don't delete, in case they want to re-enable)
        const authAdmin = getAuth()
        await authAdmin.updateProviderConfig(clinicData.ssoProviderId, {
          enabled: false,
        })
      } catch (error) {
        // Provider might not exist, continue anyway
        console.warn('Could not disable SAML provider:', error)
      }
    }

    // Update clinic document
    await db.doc(`clinics/${clinicId}`).update({
      ssoEnabled: false,
      ssoDisabledAt: new Date().toISOString(),
      ssoDisabledBy: request.auth.uid,
    })

    return { success: true }
  }
)
