/**
 * usePatientInsights Hook
 *
 * Patient analytics and engagement metrics.
 * Inspired by Epic MyChart Central patient insights.
 *
 * Features:
 * - Taxa de retorno de pacientes
 * - NPS automatizado
 * - Alertas de pacientes em risco
 * - Histórico de engagement
 *
 * @module hooks/patient-insights/usePatientInsights
 * @version 2.0.0 - Refactored for maintainability
 */

import { useState, useEffect, useMemo } from 'react'
import { useClinicContext } from '@/contexts/ClinicContext'
import { usePatients } from '@/hooks/usePatients'
import { useAppointments } from '@/hooks/useAppointments'
import type { PatientInsightsData } from './types'
import {
  calculateRetention,
  calculateNPS,
  identifyPatientsAtRisk,
  calculateEngagement,
  calculateDemographics,
} from './calculations'

/**
 * Hook for patient analytics and engagement metrics.
 *
 * @returns Patient insights data including retention, NPS, risks, engagement, and demographics
 *
 * @example
 * const { retention, nps, patientsAtRisk, loading } = usePatientInsights();
 */
export function usePatientInsights(): PatientInsightsData {
  useClinicContext() // Verify clinic context is available

  const { patients, loading: patientsLoading } = usePatients()
  const { appointments } = useAppointments()

  const [loading, setLoading] = useState(true)
  const [error] = useState<Error | null>(null)

  // Calculate retention metrics
  const retention = useMemo(
    () => calculateRetention(patients, appointments),
    [patients, appointments]
  )

  // Calculate NPS data
  const nps = useMemo(() => calculateNPS(patients.length), [patients.length])

  // Identify patients at risk
  const patientsAtRisk = useMemo(
    () => identifyPatientsAtRisk(patients, appointments),
    [patients, appointments]
  )

  // Calculate engagement metrics
  const engagement = useMemo(() => calculateEngagement(appointments), [appointments])

  // Calculate demographics
  const demographics = useMemo(() => calculateDemographics(patients), [patients])

  // Update loading state
  useEffect(() => {
    setLoading(patientsLoading)
  }, [patientsLoading])

  return {
    retention,
    nps,
    patientsAtRisk,
    engagement,
    demographics,
    loading,
    error,
  }
}
