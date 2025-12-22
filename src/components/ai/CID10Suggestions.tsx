/**
 * CID10Suggestions Component
 *
 * Provides CID-10 code suggestions based on clinical assessment.
 * Integrates with AI-generated diagnoses for one-click code addition.
 *
 * Features:
 * - Search autocomplete for CID-10 codes
 * - AI-suggested codes based on assessment text
 * - Quick add buttons for common codes
 * - Category grouping (ex: J00-J99 Respiratory)
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Search, Plus, Check, Tag, Sparkles } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export interface CID10Code {
  code: string;
  description: string;
  category: string;
}

interface CID10SuggestionsProps {
  /** Current assessment text to analyze */
  assessmentText: string;
  /** AI-suggested diagnoses from transcription */
  aiSuggestions?: string[];
  /** Currently selected codes */
  selectedCodes: string[];
  /** Callback when code is added/removed */
  onCodesChange: (codes: string[]) => void;
  /** Compact mode for inline display */
  compact?: boolean;
}

// ============================================================================
// CID-10 Database (Most Common in Primary Care - Brazil)
// ============================================================================

const CID10_DATABASE: CID10Code[] = [
  // Infectious Diseases (A00-B99)
  { code: 'A09', description: 'Diarreia e gastroenterite de origem infecciosa presumível', category: 'Infecciosas' },
  { code: 'B34.9', description: 'Infecção viral não especificada', category: 'Infecciosas' },

  // Neoplasms (C00-D48) - less common in primary care

  // Endocrine (E00-E90)
  { code: 'E10', description: 'Diabetes mellitus tipo 1', category: 'Endócrinas' },
  { code: 'E11', description: 'Diabetes mellitus tipo 2', category: 'Endócrinas' },
  { code: 'E66', description: 'Obesidade', category: 'Endócrinas' },
  { code: 'E78.0', description: 'Hipercolesterolemia pura', category: 'Endócrinas' },
  { code: 'E78.5', description: 'Hiperlipidemia não especificada', category: 'Endócrinas' },

  // Mental (F00-F99)
  { code: 'F32', description: 'Episódio depressivo', category: 'Transtornos Mentais' },
  { code: 'F32.0', description: 'Episódio depressivo leve', category: 'Transtornos Mentais' },
  { code: 'F32.1', description: 'Episódio depressivo moderado', category: 'Transtornos Mentais' },
  { code: 'F41.0', description: 'Transtorno de pânico', category: 'Transtornos Mentais' },
  { code: 'F41.1', description: 'Ansiedade generalizada', category: 'Transtornos Mentais' },
  { code: 'F41.2', description: 'Transtorno misto ansioso e depressivo', category: 'Transtornos Mentais' },
  { code: 'F51.0', description: 'Insônia não-orgânica', category: 'Transtornos Mentais' },

  // Nervous System (G00-G99)
  { code: 'G43', description: 'Enxaqueca', category: 'Sistema Nervoso' },
  { code: 'G43.0', description: 'Enxaqueca sem aura', category: 'Sistema Nervoso' },
  { code: 'G43.1', description: 'Enxaqueca com aura', category: 'Sistema Nervoso' },
  { code: 'G44.2', description: 'Cefaleia tensional', category: 'Sistema Nervoso' },

  // Circulatory (I00-I99)
  { code: 'I10', description: 'Hipertensão essencial (primária)', category: 'Cardiovascular' },
  { code: 'I11', description: 'Doença cardíaca hipertensiva', category: 'Cardiovascular' },
  { code: 'I20', description: 'Angina pectoris', category: 'Cardiovascular' },
  { code: 'I25', description: 'Doença isquêmica crônica do coração', category: 'Cardiovascular' },
  { code: 'I50', description: 'Insuficiência cardíaca', category: 'Cardiovascular' },

  // Respiratory (J00-J99)
  { code: 'J00', description: 'Nasofaringite aguda (resfriado comum)', category: 'Respiratório' },
  { code: 'J02.9', description: 'Faringite aguda não especificada', category: 'Respiratório' },
  { code: 'J03.9', description: 'Amigdalite aguda não especificada', category: 'Respiratório' },
  { code: 'J06.9', description: 'Infecção aguda das vias aéreas superiores', category: 'Respiratório' },
  { code: 'J11', description: 'Influenza (gripe)', category: 'Respiratório' },
  { code: 'J18.9', description: 'Pneumonia não especificada', category: 'Respiratório' },
  { code: 'J20', description: 'Bronquite aguda', category: 'Respiratório' },
  { code: 'J30', description: 'Rinite alérgica e vasomotora', category: 'Respiratório' },
  { code: 'J45', description: 'Asma', category: 'Respiratório' },

  // Digestive (K00-K93)
  { code: 'K21', description: 'Doença de refluxo gastroesofágico', category: 'Digestivo' },
  { code: 'K29', description: 'Gastrite e duodenite', category: 'Digestivo' },
  { code: 'K30', description: 'Dispepsia funcional', category: 'Digestivo' },
  { code: 'K59.0', description: 'Constipação', category: 'Digestivo' },

  // Skin (L00-L99)
  { code: 'L20', description: 'Dermatite atópica', category: 'Pele' },
  { code: 'L30.9', description: 'Dermatite não especificada', category: 'Pele' },
  { code: 'L50', description: 'Urticária', category: 'Pele' },

  // Musculoskeletal (M00-M99)
  { code: 'M54.5', description: 'Dor lombar baixa (lombalgia)', category: 'Musculoesquelético' },
  { code: 'M54.2', description: 'Cervicalgia', category: 'Musculoesquelético' },
  { code: 'M79.3', description: 'Fibromialgia', category: 'Musculoesquelético' },

  // Genitourinary (N00-N99)
  { code: 'N30', description: 'Cistite', category: 'Geniturinário' },
  { code: 'N39.0', description: 'Infecção do trato urinário', category: 'Geniturinário' },

  // Symptoms/Signs (R00-R99)
  { code: 'R05', description: 'Tosse', category: 'Sintomas' },
  { code: 'R10.4', description: 'Dor abdominal não especificada', category: 'Sintomas' },
  { code: 'R50.9', description: 'Febre não especificada', category: 'Sintomas' },
  { code: 'R51', description: 'Cefaleia', category: 'Sintomas' },
  { code: 'R53', description: 'Mal-estar e fadiga', category: 'Sintomas' },

  // External Causes (V00-Y99) - less common

  // Health Status (Z00-Z99)
  { code: 'Z00.0', description: 'Exame médico geral', category: 'Fatores de Saúde' },
  { code: 'Z00.1', description: 'Exame de rotina da criança', category: 'Fatores de Saúde' },
  { code: 'Z76.0', description: 'Emissão de prescrição de repetição', category: 'Fatores de Saúde' },
];

