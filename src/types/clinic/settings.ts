/**
 * Clinic Settings Types
 *
 * Types for clinic configuration and plans.
 */

import type { SpecialtyType } from '../records/base';

/**
 * Pricing plan types for clinics.
 */
export type ClinicPlan = 'solo' | 'clinica' | 'black';

/**
 * Clinic settings configuration.
 */
export interface ClinicSettings {
  workingHours: {
    start: string; // HH:mm format
    end: string;
  };
  defaultAppointmentDuration: number; // in minutes
  specialties: SpecialtyType[];
  timezone: string;
  /** Average ticket value in BRL for revenue calculations */
  averageTicket?: number;
}
