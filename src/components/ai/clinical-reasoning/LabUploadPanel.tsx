/**
 * LabUploadPanel Component - Re-exports
 *
 * This file re-exports all lab upload components from the modular structure.
 * Maintained for backward compatibility with existing imports.
 *
 * @module components/ai/clinical-reasoning/LabUploadPanel
 * @deprecated Import directly from '@/components/ai/clinical-reasoning/lab-upload' for new code.
 */

export {
  LabUploadPanel,
  default,
  LabUploadZone,
  LabProcessingView,
  LabResultView,
  FeatureItem,
  PROCESSING_STAGES,
  ACCEPTED_FILE_TYPES,
  MAX_FILE_SIZE,
  getStageIndex,
} from './lab-upload'

export type { LabUploadPanelProps, ProcessingStage, FeatureColor } from './lab-upload'