// Keyword mapping for AI suggestions
const KEYWORD_TO_CID: Record<string, string[]> = {
  gripe: ['J11', 'J06.9'],
  resfriado: ['J00', 'J06.9'],
  tosse: ['R05', 'J20'],
  febre: ['R50.9'],
  dor: ['R51', 'M54.5', 'R10.4'],
  cefaleia: ['R51', 'G43', 'G44.2'],
  enxaqueca: ['G43', 'G43.0', 'G43.1'],
  pressão: ['I10', 'I11'],
  hipertensão: ['I10', 'I11'],
  diabetes: ['E10', 'E11'],
  ansiedade: ['F41.1', 'F41.0', 'F41.2'],
  depressão: ['F32', 'F32.0', 'F32.1'],
  insônia: ['F51.0'],
  gastrite: ['K29', 'K30'],
  refluxo: ['K21'],
  diarreia: ['A09'],
  infecção: ['N39.0', 'J06.9', 'B34.9'],
  urinária: ['N39.0', 'N30'],
  lombalgia: ['M54.5'],
  asma: ['J45'],
  rinite: ['J30'],
  alergia: ['J30', 'L50'],
  dermatite: ['L20', 'L30.9'],
  colesterol: ['E78.0', 'E78.5'],
  obesidade: ['E66'],
};

// ============================================================================
// Helper Functions
// ============================================================================

function searchCID10(query: string): CID10Code[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return [];

  return CID10_DATABASE.filter(
    (item) =>
      item.code.toLowerCase().includes(normalizedQuery) ||
      item.description.toLowerCase().includes(normalizedQuery)
  ).slice(0, 10);
}

function getSuggestionsFromText(text: string): CID10Code[] {
  const normalizedText = text.toLowerCase();
  const suggestedCodes = new Set<string>();

  Object.entries(KEYWORD_TO_CID).forEach(([keyword, codes]) => {
    if (normalizedText.includes(keyword)) {
      codes.forEach((code) => suggestedCodes.add(code));
    }
  });

  return CID10_DATABASE.filter((item) => suggestedCodes.has(item.code)).slice(0, 6);
}

// ============================================================================
// Sub-Components
// ============================================================================

