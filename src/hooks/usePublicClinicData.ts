/**
 * usePublicClinicData Hook
 *
 * Fetches public clinic data and professionals for booking pages.
 * No authentication required - uses clinicId/slug from URL.
 *
 * @module hooks/usePublicClinicData
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react'
import { clinicService } from '@/services/firestore/clinic.service'
import { userService } from '@/services/firestore/user.service'
import type { Clinic, UserProfile, SpecialtyType } from '@/types'

// ============================================================================
// Types
// ============================================================================

/**
 * Public-facing clinic info for booking pages.
 */
export interface PublicClinicInfo {
  id: string
  name: string
  address?: string
  phone?: string
  logo?: string
}

/**
 * Public-facing professional info for booking.
 */
export interface PublicProfessional {
  id: string
  name: string
  specialty: SpecialtyType
  bio?: string
  avatar?: string
  /** Computed availability info */
  nextAvailable?: string
}

/**
 * Return type for usePublicClinicData hook.
 */
export interface UsePublicClinicDataReturn {
  /** Clinic information */
  clinic: PublicClinicInfo | null
  /** List of professionals at the clinic */
  professionals: PublicProfessional[]
  /** Loading state */
  loading: boolean
  /** Error state */
  error: Error | null
  /** Whether clinic was found */
  notFound: boolean
  /** Refresh data manually */
  refresh: () => Promise<void>
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Convert Clinic to PublicClinicInfo.
 */
function toPublicClinicInfo(clinic: Clinic): PublicClinicInfo {
  return {
    id: clinic.id,
    name: clinic.name,
    address: clinic.address,
    phone: clinic.phone,
    logo: clinic.logo,
  }
}

/**
 * Convert UserProfile to PublicProfessional.
 */
function toPublicProfessional(user: UserProfile): PublicProfessional {
  return {
    id: user.id,
    name: user.displayName,
    specialty: user.specialty || 'medicina',
    avatar: user.avatar,
    // bio and nextAvailable would come from extended profile data
  }
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook for fetching public clinic data for booking pages.
 *
 * @param clinicSlug - The clinic slug/ID from URL
 * @returns Public clinic data and professionals
 *
 * @example
 * const { clinic, professionals, loading, notFound } = usePublicClinicData('clinica-genesis');
 */
export function usePublicClinicData(clinicSlug: string | undefined): UsePublicClinicDataReturn {
  const [clinic, setClinic] = useState<PublicClinicInfo | null>(null)
  const [professionals, setProfessionals] = useState<PublicProfessional[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [notFound, setNotFound] = useState(false)

  /**
   * Fetch clinic and professionals data.
   */
  const fetchData = useCallback(async () => {
    if (!clinicSlug) {
      setLoading(false)
      setNotFound(true)
      return
    }

    setLoading(true)
    setError(null)
    setNotFound(false)

    try {
      // For now, treat slug as clinicId
      // In future, could add getBySlug method to clinic.service
      const clinicData = await clinicService.getById(clinicSlug)

      if (!clinicData) {
        setClinic(null)
        setProfessionals([])
        setNotFound(true)
        return
      }

      setClinic(toPublicClinicInfo(clinicData))

      // Fetch professionals for this clinic
      const users = await userService.getByClinic(clinicSlug)

      // Filter to only show professionals (not receptionists/admins)
      const profs = users
        .filter(u => u.role === 'professional' || u.role === 'owner')
        .map(toPublicProfessional)

      setProfessionals(profs)
    } catch (err) {
      const fetchError = err instanceof Error ? err : new Error('Failed to fetch clinic data')
      setError(fetchError)
      console.error('Error fetching public clinic data:', fetchError)
    } finally {
      setLoading(false)
    }
  }, [clinicSlug])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    clinic,
    professionals,
    loading,
    error,
    notFound,
    refresh: fetchData,
  }
}
