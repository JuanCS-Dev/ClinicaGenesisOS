/**
 * ReferenceCard Component - Premium Edition
 * ==========================================
 *
 * Displays a scientific article reference with elegant design.
 * Features gradient accents, smooth animations, and tier badges.
 */

import React, { useState } from 'react';
import { ExternalLink, BookOpen, ChevronDown, Award, TrendingUp } from 'lucide-react';
import type { ScientificReference } from '../../../types/clinical-reasoning';

interface ReferenceCardProps {
  reference: ScientificReference;
  index?: number;
}

/** Top-tier journals for special highlighting */
const TIER1_JOURNALS = [
  'n engl j med', 'nejm', 'lancet', 'jama', 'bmj', 'nature', 'science',
  'cell', 'circulation', 'diabetes care', 'thyroid', 'ann intern med'
];

function isTier1(journal: string): boolean {
  return TIER1_JOURNALS.some(t => journal.toLowerCase().includes(t));
}

function getRelevanceBadge(score: number): { label: string; color: string; bg: string } {
  if (score >= 80) return { label: 'Alta Relevância', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' };
  if (score >= 60) return { label: 'Relevante', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' };
  return { label: 'Referência', color: 'text-genesis-medium', bg: 'bg-genesis-soft border-genesis-border' };
}

export function ReferenceCard({ reference, index = 0 }: ReferenceCardProps): React.ReactElement {
  const [isExpanded, setIsExpanded] = useState(false);
  const badge = getRelevanceBadge(reference.relevance);
  const tier1 = isTier1(reference.journal);

  return (
    <div
      className={`
        group relative overflow-hidden rounded-xl border transition-all duration-300
        ${tier1
          ? 'bg-gradient-to-br from-amber-50/50 to-white border-amber-200/60 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-100/50'
          : 'bg-genesis-surface border-genesis-border hover:border-blue-300 hover:shadow-md'
        }
      `}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Tier-1 Journal Indicator */}
      {tier1 && (
        <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
          <div className="absolute top-2 right-[-20px] w-[80px] transform rotate-45 bg-gradient-to-r from-amber-400 to-amber-500 text-center py-0.5 shadow-sm">
            <Award className="w-3 h-3 text-white mx-auto" />
          </div>
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`
            p-2.5 rounded-xl shrink-0 transition-colors
            ${tier1
              ? 'bg-gradient-to-br from-amber-100 to-amber-50 text-amber-600'
              : 'bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600'
            }
          `}>
            <BookOpen className="w-5 h-5" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pr-8">
            {/* Title */}
            <h4 className="text-sm font-semibold text-genesis-dark leading-snug line-clamp-2 group-hover:text-blue-900 transition-colors">
              {reference.title}
            </h4>

            {/* Meta */}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              <span className="text-genesis-medium font-medium">{reference.authors}</span>
              <span className="text-genesis-subtle">•</span>
              <span className={`font-semibold ${tier1 ? 'text-amber-700' : 'text-genesis-text'}`}>
                {reference.journal}
              </span>
              <span className="text-genesis-subtle">•</span>
              <span className="text-genesis-muted">{reference.year}</span>
            </div>

            {/* Badges */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${badge.bg} ${badge.color}`}>
                <TrendingUp className="w-3 h-3" />
                {badge.label}
              </span>
              {tier1 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                  <Award className="w-3 h-3" />
                  Journal de Alto Impacto
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <a
              href={reference.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                p-2 rounded-lg transition-all duration-200
                ${tier1
                  ? 'text-amber-500 hover:text-amber-700 hover:bg-amber-100'
                  : 'text-genesis-subtle hover:text-blue-600 hover:bg-blue-50'
                }
              `}
              title="Abrir artigo original"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Expandable Excerpt */}
        {reference.excerpt && (
          <div className="mt-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-xs text-genesis-muted hover:text-genesis-text transition-colors"
            >
              <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              {isExpanded ? 'Ocultar resumo' : 'Ver resumo'}
            </button>

            {isExpanded && (
              <div className="mt-2 p-3 bg-genesis-soft rounded-lg border border-genesis-border-subtle animate-in fade-in slide-in-from-top-2 duration-200">
                <p className="text-xs text-genesis-medium leading-relaxed italic">
                  "{reference.excerpt}"
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom gradient accent */}
      <div className={`
        h-1 w-full
        ${tier1
          ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-transparent'
          : 'bg-gradient-to-r from-blue-400 via-blue-300 to-transparent'
        }
        opacity-0 group-hover:opacity-100 transition-opacity duration-300
      `} />
    </div>
  );
}

export default ReferenceCard;
