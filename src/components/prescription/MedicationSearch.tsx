/**
 * MedicationSearch Component
 *
 * Search input for finding medications in the Memed database.
 * Displays autocomplete results with medication details.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, Pill, AlertTriangle, Loader2 } from 'lucide-react';
import type { MemedMedication, MedicationSearchProps } from '@/types';

/**
 * Mock medication database for demo purposes.
 * In production, this would call the Memed API.
 */
const MOCK_MEDICATIONS: MemedMedication[] = [
  {
    id: 'med-1',
    name: 'Dipirona Sódica 500mg',
    activePrinciple: 'Dipirona',
    presentation: 'Comprimido - Caixa com 20 unidades',
    manufacturer: 'EMS',
    isControlled: false,
    requiresSpecialPrescription: false,
  },
  {
    id: 'med-2',
    name: 'Amoxicilina 500mg',
    activePrinciple: 'Amoxicilina',
    presentation: 'Cápsula - Caixa com 21 unidades',
    manufacturer: 'Medley',
    isControlled: false,
    controlType: 'antimicrobial',
    requiresSpecialPrescription: true,
  },
  {
    id: 'med-3',
    name: 'Rivotril 2mg',
    activePrinciple: 'Clonazepam',
    presentation: 'Comprimido - Caixa com 30 unidades',
    manufacturer: 'Roche',
    isControlled: true,
    controlType: 'B1',
    requiresSpecialPrescription: true,
  },
  {
    id: 'med-4',
    name: 'Omeprazol 20mg',
    activePrinciple: 'Omeprazol',
    presentation: 'Cápsula - Caixa com 28 unidades',
    manufacturer: 'EMS',
    isControlled: false,
    requiresSpecialPrescription: false,
  },
  {
    id: 'med-5',
    name: 'Losartana 50mg',
    activePrinciple: 'Losartana Potássica',
    presentation: 'Comprimido - Caixa com 30 unidades',
    manufacturer: 'Sandoz',
    isControlled: false,
    requiresSpecialPrescription: false,
  },
  {
    id: 'med-6',
    name: 'Ritalina 10mg',
    activePrinciple: 'Metilfenidato',
    presentation: 'Comprimido - Caixa com 30 unidades',
    manufacturer: 'Novartis',
    isControlled: true,
    controlType: 'A3',
    requiresSpecialPrescription: true,
  },
  {
    id: 'med-7',
    name: 'Azitromicina 500mg',
    activePrinciple: 'Azitromicina',
    presentation: 'Comprimido - Caixa com 3 unidades',
    manufacturer: 'Eurofarma',
    isControlled: false,
    controlType: 'antimicrobial',
    requiresSpecialPrescription: true,
  },
  {
    id: 'med-8',
    name: 'Metformina 850mg',
    activePrinciple: 'Cloridrato de Metformina',
    presentation: 'Comprimido - Caixa com 30 unidades',
    manufacturer: 'Merck',
    isControlled: false,
    requiresSpecialPrescription: false,
  },
];

/**
 * Search medications with debounce.
 */
async function searchMedications(query: string): Promise<MemedMedication[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (!query || query.length < 2) {
    return [];
  }

  const normalizedQuery = query.toLowerCase();
  return MOCK_MEDICATIONS.filter(
    (med) =>
      med.name.toLowerCase().includes(normalizedQuery) ||
      med.activePrinciple.toLowerCase().includes(normalizedQuery)
  );
}

/**
 * MedicationSearch - Autocomplete search for medications.
 */
export function MedicationSearch({
  onSelect,
  placeholder = 'Buscar medicamento...',
  disabled = false,
}: MedicationSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MemedMedication[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  /**
   * Handle search query change.
   */
  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    setHighlightedIndex(-1);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const medications = await searchMedications(value);
        setResults(medications);
        setIsOpen(medications.length > 0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  /**
   * Handle medication selection.
   */
  const handleSelect = useCallback(
    (medication: MemedMedication) => {
      onSelect(medication);
      setQuery('');
      setResults([]);
      setIsOpen(false);
      inputRef.current?.focus();
    },
    [onSelect]
  );

  /**
   * Handle keyboard navigation.
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen || results.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0) {
            handleSelect(results[highlightedIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;
      }
    },
    [isOpen, results, highlightedIndex, handleSelect]
  );

  /**
   * Close dropdown when clicking outside.
   */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        listRef.current &&
        !listRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Cleanup debounce on unmount.
   */
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-genesis-subtle" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full pl-10 pr-10 py-3 border border-genesis-border rounded-xl focus:outline-none focus:ring-2 focus:ring-genesis-primary focus:border-transparent disabled:bg-genesis-hover disabled:cursor-not-allowed"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 animate-spin" />
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && results.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-50 w-full mt-1 bg-genesis-surface border border-genesis-border rounded-xl shadow-lg max-h-80 overflow-y-auto"
          role="listbox"
        >
          {results.map((medication, index) => (
            <li
              key={medication.id}
              onClick={() => handleSelect(medication)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`px-4 py-3 cursor-pointer border-b border-genesis-border-subtle last:border-b-0 ${
                highlightedIndex === index ? 'bg-blue-50' : 'hover:bg-genesis-soft'
              }`}
              role="option"
              aria-selected={highlightedIndex === index}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    medication.isControlled ? 'bg-amber-100' : 'bg-blue-100'
                  }`}
                >
                  {medication.isControlled ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  ) : (
                    <Pill className="w-4 h-4 text-blue-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-medium text-genesis-dark truncate">{medication.name}</div>
                  <div className="text-sm text-genesis-muted">{medication.activePrinciple}</div>
                  <div className="text-xs text-genesis-subtle mt-0.5">
                    {medication.presentation} • {medication.manufacturer}
                  </div>
                </div>

                {medication.isControlled && medication.controlType && (
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded ${
                      medication.controlType.startsWith('A')
                        ? 'bg-yellow-100 text-yellow-800'
                        : medication.controlType.startsWith('B')
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-genesis-hover text-genesis-dark'
                    }`}
                  >
                    {medication.controlType}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Empty state */}
      {isOpen && results.length === 0 && query.length >= 2 && !loading && (
        <div className="absolute z-50 w-full mt-1 p-4 bg-genesis-surface border border-genesis-border rounded-xl shadow-lg text-center text-genesis-muted">
          Nenhum medicamento encontrado
        </div>
      )}
    </div>
  );
}
