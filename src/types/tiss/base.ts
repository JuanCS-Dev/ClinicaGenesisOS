/**
 * TISS Base Interfaces - Padrão TISS 4.02.00
 * Base interfaces shared across TISS types
 */

import type { ConselhoProfissional, TipoTabela, UF } from './enums';

/**
 * Dados do beneficiário (paciente)
 */
export interface DadosBeneficiario {
  numeroCarteira: string;
  validadeCarteira?: string;
  nomeBeneficiario: string;
  cns?: string;
  dataNascimento?: string;
}

/**
 * Dados do prestador contratado
 */
export interface DadosContratado {
  codigoPrestadorNaOperadora: string;
  nomeContratado?: string;
  cnes?: string;
  cnpj?: string;
}

/**
 * Dados do profissional executante/solicitante
 */
export interface DadosProfissional {
  conselhoProfissional: ConselhoProfissional;
  numeroConselhoProfissional: string;
  uf: UF;
  nomeProfissional?: string;
  cbo?: string;
}

/**
 * Procedimento realizado
 */
export interface ProcedimentoRealizado {
  dataRealizacao: string;
  horaInicial?: string;
  horaFinal?: string;
  codigoTabela: TipoTabela;
  codigoProcedimento: string;
  descricaoProcedimento: string;
  quantidadeRealizada: number;
  valorUnitario: number;
  valorTotal: number;
  viaAcesso?: string;
  tecnicaUtilizada?: string;
}

/**
 * Código TUSS (Terminologia Unificada da Saúde Suplementar)
 */
export interface CodigoTUSS {
  codigo: string;
  descricao: string;
  grupo: string;
  subgrupo?: string;
  valorReferencia?: number;
  vigenciaInicio: string;
  vigenciaFim?: string;
  ativo: boolean;
}
