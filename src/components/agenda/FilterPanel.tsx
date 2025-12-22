/**
 * FilterPanel Component
 *
 * Popover panel for filtering appointments by status and specialty.
 */

import React from 'react';
import { X, Check } from 'lucide-react';
import { Status, type SpecialtyType } from '@/types';
import { STATUS_COLORS, SPECIALTY_COLORS } from './AppointmentCard';

/** All available statuses. */
const ALL_STATUSES = Object.values(Status);

/** All available specialties with labels. */
const SPECIALTY_LABELS: Record<SpecialtyType, string> = {
  medicina: 'Medicina',
  nutricao: 'Nutrição',
  psicologia: 'Psicologia',
};

/** Client-side filters for appointments. */
export interface LocalFilters {
  statuses: Status[];
  specialties: SpecialtyType[];
}

interface FilterPanelProps {
  /** Current filter state */
  filters: LocalFilters;
  /** Callback to toggle a status filter */
  onToggleStatus: (status: Status) => void;
  /** Callback to toggle a specialty filter */
  onToggleSpecialty: (specialty: SpecialtyType) => void;
  /** Callback to clear all filters */
  onClear: () => void;
  /** Callback to close the panel */
  onClose: () => void;
}

/**
 * Filter panel for appointments.
 */
export function FilterPanel({
  filters,
  onToggleStatus,
  onToggleSpecialty,
  onClear,
  onClose,
}: FilterPanelProps) {
  const hasActiveFilters = filters.statuses.length > 0 || filters.specialties.length > 0;

  return (
    <div className="absolute right-0 top-full mt-2 w-72 bg-genesis-surface rounded-2xl shadow-xl border border-genesis-border-subtle z-50 overflow-hidden animate-enter">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-genesis-border-subtle bg-genesis-soft/50">
        <span className="text-sm font-bold text-genesis-dark">Filtros</span>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={onClear}
              className="text-xs font-medium text-genesis-medium hover:text-genesis-dark transition-colors"
            >
              Limpar
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-genesis-hover rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-genesis-medium" />
          </button>
        </div>
      </div>

      {/* Status Filters */}
      <div className="p-4 border-b border-genesis-border-subtle">
        <p className="text-xs font-bold text-genesis-medium uppercase tracking-wider mb-3">
          Status
        </p>
        <div className="flex flex-wrap gap-2">
          {ALL_STATUSES.map((status) => {
            const isActive = filters.statuses.includes(status);
            const colors = STATUS_COLORS[status];
            return (
              <button
                key={status}
                onClick={() => onToggleStatus(status)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? `${colors.bg} ${colors.text} ring-2 ring-offset-1 ring-current`
                    : 'bg-genesis-hover text-genesis-medium hover:bg-genesis-border-subtle'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isActive ? colors.dot : 'bg-genesis-subtle'}`} />
                {status}
              </button>
            );
          })}
        </div>
      </div>

      {/* Specialty Filters */}
      <div className="p-4">
        <p className="text-xs font-bold text-genesis-medium uppercase tracking-wider mb-3">
          Especialidade
        </p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(SPECIALTY_LABELS) as SpecialtyType[]).map((specialty) => {
            const isActive = filters.specialties.includes(specialty);
            const colors = SPECIALTY_COLORS[specialty];
            return (
              <button
                key={specialty}
                onClick={() => onToggleSpecialty(specialty)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? `${colors.bg.replace('from-', 'bg-').replace('/90 to-white', '')} ${colors.border.replace('border-', 'text-')} ring-2 ring-offset-1 ring-current`
                    : 'bg-genesis-hover text-genesis-medium hover:bg-genesis-border-subtle'
                }`}
              >
                {isActive && <Check className="w-3 h-3" />}
                {SPECIALTY_LABELS[specialty]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
