/**
 * TISS XML Consulta Generator
 *
 * Generates XML for Guia de Consulta conforming to TISS 4.02.00 standard.
 * Reference: ANS Schema tissGuiasV4_02_00.xsd
 */

import type { GuiaConsulta, TissXmlOptions, DadosContratado, DadosProfissional } from '@/types';

// =============================================================================
// CONSTANTS
// =============================================================================

const TISS_VERSION = '4.02.00';
const TISS_NAMESPACE = 'http://www.ans.gov.br/padroes/tiss/schemas';
const XML_DECLARATION = '<?xml version="1.0" encoding="UTF-8"?>';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Escape special XML characters.
 */
function escapeXml(str: string | undefined): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Format date to TISS format (YYYY-MM-DD).
 */
function formatDate(dateStr: string): string {
  // Already in correct format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  // Try parsing and formatting
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date format: ${dateStr}`);
  }
  return date.toISOString().split('T')[0];
}

/**
 * Format currency value to 2 decimal places.
 */
function formatCurrency(value: number): string {
  return value.toFixed(2);
}

/**
 * Pad string to specific length.
 */
function padString(str: string, length: number, char = '0'): string {
  return str.padStart(length, char);
}

/**
 * Generate XML element with optional value.
 */
function xmlElement(tag: string, value: string | number | undefined, indent = ''): string {
  if (value === undefined || value === null || value === '') {
    return '';
  }
  const escapedValue = typeof value === 'string' ? escapeXml(value) : value;
  return `${indent}<ans:${tag}>${escapedValue}</ans:${tag}>\n`;
}

// =============================================================================
// XML BLOCK GENERATORS
// =============================================================================

/**
 * Generate XML for dadosBeneficiario block.
 */
function generateBeneficiarioXml(guia: GuiaConsulta, indent: string): string {
  const { dadosBeneficiario } = guia;
  const i2 = indent + '  ';

  let xml = `${indent}<ans:dadosBeneficiario>\n`;
  xml += xmlElement('numeroCarteira', padString(dadosBeneficiario.numeroCarteira, 17), i2);
  if (dadosBeneficiario.validadeCarteira) {
    xml += xmlElement('validadeCarteira', formatDate(dadosBeneficiario.validadeCarteira), i2);
  }
  xml += xmlElement('nomeBeneficiario', dadosBeneficiario.nomeBeneficiario, i2);
  if (dadosBeneficiario.cns) {
    xml += xmlElement('cns', padString(dadosBeneficiario.cns, 15), i2);
  }
  xml += `${indent}</ans:dadosBeneficiario>\n`;

  return xml;
}

/**
 * Generate XML for contratado block (prestador).
 */
function generateContratadoXml(
  contratado: DadosContratado,
  tagName: string,
  indent: string
): string {
  const i2 = indent + '  ';

  let xml = `${indent}<ans:${tagName}>\n`;
  xml += xmlElement('codigoPrestadorNaOperadora', contratado.codigoPrestadorNaOperadora, i2);
  if (contratado.nomeContratado) {
    xml += xmlElement('nomeContratado', contratado.nomeContratado, i2);
  }
  if (contratado.cnes) {
    xml += xmlElement('CNES', padString(contratado.cnes, 7), i2);
  }
  xml += `${indent}</ans:${tagName}>\n`;

  return xml;
}

/**
 * Generate XML for profissional block.
 */
function generateProfissionalXml(
  profissional: DadosProfissional,
  tagName: string,
  indent: string
): string {
  const i2 = indent + '  ';
  const i3 = i2 + '  ';

  let xml = `${indent}<ans:${tagName}>\n`;
  xml += `${i2}<ans:nomeProfissional>\n`;
  xml += xmlElement('nomeProfissional', profissional.nomeProfissional || '', i3);
  xml += `${i2}</ans:nomeProfissional>\n`;
  xml += xmlElement('conselhoProfissional', profissional.conselhoProfissional, i2);
  xml += xmlElement('numeroConselhoProfissional', profissional.numeroConselhoProfissional, i2);
  xml += xmlElement('UF', profissional.uf, i2);
  if (profissional.cbo) {
    xml += xmlElement('CBOS', profissional.cbo, i2);
  }
  xml += `${indent}</ans:${tagName}>\n`;

  return xml;
}

/**
 * Generate XML for dadosSolicitante block.
 */
function generateSolicitanteXml(guia: GuiaConsulta, indent: string): string {
  const i2 = indent + '  ';

  let xml = `${indent}<ans:dadosSolicitante>\n`;
  xml += generateContratadoXml(guia.contratadoSolicitante, 'contratadoSolicitante', i2);
  xml += generateProfissionalXml(guia.profissionalSolicitante, 'profissionalSolicitante', i2);
  xml += `${indent}</ans:dadosSolicitante>\n`;

  return xml;
}

/**
 * Generate XML for dadosAtendimento block.
 */
function generateAtendimentoXml(guia: GuiaConsulta, indent: string): string {
  const i2 = indent + '  ';

  let xml = `${indent}<ans:dadosAtendimento>\n`;
  xml += xmlElement('tipoConsulta', guia.tipoConsulta, i2);
  if (guia.indicacaoClinica) {
    xml += xmlElement('indicacaoClinica', guia.indicacaoClinica, i2);
  }
  xml += xmlElement('dataAtendimento', formatDate(guia.dataAtendimento), i2);
  xml += xmlElement('codigoTabela', guia.codigoTabela, i2);
  xml += xmlElement('codigoProcedimento', padString(guia.codigoProcedimento, 10), i2);
  xml += xmlElement('valorProcedimento', formatCurrency(guia.valorProcedimento), i2);
  xml += `${indent}</ans:dadosAtendimento>\n`;

  return xml;
}

// =============================================================================
// MAIN GENERATOR
// =============================================================================

/**
 * Generate TISS XML for Guia de Consulta.
 *
 * Generates XML conforming to TISS 4.02.00 standard with proper SHA-1 hash.
 * The hash is calculated over all XML content except the epilogo element.
 *
 * @param guia - Complete GuiaConsulta data
 * @param options - XML generation options
 * @returns Promise resolving to XML string
 */
export async function generateXmlConsulta(guia: GuiaConsulta, options: TissXmlOptions = {}): Promise<string> {
  const {
    includeDeclaration = true,
    prettyPrint = true,
  } = options;

  const indent = prettyPrint ? '  ' : '';
  const i2 = indent + indent;
  const i3 = i2 + indent;
  const newline = prettyPrint ? '\n' : '';

  // Build XML
  let xml = '';

  // XML Declaration
  if (includeDeclaration) {
    xml += XML_DECLARATION + newline;
  }

  // Root element with namespaces
  xml += `<ans:mensagemTISS xmlns:ans="${TISS_NAMESPACE}" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">${newline}`;

  // Cabecalho
  xml += `${indent}<ans:cabecalho>${newline}`;
  xml += `${i2}<ans:identificacaoTransacao>${newline}`;
  xml += xmlElement('tipoTransacao', 'ENVIO_LOTE_GUIAS', i3);
  xml += xmlElement('sequencialTransacao', '1', i3);
  xml += xmlElement('dataRegistroTransacao', formatDate(new Date().toISOString()), i3);
  xml += xmlElement('horaRegistroTransacao', new Date().toTimeString().slice(0, 8), i3);
  xml += `${i2}</ans:identificacaoTransacao>${newline}`;
  xml += `${i2}<ans:origem>${newline}`;
  xml += `${i3}<ans:identificacaoPrestador>${newline}`;
  xml += xmlElement('codigoPrestadorNaOperadora', guia.contratadoSolicitante.codigoPrestadorNaOperadora, i3 + indent);
  xml += `${i3}</ans:identificacaoPrestador>${newline}`;
  xml += `${i2}</ans:origem>${newline}`;
  xml += `${i2}<ans:destino>${newline}`;
  xml += xmlElement('registroANS', padString(guia.registroANS, 6), i3);
  xml += `${i2}</ans:destino>${newline}`;
  xml += xmlElement('versaoPadrao', TISS_VERSION, i2);
  xml += `${indent}</ans:cabecalho>${newline}`;

  // Prestador para Operadora (envio de guias)
  xml += `${indent}<ans:prestadorParaOperadora>${newline}`;
  xml += `${i2}<ans:loteGuias>${newline}`;
  xml += `${i3}<ans:numeroLote>1</ans:numeroLote>${newline}`;
  xml += `${i3}<ans:guiasTISS>${newline}`;

  // Guia de Consulta
  const i4 = i3 + indent;
  const i5 = i4 + indent;

  xml += `${i4}<ans:guiaConsulta>${newline}`;

  // Cabeçalho da guia
  xml += `${i5}<ans:cabecalhoConsulta>${newline}`;
  xml += xmlElement('registroANS', padString(guia.registroANS, 6), i5 + indent);
  xml += xmlElement('numeroGuiaPrestador', guia.numeroGuiaPrestador, i5 + indent);
  if (guia.numeroGuiaOperadora) {
    xml += xmlElement('numeroGuiaOperadora', guia.numeroGuiaOperadora, i5 + indent);
  }
  if (guia.dataAutorizacao) {
    xml += xmlElement('dataAutorizacao', formatDate(guia.dataAutorizacao), i5 + indent);
  }
  if (guia.senha) {
    xml += xmlElement('senha', guia.senha, i5 + indent);
  }
  if (guia.dataValidadeSenha) {
    xml += xmlElement('dataValidadeSenha', formatDate(guia.dataValidadeSenha), i5 + indent);
  }
  xml += `${i5}</ans:cabecalhoConsulta>${newline}`;

  // Dados do beneficiário
  xml += generateBeneficiarioXml(guia, i5);

  // Dados do solicitante
  xml += generateSolicitanteXml(guia, i5);

  // Dados do atendimento
  xml += generateAtendimentoXml(guia, i5);

  // Observação
  if (guia.observacao) {
    xml += xmlElement('observacao', guia.observacao, i5);
  }

  xml += `${i4}</ans:guiaConsulta>${newline}`;
  xml += `${i3}</ans:guiasTISS>${newline}`;
  xml += `${i2}</ans:loteGuias>${newline}`;
  xml += `${indent}</ans:prestadorParaOperadora>${newline}`;

  // Generate SHA-1 hash of XML content (before epilogo)
  // Per TISS spec, hash is calculated over everything except the epilogo itself
  const contentToHash = xml;
  const hash = await generateSHA1Hash(contentToHash);

  xml += `${indent}<ans:epilogo>${newline}`;
  xml += xmlElement('hash', hash, i2);
  xml += `${indent}</ans:epilogo>${newline}`;

  xml += `</ans:mensagemTISS>${newline}`;

  return xml;
}

