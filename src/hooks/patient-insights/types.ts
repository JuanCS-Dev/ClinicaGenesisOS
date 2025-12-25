/**
 * Patient Insights Types
 *
 * Type definitions for patient analytics and engagement metrics.
 *
 * @module hooks/patient-insights/types
 */

/**
 * Patient retention and loyalty metrics.
 */
export interface RetentionMetrics {
  totalPatients: number
  /** Visited in last 90 days */
  activePatients: number
  /** More than 1 visit */
  returningPatients: number
  /** First visit this month */
  newPatients: number
  /** % of patients who return */
  retentionRate: number
  /** % of patients who haven't returned in 6+ months */
  churnRate: number
  averageVisitsPerPatient: number
}

/**
 * Net Promoter Score data.
 */
export interface NPSData {
  /** Score from -100 to 100 */
  score: number
  /** 9-10 rating count */
  promoters: number
  /** 7-8 rating count */
  passives: number
  /** 0-6 rating count */
  detractors: number
  totalResponses: number
  trend: 'up' | 'down' | 'stable'
  recentFeedback: NPSFeedback[]
}

/**
 * Individual NPS feedback entry.
 */
export interface NPSFeedback {
  patientName: string
  rating: number
  comment?: string
  date: string
}

/**
 * Patient at risk of churn or disengagement.
 */
export interface PatientAtRisk {
  patientId: string
  patientName: string
  reason: 'no_return' | 'missed_appointments' | 'negative_feedback' | 'chronic_condition'
  riskLevel: 'high' | 'medium' | 'low'
  lastVisit: string
  recommendedAction: string
  daysSinceLastVisit: number
}

/**
 * Patient engagement and interaction metrics.
 */
export interface EngagementMetrics {
  /** % of patients using portal */
  portalAdoption: number
  appointmentConfirmationRate: number
  noShowRate: number
  /** Average response time in hours */
  averageResponseTime: number
  communicationChannels: ChannelUsage[]
  byTimeOfDay: TimeOfDayStats[]
}

/**
 * Communication channel usage stats.
 */
export interface ChannelUsage {
  channel: string
  /** Usage percentage */
  usage: number
}

/**
 * Appointments by time of day.
 */
export interface TimeOfDayStats {
  period: string
  appointments: number
}

/**
 * Patient demographic breakdown.
 */
export interface PatientDemographics {
  byAge: DemographicEntry[]
  byGender: DemographicEntry[]
  byInsurance: DemographicEntry[]
  topConditions: ConditionEntry[]
}

/**
 * Generic demographic entry.
 */
export interface DemographicEntry {
  range?: string
  gender?: string
  insurance?: string
  count: number
  percentage: number
}

/**
 * Top condition entry.
 */
export interface ConditionEntry {
  condition: string
  count: number
}

/**
 * Complete patient insights data.
 */
export interface PatientInsightsData {
  retention: RetentionMetrics
  nps: NPSData
  patientsAtRisk: PatientAtRisk[]
  engagement: EngagementMetrics
  demographics: PatientDemographics
  loading: boolean
  error: Error | null
}

/**
 * Internal: Patient visit tracking.
 */
export interface PatientVisitData {
  count: number
  lastVisit: Date
  firstVisit: Date
}
