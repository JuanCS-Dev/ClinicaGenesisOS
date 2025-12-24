/**
 * Article Content Component
 * =========================
 *
 * Safely renders article content with XSS protection.
 *
 * @module pages/help/components/ArticleContent
 */

import React, { useMemo } from 'react';
import { sanitizeHTML } from '@/utils/sanitize';

interface ArticleContentProps {
  content: string;
}

/**
 * Safely render article content with XSS protection.
 * Converts markdown-like syntax to HTML and sanitizes output.
 */
export function ArticleContent({ content }: ArticleContentProps): React.ReactElement {
  const safeHTML = useMemo(() => {
    const html = content
      .split('\n')
      .map((line) => {
        // Escape any HTML in the line first
        const escapedLine = line
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');

        if (escapedLine.startsWith('# ')) {
          return `<h1 class="text-xl font-bold mt-6 mb-4">${escapedLine.slice(2)}</h1>`;
        }
        if (escapedLine.startsWith('## ')) {
          return `<h2 class="text-lg font-semibold mt-5 mb-3">${escapedLine.slice(3)}</h2>`;
        }
        if (escapedLine.startsWith('- ')) {
          return `<li class="ml-4">${escapedLine.slice(2)}</li>`;
        }
        if (escapedLine.match(/^\d+\./)) {
          return `<li class="ml-4 list-decimal">${escapedLine.replace(/^\d+\.\s*/, '')}</li>`;
        }
        if (escapedLine.trim()) {
          return `<p class="my-3">${escapedLine}</p>`;
        }
        return '';
      })
      .join('');

    // Final sanitization pass with DOMPurify
    return sanitizeHTML(html);
  }, [content]);

  return <div dangerouslySetInnerHTML={{ __html: safeHTML }} />;
}

export default ArticleContent;
