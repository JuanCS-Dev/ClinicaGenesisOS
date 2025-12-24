/**
 * TUSS Lookup Service
 *
 * Quick lookup maps and getter functions for TUSS codes.
 *
 * @module services/tiss/tuss/lookup
 */

import type { CodigoTUSS } from '@/types';
import {
  CONSULTAS,
  CONSULTAS_ESPECIALIDADES,
  EXAMES_LABORATORIAIS,
  EXAMES_IMAGEM,
  PROCEDIMENTOS,
} from './data';

/**
 * Complete TUSS codes database
 */
export const TUSS_CODES: CodigoTUSS[] = [
  ...CONSULTAS,
  ...CONSULTAS_ESPECIALIDADES,
  ...EXAMES_LABORATORIAIS,
  ...EXAMES_IMAGEM,
  ...PROCEDIMENTOS,
];

/**
 * Quick lookup map by code
 */
export const TUSS_BY_CODE = new Map<string, CodigoTUSS>(
  TUSS_CODES.map((code) => [code.codigo, code])
);

/**
 * Quick lookup map by group
 */
const TUSS_BY_GROUP = new Map<string, CodigoTUSS[]>();
TUSS_CODES.forEach((code) => {
  const existing = TUSS_BY_GROUP.get(code.grupo) || [];
  existing.push(code);
  TUSS_BY_GROUP.set(code.grupo, existing);
});

/**
 * Get a TUSS code by its exact code.
 *
 * @param codigo - The 8-digit TUSS code
 * @returns The TUSS code or null if not found
 */
export function getTussCodeByCode(codigo: string): CodigoTUSS | null {
  return TUSS_BY_CODE.get(codigo) || null;
}

/**
 * Get all TUSS codes in a specific group.
 *
 * @param grupo - Group name
 * @returns Array of TUSS codes in the group
 */
export function getTussCodesByGroup(grupo: string): CodigoTUSS[] {
  return TUSS_BY_GROUP.get(grupo) || [];
}

/**
 * Get all available groups.
 *
 * @returns Array of group names
 */
export function getTussGroups(): string[] {
  return Array.from(TUSS_BY_GROUP.keys()).sort();
}

/**
 * Get common consultation codes for quick selection.
 */
export function getConsultaCodes(): CodigoTUSS[] {
  return CONSULTAS.filter((c) => c.ativo);
}

/**
 * Get common exam codes for quick selection.
 */
export function getExamCodes(): CodigoTUSS[] {
  return [...EXAMES_LABORATORIAIS, ...EXAMES_IMAGEM].filter((c) => c.ativo);
}

/**
 * Get total number of TUSS codes in the database.
 */
export function getTussCodeCount(): number {
  return TUSS_CODES.length;
}
