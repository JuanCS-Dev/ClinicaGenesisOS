/**
 * usePatientInsights Hook
 *
 * Re-exports from the patient-insights module for backwards compatibility.
 *
 * @module hooks/usePatientInsights
 * @deprecated Import from '@/hooks/patient-insights' instead
 */

export {
  usePatientInsights,
  type RetentionMetrics,
  type NPSData,
  type NPSFeedback,
  type PatientAtRisk,
  type EngagementMetrics,
  type ChannelUsage,
  type TimeOfDayStats,
  type PatientDemographics,
  type DemographicEntry,
  type ConditionEntry,
  type PatientInsightsData,
} from './patient-insights'

export { usePatientInsights as default } from './patient-insights'
