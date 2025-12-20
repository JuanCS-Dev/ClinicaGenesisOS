/**
 * BiomarkerCard Component
 * =======================
 *
 * Displays a single biomarker result with traffic-light status indicator.
 * Shows lab range, functional range, and interpretation.
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
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        borderColor: 'border-red-200',
        label: 'Cr\u00edtico',
      };
    case 'attention':
      return {
        icon: AlertTriangle,
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-700',
        borderColor: 'border-amber-200',
        label: 'Aten\u00e7\u00e3o',
      };
    case 'normal':
    default:
      return {
        icon: CheckCircle,
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-200',
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
            <h4 className="font-medium text-gray-900">{marker.name}</h4>
            <p className="text-sm text-gray-500">{marker.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Value display */}
          <div className="text-right">
            <span className={`text-xl font-bold ${config.textColor}`}>
              {marker.value.toLocaleString('pt-BR')}
            </span>
            <span className="text-sm text-gray-500 ml-1">{marker.unit}</span>
          </div>

          {/* Expand toggle */}
          {onToggle && (
            <button className="p-1 hover:bg-white/50 rounded">
              {expanded ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Range bar visualization */}
      <div className="mt-4 relative h-2 bg-gray-200 rounded-full overflow-visible">
        {/* Lab range highlight */}
        <div
          className="absolute h-full bg-gray-300 rounded-full"
          style={{
            left: `${labMinPos}%`,
            width: `${labMaxPos - labMinPos}%`,
          }}
        />

        {/* Value marker */}
        <div
          className={`absolute w-3 h-3 rounded-full border-2 border-white shadow-md -top-0.5 transform -translate-x-1/2 ${
            marker.status === 'critical'
              ? 'bg-red-500'
              : marker.status === 'attention'
              ? 'bg-amber-500'
              : 'bg-green-500'
          }`}
          style={{ left: `${valuePosition}%` }}
        />
      </div>

      {/* Range labels */}
      <div className="flex justify-between mt-1 text-xs text-gray-400">
        <span>{marker.labRange.min}</span>
        <span className="font-medium text-gray-500">
          Ref: {marker.labRange.min} - {marker.labRange.max}
        </span>
        <span>{marker.labRange.max}</span>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-200/50 space-y-3">
          {/* Interpretation */}
          <div>
            <h5 className="text-xs font-medium text-gray-500 uppercase mb-1">
              Interpreta\u00e7\u00e3o
            </h5>
            <p className="text-sm text-gray-700">{marker.interpretation}</p>
          </div>

          {/* Functional range comparison */}
          {showFunctionalRange && (
            <div>
              <h5 className="text-xs font-medium text-gray-500 uppercase mb-1">
                Range Funcional \u00d3timo
              </h5>
              <p className="text-sm text-gray-700">
                {marker.functionalRange.min} - {marker.functionalRange.max} {marker.unit}
              </p>
              {marker.deviationScore !== undefined && marker.deviationScore > 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  Desvio do \u00f3timo: {(marker.deviationScore * 100).toFixed(0)}%
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
