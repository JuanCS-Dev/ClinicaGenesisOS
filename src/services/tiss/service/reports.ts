/**
 * TISS Reports
 *
 * Billing summaries and glosa analysis for TISS operations.
 *
 * @module services/tiss/service/reports
 */

import type {
  StatusGuia,
  TipoGuia,
  ResumoFaturamento,
  AnaliseGlosas,
} from '@/types';
import { getGuiasByDateRange } from './guia-crud';

/**
 * Get billing summary for a period.
 */
export async function getResumoFaturamento(
  clinicId: string,
  inicio: string,
  fim: string
): Promise<ResumoFaturamento> {
  const guias = await getGuiasByDateRange(clinicId, inicio, fim);

  const guiasPorTipo: Record<TipoGuia, number> = {
    consulta: 0,
    sadt: 0,
    internacao: 0,
    honorarios: 0,
    anexo: 0,
  };

  const guiasPorStatus: Record<StatusGuia, number> = {
    rascunho: 0,
    enviada: 0,
    em_analise: 0,
    autorizada: 0,
    glosada_parcial: 0,
    glosada_total: 0,
    paga: 0,
    recurso: 0,
  };

  const porOperadora = new Map<
    string,
    {
      registroANS: string;
      nomeOperadora: string;
      valorFaturado: number;
      valorGlosado: number;
      valorRecebido: number;
      quantidadeGuias: number;
    }
  >();

  let valorTotalFaturado = 0;
  let valorTotalGlosado = 0;
  let valorTotalRecebido = 0;

  guias.forEach((guia) => {
    // Count by type
    guiasPorTipo[guia.tipo]++;

    // Count by status
    guiasPorStatus[guia.status]++;

    // Sum values
    valorTotalFaturado += guia.valorTotal;
    valorTotalGlosado += guia.valorGlosado || 0;
    valorTotalRecebido += guia.valorPago || 0;

    // Group by operadora
    const operadoraKey = guia.registroANS;
    const existing = porOperadora.get(operadoraKey) || {
      registroANS: guia.registroANS,
      nomeOperadora: guia.nomeOperadora,
      valorFaturado: 0,
      valorGlosado: 0,
      valorRecebido: 0,
      quantidadeGuias: 0,
    };
    existing.valorFaturado += guia.valorTotal;
    existing.valorGlosado += guia.valorGlosado || 0;
    existing.valorRecebido += guia.valorPago || 0;
    existing.quantidadeGuias++;
    porOperadora.set(operadoraKey, existing);
  });

  return {
    periodo: { inicio, fim },
    totalGuias: guias.length,
    guiasPorTipo,
    guiasPorStatus,
    valorTotalFaturado,
    valorTotalGlosado,
    valorTotalRecebido,
    taxaGlosa:
      valorTotalFaturado > 0
        ? (valorTotalGlosado / valorTotalFaturado) * 100
        : 0,
    porOperadora: Array.from(porOperadora.values()),
  };
}

/**
 * Get glosa analysis for a period.
 */
export async function getAnaliseGlosas(
  clinicId: string,
  inicio: string,
  fim: string
): Promise<AnaliseGlosas> {
  const guias = await getGuiasByDateRange(clinicId, inicio, fim);

  const glosasFlat = guias.flatMap((g) => g.glosas || []);

  const porMotivo = new Map<
    string,
    {
      motivo: string;
      descricao: string;
      quantidade: number;
      valor: number;
    }
  >();

  const porOperadora = new Map<
    string,
    {
      registroANS: string;
      nomeOperadora: string;
      quantidade: number;
      valor: number;
    }
  >();

  let valorTotalGlosado = 0;
  let valorRecuperado = 0;

  glosasFlat.forEach((glosa) => {
    valorTotalGlosado += glosa.valorGlosado;

    // Check for recovered value from recursos
    if (glosa.status === 'resolvida') {
      valorRecuperado +=
        glosa.valorAprovado - (glosa.valorOriginal - glosa.valorGlosado);
    }

    // Group by motivo
    glosa.itensGlosados.forEach((item) => {
      const existing = porMotivo.get(item.codigoGlosa) || {
        motivo: item.codigoGlosa,
        descricao: item.descricaoGlosa,
        quantidade: 0,
        valor: 0,
      };
      existing.quantidade++;
      existing.valor += item.valorGlosado;
      porMotivo.set(item.codigoGlosa, existing);
    });
  });

  // Group by operadora from guias that have glosas
  guias
    .filter((g) => g.glosas && g.glosas.length > 0)
    .forEach((guia) => {
      const existing = porOperadora.get(guia.registroANS) || {
        registroANS: guia.registroANS,
        nomeOperadora: guia.nomeOperadora,
        quantidade: 0,
        valor: 0,
      };
      existing.quantidade += guia.glosas?.length || 0;
      existing.valor += guia.valorGlosado || 0;
      porOperadora.set(guia.registroANS, existing);
    });

  const totalPorMotivo = Array.from(porMotivo.values());
  const totalValorMotivos = totalPorMotivo.reduce((sum, m) => sum + m.valor, 0);

  return {
    periodo: { inicio, fim },
    totalGlosas: glosasFlat.length,
    valorTotalGlosado,
    valorRecuperado,
    taxaRecuperacao:
      valorTotalGlosado > 0 ? (valorRecuperado / valorTotalGlosado) * 100 : 0,
    porMotivo: totalPorMotivo.map((m) => ({
      ...m,
      motivo: m.motivo as
        | 'A1'
        | 'A2'
        | 'A3'
        | 'A4'
        | 'A5'
        | 'A6'
        | 'A7'
        | 'A8'
        | 'A9'
        | 'A10'
        | 'B1'
        | 'B2'
        | 'C1'
        | 'outros',
      percentual: totalValorMotivos > 0 ? (m.valor / totalValorMotivos) * 100 : 0,
    })),
    porOperadora: Array.from(porOperadora.values()),
  };
}
