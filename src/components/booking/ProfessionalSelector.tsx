/**
 * ProfessionalSelector Component
 *
 * Displays available professionals for booking selection.
 * Inspired by Zocdoc's doctor selection UI.
 *
 * Features:
 * - Professional cards with avatar and specialty
 * - Filter by specialty
 * - Availability indicators
 * - Mobile-friendly grid
 */

import React, { useState, useMemo } from 'react';
import { User, Star, Calendar, Clock, ChevronRight } from 'lucide-react';
import type { SpecialtyType } from '@/types';

/**
 * Professional data for public display.
 */
export interface PublicProfessional {
  id: string;
  name: string;
  specialty: SpecialtyType;
  avatar?: string;
  bio?: string;
  /** Next available slot */
  nextAvailable?: string;
  /** Average rating (1-5) */
  rating?: number;
  /** Number of reviews */
  reviewCount?: number;
}

interface ProfessionalSelectorProps {
  /** List of available professionals */
  professionals: PublicProfessional[];
  /** Currently selected professional ID */
  selectedId?: string;
  /** Callback when a professional is selected */
  onSelect: (professional: PublicProfessional) => void;
  /** Loading state */
  loading?: boolean;
}

/**
 * Specialty display names in Portuguese.
 */
const SPECIALTY_LABELS: Record<SpecialtyType, string> = {
  medicina: 'Medicina',
  nutricao: 'Nutrição',
  psicologia: 'Psicologia',
};

/**
 * Specialty colors for visual distinction.
 */
const SPECIALTY_COLORS: Record<SpecialtyType, { bg: string; text: string }> = {
  medicina: {
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    text: 'text-blue-600 dark:text-blue-400',
  },
  nutricao: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  psicologia: {
    bg: 'bg-purple-50 dark:bg-purple-900/30',
    text: 'text-purple-600 dark:text-purple-400',
  },
};

/**
 * Professional card component.
 */
const ProfessionalCard: React.FC<{
  professional: PublicProfessional;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ professional, isSelected, onSelect }) => {
  const colors = SPECIALTY_COLORS[professional.specialty];

  return (
    <button
      onClick={onSelect}
      className={`
        w-full text-left p-4 rounded-2xl border-2 transition-all duration-200
        ${
          isSelected
            ? 'border-genesis-primary bg-genesis-primary/5 shadow-md'
            : 'border-genesis-border-subtle bg-genesis-surface hover:border-genesis-primary/30 hover:shadow-md'
        }
      `}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {professional.avatar ? (
            <img
              src={professional.avatar}
              alt={professional.name}
              className="w-16 h-16 rounded-xl object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-genesis-soft flex items-center justify-center">
              <User className="w-8 h-8 text-genesis-muted" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-genesis-dark text-base mb-1">
            {professional.name}
          </h3>

          {/* Specialty Badge */}
          <span
            className={`
              inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
              ${colors.bg} ${colors.text}
            `}
          >
            {SPECIALTY_LABELS[professional.specialty]}
          </span>

          {/* Bio */}
          {professional.bio && (
            <p className="text-sm text-genesis-muted mt-2 line-clamp-2">{professional.bio}</p>
          )}

          {/* Meta info */}
          <div className="flex items-center gap-4 mt-3">
            {/* Rating */}
            {professional.rating && (
              <div className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="font-medium text-genesis-dark">{professional.rating}</span>
                {professional.reviewCount && (
                  <span className="text-genesis-muted">({professional.reviewCount})</span>
                )}
              </div>
            )}

            {/* Next available */}
            {professional.nextAvailable && (
              <div className="flex items-center gap-1 text-sm text-genesis-muted">
                <Clock className="w-3.5 h-3.5" />
                <span>Próximo: {professional.nextAvailable}</span>
              </div>
            )}
          </div>
        </div>

        {/* Selection indicator */}
        <div
          className={`
            flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
            ${
              isSelected
                ? 'border-genesis-primary bg-genesis-primary'
                : 'border-genesis-border'
            }
          `}
        >
          {isSelected && (
            <ChevronRight className="w-4 h-4 text-white" />
          )}
        </div>
      </div>
    </button>
  );
};

/**
 * Skeleton loader for professional card.
 */
function ProfessionalCardSkeleton() {
  return (
    <div className="p-4 rounded-2xl border border-genesis-border-subtle bg-genesis-surface animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-xl bg-genesis-soft" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-32 bg-genesis-soft rounded" />
          <div className="h-4 w-20 bg-genesis-soft rounded-full" />
          <div className="h-4 w-full bg-genesis-soft rounded mt-2" />
        </div>
      </div>
    </div>
  );
}

/**
 * Professional selector with filtering.
 *
 * @example
 * <ProfessionalSelector
 *   professionals={professionals}
 *   selectedId={selectedProfessionalId}
 *   onSelect={(p) => setSelectedProfessional(p)}
 * />
 */
export function ProfessionalSelector({
  professionals,
  selectedId,
  onSelect,
  loading = false,
}: ProfessionalSelectorProps): React.ReactElement {
  const [filterSpecialty, setFilterSpecialty] = useState<SpecialtyType | null>(null);

  // Get unique specialties
  const specialties = useMemo(() => {
    return [...new Set(professionals.map((p) => p.specialty))];
  }, [professionals]);

  // Filter professionals
  const filteredProfessionals = useMemo(() => {
    if (!filterSpecialty) return professionals;
    return professionals.filter((p) => p.specialty === filterSpecialty);
  }, [professionals, filterSpecialty]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-9 w-24 bg-genesis-soft rounded-full animate-pulse" />
          ))}
        </div>
        {[1, 2, 3].map((i) => (
          <ProfessionalCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Specialty Filter */}
      {specialties.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterSpecialty(null)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-all
              ${
                !filterSpecialty
                  ? 'bg-genesis-primary text-white'
                  : 'bg-genesis-soft text-genesis-medium hover:bg-genesis-hover'
              }
            `}
          >
            Todos
          </button>
          {specialties.map((specialty) => (
            <button
              key={specialty}
              onClick={() => setFilterSpecialty(specialty)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all
                ${
                  filterSpecialty === specialty
                    ? 'bg-genesis-primary text-white'
                    : 'bg-genesis-soft text-genesis-medium hover:bg-genesis-hover'
                }
              `}
            >
              {SPECIALTY_LABELS[specialty]}
            </button>
          ))}
        </div>
      )}

      {/* Professional List */}
      {filteredProfessionals.length === 0 ? (
        <div className="p-8 text-center">
          <Calendar className="w-12 h-12 text-genesis-muted mx-auto mb-3 opacity-50" />
          <p className="text-genesis-muted">Nenhum profissional disponível.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProfessionals.map((professional) => (
            <ProfessionalCard
              key={professional.id}
              professional={professional}
              isSelected={selectedId === professional.id}
              onSelect={() => onSelect(professional)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ProfessionalSelector;
