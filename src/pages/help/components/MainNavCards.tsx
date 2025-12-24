/**
 * Main Nav Cards Component
 * ========================
 *
 * Main navigation cards for FAQ, Articles, and Contact.
 *
 * @module pages/help/components/MainNavCards
 */

import React from 'react';
import { HelpCircle, BookOpen, MessageSquare, ChevronRight } from 'lucide-react';
import type { HelpTab } from '../types';

interface MainNavCardsProps {
  onTabChange: (tab: HelpTab) => void;
}

/**
 * Navigation configuration.
 */
const NAV_ITEMS = [
  {
    id: 'faq' as HelpTab,
    icon: HelpCircle,
    title: 'Perguntas Frequentes',
    description: 'Respostas rápidas para dúvidas comuns',
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    color: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'articles' as HelpTab,
    icon: BookOpen,
    title: 'Guias e Tutoriais',
    description: 'Aprenda a usar todas as funcionalidades',
    bg: 'bg-purple-50 dark:bg-purple-900/30',
    color: 'text-purple-600 dark:text-purple-400',
  },
  {
    id: 'contact' as HelpTab,
    icon: MessageSquare,
    title: 'Fale Conosco',
    description: 'Entre em contato com o suporte',
    bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    color: 'text-emerald-600 dark:text-emerald-400',
  },
];

/**
 * Main navigation cards grid.
 */
export function MainNavCards({
  onTabChange,
}: MainNavCardsProps): React.ReactElement {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className="
              flex items-center gap-4 p-6 rounded-2xl
              bg-genesis-surface border border-genesis-border-subtle
              hover:border-genesis-primary/30 hover:shadow-md
              transition-all group text-left
            "
          >
            <div className={`p-3 rounded-xl ${item.bg}`}>
              <Icon className={`w-6 h-6 ${item.color}`} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-genesis-dark group-hover:text-genesis-primary transition-colors">
                {item.title}
              </h3>
              <p className="text-sm text-genesis-muted">{item.description}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-genesis-muted" />
          </button>
        );
      })}
    </div>
  );
}

export default MainNavCards;