/**
 * Generate just the guiaConsulta element (without wrapper).
 * Useful for batch processing.
 */
export function generateGuiaConsultaElement(guia: GuiaConsulta, indent = ''): string {
  const i1 = indent;
  const i2 = indent + '  ';

  let xml = `${i1}<ans:guiaConsulta>\n`;

  // Cabeçalho da guia
  xml += `${i2}<ans:cabecalhoConsulta>\n`;
  xml += xmlElement('registroANS', padString(guia.registroANS, 6), i2 + '  ');
  xml += xmlElement('numeroGuiaPrestador', guia.numeroGuiaPrestador, i2 + '  ');
  if (guia.numeroGuiaOperadora) {
    xml += xmlElement('numeroGuiaOperadora', guia.numeroGuiaOperadora, i2 + '  ');
  }
  xml += `${i2}</ans:cabecalhoConsulta>\n`;

  // Dados do beneficiário
  xml += generateBeneficiarioXml(guia, i2);

  // Dados do solicitante
  xml += generateSolicitanteXml(guia, i2);

  // Dados do atendimento
  xml += generateAtendimentoXml(guia, i2);

  // Observação
  if (guia.observacao) {
    xml += xmlElement('observacao', guia.observacao, i2);
  }

  xml += `${i1}</ans:guiaConsulta>\n`;

  return xml;
}

