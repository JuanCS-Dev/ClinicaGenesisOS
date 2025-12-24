/**
 * LabProcessingView Component
 *
 * Displays processing stages with progress indicator.
 *
 * @module components/ai/clinical-reasoning/lab-upload/LabProcessingView
 */

import React from 'react'
import { Brain, Loader2, CheckCircle, X } from 'lucide-react'
import type { LabAnalysisStatus } from '../../../../types'
import { PROCESSING_STAGES, getStageIndex } from './constants'

interface LabProcessingViewProps {
  status: LabAnalysisStatus
  fileName?: string
  onCancel?: () => void
}

export function LabProcessingView({
  status,
  fileName,
  onCancel,
}: LabProcessingViewProps): React.ReactElement {
  const currentStageIndex = getStageIndex(status)

  return (
    <div className="animate-[fadeIn_0.3s_ease-out_forwards]">
      <div className="bg-genesis-surface rounded-2xl border border-genesis-border-subtle shadow-xl overflow-hidden">
        {/* Header with gradient */}
        <div className="relative px-6 py-5" style={{ background: 'linear-gradient(to right, #4F46E5, #7C3AED)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-genesis-surface/20 rounded-xl backdrop-blur-sm">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Processando Análise</h3>
                <p className="text-sm text-[#E0E7FF]">{fileName || 'Exame laboratorial'}</p>
              </div>
            </div>

            {onCancel && (
              <button
                onClick={onCancel}
                className="p-2 rounded-lg bg-genesis-surface/10 hover:bg-genesis-surface/20 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="p-6">
          <div className="space-y-4">
            {PROCESSING_STAGES.map((stage, idx) => {
              const StageIcon = stage.icon
              const isActive = idx === currentStageIndex
              const isCompleted = idx < currentStageIndex

              return (
                <div
                  key={stage.id}
                  className={`
                    flex items-center gap-4 p-4 rounded-xl transition-all duration-300
                    ${isActive ? 'bg-[#EEF2FF] border border-[#E0E7FF]' : ''}
                    ${isCompleted ? 'opacity-60' : ''}
                  `}
                >
                  {/* Step indicator */}
                  <div
                    className={`
                      relative flex items-center justify-center w-10 h-10 rounded-full
                      transition-all duration-300
                      ${
                        isCompleted
                          ? 'bg-[#D1FAE5]'
                          : isActive
                            ? 'bg-[#4F46E5] animate-[progressPulse_2s_ease-in-out_infinite]'
                            : 'bg-genesis-hover'
                      }
                    `}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-[#059669]" />
                    ) : isActive ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <StageIcon className="w-5 h-5 text-genesis-subtle" />
                    )}
                  </div>

                  {/* Step content */}
                  <div className="flex-1">
                    <p
                      className={`
                        font-medium transition-colors duration-300
                        ${isActive ? 'text-[#312E81]' : isCompleted ? 'text-genesis-muted' : 'text-genesis-subtle'}
                      `}
                    >
                      {stage.label}
                    </p>
                    {isActive && (
                      <p className="text-sm text-[#4F46E5] mt-0.5 animate-[fadeIn_0.3s_ease-out]">
                        {stage.description}
                      </p>
                    )}
                  </div>

                  {/* Status indicator */}
                  {isCompleted && (
                    <span className="text-xs font-medium text-[#059669] bg-[#ECFDF5] px-2 py-1 rounded-full">
                      Concluído
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Progress bar */}
          <div className="mt-6 h-1.5 bg-genesis-hover rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                background: 'linear-gradient(to right, #6366F1, #8B5CF6)',
                width: `${((currentStageIndex + 1) / PROCESSING_STAGES.length) * 100}%`,
              }}
            />
          </div>

          {/* Estimated time */}
          <p className="mt-4 text-center text-sm text-genesis-muted">
            Tempo estimado: 15-30 segundos
          </p>
        </div>
      </div>
    </div>
  )
}

export default LabProcessingView
