/**
 * Article Detail View Component
 * =============================
 *
 * Full article display with related articles.
 *
 * @module pages/help/components/ArticleDetailView
 */

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { DEFAULT_HELP_ARTICLES, type HelpArticle } from '@/components/help';
import { ArticleContent } from './ArticleContent';

interface ArticleDetailViewProps {
  article: HelpArticle;
  onBack: () => void;
  onArticleSelect: (article: HelpArticle) => void;
}

/**
 * Article detail view with content and related articles.
 */
export function ArticleDetailView({
  article,
  onBack,
  onArticleSelect,
}: ArticleDetailViewProps): React.ReactElement {
  // Get related articles from same category
  const relatedArticles = DEFAULT_HELP_ARTICLES.filter(
    (a) => a.category === article.category && a.id !== article.id
  ).slice(0, 2);

  return (
    <div className="max-w-3xl mx-auto animate-enter">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-genesis-muted hover:text-genesis-dark mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Voltar aos Artigos</span>
      </button>

      {/* Article Header */}
      <div className="mb-8">
        <span className="text-xs font-semibold text-genesis-primary uppercase tracking-wider">
          {article.category}
        </span>
        <h1 className="text-2xl font-bold text-genesis-dark mt-2 mb-3">
          {article.title}
        </h1>
        <p className="text-genesis-medium">{article.excerpt}</p>
      </div>

      {/* Article Content */}
      <div className="bg-genesis-surface rounded-2xl border border-genesis-border-subtle p-8">
        <article className="prose prose-sm max-w-none text-genesis-dark prose-headings:text-genesis-dark prose-p:text-genesis-medium prose-strong:text-genesis-dark prose-li:text-genesis-medium">
          <ArticleContent content={article.content} />
        </article>
      </div>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold text-genesis-dark mb-4">
            Artigos Relacionados
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedArticles.map((relatedArticle) => (
              <button
                key={relatedArticle.id}
                onClick={() => onArticleSelect(relatedArticle)}
                className="text-left p-4 bg-genesis-surface rounded-xl border border-genesis-border-subtle hover:border-genesis-primary/30 transition-all group"
              >
                <h4 className="font-medium text-genesis-dark text-sm group-hover:text-genesis-primary transition-colors">
                  {relatedArticle.title}
                </h4>
                <p className="text-xs text-genesis-muted mt-1 line-clamp-2">
                  {relatedArticle.excerpt}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ArticleDetailView;
