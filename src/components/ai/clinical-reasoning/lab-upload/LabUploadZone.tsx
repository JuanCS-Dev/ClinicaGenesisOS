/**
 * LabUploadZone Component
 *
 * Drag-and-drop upload area for lab documents.
 *
 * @module components/ai/clinical-reasoning/lab-upload/LabUploadZone
 */

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Camera, FolderOpen, Sparkles, Shield, Brain, Zap } from 'lucide-react'
import { FeatureItem } from './FeatureItem'
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from './constants'

interface LabUploadZoneProps {
  onFileSelect: (file: File) => void
  disabled?: boolean
}

export function LabUploadZone({
  onFileSelect,
  disabled = false,
}: LabUploadZoneProps): React.ReactElement {
  const [isDragHovering, setIsDragHovering] = useState(false)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0 && !disabled) {
        onFileSelect(acceptedFiles[0])
      }
    },
    [onFileSelect, disabled]
  )

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragHovering(true),
    onDragLeave: () => setIsDragHovering(false),
    onDragOver: () => undefined,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    disabled,
    noClick: true,
  })

  const handleCameraCapture = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment'
    input.onchange = e => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        onFileSelect(file)
      }
    }
    input.click()
  }, [onFileSelect])

  return (
    <div className="animate-[scaleIn_0.4s_cubic-bezier(0.16,1,0.3,1)_forwards]">
      {/* Main Upload Area */}
      <div
        {...getRootProps()}
        role="region"
        aria-label="Área de upload de exames laboratoriais"
        className={`
          relative overflow-hidden rounded-2xl border-2 border-dashed
          transition-all duration-300 ease-out
          ${
            isDragActive || isDragHovering
              ? 'border-genesis-primary bg-genesis-primary/5 scale-[1.01]'
              : 'border-genesis-border bg-gradient-to-b from-genesis-surface to-genesis-soft/50 hover:border-genesis-primary/30 hover:shadow-lg'
          }
        `}
      >
        <input {...getInputProps()} />

        {/* Gradient overlay on drag */}
        {(isDragActive || isDragHovering) && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/5 to-[#8B5CF6]/5 pointer-events-none" />
        )}

        <div className="relative px-8 py-12">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div
              className={`
                relative p-5 rounded-2xl transition-all duration-300
                ${
                  isDragActive || isDragHovering
                    ? 'bg-[#E0E7FF] scale-110'
                    : 'bg-gradient-to-br from-[#EEF2FF] to-[#F5F3FF]'
                }
              `}
            >
              <Upload
                className={`
                  w-10 h-10 transition-all duration-300
                  ${isDragActive || isDragHovering ? 'text-[#4F46E5]' : 'text-[#6366F1]'}
                `}
              />
              {/* Sparkle decorations */}
              <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-[#FBBF24] animate-[float_3s_ease-in-out_infinite]" />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-genesis-dark text-center mb-2">
            {isDragActive ? 'Solte o arquivo aqui' : 'Análise de Exame Laboratorial'}
          </h3>

          {/* Subtitle */}
          <p className="text-genesis-muted text-center mb-8 max-w-sm mx-auto">
            {isDragActive
              ? 'Vamos processar seu exame com IA avançada'
              : 'Arraste um PDF ou imagem do exame, ou escolha uma das opções abaixo'}
          </p>

          {/* Action Buttons */}
          {!isDragActive && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {/* File Button */}
              <button
                type="button"
                onClick={open}
                className="
                  flex items-center gap-3 px-6 py-3.5 rounded-xl
                  bg-gradient-to-r from-[#4F46E5] to-[#6366F1]
                  text-white font-medium
                  shadow-lg shadow-[#6366F1]/25
                  hover:shadow-xl hover:shadow-[#6366F1]/30
                  hover:from-[#6366F1] hover:to-[#4F46E5]
                  active:scale-[0.98]
                  transition-all duration-200
                "
              >
                <FolderOpen className="w-5 h-5" />
                <span>Escolher Arquivo</span>
              </button>

              {/* Camera Button (Mobile-friendly) */}
              <button
                type="button"
                onClick={handleCameraCapture}
                className="
                  flex items-center gap-3 px-6 py-3.5 rounded-xl
                  bg-genesis-surface border border-genesis-border
                  text-genesis-text font-medium
                  shadow-sm
                  hover:bg-genesis-soft hover:border-genesis-border hover:shadow-md
                  active:scale-[0.98]
                  transition-all duration-200
                "
              >
                <Camera className="w-5 h-5 text-genesis-muted" />
                <span>Usar Câmera</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Features List */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <FeatureItem icon={Shield} label="HIPAA Compliant" color="emerald" />
        <FeatureItem icon={Brain} label="Multi-LLM" color="indigo" />
        <FeatureItem icon={Zap} label="15-30 segundos" color="amber" />
      </div>

      {/* Supported Formats */}
      <p className="mt-6 text-center text-xs text-genesis-subtle">
        Formatos aceitos: PDF, JPG, PNG, WebP &bull; Máximo 15MB
      </p>
    </div>
  )
}

export default LabUploadZone
