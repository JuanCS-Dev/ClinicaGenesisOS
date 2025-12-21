/**
 * Glosa Parser
 *
 * Parses glosa (denial/rejection) responses from health insurance operators.
 * These come as XML responses following the TISS standard.
 */

import type { Glosa, ItemGlosado, MotivoGlosa, TipoGuia } from '@/types';

// =============================================================================
// GLOSA REASON DESCRIPTIONS
// =============================================================================

/**
 * Standard glosa reason codes and their descriptions.
 */
const GLOSA_DESCRIPTIONS: Record<MotivoGlosa, string> = {
  A1: 'Guia não preenchida corretamente',
  A2: 'Procedimento não coberto pelo plano',
  A3: 'Procedimento já realizado no período',
  A4: 'Beneficiário sem cobertura ativa',
  A5: 'Carência não cumprida',
  A6: 'Cobrança em duplicidade',
  A7: 'Valor acima do contratado',
  A8: 'Ausência de autorização prévia',
  A9: 'Documentação incompleta',
  A10: 'Prazo de envio excedido',
  B1: 'CID incompatível com procedimento',
  B2: 'Quantidade acima do permitido',
  C1: 'Profissional não cadastrado na operadora',
  outros: 'Outro motivo',
};

/**
 * Glosa recovery recommendations per reason.
 */
const GLOSA_RECOMMENDATIONS: Record<MotivoGlosa, string> = {
  A1: 'Revise o preenchimento da guia e reenvie com os dados corretos',
  A2: 'Verifique a cobertura do plano ou solicite autorização especial',
  A3: 'Apresente justificativa médica para repetição do procedimento',
  A4: 'Confirme a situação do beneficiário com a operadora',
  A5: 'Aguarde o período de carência ou solicite exceção',
  A6: 'Identifique e cancele a cobrança duplicada',
  A7: 'Verifique a tabela de preços contratada',
  A8: 'Solicite autorização retroativa com justificativa de urgência',
  A9: 'Anexe a documentação faltante ao recurso',
  A10: 'Solicite exceção de prazo com justificativa',
  B1: 'Revise a indicação clínica e o CID informado',
  B2: 'Justifique a necessidade da quantidade realizada',
  C1: 'Regularize o cadastro do profissional na operadora',
  outros: 'Entre em contato com a operadora para esclarecimentos',
};

// =============================================================================
// XML PARSING HELPERS
// =============================================================================

/**
 * Extract text content from an XML element.
 */
