/**
 * LabResultView Component
 *
 * Displays success or error state after processing.
 *
 * @module components/ai/clinical-reasoning/lab-upload/LabResultView
 */

import React from 'react'
import { CheckCircle, AlertCircle, X } from 'lucide-react'

interface LabSuccessViewProps {
  variant: 'success'
}

interface LabErrorViewProps {
  variant: 'error'
  error?: string | null
  onRetry?: () => void
}

type LabResultViewProps = LabSuccessViewProps | LabErrorViewProps

export function LabResultView(props: LabResultViewProps): React.ReactElement {
  if (props.variant === 'success') {
    return (
      <div className="animate-[scaleIn_0.4s_cubic-bezier(0.16,1,0.3,1)_forwards]">
        <div className="rounded-2xl border border-[#A7F3D0] p-8 text-center" style={{ background: 'linear-gradient(to bottom right, #ECFDF5, #F0FDFA)' }}>
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-[#D1FAE5] rounded-2xl">
              <CheckCircle className="w-12 h-12 text-[#059669]" />
            </div>
          </div>

          <h3 className="text-xl font-semibold text-[#064E3B] mb-2">Análise Concluída</h3>
          <p className="text-[#047857]">Resultados prontos para revisão médica</p>
        </div>
      </div>
    )
  }

  // Error variant
  const { error, onRetry } = props

  return (
    <div className="animate-[scaleIn_0.4s_cubic-bezier(0.16,1,0.3,1)_forwards]">
      <div className="rounded-2xl border border-[#FECACA] p-8" style={{ background: 'linear-gradient(to bottom right, #FEF2F2, #FFF1F2)' }}>
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-[#FEE2E2] rounded-2xl">
            <AlertCircle className="w-12 h-12 text-[#DC2626]" />
          </div>
        </div>

        <h3 className="text-xl font-semibold text-[#7F1D1D] text-center mb-2">
          Erro no Processamento
        </h3>

        {error && <p className="text-[#B91C1C] text-center mb-6 max-w-md mx-auto">{error}</p>}

        {onRetry && (
          <div className="flex justify-center">
            <button
              onClick={onRetry}
              className="
                flex items-center gap-2 px-6 py-3 rounded-xl
                bg-genesis-surface border border-[#FECACA]
                text-[#B91C1C] font-medium
                hover:bg-[#FEF2F2]
                transition-colors
              "
            >
              <X className="w-4 h-4" />
              Tentar Novamente
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default LabResultView
