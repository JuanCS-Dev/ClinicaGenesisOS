/**
 * Scientific Literature Types
 *
 * Type definitions for scientific references and literature backing.
 *
 * @module ai/types/literature
 */

/**
 * Scientific article reference for diagnostic backing.
 */
export interface ScientificReference {
  /** Article title */
  title: string;
  /** Authors (first author et al.) */
  authors: string;
  /** Journal name */
  journal: string;
  /** Publication year */
  year: number;
  /** DOI or PubMed URL */
  url: string;
  /** Abstract excerpt (first 300 chars) */
  excerpt: string | null;
  /** Relevance score (0-100) */
  relevance: number;
}

/**
 * Literature backing for a diagnosis.
 */
export interface DiagnosisLiterature {
  /** ICD-10 code */
  icd10: string;
  /** Diagnosis name */
  diagnosisName: string;
  /** Supporting articles (minimum 2 for medium/high complexity) */
  articles: ScientificReference[];
  /** Status of literature search */
  status: 'pending' | 'ready' | 'not_available';
  /** Search latency in ms */
  searchLatencyMs?: number;
}
