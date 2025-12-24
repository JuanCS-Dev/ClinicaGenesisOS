/**
 * TUSS Search Service
 *
 * Search and filtering functions for TUSS codes.
 *
 * @module services/tiss/tuss/search
 */

import type { CodigoTUSS } from '@/types';
import { TUSS_CODES, TUSS_BY_CODE } from './lookup';

/**
 * Search TUSS codes by description or code.
 *
 * @param query - Search query (code or description)
 * @param limit - Maximum results to return
 * @returns Matching TUSS codes
 */
export function searchTussCodes(query: string, limit = 20): CodigoTUSS[] {
  if (!query || query.length < 2) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();

  // First, check for exact code match
  const exactMatch = TUSS_BY_CODE.get(normalizedQuery);
  if (exactMatch) {
    return [exactMatch];
  }

  // Search by code prefix or description
  const results = TUSS_CODES.filter((code) => {
    if (!code.ativo) return false;

    // Match by code
    if (code.codigo.startsWith(normalizedQuery)) {
      return true;
    }

    // Match by description (case-insensitive)
    if (code.descricao.toLowerCase().includes(normalizedQuery)) {
      return true;
    }

    // Match by group
    if (code.grupo.toLowerCase().includes(normalizedQuery)) {
      return true;
    }

    // Match by subgroup
    if (code.subgrupo?.toLowerCase().includes(normalizedQuery)) {
      return true;
    }

    return false;
  });

  // Sort by relevance (exact code match first, then alphabetically)
  results.sort((a, b) => {
    const aStartsWithCode = a.codigo.startsWith(normalizedQuery);
    const bStartsWithCode = b.codigo.startsWith(normalizedQuery);

    if (aStartsWithCode && !bStartsWithCode) return -1;
    if (!aStartsWithCode && bStartsWithCode) return 1;

    return a.descricao.localeCompare(b.descricao);
  });

  return results.slice(0, limit);
}

/**
 * Validate if a code exists and is active.
 *
 * @param codigo - The TUSS code to validate
 * @returns true if valid and active
 */
export function isValidTussCode(codigo: string): boolean {
  const tuss = TUSS_BY_CODE.get(codigo);
  return tuss !== undefined && tuss.ativo;
}
