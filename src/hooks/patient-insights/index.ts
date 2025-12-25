/**
 * Patient Insights Module
 *
 * Patient analytics and engagement metrics.
 *
 * @module hooks/patient-insights
 */

// Main hook
export { usePatientInsights } from './usePatientInsights'

// Types
export type {
  RetentionMetrics,
  NPSData,
  NPSFeedback,
  PatientAtRisk,
  EngagementMetrics,
  ChannelUsage,
  TimeOfDayStats,
  PatientDemographics,
  DemographicEntry,
  ConditionEntry,
  PatientInsightsData,
} from './types'

// Calculation utilities (for testing)
export {
  daysSince,
  calculateNPSScore,
  buildPatientVisitMap,
  calculateRetention,
  calculateNPS,
  identifyPatientsAtRisk,
  calculateEngagement,
  calculateDemographics,
} from './calculations'
