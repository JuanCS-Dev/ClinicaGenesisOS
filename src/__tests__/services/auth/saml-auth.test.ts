/**
 * SAML Auth Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  isUserFromSSO,
  getSSOProviderName,
  signInWithSAML,
  getClinicSSOConfig,
  getSSOConfigByDomain,
} from '@/services/auth/saml-auth'

// Mock firebase/auth
const mockSignInWithPopup = vi.fn()
const mockSignInWithRedirect = vi.fn()

vi.mock('firebase/auth', () => {
  class MockSAMLAuthProvider {
    providerId: string
    constructor(providerId: string) {
      this.providerId = providerId
    }
  }

  return {
    signInWithPopup: vi.fn((...args) => mockSignInWithPopup(...args)),
    signInWithRedirect: vi.fn((...args) => mockSignInWithRedirect(...args)),
    SAMLAuthProvider: MockSAMLAuthProvider,
  }
})

// Mock firebase/functions
const mockHttpsCallable = vi.fn()
vi.mock('firebase/functions', () => ({
  httpsCallable: vi.fn(() => mockHttpsCallable),
}))

// Mock firebase services
vi.mock('@/services/firebase', () => ({
  auth: {
    currentUser: null,
  },
  functions: {},
}))

describe('SAML Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('signInWithSAML', () => {
    it('should sign in with popup by default', async () => {
      mockSignInWithPopup.mockResolvedValue({ user: { uid: 'user-123' } })

      await signInWithSAML('saml.azure-ad')

      expect(mockSignInWithPopup).toHaveBeenCalled()
      expect(mockSignInWithRedirect).not.toHaveBeenCalled()
    })

    it('should sign in with redirect when useRedirect is true', async () => {
      mockSignInWithRedirect.mockResolvedValue(undefined)

      await signInWithSAML('saml.azure-ad', true)

      expect(mockSignInWithRedirect).toHaveBeenCalled()
      expect(mockSignInWithPopup).not.toHaveBeenCalled()
    })

    it('should throw user-friendly error when popup closed by user', async () => {
      mockSignInWithPopup.mockRejectedValue({ code: 'auth/popup-closed-by-user' })

      await expect(signInWithSAML('saml.azure-ad')).rejects.toThrow('Login cancelado pelo usuário')
    })

    it('should fallback to redirect when popup blocked', async () => {
      mockSignInWithPopup.mockRejectedValue({ code: 'auth/popup-blocked' })
      mockSignInWithRedirect.mockResolvedValue(undefined)

      await signInWithSAML('saml.azure-ad')

      expect(mockSignInWithRedirect).toHaveBeenCalled()
    })

    it('should throw error for invalid credentials', async () => {
      mockSignInWithPopup.mockRejectedValue({ code: 'auth/invalid-credential' })

      await expect(signInWithSAML('saml.azure-ad')).rejects.toThrow(
        'Credenciais inválidas. Contate o administrador do SSO.'
      )
    })

    it('should throw error when SSO not allowed', async () => {
      mockSignInWithPopup.mockRejectedValue({ code: 'auth/operation-not-allowed' })

      await expect(signInWithSAML('saml.azure-ad')).rejects.toThrow(
        'SSO não está habilitado para esta clínica.'
      )
    })

    it('should throw generic error for other errors', async () => {
      mockSignInWithPopup.mockRejectedValue({
        code: 'auth/unknown-error',
        message: 'Custom error message',
      })

      await expect(signInWithSAML('saml.azure-ad')).rejects.toThrow('Custom error message')
    })

    it('should throw default error when no message', async () => {
      mockSignInWithPopup.mockRejectedValue({ code: 'auth/unknown-error' })

      await expect(signInWithSAML('saml.azure-ad')).rejects.toThrow('Erro ao fazer login via SSO')
    })
  })

  describe('getClinicSSOConfig', () => {
    it('should return SSO config from cloud function', async () => {
      const mockConfig = {
        enabled: true,
        providerId: 'saml.azure-ad',
        providerName: 'Azure AD',
        domains: ['company.com'],
      }
      mockHttpsCallable.mockResolvedValue({ data: mockConfig })

      const config = await getClinicSSOConfig('clinic-123')

      expect(config).toEqual(mockConfig)
    })

    it('should return disabled config on error', async () => {
      mockHttpsCallable.mockRejectedValue(new Error('Function error'))

      const config = await getClinicSSOConfig('clinic-123')

      expect(config).toEqual({ enabled: false })
    })
  })

  describe('getSSOConfigByDomain', () => {
    it('should return SSO config for domain', async () => {
      const mockConfig = {
        enabled: true,
        providerId: 'saml.azure-ad',
        providerName: 'Azure AD',
      }
      mockHttpsCallable.mockResolvedValue({ data: mockConfig })

      const config = await getSSOConfigByDomain('company.com')

      expect(config).toEqual(mockConfig)
    })

    it('should return disabled config on error', async () => {
      mockHttpsCallable.mockRejectedValue(new Error('Function error'))

      const config = await getSSOConfigByDomain('unknown.com')

      expect(config).toEqual({ enabled: false })
    })
  })

  describe('isUserFromSSO', () => {
    it('returns false when no user is logged in', async () => {
      const { auth } = await import('@/services/firebase')
      auth.currentUser = null

      expect(isUserFromSSO()).toBe(false)
    })

    it('returns false when user has no SAML provider', async () => {
      const { auth } = await import('@/services/firebase')
      auth.currentUser = {
        providerData: [{ providerId: 'google.com' }, { providerId: 'password' }],
      } as unknown as typeof auth.currentUser

      expect(isUserFromSSO()).toBe(false)
    })

    it('returns true when user has SAML provider', async () => {
      const { auth } = await import('@/services/firebase')
      auth.currentUser = {
        providerData: [{ providerId: 'saml.azure-ad-clinic-xyz' }],
      } as unknown as typeof auth.currentUser

      expect(isUserFromSSO()).toBe(true)
    })
  })

  describe('getSSOProviderName', () => {
    it('returns null when no user is logged in', async () => {
      const { auth } = await import('@/services/firebase')
      auth.currentUser = null

      expect(getSSOProviderName()).toBeNull()
    })

    it('returns null when user has no SAML provider', async () => {
      const { auth } = await import('@/services/firebase')
      auth.currentUser = {
        providerData: [{ providerId: 'google.com' }],
      } as unknown as typeof auth.currentUser

      expect(getSSOProviderName()).toBeNull()
    })

    it('returns SAML provider ID when user has one', async () => {
      const { auth } = await import('@/services/firebase')
      auth.currentUser = {
        providerData: [{ providerId: 'saml.okta-clinic-abc' }],
      } as unknown as typeof auth.currentUser

      expect(getSSOProviderName()).toBe('saml.okta-clinic-abc')
    })
  })
})
