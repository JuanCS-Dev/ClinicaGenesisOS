/**
 * Confidence Gauge Component
 * ==========================
 *
 * Visual gauge displaying AI confidence level for diagnoses.
 * Uses color-coded radial gauge for quick visual assessment.
 *
 * Fase 13: Clinical Reasoning Explainability
 */

import React, { useMemo } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
  Shield,
} from 'lucide-react';
import type { ConsensusLevel } from '@/types/clinical-reasoning';

/**
 * Props for ConfidenceGauge component.
 */
interface ConfidenceGaugeProps {
  /** Confidence value (0-100) */
  confidence: number;
  /** Optional consensus level from multi-LLM */
  consensusLevel?: ConsensusLevel;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show label */
  showLabel?: boolean;
  /** Show consensus badge */
  showConsensus?: boolean;
}

/**
 * Get color based on confidence level.
 */
function getConfidenceConfig(confidence: number): {
  color: string;
  bgColor: string;
  strokeColor: string;
  label: string;
  icon: React.ReactNode;
} {
  if (confidence >= 80) {
    return {
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      strokeColor: '#22c55e',
      label: 'Alta',
      icon: <CheckCircle2 className="w-full h-full" />,
    };
  }
  if (confidence >= 60) {
    return {
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      strokeColor: '#3b82f6',
      label: 'Boa',
      icon: <Shield className="w-full h-full" />,
    };
  }
  if (confidence >= 40) {
    return {
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
      strokeColor: '#f59e0b',
      label: 'Moderada',
      icon: <HelpCircle className="w-full h-full" />,
    };
  }
  if (confidence >= 20) {
    return {
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      strokeColor: '#ea580c',
      label: 'Baixa',
      icon: <AlertCircle className="w-full h-full" />,
    };
  }
  return {
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    strokeColor: '#dc2626',
    label: 'Muito Baixa',
    icon: <ShieldAlert className="w-full h-full" />,
  };
}

/**
 * Get size config.
 */
function getSizeConfig(size: 'sm' | 'md' | 'lg'): {
  containerSize: number;
  strokeWidth: number;
  fontSize: string;
  iconSize: string;
} {
  switch (size) {
    case 'sm':
      return {
        containerSize: 48,
        strokeWidth: 4,
        fontSize: 'text-xs',
        iconSize: 'w-3 h-3',
      };
    case 'lg':
      return {
        containerSize: 96,
        strokeWidth: 8,
        fontSize: 'text-xl',
        iconSize: 'w-6 h-6',
      };
    default:
      return {
        containerSize: 64,
        strokeWidth: 6,
        fontSize: 'text-sm',
        iconSize: 'w-4 h-4',
      };
  }
}

/**
 * Get consensus badge config.
 */
function getConsensusBadge(level?: ConsensusLevel): {
  label: string;
  color: string;
  bgColor: string;
} | null {
  if (!level) return null;

  switch (level) {
    case 'strong':
      return {
        label: 'Consenso Forte',
        color: 'text-green-700',
        bgColor: 'bg-green-100',
      };
    case 'moderate':
      return {
        label: 'Consenso Moderado',
        color: 'text-blue-700',
        bgColor: 'bg-blue-100',
      };
    case 'weak':
      return {
        label: 'Consenso Fraco',
        color: 'text-amber-700',
        bgColor: 'bg-amber-100',
      };
    case 'single':
      return {
        label: 'Modelo Único',
        color: 'text-genesis-text',
        bgColor: 'bg-genesis-hover',
      };
    case 'divergent':
      return {
        label: 'Divergente',
        color: 'text-red-700',
        bgColor: 'bg-red-100',
      };
    default:
      return null;
  }
}

/**
 * Confidence Gauge component.
 */
export const ConfidenceGauge: React.FC<ConfidenceGaugeProps> = ({
  confidence,
  consensusLevel,
  size: sizeProp = 'md',
  showLabel = true,
  showConsensus = true,
}) => {
  const config = useMemo(() => getConfidenceConfig(confidence), [confidence]);
  // Ensure size is one of the valid options
  const size: 'sm' | 'md' | 'lg' = 
    sizeProp === 'sm' || sizeProp === 'lg' ? sizeProp : 'md';
  const sizeConfig = useMemo(() => getSizeConfig(size), [size]);
  const consensusBadge = useMemo(
    () => getConsensusBadge(consensusLevel),
    [consensusLevel]
  );

  // SVG calculations
  const radius = (sizeConfig.containerSize - sizeConfig.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (confidence / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Radial gauge */}
      <div
        className="relative"
        style={{
          width: sizeConfig.containerSize,
          height: sizeConfig.containerSize,
        }}
      >
        {/* Background circle */}
        <svg
          className="absolute inset-0 -rotate-90"
          width={sizeConfig.containerSize}
          height={sizeConfig.containerSize}
        >
          <circle
            cx={sizeConfig.containerSize / 2}
            cy={sizeConfig.containerSize / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={sizeConfig.strokeWidth}
          />
          {/* Progress arc */}
          <circle
            cx={sizeConfig.containerSize / 2}
            cy={sizeConfig.containerSize / 2}
            r={radius}
            fill="none"
            stroke={config.strokeColor}
            strokeWidth={sizeConfig.strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold ${config.color} ${sizeConfig.fontSize}`}>
            {confidence}%
          </span>
        </div>
      </div>

      {/* Label */}
      {showLabel && (
        <div className="flex items-center gap-1.5">
          <div className={`${sizeConfig.iconSize} ${config.color}`}>
            {config.icon}
          </div>
          <span className={`text-xs font-medium ${config.color}`}>
            {config.label}
          </span>
        </div>
      )}

      {/* Consensus badge */}
      {showConsensus && consensusBadge && (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${consensusBadge.bgColor} ${consensusBadge.color}`}
        >
          {consensusBadge.label}
        </span>
      )}
    </div>
  );
};

/**
 * Horizontal confidence bar variant.
 */
interface ConfidenceBarProps {
  confidence: number;
  label?: string;
  showPercentage?: boolean;
  height?: 'sm' | 'md';
}

export const ConfidenceBar: React.FC<ConfidenceBarProps> = ({
  confidence,
  label,
  showPercentage = true,
  height = 'md',
}) => {
  const config = useMemo(() => getConfidenceConfig(confidence), [confidence]);
  const heightClass = height === 'sm' ? 'h-1.5' : 'h-2.5';

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-1">
          {label && (
            <span className="text-xs text-genesis-medium">{label}</span>
          )}
          {showPercentage && (
            <span className={`text-xs font-medium ${config.color}`}>
              {confidence}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-genesis-border-subtle rounded-full overflow-hidden ${heightClass}`}>
        <div
          className={`${heightClass} transition-all duration-500`}
          style={{
            width: `${confidence}%`,
            backgroundColor: config.strokeColor,
          }}
        />
      </div>
    </div>
  );
};

export default ConfidenceGauge;

