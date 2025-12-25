/**
 * Patient Portal Context
 * ======================
 *
 * Context for accessing patient data in the portal.
 * Links the authenticated patient user to their clinical data.
 *
 * @module contexts/PatientPortalContext
 * @version 1.0.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react'
import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../services/firebase'
import { usePatientAuth } from './PatientAuthContext'
import type { Patient } from '@/types'

// ============================================================================
// Types
// ============================================================================

interface PatientPortalState {
  /** The patient's clinical ID (from patients collection) */
  patientId: string | null
  /** Full patient data from the clinic's patients collection */
  patientData: Patient | null
  /** The clinic ID the patient belongs to */
  clinicId: string | null
  /** Loading state */
  loading: boolean
  /** Error state */
  error: string | null
}

interface PatientPortalContextValue extends PatientPortalState {
  /** Refresh patient data manually */
  refresh: () => Promise<void>
}

// ============================================================================
// Context
// ============================================================================

const PatientPortalContext = createContext<PatientPortalContextValue | undefined>(undefined)

// ============================================================================
// Provider
// ============================================================================

export function PatientPortalProvider({ children }: { children: React.ReactNode }) {
  const { profile, loading: authLoading } = usePatientAuth()

  const [state, setState] = useState<PatientPortalState>({
    patientId: null,
    patientData: null,
    clinicId: null,
    loading: true,
    error: null,
  })

  // Find and subscribe to patient data
  useEffect(() => {
    if (authLoading) return

    if (!profile?.clinicId || !profile?.patientId) {
      setState({
        patientId: null,
        patientData: null,
        clinicId: null,
        loading: false,
        error: null,
      })
      return
    }

    const { clinicId, patientId } = profile

    // Subscribe to real-time patient data
    const patientRef = doc(db, 'clinics', clinicId, 'patients', patientId)
    const unsubscribe = onSnapshot(
      patientRef,
      docSnap => {
        if (docSnap.exists()) {
          setState({
            patientId,
            patientData: { id: docSnap.id, ...docSnap.data() } as Patient,
            clinicId,
            loading: false,
            error: null,
          })
        } else {
          setState({
            patientId: null,
            patientData: null,
            clinicId,
            loading: false,
            error: 'Paciente não encontrado',
          })
        }
      },
      error => {
        console.error('Error fetching patient data:', error)
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Erro ao carregar dados do paciente',
        }))
      }
    )

    return () => unsubscribe()
  }, [profile, authLoading])

  // Manual refresh function
  const refresh = async () => {
    if (!profile?.clinicId || !profile?.patientId) return

    setState(prev => ({ ...prev, loading: true }))

    try {
      const patientRef = doc(db, 'clinics', profile.clinicId, 'patients', profile.patientId)
      const docSnap = await getDoc(patientRef)

      if (docSnap.exists()) {
        setState({
          patientId: profile.patientId,
          patientData: { id: docSnap.id, ...docSnap.data() } as Patient,
          clinicId: profile.clinicId,
          loading: false,
          error: null,
        })
      }
    } catch (error) {
      console.error('Error refreshing patient data:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Erro ao atualizar dados',
      }))
    }
  }

  const value: PatientPortalContextValue = {
    ...state,
    refresh,
  }

  return <PatientPortalContext.Provider value={value}>{children}</PatientPortalContext.Provider>
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Access patient portal context.
 *
 * @returns Patient portal data and methods
 * @throws Error if used outside PatientPortalProvider
 *
 * @example
 * const { patientId, patientData, clinicId } = usePatientPortal();
 */
export function usePatientPortal(): PatientPortalContextValue {
  const context = useContext(PatientPortalContext)
  if (!context) {
    throw new Error('usePatientPortal must be used within PatientPortalProvider')
  }
  return context
}

export default PatientPortalContext
