/**
 * CorrelationCard Component
 * =========================
 *
 * Displays a clinical correlation pattern with involved markers and implications.
 */

import React from 'react';
import { Link2, AlertTriangle, Info, ChevronRight } from 'lucide-react';
import type { ClinicalCorrelation, ConfidenceLevel } from '../../../types';

export interface CorrelationCardProps {
  /** Correlation data to display. */
  correlation: ClinicalCorrelation;
  /** Called when user wants to see more details. */
  onViewDetails?: () => void;
}

/**
 * Get confidence level config.
 */
function getConfidenceConfig(confidence: ConfidenceLevel): {
  label: string;
  bgColor: string;
  textColor: string;
} {
  switch (confidence) {
    case 'high':
      return {
        label: 'Alta',
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
      };
    case 'medium':
      return {
        label: 'M\u00e9dia',
        bgColor: 'bg-amber-100',
        textColor: 'text-amber-700',
      };
    case 'low':
    default:
      return {
        label: 'Baixa',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-600',
      };
  }
}

/**
 * Get pattern type icon and label.
 */
function getPatternIcon(type: string): {
  icon: typeof AlertTriangle;
  color: string;
} {
  const patterns: Record<string, { icon: typeof AlertTriangle; color: string }> = {
    metabolic_syndrome: { icon: AlertTriangle, color: 'text-orange-500' },
    insulin_resistance: { icon: AlertTriangle, color: 'text-amber-500' },
    diabetes_type2: { icon: AlertTriangle, color: 'text-red-500' },
    cardiovascular_risk: { icon: AlertTriangle, color: 'text-red-600' },
    hypothyroidism: { icon: Info, color: 'text-blue-500' },
    hyperthyroidism: { icon: AlertTriangle, color: 'text-purple-500' },
    iron_deficiency_anemia: { icon: Info, color: 'text-rose-500' },
    b12_deficiency: { icon: Info, color: 'text-pink-500' },
    chronic_inflammation: { icon: AlertTriangle, color: 'text-orange-500' },
    liver_dysfunction: { icon: AlertTriangle, color: 'text-yellow-600' },
    kidney_dysfunction: { icon: AlertTriangle, color: 'text-red-500' },
    infection_pattern: { icon: AlertTriangle, color: 'text-red-600' },
    autoimmune_pattern: { icon: Info, color: 'text-indigo-500' },
  };

  return patterns[type] || { icon: Link2, color: 'text-gray-500' };
}

/**
 * CorrelationCard displays a clinical pattern with its implications.
 */
export function CorrelationCard({
  correlation,
  onViewDetails,
}: CorrelationCardProps) {
  const confidenceConfig = getConfidenceConfig(correlation.confidence);
  const patternConfig = getPatternIcon(correlation.type);
  const PatternIcon = patternConfig.icon;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg bg-gray-50 ${patternConfig.color}`}>
            <PatternIcon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{correlation.pattern}</h4>
            {correlation.criteriaMet && (
              <p className="text-xs text-gray-500 mt-0.5">
                {correlation.criteriaMet}
              </p>
            )}
          </div>
        </div>

        {/* Confidence badge */}
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${confidenceConfig.bgColor} ${confidenceConfig.textColor}`}
        >
          Confian\u00e7a {confidenceConfig.label}
        </span>
      </div>

      {/* Clinical implication */}
      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-700 leading-relaxed">
          {correlation.clinicalImplication}
        </p>
      </div>

      {/* Involved markers */}
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-500">Marcadores:</span>
        {correlation.markers.map((markerId) => (
          <span
            key={markerId}
            className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium"
          >
            {markerId}
          </span>
        ))}
      </div>

      {/* Evidence (if available) */}
      {correlation.evidence && correlation.evidence.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <h5 className="text-xs font-medium text-gray-500 uppercase mb-2">
            Evid\u00eancia
          </h5>
          <div className="space-y-1">
            {correlation.evidence.slice(0, 3).map((ev, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <span
                  className={`px-1.5 py-0.5 rounded ${
                    ev.source === 'lab'
                      ? 'bg-blue-100 text-blue-600'
                      : ev.source === 'soap'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {ev.source.toUpperCase()}
                </span>
                <span className="text-gray-600">
                  {ev.reference}
                  {ev.value && `: ${ev.value}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View details button */}
      {onViewDetails && (
        <button
          onClick={onViewDetails}
          className="mt-3 w-full flex items-center justify-center gap-1 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          Ver detalhes
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default CorrelationCard;
