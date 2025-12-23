/**
 * TISS Guias - Padrão TISS 4.02.00
 * Guide interfaces for consultations, SADT, etc.
 */

import type {
  CaraterAtendimento,
  StatusGuia,
  TipoConsulta,
  TipoGuia,
  TipoTabela,
} from './enums';
import type {
  DadosBeneficiario,
  DadosContratado,
  DadosProfissional,
  ProcedimentoRealizado,
} from './base';
import type { Glosa } from './glosas';

/**
 * Guia de Consulta TISS 4.02.00
 */
export interface GuiaConsulta {
  registroANS: string;
  numeroGuiaPrestador: string;
  numeroGuiaOperadora?: string;
  dataAutorizacao?: string;
  senha?: string;
  dataValidadeSenha?: string;
  dadosBeneficiario: DadosBeneficiario;
  contratadoSolicitante: DadosContratado;
  profissionalSolicitante: DadosProfissional;
  indicacaoClinica?: string;
  tipoConsulta: TipoConsulta;
  dataAtendimento: string;
  codigoTabela: TipoTabela;
  codigoProcedimento: string;
  valorProcedimento: number;
  observacao?: string;
}

/**
 * Input para criar guia de consulta
 */
export interface CreateGuiaConsultaInput {
  registroANS: string;
  dadosBeneficiario: DadosBeneficiario;
  tipoConsulta: TipoConsulta;
  dataAtendimento: string;
  codigoProcedimento: string;
  valorProcedimento: number;
  indicacaoClinica?: string;
}

/**
 * Guia SP/SADT (Serviço Profissional / Serviço Auxiliar de Diagnóstico e Terapia)
 */
export interface GuiaSADT {
  registroANS: string;
  numeroGuiaPrestador: string;
  numeroGuiaPrincipal?: string;
  numeroGuiaOperadora?: string;
  dataAutorizacao?: string;
  senha?: string;
  dataValidadeSenha?: string;
  dadosBeneficiario: DadosBeneficiario;
  contratadoSolicitante: DadosContratado;
  profissionalSolicitante: DadosProfissional;
  contratadoExecutante: DadosContratado;
  profissionalExecutante: DadosProfissional;
  caraterAtendimento: CaraterAtendimento;
  dataSolicitacao: string;
  indicacaoClinica: string;
  procedimentosRealizados: ProcedimentoRealizado[];
  valorTotalProcedimentos: number;
  valorTotalTaxas?: number;
  valorTotalMateriais?: number;
  valorTotalMedicamentos?: number;
  valorTotalOPME?: number;
  valorTotalGeral: number;
  observacao?: string;
}

/**
 * Input para criar guia SADT
 */
export interface CreateGuiaSADTInput {
  registroANS: string;
  dadosBeneficiario: DadosBeneficiario;
  caraterAtendimento: CaraterAtendimento;
  dataSolicitacao: string;
  indicacaoClinica: string;
  procedimentos: Omit<ProcedimentoRealizado, 'valorTotal'>[];
}

/**
 * Guia salva no Firestore
 */
export interface GuiaFirestore {
  id: string;
  clinicId: string;
  patientId: string;
  appointmentId?: string;
  tipo: TipoGuia;
  status: StatusGuia;
  numeroGuiaPrestador: string;
  numeroGuiaOperadora?: string;
  registroANS: string;
  nomeOperadora: string;
  dataAtendimento: string;
  valorTotal: number;
  valorGlosado?: number;
  valorPago?: number;
  xmlContent?: string;
  dadosGuia: GuiaConsulta | GuiaSADT;
  glosas?: Glosa[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}
