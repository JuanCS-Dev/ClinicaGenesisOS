/**
 * LabUploadPanel Component
 * ========================
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
 * Note: Uses explicit hex colors for Tailwind 4 compatibility.
 */

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  Camera,
  FolderOpen,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  Sparkles,
  Brain,
  Zap,
  Shield,
} from 'lucide-react';
import type { LabAnalysisStatus } from '../../../types';

interface LabUploadPanelProps {
  status: LabAnalysisStatus;
  error?: string | null;
  onFileSelect: (file: File) => void;
  onCancel?: () => void;
  disabled?: boolean;
}

/**
 * Processing stage configuration.
 */
const PROCESSING_STAGES = [
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
] as const;

/**
 * Get current stage index.
 */
function getStageIndex(status: LabAnalysisStatus): number {
  switch (status) {
    case 'uploading':
      return 0;
    case 'extracting':
      return 1;
    case 'processing':
      return 2;
    default:
      return -1;
  }
}

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragHovering, setIsDragHovering] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0 && !disabled) {
        const file = acceptedFiles[0];
        setSelectedFile(file);
        onFileSelect(file);
      }
    },
    [onFileSelect, disabled]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragHovering(true),
    onDragLeave: () => setIsDragHovering(false),
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 15 * 1024 * 1024,
    multiple: false,
    disabled: disabled || status !== 'idle',
    noClick: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);

  const isProcessing = ['uploading', 'extracting', 'processing'].includes(status);
  const currentStageIndex = getStageIndex(status);

  // Idle state - show upload UI
  if (status === 'idle') {
    return (
      <div className="animate-[scaleIn_0.4s_cubic-bezier(0.16,1,0.3,1)_forwards]">
        {/* Main Upload Area */}
        <div
          {...getRootProps()}
          className={`
            relative overflow-hidden rounded-2xl border-2 border-dashed
            transition-all duration-300 ease-out
            ${
              isDragActive || isDragHovering
                ? 'border-[#818CF8] bg-[#EEF2FF]/50 scale-[1.01]'
                : 'border-genesis-border bg-gradient-to-b from-white to-gray-50/50 hover:border-genesis-border hover:shadow-lg'
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
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.capture = 'environment';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        setSelectedFile(file);
                        onFileSelect(file);
                      }
                    };
                    input.click();
                  }}
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
          <FeatureItem
            icon={Shield}
            label="HIPAA Compliant"
            color="emerald"
          />
          <FeatureItem
            icon={Brain}
            label="Multi-LLM"
            color="indigo"
          />
          <FeatureItem
            icon={Zap}
            label="15-30 segundos"
            color="amber"
          />
        </div>

        {/* Supported Formats */}
        <p className="mt-6 text-center text-xs text-genesis-subtle">
          Formatos aceitos: PDF, JPG, PNG, WebP • Máximo 15MB
        </p>
      </div>
    );
  }

  // Processing state
  if (isProcessing) {
    return (
      <div className="animate-[fadeIn_0.3s_ease-out_forwards]">
        <div className="bg-genesis-surface rounded-2xl border border-genesis-border-subtle shadow-xl overflow-hidden">
          {/* Header with gradient */}
          <div className="relative px-6 py-5 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-genesis-surface/20 rounded-xl backdrop-blur-sm">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Processando Análise</h3>
                  <p className="text-sm text-[#E0E7FF]">
                    {selectedFile?.name || 'Exame laboratorial'}
                  </p>
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
                const StageIcon = stage.icon;
                const isActive = idx === currentStageIndex;
                const isCompleted = idx < currentStageIndex;

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
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="mt-6 h-1.5 bg-genesis-hover rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-full transition-all duration-500 ease-out"
                style={{
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
    );
  }

  // Ready state
  if (status === 'ready') {
    return (
      <div className="animate-[scaleIn_0.4s_cubic-bezier(0.16,1,0.3,1)_forwards]">
        <div className="bg-gradient-to-br from-[#ECFDF5] to-[#F0FDFA] rounded-2xl border border-[#A7F3D0] p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-[#D1FAE5] rounded-2xl">
              <CheckCircle className="w-12 h-12 text-[#059669]" />
            </div>
          </div>

          <h3 className="text-xl font-semibold text-[#064E3B] mb-2">
            Análise Concluída
          </h3>
          <p className="text-[#047857]">
            Resultados prontos para revisão médica
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <div className="animate-[scaleIn_0.4s_cubic-bezier(0.16,1,0.3,1)_forwards]">
        <div className="bg-gradient-to-br from-[#FEF2F2] to-[#FFF1F2] rounded-2xl border border-[#FECACA] p-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-[#FEE2E2] rounded-2xl">
              <AlertCircle className="w-12 h-12 text-[#DC2626]" />
            </div>
          </div>

          <h3 className="text-xl font-semibold text-[#7F1D1D] text-center mb-2">
            Erro no Processamento
          </h3>

          {error && (
            <p className="text-[#B91C1C] text-center mb-6 max-w-md mx-auto">
              {error}
            </p>
          )}

          {onCancel && (
            <div className="flex justify-center">
              <button
                onClick={onCancel}
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
    );
  }

  // Fallback
  return <div />;
}

/**
 * Feature item component.
 */
function FeatureItem({
  icon: Icon,
  label,
  color,
}: {
  icon: typeof Shield;
  label: string;
  color: 'emerald' | 'indigo' | 'amber';
}) {
  const colorClasses = {
    emerald: 'bg-[#ECFDF5] text-[#059669]',
    indigo: 'bg-[#EEF2FF] text-[#4F46E5]',
    amber: 'bg-[#FFFBEB] text-[#D97706]',
  };

  return (
    <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-genesis-soft/50">
      <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-xs font-medium text-genesis-medium">{label}</span>
    </div>
  );
}

export default LabUploadPanel;
