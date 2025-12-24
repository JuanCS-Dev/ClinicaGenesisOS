/**
 * TISS XML SADT Block Generators
 *
 * Generates individual XML blocks for GuiaSADT.
 *
 * @module services/tiss/xml-sadt/block-generators
 */

import type {
  GuiaSADT,
  DadosContratado,
  DadosProfissional,
  ProcedimentoRealizado,
} from '@/types';
import {
  formatDate,
  formatTime,
  formatCurrency,
  padString,
  xmlElement,
} from '../xml-common';

/**
 * Generate XML for dadosBeneficiario block.
 */
export function generateBeneficiarioXml(guia: GuiaSADT, indent: string): string {
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
export function generateContratadoXml(
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
export function generateProfissionalXml(
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
export function generateSolicitanteXml(guia: GuiaSADT, indent: string): string {
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
export function generateExecutanteXml(guia: GuiaSADT, indent: string): string {
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
export function generateSolicitacaoXml(guia: GuiaSADT, indent: string): string {
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
export function generateProcedimentoXml(
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
export function generateProcedimentosXml(guia: GuiaSADT, indent: string): string {
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
export function generateValorTotalXml(guia: GuiaSADT, indent: string): string {
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
