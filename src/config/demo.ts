/**
 * Demo Configuration
 *
 * Hardcoded IDs for patient portal demo.
 * Points to real Firestore data in the demo clinic.
 */

export const DEMO_CONFIG = {
  /** Demo clinic ID in Firestore */
  clinicId: '5aEI4f6S4e7q6G5M91M9',
  /** Demo patient ID in Firestore */
  patientId: '3xBppjJ550Jg0B4Yw8rg',
  /** Display name for demo patient */
  patientName: 'Paciente Demo',
  /** Email for demo patient */
  patientEmail: 'demo@clinicagenesis.com',
} as const

export type DemoConfig = typeof DEMO_CONFIG
