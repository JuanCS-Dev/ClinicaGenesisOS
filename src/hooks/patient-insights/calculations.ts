/**
 * Patient Insights Calculations
 *
 * Pure functions for calculating patient analytics metrics.
 * Separated for testability and maintainability.
 *
 * @module hooks/patient-insights/calculations
 */

import { Status } from '@/types'
import type { Patient, Appointment } from '@/types'
import type {
  RetentionMetrics,
  NPSData,
  PatientAtRisk,
  EngagementMetrics,
  PatientDemographics,
  PatientVisitData,
} from './types'

// ============================================================================
// Time Constants
// ============================================================================

const MS_PER_DAY = 24 * 60 * 60 * 1000
const DAYS_90 = 90 * MS_PER_DAY
const DAYS_30 = 30 * MS_PER_DAY
const DAYS_180 = 180 * MS_PER_DAY

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Calculate days since a given date.
 */
export function daysSince(date: string | Date): number {
  const then = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  return Math.floor((now.getTime() - then.getTime()) / MS_PER_DAY)
}

/**
 * Calculate NPS score from promoters and detractors.
 */
export function calculateNPSScore(promoters: number, detractors: number, total: number): number {
  if (total === 0) return 0
  return Math.round(((promoters - detractors) / total) * 100)
}

/**
 * Build patient visit map from appointments.
 */
export function buildPatientVisitMap(appointments: Appointment[]): Map<string, PatientVisitData> {
  const visitMap = new Map<string, PatientVisitData>()

  appointments
    .filter(a => a.status === Status.FINISHED)
    .forEach(a => {
      const current = visitMap.get(a.patientId) || {
        count: 0,
        lastVisit: new Date(0),
        firstVisit: new Date(),
      }
      const visitDate = new Date(a.date)
      visitMap.set(a.patientId, {
        count: current.count + 1,
        lastVisit: visitDate > current.lastVisit ? visitDate : current.lastVisit,
        firstVisit: visitDate < current.firstVisit ? visitDate : current.firstVisit,
      })
    })

  return visitMap
}

// ============================================================================
// Retention Calculations
// ============================================================================

/**
 * Calculate patient retention metrics.
 */
export function calculateRetention(
  patients: Patient[],
  appointments: Appointment[]
): RetentionMetrics {
  const now = new Date()
  const ninetyDaysAgo = new Date(now.getTime() - DAYS_90)
  const thirtyDaysAgo = new Date(now.getTime() - DAYS_30)
  const sixMonthsAgo = new Date(now.getTime() - DAYS_180)

  const patientVisitMap = buildPatientVisitMap(appointments)

  const totalPatients = patients.length
  let activePatients = 0
  let returningPatients = 0
  let newPatients = 0
  let churnedPatients = 0

  patientVisitMap.forEach(data => {
    if (data.lastVisit >= ninetyDaysAgo) activePatients++
    if (data.count > 1) returningPatients++
    if (data.firstVisit >= thirtyDaysAgo) newPatients++
    if (data.lastVisit < sixMonthsAgo && data.count > 0) churnedPatients++
  })

  const totalVisits = appointments.filter(a => a.status === Status.FINISHED).length
  const patientsWithVisits = patientVisitMap.size

  return {
    totalPatients,
    activePatients,
    returningPatients,
    newPatients,
    retentionRate:
      patientsWithVisits > 0 ? Math.round((returningPatients / patientsWithVisits) * 100) : 0,
    churnRate:
      patientsWithVisits > 0 ? Math.round((churnedPatients / patientsWithVisits) * 100) : 0,
    averageVisitsPerPatient:
      patientsWithVisits > 0 ? Math.round((totalVisits / patientsWithVisits) * 10) / 10 : 0,
  }
}

// ============================================================================
// NPS Calculations
// ============================================================================

/**
 * Calculate NPS data.
 * Note: In production, this would come from actual survey data.
 * Currently returns example data with isExample flag.
 */
export function calculateNPS(patientCount: number): NPSData {
  // Example survey responses - will be replaced with real data when NPS surveys are implemented
  // See: isExample flag in return value
  const totalResponses = Math.max(10, Math.floor(patientCount * 0.3))
  const promoters = Math.floor(totalResponses * 0.6)
  const passives = Math.floor(totalResponses * 0.25)
  const detractors = totalResponses - promoters - passives

  return {
    score: calculateNPSScore(promoters, detractors, totalResponses),
    promoters,
    passives,
    detractors,
    totalResponses,
    trend: 'up',
    recentFeedback: [],
    // Flag to indicate this is example data (no real survey data yet)
    isExample: true,
  }
}

// ============================================================================
// Risk Analysis
// ============================================================================

/**
 * Identify patients at risk of churn.
 */
