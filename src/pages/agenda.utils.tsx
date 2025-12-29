/**
 * Agenda Page Utilities
 * Shared components and helpers for the Agenda page.
 */
import React from 'react'
import { Loader2 } from 'lucide-react'
import { format } from 'date-fns'

/** Loading fallback for lazy-loaded Agenda components. */
export const ViewLoader: React.FC = () => (
  <div className="flex items-center justify-center h-64">
    <Loader2 className="w-8 h-8 text-genesis-primary animate-spin" />
  </div>
)

/** Format a date to YYYY-MM-DD for filtering. */
export function toDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}
