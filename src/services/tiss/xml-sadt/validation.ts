/**
 * TISS XML SADT Validation
 *
 * Validation functions for GuiaSADT data.
 *
 * @module services/tiss/xml-sadt/validation
 */

import type { GuiaSADT } from '@/types';

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
