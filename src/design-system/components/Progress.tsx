/**
 * Genesis Design System - Progress Component
 * ==========================================
 *
 * Premium progress indicators with multiple variants.
 * Features animated bars, circular progress, and loading states.
 *
 * @example
 * ```tsx
 * <ProgressBar value={75} showLabel />
 * <ProgressCircular value={60} size="lg" />
 * <LoadingDots />
 * ```
 *
 * @module design-system/components/Progress
 * @version 1.0.0
 */

import React from 'react';

// ============================================================================
// Linear Progress Bar
// ============================================================================

export type ProgressVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type ProgressSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ProgressBarProps {
  /** Current value (0-100) */
  value?: number;
  /** Show indeterminate animation */
  indeterminate?: boolean;
  /** Color variant */
  variant?: ProgressVariant;
  /** Height of the bar */
  size?: ProgressSize;
  /** Show percentage label */
  showLabel?: boolean;
  /** Label position */
  labelPosition?: 'inside' | 'right';
  /** Custom label text */
  label?: string;
  /** Animate value changes */
  animated?: boolean;
  /** Custom className */
  className?: string;
  /** Accessible label */
  'aria-label'?: string;
}

const variantColors: Record<ProgressVariant, string> = {
  primary: 'bg-[var(--color-genesis-primary)]',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-[var(--color-danger)]',
  info: 'bg-blue-500',
};

const variantGradientStyles: Record<ProgressVariant, string> = {
  primary: 'linear-gradient(to right, var(--color-genesis-primary), var(--color-genesis-primary-dark))',
  success: 'linear-gradient(to right, #34d399, #059669)',
  warning: 'linear-gradient(to right, #fbbf24, #d97706)',
  danger: 'linear-gradient(to right, #f87171, #dc2626)',
  info: 'linear-gradient(to right, #60a5fa, #2563eb)',
};

const sizeStyles: Record<ProgressSize, { height: string; fontSize: string }> = {
  xs: { height: 'h-1', fontSize: 'text-[10px]' },
  sm: { height: 'h-2', fontSize: 'text-xs' },
  md: { height: 'h-3', fontSize: 'text-xs' },
  lg: { height: 'h-4', fontSize: 'text-sm' },
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value = 0,
  indeterminate = false,
  variant = 'primary',
  size = 'md',
  showLabel = false,
  labelPosition = 'right',
  label,
  animated = true,
  className = '',
  'aria-label': ariaLabel,
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  const sizeConfig = sizeStyles[size];

  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel || label || `${clampedValue}% completo`}
    >
      {/* Track */}
      <div className={`
        flex-1 ${sizeConfig.height}
        bg-[var(--color-genesis-border)]
        rounded-full overflow-hidden
      `}>
        {/* Bar */}
        {indeterminate ? (
          <div
            className="h-full w-1/3 rounded-full animate-[progress-indeterminate_1.5s_ease-in-out_infinite]"
            style={{ background: variantGradientStyles[variant] }}
          />
        ) : (
          <div
            className={`
              h-full rounded-full
              ${animated ? 'transition-all duration-500 ease-out' : ''}
              ${clampedValue > 0 ? 'min-w-[4px]' : ''}
              flex items-center justify-end
            `}
            style={{ background: variantGradientStyles[variant], width: `${clampedValue}%` }}
          >
            {showLabel && labelPosition === 'inside' && size !== 'xs' && size !== 'sm' && (
              <span className={`
                px-1.5 font-medium text-white ${sizeConfig.fontSize}
              `}>
                {label || `${clampedValue}%`}
              </span>
            )}
          </div>
        )}
      </div>

      {/* External label */}
      {showLabel && labelPosition === 'right' && !indeterminate && (
        <span className={`
          font-medium text-[var(--color-genesis-text)] ${sizeConfig.fontSize}
          min-w-[3ch]
        `}>
          {label || `${clampedValue}%`}
        </span>
      )}
    </div>
  );
};

ProgressBar.displayName = 'ProgressBar';

// ============================================================================
// Circular Progress
// ============================================================================

export interface ProgressCircularProps {
  /** Current value (0-100) */
  value?: number;
  /** Show indeterminate animation */
  indeterminate?: boolean;
  /** Size of the circle */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Stroke width */
  strokeWidth?: number;
  /** Color variant */
  variant?: ProgressVariant;
  /** Show value in center */
  showLabel?: boolean;
  /** Custom label */
  label?: React.ReactNode;
  /** Custom className */
  className?: string;
}

const circularSizes = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 80,
};

