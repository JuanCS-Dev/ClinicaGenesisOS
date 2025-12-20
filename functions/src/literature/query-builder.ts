/**
 * Query Builder for Literature Search
 *
 * Transforms ICD-10 codes, condition names, and biomarkers
 * into optimized search queries for PubMed and Europe PMC.
 */

import type { LiteratureQuery } from './types.js';

/**
 * ICD-10 to condition name mapping for common conditions.
 * Used to enhance search queries when only ICD-10 is provided.
 */
const ICD10_MAPPING: Record<string, string> = {
  // Metabolic
  'E11': 'Diabetes Mellitus Type 2',
  'E11.9': 'Diabetes Mellitus Type 2',
  'E10': 'Diabetes Mellitus Type 1',
  'E10.9': 'Diabetes Mellitus Type 1',
  'E78.0': 'Hypercholesterolemia',
  'E78.1': 'Hypertriglyceridemia',
  'E78.2': 'Mixed Hyperlipidemia',
  'E88.8': 'Metabolic Syndrome',
  'E88.81': 'Metabolic Syndrome',

  // Thyroid
  'E03': 'Hypothyroidism',
  'E03.9': 'Hypothyroidism',
  'E05': 'Hyperthyroidism',
  'E05.9': 'Hyperthyroidism',
  'E06.3': 'Hashimoto Thyroiditis',

  // Hematologic
  'D50': 'Iron Deficiency Anemia',
  'D50.9': 'Iron Deficiency Anemia',
  'D51': 'Vitamin B12 Deficiency Anemia',
  'D52': 'Folate Deficiency Anemia',
  'D64.9': 'Anemia Unspecified',

  // Kidney
  'N18': 'Chronic Kidney Disease',
  'N18.3': 'Chronic Kidney Disease Stage 3',
  'N18.4': 'Chronic Kidney Disease Stage 4',
  'N18.5': 'Chronic Kidney Disease Stage 5',

  // Liver
  'K76.0': 'Fatty Liver Disease',
  'K75.81': 'Nonalcoholic Steatohepatitis',
  'K74': 'Hepatic Fibrosis',

  // Inflammatory
  'M06.9': 'Rheumatoid Arthritis',
  'M32': 'Systemic Lupus Erythematosus',
  'K50': 'Crohn Disease',
  'K51': 'Ulcerative Colitis',

  // Cardiovascular
  'I10': 'Essential Hypertension',
  'I25': 'Coronary Artery Disease',
  'I50': 'Heart Failure',
  'I48': 'Atrial Fibrillation',
};

/**
 * Biomarker to clinical context mapping.
 * Helps build more specific queries.
 */
const BIOMARKER_CONTEXT: Record<string, string> = {
  HbA1c: 'glycemic control',
  glucose: 'blood glucose',
  TSH: 'thyroid function',
  T4: 'thyroid hormone',
  T3: 'thyroid hormone',
  ferritin: 'iron status',
  transferrin: 'iron metabolism',
  creatinine: 'kidney function',
  eGFR: 'glomerular filtration',
  ALT: 'liver enzymes',
  AST: 'liver enzymes',
  GGT: 'hepatobiliary',
  LDL: 'lipid profile',
  HDL: 'lipid profile',
  triglycerides: 'lipid metabolism',
  CRP: 'inflammation',
  ESR: 'inflammation',
  hemoglobin: 'anemia',
  MCV: 'red blood cell indices',
};

/**
 * Build optimized search query for PubMed.
 * Uses MeSH terms and field tags for precision.
 */
export function buildPubMedQuery(params: LiteratureQuery): string {
  const parts: string[] = [];

  // Get English condition name from ICD-10 mapping (prefer mapping over provided name)
  const conditionName = ICD10_MAPPING[params.icd10Code] ||
    ICD10_MAPPING[params.icd10Code.split('.')[0]] ||
    params.conditionName || '';

  if (conditionName) {
    // Use MeSH term if possible
    parts.push(`("${conditionName}"[MeSH Terms] OR "${conditionName}"[Title/Abstract])`);
  }

  // Add biomarkers context
  if (params.biomarkers && params.biomarkers.length > 0) {
    const biomarkerTerms = params.biomarkers
      .slice(0, 3) // Limit to top 3 biomarkers
      .map((b) => {
        const context = BIOMARKER_CONTEXT[b];
        return context ? `"${context}"[Title/Abstract]` : `"${b}"[Title/Abstract]`;
      });

    if (biomarkerTerms.length > 0) {
      parts.push(`(${biomarkerTerms.join(' OR ')})`);
    }
  }

  // Add diagnostic criteria focus
  parts.push('(diagnosis OR "diagnostic criteria")');

  // Filter: recent only (other filters can cause issues)
  const filters = [
    '("last 10 years"[dp])', // Publication date last 10 years
  ];

  const query = [...parts, ...filters].join(' AND ');
  return query;
}

/**
 * Build optimized search query for Europe PMC.
 * Simpler syntax than PubMed.
 */
export function buildEuropePMCQuery(params: LiteratureQuery): string {
  const parts: string[] = [];

  // Get English condition name from ICD-10 mapping (prefer mapping over provided name)
  const conditionName = ICD10_MAPPING[params.icd10Code] ||
    ICD10_MAPPING[params.icd10Code.split('.')[0]] ||
    params.conditionName || '';

  if (conditionName) {
    parts.push(`"${conditionName}"`);
  }

  // Add biomarkers
  if (params.biomarkers && params.biomarkers.length > 0) {
    const biomarkerTerms = params.biomarkers
      .slice(0, 2)
      .map((b) => BIOMARKER_CONTEXT[b] || b);
    parts.push(`(${biomarkerTerms.join(' OR ')})`);
  }

  // Add diagnostic focus
  parts.push('(diagnosis OR "diagnostic criteria")');

  // Filters
  const filters = [
    'PUB_YEAR:[2015 TO 2025]',
    'LANG:eng',
    'SRC:MED', // Only PubMed/MEDLINE sources
  ];

  return [...parts, ...filters].join(' AND ');
}

/**
 * Get condition name from ICD-10 code.
 */
export function getConditionFromICD10(icd10Code: string): string | null {
  // Try exact match first
  if (ICD10_MAPPING[icd10Code]) {
    return ICD10_MAPPING[icd10Code];
  }

  // Try prefix match (e.g., E11.65 → E11)
  const prefix = icd10Code.split('.')[0];
  if (ICD10_MAPPING[prefix]) {
    return ICD10_MAPPING[prefix];
  }

  return null;
}

/**
 * Generate cache key for literature results.
 */
export function generateCacheKey(params: LiteratureQuery): string {
  const parts = [
    params.icd10Code.toUpperCase(),
    params.specialty?.toLowerCase() || 'general',
  ];
  return parts.join('_');
}

export default {
  buildPubMedQuery,
  buildEuropePMCQuery,
  getConditionFromICD10,
  generateCacheKey,
};
