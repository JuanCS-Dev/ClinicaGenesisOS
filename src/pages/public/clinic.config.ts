/**
 * Clinic Profile Configuration
 *
 * Type definitions for public clinic pages.
 * Data is fetched from Firestore via usePublicClinicData hook.
 */

import type { SpecialtyType } from '@/types'

// ============================================================================
// Types
// ============================================================================

export interface PublicClinic {
  id: string
  name: string
  slug: string
  description: string
  logo?: string
  coverImage?: string
  address: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
  }
  phone: string
  email: string
  website?: string
  specialties: SpecialtyType[]
  services: string[]
  workingHours: { day: string; hours: string }[]
  rating?: number
  reviewCount?: number
  foundedYear?: number
}

export interface ClinicProfessional {
  id: string
  name: string
  specialty: SpecialtyType
  avatar?: string
  bio?: string
  credentials?: string[]
}
