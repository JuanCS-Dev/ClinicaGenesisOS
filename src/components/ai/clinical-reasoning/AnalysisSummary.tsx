/**
 * AnalysisSummary Component
 * =========================
 *
 * Summary panel showing triage result and key metrics from lab analysis.
 */

import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Activity,
  Clock,
  Bot,
} from 'lucide-react';
import type { LabAnalysisResult, UrgencyLevel } from '../../../types';

interface AnalysisSummaryProps {
  /** Analysis result to summarize. */
  result: LabAnalysisResult;
  /** Called when user clicks on a section for details. */
  onSectionClick?: (section: 'triage' | 'markers' | 'correlations') => void;
}

/**
 * Get urgency config.
 */
function getUrgencyConfig(urgency: UrgencyLevel): {
  icon: typeof AlertCircle;
  bgColor: string;
  textColor: string;
  borderColor: string;
  label: string;
  description: string;
} {
  switch (urgency) {
    case 'critical':
      return {
        icon: AlertCircle,
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        borderColor: 'border-red-200',
        label: 'CR\u00cdTICO',
        description: 'A\u00e7\u00e3o imediata necess\u00e1ria',
      };
    case 'high':
      return {
        icon: AlertTriangle,
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-700',
        borderColor: 'border-amber-200',
        label: 'URG\u00caNCIA',
        description: 'Avalia\u00e7\u00e3o priorit\u00e1ria',
      };
    case 'routine':
    default:
      return {
        icon: CheckCircle,
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-200',
        label: 'ROTINA',
        description: 'Acompanhamento padr\u00e3o',
      };
  }
}

/**
 * AnalysisSummary displays the overview of a lab analysis result.
 */
export function AnalysisSummary({
  result,
  onSectionClick,
}: AnalysisSummaryProps): React.ReactElement {
  const urgencyConfig = getUrgencyConfig(result.triage.urgency);
  const UrgencyIcon = urgencyConfig.icon;

  const { summary, triage, correlations, metadata } = result;

  return (
    <div className="space-y-4">
      {/* Triage banner */}
      <div
        className={`p-4 rounded-xl border-2 ${urgencyConfig.bgColor} ${urgencyConfig.borderColor} cursor-pointer hover:shadow-md transition-shadow`}
        onClick={() => onSectionClick?.('triage')}
      >
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${urgencyConfig.bgColor}`}>
            <UrgencyIcon className={`w-8 h-8 ${urgencyConfig.textColor}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span
                className={`text-lg font-bold ${urgencyConfig.textColor}`}
              >
                {urgencyConfig.label}
              </span>
              <span className="text-sm text-gray-500">
                {urgencyConfig.description}
              </span>
            </div>
            {triage.redFlags.length > 0 && (
              <p className="text-sm text-red-600 mt-1">
                {triage.redFlags.length} red flag(s) identificado(s)
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Workflow</p>
            <p className={`font-medium ${urgencyConfig.textColor}`}>
              {triage.recommendedWorkflow === 'emergency'
                ? 'Emerg\u00eancia'
                : triage.recommendedWorkflow === 'specialist'
                ? 'Especialista'
                : 'Aten\u00e7\u00e3o Prim\u00e1ria'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Critical markers */}
        <div
          className="p-4 bg-red-50 rounded-xl cursor-pointer hover:bg-red-100 transition-colors"
          onClick={() => onSectionClick?.('markers')}
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium text-red-700">Cr\u00edticos</span>
          </div>
          <p className="text-3xl font-bold text-red-700">{summary.critical}</p>
        </div>

        {/* Attention markers */}
        <div
          className="p-4 bg-amber-50 rounded-xl cursor-pointer hover:bg-amber-100 transition-colors"
          onClick={() => onSectionClick?.('markers')}
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-medium text-amber-700">Aten\u00e7\u00e3o</span>
          </div>
          <p className="text-3xl font-bold text-amber-700">{summary.attention}</p>
        </div>

        {/* Normal markers */}
        <div
          className="p-4 bg-green-50 rounded-xl cursor-pointer hover:bg-green-100 transition-colors"
          onClick={() => onSectionClick?.('markers')}
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-green-700">Normais</span>
          </div>
          <p className="text-3xl font-bold text-green-700">{summary.normal}</p>
        </div>
      </div>

      {/* Correlations preview */}
      {correlations.length > 0 && (
        <div
          className="p-4 bg-blue-50 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors"
          onClick={() => onSectionClick?.('correlations')}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <span className="font-medium text-blue-700">
                Padr\u00f5es Cl\u00ednicos Identificados
              </span>
            </div>
            <span className="text-sm text-blue-600">
              {correlations.length} padr\u00e3o(s)
            </span>
          </div>
          <div className="space-y-2">
            {correlations.slice(0, 3).map((corr, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 bg-white rounded-lg"
              >
                <span className="text-sm text-gray-700">{corr.pattern}</span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    corr.confidence === 'high'
                      ? 'bg-green-100 text-green-700'
                      : corr.confidence === 'medium'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {corr.confidence === 'high'
                    ? 'Alta'
                    : corr.confidence === 'medium'
                    ? 'M\u00e9dia'
                    : 'Baixa'}
                </span>
              </div>
            ))}
            {correlations.length > 3 && (
              <p className="text-xs text-blue-600 text-center pt-1">
                +{correlations.length - 3} mais...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Metadata footer */}
      <div className="flex items-center justify-between text-xs text-gray-400 pt-2">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4" />
          <span>Gemini 2.5 Flash</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{(metadata.processingTimeMs / 1000).toFixed(1)}s</span>
          </div>
          <span>v{metadata.promptVersion.split('|')[0].split(':')[1]}</span>
        </div>
      </div>
    </div>
  );
}

export default AnalysisSummary;