/**
 * Generate SHA-1 hash for TISS XML content.
 *
 * Uses Web Crypto API for proper SHA-1 hash generation
 * as required by ANS TISS 4.02.00 specification.
 *
 * @param content - The XML content to hash (excluding epilogo)
 * @returns SHA-1 hash as uppercase hex string (40 characters)
 */
async function generateSHA1Hash(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

/**
 * Validate required fields for GuiaConsulta.
 */
export function validateGuiaConsulta(guia: Partial<GuiaConsulta>): string[] {
  const errors: string[] = [];

  if (!guia.registroANS || guia.registroANS.length !== 6) {
    errors.push('Registro ANS deve ter 6 dígitos');
  }

  if (!guia.numeroGuiaPrestador) {
    errors.push('Número da guia do prestador é obrigatório');
  }

  if (!guia.dadosBeneficiario?.numeroCarteira) {
    errors.push('Número da carteira do beneficiário é obrigatório');
  }

  if (!guia.dadosBeneficiario?.nomeBeneficiario) {
    errors.push('Nome do beneficiário é obrigatório');
  }

  if (!guia.contratadoSolicitante?.codigoPrestadorNaOperadora) {
    errors.push('Código do prestador na operadora é obrigatório');
  }

  if (!guia.profissionalSolicitante?.conselhoProfissional) {
    errors.push('Conselho profissional é obrigatório');
  }

  if (!guia.profissionalSolicitante?.numeroConselhoProfissional) {
    errors.push('Número no conselho profissional é obrigatório');
  }

  if (!guia.profissionalSolicitante?.uf) {
    errors.push('UF do conselho profissional é obrigatório');
  }

  if (!guia.tipoConsulta) {
    errors.push('Tipo de consulta é obrigatório');
  }

  if (!guia.dataAtendimento) {
    errors.push('Data do atendimento é obrigatória');
  }

  if (!guia.codigoTabela) {
    errors.push('Código da tabela é obrigatório');
  }

  if (!guia.codigoProcedimento) {
    errors.push('Código do procedimento é obrigatório');
  }

  if (guia.valorProcedimento === undefined || guia.valorProcedimento < 0) {
    errors.push('Valor do procedimento deve ser maior ou igual a zero');
  }

  return errors;
}
