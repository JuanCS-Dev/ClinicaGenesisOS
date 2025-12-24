/**
 * TISS XML SADT Calculator
 *
 * Calculation functions for GuiaSADT totals.
 *
 * @module services/tiss/xml-sadt/calculator
 */

import type { GuiaSADT, ProcedimentoRealizado } from '@/types';

/**
 * Calculate totals for a SADT guide based on procedures.
 */
export function calculateSADTTotals(
  procedimentos: ProcedimentoRealizado[]
): Pick<GuiaSADT, 'valorTotalProcedimentos' | 'valorTotalGeral'> {
  const valorTotalProcedimentos = procedimentos.reduce((sum, proc) => {
    return sum + proc.valorTotal;
  }, 0);

  return {
    valorTotalProcedimentos,
    valorTotalGeral: valorTotalProcedimentos,
  };
}
