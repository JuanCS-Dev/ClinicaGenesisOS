/**
 * DiagnosisView Component
 *
 * Displays differential diagnosis with multi-LLM consensus indicators.
 */

import React, { useState } from 'react';
import { Brain, ChevronDown, ChevronUp } from 'lucide-react';
import { ConsensusBadge, ModelComparison } from './ConsensusBadge';
import { ConfidenceGauge } from './ConfidenceGauge';
import { ExplanationPanel } from './ExplanationPanel';
import { EvidenceLinks } from './EvidenceLinks';
import type {
  LabAnalysisResult,
  ConsensusDiagnosis,
  DifferentialDiagnosis,
} from '../../../types';

/**
 * Type guard to check if a diagnosis has consensus information.
 */
function hasConsensusInfo(
  dx: DifferentialDiagnosis | ConsensusDiagnosis
): dx is ConsensusDiagnosis {
  return 'consensusLevel' in dx;
}

interface DiagnosisViewProps {
  result: LabAnalysisResult;
}

/**
 * Diagnosis view with consensus indicators.
 */
export function DiagnosisView({ result }: DiagnosisViewProps) {
  const [expandedDx, setExpandedDx] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {/* Consensus Metrics */}
      {result.consensusMetrics && (
        <div className="p-4 bg-gradient-to-r from-[#EEF2FF] to-[#F5F3FF] rounded-xl border border-[#E0E7FF]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Brain className="w-5 h-5 text-[#4F46E5]" />
              </div>
              <div>
                <p className="font-medium text-[#312E81]">Consenso Multi-LLM</p>
                <p className="text-sm text-[#4F46E5]">
                  {result.consensusMetrics.modelsUsed.join(' + ')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[#4338CA]">
                {result.consensusMetrics.strongConsensusRate}%
              </p>
              <p className="text-xs text-[#6366F1]">consenso forte</p>
            </div>
          </div>
        </div>
      )}

      {/* Diagnoses */}
      {result.differentialDiagnosis.map((dx, idx) => (
        <div
          key={idx}
          className={`
            p-5 bg-white rounded-xl border transition-all duration-200
            ${
              hasConsensusInfo(dx) && dx.consensusLevel === 'divergent'
                ? 'border-[#FECACA] bg-[#FEF2F2]/30'
                : 'border-gray-100 hover:shadow-lg hover:border-gray-200'
            }
          `}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="flex items-center justify-center w-7 h-7 bg-gray-100 rounded-full text-sm font-bold text-gray-600">
                  {idx + 1}
                </span>
                <h4 className="font-semibold text-gray-900">{dx.name}</h4>
                {hasConsensusInfo(dx) && (
                  <ConsensusBadge level={dx.consensusLevel} size="sm" />
                )}
              </div>
              {dx.icd10 && (
                <p className="text-xs text-gray-400 ml-10">CID-10: {dx.icd10}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <ConfidenceGauge
                confidence={dx.confidence}
                consensusLevel={hasConsensusInfo(dx) ? dx.consensusLevel : undefined}
                size="sm"
                showLabel={false}
                showConsensus={false}
              />
              <button
                onClick={() => setExpandedDx(expandedDx === idx ? null : idx)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title={expandedDx === idx ? 'Recolher' : 'Expandir explicação'}
              >
                {expandedDx === idx ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          {dx.supportingEvidence.length > 0 && (
            <div className="mt-4 ml-10">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Evidências
              </p>
              <ul className="space-y-1">
                {dx.supportingEvidence.map((ev, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-[#818CF8] mt-1">•</span>
                    {ev}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {hasConsensusInfo(dx) && (
            <div className="mt-4 ml-10">
              <ModelComparison gemini={dx.modelDetails.gemini} gpt4o={dx.modelDetails.gpt4o} />
            </div>
          )}

          {/* Expanded Explanation Panel */}
          {expandedDx === idx && (
            <div className="mt-4 ml-10 pt-4 border-t border-gray-100 space-y-4 animate-in fade-in slide-in-from-top-2">
              <ExplanationPanel
                diagnosis={dx}
                showReferences
              />
              <EvidenceLinks
                diagnosis={dx.name}
                icd10={dx.icd10}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default DiagnosisView;