export function identifyPatientsAtRisk(
  patients: Patient[],
  appointments: Appointment[]
): PatientAtRisk[] {
  const risks: PatientAtRisk[] = []

  // Build last visit map
  const patientLastVisit = new Map<string, { date: Date; name: string }>()

  appointments
    .filter(a => a.status === Status.FINISHED)
    .forEach(a => {
      const patient = patients.find(p => p.id === a.patientId)
      if (!patient) return

      const current = patientLastVisit.get(a.patientId)
      const visitDate = new Date(a.date)

      if (!current || visitDate > current.date) {
        patientLastVisit.set(a.patientId, { date: visitDate, name: patient.name })
      }
    })

  // Check for no-return patients
  patientLastVisit.forEach((data, patientId) => {
    const days = daysSince(data.date)

    if (days >= 90 && days < 180) {
      risks.push({
        patientId,
        patientName: data.name,
        reason: 'no_return',
        riskLevel: 'medium',
        lastVisit: data.date.toISOString(),
        recommendedAction: 'Enviar lembrete de retorno',
        daysSinceLastVisit: days,
      })
    } else if (days >= 180) {
      risks.push({
        patientId,
        patientName: data.name,
        reason: 'no_return',
        riskLevel: 'high',
        lastVisit: data.date.toISOString(),
        recommendedAction: 'Contato urgente para reengajamento',
        daysSinceLastVisit: days,
      })
    }
  })

  // Check for missed appointments
  const missedAppointments = new Map<string, number>()
  appointments
    .filter(a => a.status === Status.CANCELED || a.status === Status.NO_SHOW)
    .forEach(a => {
      missedAppointments.set(a.patientId, (missedAppointments.get(a.patientId) || 0) + 1)
    })

  missedAppointments.forEach((count, patientId) => {
    if (count >= 2) {
      const patient = patients.find(p => p.id === patientId)
      if (patient && !risks.find(r => r.patientId === patientId)) {
        risks.push({
          patientId,
          patientName: patient.name,
          reason: 'missed_appointments',
          riskLevel: count >= 3 ? 'high' : 'medium',
          lastVisit: '',
          recommendedAction: 'Verificar motivo das faltas e oferecer reagendamento',
          daysSinceLastVisit: 0,
        })
      }
    }
  })

  // Sort by risk level and limit to 10
  const riskOrder = { high: 0, medium: 1, low: 2 }
  return risks.sort((a, b) => riskOrder[a.riskLevel] - riskOrder[b.riskLevel]).slice(0, 10)
}

// ============================================================================
// Engagement Calculations
// ============================================================================

/**
 * Calculate patient engagement metrics.
 * Some metrics are calculated from real data, others are example placeholders.
 */
export function calculateEngagement(appointments: Appointment[]): EngagementMetrics {
  const totalAppointments = appointments.length
  const confirmed = appointments.filter(
    a => a.status === Status.CONFIRMED || a.status === Status.FINISHED
  ).length
  const noShows = appointments.filter(a => a.status === Status.NO_SHOW).length

  // Time of day distribution - calculated from real appointments
  const byTimeOfDay = [
    { period: 'Manhã (8h-12h)', appointments: 0 },
    { period: 'Tarde (12h-18h)', appointments: 0 },
    { period: 'Noite (18h-21h)', appointments: 0 },
  ]

  appointments.forEach(a => {
    const hour = new Date(a.date).getHours()
    if (hour >= 8 && hour < 12) byTimeOfDay[0].appointments++
    else if (hour >= 12 && hour < 18) byTimeOfDay[1].appointments++
    else if (hour >= 18 && hour < 21) byTimeOfDay[2].appointments++
  })

  // Confirmation rate and no-show rate are calculated from real data
  // Portal adoption, response time, and channel usage are example data (see isExample flag)
  return {
    portalAdoption: 45, // Example data - real tracking requires portal analytics integration
    appointmentConfirmationRate:
      totalAppointments > 0 ? Math.round((confirmed / totalAppointments) * 100) : 0,
    noShowRate: totalAppointments > 0 ? Math.round((noShows / totalAppointments) * 100) : 0,
    averageResponseTime: 2.5, // Example data - real tracking requires message timestamp analysis
    communicationChannels: [
      { channel: 'WhatsApp', usage: 65 },
      { channel: 'Telefone', usage: 20 },
      { channel: 'Email', usage: 10 },
      { channel: 'Portal', usage: 5 },
    ],
    byTimeOfDay,
    // Flag to indicate some metrics are example data (portalAdoption, responseTime, channels)
    isExample: true,
  }
}

// ============================================================================
// Demographics Calculations
// ============================================================================

/**
 * Calculate patient demographic breakdown.
 */
export function calculateDemographics(patients: Patient[]): PatientDemographics {
  const ageRanges = [
    { range: '0-17', min: 0, max: 17, count: 0 },
    { range: '18-30', min: 18, max: 30, count: 0 },
    { range: '31-45', min: 31, max: 45, count: 0 },
    { range: '46-60', min: 46, max: 60, count: 0 },
    { range: '60+', min: 61, max: 150, count: 0 },
  ]

  const genderCounts: Record<string, number> = { Masculino: 0, Feminino: 0, Outro: 0 }
  const insuranceCounts = new Map<string, number>()

  const now = new Date()

  patients.forEach(p => {
    // Age calculation
    if (p.birthDate) {
      const birth = new Date(p.birthDate)
      const age = Math.floor((now.getTime() - birth.getTime()) / (365.25 * MS_PER_DAY))
      const range = ageRanges.find(r => age >= r.min && age <= r.max)
      if (range) range.count++
    }

    // Gender
    const gender = p.gender === 'male' ? 'Masculino' : p.gender === 'female' ? 'Feminino' : 'Outro'
    genderCounts[gender]++

    // Insurance
    const insurance = p.insurance || 'Particular'
    insuranceCounts.set(insurance, (insuranceCounts.get(insurance) || 0) + 1)
  })

  const total = patients.length || 1

  return {
    byAge: ageRanges.map(r => ({
      range: r.range,
      count: r.count,
      percentage: Math.round((r.count / total) * 100),
    })),
    byGender: Object.entries(genderCounts).map(([gender, count]) => ({
      gender,
      count,
      percentage: Math.round((count / total) * 100),
    })),
    byInsurance: Array.from(insuranceCounts.entries())
      .map(([insurance, count]) => ({
        insurance,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    // Condition data requires ICD-10 coding in patient records (not yet implemented)
    topConditions: [],
  }
}
