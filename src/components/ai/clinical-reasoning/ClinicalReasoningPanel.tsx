/**
 * ClinicalReasoningPanel Component
 * =================================
 *
 * Premium Diagnóstico Assistido interface for lab analysis.
 * Designed for 500k+/year subscription tier.
 *
 * Features:
 * - Intuitive workflow-based tabs
 * - Premium visual design with smooth animations
 * - Multi-LLM consensus indicators
 * - Professional medical-grade UX
 *
 * Note: Uses explicit hex colors for Tailwind 4 compatibility.
 */

import React, { useState, useCallback } from 'react';
import {
  Brain,
  Upload,
  History,
  Target,
  FlaskConical,
  GitBranch,
  ClipboardList,
  Sparkles,
} from 'lucide-react';
import { useLabAnalysis } from '../../../hooks/useLabAnalysis';
import { usePatientLabHistory } from '../../../hooks/usePatientLabHistory';
import { LabUploadPanel } from './LabUploadPanel';
import { HistoryView } from './HistoryView';
import { ResultsView } from './ResultsView';
import type {
  PatientContext,
  ClinicalAnalysisTab,
  LabAnalysisResult,
} from '../../../types';

/**
 * Tab configuration for workflow-based navigation.
 */
const TABS = [
  {
    id: 'overview' as const,
    label: 'Triagem',
    icon: Target,
    description: 'Urgência e red flags',
  },
  {
    id: 'biomarkers' as const,
    label: 'Resultados',
    icon: FlaskConical,
    description: 'Biomarcadores detalhados',
  },
  {
    id: 'correlations' as const,
    label: 'Padrões',
    icon: GitBranch,
    description: 'Correlações clínicas',
  },
  {
    id: 'differential' as const,
    label: 'Diagnósticos',
    icon: Brain,
    description: 'Diagnóstico diferencial',
  },
  {
    id: 'suggestions' as const,
    label: 'Ação',
    icon: ClipboardList,
    description: 'Próximos passos',
  },
];

interface ClinicalReasoningPanelProps {
  patientId: string;
  patientContext: PatientContext;
  onAnalysisComplete?: (result: LabAnalysisResult) => void;
}

/**
 * Premium Clinical Reasoning Panel.
 */
export function ClinicalReasoningPanel({
  patientId,
  patientContext,
  onAnalysisComplete,
}: ClinicalReasoningPanelProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState<ClinicalAnalysisTab>('overview');
  const [showHistory, setShowHistory] = useState(false);
  const [expandedMarkers, setExpandedMarkers] = useState<Set<string>>(new Set());

  const {
    status,
    result,
    error,
    uploadAndAnalyze,
    reset,
    markReviewed,
  } = useLabAnalysis({
    patientId,
    onComplete: (res) => {
      onAnalysisComplete?.(res);
    },
  });

  const { sessions, latestAnalysis } = usePatientLabHistory({
    patientId,
    realtime: true,
  });

  const handleFileSelect = useCallback(
    (file: File) => {
      uploadAndAnalyze(file, patientContext);
    },
    [uploadAndAnalyze, patientContext]
  );

  const handleSectionClick = useCallback((section: 'triage' | 'markers' | 'correlations') => {
    if (section === 'markers') setActiveTab('biomarkers');
    else if (section === 'correlations') setActiveTab('correlations');
    else setActiveTab('overview');
  }, []);

  const toggleMarker = useCallback((markerId: string) => {
    setExpandedMarkers((prev) => {
      const next = new Set(prev);
      if (next.has(markerId)) {
        next.delete(markerId);
      } else {
        next.add(markerId);
      }
      return next;
    });
  }, []);

  const handleFeedback = useCallback(
    async (feedback: 'helpful' | 'not_helpful' | 'incorrect') => {
      await markReviewed(feedback);
    },
    [markReviewed]
  );

  const displayResult = result || latestAnalysis?.result;

  return (
    <div className="h-full flex flex-col bg-genesis-soft/50">
      {/* Premium Header */}
      <div className="bg-genesis-surface border-b border-genesis-border-subtle shadow-sm">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            {/* Title Section */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-3 bg-gradient-to-br from-[#6366F1] to-[#7C3AED] rounded-xl shadow-lg shadow-[#6366F1]/20">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-[#FBBF24]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-genesis-dark tracking-tight">
                  Diagnóstico Assistido
                </h2>
                <p className="text-sm text-genesis-muted">
                  Análise laboratorial com IA Multi-LLM
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* History Button */}
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${
                    showHistory
                      ? 'bg-[#EEF2FF] text-[#4338CA] shadow-sm'
                      : 'text-genesis-medium hover:bg-genesis-hover'
                  }
                `}
              >
                <History className="w-4 h-4" />
                <span>Histórico</span>
                {sessions.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-xs bg-genesis-border-subtle rounded-full">
                    {sessions.length}
                  </span>
                )}
              </button>

              {/* New Analysis Button */}
              {displayResult && (
                <button
                  onClick={reset}
                  className="
                    flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                    bg-gradient-to-r from-[#4F46E5] to-[#6366F1] text-white
                    shadow-lg shadow-[#6366F1]/25
                    hover:shadow-xl hover:shadow-[#6366F1]/30
                    active:scale-[0.98]
                    transition-all duration-200
                  "
                >
                  <Upload className="w-4 h-4" />
                  <span>Nova Análise</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation - Only show when we have results */}
        {displayResult && !showHistory && (
          <div className="px-6 pb-0">
            <div className="flex gap-1 overflow-x-auto scrollbar-hide" role="tablist" aria-label="Seções do raciocínio clínico">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-4 py-3 rounded-t-xl text-sm font-medium
                      border-b-2 transition-all duration-200 whitespace-nowrap
                      ${
                        isActive
                          ? 'border-genesis-primary text-genesis-primary bg-genesis-primary/5'
                          : 'border-transparent text-genesis-muted hover:text-genesis-text hover:bg-genesis-soft'
                      }
                    `}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-genesis-primary' : ''}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {showHistory ? (
            <HistoryView
              sessions={sessions}
              onClose={() => setShowHistory(false)}
            />
          ) : displayResult ? (
            <ResultsView
              result={displayResult}
              activeTab={activeTab}
              expandedMarkers={expandedMarkers}
              onSectionClick={handleSectionClick}
              onToggleMarker={toggleMarker}
              onFeedback={handleFeedback}
            />
          ) : (
            <div className="max-w-xl mx-auto animate-[slideUp_0.5s_cubic-bezier(0.16,1,0.3,1)_forwards]">
              <LabUploadPanel
                status={status}
                error={error}
                onFileSelect={handleFileSelect}
                onCancel={reset}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ClinicalReasoningPanel;
