/**
 * BiomarkerCard Component
 * =======================
 *
 * Displays a single biomarker result with traffic-light status indicator.
 * Shows lab range, functional range, and interpretation.
 *
 * Note: Uses explicit hex colors for Tailwind 4 compatibility.
 */

import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import type { ExtractedBiomarker, BiomarkerStatus } from '../../../types';

export interface BiomarkerCardProps {
  /** Biomarker data to display. */
  marker: ExtractedBiomarker;
  /** Whether to show expanded details. */
  expanded?: boolean;
  /** Toggle expanded state. */
  onToggle?: () => void;
  /** Whether to show functional range comparison. */
  showFunctionalRange?: boolean;
}

/**
 * Get status indicator config.
 */
function getStatusConfig(status: BiomarkerStatus): {
  icon: typeof AlertCircle;
  bgColor: string;
  textColor: string;
  borderColor: string;
  label: string;
} {
  switch (status) {
    case 'critical':
      return {
        icon: AlertCircle,
        bgColor: 'bg-[#FEF2F2]',
        textColor: 'text-[#B91C1C]',
        borderColor: 'border-[#FECACA]',
        label: 'Crítico',
      };
    case 'attention':
      return {
        icon: AlertTriangle,
        bgColor: 'bg-[#FFFBEB]',
        textColor: 'text-[#B45309]',
        borderColor: 'border-[#FDE68A]',
        label: 'Atenção',
      };
    case 'normal':
    default:
      return {
        icon: CheckCircle,
        bgColor: 'bg-[#F0FDF4]',
        textColor: 'text-[#15803D]',
        borderColor: 'border-[#BBF7D0]',
        label: 'Normal',
      };
  }
}

/**
 * Calculate position on range bar.
 */
function calculatePosition(
  value: number,
  min: number,
  max: number
): number {
  if (value <= min) return 0;
  if (value >= max) return 100;
  return ((value - min) / (max - min)) * 100;
}

/**
 * BiomarkerCard displays a single lab result with visual indicators.
 */
export function BiomarkerCard({
  marker,
  expanded = false,
  onToggle,
  showFunctionalRange = true,
}: BiomarkerCardProps) {
  const config = getStatusConfig(marker.status);
  const StatusIcon = config.icon;

  // Calculate range visualization
  const labMin = marker.labRange.min;
  const labMax = marker.labRange.max;
  const range = labMax - labMin;
  const displayMin = labMin - range * 0.2;
  const displayMax = labMax + range * 0.2;
  const valuePosition = calculatePosition(marker.value, displayMin, displayMax);
  const labMinPos = calculatePosition(labMin, displayMin, displayMax);
  const labMaxPos = calculatePosition(labMax, displayMin, displayMax);

  return (
    <div
      className={`rounded-lg border ${config.borderColor} ${config.bgColor} p-4 transition-all`}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <StatusIcon className={`w-5 h-5 ${config.textColor}`} />
          <div>
            <h4 className="font-medium text-genesis-dark">{marker.name}</h4>
            <p className="text-sm text-genesis-muted">{marker.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Value display */}
          <div className="text-right">
            <span className={`text-xl font-bold ${config.textColor}`}>
              {marker.value.toLocaleString('pt-BR')}
            </span>
            <span className="text-sm text-genesis-muted ml-1">{marker.unit}</span>
          </div>

          {/* Expand toggle */}
          {onToggle && (
            <button className="p-1 hover:bg-genesis-surface/50 rounded">
              {expanded ? (
                <ChevronUp className="w-4 h-4 text-genesis-subtle" />
              ) : (
                <ChevronDown className="w-4 h-4 text-genesis-subtle" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Range bar visualization */}
      <div className="mt-4 relative h-2 bg-genesis-border-subtle rounded-full overflow-visible">
        {/* Lab range highlight */}
        <div
          className="absolute h-full bg-genesis-border rounded-full"
          style={{
            left: `${labMinPos}%`,
            width: `${labMaxPos - labMinPos}%`,
          }}
        />

        {/* Value marker */}
        <div
          className={`absolute w-3 h-3 rounded-full border-2 border-white shadow-md -top-0.5 transform -translate-x-1/2 ${
            marker.status === 'critical'
              ? 'bg-[#EF4444]'
              : marker.status === 'attention'
              ? 'bg-[#F59E0B]'
              : 'bg-[#22C55E]'
          }`}
          style={{ left: `${valuePosition}%` }}
        />
      </div>

      {/* Range labels */}
      <div className="flex justify-between mt-1 text-xs text-genesis-subtle">
        <span>{marker.labRange.min}</span>
        <span className="font-medium text-genesis-muted">
          Ref: {marker.labRange.min} - {marker.labRange.max}
        </span>
        <span>{marker.labRange.max}</span>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-genesis-border/50 space-y-3">
          {/* Interpretation */}
          <div>
            <h5 className="text-xs font-medium text-genesis-muted uppercase mb-1">
              Interpretação
            </h5>
            <p className="text-sm text-genesis-text">{marker.interpretation}</p>
          </div>

          {/* Functional range comparison */}
          {showFunctionalRange && (
            <div>
              <h5 className="text-xs font-medium text-genesis-muted uppercase mb-1">
                Range Funcional Ótimo
              </h5>
              <p className="text-sm text-genesis-text">
                {marker.functionalRange.min} - {marker.functionalRange.max} {marker.unit}
              </p>
              {marker.deviationScore !== undefined && marker.deviationScore > 0 && (
                <p className="text-xs text-[#D97706] mt-1">
                  Desvio do ótimo: {(marker.deviationScore * 100).toFixed(0)}%
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BiomarkerCard;
