/**
 * SAML Authentication Service
 *
 * Provides SSO/SAML authentication for enterprise customers.
 * Uses Firebase Identity Platform for SAML 2.0 support.
 *
 * @module services/auth/saml-auth
 */

import { signInWithPopup, SAMLAuthProvider, signInWithRedirect } from 'firebase/auth'
import { httpsCallable } from 'firebase/functions'
import { auth, functions } from '@/services/firebase'

/**
 * SSO configuration for a clinic
 */
export interface SSOConfig {
  enabled: boolean
  providerId?: string
  providerName?: string
  domains?: string[]
}

/**
 * Login via SAML (SSO corporativo)
 *
 * @param providerId - SAML provider ID (e.g., 'saml.azure-ad-clinic-xyz')
 * @param useRedirect - Use redirect instead of popup (for mobile)
 */
export async function signInWithSAML(providerId: string, useRedirect = false): Promise<void> {
  const provider = new SAMLAuthProvider(providerId)

  try {
    if (useRedirect) {
      await signInWithRedirect(auth, provider)
    } else {
      await signInWithPopup(auth, provider)
    }
  } catch (error) {
    const firebaseError = error as { code?: string; message?: string }

    if (firebaseError.code === 'auth/popup-closed-by-user') {
      throw new Error('Login cancelado pelo usuário')
    }

    if (firebaseError.code === 'auth/popup-blocked') {
      // Fallback to redirect
      await signInWithRedirect(auth, provider)
      return
    }

    if (firebaseError.code === 'auth/invalid-credential') {
      throw new Error('Credenciais inválidas. Contate o administrador do SSO.')
    }

    if (firebaseError.code === 'auth/operation-not-allowed') {
      throw new Error('SSO não está habilitado para esta clínica.')
    }

    throw new Error(firebaseError.message || 'Erro ao fazer login via SSO')
  }
}

/**
 * Get SSO configuration for a clinic by clinic ID
 */
export async function getClinicSSOConfig(clinicId: string): Promise<SSOConfig> {
  try {
    const getSSOConfigFn = httpsCallable<{ clinicId: string }, SSOConfig>(
      functions,
      'getClinicSSOConfig'
    )

    const result = await getSSOConfigFn({ clinicId })
    return result.data
  } catch {
    return { enabled: false }
  }
}

/**
 * Get SSO configuration by email domain
 * Used to auto-detect SSO when user enters their email
 */
export async function getSSOConfigByDomain(domain: string): Promise<SSOConfig> {
  try {
    const getSSOByDomainFn = httpsCallable<{ domain: string }, SSOConfig>(
      functions,
      'getSSOConfigByDomain'
    )

    const result = await getSSOByDomainFn({ domain })
    return result.data
  } catch {
    return { enabled: false }
  }
}

/**
 * Check if the current user was authenticated via SSO
 */
export function isUserFromSSO(): boolean {
  const user = auth.currentUser
  if (!user) return false

  // Check provider data for SAML
  return user.providerData.some(provider => provider.providerId.startsWith('saml.'))
}

/**
 * Get the SSO provider name for the current user
 */
export function getSSOProviderName(): string | null {
  const user = auth.currentUser
  if (!user) return null

  const samlProvider = user.providerData.find(provider => provider.providerId.startsWith('saml.'))

  return samlProvider?.providerId || null
}
