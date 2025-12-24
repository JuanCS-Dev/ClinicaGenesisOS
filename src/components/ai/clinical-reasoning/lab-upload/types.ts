/**
 * Lab Upload Panel Types
 *
 * @module components/ai/clinical-reasoning/lab-upload/types
 */

import type React from 'react'
import type { LabAnalysisStatus } from '../../../../types'

/**
 * Props for LabUploadPanel component.
 */
export interface LabUploadPanelProps {
  status: LabAnalysisStatus
  error?: string | null
  onFileSelect: (file: File) => void
  onCancel?: () => void
  disabled?: boolean
}

/**
 * Processing stage definition.
 */
export interface ProcessingStage {
  id: string
  label: string
  description: string
  icon: React.ElementType
}

/**
 * Feature item color variant.
 */
export type FeatureColor = 'emerald' | 'indigo' | 'amber'