function getElementText(xml: string, tagName: string): string | null {
  const regex = new RegExp(`<(?:ans:)?${tagName}>([^<]*)</(?:ans:)?${tagName}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : null;
}

/**
 * Extract all occurrences of an element.
 */
function getAllElements(xml: string, tagName: string): string[] {
  const regex = new RegExp(`<(?:ans:)?${tagName}[^>]*>([\\s\\S]*?)</(?:ans:)?${tagName}>`, 'gi');
  const matches: string[] = [];
  let match;
  while ((match = regex.exec(xml)) !== null) {
    matches.push(match[1]);
  }
  return matches;
}

/**
 * Parse a decimal value from string.
 */
function parseDecimal(value: string | null): number {
  if (!value) return 0;
  const cleaned = value.replace(',', '.');
  return parseFloat(cleaned) || 0;
}

/**
 * Parse date from TISS format (YYYY-MM-DD).
 */
function parseDate(value: string | null): string {
  if (!value) return new Date().toISOString().split('T')[0];
  // Already in correct format
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  // Try parsing other formats
  const date = new Date(value);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }
  return new Date().toISOString().split('T')[0];
}

// =============================================================================
// GLOSA PARSING
// =============================================================================

/**
 * Parse a single glosa item from XML.
 */
function parseItemGlosado(xml: string, sequencial: number): ItemGlosado {
  const codigoProcedimento = getElementText(xml, 'codigoProcedimento') || '';
  const descricaoProcedimento = getElementText(xml, 'descricaoProcedimento') || '';
  const valorGlosado = parseDecimal(getElementText(xml, 'valorGlosa') || getElementText(xml, 'valorGlosado'));
  const codigoGlosa = (getElementText(xml, 'codigoGlosa') || 'outros') as MotivoGlosa;
  const descricaoGlosa = getElementText(xml, 'descricaoGlosa') || GLOSA_DESCRIPTIONS[codigoGlosa] || 'Motivo não especificado';

  return {
    sequencialItem: sequencial,
    codigoProcedimento,
    descricaoProcedimento,
    valorGlosado,
    codigoGlosa,
    descricaoGlosa,
  };
}

/**
 * Detect guide type from XML.
 */
function detectTipoGuia(xml: string): TipoGuia {
  if (xml.includes('guiaConsulta') || xml.includes('guiaDeConsulta')) {
    return 'consulta';
  }
  if (xml.includes('guiaSP-SADT') || xml.includes('guiaSADT')) {
    return 'sadt';
  }
  if (xml.includes('guiaInternacao')) {
    return 'internacao';
  }
  if (xml.includes('guiaHonorarios')) {
    return 'honorarios';
  }
  return 'anexo';
}

/**
 * Parse glosa XML response from operator.
 *
 * @param xml - The XML string received from the operator
 * @returns Parsed Glosa object
 */
export function parseGlosaXml(xml: string): Omit<Glosa, 'id' | 'createdAt' | 'updatedAt'> {
  // Extract guide number
  const numeroGuiaPrestador = getElementText(xml, 'numeroGuiaPrestador') || '';

  // Detect guide type
  const tipoGuia = detectTipoGuia(xml);

  // Get date
  const dataRecebimento = parseDate(
    getElementText(xml, 'dataRecebimento') ||
    getElementText(xml, 'dataProcessamento')
  );

  // Get values
  const valorOriginal = parseDecimal(getElementText(xml, 'valorInformado') || getElementText(xml, 'valorTotal'));
  const valorGlosado = parseDecimal(getElementText(xml, 'valorGlosado') || getElementText(xml, 'valorTotalGlosado'));
  const valorAprovado = valorOriginal - valorGlosado;

  // Parse glosa items
  const itensXml = getAllElements(xml, 'itemGlosado');
  const itensGlosados: ItemGlosado[] = itensXml.map((itemXml, index) =>
    parseItemGlosado(itemXml, index + 1)
  );

  // If no items found, try to create one from the main glosa
  if (itensGlosados.length === 0 && valorGlosado > 0) {
    const codigoGlosa = (getElementText(xml, 'codigoGlosa') || 'outros') as MotivoGlosa;
    itensGlosados.push({
      sequencialItem: 1,
      codigoProcedimento: getElementText(xml, 'codigoProcedimento') || '',
      descricaoProcedimento: getElementText(xml, 'descricaoProcedimento') || 'Procedimento glosado',
      valorGlosado,
      codigoGlosa,
      descricaoGlosa: GLOSA_DESCRIPTIONS[codigoGlosa] || 'Motivo não especificado',
    });
  }

  // Calculate deadline for appeal (typically 30 days)
  const prazoRecursoDate = new Date(dataRecebimento);
  prazoRecursoDate.setDate(prazoRecursoDate.getDate() + 30);
  const prazoRecurso = prazoRecursoDate.toISOString().split('T')[0];

  // Get operator observation
  const observacaoOperadora = getElementText(xml, 'observacao') || undefined;

  return {
    numeroGuiaPrestador,
    tipoGuia,
    dataRecebimento,
    valorOriginal,
    valorGlosado,
    valorAprovado,
    itensGlosados,
    prazoRecurso,
    status: 'pendente',
    observacaoOperadora,
  };
}

/**
 * Parse simplified glosa response (JSON or structured data).
 * Useful for manual entry or API responses.
 */
export function parseGlosaResponse(data: {
  numeroGuiaPrestador: string;
  tipoGuia?: TipoGuia;
  valorOriginal: number;
  valorGlosado: number;
  itens?: Array<{
    codigoProcedimento: string;
    descricao?: string;
    valor: number;
    motivo: MotivoGlosa;
  }>;
  observacao?: string;
}): Omit<Glosa, 'id' | 'createdAt' | 'updatedAt'> {
  const today = new Date().toISOString().split('T')[0];
  const prazoRecursoDate = new Date();
  prazoRecursoDate.setDate(prazoRecursoDate.getDate() + 30);

  const itensGlosados: ItemGlosado[] = (data.itens || []).map((item, index) => ({
    sequencialItem: index + 1,
    codigoProcedimento: item.codigoProcedimento,
    descricaoProcedimento: item.descricao || '',
    valorGlosado: item.valor,
    codigoGlosa: item.motivo,
    descricaoGlosa: GLOSA_DESCRIPTIONS[item.motivo] || 'Motivo não especificado',
  }));

  // If no items, create one generic
  if (itensGlosados.length === 0 && data.valorGlosado > 0) {
    itensGlosados.push({
      sequencialItem: 1,
      codigoProcedimento: '',
      descricaoProcedimento: 'Valor glosado',
      valorGlosado: data.valorGlosado,
      codigoGlosa: 'outros',
      descricaoGlosa: 'Motivo não especificado',
    });
  }

  return {
    numeroGuiaPrestador: data.numeroGuiaPrestador,
    tipoGuia: data.tipoGuia || 'consulta',
    dataRecebimento: today,
    valorOriginal: data.valorOriginal,
    valorGlosado: data.valorGlosado,
    valorAprovado: data.valorOriginal - data.valorGlosado,
    itensGlosados,
    prazoRecurso: prazoRecursoDate.toISOString().split('T')[0],
    status: 'pendente',
    observacaoOperadora: data.observacao,
  };
}

/**
 * Get human-readable description for a glosa reason code.
 */
export function getGlosaDescription(codigo: MotivoGlosa): {
  description: string;
  recommendation: string;
} {
  return {
    description: GLOSA_DESCRIPTIONS[codigo] || 'Motivo não catalogado',
    recommendation: GLOSA_RECOMMENDATIONS[codigo] || 'Entre em contato com a operadora',
  };
}

/**
 * Calculate glosa statistics from a list of glosas.
 */
export function calculateGlosaStats(glosas: Glosa[]): {
  totalGlosas: number;
  valorTotal: number;
  valorRecuperado: number;
  taxaRecuperacao: number;
  principaisMotivos: Array<{ motivo: MotivoGlosa; quantidade: number; valor: number }>;
} {
  const motivoMap = new Map<MotivoGlosa, { quantidade: number; valor: number }>();

  let valorTotal = 0;
  let valorRecuperado = 0;

  glosas.forEach((glosa) => {
    valorTotal += glosa.valorGlosado;

    if (glosa.status === 'resolvida') {
      valorRecuperado += glosa.valorAprovado;
    }

    glosa.itensGlosados.forEach((item) => {
      const existing = motivoMap.get(item.codigoGlosa) || { quantidade: 0, valor: 0 };
      existing.quantidade++;
      existing.valor += item.valorGlosado;
      motivoMap.set(item.codigoGlosa, existing);
    });
  });

  const principaisMotivos = Array.from(motivoMap.entries())
    .map(([motivo, stats]) => ({ motivo, ...stats }))
    .sort((a, b) => b.valor - a.valor);

  return {
    totalGlosas: glosas.length,
    valorTotal,
    valorRecuperado,
    taxaRecuperacao: valorTotal > 0 ? (valorRecuperado / valorTotal) * 100 : 0,
    principaisMotivos,
  };
}

/**
 * Check if a glosa is still within appeal deadline.
 */
export function isWithinAppealDeadline(glosa: Glosa): boolean {
  const today = new Date();
  const deadline = new Date(glosa.prazoRecurso);
  return today <= deadline;
}

/**
 * Get days remaining for glosa appeal.
 */
export function getDaysToAppealDeadline(glosa: Glosa): number {
  const today = new Date();
  const deadline = new Date(glosa.prazoRecurso);
  const diffTime = deadline.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