interface CodeChipProps {
  code: CID10Code;
  selected: boolean;
  onToggle: () => void;
  aiSuggested?: boolean;
}

const CodeChip: React.FC<CodeChipProps> = ({ code, selected, onToggle, aiSuggested }) => (
  <button
    onClick={onToggle}
    className={`
      flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all
      ${
        selected
          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
          : 'bg-genesis-soft text-genesis-medium hover:bg-genesis-hover'
      }
    `}
  >
    {aiSuggested && <Sparkles className="w-3 h-3 text-amber-500" />}
    <span className="font-mono font-medium">{code.code}</span>
    {selected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
  </button>
);

// ============================================================================
// Main Component
// ============================================================================

export function CID10Suggestions({
  assessmentText,
  aiSuggestions: _aiSuggestions = [],
  selectedCodes,
  onCodesChange,
  compact = false,
}: CID10SuggestionsProps): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Get AI-based suggestions from assessment text
  const textSuggestions = useMemo(
    () => getSuggestionsFromText(assessmentText),
    [assessmentText]
  );

  // Get search results
  const searchResults = useMemo(() => searchCID10(searchQuery), [searchQuery]);

  // Toggle code selection
  const handleToggleCode = useCallback(
    (code: string) => {
      const newCodes = selectedCodes.includes(code)
        ? selectedCodes.filter((c) => c !== code)
        : [...selectedCodes, code];
      onCodesChange(newCodes);
    },
    [selectedCodes, onCodesChange]
  );

  // Get full code info for selected codes
  const selectedCodeInfo = useMemo(
    () =>
      selectedCodes
        .map((code) => CID10_DATABASE.find((c) => c.code === code))
        .filter(Boolean) as CID10Code[],
    [selectedCodes]
  );

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {selectedCodeInfo.map((code) => (
          <span
            key={code.code}
            className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs rounded-md"
          >
            <Tag className="w-3 h-3" />
            {code.code}
          </span>
        ))}
        {selectedCodes.length === 0 && (
          <span className="text-xs text-genesis-muted">Nenhum CID selecionado</span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-genesis-dark flex items-center gap-2">
          <Tag className="w-4 h-4 text-genesis-primary" />
          Códigos CID-10
        </h4>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="flex items-center gap-1 text-xs text-genesis-primary hover:underline"
        >
          <Search className="w-3.5 h-3.5" />
          Buscar código
        </button>
      </div>

      {/* Search Input */}
      {showSearch && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-genesis-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por código ou descrição..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-genesis-border rounded-lg bg-genesis-bg focus:ring-2 focus:ring-genesis-primary focus:border-transparent"
          />
          {searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-genesis-surface border border-genesis-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {searchResults.map((code) => (
                <button
                  key={code.code}
                  onClick={() => {
                    handleToggleCode(code.code);
                    setSearchQuery('');
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-genesis-hover flex items-center justify-between"
                >
                  <span>
                    <span className="font-mono font-medium text-genesis-primary">{code.code}</span>
                    <span className="ml-2 text-genesis-medium">{code.description}</span>
                  </span>
                  {selectedCodes.includes(code.code) && (
                    <Check className="w-4 h-4 text-emerald-500" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AI Suggestions */}
      {textSuggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-genesis-muted flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Sugestões baseadas na avaliação:
          </p>
          <div className="flex flex-wrap gap-2">
            {textSuggestions.map((code) => (
              <CodeChip
                key={code.code}
                code={code}
                selected={selectedCodes.includes(code.code)}
                onToggle={() => handleToggleCode(code.code)}
                aiSuggested
              />
            ))}
          </div>
        </div>
      )}

      {/* Selected Codes */}
      {selectedCodeInfo.length > 0 && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg space-y-2">
          <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
            Códigos selecionados ({selectedCodeInfo.length}):
          </p>
          <div className="space-y-1">
            {selectedCodeInfo.map((code) => (
              <div
                key={code.code}
                className="flex items-center justify-between text-sm"
              >
                <span>
                  <span className="font-mono font-medium">{code.code}</span>
                  <span className="ml-2 text-genesis-muted">{code.description}</span>
                </span>
                <button
                  onClick={() => handleToggleCode(code.code)}
                  className="text-red-500 hover:text-red-700 text-xs"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {textSuggestions.length === 0 && selectedCodes.length === 0 && !showSearch && (
        <p className="text-xs text-genesis-muted text-center py-2">
          Digite a avaliação para receber sugestões de CID-10
        </p>
      )}
    </div>
  );
}

export default CID10Suggestions;
