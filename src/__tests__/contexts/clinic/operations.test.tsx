/**
 * ClinicContext Operations Tests
 *
 * Tests for ClinicContext CRUD operations.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: vi.fn(() => ({
    user: { uid: 'user-123', email: 'test@example.com', displayName: 'Test User' },
    loading: false,
  })),
}))

// Mock the firestore services
vi.mock('@/services/firestore', () => ({
  userService: {
    getById: vi.fn(),
    create: vi.fn(),
    subscribe: vi.fn(),
    update: vi.fn(),
    joinClinic: vi.fn(),
  },
  clinicService: {
    create: vi.fn(),
    subscribe: vi.fn(),
    getById: vi.fn(),
    updateSettings: vi.fn(),
  },
  seedClinicData: vi.fn(),
}))

import { useClinicContext } from '@/contexts/ClinicContext'
import { userService, clinicService, seedClinicData } from '@/services/firestore'
import { useAuthContext } from '@/contexts/AuthContext'
import { mockUser, createMockUserProfile, createMockClinic, wrapper } from './setup'

describe('ClinicContext - Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Reset auth mock
    vi.mocked(useAuthContext).mockReturnValue({
      user: mockUser,
      loading: false,
    } as ReturnType<typeof useAuthContext>)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('createClinic', () => {
    beforeEach(() => {
      const profile = createMockUserProfile({ clinicId: undefined })
      vi.mocked(userService.getById).mockResolvedValue(profile)
    })

    it('creates clinic and associates user as owner', async () => {
      vi.mocked(clinicService.create).mockResolvedValue('new-clinic-id')
      vi.mocked(userService.joinClinic).mockResolvedValue()
      vi.mocked(seedClinicData).mockResolvedValue(undefined)

      const { result } = renderHook(() => useClinicContext(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let clinicId: string
      await act(async () => {
        clinicId = await result.current.createClinic({
          name: 'New Clinic',
          phone: '123456789',
        })
      })

      expect(clinicService.create).toHaveBeenCalledWith('user-123', {
        name: 'New Clinic',
        phone: '123456789',
      })
      expect(userService.joinClinic).toHaveBeenCalledWith('user-123', 'new-clinic-id', 'owner')
      expect(clinicId!).toBe('new-clinic-id')
    })

    it('seeds clinic data by default', async () => {
      vi.mocked(clinicService.create).mockResolvedValue('new-clinic-id')
      vi.mocked(userService.joinClinic).mockResolvedValue()
      vi.mocked(seedClinicData).mockResolvedValue(undefined)

      const { result } = renderHook(() => useClinicContext(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.createClinic({ name: 'Test' })
      })

      expect(seedClinicData).toHaveBeenCalledWith('new-clinic-id', 'Test User')
    })

    it('skips seed data when seedData is false', async () => {
      vi.mocked(clinicService.create).mockResolvedValue('new-clinic-id')
      vi.mocked(userService.joinClinic).mockResolvedValue()

      const { result } = renderHook(() => useClinicContext(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.createClinic({ name: 'Test' }, false)
      })

      expect(seedClinicData).not.toHaveBeenCalled()
    })

    it('throws when no user', async () => {
      vi.mocked(useAuthContext).mockReturnValue({
        user: null,
        loading: false,
      } as ReturnType<typeof useAuthContext>)

      const { result } = renderHook(() => useClinicContext(), { wrapper })

      await expect(result.current.createClinic({ name: 'Test' })).rejects.toThrow(
        'User must be logged in to create a clinic'
      )
    })
  })

  describe('updateClinicSettings', () => {
    it('updates clinic settings and refreshes data', async () => {
      const profile = createMockUserProfile({ clinicId: 'clinic-123' })
      const clinic = createMockClinic()
      const updatedClinic = createMockClinic({
        settings: { ...clinic.settings, defaultAppointmentDuration: 45 },
      })

      vi.mocked(userService.getById).mockResolvedValue(profile)
      vi.mocked(clinicService.getById)
        .mockResolvedValueOnce(clinic)
        .mockResolvedValueOnce(updatedClinic)
      vi.mocked(clinicService.updateSettings).mockResolvedValue()

      const { result } = renderHook(() => useClinicContext(), { wrapper })

      await waitFor(() => {
        expect(result.current.clinic).toBeTruthy()
      })

      await act(async () => {
        await result.current.updateClinicSettings({ defaultAppointmentDuration: 45 })
      })

      expect(clinicService.updateSettings).toHaveBeenCalledWith('clinic-123', {
        defaultAppointmentDuration: 45,
      })
      // Verify data was refreshed after update
      expect(clinicService.getById).toHaveBeenCalledTimes(2)
    })

    it('throws when no clinic', async () => {
      vi.mocked(useAuthContext).mockReturnValue({
        user: null,
        loading: false,
      } as ReturnType<typeof useAuthContext>)

      const { result } = renderHook(() => useClinicContext(), { wrapper })

      await expect(
        result.current.updateClinicSettings({ defaultAppointmentDuration: 45 })
      ).rejects.toThrow('No clinic to update')
    })
  })

  describe('updateUserProfile', () => {
    it('updates user profile and refreshes data', async () => {
      const profile = createMockUserProfile()
      const clinic = createMockClinic()
      const updatedProfile = createMockUserProfile({ displayName: 'New Name' })

      vi.mocked(userService.getById)
        .mockResolvedValueOnce(profile)
        .mockResolvedValueOnce(updatedProfile)
      vi.mocked(clinicService.getById).mockResolvedValue(clinic)
      vi.mocked(userService.update).mockResolvedValue()

      const { result } = renderHook(() => useClinicContext(), { wrapper })

      await waitFor(() => {
        expect(result.current.userProfile).toBeTruthy()
      })

      await act(async () => {
        await result.current.updateUserProfile({ displayName: 'New Name' })
      })

      expect(userService.update).toHaveBeenCalledWith('user-123', { displayName: 'New Name' })
      // Verify data was refreshed after update
      expect(userService.getById).toHaveBeenCalledTimes(2)
    })

    it('throws when no user', async () => {
      vi.mocked(useAuthContext).mockReturnValue({
        user: null,
        loading: false,
      } as ReturnType<typeof useAuthContext>)

      const { result } = renderHook(() => useClinicContext(), { wrapper })

      await expect(result.current.updateUserProfile({ displayName: 'Test' })).rejects.toThrow(
        'User must be logged in to update profile'
      )
    })
  })

  describe('refreshClinic', () => {
    it('refreshes clinic data', async () => {
      const profile = createMockUserProfile({ clinicId: 'clinic-123' })
      const clinic = createMockClinic()
      const updatedClinic = createMockClinic({ name: 'Updated Clinic' })

      vi.mocked(userService.getById).mockResolvedValue(profile)
      vi.mocked(clinicService.getById)
        .mockResolvedValueOnce(clinic)
        .mockResolvedValueOnce(updatedClinic)

      const { result } = renderHook(() => useClinicContext(), { wrapper })

      await waitFor(() => {
        expect(result.current.clinic).toBeTruthy()
      })

      await act(async () => {
        await result.current.refreshClinic()
      })

      expect(clinicService.getById).toHaveBeenCalledWith('clinic-123')
      expect(clinicService.getById).toHaveBeenCalledTimes(2)
    })

    it('does nothing when no clinicId', async () => {
      const profile = createMockUserProfile({ clinicId: undefined })

      vi.mocked(userService.getById).mockResolvedValue(profile)

      const { result } = renderHook(() => useClinicContext(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      vi.clearAllMocks()

      await act(async () => {
        await result.current.refreshClinic()
      })

      expect(clinicService.getById).not.toHaveBeenCalled()
    })
  })

  describe('refreshUserProfile', () => {
    it('refreshes user profile data', async () => {
      const profile = createMockUserProfile()
      const clinic = createMockClinic()
      const updatedProfile = createMockUserProfile({ displayName: 'Updated Name' })

      vi.mocked(userService.getById)
        .mockResolvedValueOnce(profile)
        .mockResolvedValueOnce(updatedProfile)
      vi.mocked(clinicService.getById).mockResolvedValue(clinic)

      const { result } = renderHook(() => useClinicContext(), { wrapper })

      await waitFor(() => {
        expect(result.current.userProfile).toBeTruthy()
      })

      await act(async () => {
        await result.current.refreshUserProfile()
      })

      expect(userService.getById).toHaveBeenCalledWith('user-123')
      expect(userService.getById).toHaveBeenCalledTimes(2)
    })

    it('does nothing when no user', async () => {
      vi.mocked(useAuthContext).mockReturnValue({
        user: null,
        loading: false,
      } as ReturnType<typeof useAuthContext>)

      const { result } = renderHook(() => useClinicContext(), { wrapper })

      vi.clearAllMocks()

      await act(async () => {
        await result.current.refreshUserProfile()
      })

      expect(userService.getById).not.toHaveBeenCalled()
    })
  })
})
