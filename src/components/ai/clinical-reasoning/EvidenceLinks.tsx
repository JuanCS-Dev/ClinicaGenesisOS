/**
 * Evidence Links Component
 * ========================
 *
 * Displays scientific literature links for clinical evidence.
 * Connects diagnoses to PubMed and other medical databases.
 *
 * Fase 13: Clinical Reasoning Explainability
 */

import React from 'react';
import {
  ExternalLink,
  BookOpen,
  FileText,
  GraduationCap,
  Link as LinkIcon,
} from 'lucide-react';

/**
 * Scientific reference source.
 */
export type ReferenceSource =
  | 'pubmed'
  | 'europe_pmc'
  | 'cochrane'
  | 'uptodate'
  | 'medscape'
  | 'other';

/**
 * Scientific reference for clinical evidence.
 */
export interface ScientificReference {
  /** Reference identifier (PMID, DOI, etc.) */
  id: string;
  /** Reference title */
  title: string;
  /** Source database */
  source: ReferenceSource;
  /** Authors (optional) */
  authors?: string;
  /** Publication year */
  year?: number;
  /** Journal name */
  journal?: string;
  /** URL (if different from generated) */
  url?: string;
}

/**
 * Props for EvidenceLinks component.
 */
interface EvidenceLinksProps {
  /** List of references */
  references: ScientificReference[];
  /** Maximum references to show (default 5) */
  maxShown?: number;
  /** Compact mode */
  compact?: boolean;
}

/**
 * Get URL for reference.
 */
function getReferenceUrl(ref: ScientificReference): string {
  if (ref.url) return ref.url;

  switch (ref.source) {
    case 'pubmed':
      return `https://pubmed.ncbi.nlm.nih.gov/${ref.id}`;
    case 'europe_pmc':
      return `https://europepmc.org/article/PMC/${ref.id}`;
    case 'cochrane':
      return `https://www.cochranelibrary.com/cdsr/doi/${ref.id}`;
    case 'uptodate':
      return `https://www.uptodate.com/contents/${ref.id}`;
    case 'medscape':
      return `https://emedicine.medscape.com/article/${ref.id}`;
    default:
      return '#';
  }
}

/**
 * Get source icon.
 */
function getSourceIcon(source: ReferenceSource): React.ReactNode {
  switch (source) {
    case 'pubmed':
    case 'europe_pmc':
      return <BookOpen className="w-4 h-4" />;
    case 'cochrane':
      return <GraduationCap className="w-4 h-4" />;
    case 'uptodate':
    case 'medscape':
      return <FileText className="w-4 h-4" />;
    default:
      return <LinkIcon className="w-4 h-4" />;
  }
}

/**
 * Get source label.
 */
function getSourceLabel(source: ReferenceSource): string {
  switch (source) {
    case 'pubmed':
      return 'PubMed';
    case 'europe_pmc':
      return 'Europe PMC';
    case 'cochrane':
      return 'Cochrane';
    case 'uptodate':
      return 'UpToDate';
    case 'medscape':
      return 'Medscape';
    default:
      return 'Link';
  }
}

/**
 * Get source color.
 */
function getSourceColor(source: ReferenceSource): {
  bg: string;
  text: string;
  border: string;
} {
  switch (source) {
    case 'pubmed':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-100',
      };
    case 'europe_pmc':
      return {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-100',
      };
    case 'cochrane':
      return {
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-100',
      };
    case 'uptodate':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-100',
      };
    case 'medscape':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-100',
      };
    default:
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-100',
      };
  }
}

/**
 * Evidence Links component.
 */
export const EvidenceLinks: React.FC<EvidenceLinksProps> = ({
  references,
  maxShown = 5,
  compact = false,
}) => {
  const [showAll, setShowAll] = React.useState(false);

  const displayedRefs = showAll ? references : references.slice(0, maxShown);
  const hasMore = references.length > maxShown;

  if (references.length === 0) {
    return null;
  }

  // Compact mode - just icons
  if (compact) {
    return (
      <div className="flex items-center gap-1 flex-wrap">
        {displayedRefs.map((ref, index) => {
          const colors = getSourceColor(ref.source);
          return (
            <a
              key={index}
              href={getReferenceUrl(ref)}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ${colors.bg} ${colors.text} text-xs hover:opacity-80 transition-opacity`}
              title={ref.title}
            >
              {getSourceIcon(ref.source)}
              <span>{getSourceLabel(ref.source)}</span>
            </a>
          );
        })}
        {hasMore && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            +{references.length - maxShown}
          </button>
        )}
      </div>
    );
  }

  // Full mode
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <BookOpen className="w-4 h-4" />
        Referências Científicas
      </h4>

      <div className="space-y-2">
        {displayedRefs.map((ref, index) => {
          const colors = getSourceColor(ref.source);
          return (
            <a
              key={index}
              href={getReferenceUrl(ref)}
              target="_blank"
              rel="noopener noreferrer"
              className={`block p-3 rounded-lg border ${colors.border} ${colors.bg} hover:opacity-90 transition-opacity`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-1.5 rounded ${colors.bg} ${colors.text}`}>
                  {getSourceIcon(ref.source)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-2">
                    {ref.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    {ref.authors && (
                      <span className="truncate max-w-[200px]">{ref.authors}</span>
                    )}
                    {ref.journal && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span>{ref.journal}</span>
                      </>
                    )}
                    {ref.year && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span>{ref.year}</span>
                      </>
                    )}
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </div>
            </a>
          );
        })}
      </div>

      {hasMore && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="text-sm text-blue-600 hover:underline"
        >
          Ver mais {references.length - maxShown} referências
        </button>
      )}
    </div>
  );
};

export default EvidenceLinks;

