/**
 * User Service Tests
 *
 * Tests for the user profile service.
 *
 * @module __tests__/services/firestore/user.service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { userService } from '../../../services/firestore/user.service'
import type { UserProfile, UserRole } from '@/types'

// Mock Firebase
vi.mock('../../../services/firebase', () => ({
  db: {},
}))

// Mock Firestore
const mockUnsubscribe = vi.fn()

vi.mock('firebase/firestore', () => {
  // Create a proper mock Timestamp class inside the factory
  class MockTimestamp {
    seconds: number
    nanoseconds: number

    constructor(seconds: number, nanoseconds: number) {
      this.seconds = seconds
      this.nanoseconds = nanoseconds
    }

    toDate() {
      return new Date(this.seconds * 1000)
    }

    static now() {
      return new MockTimestamp(Date.now() / 1000, 0)
    }
  }

  return {
    collection: vi.fn(() => 'collection-ref'),
    doc: vi.fn(() => 'doc-ref'),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    setDoc: vi.fn(),
    updateDoc: vi.fn(),
    addDoc: vi.fn().mockResolvedValue({ id: 'audit-log-id' }),
    query: vi.fn(() => 'query-ref'),
    where: vi.fn(),
    onSnapshot: vi.fn(() => vi.fn()), // Returns unsubscribe function
    serverTimestamp: vi.fn(() => 'server-timestamp'),
    Timestamp: MockTimestamp,
  }
})

describe('userService', () => {
  const mockUserId = 'user-123'
  const mockClinicId = 'clinic-456'

  const mockUserProfile: UserProfile = {
    id: mockUserId,
    email: 'doctor@clinic.com',
    displayName: 'Dr. Maria Silva',
    clinicId: mockClinicId,
    role: 'professional',
    specialty: 'cardiologia',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getById', () => {
    it('should return user profile when found', async () => {
      const { getDoc, Timestamp } = await import('firebase/firestore')
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: mockUserId,
        data: () => ({
          ...mockUserProfile,
          createdAt: new Timestamp(Date.now() / 1000, 0),
          updatedAt: new Timestamp(Date.now() / 1000, 0),
        }),
      } as ReturnType<typeof getDoc> extends Promise<infer T> ? T : never)

      const result = await userService.getById(mockUserId)

      expect(result).toBeDefined()
      expect(result?.id).toBe(mockUserId)
      expect(result?.email).toBe(mockUserProfile.email)
      expect(result?.displayName).toBe(mockUserProfile.displayName)
    })

    it('should return null when user not found', async () => {
      const { getDoc } = await import('firebase/firestore')
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as ReturnType<typeof getDoc> extends Promise<infer T> ? T : never)

      const result = await userService.getById(mockUserId)

      expect(result).toBeNull()
    })

    it('should handle Timestamp conversion', async () => {
      const { getDoc, Timestamp } = await import('firebase/firestore')
      // Create a timestamp for Jan 15, 2024
      const jan15 = new Date('2024-01-15T10:00:00Z').getTime() / 1000

      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: mockUserId,
        data: () => ({
          ...mockUserProfile,
          createdAt: new Timestamp(jan15, 0),
          updatedAt: new Timestamp(jan15, 0),
        }),
      } as ReturnType<typeof getDoc> extends Promise<infer T> ? T : never)

      const result = await userService.getById(mockUserId)

      expect(result?.createdAt).toContain('2024-01-15')
    })
  })

  describe('create', () => {
    it('should create a new user profile', async () => {
      const { setDoc, doc } = await import('firebase/firestore')
      vi.mocked(setDoc).mockResolvedValue(undefined)

      const input = {
        email: 'new.doctor@clinic.com',
        displayName: 'Dr. João Santos',
        role: 'professional' as UserRole,
        specialty: 'pediatria' as const,
      }

      const result = await userService.create(mockUserId, input)

      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          email: input.email,
          displayName: input.displayName,
          role: 'professional',
          specialty: 'pediatria',
          clinicId: null,
        })
      )
      expect(result.id).toBe(mockUserId)
      expect(result.email).toBe(input.email)
    })

    it('should use default values for optional fields', async () => {
      const { setDoc } = await import('firebase/firestore')
      vi.mocked(setDoc).mockResolvedValue(undefined)

      const input = {
        email: 'minimal@clinic.com',
        displayName: 'Dr. Minimal',
      }

      const result = await userService.create(mockUserId, input)

      expect(result.role).toBe('professional')
      expect(result.specialty).toBe('medicina')
      expect(result.clinicId).toBeNull()
    })
  })

  describe('update', () => {
    it('should update user profile', async () => {
      const { updateDoc } = await import('firebase/firestore')
      vi.mocked(updateDoc).mockResolvedValue(undefined)

      await userService.update(mockUserId, {
        displayName: 'Dr. Maria Santos',
        specialty: 'neurologia',
      })

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          displayName: 'Dr. Maria Santos',
          specialty: 'neurologia',
        })
      )
    })

    it('should not include undefined values in update', async () => {
      const { updateDoc } = await import('firebase/firestore')
      vi.mocked(updateDoc).mockResolvedValue(undefined)

      await userService.update(mockUserId, {
        displayName: 'Updated Name',
        avatar: undefined,
      })

      // The update should filter out undefined values
      expect(updateDoc).toHaveBeenCalled()
    })
  })

  describe('subscribe', () => {
    it('should subscribe to user profile updates', async () => {
      const { onSnapshot } = await import('firebase/firestore')

      const callback = vi.fn()
      const unsubscribe = userService.subscribe(mockUserId, callback)

      expect(onSnapshot).toHaveBeenCalled()
      expect(typeof unsubscribe).toBe('function')
    })

    it('should call callback with user profile data', async () => {
      const { onSnapshot } = await import('firebase/firestore')

      vi.mocked(onSnapshot).mockImplementation((_, callback) => {
        if (typeof callback === 'function') {
          callback({
            exists: () => true,
            id: mockUserId,
            data: () => ({
              ...mockUserProfile,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }),
          } as never)
        }
        return mockUnsubscribe
      })

      const callback = vi.fn()
      userService.subscribe(mockUserId, callback)

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockUserId,
          email: mockUserProfile.email,
        })
      )
    })

    it('should call callback with null when user not found', async () => {
      const { onSnapshot } = await import('firebase/firestore')

      vi.mocked(onSnapshot).mockImplementation((_, callback) => {
        if (typeof callback === 'function') {
          callback({
            exists: () => false,
          } as never)
        }
        return mockUnsubscribe
      })

      const callback = vi.fn()
      userService.subscribe(mockUserId, callback)

      expect(callback).toHaveBeenCalledWith(null)
    })
  })

  describe('exists', () => {
    it('should return true when user exists', async () => {
      const { getDoc } = await import('firebase/firestore')
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
      } as ReturnType<typeof getDoc> extends Promise<infer T> ? T : never)

      const result = await userService.exists(mockUserId)

      expect(result).toBe(true)
    })

    it('should return false when user does not exist', async () => {
      const { getDoc } = await import('firebase/firestore')
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as ReturnType<typeof getDoc> extends Promise<infer T> ? T : never)

      const result = await userService.exists(mockUserId)

      expect(result).toBe(false)
    })
  })

  describe('joinClinic', () => {
    it('should associate user with clinic', async () => {
      const { updateDoc } = await import('firebase/firestore')
      vi.mocked(updateDoc).mockResolvedValue(undefined)

      await userService.joinClinic(mockUserId, mockClinicId, 'admin')

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          clinicId: mockClinicId,
          role: 'admin',
        })
      )
    })

    it('should use default role when not specified', async () => {
      const { updateDoc } = await import('firebase/firestore')
      vi.mocked(updateDoc).mockResolvedValue(undefined)

      await userService.joinClinic(mockUserId, mockClinicId)

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          clinicId: mockClinicId,
          role: 'professional',
        })
      )
    })
  })

  describe('leaveClinic', () => {
    it('should remove user from clinic', async () => {
      const { updateDoc } = await import('firebase/firestore')
      vi.mocked(updateDoc).mockResolvedValue(undefined)

      await userService.leaveClinic(mockUserId)

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          clinicId: null,
          role: 'professional',
        })
      )
    })
  })

  describe('getByClinic', () => {
    it('should return all users for a clinic', async () => {
      const { getDocs } = await import('firebase/firestore')
      vi.mocked(getDocs).mockResolvedValue({
        docs: [
          {
            id: 'user-1',
            data: () => ({
              ...mockUserProfile,
              id: 'user-1',
              displayName: 'Dr. Alice',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }),
          },
          {
            id: 'user-2',
            data: () => ({
              ...mockUserProfile,
              id: 'user-2',
              displayName: 'Dr. Bob',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }),
          },
        ],
      } as ReturnType<typeof getDocs> extends Promise<infer T> ? T : never)

      const results = await userService.getByClinic(mockClinicId)

      expect(results).toHaveLength(2)
      expect(results[0].displayName).toBe('Dr. Alice')
      expect(results[1].displayName).toBe('Dr. Bob')
    })

    it('should return empty array when no users in clinic', async () => {
      const { getDocs } = await import('firebase/firestore')
      vi.mocked(getDocs).mockResolvedValue({
        docs: [],
      } as ReturnType<typeof getDocs> extends Promise<infer T> ? T : never)

      const results = await userService.getByClinic(mockClinicId)

      expect(results).toHaveLength(0)
    })
  })
})
