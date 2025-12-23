/**
 * TISS Operadoras - Padrão TISS 4.02.00
 * Health insurance operator interfaces
 */

import type { ConselhoProfissional, TipoIntegracao, TipoTabela, UF } from './enums';

/**
 * Operadora de plano de saúde (legacy interface)
 */
export interface Operadora {
  id: string;
  registroANS: string;
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
  codigoPrestador: string;
  tabelaPrecos: TipoTabela;
  urlWebservice?: string;
  tokenAuth?: string;
  emailFaturamento?: string;
  ativa: boolean;
  configuracoes?: {
    prazoEnvioDias: number;
    exigeAutorizacao: boolean;
    permiteLote: boolean;
  };
}

/**
 * Configuração de autenticação para WebService
 */
export interface WebServiceAuth {
  tipo: 'certificado' | 'usuario_senha' | 'token' | 'oauth2';
  usuario?: string;
  senha?: string;
  token?: string;
  certificadoBase64?: string;
  certificadoSenha?: string;
  clientId?: string;
  clientSecret?: string;
}

/**
 * Configuração de WebService SOAP/REST
 */
export interface WebServiceConfig {
  tipoIntegracao: TipoIntegracao;
  urlProducao?: string;
  urlHomologacao?: string;
  usarHomologacao: boolean;
  auth?: WebServiceAuth;
  timeoutMs: number;
  tentativasRetry: number;
  headers?: Record<string, string>;
  soapAction?: string;
  wsdlUrl?: string;
}

/**
 * Operadora salva no Firestore (multi-tenant)
 * Path: /clinics/{clinicId}/operadoras/{operadoraId}
 */
export interface OperadoraFirestore {
  id: string;
  clinicId: string;
  registroANS: string;
  nomeFantasia: string;
  razaoSocial?: string;
  cnpj?: string;
  codigoPrestador: string;
  tabelaPrecos: TipoTabela;
  ativa: boolean;
  configuracoes: {
    prazoEnvioDias: number;
    exigeAutorizacao: boolean;
    permiteLote: boolean;
    aceitaRecursoOnline: boolean;
    diasPrazoRecurso: number;
    percentualCoparticipacao?: number;
  };
  webservice?: WebServiceConfig;
  contatos?: {
    emailFaturamento?: string;
    telefoneFaturamento?: string;
    emailGlosas?: string;
    portalUrl?: string;
  };
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

/**
 * Input para criar/atualizar operadora
 */
export type CreateOperadoraInput = Omit<
  OperadoraFirestore,
  'id' | 'clinicId' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
>;

/**
 * Configurações de convênio da clínica
 * Stored in: /clinics/{clinicId} -> settings.convenios
 */
export interface ClinicConvenioSettings {
  cnes: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  endereco?: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: UF;
    cep: string;
  };
  responsavelTecnico?: {
    nome: string;
    conselho: ConselhoProfissional;
    numeroConselho: string;
    uf: UF;
  };
  certificadoDigital?: {
    tipo: 'e-cnpj' | 'e-cpf';
    validade: string;
    emitidoPor: string;
    configurado: boolean;
  };
  configuracoesPadrao: {
    tabelaPrecosPadrao: TipoTabela;
    prazoEnvioPadrao: number;
    gerarXmlAutomatico: boolean;
    validarAntesEnvio: boolean;
  };
}
