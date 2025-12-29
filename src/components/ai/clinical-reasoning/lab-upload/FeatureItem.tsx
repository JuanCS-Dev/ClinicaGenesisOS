/**
 * FeatureItem Component
 *
 * Displays a feature badge with icon and label.
 *
 * @module components/ai/clinical-reasoning/lab-upload/FeatureItem
 */

import React, { memo } from 'react'
import type { FeatureColor } from './types'

interface FeatureItemProps {
  icon: React.ElementType
  label: string
  color: FeatureColor
}

const colorClasses: Record<FeatureColor, string> = {
  emerald: 'bg-[#ECFDF5] text-[#059669]',
  indigo: 'bg-[#EEF2FF] text-[#4F46E5]',
  amber: 'bg-[#FFFBEB] text-[#D97706]',
}

/**
 * OPTIMIZED: Wrapped with React.memo to prevent unnecessary re-renders.
 */
export const FeatureItem = memo(function FeatureItem({
  icon: Icon,
  label,
  color,
}: FeatureItemProps): React.ReactElement {
  return (
    <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-genesis-soft/50">
      <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-xs font-medium text-genesis-medium">{label}</span>
    </div>
  )
})

export default FeatureItem
