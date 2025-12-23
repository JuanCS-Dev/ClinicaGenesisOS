/**
 * TISS Reports - Padrão TISS 4.02.00
 * Reporting and analytics interfaces
 */

import type { MotivoGlosa, StatusGuia, TipoGuia } from './enums';

/**
 * Resumo de faturamento por período
 */
export interface ResumoFaturamento {
  periodo: {
    inicio: string;
    fim: string;
  };
  totalGuias: number;
  guiasPorTipo: Record<TipoGuia, number>;
  guiasPorStatus: Record<StatusGuia, number>;
  valorTotalFaturado: number;
  valorTotalGlosado: number;
  valorTotalRecebido: number;
  taxaGlosa: number;
  porOperadora: Array<{
    registroANS: string;
    nomeOperadora: string;
    valorFaturado: number;
    valorGlosado: number;
    valorRecebido: number;
    quantidadeGuias: number;
  }>;
}

/**
 * Análise de glosas
 */
export interface AnaliseGlosas {
  periodo: {
    inicio: string;
    fim: string;
  };
  totalGlosas: number;
  valorTotalGlosado: number;
  valorRecuperado: number;
  taxaRecuperacao: number;
  porMotivo: Array<{
    motivo: MotivoGlosa;
    descricao: string;
    quantidade: number;
    valor: number;
    percentual: number;
  }>;
  porOperadora: Array<{
    registroANS: string;
    nomeOperadora: string;
    quantidade: number;
    valor: number;
  }>;
}
