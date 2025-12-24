/**
 * Lab Upload Constants
 *
 * @module components/ai/clinical-reasoning/lab-upload/constants
 */

import { Upload, Zap, Brain } from 'lucide-react'
import type { LabAnalysisStatus } from '../../../../types'
import type { ProcessingStage } from './types'

/**
 * Processing stage configuration.
 */
export const PROCESSING_STAGES: readonly ProcessingStage[] = [
  {
    id: 'uploading',
    label: 'Enviando',
    description: 'Transferindo documento para análise',
    icon: Upload,
  },
  {
    id: 'extracting',
    label: 'Extraindo',
    description: 'OCR identificando valores laboratoriais',
    icon: Zap,
  },
  {
    id: 'processing',
    label: 'Analisando',
    description: 'IA processando raciocínio clínico',
    icon: Brain,
  },
] as const

/**
 * Accepted file types for upload.
 */
export const ACCEPTED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf'],
}

/**
 * Maximum file size in bytes (15MB).
 */
export const MAX_FILE_SIZE = 15 * 1024 * 1024

/**
 * Get current stage index from status.
 */
export function getStageIndex(status: LabAnalysisStatus): number {
  switch (status) {
    case 'uploading':
      return 0
    case 'extracting':
      return 1
    case 'processing':
      return 2
    default:
      return -1
  }
}
