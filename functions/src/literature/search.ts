/**
 * Literature Search Orchestrator
 *
 * Main entry point for scientific literature search.
 * Coordinates multiple APIs, caching, and ranking.
 */

import { searchPubMed } from './pubmed-client.js';
import { searchEuropePMC } from './europepmc-client.js';
import { buildPubMedQuery, buildEuropePMCQuery, generateCacheKey } from './query-builder.js';
import { getCachedResults, setCachedResults } from './cache.js';
import { processArticles } from './ranking.js';
import type { LiteratureQuery, LiteratureSearchResult, ScientificArticle } from './types.js';

/** Timeout for API calls (3 seconds) */
const API_TIMEOUT_MS = 3000;

/** Max articles per source before merging */
const MAX_PER_SOURCE = 5;

/**
 * Search for scientific literature supporting a diagnosis.
 *
 * @param query - Search parameters (ICD-10, condition name, biomarkers)
 * @returns Search result with articles and metadata
 */
export async function searchLiterature(
  query: LiteratureQuery
): Promise<LiteratureSearchResult> {
  const startTime = Date.now();
  const warnings: string[] = [];

  // Generate cache key
  const cacheKey = generateCacheKey(query);

  // Check cache first
  const cached = await getCachedResults(cacheKey);
  if (cached && cached.length > 0) {
    return {
      articles: cached,
      fromCache: true,
      latencyMs: Date.now() - startTime,
    };
  }

  // Build queries for each API
  const pubmedQuery = buildPubMedQuery(query);
  const europepmcQuery = buildEuropePMCQuery(query);

  // PubMed and EuropePMC queries built

  // Search both APIs in parallel with timeout
  const [pubmedResults, europepmcResults] = await Promise.all([
    withTimeout(
      searchPubMed(pubmedQuery, MAX_PER_SOURCE),
      API_TIMEOUT_MS,
      'PubMed'
    ).catch((err) => {
      warnings.push(`PubMed: ${err.message}`);
      return [] as ScientificArticle[];
    }),
    withTimeout(
      searchEuropePMC(europepmcQuery, MAX_PER_SOURCE),
      API_TIMEOUT_MS,
      'EuropePMC'
    ).catch((err) => {
      warnings.push(`EuropePMC: ${err.message}`);
      return [] as ScientificArticle[];
    }),
  ]);

  // Results fetched from both APIs

  // Merge and process results
  const allArticles = [...pubmedResults, ...europepmcResults];
  const processedArticles = processArticles(allArticles, 4);

  // Cache results (if we got any)
  if (processedArticles.length > 0) {
    await setCachedResults(cacheKey, processedArticles);
  }

  return {
    articles: processedArticles,
    fromCache: false,
    latencyMs: Date.now() - startTime,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Search for multiple diagnoses in parallel.
 *
 * @param diagnoses - Array of diagnosis queries
 * @returns Map of ICD-10 code to search results
 */
export async function searchForDiagnoses(
  diagnoses: LiteratureQuery[]
): Promise<Map<string, LiteratureSearchResult>> {
  const results = new Map<string, LiteratureSearchResult>();

  // Search all diagnoses in parallel
  const searches = diagnoses.map(async (query) => {
    const result = await searchLiterature(query);
    return { icd10: query.icd10Code, result };
  });

  const allResults = await Promise.all(searches);

  for (const { icd10, result } of allResults) {
    results.set(icd10, result);
  }

  return results;
}

/**
 * Wrap a promise with a timeout.
 */
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  label: string
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timeout after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

/**
 * Format articles for display in clinical context.
 */
export function formatArticlesForDisplay(
  articles: ScientificArticle[]
): Array<{
  citation: string;
  url: string;
  excerpt: string | null;
  relevance: number;
}> {
  return articles.map((article) => ({
    citation: `${article.authors}. ${article.title}. ${article.journal}. ${article.year}.`,
    url: article.doi ? `https://doi.org/${article.doi}` : article.url,
    excerpt: article.abstractExcerpt,
    relevance: article.relevanceScore,
  }));
}

export default {
  searchLiterature,
  searchForDiagnoses,
  formatArticlesForDisplay,
};
