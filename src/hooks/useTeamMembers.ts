/**
 * Team Members Hook
 *
 * Fetches and manages clinic team members with roles.
 * Integrates with Firebase Custom Claims for RBAC.
 *
 * @module hooks/useTeamMembers
 */

import { useState, useEffect, useCallback } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { db, functions } from '@/services/firebase'
import { useClinicContext } from '@/contexts/ClinicContext'
import type { UserRole } from '@/types/clinic/clinic'

export interface TeamMember {
  id: string
  email: string
  displayName: string
  role: UserRole
  specialty?: string
  avatar?: string
  createdAt: string
  lastActive?: string
}

interface SetClaimsResponse {
  success: boolean
  claimsUpdatedAt: number
}

interface RevokeClaimsResponse {
  success: boolean
  message?: string
}

interface UseTeamMembersReturn {
  members: TeamMember[]
  loading: boolean
  error: string | null
  updateRole: (userId: string, newRole: UserRole) => Promise<void>
  removeMember: (userId: string) => Promise<void>
  refresh: () => void
}

/**
 * Hook for managing clinic team members.
 */
export function useTeamMembers(): UseTeamMembersReturn {
  const { clinicId, userProfile } = useClinicContext()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch team members
  useEffect(() => {
    if (!clinicId) {
      setMembers([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const usersQuery = query(collection(db, 'users'), where('clinicId', '==', clinicId))

    const unsubscribe = onSnapshot(
      usersQuery,
      snapshot => {
        const teamMembers: TeamMember[] = snapshot.docs.map(docSnap => {
          const data = docSnap.data()
          return {
            id: docSnap.id,
            email: data.email || '',
            displayName: data.displayName || data.email?.split('@')[0] || 'Sem nome',
            role: data.role || 'receptionist',
            specialty: data.specialty,
            avatar: data.avatar,
            createdAt: data.createdAt || new Date().toISOString(),
            lastActive: data.lastActive,
          }
        })

        // Sort: owner first, then by role hierarchy, then alphabetically
        const roleOrder: Record<UserRole, number> = {
          owner: 0,
          admin: 1,
          professional: 2,
          receptionist: 3,
        }

        teamMembers.sort((a, b) => {
          const roleCompare = roleOrder[a.role] - roleOrder[b.role]
          if (roleCompare !== 0) return roleCompare
          return a.displayName.localeCompare(b.displayName)
        })

        setMembers(teamMembers)
        setLoading(false)
      },
      err => {
        console.error('Error fetching team members:', err)
        setError('Erro ao carregar equipe')
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [clinicId])

  /**
   * Update a team member's role.
   * Calls Cloud Function to set custom claims.
   */
  const updateRole = useCallback(
    async (userId: string, newRole: UserRole) => {
      if (!clinicId) throw new Error('Clinic not found')
      if (userProfile?.role !== 'owner') {
        throw new Error('Apenas o proprietário pode alterar roles')
      }

      // Cannot change owner role
      const targetMember = members.find(m => m.id === userId)
      if (targetMember?.role === 'owner') {
        throw new Error('Não é possível alterar o role do proprietário')
      }

      // Cannot assign owner role
      if (newRole === 'owner') {
        throw new Error('Não é possível atribuir role de proprietário')
      }

      const setUserClaims = httpsCallable<
        { targetUserId: string; clinicId: string; role: UserRole },
        SetClaimsResponse
      >(functions, 'setUserClaims')

      await setUserClaims({
        targetUserId: userId,
        clinicId,
        role: newRole,
      })
    },
    [clinicId, userProfile?.role, members]
  )

  /**
   * Remove a team member from the clinic.
   * Revokes their custom claims.
   */
  const removeMember = useCallback(
    async (userId: string) => {
      if (!clinicId) throw new Error('Clinic not found')
      if (userProfile?.role !== 'owner') {
        throw new Error('Apenas o proprietário pode remover membros')
      }

      const targetMember = members.find(m => m.id === userId)
      if (targetMember?.role === 'owner') {
        throw new Error('Não é possível remover o proprietário')
      }

      const revokeUserClaims = httpsCallable<{ targetUserId: string }, RevokeClaimsResponse>(
        functions,
        'revokeUserClaims'
      )

      await revokeUserClaims({ targetUserId: userId })
    },
    [clinicId, userProfile?.role, members]
  )

  const refresh = useCallback(() => {
    // Trigger re-fetch by updating state
    setLoading(true)
  }, [])

  return {
    members,
    loading,
    error,
    updateRole,
    removeMember,
    refresh,
  }
}
