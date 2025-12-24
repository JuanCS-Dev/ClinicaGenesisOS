/**
 * Help Nav Tabs Component
 * =======================
 *
 * Navigation tabs for help sections.
 *
 * @module pages/help/components/HelpNavTabs
 */

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import type { HelpTab } from '../types';

interface HelpNavTabsProps {
  activeTab: HelpTab;
  onBack: () => void;
  onTabChange: (tab: HelpTab) => void;
}

/**
 * Navigation tabs with back button.
 */
export function HelpNavTabs({
  activeTab,
  onBack,
  onTabChange,
}: HelpNavTabsProps): React.ReactElement {
  const tabs: Array<{ id: HelpTab; label: string }> = [
    { id: 'faq', label: 'FAQ' },
    { id: 'articles', label: 'Artigos' },
    { id: 'contact', label: 'Contato' },
  ];

  return (
    <div className="flex items-center justify-between mb-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-genesis-muted hover:text-genesis-dark transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Voltar</span>
      </button>

      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-genesis-primary text-white'
                : 'text-genesis-medium hover:bg-genesis-hover'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default HelpNavTabs;
