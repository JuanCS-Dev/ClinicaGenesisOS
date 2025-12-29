/**
 * useTeamMembers Hook Tests
 *
 * Tests for the team members hook.
 *
 * @module __tests__/hooks/useTeamMembers
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useTeamMembers } from '../../hooks/useTeamMembers'
import { useClinicContext } from '../../contexts/ClinicContext'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import type { TeamMember } from '../../hooks/useTeamMembers'

vi.mock('../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(),
}))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  onSnapshot: vi.fn(),
}))

vi.mock('firebase/functions', () => ({
  httpsCallable: vi.fn(),
}))

vi.mock('../../services/firebase', () => ({
  db: {},
  functions: {},
}))

describe('useTeamMembers', () => {
  const mockClinicId = 'clinic-123'
  const mockUserProfile = { id: 'user-123', role: 'owner' }
  let mockUnsubscribe: ReturnType<typeof vi.fn>

  const mockMembers: TeamMember[] = [
    {
      id: 'user-1',
      email: 'owner@test.com',
      displayName: 'Owner',
      role: 'owner',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'user-2',
      email: 'admin@test.com',
      displayName: 'Admin User',
      role: 'admin',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'user-3',
      email: 'doctor@test.com',
      displayName: 'Dr. Silva',
      role: 'professional',
      specialty: 'Cardiologia',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'user-4',
      email: 'receptionist@test.com',
      displayName: 'Recepcionista',
      role: 'receptionist',
      createdAt: new Date().toISOString(),
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockUnsubscribe = vi.fn()

    vi.mocked(useClinicContext).mockReturnValue({
      clinicId: mockClinicId,
      userProfile: mockUserProfile,
    } as ReturnType<typeof useClinicContext>)

    vi.mocked(collection).mockReturnValue({} as ReturnType<typeof collection>)
    vi.mocked(query).mockReturnValue({} as ReturnType<typeof query>)
    vi.mocked(where).mockReturnValue({} as ReturnType<typeof where>)

    vi.mocked(onSnapshot).mockImplementation((_, onNext) => {
      setTimeout(() => {
        const mockSnapshot = {
          docs: mockMembers.map(member => ({
            id: member.id,
            data: () => ({
              email: member.email,
              displayName: member.displayName,
              role: member.role,
              specialty: member.specialty,
              avatar: member.avatar,
              createdAt: member.createdAt,
              lastActive: member.lastActive,
            }),
          })),
        }
        ;(onNext as (snapshot: typeof mockSnapshot) => void)(mockSnapshot)
      }, 0)
      return mockUnsubscribe
    })
  })

  describe('initialization', () => {
    it('should initialize with empty members', () => {
      vi.mocked(onSnapshot).mockReturnValue(mockUnsubscribe)

      const { result } = renderHook(() => useTeamMembers())

      expect(result.current.members).toEqual([])
      expect(result.current.loading).toBe(true)
    })

    it('should not subscribe without clinicId', () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
        userProfile: null,
      } as unknown as ReturnType<typeof useClinicContext>)

      const { result } = renderHook(() => useTeamMembers())

      expect(onSnapshot).not.toHaveBeenCalled()
      expect(result.current.members).toEqual([])
      expect(result.current.loading).toBe(false)
    })
  })

  describe('subscription', () => {
    it('should subscribe to team members', () => {
      renderHook(() => useTeamMembers())

      expect(collection).toHaveBeenCalled()
      expect(query).toHaveBeenCalled()
      expect(where).toHaveBeenCalledWith('clinicId', '==', mockClinicId)
      expect(onSnapshot).toHaveBeenCalled()
    })

    it('should unsubscribe on unmount', () => {
      const { unmount } = renderHook(() => useTeamMembers())

      unmount()

      expect(mockUnsubscribe).toHaveBeenCalled()
    })

    it('should receive members from subscription', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useTeamMembers())

      await act(async () => {
        vi.runAllTimers()
      })

      expect(result.current.members.length).toBe(4)
      expect(result.current.loading).toBe(false)

      vi.useRealTimers()
    })
  })

  describe('sorting', () => {
    it('should sort members by role hierarchy', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useTeamMembers())

      await act(async () => {
        vi.runAllTimers()
      })

      // Owner first, then admin, then professional, then receptionist
      expect(result.current.members[0].role).toBe('owner')
      expect(result.current.members[1].role).toBe('admin')
      expect(result.current.members[2].role).toBe('professional')
      expect(result.current.members[3].role).toBe('receptionist')

      vi.useRealTimers()
    })
  })

  describe('updateRole', () => {
    it('should call setUserClaims function', async () => {
      const mockSetUserClaims = vi.fn().mockResolvedValue({ data: { success: true } })
      vi.mocked(httpsCallable).mockReturnValue(mockSetUserClaims)

      vi.useFakeTimers()

      const { result } = renderHook(() => useTeamMembers())

      await act(async () => {
        vi.runAllTimers()
      })

      await act(async () => {
        await result.current.updateRole('user-2', 'professional')
      })

      expect(httpsCallable).toHaveBeenCalledWith(expect.anything(), 'setUserClaims')
      expect(mockSetUserClaims).toHaveBeenCalledWith({
        targetUserId: 'user-2',
        clinicId: mockClinicId,
        role: 'professional',
      })

      vi.useRealTimers()
    })

    it('should throw error if not owner', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: mockClinicId,
        userProfile: { id: 'user-123', role: 'admin' },
      } as ReturnType<typeof useClinicContext>)

      const { result } = renderHook(() => useTeamMembers())

      await expect(result.current.updateRole('user-3', 'admin')).rejects.toThrow(
        'Apenas o proprietário pode alterar roles'
      )
    })

    it('should throw error if trying to change owner role', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useTeamMembers())

      await act(async () => {
        vi.runAllTimers()
      })

      await expect(result.current.updateRole('user-1', 'admin')).rejects.toThrow(
        'Não é possível alterar o role do proprietário'
      )

      vi.useRealTimers()
    })

    it('should throw error if trying to assign owner role', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useTeamMembers())

      await act(async () => {
        vi.runAllTimers()
      })

      await expect(result.current.updateRole('user-2', 'owner')).rejects.toThrow(
        'Não é possível atribuir role de proprietário'
      )

      vi.useRealTimers()
    })

    it('should throw error without clinicId', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
        userProfile: mockUserProfile,
      } as unknown as ReturnType<typeof useClinicContext>)

      const { result } = renderHook(() => useTeamMembers())

      await expect(result.current.updateRole('user-2', 'admin')).rejects.toThrow('Clinic not found')
    })
  })

  describe('removeMember', () => {
    it('should call revokeUserClaims function', async () => {
      const mockRevokeUserClaims = vi.fn().mockResolvedValue({ data: { success: true } })
      vi.mocked(httpsCallable).mockReturnValue(mockRevokeUserClaims)

      vi.useFakeTimers()

      const { result } = renderHook(() => useTeamMembers())

      await act(async () => {
        vi.runAllTimers()
      })

      await act(async () => {
        await result.current.removeMember('user-3')
      })

      expect(httpsCallable).toHaveBeenCalledWith(expect.anything(), 'revokeUserClaims')
      expect(mockRevokeUserClaims).toHaveBeenCalledWith({
        targetUserId: 'user-3',
      })

      vi.useRealTimers()
    })

    it('should throw error if not owner', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: mockClinicId,
        userProfile: { id: 'user-123', role: 'admin' },
      } as ReturnType<typeof useClinicContext>)

      const { result } = renderHook(() => useTeamMembers())

      await expect(result.current.removeMember('user-3')).rejects.toThrow(
        'Apenas o proprietário pode remover membros'
      )
    })

    it('should throw error if trying to remove owner', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useTeamMembers())

      await act(async () => {
        vi.runAllTimers()
      })

      await expect(result.current.removeMember('user-1')).rejects.toThrow(
        'Não é possível remover o proprietário'
      )

      vi.useRealTimers()
    })

    it('should throw error without clinicId', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
        userProfile: mockUserProfile,
      } as unknown as ReturnType<typeof useClinicContext>)

      const { result } = renderHook(() => useTeamMembers())

      await expect(result.current.removeMember('user-2')).rejects.toThrow('Clinic not found')
    })
  })

  describe('refresh', () => {
    it('should set loading to true', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useTeamMembers())

      await act(async () => {
        vi.runAllTimers()
      })

      expect(result.current.loading).toBe(false)

      act(() => {
        result.current.refresh()
      })

      expect(result.current.loading).toBe(true)

      vi.useRealTimers()
    })
  })

  describe('error handling', () => {
    it('should handle subscription errors', async () => {
      vi.mocked(onSnapshot).mockImplementation((_, __, onError) => {
        setTimeout(() => {
          ;(onError as (error: Error) => void)(new Error('Firestore error'))
        }, 0)
        return mockUnsubscribe
      })

      vi.useFakeTimers()

      const { result } = renderHook(() => useTeamMembers())

      await act(async () => {
        vi.runAllTimers()
      })

      expect(result.current.error).toBe('Erro ao carregar equipe')
      expect(result.current.loading).toBe(false)

      vi.useRealTimers()
    })
  })
})
