/**
 * LabUploadPanel Component
 *
 * Premium upload interface for lab documents.
 * Designed for 500k+/year subscription tier.
 *
 * Features:
 * - Intuitive drag & drop with visual feedback
 * - Clear processing stages with real-time updates
 * - Premium animations and micro-interactions
 * - Mobile-friendly with camera integration
 *
 * @module components/ai/clinical-reasoning/lab-upload/LabUploadPanel
 */

import React, { useState, useCallback } from 'react'
import type { LabUploadPanelProps } from './types'
import { LabUploadZone } from './LabUploadZone'
import { LabProcessingView } from './LabProcessingView'
import { LabResultView } from './LabResultView'

/**
 * Premium upload panel with world-class UX.
 */
export function LabUploadPanel({
  status,
  error,
  onFileSelect,
  onCancel,
  disabled = false,
}: LabUploadPanelProps): React.ReactElement {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileSelect = useCallback(
    (file: File) => {
      if (!disabled) {
        setSelectedFile(file)
        onFileSelect(file)
      }
    },
    [onFileSelect, disabled]
  )

  const isProcessing = ['uploading', 'extracting', 'processing'].includes(status)

  // Idle state - show upload UI
  if (status === 'idle') {
    return <LabUploadZone onFileSelect={handleFileSelect} disabled={disabled} />
  }

  // Processing state
  if (isProcessing) {
    return <LabProcessingView status={status} fileName={selectedFile?.name} onCancel={onCancel} />
  }

  // Ready state
  if (status === 'ready') {
    return <LabResultView variant="success" />
  }

  // Error state
  if (status === 'error') {
    return <LabResultView variant="error" error={error} onRetry={onCancel} />
  }

  // Fallback
  return <div />
}

export default LabUploadPanel
