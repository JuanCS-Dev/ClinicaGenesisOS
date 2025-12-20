/**
 * CorrelationCard Component
 * =========================
 *
 * Displays a clinical correlation pattern with involved markers and implications.
 *
 * Note: Uses explicit hex colors for Tailwind 4 compatibility.
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
        bgColor: 'bg-[#DCFCE7]',
        textColor: 'text-[#15803D]',
      };
    case 'medium':
      return {
        label: 'Média',
        bgColor: 'bg-[#FEF3C7]',
        textColor: 'text-[#B45309]',
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
    metabolic_syndrome: { icon: AlertTriangle, color: 'text-[#F97316]' },
    insulin_resistance: { icon: AlertTriangle, color: 'text-[#F59E0B]' },
    diabetes_type2: { icon: AlertTriangle, color: 'text-[#EF4444]' },
    cardiovascular_risk: { icon: AlertTriangle, color: 'text-[#DC2626]' },
    hypothyroidism: { icon: Info, color: 'text-[#3B82F6]' },
    hyperthyroidism: { icon: AlertTriangle, color: 'text-[#A855F7]' },
    iron_deficiency_anemia: { icon: Info, color: 'text-[#F43F5E]' },
    b12_deficiency: { icon: Info, color: 'text-[#EC4899]' },
    chronic_inflammation: { icon: AlertTriangle, color: 'text-[#F97316]' },
    liver_dysfunction: { icon: AlertTriangle, color: 'text-[#CA8A04]' },
    kidney_dysfunction: { icon: AlertTriangle, color: 'text-[#EF4444]' },
    infection_pattern: { icon: AlertTriangle, color: 'text-[#DC2626]' },
    autoimmune_pattern: { icon: Info, color: 'text-[#6366F1]' },
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
          Confiança {confidenceConfig.label}
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
            className="px-2 py-0.5 bg-[#EFF6FF] text-[#1D4ED8] rounded text-xs font-medium"
          >
            {markerId}
          </span>
        ))}
      </div>

      {/* Evidence (if available) */}
      {correlation.evidence && correlation.evidence.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <h5 className="text-xs font-medium text-gray-500 uppercase mb-2">
            Evidência
          </h5>
          <div className="space-y-1">
            {correlation.evidence.slice(0, 3).map((ev, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <span
                  className={`px-1.5 py-0.5 rounded ${
                    ev.source === 'lab'
                      ? 'bg-[#DBEAFE] text-[#2563EB]'
                      : ev.source === 'soap'
                      ? 'bg-[#DCFCE7] text-[#16A34A]'
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
          className="mt-3 w-full flex items-center justify-center gap-1 py-2 text-sm text-[#2563EB] hover:bg-[#EFF6FF] rounded-lg transition-colors"
        >
          Ver detalhes
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default CorrelationCard;
