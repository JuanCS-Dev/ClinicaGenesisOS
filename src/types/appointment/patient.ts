/**
 * Patient Types
 *
 * Core patient entity for the scheduling system.
 */

export interface Patient {
  id: string;
  name: string;
  birthDate: string; // ISO Date
  age: number; // Calculated
  phone: string;
  email: string;
  avatar?: string;
  gender: string;
  address?: string;
  insurance?: string;
  insuranceNumber?: string;
  tags: string[];
  createdAt: string;
  nextAppointment?: string;
}

/**
 * Input type for creating a new patient (without auto-generated fields).
 */
export type CreatePatientInput = Omit<Patient, 'id' | 'createdAt' | 'age'>;
