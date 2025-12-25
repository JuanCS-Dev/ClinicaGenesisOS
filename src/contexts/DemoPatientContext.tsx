/**
 * Demo Patient Context
 *
 * Provides demo patient authentication and data for the patient portal demo.
 * Uses the original PatientAuthContext and PatientPortalContext with demo data.
 * This allows all existing hooks (usePatientAuth, usePatientPortal, etc.) to work unchanged.
 *
 * @module contexts/DemoPatientContext
 */

import React, { useState, useEffect, useRef } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/services/firebase'
import { DEMO_CONFIG } from '@/config/demo'
import { PatientAuthContext, type PatientProfile } from './PatientAuthContext'
import { PatientPortalContext } from './PatientPortalContext'
import type { Patient } from '@/types'

// ============================================================================
// Demo Profile
// ============================================================================

const DEMO_PROFILE: PatientProfile = {
  id: 'demo-user',
  email: DEMO_CONFIG.patientEmail,
  name: DEMO_CONFIG.patientName,
  clinicId: DEMO_CONFIG.clinicId,
  patientId: DEMO_CONFIG.patientId,
  createdAt: new Date(),
}

// ============================================================================
// Demo Auth Provider
// ============================================================================

/**
 * Provides PatientAuthContext with demo data.
 * No Firebase auth required - uses hardcoded demo profile.
 */
export function DemoPatientAuthProvider({ children }: { children: React.ReactNode }) {
  const value = {
    user: null,
    profile: DEMO_PROFILE,
    loading: false,
    error: null,
    sendMagicLink: async () => {
      // No-op for demo
    },
    completeMagicLinkSignIn: async () => {
      // No-op for demo
    },
    logout: async () => {
      window.location.href = '/'
    },
    clearError: () => {
      // No-op for demo
    },
  }

  return (
    <PatientAuthContext.Provider value={value}>
      {children}
    </PatientAuthContext.Provider>
  )
}

// ============================================================================
// Demo Portal Provider
// ============================================================================

/**
 * Provides PatientPortalContext with demo data.
 * Fetches real patient data from Firestore using demo clinic/patient IDs.
 * Uses getDoc instead of onSnapshot to avoid Firestore SDK race condition bugs.
 */
export function DemoPatientPortalProvider({ children }: { children: React.ReactNode }) {
  const [patientData, setPatientData] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchedRef = useRef(false)

  // Fetch patient data once (not real-time for demo stability)
  useEffect(() => {
    // Prevent double-fetch in StrictMode
    if (fetchedRef.current) return
    fetchedRef.current = true

    const fetchPatient = async () => {
      try {
        const patientRef = doc(db, 'clinics', DEMO_CONFIG.clinicId, 'patients', DEMO_CONFIG.patientId)
        const docSnap = await getDoc(patientRef)

        if (docSnap.exists()) {
          setPatientData({ id: docSnap.id, ...docSnap.data() } as Patient)
          setError(null)
        } else {
          setPatientData(null)
          setError('Paciente demo não encontrado')
        }
      } catch (err) {
        console.error('Error fetching demo patient:', err)
        setError('Erro ao carregar dados do paciente')
      } finally {
        setLoading(false)
      }
    }

    fetchPatient()
  }, [])

  // Manual refresh function
  const refresh = async () => {
    setLoading(true)
    try {
      const patientRef = doc(db, 'clinics', DEMO_CONFIG.clinicId, 'patients', DEMO_CONFIG.patientId)
      const docSnap = await getDoc(patientRef)
      if (docSnap.exists()) {
        setPatientData({ id: docSnap.id, ...docSnap.data() } as Patient)
        setError(null)
      }
    } catch (err) {
      console.error('Error refreshing demo patient:', err)
    } finally {
      setLoading(false)
    }
  }

  const value = {
    patientId: DEMO_CONFIG.patientId,
    patientData,
    clinicId: DEMO_CONFIG.clinicId,
    loading,
    error,
    refresh,
  }

  return (
    <PatientPortalContext.Provider value={value}>
      {children}
    </PatientPortalContext.Provider>
  )
}

// ============================================================================
// Combined Demo Wrapper
// ============================================================================

/**
 * Combines both demo providers for convenience.
 * Wrap demo portal routes with this component.
 */
export function DemoPatientProviders({ children }: { children: React.ReactNode }) {
  return (
    <DemoPatientAuthProvider>
      <DemoPatientPortalProvider>
        {children}
      </DemoPatientPortalProvider>
    </DemoPatientAuthProvider>
  )
}

// ============================================================================
// Demo Hooks (re-exports for convenience)
// ============================================================================

// Re-export hooks for use within demo context
// These work because DemoPatientProviders provides the same contexts
export { usePatientAuth as useDemoPatientAuth } from './PatientAuthContext'
export { usePatientPortal as useDemoPatientPortal } from './PatientPortalContext'
