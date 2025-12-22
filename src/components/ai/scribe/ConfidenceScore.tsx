/**
 * Confidence Score Component
 * ==========================
 *
 * Displays AI confidence level for generated content.
 * Visual gauge with breakdown by SOAP field.
 *
 * Fase 12: AI Scribe Enhancement
 */

import React, { useMemo } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Info,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { SOAP_FIELD_LABELS, type ConfidenceScore, type SOAPField } from '@/types/scribe-metrics';

/**
 * Props for ConfidenceScore component.
 */
interface ConfidenceScoreProps {
  /** Confidence score data */
  score: ConfidenceScore;
  /** Show field breakdown */
  showBreakdown?: boolean;
  /** Show factors */
  showFactors?: boolean;
  /** Compact mode */
  compact?: boolean;
}

/**
 * Get color based on confidence level.
 */
function getConfidenceColor(value: number): {
  bg: string;
  text: string;
  border: string;
} {
  if (value >= 0.8) {
    return {
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-200',
    };
  }
  if (value >= 0.6) {
    return {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      border: 'border-blue-200',
    };
  }
  if (value >= 0.4) {
    return {
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      border: 'border-amber-200',
    };
  }
  return {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-200',
  };
}

/**
 * Get confidence label.
 */
function getConfidenceLabel(value: number): string {
  if (value >= 0.8) return 'Alta';
  if (value >= 0.6) return 'Boa';
  if (value >= 0.4) return 'Moderada';
  return 'Baixa';
}

/**
 * Get confidence icon.
 */
function getConfidenceIcon(value: number): React.ReactNode {
  if (value >= 0.8) return <CheckCircle2 className="w-4 h-4" />;
  if (value >= 0.6) return <Info className="w-4 h-4" />;
  if (value >= 0.4) return <AlertCircle className="w-4 h-4" />;
  return <AlertCircle className="w-4 h-4" />;
}

/**
 * Confidence Score component.
 */
export const ConfidenceScoreDisplay: React.FC<ConfidenceScoreProps> = ({
  score,
  showBreakdown = false,
  showFactors = false,
  compact = false,
}) => {
  const overallPercentage = Math.round(score.overall * 100);
  const colors = useMemo(() => getConfidenceColor(score.overall), [score.overall]);

  // Sort factors by absolute value
  const sortedFactors = useMemo(() => {
    return [...score.factors].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  }, [score.factors]);

  // Compact mode - just a badge
  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
        title={`Confiança: ${overallPercentage}%`}
      >
        {getConfidenceIcon(score.overall)}
        <span>{overallPercentage}%</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Overall score */}
      <div className={`p-4 rounded-xl border ${colors.border} ${colors.bg}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getConfidenceIcon(score.overall)}
            <span className={`font-medium ${colors.text}`}>
              Confiança {getConfidenceLabel(score.overall)}
            </span>
          </div>
          <span className={`text-2xl font-bold ${colors.text}`}>
            {overallPercentage}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-2 bg-white/50 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              score.overall >= 0.8
                ? 'bg-green-500'
                : score.overall >= 0.6
                  ? 'bg-blue-500'
                  : score.overall >= 0.4
                    ? 'bg-amber-500'
                    : 'bg-red-500'
            }`}
            style={{ width: `${overallPercentage}%` }}
          />
        </div>
      </div>

      {/* Field breakdown */}
      {showBreakdown && (
        <div className="p-4 bg-gray-50 rounded-xl">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Confiança por Campo
          </h4>
          <div className="space-y-2">
            {(Object.entries(score.fields) as [SOAPField, number][]).map(
              ([field, value]) => {
                const fieldColors = getConfidenceColor(value);
                return (
                  <div key={field} className="flex items-center gap-3">
                    <span className="w-20 text-sm text-gray-600">
                      {SOAP_FIELD_LABELS[field]}
                    </span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          value >= 0.8
                            ? 'bg-green-500'
                            : value >= 0.6
                              ? 'bg-blue-500'
                              : value >= 0.4
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.round(value * 100)}%` }}
                      />
                    </div>
                    <span className={`text-sm font-medium ${fieldColors.text}`}>
                      {Math.round(value * 100)}%
                    </span>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* Factors */}
      {showFactors && sortedFactors.length > 0 && (
        <div className="p-4 bg-gray-50 rounded-xl">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Fatores de Confiança
          </h4>
          <div className="space-y-2">
            {sortedFactors.map((factor, index) => (
              <div
                key={index}
                className="flex items-start gap-2 text-sm"
              >
                {factor.value > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <span
                    className={`font-medium ${
                      factor.value > 0 ? 'text-green-700' : 'text-red-700'
                    }`}
                  >
                    {factor.name}
                  </span>
                  <span className="text-gray-500 ml-1">
                    ({factor.value > 0 ? '+' : ''}{Math.round(factor.value * 100)}%)
                  </span>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {factor.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfidenceScoreDisplay;

