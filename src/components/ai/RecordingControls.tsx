/**
 * RecordingControls Component
 * ===========================
 *
 * Enhanced UI controls for AI Scribe audio recording.
 * Features visual waveform, status indicators, and processing feedback.
 *
 * Inspired by Elation Health Note Assist and Carbon Health AI charting.
 */

import React, { useEffect, useState, useRef } from 'react';
import { Mic, Square, Pause, Play, Loader2, Radio, CheckCircle2, Sparkles } from 'lucide-react';
import type { AIScribeStatus } from '../../types';

// ============================================================================
// Types
// ============================================================================

interface RecordingControlsProps {
  status: AIScribeStatus;
  duration: number;
  isPaused: boolean;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
  disabled?: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function getStatusMessage(status: AIScribeStatus, isPaused: boolean): string {
  if (isPaused) return 'Gravação pausada';

  switch (status) {
    case 'idle':
      return 'Pronto para gravar';
    case 'recording':
      return 'Gravando consulta';
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

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Animated audio waveform visualization.
 * Simulates audio levels when recording is active.
 */
const AudioWaveform: React.FC<{ isActive: boolean; isPaused: boolean }> = ({
  isActive,
  isPaused,
}) => {
  const [levels, setLevels] = useState<number[]>(Array(20).fill(0.1));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setLevels((prev) =>
          prev.map(() => 0.15 + Math.random() * 0.85)
        );
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (isPaused) {
        setLevels(Array(20).fill(0.3));
      } else {
        setLevels(Array(20).fill(0.1));
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused]);

  return (
    <div className="flex items-center justify-center gap-0.5 h-16 px-4">
      {levels.map((level, i) => (
        <div
          key={i}
          className={`w-1 rounded-full transition-all duration-100 ${
            isActive && !isPaused
              ? 'bg-red-500'
              : isPaused
                ? 'bg-amber-400'
                : 'bg-genesis-border'
          }`}
          style={{
            height: `${level * 100}%`,
            opacity: isActive || isPaused ? 0.8 : 0.3,
          }}
        />
      ))}
    </div>
  );
};

/**
 * Processing state indicator with animated steps.
 */
const ProcessingIndicator: React.FC<{ status: 'uploading' | 'processing' }> = ({
  status,
}) => {
  const steps = [
    { id: 'upload', label: 'Enviando áudio', done: status === 'processing' },
    { id: 'process', label: 'Analisando com IA', done: false },
    { id: 'generate', label: 'Gerando SOAP', done: false },
  ];

  const currentStep = status === 'uploading' ? 0 : 1;

  return (
    <div className="w-full max-w-sm space-y-3">
      {/* Progress bar */}
      <div className="h-2 bg-genesis-border rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-500 animate-pulse"
          style={{
            background: 'linear-gradient(to right, #3b82f6, #6366f1)',
            width: `${((currentStep + 1) / steps.length) * 100}%`
          }}
        />
      </div>

      {/* Steps */}
      <div className="flex justify-between">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center gap-1.5">
            {step.done ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : i === currentStep ? (
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-genesis-border" />
            )}
            <span
              className={`text-xs ${
                i <= currentStep ? 'text-genesis-dark' : 'text-genesis-muted'
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

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
    <div
      className={`
        relative overflow-hidden rounded-2xl border transition-all duration-300
        ${isRecording && !isPaused
          ? 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200 shadow-lg shadow-red-100'
          : isPaused
            ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200'
            : isProcessing
              ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'
              : 'bg-genesis-surface border-genesis-border-subtle'}
      `}
    >
      {/* Recording pulse ring animation */}
      {isRecording && !isPaused && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="absolute w-32 h-32 bg-red-400/20 rounded-full animate-ping" />
          <div className="absolute w-24 h-24 bg-red-400/30 rounded-full animate-pulse" />
        </div>
      )}

      <div className="relative flex flex-col items-center gap-4 p-6">
        {/* Status indicator with icon */}
        <div className="flex items-center gap-2">
          {isRecording && !isPaused && (
            <Radio className="w-4 h-4 text-red-500 animate-pulse" />
          )}
          {isPaused && (
            <Pause className="w-4 h-4 text-amber-500" />
          )}
          {isProcessing && (
            <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
          )}
          {isIdle && (
            <Mic className="w-4 h-4 text-genesis-muted" />
          )}
          <span
            className={`text-sm font-medium ${
              isRecording && !isPaused
                ? 'text-red-700'
                : isPaused
                  ? 'text-amber-700'
                  : isProcessing
                    ? 'text-blue-700'
                    : 'text-genesis-medium'
            }`}
          >
            {getStatusMessage(status, isPaused)}
          </span>
        </div>

        {/* Audio waveform visualization */}
        {(isRecording || isPaused) && (
          <AudioWaveform isActive={isRecording} isPaused={isPaused} />
        )}

        {/* Duration display */}
        {(isRecording || isPaused) && (
          <div
            className={`text-5xl font-mono font-bold tracking-tight ${
              isRecording && !isPaused ? 'text-red-600' : 'text-amber-600'
            }`}
          >
            {formatDuration(duration)}
          </div>
        )}

        {/* Processing indicator */}
        {isProcessing && (
          <ProcessingIndicator status={status as 'uploading' | 'processing'} />
        )}

        {/* Control buttons */}
        <div className="flex items-center gap-3 mt-2">
          {/* Start button (only when idle) */}
          {isIdle && (
            <button
              onClick={onStart}
              disabled={!canRecord}
              className={`
                flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-lg
                transition-all duration-200 transform
                ${canRecord
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-200 hover:shadow-xl hover:-translate-y-0.5'
                  : 'bg-genesis-border-subtle text-genesis-subtle cursor-not-allowed'}
              `}
            >
              <Mic className="w-6 h-6" />
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
                  flex items-center justify-center w-14 h-14 rounded-full
                  transition-all duration-200 transform hover:-translate-y-0.5
                  ${isPaused
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                    : 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-200'}
                `}
                title={isPaused ? 'Continuar' : 'Pausar'}
              >
                {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
              </button>

              {/* Stop button */}
              <button
                onClick={onStop}
                disabled={!canStop}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-full font-semibold
                  transition-all duration-200 transform hover:-translate-y-0.5
                  ${canStop
                    ? 'bg-genesis-dark hover:bg-slate-900 dark:hover:bg-slate-800 text-white shadow-lg'
                    : 'bg-genesis-border-subtle text-genesis-subtle cursor-not-allowed'}
                `}
              >
                <Square className="w-5 h-5" />
                Finalizar e Processar
              </button>
            </>
          )}
        </div>

        {/* Helpful hints */}
        {isIdle && (
          <p className="text-sm text-genesis-muted text-center max-w-sm mt-2">
            A IA irá transcrever a consulta e gerar a nota SOAP automaticamente.
          </p>
        )}

        {isRecording && !isPaused && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-100 rounded-lg mt-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <p className="text-sm text-red-700">
              Fale naturalmente. A IA está capturando a conversa.
            </p>
          </div>
        )}

        {isPaused && (
          <p className="text-sm text-amber-700 text-center mt-2">
            Gravação pausada. Clique em continuar ou finalize para processar.
          </p>
        )}
      </div>
    </div>
  );
}

export default RecordingControls;
