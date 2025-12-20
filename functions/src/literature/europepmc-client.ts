/**
 * Europe PMC REST API Client
 *
 * Searches Europe PMC for biomedical literature.
 * 33M+ publications, generous rate limits, JSON response.
 *
 * @see https://europepmc.org/RestfulWebService
 */

import type { ScientificArticle, EuropePMCResponse, EuropePMCArticle } from './types.js';

const EUROPEPMC_BASE_URL = 'https://www.ebi.ac.uk/europepmc/webservices/rest';

/**
 * Search Europe PMC for articles matching a query.
 *
 * @param query - Search query string
 * @param maxResults - Maximum results to return (default 5)
 * @returns Array of scientific articles
 */
export async function searchEuropePMC(
  query: string,
  maxResults = 5
): Promise<ScientificArticle[]> {
  try {
    const params = new URLSearchParams({
      query: query,
      format: 'json',
      pageSize: String(maxResults),
      sort: 'RELEVANCE',
      resultType: 'core', // Include abstract
    });

    const url = `${EUROPEPMC_BASE_URL}/search?${params}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Europe PMC search failed: ${response.status}`);
    }

    const data = (await response.json()) as EuropePMCResponse;
    const articles: ScientificArticle[] = [];

    for (const result of data.resultList?.result || []) {
      const parsed = parseEuropePMCArticle(result);
      if (parsed) {
        articles.push(parsed);
      }
    }

    return articles;
  } catch (error) {
    console.error('[EuropePMC] Search error:', error);
    return [];
  }
}

/**
 * Parse Europe PMC article into unified format.
 */
function parseEuropePMCArticle(article: EuropePMCArticle): ScientificArticle | null {
  try {
    // Format authors (already in "Name A, Name B" format)
    const authorString = article.authorString || 'Unknown';
    const authors = authorString.includes(',')
      ? authorString.split(',').length > 2
        ? `${authorString.split(',')[0].trim()} et al.`
        : authorString
      : authorString;

    // Parse year
    const year = parseInt(article.pubYear, 10) || new Date().getFullYear();

    // Truncate abstract to excerpt
    const abstractExcerpt = article.abstractText
      ? article.abstractText.slice(0, 300) + (article.abstractText.length > 300 ? '...' : '')
      : null;

    // Build URL
    const url = article.pmid
      ? `https://europepmc.org/article/MED/${article.pmid}`
      : article.doi
        ? `https://doi.org/${article.doi}`
        : `https://europepmc.org/article/${article.source}/${article.id}`;

    return {
      id: article.id,
      source: 'europepmc',
      title: article.title || 'Untitled',
      authors,
      journal: article.journalTitle || 'Unknown Journal',
      year,
      doi: article.doi || null,
      pmid: article.pmid || null,
      abstractExcerpt,
      citationCount: article.citedByCount || 0,
      isOpenAccess: article.isOpenAccess === 'Y',
      url,
      relevanceScore: 50, // Base score, will be adjusted by ranking
    };
  } catch {
    return null;
  }
}

export default { searchEuropePMC };
