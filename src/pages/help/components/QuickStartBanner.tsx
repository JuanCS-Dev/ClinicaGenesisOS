/**
 * Quick Start Banner Component
 * ============================
 *
 * Banner for new users to get started.
 *
 * @module pages/help/components/QuickStartBanner
 */

import React from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';
import { DEFAULT_HELP_ARTICLES, type HelpArticle } from '@/components/help';

interface QuickStartBannerProps {
  onArticleSelect: (article: HelpArticle) => void;
}

/**
 * Quick start promotional banner.
 */
export function QuickStartBanner({
  onArticleSelect,
}: QuickStartBannerProps): React.ReactElement {
  const handleClick = (): void => {
    const startArticle = DEFAULT_HELP_ARTICLES.find((a) => a.id === 'start-1');
    if (startArticle) {
      onArticleSelect(startArticle);
    }
  };

  return (
    <div className="bg-gradient-to-r from-genesis-primary/10 to-clinical-soft rounded-2xl p-6 mb-10">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-genesis-surface/80">
          <Sparkles className="w-6 h-6 text-genesis-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-genesis-dark mb-1">
            Novo no Genesis OS?
          </h3>
          <p className="text-sm text-genesis-medium mb-4">
            Comece com nosso guia de primeiros passos e aprenda a configurar sua
            clínica em minutos.
          </p>
          <button
            onClick={handleClick}
            className="inline-flex items-center gap-2 px-4 py-2 bg-genesis-primary text-white rounded-lg text-sm font-medium hover:bg-genesis-primary-dark transition-colors"
          >
            Começar Agora
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuickStartBanner;
