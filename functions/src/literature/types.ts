/**
 * Scientific Literature Types
 *
 * Types for PubMed, Europe PMC, and Semantic Scholar API responses.
 */

/**
 * Unified article representation from any source.
 */
export interface ScientificArticle {
  /** Unique identifier (PMID, DOI, or source-specific ID) */
  id: string;
  /** Source API */
  source: 'pubmed' | 'europepmc' | 'semanticscholar';
  /** Article title */
  title: string;
  /** Authors (first author et al. format) */
  authors: string;
  /** Journal name */
  journal: string;
  /** Publication year */
  year: number;
  /** Digital Object Identifier */
  doi: string | null;
  /** PubMed ID */
  pmid: string | null;
  /** Abstract excerpt (first 300 chars) */
  abstractExcerpt: string | null;
  /** Citation count */
  citationCount: number;
  /** Whether it's open access */
  isOpenAccess: boolean;
  /** Direct link to article */
  url: string;
  /** Relevance score (0-100) */
  relevanceScore: number;
}

/**
 * Query parameters for literature search.
 */
export interface LiteratureQuery {
  /** ICD-10 code for the diagnosis */
  icd10Code: string;
  /** Condition name in English */
  conditionName: string;
  /** Related biomarkers */
  biomarkers?: string[];
  /** Medical specialty context */
  specialty?: string;
  /** Maximum articles per source */
  maxPerSource?: number;
}

/**
 * Cache entry for literature results.
 */
export interface LiteratureCacheEntry {
  /** Cache key (ICD-10 + specialty) */
  cacheKey: string;
  /** Cached articles */
  articles: ScientificArticle[];
  /** When this was cached */
  cachedAt: Date;
  /** TTL in days */
  ttlDays: number;
  /** Number of times this cache was hit */
  hitCount: number;
}

/**
 * Result of a literature search operation.
 */
export interface LiteratureSearchResult {
  /** Found articles (deduplicated, ranked) */
  articles: ScientificArticle[];
  /** Whether this came from cache */
  fromCache: boolean;
  /** Search latency in ms */
  latencyMs: number;
  /** Any errors encountered (non-fatal) */
  warnings?: string[];
}

/**
 * PubMed E-utilities ESearch response.
 */
export interface PubMedSearchResponse {
  esearchresult: {
    count: string;
    retmax: string;
    retstart: string;
    idlist: string[];
    errorlist?: {
      phrasesnotfound?: string[];
    };
  };
}

/**
 * PubMed E-utilities ESummary response.
 */
export interface PubMedSummaryResponse {
  result: {
    uids: string[];
    [pmid: string]: PubMedArticleSummary | string[];
  };
}

/**
 * PubMed article summary from ESummary.
 */
export interface PubMedArticleSummary {
  uid: string;
  pubdate: string;
  title: string;
  authors: Array<{ name: string }>;
  source: string;
  elocationid?: string;
  articleids?: Array<{ idtype: string; value: string }>;
  pmcrefcount?: number;
}

/**
 * Europe PMC REST API response.
 */
export interface EuropePMCResponse {
  hitCount: number;
  resultList: {
    result: EuropePMCArticle[];
  };
}

/**
 * Europe PMC article result.
 */
export interface EuropePMCArticle {
  id: string;
  source: string;
  pmid?: string;
  doi?: string;
  title: string;
  authorString: string;
  journalTitle: string;
  pubYear: string;
  abstractText?: string;
  citedByCount: number;
  isOpenAccess: string;
}
