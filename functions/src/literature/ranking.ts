/**
 * Literature Ranking and Deduplication
 *
 * Merges results from multiple sources, removes duplicates,
 * and ranks by relevance (citations × recency × journal quality).
 */

import type { ScientificArticle } from './types.js';

/**
 * High-impact medical journals (simplified list).
 * These get a relevance boost.
 */
const TIER1_JOURNALS = new Set([
  'new england journal of medicine',
  'nejm',
  'lancet',
  'jama',
  'bmj',
  'nature medicine',
  'nature',
  'science',
  'cell',
  'annals of internal medicine',
  'circulation',
  'diabetes care',
  'diabetes',
  'journal of clinical endocrinology and metabolism',
  'gastroenterology',
  'hepatology',
  'kidney international',
  'blood',
  'journal of clinical oncology',
]);

/**
 * Deduplicate articles from multiple sources.
 * Uses DOI as primary key, falls back to PMID, then title similarity.
 */
export function deduplicateArticles(
  articles: ScientificArticle[]
): ScientificArticle[] {
  const seen = new Map<string, ScientificArticle>();

  for (const article of articles) {
    // Try DOI first (most reliable)
    if (article.doi) {
      const normalizedDoi = article.doi.toLowerCase().trim();
      if (!seen.has(`doi:${normalizedDoi}`)) {
        seen.set(`doi:${normalizedDoi}`, article);
      } else {
        // Merge: keep the one with more data
        const existing = seen.get(`doi:${normalizedDoi}`)!;
        seen.set(`doi:${normalizedDoi}`, mergeArticles(existing, article));
      }
      continue;
    }

    // Try PMID
    if (article.pmid) {
      if (!seen.has(`pmid:${article.pmid}`)) {
        seen.set(`pmid:${article.pmid}`, article);
      } else {
        const existing = seen.get(`pmid:${article.pmid}`)!;
        seen.set(`pmid:${article.pmid}`, mergeArticles(existing, article));
      }
      continue;
    }

    // Fallback: normalize title
    const normalizedTitle = normalizeTitle(article.title);
    if (!seen.has(`title:${normalizedTitle}`)) {
      seen.set(`title:${normalizedTitle}`, article);
    }
  }

  return Array.from(seen.values());
}

/**
 * Merge two article records, keeping the best data from each.
 */
function mergeArticles(
  a: ScientificArticle,
  b: ScientificArticle
): ScientificArticle {
  return {
    id: a.id || b.id,
    source: a.source, // Keep first source
    title: a.title.length > b.title.length ? a.title : b.title,
    authors: a.authors.length > b.authors.length ? a.authors : b.authors,
    journal: a.journal || b.journal,
    year: a.year || b.year,
    doi: a.doi || b.doi,
    pmid: a.pmid || b.pmid,
    abstractExcerpt: a.abstractExcerpt || b.abstractExcerpt,
    citationCount: Math.max(a.citationCount, b.citationCount),
    isOpenAccess: a.isOpenAccess || b.isOpenAccess,
    url: a.url || b.url,
    relevanceScore: Math.max(a.relevanceScore, b.relevanceScore),
  };
}

/**
 * Normalize title for comparison.
 */
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100);
}

/**
 * Rank articles by relevance score.
 *
 * Score formula:
 * - Base: 50
 * - Citations: +log10(citations) × 10 (max +30)
 * - Recency: +10 if last 3 years, +5 if last 5 years
 * - Journal tier: +15 for tier-1 journals
 * - Open access: +5
 * - Has abstract: +5
 */
export function rankArticles(articles: ScientificArticle[]): ScientificArticle[] {
  const currentYear = new Date().getFullYear();

  const scored = articles.map((article) => {
    let score = 50; // Base score

    // Citation boost (logarithmic to prevent outliers dominating)
    if (article.citationCount > 0) {
      score += Math.min(30, Math.log10(article.citationCount + 1) * 10);
    }

    // Recency boost
    const age = currentYear - article.year;
    if (age <= 3) {
      score += 10;
    } else if (age <= 5) {
      score += 5;
    } else if (age > 10) {
      score -= 10; // Penalty for old articles
    }

    // Journal tier boost
    const journalLower = article.journal.toLowerCase();
    if (TIER1_JOURNALS.has(journalLower)) {
      score += 15;
    }

    // Open access boost
    if (article.isOpenAccess) {
      score += 5;
    }

    // Abstract available boost
    if (article.abstractExcerpt) {
      score += 5;
    }

    return {
      ...article,
      relevanceScore: Math.round(Math.min(100, Math.max(0, score))),
    };
  });

  // Sort by score descending
  return scored.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * Filter articles by minimum quality criteria.
 *
 * @param articles - Articles to filter
 * @param minCitations - Minimum citations for articles > 2 years old
 * @param minYear - Minimum publication year
 */
export function filterByQuality(
  articles: ScientificArticle[],
  minCitations = 10,
  minYear = 2015
): ScientificArticle[] {
  const currentYear = new Date().getFullYear();

  return articles.filter((article) => {
    // Must be recent enough
    if (article.year < minYear) {
      return false;
    }

    // For older articles (> 2 years), require minimum citations
    const age = currentYear - article.year;
    if (age > 2 && article.citationCount < minCitations) {
      return false;
    }

    // Must have a title
    if (!article.title || article.title === 'Untitled') {
      return false;
    }

    return true;
  });
}

/**
 * Full processing pipeline: deduplicate → filter → rank → limit.
 */
export function processArticles(
  articles: ScientificArticle[],
  limit = 4
): ScientificArticle[] {
  const deduplicated = deduplicateArticles(articles);
  const filtered = filterByQuality(deduplicated);
  const ranked = rankArticles(filtered);
  return ranked.slice(0, limit);
}

export default {
  deduplicateArticles,
  rankArticles,
  filterByQuality,
  processArticles,
};
