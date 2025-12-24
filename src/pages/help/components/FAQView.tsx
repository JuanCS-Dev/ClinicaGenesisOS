/**
 * FAQ View Component
 * ==================
 *
 * FAQ tab content with search and filtering.
 *
 * @module pages/help/components/FAQView
 */

import React from 'react';
import { HelpCircle } from 'lucide-react';
import { FAQAccordion, DEFAULT_FAQ_DATA } from '@/components/help';

interface FAQViewProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string | null;
  onClearCategory: () => void;
}

/**
 * FAQ section with search and category filter.
 */
export function FAQView({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onClearCategory,
}: FAQViewProps): React.ReactElement {
  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar nas perguntas frequentes..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="
            w-full pl-12 pr-4 py-3 rounded-xl
            bg-genesis-surface border border-genesis-border
            text-genesis-dark placeholder-genesis-muted
            focus:outline-none focus:ring-2 focus:ring-genesis-primary focus:border-transparent
          "
        />
        <HelpCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-genesis-muted" />
      </div>

      {/* Category Filter */}
      {selectedCategory && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-genesis-muted">Filtrado por:</span>
          <span className="px-3 py-1 bg-genesis-primary/10 text-genesis-primary rounded-full text-sm font-medium capitalize">
            {selectedCategory}
          </span>
          <button
            onClick={onClearCategory}
            className="text-xs text-genesis-muted hover:text-genesis-dark"
          >
            Limpar
          </button>
        </div>
      )}

      {/* FAQ Accordion */}
      <FAQAccordion
        items={DEFAULT_FAQ_DATA}
        category={selectedCategory || undefined}
        searchQuery={searchQuery}
      />
    </div>
  );
}

export default FAQView;
