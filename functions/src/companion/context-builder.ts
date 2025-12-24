/**
 * Patient Context Builder
 * =======================
 *
 * Builds patient context from Firestore data for AI personalization.
 * Loads patient info, medications, conditions, and recent visits.
 *
 * @module companion/context-builder
 */

import { getFirestore } from 'firebase-admin/firestore'
import type { PatientCompanionContext } from './types.js'

/**
 * Patient document structure from Firestore.
 */
interface PatientDoc {
  name: string
  birthDate: string
  sex: 'male' | 'female' | 'Masculino' | 'Feminino'
  phone?: string
  email?: string
}

/**
 * Medical history document structure.
 */
interface MedicalHistoryDoc {
  allergies?: string[]
  medications?: Array<{ name: string; dosage?: string }>
  chronicConditions?: string[]
  familyHistory?: string[]
}

/**
 * Appointment document structure.
 */
interface AppointmentDoc {
  date: string
  specialty: string
  physicianId?: string
  physicianName?: string
  status: string
}

/**
 * Calculate age from birth date.
 */
function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}

/**
 * Normalize sex field to standard format.
 */
function normalizeSex(sex: 'male' | 'female' | 'Masculino' | 'Feminino'): 'male' | 'female' {
  if (sex === 'Masculino' || sex === 'male') return 'male'
  return 'female'
}

/**
 * Extract first name from full name.
 */
function getFirstName(fullName: string): string {
  return fullName.split(' ')[0]
}

/**
 * Build patient context from Firestore data.
 */
export async function buildPatientContext(
  clinicId: string,
  patientId: string
): Promise<PatientCompanionContext> {
  const db = getFirestore()

  // Get patient document
  const patientDoc = await db
    .collection('clinics')
    .doc(clinicId)
    .collection('patients')
    .doc(patientId)
    .get()

  if (!patientDoc.exists) {
    throw new Error(`Patient not found: ${patientId}`)
  }

  const patient = patientDoc.data() as PatientDoc

  // Get medical history (if exists)
  const historyDoc = await db
    .collection('clinics')
    .doc(clinicId)
    .collection('patients')
    .doc(patientId)
    .collection('medicalHistory')
    .doc('current')
    .get()

  const history = historyDoc.exists ? (historyDoc.data() as MedicalHistoryDoc) : null

  // Get last appointment
  const appointmentsSnapshot = await db
    .collection('clinics')
    .doc(clinicId)
    .collection('appointments')
    .where('patientId', '==', patientId)
    .where('status', '==', 'Realizado')
    .orderBy('date', 'desc')
    .limit(1)
    .get()

  let lastAppointment: PatientCompanionContext['lastAppointment'] | undefined

  if (!appointmentsSnapshot.empty) {
    const appt = appointmentsSnapshot.docs[0].data() as AppointmentDoc
    lastAppointment = {
      date: appt.date,
      specialty: appt.specialty,
      physicianName: appt.physicianName,
    }
  }

  // Get recent SOAP notes summary (last 3)
  const soapSnapshot = await db
    .collection('clinics')
    .doc(clinicId)
    .collection('patients')
    .doc(patientId)
    .collection('records')
    .orderBy('createdAt', 'desc')
    .limit(3)
    .get()

  let recentSOAPSummary: string | undefined

  if (!soapSnapshot.empty) {
    const summaries = soapSnapshot.docs
      .map(doc => {
        const data = doc.data()
        const assessment = data.assessment || data.soap?.assessment
        if (assessment) {
          return `- ${assessment.slice(0, 100)}`
        }
        return null
      })
      .filter(Boolean)

    if (summaries.length > 0) {
      recentSOAPSummary = summaries.join('\n')
    }
  }

  // Build context
  const context: PatientCompanionContext = {
    name: getFirstName(patient.name),
    age: calculateAge(patient.birthDate),
    sex: normalizeSex(patient.sex),
    allergies: history?.allergies || [],
    currentMedications: history?.medications?.map(m => m.name) || [],
    chronicConditions: history?.chronicConditions || [],
    lastAppointment,
    recentSOAPSummary,
  }

  return context
}

/**
 * Build minimal context when patient data is limited.
 */
export function buildMinimalContext(name: string, phone: string): PatientCompanionContext {
  return {
    name: getFirstName(name),
    age: 0, // Unknown
    sex: 'male', // Default, will be updated
    allergies: [],
    currentMedications: [],
    chronicConditions: [],
  }
}
