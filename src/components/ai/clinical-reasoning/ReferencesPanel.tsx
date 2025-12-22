/**
 * ReferencesPanel Component - Premium Edition
 * ============================================
 *
 * Premium collapsible panel for scientific literature backing.
 * Features elegant summary stats, smooth animations, and polished UX.
 */

import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronRight,
  BookMarked,
  Loader2,
  AlertCircle,
  Sparkles,
  Award,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { ReferenceCard } from './ReferenceCard';
import type { DiagnosisLiterature } from '../../../types/clinical-reasoning';

interface ReferencesPanelProps {
  references: DiagnosisLiterature[];
  isLoading?: boolean;
}

/** Summary stats for the panel header */
interface PanelStats {
  totalArticles: number;
  tier1Articles: number;
  diagnosesWithRefs: number;
  totalDiagnoses: number;
}

const TIER1_JOURNALS = ['nejm', 'lancet', 'jama', 'bmj', 'nature', 'science', 'cell', 'thyroid', 'diabetes care'];

function calculateStats(refs: DiagnosisLiterature[]): PanelStats {
  let totalArticles = 0;
  let tier1Articles = 0;

  for (const ref of refs) {
    totalArticles += ref.articles.length;
    tier1Articles += ref.articles.filter(a =>
      TIER1_JOURNALS.some(j => a.journal.toLowerCase().includes(j))
    ).length;
  }

  return {
    totalArticles,
    tier1Articles,
    diagnosesWithRefs: refs.filter(r => r.articles.length >= 2).length,
    totalDiagnoses: refs.length,
  };
}

/**
 * Diagnosis section with articles.
 */
function DiagnosisSection({ literature }: { literature: DiagnosisLiterature }): React.ReactElement {
  const [isOpen, setIsOpen] = useState(literature.status === 'ready' && literature.articles.length > 0);
  const hasArticles = literature.articles.length > 0;

  return (
    <div className="border border-genesis-border rounded-xl overflow-hidden bg-genesis-surface">
      {/* Header */}
      <button
        onClick={() => hasArticles && setIsOpen(!isOpen)}
        disabled={!hasArticles}
        className={`
          w-full flex items-center justify-between p-4 text-left transition-all
          ${hasArticles ? 'hover:bg-genesis-soft cursor-pointer' : 'cursor-default bg-genesis-soft/50'}
        `}
      >
        <div className="flex items-center gap-3">
          <div className={`
            p-2 rounded-lg
            ${hasArticles ? 'bg-purple-100 text-purple-600' : 'bg-genesis-hover text-genesis-subtle'}
          `}>
            {hasArticles ? (
              isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-genesis-dark">
                {literature.diagnosisName}
              </span>
              {literature.icd10 && (
                <span className="px-1.5 py-0.5 text-[10px] font-mono bg-genesis-hover text-genesis-medium rounded border border-genesis-border">
                  {literature.icd10}
                </span>
              )}
            </div>
            <p className="text-xs text-genesis-muted mt-0.5">
              {literature.articles.length === 0
                ? 'Sem referências disponíveis'
                : `${literature.articles.length} artigo${literature.articles.length !== 1 ? 's' : ''} científico${literature.articles.length !== 1 ? 's' : ''}`
              }
            </p>
          </div>
        </div>

        {hasArticles && (
          <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            Respaldado
          </span>
        )}
      </button>

      {/* Articles */}
      {isOpen && hasArticles && (
        <div className="p-4 pt-0 space-y-3 border-t border-genesis-border-subtle bg-gradient-to-b from-gray-50/50 to-white">
          {literature.articles.map((article, idx) => (
            <React.Fragment key={`${article.url}-${idx}`}>
              <ReferenceCard reference={article} index={idx} />
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Main ReferencesPanel component.
 */
export function ReferencesPanel({
  references,
  isLoading = false,
}: ReferencesPanelProps): React.ReactElement | null {
  const [isExpanded, setIsExpanded] = useState(true);

  const stats = useMemo(() => calculateStats(references), [references]);

  // Don't render if no data
  if (!isLoading && references.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-purple-50/30 via-white to-blue-50/30 rounded-2xl border border-purple-200/50 shadow-sm overflow-hidden">
      {/* Premium Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 text-left hover:bg-genesis-surface/50 transition-colors"
      >
        <div className="flex items-start justify-between">
          {/* Left side */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg shadow-purple-200">
              <BookMarked className="w-6 h-6 text-white" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-genesis-dark">
                  Respaldo Científico
                </h3>
                <Sparkles className="w-4 h-4 text-purple-500" />
              </div>

              <p className="text-sm text-genesis-medium mt-1">
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-500" />
                    Buscando literatura peer-reviewed...
                  </span>
                ) : (
                  `${stats.totalArticles} artigos de ${stats.diagnosesWithRefs} diagnóstico${stats.diagnosesWithRefs !== 1 ? 's' : ''}`
                )}
              </p>

              {/* Stats badges */}
              {!isLoading && stats.totalArticles > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                    <FileText className="w-3.5 h-3.5" />
                    {stats.totalArticles} referências
                  </span>
                  {stats.tier1Articles > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                      <Award className="w-3.5 h-3.5" />
                      {stats.tier1Articles} de alto impacto
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Expand indicator */}
          <div className="p-2 rounded-lg bg-genesis-surface shadow-sm border border-genesis-border-subtle">
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-genesis-subtle" />
            ) : (
              <ChevronRight className="w-5 h-5 text-genesis-subtle" />
            )}
          </div>
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-5 pb-5 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 bg-purple-100 rounded-full mb-4">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
              </div>
              <p className="text-sm font-medium text-genesis-text">
                Consultando PubMed e Europe PMC...
              </p>
              <p className="text-xs text-genesis-muted mt-1">
                Buscando artigos peer-reviewed para cada diagnóstico
              </p>
            </div>
          ) : (
            <>
              {references.map((lit) => (
                <React.Fragment key={lit.icd10}>
                  <DiagnosisSection literature={lit} />
                </React.Fragment>
              ))}

              {/* Disclaimer */}
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border border-genesis-border">
                <p className="text-xs text-genesis-muted leading-relaxed">
                  <span className="font-semibold text-genesis-medium">Nota:</span> Artigos selecionados automaticamente
                  de bases científicas indexadas (Europe PMC). Ordenados por citações e relevância.
                  Sempre consulte as fontes originais para validação clínica.
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ReferencesPanel;
