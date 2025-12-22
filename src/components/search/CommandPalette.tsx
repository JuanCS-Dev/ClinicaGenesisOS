/**
 * Command Palette Component
 * =========================
 *
 * Global search modal triggered by Cmd+K / Ctrl+K.
 * Allows quick navigation across the application.
 *
 * Fase 14: UX Enhancement
 */

import React, { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  User,
  Calendar,
  FileText,
  Pill,
  DollarSign,
  ArrowRight,
  X,
  Loader2,
  Command,
} from 'lucide-react';
import { useGlobalSearch, type SearchResultType } from '@/hooks/useGlobalSearch';

/**
 * Props for CommandPalette component.
 */
interface CommandPaletteProps {
  /** Whether the palette is open */
  isOpen: boolean;
  /** Callback to close the palette */
  onClose: () => void;
}

/**
 * Get icon for result type.
 */
function getTypeIcon(type: SearchResultType): React.ReactNode {
  switch (type) {
    case 'patient':
      return <User className="w-5 h-5" />;
    case 'appointment':
      return <Calendar className="w-5 h-5" />;
    case 'medical_record':
      return <FileText className="w-5 h-5" />;
    case 'prescription':
      return <Pill className="w-5 h-5" />;
    case 'transaction':
      return <DollarSign className="w-5 h-5" />;
    default:
      return <FileText className="w-5 h-5" />;
  }
}

/**
 * Get type label.
 */
function getTypeLabel(type: SearchResultType): string {
  switch (type) {
    case 'patient':
      return 'Pacientes';
    case 'appointment':
      return 'Consultas';
    case 'medical_record':
      return 'Prontuários';
    case 'prescription':
      return 'Prescrições';
    case 'transaction':
      return 'Transações';
    default:
      return 'Outros';
  }
}

/**
 * Get type color.
 */
function getTypeColor(type: SearchResultType): {
  bg: string;
  text: string;
} {
  switch (type) {
    case 'patient':
      return { bg: 'bg-blue-100', text: 'text-blue-600' };
    case 'appointment':
      return { bg: 'bg-purple-100', text: 'text-purple-600' };
    case 'medical_record':
      return { bg: 'bg-green-100', text: 'text-green-600' };
    case 'prescription':
      return { bg: 'bg-amber-100', text: 'text-amber-600' };
    case 'transaction':
      return { bg: 'bg-emerald-100', text: 'text-emerald-600' };
    default:
      return { bg: 'bg-genesis-hover', text: 'text-genesis-medium' };
  }
}

/**
 * Command Palette component.
 */
export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    query,
    setQuery,
    results,
    loading,
    hasSearched,
    groupedResults,
    clear,
  } = useGlobalSearch();

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  // Handle result selection
  const handleSelect = useCallback(
    (path: string) => {
      navigate(path);
      clear();
      onClose();
    },
    [navigate, clear, onClose]
  );

  // Close and clear on close
  const handleClose = useCallback(() => {
    clear();
    onClose();
  }, [clear, onClose]);

  if (!isOpen) {
    return null;
  }

  // Get result types that have results
  const typesWithResults = (
    Object.entries(groupedResults) as [SearchResultType, typeof results][]
  ).filter(([, items]) => items.length > 0);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="command-palette"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-[10%] -translate-x-1/2 w-full max-w-2xl">
        <div
          className="bg-genesis-surface rounded-2xl shadow-2xl border border-genesis-border overflow-hidden"
          onKeyDown={handleKeyDown}
        >
          {/* Search input */}
          <div className="flex items-center gap-3 p-4 border-b border-genesis-border-subtle">
            <Search className="w-5 h-5 text-genesis-subtle" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar pacientes, consultas, prontuários..."
              className="flex-1 text-lg outline-none placeholder:text-genesis-subtle"
              autoComplete="off"
            />
            {loading && (
              <Loader2 className="w-5 h-5 text-genesis-subtle animate-spin" />
            )}
            <div className="flex items-center gap-1 text-xs text-genesis-subtle">
              <kbd className="px-1.5 py-0.5 bg-genesis-hover rounded text-xs font-mono">
                ESC
              </kbd>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-genesis-hover rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-genesis-subtle" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {/* Empty state */}
            {!hasSearched && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-genesis-hover rounded-2xl flex items-center justify-center">
                  <Command className="w-8 h-8 text-genesis-subtle" />
                </div>
                <p className="text-genesis-muted">
                  Digite para buscar pacientes, consultas e mais...
                </p>
                <div className="mt-4 flex items-center justify-center gap-4 text-xs text-genesis-subtle">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-genesis-hover rounded">↑↓</kbd>
                    Navegar
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-genesis-hover rounded">Enter</kbd>
                    Selecionar
                  </span>
                </div>
              </div>
            )}

            {/* No results */}
            {hasSearched && !loading && results.length === 0 && (
              <div className="p-8 text-center text-genesis-muted">
                Nenhum resultado encontrado para "{query}"
              </div>
            )}

            {/* Grouped results */}
            {typesWithResults.map(([type, items]) => {
              const colors = getTypeColor(type);
              return (
                <div key={type} className="py-2">
                  <div className="px-4 py-2">
                    <span className="text-xs font-medium text-genesis-muted uppercase tracking-wider">
                      {getTypeLabel(type)}
                    </span>
                  </div>
                  {items.map((result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleSelect(result.path)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-genesis-soft transition-colors text-left group"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center flex-shrink-0`}
                      >
                        {getTypeIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-genesis-dark truncate">
                          {result.title}
                        </p>
                        {result.subtitle && (
                          <p className="text-sm text-genesis-muted truncate">
                            {result.subtitle}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="w-5 h-5 text-genesis-subtle opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          {hasSearched && results.length > 0 && (
            <div className="px-4 py-3 border-t border-genesis-border-subtle bg-genesis-soft">
              <div className="flex items-center justify-between text-xs text-genesis-muted">
                <span>{results.length} resultados</span>
                <span className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 bg-genesis-surface border border-genesis-border rounded">
                    Tab
                  </kbd>
                  para ações rápidas
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;

