/**
 * Demo Configuration
 *
 * Configuration for patient portal demo mode.
 * Values are loaded from environment variables in development.
 * In production, demo mode is disabled unless explicitly configured.
 *
 * @module config/demo
 */

/**
 * Demo configuration loaded from environment variables.
 * Only used when no clinic is detected from subdomain/query param.
 */
export const DEMO_CONFIG = {
  /** Demo clinic ID in Firestore */
  clinicId: import.meta.env.VITE_DEMO_CLINIC_ID || '',
  /** Demo patient ID in Firestore */
  patientId: import.meta.env.VITE_DEMO_PATIENT_ID || '',
  /** Display name for demo patient */
  patientName: import.meta.env.VITE_DEMO_PATIENT_NAME || 'Paciente Demo',
  /** Email for demo patient */
  patientEmail: import.meta.env.VITE_DEMO_PATIENT_EMAIL || 'demo@clinicagenesis.com',
} as const;

/**
 * Check if demo mode is available.
 * Demo mode requires at least a clinic ID to be configured.
 */
export const isDemoAvailable = (): boolean => {
  return Boolean(DEMO_CONFIG.clinicId);
};

export type DemoConfig = typeof DEMO_CONFIG;
