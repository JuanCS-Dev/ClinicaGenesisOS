/**
 * TISS XML SADT Generator
 *
 * Main generator functions for GuiaSADT XML.
 *
 * @module services/tiss/xml-sadt/generator
 */

import type { GuiaSADT, TissXmlOptions } from '@/types';
import {
  TISS_VERSION,
  TISS_NAMESPACE,
  XML_DECLARATION,
  formatDate,
  padString,
  xmlElement,
  generateSHA1Hash,
} from '../xml-common';
import {
  generateBeneficiarioXml,
  generateSolicitanteXml,
  generateExecutanteXml,
  generateSolicitacaoXml,
  generateProcedimentosXml,
  generateValorTotalXml,
} from './block-generators';

/**
 * Generate TISS XML for Guia SP/SADT.
 *
 * Generates XML conforming to TISS 4.02.00 standard with proper SHA-1 hash.
 *
 * @param guia - Complete GuiaSADT data
 * @param options - XML generation options
 * @returns Promise resolving to XML string
 */
export async function generateXmlSADT(guia: GuiaSADT, options: TissXmlOptions = {}): Promise<string> {
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

  // Generate SHA-1 hash of XML content (before epilogo)
  const contentToHash = xml;
  const hash = await generateSHA1Hash(contentToHash);

  xml += `${indent}<ans:epilogo>${newline}`;
  xml += xmlElement('hash', hash, i2);
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
