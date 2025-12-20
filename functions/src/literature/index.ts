/**
 * Literature Module
 *
 * Scientific literature search for diagnostic backing.
 * Searches PubMed and Europe PMC for peer-reviewed articles.
 */

export { searchLiterature, searchForDiagnoses, formatArticlesForDisplay } from './search.js';
export { searchPubMed } from './pubmed-client.js';
export { searchEuropePMC } from './europepmc-client.js';
export { buildPubMedQuery, buildEuropePMCQuery, generateCacheKey, getConditionFromICD10 } from './query-builder.js';
export { getCachedResults, setCachedResults, invalidateCache, getCacheStats } from './cache.js';
export { deduplicateArticles, rankArticles, filterByQuality, processArticles } from './ranking.js';
export type {
  ScientificArticle,
  LiteratureQuery,
  LiteratureCacheEntry,
  LiteratureSearchResult,
} from './types.js';
