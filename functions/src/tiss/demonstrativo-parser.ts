/**
 * Demonstrativo Parser Module
 *
 * Parses demonstrativo de análise XML responses from health insurance
 * operators (operadoras). Handles TISS standard XML format parsing.
 *
 * @module functions/tiss/demonstrativo-parser
 */

// =============================================================================
// TYPES
// =============================================================================

/**
 * Item glosado (rejected item) structure.
 */
export interface ItemGlosado {
  sequencialItem: number;
  codigoProcedimento: string;
  descricaoProcedimento: string;
  valorGlosado: number;
  codigoGlosa: string;
  descricaoGlosa: string;
}

/**
 * Individual guia result in demonstrativo.
 */
export interface DemonstrativoGuia {
  numeroGuiaPrestador: string;
  numeroGuiaOperadora?: string;
  dataExecucao: string;
  valorInformado: number;
  valorProcessado: number;
  valorGlosado: number;
  status: 'aprovada' | 'glosada_parcial' | 'glosada_total' | 'pendente';
  itensGlosados?: ItemGlosado[];
}

/**
 * Demonstrativo de análise (billing analysis result).
 */
export interface DemonstrativoAnalise {
  numeroLote: string;
  registroANS: string;
  protocolo: string;
  dataProcessamento: string;
  valorInformado: number;
  valorProcessado: number;
  valorGlosado: number;
  guias: DemonstrativoGuia[];
}

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Glosa reason descriptions (TISS standard codes).
 */
export const GLOSA_DESCRIPTIONS: Record<string, string> = {
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
};

// =============================================================================
// XML PARSING HELPERS
// =============================================================================

/**
 * Extract text content from XML element.
 *
 * @param xml - XML string to search
 * @param tagName - Tag name to find (without namespace prefix)
 * @returns Trimmed text content or null if not found
 */
export function getElementText(xml: string, tagName: string): string | null {
  const regex = new RegExp(
    `<(?:ans:|tiss:)?${tagName}>([^<]*)</(?:ans:|tiss:)?${tagName}>`,
    'i'
  );
  const match = xml.match(regex);
  return match ? match[1].trim() : null;
}

/**
 * Extract all occurrences of an element.
 *
 * @param xml - XML string to search
 * @param tagName - Tag name to find
 * @returns Array of inner XML content for each match
 */
export function getAllElements(xml: string, tagName: string): string[] {
  const regex = new RegExp(
    `<(?:ans:|tiss:)?${tagName}[^>]*>([\\s\\S]*?)</(?:ans:|tiss:)?${tagName}>`,
    'gi'
  );
  const matches: string[] = [];
  let match;
  while ((match = regex.exec(xml)) !== null) {
    matches.push(match[1]);
  }
  return matches;
}

/**
 * Parse decimal value from Brazilian format string.
 *
 * @param value - String value (may use comma as decimal separator)
 * @returns Parsed number or 0 if invalid
 */
export function parseDecimal(value: string | null): number {
  if (!value) return 0;
  const cleaned = value.replace(',', '.');
  return parseFloat(cleaned) || 0;
}

// =============================================================================
// ITEM PARSING
// =============================================================================

/**
 * Parse item glosado from XML fragment.
 *
 * @param xml - XML fragment containing item data
 * @param sequencial - Sequential number for the item
 * @returns Parsed ItemGlosado object
 */
export function parseItemGlosado(xml: string, sequencial: number): ItemGlosado {
  const codigoProcedimento = getElementText(xml, 'codigoProcedimento') || '';
  const descricaoProcedimento = getElementText(xml, 'descricaoProcedimento') || '';
  const valorGlosado = parseDecimal(
    getElementText(xml, 'valorGlosa') || getElementText(xml, 'valorGlosado')
  );
  const codigoGlosa = getElementText(xml, 'codigoGlosa') || 'outros';
  const descricaoGlosa =
    getElementText(xml, 'descricaoGlosa') ||
    GLOSA_DESCRIPTIONS[codigoGlosa] ||
    'Motivo não especificado';

  return {
    sequencialItem: sequencial,
    codigoProcedimento,
    descricaoProcedimento,
    valorGlosado,
    codigoGlosa,
    descricaoGlosa,
  };
}

