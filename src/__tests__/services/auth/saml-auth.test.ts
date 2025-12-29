/**
 * SAML Auth Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { isUserFromSSO, getSSOProviderName } from '@/services/auth/saml-auth'

// Mock firebase/auth
vi.mock('firebase/auth', () => ({
  signInWithPopup: vi.fn(),
  signInWithRedirect: vi.fn(),
  SAMLAuthProvider: vi.fn().mockImplementation((providerId: string) => ({
    providerId,
  })),
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
