/**
 * ClinicalReasoningPanel Component
 * =================================
 *
 * Main panel for Clinical Reasoning Engine integration.
 * Shows upload, processing status, and analysis results.
 */

import React, { useState, useCallback } from 'react';
import {
  Brain,
  Upload,
  History,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { useLabAnalysis } from '../../../hooks/useLabAnalysis';
import { usePatientLabHistory } from '../../../hooks/usePatientLabHistory';
import { LabUploadPanel } from './LabUploadPanel';
import { AnalysisSummary } from './AnalysisSummary';
import { BiomarkerCard } from './BiomarkerCard';
import { CorrelationCard } from './CorrelationCard';
import type {
  PatientContext,
  ClinicalAnalysisTab,
  LabAnalysisResult,
} from '../../../types';

interface ClinicalReasoningPanelProps {
  /** Patient ID for analysis. */
  patientId: string;
  /** Patient context for analysis. */
  patientContext: PatientContext;
  /** Called when analysis is complete. */
  onAnalysisComplete?: (result: LabAnalysisResult) => void;
}

/**
 * ClinicalReasoningPanel is the main interface for lab analysis.
 */
export function ClinicalReasoningPanel({
  patientId,
  patientContext,
  onAnalysisComplete,
}: ClinicalReasoningPanelProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState<ClinicalAnalysisTab>('overview');
  const [showHistory, setShowHistory] = useState(false);
  const [expandedMarkers, setExpandedMarkers] = useState<Set<string>>(new Set());

  // Lab analysis hook
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

  // History hook
  const { sessions, latestAnalysis } = usePatientLabHistory({
    patientId,
    realtime: true,
  });

  // Handle file upload
  const handleFileSelect = useCallback(
    (file: File) => {
      uploadAndAnalyze(file, patientContext);
    },
    [uploadAndAnalyze, patientContext]
  );

  // Handle section click from summary
  const handleSectionClick = useCallback((section: 'triage' | 'markers' | 'correlations') => {
    if (section === 'markers') setActiveTab('biomarkers');
    else if (section === 'correlations') setActiveTab('correlations');
    else setActiveTab('overview');
  }, []);

  // Toggle marker expansion
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

  // Handle review feedback
  const handleFeedback = useCallback(
    async (feedback: 'helpful' | 'not_helpful' | 'incorrect') => {
      await markReviewed(feedback);
    },
    [markReviewed]
  );

  // Current result to display (either new or from history)
  const displayResult = result || latestAnalysis?.result;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Brain className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Racioc\u00ednio Cl\u00ednico
              </h2>
              <p className="text-sm text-gray-500">
                An\u00e1lise de exames laboratoriais com IA
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* History toggle */}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                showHistory
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <History className="w-4 h-4" />
              Hist\u00f3rico ({sessions.length})
            </button>

            {/* New analysis */}
            {displayResult && (
              <button
                onClick={reset}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Nova An\u00e1lise
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {showHistory ? (
          // History view
          <div className="space-y-3">
            <h3 className="font-medium text-gray-700 mb-4">
              An\u00e1lises Anteriores
            </h3>
            {sessions.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                Nenhuma an\u00e1lise anterior encontrada
              </p>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className="p-4 bg-white rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    // Could open session details
                    setShowHistory(false);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(session.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-sm text-gray-500">
                        {session.result
                          ? `${session.result.markers.length} marcadores analisados`
                          : session.status}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))
            )}
          </div>
        ) : displayResult ? (
          // Results view
          <div className="space-y-6">
            {/* Tabs */}
            <div className="flex gap-1 bg-white p-1 rounded-lg border">
              {(['overview', 'biomarkers', 'correlations', 'differential', 'suggestions'] as ClinicalAnalysisTab[]).map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {tab === 'overview'
                      ? 'Resumo'
                      : tab === 'biomarkers'
                      ? 'Marcadores'
                      : tab === 'correlations'
                      ? 'Padr\u00f5es'
                      : tab === 'differential'
                      ? 'Diagn\u00f3sticos'
                      : 'Sugest\u00f5es'}
                  </button>
                )
              )}
            </div>

            {/* Tab content */}
            {activeTab === 'overview' && (
              <AnalysisSummary
                result={displayResult}
                onSectionClick={handleSectionClick}
              />
            )}

            {activeTab === 'biomarkers' && (
              <div className="space-y-3">
                {displayResult.markers.map((marker) => (
                  <div key={marker.id}>
                    <BiomarkerCard
                      marker={marker}
                      expanded={expandedMarkers.has(marker.id)}
                      onToggle={() => toggleMarker(marker.id)}
                    />
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'correlations' && (
              <div className="grid gap-4 md:grid-cols-2">
                {displayResult.correlations.map((corr, idx) => (
                  <div key={idx}>
                    <CorrelationCard correlation={corr} />
                  </div>
                ))}
                {displayResult.correlations.length === 0 && (
                  <p className="text-gray-500 text-center py-8 col-span-2">
                    Nenhum padr\u00e3o cl\u00ednico identificado
                  </p>
                )}
              </div>
            )}

            {activeTab === 'differential' && (
              <div className="space-y-4">
                {displayResult.differentialDiagnosis.map((dx, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-white rounded-lg border"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {idx + 1}. {dx.name}
                        </h4>
                        {dx.icd10 && (
                          <p className="text-xs text-gray-400">CID-10: {dx.icd10}</p>
                        )}
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">
                        {dx.confidence}%
                      </span>
                    </div>
                    {dx.supportingEvidence.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 uppercase mb-1">
                          Evid\u00eancias de suporte
                        </p>
                        <ul className="text-sm text-gray-600 list-disc list-inside">
                          {dx.supportingEvidence.map((ev, i) => (
                            <li key={i}>{ev}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'suggestions' && (
              <div className="space-y-6">
                {/* Investigative questions */}
                {displayResult.investigativeQuestions.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-3">
                      Perguntas Investigativas
                    </h3>
                    <div className="space-y-2">
                      {displayResult.investigativeQuestions.map((q, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-amber-50 rounded-lg border border-amber-100"
                        >
                          <p className="text-gray-900">{q.question}</p>
                          <p className="text-xs text-amber-700 mt-1">
                            {q.rationale}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested tests */}
                {displayResult.suggestedTests.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-3">
                      Exames Sugeridos
                    </h3>
                    <div className="space-y-2">
                      {displayResult.suggestedTests.map((test, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-blue-50 rounded-lg border border-blue-100"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">
                              {test.name}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded ${
                                test.urgency === 'urgent'
                                  ? 'bg-red-100 text-red-700'
                                  : test.urgency === 'routine'
                                  ? 'bg-gray-100 text-gray-600'
                                  : 'bg-blue-100 text-blue-600'
                              }`}
                            >
                              {test.urgency === 'urgent'
                                ? 'Urgente'
                                : test.urgency === 'routine'
                                ? 'Rotina'
                                : 'Seguimento'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {test.rationale}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Disclaimer */}
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  {displayResult.disclaimer}
                </p>
              </div>
            </div>

            {/* Feedback buttons */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <span className="text-sm text-gray-500">Esta an\u00e1lise foi \u00fatil?</span>
              <button
                onClick={() => handleFeedback('helpful')}
                className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                Sim
              </button>
              <button
                onClick={() => handleFeedback('not_helpful')}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
              >
                N\u00e3o
              </button>
              <button
                onClick={() => handleFeedback('incorrect')}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              >
                Incorreta
              </button>
            </div>
          </div>
        ) : (
          // Upload view
          <div className="max-w-xl mx-auto">
            <LabUploadPanel
              status={status}
              error={error}
              onFileSelect={handleFileSelect}
              onCancel={reset}
            />

            {/* Quick tips */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Dicas</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>\u2022 Fotografe o exame com boa ilumina\u00e7\u00e3o</li>
                <li>\u2022 Inclua todos os valores no enquadramento</li>
                <li>\u2022 PDFs s\u00e3o processados diretamente</li>
                <li>\u2022 A an\u00e1lise leva cerca de 15-30 segundos</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClinicalReasoningPanel;
