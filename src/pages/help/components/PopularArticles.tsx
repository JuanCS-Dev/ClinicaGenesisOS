/**
 * Popular Articles Component
 * ==========================
 *
 * Grid of popular help articles.
 *
 * @module pages/help/components/PopularArticles
 */

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { DEFAULT_HELP_ARTICLES, type HelpArticle } from '@/components/help';

interface PopularArticlesProps {
  onArticleSelect: (article: HelpArticle) => void;
}

/**
 * Popular articles grid.
 */
export function PopularArticles({
  onArticleSelect,
}: PopularArticlesProps): React.ReactElement {
  return (
    <div>
      <h2 className="font-semibold text-genesis-dark mb-4">Artigos Populares</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DEFAULT_HELP_ARTICLES.slice(0, 4).map((article) => (
          <button
            key={article.id}
            onClick={() => onArticleSelect(article)}
            className="
              text-left p-4 rounded-xl
              bg-genesis-surface border border-genesis-border-subtle
              hover:border-genesis-primary/30 hover:shadow-md
              transition-all group flex items-center gap-4
            "
          >
            <div className="flex-1">
              <h4 className="font-medium text-genesis-dark text-sm group-hover:text-genesis-primary transition-colors">
                {article.title}
              </h4>
              <p className="text-xs text-genesis-muted mt-1 line-clamp-1">
                {article.excerpt}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-genesis-muted flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default PopularArticles;
