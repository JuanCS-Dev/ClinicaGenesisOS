/**
 * Demo Entry
 *
 * Entry point for patient portal demo mode.
 * Wraps content with demo providers and layout.
 *
 * @module pages/patient-portal/DemoEntry
 */

import React from 'react'
import { DemoPatientProviders } from '@/contexts/DemoPatientContext'
import { DemoPatientPortalLayout } from '@/components/patient-portal/DemoPatientPortalLayout'

/**
 * Demo entry wrapper that provides demo context and layout.
 * Used as the element for /portal/demo routes.
 */
export function DemoEntry(): React.ReactElement {
  return (
    <DemoPatientProviders>
      <DemoPatientPortalLayout />
    </DemoPatientProviders>
  )
}

export default DemoEntry
