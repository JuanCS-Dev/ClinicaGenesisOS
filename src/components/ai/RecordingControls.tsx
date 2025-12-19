/**
 * RecordingControls Component
 * ===========================
 *
 * UI controls for audio recording (start, stop, pause, resume).
 * Displays recording status and duration.
 */

import React from 'react';
import { Mic, Square, Pause, Play, Loader2 } from 'lucide-react';
import type { AIScribeStatus } from '../../types';

interface RecordingControlsProps {
  /** Current scribe status. */
  status: AIScribeStatus;
  /** Recording duration in seconds. */
  duration: number;
  /** Whether recording is paused. */
  isPaused: boolean;
  /** Called when user clicks start. */
  onStart: () => void;
  /** Called when user clicks stop. */
  onStop: () => void;
  /** Called when user clicks pause. */
  onPause: () => void;
  /** Called when user clicks resume. */
  onResume: () => void;
  /** Whether controls are disabled. */
  disabled?: boolean;
}

/**
 * Format seconds to MM:SS display.
 */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get status message for display.
 */
function getStatusMessage(status: AIScribeStatus, isPaused: boolean): string {
  if (isPaused) return 'Pausado';

  switch (status) {
    case 'idle':
      return 'Pronto para gravar';
    case 'recording':
      return 'Gravando...';
    case 'uploading':
      return 'Enviando áudio...';
    case 'processing':
      return 'Processando com IA...';
    case 'ready':
      return 'Pronto para revisão';
    case 'error':
      return 'Erro no processamento';
    default:
      return '';
  }
}

/**
 * Recording controls with visual feedback.
 *
 * Shows appropriate buttons based on current status:
 * - Idle: Start button
 * - Recording: Pause/Stop buttons
 * - Paused: Resume/Stop buttons
 * - Processing: Loading indicator
 */
export function RecordingControls({
  status,
  duration,
  isPaused,
  onStart,
  onStop,
  onPause,
  onResume,
  disabled = false,
}: RecordingControlsProps): React.ReactElement {
  const isRecording = status === 'recording';
  const isProcessing = status === 'uploading' || status === 'processing';
  const isIdle = status === 'idle';
  const canRecord = isIdle && !disabled;
  const canStop = (isRecording || isPaused) && !disabled;

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl border border-gray-200">
      {/* Status indicator */}
      <div className="flex items-center gap-2">
        {isRecording && !isPaused && (
          <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        )}
        {isPaused && (
          <span className="w-3 h-3 bg-yellow-500 rounded-full" />
        )}
        {isProcessing && (
          <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
        )}
        <span className="text-sm font-medium text-gray-600">
          {getStatusMessage(status, isPaused)}
        </span>
      </div>

      {/* Duration display */}
      {(isRecording || isPaused) && (
        <div className="text-4xl font-mono font-bold text-gray-900">
          {formatDuration(duration)}
        </div>
      )}

      {/* Control buttons */}
      <div className="flex items-center gap-3">
        {/* Start button (only when idle) */}
        {isIdle && (
          <button
            onClick={onStart}
            disabled={!canRecord}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-full font-medium
              transition-all duration-200
              ${canRecord
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
            `}
          >
            <Mic className="w-5 h-5" />
            Iniciar Gravação
          </button>
        )}

        {/* Recording controls */}
        {(isRecording || isPaused) && (
          <>
            {/* Pause/Resume button */}
            <button
              onClick={isPaused ? onResume : onPause}
              disabled={disabled}
              className={`
                flex items-center justify-center w-12 h-12 rounded-full
                transition-all duration-200
                ${isPaused
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-yellow-500 hover:bg-yellow-600 text-white'}
              `}
              title={isPaused ? 'Continuar' : 'Pausar'}
            >
              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </button>

            {/* Stop button */}
            <button
              onClick={onStop}
              disabled={!canStop}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-full font-medium
                transition-all duration-200
                ${canStop
                  ? 'bg-gray-800 hover:bg-gray-900 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
              `}
            >
              <Square className="w-4 h-4" />
              Finalizar
            </button>
          </>
        )}

        {/* Processing state */}
        {isProcessing && (
          <div className="flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-700 rounded-full">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-medium">
              {status === 'uploading' ? 'Enviando...' : 'Analisando...'}
            </span>
          </div>
        )}
      </div>

      {/* Microphone permission hint */}
      {isIdle && (
        <p className="text-xs text-gray-500 text-center max-w-xs">
          Clique para iniciar a gravação da consulta.
          O áudio será processado pela IA para gerar a nota SOAP.
        </p>
      )}

      {/* Recording hint */}
      {isRecording && !isPaused && (
        <p className="text-xs text-gray-500 text-center">
          Gravando conversa. Fale naturalmente com o paciente.
        </p>
      )}
    </div>
  );
}

export default RecordingControls;
