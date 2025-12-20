/**
 * Simple Literature Search
 *
 * Uses Europe PMC only - simpler, JSON, one call.
 * Less is more.
 *
 * @see https://europepmc.org/RestfulWebService
 */

/** ICD-10 to English condition name */
const CONDITIONS: Record<string, string> = {
  'E11': 'type 2 diabetes',
  'E10': 'type 1 diabetes',
  'E03': 'hypothyroidism',
  'E05': 'hyperthyroidism',
  'E78': 'dyslipidemia',
  'E88': 'metabolic syndrome',
  'D50': 'iron deficiency anemia',
  'N18': 'chronic kidney disease',
  'I10': 'hypertension',
  'I25': 'coronary artery disease',
};

/** Article from Europe PMC */
export interface Article {
  title: string;
  authors: string;
  journal: string;
  year: number;
  doi: string | null;
  url: string;
  citations: number;
}

/**
 * Search for articles by ICD-10 code.
 * Returns top 2-4 relevant articles.
 */
export async function searchByICD10(icd10: string): Promise<Article[]> {
  // Get condition name from ICD-10
  const prefix = icd10.split('.')[0];
  const condition = CONDITIONS[icd10] || CONDITIONS[prefix];

  if (!condition) {
    console.log(`[Literature] No mapping for ${icd10}`);
    return [];
  }

  return searchEuropePMC(condition);
}

/**
 * Search Europe PMC - simple and direct.
 */
async function searchEuropePMC(term: string): Promise<Article[]> {
  // Use quotes for exact phrase + add clinical terms
  const query = encodeURIComponent(`"${term}" AND (diagnosis OR treatment OR management OR guidelines)`);
  const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${query}&format=json&pageSize=5&sort=CITED%20desc`;

  console.log(`[Literature] Searching: ${term}`);

  try {
    const res = await fetch(url);
    if (!res.ok) return [];

    const data = await res.json();
    const results = data.resultList?.result || [];

    return results.slice(0, 4).map((r: {
      title?: string;
      authorString?: string;
      journalTitle?: string;
      pubYear?: string;
      doi?: string;
      pmid?: string;
      citedByCount?: number;
    }) => ({
      title: r.title || 'Untitled',
      authors: formatAuthors(r.authorString),
      journal: r.journalTitle || 'Unknown',
      year: parseInt(r.pubYear || '2020', 10),
      doi: r.doi || null,
      url: r.doi ? `https://doi.org/${r.doi}` : `https://pubmed.ncbi.nlm.nih.gov/${r.pmid}/`,
      citations: r.citedByCount || 0,
    }));
  } catch (err) {
    console.error('[Literature] Error:', err);
    return [];
  }
}

/** Format authors to "First et al." */
function formatAuthors(str?: string): string {
  if (!str) return 'Unknown';
  const parts = str.split(',');
  return parts.length > 2 ? `${parts[0].trim()} et al.` : str;
}

export default { searchByICD10 };
