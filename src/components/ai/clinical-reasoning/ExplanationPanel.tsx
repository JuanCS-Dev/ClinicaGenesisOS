/**
 * Explanation Panel Component
 * ===========================
 *
 * Displays "Why this diagnosis?" explanations for clinical reasoning.
 * Implements Explainable AI (XAI) for clinical decision support.
 *
 * Fase 13: Clinical Reasoning Explainability
 */

import React, { useMemo } from 'react';
import {
  HelpCircle,
  ChevronRight,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Activity,
} from 'lucide-react';
import type { DifferentialDiagnosis } from '@/types/clinical-reasoning';

/**
 * Explanation reason with contribution weight.
 */
export interface ExplanationReason {
  /** Factor description */
  factor: string;
  /** Contribution percentage (0-100) */
  contribution: number;
  /** Evidence type */
  type: 'supporting' | 'contradicting';
  /** Scientific reference (PMID or DOI) */
  reference?: string;
}

/**
 * Full explanation for a diagnosis.
 */
export interface DiagnosisExplanation {
  /** Diagnosis name */
  diagnosis: string;
  /** ICD-10 code */
  icd10?: string;
  /** Overall confidence (0-1) */
  confidence: number;
  /** Reasons for this diagnosis */
  reasons: ExplanationReason[];
  /** Key differentiating factors */
  differentiators?: string[];
  /** Additional tests that would increase confidence */
  clarifyingTests?: string[];
}

/**
 * Props for ExplanationPanel component.
 */
interface ExplanationPanelProps {
  /** Diagnosis to explain */
  diagnosis: DifferentialDiagnosis;
  /** Expanded by default */
  defaultExpanded?: boolean;
  /** Show PubMed links */
  showReferences?: boolean;
}

/**
 * Calculate explanation reasons from diagnosis evidence.
 */
function buildExplanation(diagnosis: DifferentialDiagnosis): DiagnosisExplanation {
  const reasons: ExplanationReason[] = [];

  // Supporting evidence
  diagnosis.supportingEvidence.forEach((evidence, index) => {
    // Distribute contribution based on position (first items more important)
    const baseContribution = 100 / (diagnosis.supportingEvidence.length || 1);
    const positionWeight = 1 - (index * 0.1);
    
    reasons.push({
      factor: evidence,
      contribution: Math.round(baseContribution * positionWeight),
      type: 'supporting',
    });
  });

  // Contradicting evidence
  diagnosis.contradictingEvidence.forEach((evidence) => {
    reasons.push({
      factor: evidence,
      contribution: -10, // Negative contribution
      type: 'contradicting',
    });
  });

  // Normalize contributions to sum to ~100 for supporting
  const totalSupporting = reasons
    .filter((r) => r.type === 'supporting')
    .reduce((sum, r) => sum + r.contribution, 0);

  if (totalSupporting > 0) {
    reasons.forEach((r) => {
      if (r.type === 'supporting') {
        r.contribution = Math.round((r.contribution / totalSupporting) * 100);
      }
    });
  }

  return {
    diagnosis: diagnosis.name,
    icd10: diagnosis.icd10,
    confidence: diagnosis.confidence / 100,
    reasons,
    clarifyingTests: diagnosis.suggestedTests,
  };
}

/**
 * Explanation Panel component.
 */
export const ExplanationPanel: React.FC<ExplanationPanelProps> = ({
  diagnosis,
  defaultExpanded = false,
  showReferences = true,
}) => {
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  const explanation = useMemo(() => buildExplanation(diagnosis), [diagnosis]);

  // Get confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.7) return 'text-green-600';
    if (confidence >= 0.4) return 'text-amber-600';
    return 'text-red-600';
  };

  // Sort reasons by absolute contribution
  const sortedReasons = useMemo(() => {
    return [...explanation.reasons].sort(
      (a, b) => Math.abs(b.contribution) - Math.abs(a.contribution)
    );
  }, [explanation.reasons]);

  return (
    <div className="bg-blue-50/50 rounded-xl border border-blue-100 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 hover:bg-blue-50 transition-colors"
      >
        <HelpCircle className="w-5 h-5 text-blue-500" />
        <span className="font-medium text-blue-900">
          Por que {explanation.diagnosis}?
        </span>
        <span className={`ml-auto font-bold ${getConfidenceColor(explanation.confidence)}`}>
          {Math.round(explanation.confidence * 100)}%
        </span>
        <ChevronRight
          className={`w-5 h-5 text-blue-400 transition-transform ${
            expanded ? 'rotate-90' : ''
          }`}
        />
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* ICD-10 badge */}
          {explanation.icd10 && (
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-mono rounded">
                ICD-10: {explanation.icd10}
              </span>
            </div>
          )}

          {/* Reasons list */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-blue-900">
              Fatores Contribuintes
            </h4>

            {sortedReasons.map((reason, index) => (
              <div key={index} className="flex items-start gap-3">
                {/* Contribution bar */}
                <div className="flex items-center gap-2 w-24 flex-shrink-0">
                  {reason.type === 'supporting' ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <div className="flex-1 h-2 bg-genesis-border-subtle rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        reason.type === 'supporting'
                          ? 'bg-green-500'
                          : 'bg-red-500'
                      }`}
                      style={{
                        width: `${Math.abs(reason.contribution)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Factor description */}
                <div className="flex-1">
                  <span className="text-sm text-genesis-text">{reason.factor}</span>
                  {reason.reference && showReferences && (
                    <a
                      href={`https://pubmed.ncbi.nlm.nih.gov/${reason.reference}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      PubMed
                    </a>
                  )}
                </div>

                {/* Contribution percentage */}
                <span
                  className={`text-sm font-medium ${
                    reason.type === 'supporting'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {reason.type === 'supporting' ? '+' : ''}
                  {reason.contribution}%
                </span>
              </div>
            ))}
          </div>

          {/* Clarifying tests */}
          {explanation.clarifyingTests && explanation.clarifyingTests.length > 0 && (
            <div className="pt-3 border-t border-blue-100">
              <h4 className="text-sm font-medium text-blue-900 flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4" />
                Exames para Confirmar
              </h4>
              <ul className="space-y-1">
                {explanation.clarifyingTests.map((test, index) => (
                  <li
                    key={index}
                    className="text-sm text-genesis-medium flex items-center gap-2"
                  >
                    <span className="w-1 h-1 bg-blue-400 rounded-full" />
                    {test}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warning for low confidence */}
          {explanation.confidence < 0.5 && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Confiança baixa. Considere solicitar exames complementares
                ou buscar diagnósticos alternativos.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExplanationPanel;

