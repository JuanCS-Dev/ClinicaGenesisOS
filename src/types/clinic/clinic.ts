/**
 * Clinic Types
 *
 * Core clinic entity and user roles.
 */

import type { ClinicPlan, ClinicSettings } from './settings'
import type { ClinicPixConfig } from '../payment'

/**
 * User roles within a clinic.
 */
export type UserRole = 'owner' | 'admin' | 'professional' | 'receptionist'

/**
 * Working hours entry.
 */
export interface WorkingHoursEntry {
  day: string
  hours: string
}

/**
 * Clinic entity representing a medical practice.
 * Root document in Firestore: /clinics/{clinicId}
 */
export interface Clinic {
  id: string
  name: string
  phone?: string
  email?: string
  address?: string
  logo?: string
  cnpj?: string
  /** CNES (Cadastro Nacional de Estabelecimentos de Saúde) for TISS billing */
  cnes?: string
  /** Subdomain for patient portal access (e.g., 'clinica-abc' for clinica-abc.clinicagenesis.com.br) */
  subdomain?: string
  ownerId: string
  plan: ClinicPlan
  settings: ClinicSettings
  /** PIX configuration for direct payments (0% fees) */
  pixConfig?: ClinicPixConfig
  createdAt: string
  updatedAt: string
  /** Public profile fields */
  coverImage?: string
  description?: string
  website?: string
  rating?: number
  reviewCount?: number
  foundedYear?: number
  specialties?: string[]
  services?: string[]
  workingHours?: WorkingHoursEntry[]
}

/**
 * Input type for creating a new clinic (without auto-generated fields).
 * plan and settings are optional as the service provides defaults.
 */
export type CreateClinicInput = Pick<Clinic, 'name'> &
  Partial<Omit<Clinic, 'id' | 'createdAt' | 'updatedAt' | 'ownerId' | 'name'>>
