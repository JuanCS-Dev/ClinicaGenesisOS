/**
 * PubMed E-utilities Client
 *
 * Searches PubMed via NCBI E-utilities API.
 * Rate limit: 3 req/s without key, 10 req/s with key.
 *
 * @see https://www.ncbi.nlm.nih.gov/books/NBK25497/
 */

import type {
  ScientificArticle,
  PubMedSearchResponse,
  PubMedSummaryResponse,
  PubMedArticleSummary,
} from './types.js';

const PUBMED_BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const TOOL_NAME = 'ClinicaGenesisOS';
const CONTACT_EMAIL = 'dev@clinicagenesis.com';

/**
 * Search PubMed for articles matching a query.
 *
 * @param query - Search query string
 * @param maxResults - Maximum results to return (default 5)
 * @returns Array of scientific articles
 */
export async function searchPubMed(
  query: string,
  maxResults = 5
): Promise<ScientificArticle[]> {
  try {
    // Step 1: ESearch to get PMIDs
    const pmids = await esearch(query, maxResults);
    if (pmids.length === 0) {
      return [];
    }

    // Step 2: ESummary to get article details
    const articles = await esummary(pmids);
    return articles;
  } catch (error) {
    console.error('[PubMed] Search error:', error);
    return [];
  }
}

/**
 * ESearch: Search PubMed and return PMIDs.
 */
async function esearch(query: string, maxResults: number): Promise<string[]> {
  const params = new URLSearchParams({
    db: 'pubmed',
    term: query,
    retmax: String(maxResults),
    retmode: 'json',
    sort: 'relevance',
    tool: TOOL_NAME,
    email: CONTACT_EMAIL,
  });

  const url = `${PUBMED_BASE_URL}/esearch.fcgi?${params}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`ESearch failed: ${response.status}`);
  }

  const data = (await response.json()) as PubMedSearchResponse;
  return data.esearchresult?.idlist || [];
}

/**
 * ESummary: Get article details for PMIDs.
 */
async function esummary(pmids: string[]): Promise<ScientificArticle[]> {
  const params = new URLSearchParams({
    db: 'pubmed',
    id: pmids.join(','),
    retmode: 'json',
    tool: TOOL_NAME,
    email: CONTACT_EMAIL,
  });

  const url = `${PUBMED_BASE_URL}/esummary.fcgi?${params}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`ESummary failed: ${response.status}`);
  }

  const data = (await response.json()) as PubMedSummaryResponse;
  const articles: ScientificArticle[] = [];

  for (const pmid of pmids) {
    const article = data.result[pmid];
    if (!article || Array.isArray(article)) continue;

    const parsed = parsePubMedArticle(article);
    if (parsed) {
      articles.push(parsed);
    }
  }

  return articles;
}

/**
 * Parse PubMed article summary into unified format.
 */
function parsePubMedArticle(
  article: PubMedArticleSummary
): ScientificArticle | null {
  try {
    // Extract DOI from articleids
    const doiEntry = article.articleids?.find((id) => id.idtype === 'doi');
    const doi = doiEntry?.value || null;

    // Format authors (first author et al.)
    const authorList = article.authors || [];
    const authors =
      authorList.length > 0
        ? authorList.length > 2
          ? `${authorList[0].name} et al.`
          : authorList.map((a) => a.name).join(', ')
        : 'Unknown';

    // Extract year from pubdate
    const yearMatch = article.pubdate?.match(/\d{4}/);
    const year = yearMatch ? parseInt(yearMatch[0], 10) : new Date().getFullYear();

    return {
      id: article.uid,
      source: 'pubmed',
      title: article.title || 'Untitled',
      authors,
      journal: article.source || 'Unknown Journal',
      year,
      doi,
      pmid: article.uid,
      abstractExcerpt: null, // ESummary doesn't include abstract
      citationCount: article.pmcrefcount || 0,
      isOpenAccess: false, // Would need EFetch to determine
      url: `https://pubmed.ncbi.nlm.nih.gov/${article.uid}/`,
      relevanceScore: 50, // Base score, will be adjusted by ranking
    };
  } catch {
    return null;
  }
}

export default { searchPubMed };
