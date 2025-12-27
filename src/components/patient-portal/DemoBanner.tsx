/**
 * Demo Banner
 *
 * Visual indicator that the user is in demo mode.
 * Shows at the top of all demo portal pages.
 * Logs analytics events for tracking demo usage.
 */

import React, { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Info } from 'lucide-react'
import { logEvent } from 'firebase/analytics'
import { analytics } from '@/services/firebase'

export function DemoBanner(): React.ReactElement {
  const location = useLocation()

  // Log analytics event when demo pages are accessed
  useEffect(() => {
    if (analytics) {
      logEvent(analytics, 'demo_access', {
        path: location.pathname,
        timestamp: new Date().toISOString(),
      })
    }
  }, [location.pathname])

  return (
    <div className="bg-amber-500 text-white py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm font-medium">
        <Info className="w-4 h-4 flex-shrink-0" />
        <span>
          <strong>Modo Demonstração</strong> — Você está explorando o portal como paciente demo
        </span>
        <Link
          to="/portal/login"
          className="ml-2 underline hover:no-underline"
        >
          Acessar com sua conta
        </Link>
      </div>
    </div>
  )
}

export default DemoBanner
