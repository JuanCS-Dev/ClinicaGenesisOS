/**
 * FHIR Types for Cloud Functions
 *
 * Internal types used by FHIR converters.
 */

export interface PatientData {
  id: string
  name: string
  birthDate?: string
  age?: number
  phone?: string
  email?: string
  avatar?: string
  gender?: string
  address?: string
  insurance?: string
  insuranceNumber?: string
  tags?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface AppointmentData {
  id: string
  patientId: string
  patientName: string
  patientPhone?: string
  date: string
  durationMin: number
  procedure: string
  status: string
  professional: string
  specialty: string
  notes?: string
}

export interface AnthropometryData {
  id: string
  patientId: string
  date: string
  professional: string
  weight?: number
  height?: number
  imc?: number
  waist?: number
  hip?: number
}
