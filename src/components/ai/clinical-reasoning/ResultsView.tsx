/**
 * ResultsView Component
 *
 * Main results display with tab-based navigation.
 */

import React from 'react';
import { AlertTriangle, GitBranch } from 'lucide-react';
import { AnalysisSummary } from './AnalysisSummary';
import { BiomarkerCard } from './BiomarkerCard';
import { CorrelationCard } from './CorrelationCard';
import { DiagnosisView } from './DiagnosisView';
import { SuggestionsView } from './SuggestionsView';
import type { LabAnalysisResult, ClinicalAnalysisTab } from '../../../types';

interface ResultsViewProps {
  result: LabAnalysisResult;
  activeTab: ClinicalAnalysisTab;
  expandedMarkers: Set<string>;
  onSectionClick: (section: 'triage' | 'markers' | 'correlations') => void;
  onToggleMarker: (id: string) => void;
  onFeedback: (feedback: 'helpful' | 'not_helpful' | 'incorrect') => void;
}

/**
 * Feedback button component.
 */
function FeedbackButton({
  onClick,
  color,
  label,
}: {
  onClick: () => void;
  color: 'green' | 'gray' | 'red';
  label: string;
}) {
  const colorClasses = {
    green: 'bg-[#D1FAE5] text-[#047857] hover:bg-[#A7F3D0]',
    gray: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
    red: 'bg-[#FEE2E2] text-[#B91C1C] hover:bg-[#FECACA]',
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${colorClasses[color]}`}
    >
      {label}
    </button>
  );
}

/**
 * Results view showing analysis results by tab.
 */
export function ResultsView({
  result,
  activeTab,
  expandedMarkers,
  onSectionClick,
  onToggleMarker,
  onFeedback,
}: ResultsViewProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-[fadeIn_0.3s_ease-out]">
      {/* Tab Content */}
      {activeTab === 'overview' && (
        <AnalysisSummary result={result} onSectionClick={onSectionClick} />
      )}

      {activeTab === 'biomarkers' && (
        <div className="space-y-3">
          {result.markers.map((marker) => (
            <div key={marker.id}>
              <BiomarkerCard
                marker={marker}
                expanded={expandedMarkers.has(marker.id)}
                onToggle={() => onToggleMarker(marker.id)}
              />
            </div>
          ))}
        </div>
      )}

      {activeTab === 'correlations' && (
        <div className="grid gap-4 md:grid-cols-2">
          {result.correlations.map((corr, idx) => (
            <div key={idx}>
              <CorrelationCard correlation={corr} />
            </div>
          ))}
          {result.correlations.length === 0 && (
            <div className="col-span-2 text-center py-12">
              <div className="p-4 bg-gray-100 rounded-2xl w-fit mx-auto mb-4">
                <GitBranch className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">Nenhum padrão clínico identificado</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'differential' && <DiagnosisView result={result} />}

      {activeTab === 'suggestions' && <SuggestionsView result={result} />}

      {/* Disclaimer */}
      <div className="p-4 bg-[#FFFBEB]/50 rounded-xl border border-[#FDE68A]">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#D97706] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#92400E]">{result.disclaimer}</p>
        </div>
      </div>

      {/* Feedback */}
      <div className="flex items-center justify-center gap-4 py-4">
        <span className="text-sm text-gray-500">Esta análise foi útil?</span>
        <div className="flex gap-2">
          <FeedbackButton
            onClick={() => onFeedback('helpful')}
            color="green"
            label="Sim"
          />
          <FeedbackButton
            onClick={() => onFeedback('not_helpful')}
            color="gray"
            label="Não"
          />
          <FeedbackButton
            onClick={() => onFeedback('incorrect')}
            color="red"
            label="Incorreta"
          />
        </div>
      </div>
    </div>
  );
}

export default ResultsView;