// =============================================================================
// GUIA PARSING
// =============================================================================

/**
 * Parse guia from demonstrativo XML fragment.
 *
 * @param xml - XML fragment containing guia data
 * @returns Parsed DemonstrativoGuia object
 */
export function parseGuiaFromXml(xml: string): DemonstrativoGuia {
  const numeroGuiaPrestador = getElementText(xml, 'numeroGuiaPrestador') || '';
  const numeroGuiaOperadora = getElementText(xml, 'numeroGuiaOperadora') || undefined;
  const dataExecucao =
    getElementText(xml, 'dataExecucao') ||
    getElementText(xml, 'dataAtendimento') ||
    new Date().toISOString().split('T')[0];

  const valorInformado = parseDecimal(
    getElementText(xml, 'valorInformado') || getElementText(xml, 'valorTotal')
  );
  const valorProcessado = parseDecimal(getElementText(xml, 'valorProcessado'));
  const valorGlosado = parseDecimal(
    getElementText(xml, 'valorGlosado') || getElementText(xml, 'valorTotalGlosado')
  );

  // Parse glosa items
  const itensXml = getAllElements(xml, 'itemGlosado');
  const itensGlosados = itensXml.map((itemXml, index) => parseItemGlosado(itemXml, index + 1));

  // Determine status based on values
  let status: DemonstrativoGuia['status'] = 'aprovada';
  if (valorGlosado > 0) {
    status = valorProcessado > 0 ? 'glosada_parcial' : 'glosada_total';
  }

  return {
    numeroGuiaPrestador,
    numeroGuiaOperadora,
    dataExecucao,
    valorInformado,
    valorProcessado,
    valorGlosado,
    status,
    itensGlosados: itensGlosados.length > 0 ? itensGlosados : undefined,
  };
}

// =============================================================================
// DEMONSTRATIVO PARSING
// =============================================================================

/**
 * Parse demonstrativo de análise from XML response.
 *
 * Handles various TISS XML formats including:
 * - guiaRecusada (rejected guides)
 * - guiaProcessada (processed guides)
 * - guia (generic guide element)
 *
 * @param xml - Full XML response from operadora
 * @returns Parsed DemonstrativoAnalise object
 */
export function parseDemonstrativoXml(xml: string): DemonstrativoAnalise {
  const numeroLote = getElementText(xml, 'numeroLote') || '';
  const registroANS = getElementText(xml, 'registroANS') || '';
  const protocolo =
    getElementText(xml, 'numeroProtocolo') || getElementText(xml, 'protocolo') || '';
  const dataProcessamento =
    getElementText(xml, 'dataProcessamento') ||
    getElementText(xml, 'dataRecebimento') ||
    new Date().toISOString().split('T')[0];

  const valorInformado = parseDecimal(
    getElementText(xml, 'valorInformadoTotal') || getElementText(xml, 'valorTotalInformado')
  );
  const valorProcessado = parseDecimal(
    getElementText(xml, 'valorProcessadoTotal') || getElementText(xml, 'valorTotalProcessado')
  );
  const valorGlosado = parseDecimal(
    getElementText(xml, 'valorGlosadoTotal') || getElementText(xml, 'valorTotalGlosado')
  );

  // Parse all guias from different possible element names
  const guiasXml = getAllElements(xml, 'guiaRecusada');
  const guiasProcessadasXml = getAllElements(xml, 'guiaProcessada');
  const guiasDemonstrativoXml = getAllElements(xml, 'guia');

  const allGuiasXml = [...guiasXml, ...guiasProcessadasXml, ...guiasDemonstrativoXml];
  const guias = allGuiasXml.map(parseGuiaFromXml);

  return {
    numeroLote,
    registroANS,
    protocolo,
    dataProcessamento,
    valorInformado,
    valorProcessado,
    valorGlosado,
    guias,
  };
}

/**
 * Calculate appeal deadline (30 days from processing).
 *
 * @param dataProcessamento - Processing date in ISO format
 * @returns Deadline date in ISO format (YYYY-MM-DD)
 */
export function calculatePrazoRecurso(dataProcessamento: string): string {
  const date = new Date(dataProcessamento);
  date.setDate(date.getDate() + 30);
  return date.toISOString().split('T')[0];
}
