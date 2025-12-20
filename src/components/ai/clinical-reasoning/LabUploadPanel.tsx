/**
 * LabUploadPanel Component
 * ========================
 *
 * Upload interface for lab documents (images/PDFs).
 * Shows upload progress and processing status.
 */

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  FileText,
  Image,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
} from 'lucide-react';
import type { LabAnalysisStatus } from '../../../types';

interface LabUploadPanelProps {
  /** Current status of the analysis. */
  status: LabAnalysisStatus;
  /** Error message if any. */
  error?: string | null;
  /** Called when a file is selected. */
  onFileSelect: (file: File) => void;
  /** Called to cancel/reset. */
  onCancel?: () => void;
  /** Whether upload is disabled. */
  disabled?: boolean;
}

/**
 * Status display config.
 */
function getStatusDisplay(status: LabAnalysisStatus): {
  label: string;
  description: string;
  color: string;
} {
  switch (status) {
    case 'uploading':
      return {
        label: 'Enviando...',
        description: 'Fazendo upload do documento',
        color: 'text-blue-600',
      };
    case 'extracting':
      return {
        label: 'Extraindo...',
        description: 'OCR em andamento - identificando valores',
        color: 'text-purple-600',
      };
    case 'processing':
      return {
        label: 'Analisando...',
        description: 'IA processando racioc\u00ednio cl\u00ednico',
        color: 'text-indigo-600',
      };
    case 'ready':
      return {
        label: 'Conclu\u00eddo!',
        description: 'An\u00e1lise pronta para revis\u00e3o',
        color: 'text-green-600',
      };
    case 'error':
      return {
        label: 'Erro',
        description: 'Falha no processamento',
        color: 'text-red-600',
      };
    default:
      return {
        label: 'Pronto',
        description: 'Arraste um exame ou clique para selecionar',
        color: 'text-gray-600',
      };
  }
}

/**
 * LabUploadPanel provides a dropzone for lab document upload.
 */
export function LabUploadPanel({
  status,
  error,
  onFileSelect,
  onCancel,
  disabled = false,
}: LabUploadPanelProps): React.ReactElement {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 15 * 1024 * 1024, // 15MB
    multiple: false,
    disabled: disabled || status !== 'idle',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- react-dropzone v14 types incompatible with React 19
  } as any);

  const statusDisplay = getStatusDisplay(status);
  const isProcessing = ['uploading', 'extracting', 'processing'].includes(status);

  // Determine which icon to show based on file type
  const isPdf = selectedFile?.type === 'application/pdf';

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all
          ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : status === 'error'
              ? 'border-red-300 bg-red-50'
              : status === 'ready'
              ? 'border-green-300 bg-green-50'
              : 'border-gray-300 hover:border-gray-400 bg-gray-50'
          }
          ${disabled || isProcessing ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
        `}
      >
        <input {...getInputProps()} />

        {/* Icon */}
        <div className="flex justify-center mb-4">
          {isProcessing ? (
            <div className="p-4 bg-blue-100 rounded-full">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
          ) : status === 'ready' ? (
            <div className="p-4 bg-green-100 rounded-full">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          ) : status === 'error' ? (
            <div className="p-4 bg-red-100 rounded-full">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
          ) : selectedFile ? (
            <div className="p-4 bg-gray-100 rounded-full">
              {isPdf ? (
                <FileText className="w-10 h-10 text-gray-400" />
              ) : (
                <Image className="w-10 h-10 text-gray-400" />
              )}
            </div>
          ) : (
            <div className="p-4 bg-gray-100 rounded-full">
              <Upload className="w-10 h-10 text-gray-400" />
            </div>
          )}
        </div>

        {/* Status text */}
        <h3 className={`text-lg font-medium ${statusDisplay.color}`}>
          {statusDisplay.label}
        </h3>
        <p className="text-sm text-gray-500 mt-1">{statusDisplay.description}</p>

        {/* Selected file info */}
        {selectedFile && !isProcessing && status !== 'ready' && (
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm">
            {isPdf ? (
              <FileText className="w-4 h-4 text-gray-400" />
            ) : (
              <Image className="w-4 h-4 text-gray-400" />
            )}
            <span className="text-sm text-gray-700">{selectedFile.name}</span>
            <span className="text-xs text-gray-400">
              ({(selectedFile.size / 1024 / 1024).toFixed(1)}MB)
            </span>
          </div>
        )}

        {/* Error message */}
        {status === 'error' && error && (
          <div className="mt-4 p-3 bg-red-100 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Cancel button */}
        {onCancel && (isProcessing || status === 'error') && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCancel();
            }}
            className="absolute top-3 right-3 p-1.5 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* Supported formats hint */}
      {status === 'idle' && (
        <p className="text-xs text-gray-400 text-center">
          Formatos aceitos: JPG, PNG, WebP, PDF (m\u00e1x. 15MB)
        </p>
      )}

      {/* Processing steps */}
      {isProcessing && (
        <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
          <Step
            label="Upload"
            active={status === 'uploading'}
            complete={status !== 'uploading'}
          />
          <StepDivider />
          <Step
            label="OCR"
            active={status === 'extracting'}
            complete={status === 'processing'}
          />
          <StepDivider />
          <Step
            label="An\u00e1lise IA"
            active={status === 'processing'}
            complete={false}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Step indicator component.
 */
function Step({
  label,
  active,
  complete,
}: {
  label: string;
  active: boolean;
  complete: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`w-2 h-2 rounded-full ${
          complete
            ? 'bg-green-500'
            : active
            ? 'bg-blue-500 animate-pulse'
            : 'bg-gray-300'
        }`}
      />
      <span className={active ? 'font-medium text-gray-700' : ''}>{label}</span>
    </div>
  );
}

/**
 * Divider between steps.
 */
function StepDivider() {
  return <div className="w-8 h-px bg-gray-300" />;
}

export default LabUploadPanel;