export const ProgressCircular: React.FC<ProgressCircularProps> = ({
  value = 0,
  indeterminate = false,
  size = 'md',
  strokeWidth = 4,
  variant = 'primary',
  showLabel = false,
  label,
  className = '',
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  const diameter = circularSizes[size];
  const radius = (diameter - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

  const variantStrokeColors: Record<ProgressVariant, string> = {
    primary: 'var(--color-genesis-primary)',
    success: '#10b981',
    warning: '#f59e0b',
    danger: 'var(--color-danger)',
    info: '#3b82f6',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg
        width={diameter}
        height={diameter}
        className={indeterminate ? 'animate-spin' : ''}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background track */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke="var(--color-genesis-border)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke={variantStrokeColors[variant]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={indeterminate ? circumference * 0.75 : strokeDashoffset}
          className="transition-all duration-500 ease-out"
        />
      </svg>

      {/* Center label */}
      {showLabel && !indeterminate && (
        <div className="absolute inset-0 flex items-center justify-center">
          {label ?? (
            <span className={`
              font-semibold text-[var(--color-genesis-text)]
              ${size === 'sm' ? 'text-[10px]' : size === 'md' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-base'}
            `}>
              {clampedValue}%
            </span>
          )}
        </div>
      )}
    </div>
  );
};

ProgressCircular.displayName = 'ProgressCircular';

// ============================================================================
// Loading Dots
// ============================================================================

export interface LoadingDotsProps {
  /** Size of dots */
  size?: 'sm' | 'md' | 'lg';
  /** Color variant */
  variant?: ProgressVariant;
  /** Custom className */
  className?: string;
}

const dotSizes = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-3 h-3',
};

export const LoadingDots: React.FC<LoadingDotsProps> = ({
  size = 'md',
  variant = 'primary',
  className = '',
}) => {
  return (
    <div
      className={`inline-flex items-center gap-1 ${className}`}
      role="status"
      aria-label="Carregando"
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`
            ${dotSizes[size]}
            ${variantColors[variant]}
            rounded-full
            animate-bounce
          `}
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
      <span className="sr-only">Carregando...</span>
    </div>
  );
};

LoadingDots.displayName = 'LoadingDots';

// ============================================================================
// Loading Spinner
// ============================================================================

export interface LoadingSpinnerProps {
  /** Size of spinner */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Color variant */
  variant?: ProgressVariant;
  /** Custom className */
  className?: string;
}

const spinnerSizes = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  className = '',
}) => {
  const strokeColor = variantColors[variant].replace('bg-', 'text-');

  return (
    <svg
      className={`animate-spin ${spinnerSizes[size]} ${strokeColor} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="status"
      aria-label="Carregando"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
      <span className="sr-only">Carregando...</span>
    </svg>
  );
};

LoadingSpinner.displayName = 'LoadingSpinner';

// ============================================================================
// Step Progress
// ============================================================================

export interface StepProgressProps {
  /** Total number of steps */
  steps: number;
  /** Current step (1-indexed) */
  currentStep: number;
  /** Step labels */
  labels?: string[];
  /** Color variant */
  variant?: ProgressVariant;
  /** Custom className */
  className?: string;
}

export const StepProgress: React.FC<StepProgressProps> = ({
  steps,
  currentStep,
  labels,
  variant = 'primary',
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      {/* Step indicators */}
      <div className="flex items-center">
        {Array.from({ length: steps }, (_, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <React.Fragment key={i}>
              {/* Step circle */}
              <div
                className={`
                  flex items-center justify-center
                  w-8 h-8 rounded-full font-medium text-sm
                  transition-all duration-300
                  ${isCompleted
                    ? `${variantColors[variant]} text-white`
                    : isCurrent
                      ? `ring-2 ring-[var(--color-genesis-primary)] ring-offset-2 bg-[var(--color-genesis-surface)] text-[var(--color-genesis-primary)]`
                      : 'bg-[var(--color-genesis-border)] text-[var(--color-genesis-muted)]'
                  }
                `}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>

              {/* Connector line */}
              {i < steps - 1 && (
                <div
                  className={`
                    flex-1 h-1 mx-2 rounded-full transition-all duration-300
                    ${isCompleted ? variantColors[variant] : 'bg-[var(--color-genesis-border)]'}
                  `}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Labels */}
      {labels && labels.length > 0 && (
        <div className="flex justify-between mt-2">
          {labels.slice(0, steps).map((label, i) => (
            <span
              key={i}
              className={`
                text-xs font-medium
                ${i + 1 <= currentStep
                  ? 'text-[var(--color-genesis-text)]'
                  : 'text-[var(--color-genesis-muted)]'
                }
              `}
              style={{ width: `${100 / steps}%`, textAlign: 'center' }}
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

StepProgress.displayName = 'StepProgress';

// ============================================================================
// Exports
// ============================================================================

export default {
  Bar: ProgressBar,
  Circular: ProgressCircular,
  Dots: LoadingDots,
  Spinner: LoadingSpinner,
  Steps: StepProgress,
};
