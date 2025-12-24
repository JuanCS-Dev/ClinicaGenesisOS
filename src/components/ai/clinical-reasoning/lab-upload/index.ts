/**
 * Lab Upload Module
 *
 * Premium upload interface for lab documents.
 *
 * @module components/ai/clinical-reasoning/lab-upload
 */

export { LabUploadPanel, default } from './LabUploadPanel'
export { LabUploadZone } from './LabUploadZone'
export { LabProcessingView } from './LabProcessingView'
export { LabResultView } from './LabResultView'
export { FeatureItem } from './FeatureItem'

export type { LabUploadPanelProps, ProcessingStage, FeatureColor } from './types'
export { PROCESSING_STAGES, ACCEPTED_FILE_TYPES, MAX_FILE_SIZE, getStageIndex } from './constants'
