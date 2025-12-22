/**
 * AnalysisSummary Component
 * =========================
 *
 * Summary panel showing triage result and key metrics from lab analysis.
 *
 * Note: Uses explicit hex colors for Tailwind 4 compatibility.
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
        bgColor: 'bg-[#FEF2F2]',
        textColor: 'text-[#B91C1C]',
        borderColor: 'border-[#FECACA]',
        label: 'CRÍTICO',
        description: 'Ação imediata necessária',
      };
    case 'high':
      return {
        icon: AlertTriangle,
        bgColor: 'bg-[#FFFBEB]',
        textColor: 'text-[#B45309]',
        borderColor: 'border-[#FDE68A]',
        label: 'URGÊNCIA',
        description: 'Avaliação prioritária',
      };
    case 'routine':
    default:
      return {
        icon: CheckCircle,
        bgColor: 'bg-[#F0FDF4]',
        textColor: 'text-[#15803D]',
        borderColor: 'border-[#BBF7D0]',
        label: 'ROTINA',
        description: 'Acompanhamento padrão',
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
              <span className="text-sm text-genesis-muted">
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
            <p className="text-xs text-genesis-muted">Workflow</p>
            <p className={`font-medium ${urgencyConfig.textColor}`}>
              {triage.recommendedWorkflow === 'emergency'
                ? 'Emergência'
                : triage.recommendedWorkflow === 'specialist'
                ? 'Especialista'
                : 'Atenção Primária'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Critical markers */}
        <div
          className="p-4 bg-[#FEF2F2] rounded-xl cursor-pointer hover:bg-[#FEE2E2] transition-colors"
          onClick={() => onSectionClick?.('markers')}
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-[#EF4444]" />
            <span className="text-sm font-medium text-[#B91C1C]">Críticos</span>
          </div>
          <p className="text-3xl font-bold text-[#B91C1C]">{summary.critical}</p>
        </div>

        {/* Attention markers */}
        <div
          className="p-4 bg-[#FFFBEB] rounded-xl cursor-pointer hover:bg-[#FEF3C7] transition-colors"
          onClick={() => onSectionClick?.('markers')}
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
            <span className="text-sm font-medium text-[#B45309]">Atenção</span>
          </div>
          <p className="text-3xl font-bold text-[#B45309]">{summary.attention}</p>
        </div>

        {/* Normal markers */}
        <div
          className="p-4 bg-[#F0FDF4] rounded-xl cursor-pointer hover:bg-[#DCFCE7] transition-colors"
          onClick={() => onSectionClick?.('markers')}
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-[#22C55E]" />
            <span className="text-sm font-medium text-[#15803D]">Normais</span>
          </div>
          <p className="text-3xl font-bold text-[#15803D]">{summary.normal}</p>
        </div>
      </div>

      {/* Correlations preview */}
      {correlations.length > 0 && (
        <div
          className="p-4 bg-[#EFF6FF] rounded-xl cursor-pointer hover:bg-[#DBEAFE] transition-colors"
          onClick={() => onSectionClick?.('correlations')}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#3B82F6]" />
              <span className="font-medium text-[#1D4ED8]">
                Padrões Clínicos Identificados
              </span>
            </div>
            <span className="text-sm text-[#2563EB]">
              {correlations.length} padrão(s)
            </span>
          </div>
          <div className="space-y-2">
            {correlations.slice(0, 3).map((corr, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 bg-genesis-surface rounded-lg"
              >
                <span className="text-sm text-genesis-text">{corr.pattern}</span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    corr.confidence === 'high'
                      ? 'bg-[#DCFCE7] text-[#15803D]'
                      : corr.confidence === 'medium'
                      ? 'bg-[#FEF3C7] text-[#B45309]'
                      : 'bg-genesis-hover text-genesis-medium'
                  }`}
                >
                  {corr.confidence === 'high'
                    ? 'Alta'
                    : corr.confidence === 'medium'
                    ? 'Média'
                    : 'Baixa'}
                </span>
              </div>
            ))}
            {correlations.length > 3 && (
              <p className="text-xs text-[#2563EB] text-center pt-1">
                +{correlations.length - 3} mais...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Metadata footer */}
      <div className="flex items-center justify-between text-xs text-genesis-subtle pt-2">
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
