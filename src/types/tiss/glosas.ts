/**
 * TISS Glosas - Padrão TISS 4.02.00
 * Denial (glosa) interfaces for billing disputes
 */

import type { MotivoGlosa, TipoGuia } from './enums';

/**
 * Item glosado em uma guia
 */
export interface ItemGlosado {
  sequencialItem: number;
  codigoProcedimento: string;
  descricaoProcedimento: string;
  valorGlosado: number;
  codigoGlosa: MotivoGlosa;
  descricaoGlosa: string;
  justificativaRecurso?: string;
  statusRecurso?: 'pendente' | 'aceito' | 'negado';
}

/**
 * Glosa de uma guia
 */
export interface Glosa {
  id: string;
  numeroGuiaPrestador: string;
  tipoGuia: TipoGuia;
  dataRecebimento: string;
  valorOriginal: number;
  valorGlosado: number;
  valorAprovado: number;
  itensGlosados: ItemGlosado[];
  prazoRecurso: string;
  status: 'pendente' | 'em_recurso' | 'resolvida';
  observacaoOperadora?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Recurso de glosa
 */
export interface RecursoGlosa {
  id: string;
  glosaId: string;
  dataEnvio: string;
  itensContestados: Array<{
    sequencialItem: number;
    justificativa: string;
    documentosAnexos?: string[];
  }>;
  valorContestado: number;
  status: 'enviado' | 'em_analise' | 'aceito' | 'negado' | 'aceito_parcial';
  respostaOperadora?: string;
  dataResposta?: string;
  valorRecuperado?: number;
}
