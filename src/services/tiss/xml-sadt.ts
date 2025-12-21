/**
 * TISS XML SADT Generator
 *
 * Generates XML for Guia SP/SADT (Serviço Profissional /
 * Serviço Auxiliar de Diagnóstico e Terapia) conforming to TISS 4.02.00 standard.
 *
 * Reference: ANS Schema tissGuiasV4_02_00.xsd
 */

import type {
  GuiaSADT,
  TissXmlOptions,
  DadosContratado,
  DadosProfissional,
  ProcedimentoRealizado,
} from '@/types';

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
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date format: ${dateStr}`);
  }
  return date.toISOString().split('T')[0];
}

/**
 * Format time to HH:MM.
 */
function formatTime(timeStr: string | undefined): string {
  if (!timeStr) return '';
  // If already in HH:MM format
  if (/^\d{2}:\d{2}$/.test(timeStr)) {
    return timeStr;
  }
  // If HH:MM:SS format
  if (/^\d{2}:\d{2}:\d{2}$/.test(timeStr)) {
    return timeStr.slice(0, 5);
  }
  return timeStr;
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
function generateBeneficiarioXml(guia: GuiaSADT, indent: string): string {
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
 * Generate XML for contratado block.
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
function generateSolicitanteXml(guia: GuiaSADT, indent: string): string {
  const i2 = indent + '  ';

  let xml = `${indent}<ans:dadosSolicitante>\n`;
  xml += generateContratadoXml(guia.contratadoSolicitante, 'contratadoSolicitante', i2);
  xml += generateProfissionalXml(guia.profissionalSolicitante, 'profissionalSolicitante', i2);
  xml += `${indent}</ans:dadosSolicitante>\n`;

  return xml;
}

/**
 * Generate XML for dadosExecutante block.
 */
function generateExecutanteXml(guia: GuiaSADT, indent: string): string {
  const i2 = indent + '  ';

  let xml = `${indent}<ans:dadosExecutante>\n`;
  xml += generateContratadoXml(guia.contratadoExecutante, 'contratadoExecutante', i2);
  xml += generateProfissionalXml(guia.profissionalExecutante, 'profissionalExecutante', i2);
  xml += `${indent}</ans:dadosExecutante>\n`;

  return xml;
}

/**
 * Generate XML for dadosSolicitacao block.
 */
function generateSolicitacaoXml(guia: GuiaSADT, indent: string): string {
  const i2 = indent + '  ';

  let xml = `${indent}<ans:dadosSolicitacao>\n`;
  xml += xmlElement('caraterAtendimento', guia.caraterAtendimento, i2);
  xml += xmlElement('dataSolicitacao', formatDate(guia.dataSolicitacao), i2);
  xml += xmlElement('indicacaoClinica', guia.indicacaoClinica, i2);
  xml += `${indent}</ans:dadosSolicitacao>\n`;

  return xml;
}

/**
 * Generate XML for a single procedimento.
 */
function generateProcedimentoXml(
  proc: ProcedimentoRealizado,
  sequencial: number,
  indent: string
): string {
  const i2 = indent + '  ';

  let xml = `${indent}<ans:procedimentoRealizado>\n`;
  xml += xmlElement('sequencialItem', sequencial.toString(), i2);
  xml += xmlElement('dataRealizacao', formatDate(proc.dataRealizacao), i2);
  if (proc.horaInicial) {
    xml += xmlElement('horaInicial', formatTime(proc.horaInicial), i2);
  }
  if (proc.horaFinal) {
    xml += xmlElement('horaFinal', formatTime(proc.horaFinal), i2);
  }
  xml += xmlElement('codigoTabela', proc.codigoTabela, i2);
  xml += xmlElement('codigoProcedimento', padString(proc.codigoProcedimento, 10), i2);
  xml += xmlElement('descricaoProcedimento', proc.descricaoProcedimento, i2);
  xml += xmlElement('quantidadeRealizada', proc.quantidadeRealizada.toString(), i2);
  xml += xmlElement('valorUnitario', formatCurrency(proc.valorUnitario), i2);
  xml += xmlElement('valorTotal', formatCurrency(proc.valorTotal), i2);
  if (proc.viaAcesso) {
    xml += xmlElement('viaAcesso', proc.viaAcesso, i2);
  }
  if (proc.tecnicaUtilizada) {
    xml += xmlElement('tecnicaUtilizada', proc.tecnicaUtilizada, i2);
  }
  xml += `${indent}</ans:procedimentoRealizado>\n`;

  return xml;
}

/**
 * Generate XML for procedimentosRealizados block.
 */
function generateProcedimentosXml(guia: GuiaSADT, indent: string): string {
  const i2 = indent + '  ';

  let xml = `${indent}<ans:procedimentosRealizados>\n`;
  guia.procedimentosRealizados.forEach((proc, index) => {
    xml += generateProcedimentoXml(proc, index + 1, i2);
  });
  xml += `${indent}</ans:procedimentosRealizados>\n`;

  return xml;
}

/**
 * Generate XML for valorTotal block.
 */
function generateValorTotalXml(guia: GuiaSADT, indent: string): string {
  const i2 = indent + '  ';

  let xml = `${indent}<ans:valorTotal>\n`;
  xml += xmlElement('valorProcedimentos', formatCurrency(guia.valorTotalProcedimentos), i2);
  if (guia.valorTotalTaxas !== undefined && guia.valorTotalTaxas > 0) {
    xml += xmlElement('valorTaxasAlugueis', formatCurrency(guia.valorTotalTaxas), i2);
  }
  if (guia.valorTotalMateriais !== undefined && guia.valorTotalMateriais > 0) {
    xml += xmlElement('valorMateriais', formatCurrency(guia.valorTotalMateriais), i2);
  }
  if (guia.valorTotalMedicamentos !== undefined && guia.valorTotalMedicamentos > 0) {
    xml += xmlElement('valorMedicamentos', formatCurrency(guia.valorTotalMedicamentos), i2);
  }
  if (guia.valorTotalOPME !== undefined && guia.valorTotalOPME > 0) {
    xml += xmlElement('valorOPME', formatCurrency(guia.valorTotalOPME), i2);
  }
  xml += xmlElement('valorTotalGeral', formatCurrency(guia.valorTotalGeral), i2);
  xml += `${indent}</ans:valorTotal>\n`;

  return xml;
}

// =============================================================================
// MAIN GENERATOR
// =============================================================================

/**
 * Generate TISS XML for Guia SP/SADT.
 *
 * @param guia - Complete GuiaSADT data
 * @param options - XML generation options
 * @returns XML string
 */
export function generateXmlSADT(guia: GuiaSADT, options: TissXmlOptions = {}): string {
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

  // Prestador para Operadora
  xml += `${indent}<ans:prestadorParaOperadora>${newline}`;
  xml += `${i2}<ans:loteGuias>${newline}`;
  xml += `${i3}<ans:numeroLote>1</ans:numeroLote>${newline}`;
  xml += `${i3}<ans:guiasTISS>${newline}`;

  // Guia SP/SADT
  const i4 = i3 + indent;
  const i5 = i4 + indent;

  xml += `${i4}<ans:guiaSP-SADT>${newline}`;

  // Cabeçalho da guia
  xml += `${i5}<ans:cabecalhoGuia>${newline}`;
  xml += xmlElement('registroANS', padString(guia.registroANS, 6), i5 + '  ');
  xml += xmlElement('numeroGuiaPrestador', guia.numeroGuiaPrestador, i5 + '  ');
  if (guia.numeroGuiaPrincipal) {
    xml += xmlElement('numeroGuiaPrincipal', guia.numeroGuiaPrincipal, i5 + '  ');
  }
  if (guia.dataAutorizacao) {
    xml += xmlElement('dataAutorizacao', formatDate(guia.dataAutorizacao), i5 + '  ');
  }
  if (guia.senha) {
    xml += xmlElement('senha', guia.senha, i5 + '  ');
  }
  if (guia.dataValidadeSenha) {
    xml += xmlElement('dataValidadeSenha', formatDate(guia.dataValidadeSenha), i5 + '  ');
  }
  if (guia.numeroGuiaOperadora) {
    xml += xmlElement('numeroGuiaOperadora', guia.numeroGuiaOperadora, i5 + '  ');
  }
  xml += `${i5}</ans:cabecalhoGuia>${newline}`;

  // Dados do beneficiário
  xml += generateBeneficiarioXml(guia, i5);

  // Dados do solicitante
  xml += generateSolicitanteXml(guia, i5);

  // Dados do executante
  xml += generateExecutanteXml(guia, i5);

  // Dados da solicitação
  xml += generateSolicitacaoXml(guia, i5);

  // Procedimentos realizados
  xml += generateProcedimentosXml(guia, i5);

  // Valor total
  xml += generateValorTotalXml(guia, i5);

  // Observação
  if (guia.observacao) {
    xml += xmlElement('observacao', guia.observacao, i5);
  }

  xml += `${i4}</ans:guiaSP-SADT>${newline}`;
  xml += `${i3}</ans:guiasTISS>${newline}`;
  xml += `${i2}</ans:loteGuias>${newline}`;
  xml += `${indent}</ans:prestadorParaOperadora>${newline}`;

  // Hash
  xml += `${indent}<ans:epilogo>${newline}`;
  xml += xmlElement('hash', generateSimpleHash(xml), i2);
  xml += `${indent}</ans:epilogo>${newline}`;

  xml += `</ans:mensagemTISS>${newline}`;

  return xml;
}

/**
 * Generate just the guiaSP-SADT element (without wrapper).
 */
export function generateGuiaSADTElement(guia: GuiaSADT, indent = ''): string {
  const i1 = indent;
  const i2 = indent + '  ';

  let xml = `${i1}<ans:guiaSP-SADT>\n`;

  // Cabeçalho da guia
  xml += `${i2}<ans:cabecalhoGuia>\n`;
  xml += xmlElement('registroANS', padString(guia.registroANS, 6), i2 + '  ');
  xml += xmlElement('numeroGuiaPrestador', guia.numeroGuiaPrestador, i2 + '  ');
  xml += `${i2}</ans:cabecalhoGuia>\n`;

  // Dados
  xml += generateBeneficiarioXml(guia, i2);
  xml += generateSolicitanteXml(guia, i2);
  xml += generateExecutanteXml(guia, i2);
  xml += generateSolicitacaoXml(guia, i2);
  xml += generateProcedimentosXml(guia, i2);
  xml += generateValorTotalXml(guia, i2);

  if (guia.observacao) {
    xml += xmlElement('observacao', guia.observacao, i2);
  }

  xml += `${i1}</ans:guiaSP-SADT>\n`;

  return xml;
}

/**
 * Generate a simple hash for the XML content.
 */
function generateSimpleHash(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const hexHash = Math.abs(hash).toString(16).toUpperCase();
  return hexHash.padStart(40, '0');
}

/**
 * Validate required fields for GuiaSADT.
 */
export function validateGuiaSADT(guia: Partial<GuiaSADT>): string[] {
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

  // Solicitante
  if (!guia.contratadoSolicitante?.codigoPrestadorNaOperadora) {
    errors.push('Código do prestador solicitante é obrigatório');
  }

  if (!guia.profissionalSolicitante?.conselhoProfissional) {
    errors.push('Conselho profissional do solicitante é obrigatório');
  }

  if (!guia.profissionalSolicitante?.numeroConselhoProfissional) {
    errors.push('Número no conselho do solicitante é obrigatório');
  }

  // Executante
  if (!guia.contratadoExecutante?.codigoPrestadorNaOperadora) {
    errors.push('Código do prestador executante é obrigatório');
  }

  if (!guia.profissionalExecutante?.conselhoProfissional) {
    errors.push('Conselho profissional do executante é obrigatório');
  }

  if (!guia.profissionalExecutante?.numeroConselhoProfissional) {
    errors.push('Número no conselho do executante é obrigatório');
  }

  // Solicitação
  if (!guia.caraterAtendimento) {
    errors.push('Caráter do atendimento é obrigatório');
  }

  if (!guia.dataSolicitacao) {
    errors.push('Data da solicitação é obrigatória');
  }

  if (!guia.indicacaoClinica) {
    errors.push('Indicação clínica é obrigatória');
  }

  // Procedimentos
  if (!guia.procedimentosRealizados || guia.procedimentosRealizados.length === 0) {
    errors.push('Pelo menos um procedimento é obrigatório');
  } else {
    guia.procedimentosRealizados.forEach((proc, index) => {
      if (!proc.dataRealizacao) {
        errors.push(`Procedimento ${index + 1}: data de realização é obrigatória`);
      }
      if (!proc.codigoProcedimento) {
        errors.push(`Procedimento ${index + 1}: código do procedimento é obrigatório`);
      }
      if (!proc.descricaoProcedimento) {
        errors.push(`Procedimento ${index + 1}: descrição é obrigatória`);
      }
      if (proc.quantidadeRealizada <= 0) {
        errors.push(`Procedimento ${index + 1}: quantidade deve ser maior que zero`);
      }
      if (proc.valorUnitario < 0) {
        errors.push(`Procedimento ${index + 1}: valor unitário não pode ser negativo`);
      }
    });
  }

  // Valores
  if (guia.valorTotalGeral === undefined || guia.valorTotalGeral < 0) {
    errors.push('Valor total geral é obrigatório e não pode ser negativo');
  }

  return errors;
}

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
