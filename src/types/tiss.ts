/**
 * TISS Types - Padrão TISS 4.02.00
 *
 * Types for the Brazilian Health Insurance Data Exchange Standard (TISS).
 * Conforming to ANS (Agência Nacional de Saúde Suplementar) regulations.
 *
 * Reference: https://www.gov.br/ans/pt-br/assuntos/prestadores/padrao-para-troca-de-informacao-de-saude-suplementar-2013-tiss
 */

// =============================================================================
// ENUMS
// =============================================================================

/**
 * Tipo de consulta conforme tabela TISS
 */
export type TipoConsulta =
  | '1' // Primeira consulta
  | '2' // Retorno
  | '3' // Pré-natal
  | '4'; // Por encaminhamento

/**
 * Caráter de atendimento
 */
export type CaraterAtendimento =
  | '1' // Eletivo
  | '2'; // Urgência/Emergência

/**
 * Tipo de tabela de procedimentos
 */
export type TipoTabela =
  | '18' // Tabela própria do prestador
  | '19' // Tabela própria da operadora
  | '20' // Tabela própria pacote
  | '22' // Tabela TUSS
  | '90' // Tabela própria de taxas
  | '98'; // Tabela própria de medicamentos

/**
 * Conselho profissional
 */
export type ConselhoProfissional =
  | '1' // CRM (Medicina)
  | '2' // CRO (Odontologia)
  | '3' // CRF (Farmácia)
  | '4' // CREFITO (Fisioterapia)
  | '5' // COREN (Enfermagem)
  | '6' // CRP (Psicologia)
  | '7' // CRN (Nutrição)
  | '8' // CREFONO (Fonoaudiologia)
  | '9' // CRESS (Serviço Social)
  | '10'; // CBO (outros)

/**
 * Unidade Federativa
 */
export type UF =
  | 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO'
  | 'MA' | 'MT' | 'MS' | 'MG' | 'PA' | 'PB' | 'PR' | 'PE' | 'PI'
  | 'RJ' | 'RN' | 'RS' | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO';

/**
 * Tipo de guia TISS
 */
export type TipoGuia =
  | 'consulta'
  | 'sadt'
  | 'internacao'
  | 'honorarios'
  | 'anexo';

/**
 * Status da guia no sistema Genesis
 */
export type StatusGuia =
  | 'rascunho'       // Ainda não enviada
  | 'enviada'        // Enviada à operadora
  | 'em_analise'     // Em análise pela operadora
  | 'autorizada'     // Autorizada para pagamento
  | 'glosada_parcial' // Parcialmente glosada
  | 'glosada_total'  // Totalmente glosada
  | 'paga'           // Pagamento recebido
  | 'recurso';       // Em recurso de glosa

/**
 * Motivo de glosa (códigos mais comuns)
 */
export type MotivoGlosa =
  | 'A1' // Guia não preenchida corretamente
  | 'A2' // Procedimento não coberto
  | 'A3' // Procedimento já realizado no período
  | 'A4' // Beneficiário sem cobertura
  | 'A5' // Carência não cumprida
  | 'A6' // Cobrança em duplicidade
  | 'A7' // Valor acima do contratado
  | 'A8' // Ausência de autorização prévia
  | 'A9' // Documentação incompleta
  | 'A10' // Prazo de envio excedido
  | 'B1' // CID incompatível
  | 'B2' // Quantidade acima do permitido
  | 'C1' // Profissional não cadastrado
  | 'outros';

// =============================================================================
// INTERFACES BASE
// =============================================================================

/**
 * Dados do beneficiário (paciente)
 */
export interface DadosBeneficiario {
  /** Número da carteira do plano de saúde (17 dígitos) */
  numeroCarteira: string;
  /** Data de validade da carteira (YYYY-MM-DD) */
  validadeCarteira?: string;
  /** Nome completo do beneficiário */
  nomeBeneficiario: string;
  /** CNS - Cartão Nacional de Saúde (15 dígitos) */
  cns?: string;
  /** Data de nascimento (YYYY-MM-DD) */
  dataNascimento?: string;
}

/**
 * Dados do prestador contratado
 */
export interface DadosContratado {
  /** Código do prestador na operadora */
  codigoPrestadorNaOperadora: string;
  /** Nome do prestador/clínica */
  nomeContratado?: string;
  /** CNES - Cadastro Nacional de Estabelecimentos de Saúde */
  cnes?: string;
  /** CNPJ do prestador (14 dígitos) */
  cnpj?: string;
}

/**
 * Dados do profissional executante/solicitante
 */
export interface DadosProfissional {
  /** Conselho profissional (1=CRM, 2=CRO, etc) */
  conselhoProfissional: ConselhoProfissional;
  /** Número no conselho profissional */
  numeroConselhoProfissional: string;
  /** UF do conselho */
  uf: UF;
  /** Nome do profissional */
  nomeProfissional?: string;
  /** CBO - Código Brasileiro de Ocupação */
  cbo?: string;
}

/**
 * Procedimento realizado
 */
export interface ProcedimentoRealizado {
  /** Data de realização (YYYY-MM-DD) */
  dataRealizacao: string;
  /** Hora inicial (HH:MM) */
  horaInicial?: string;
  /** Hora final (HH:MM) */
  horaFinal?: string;
  /** Tipo de tabela de procedimentos */
  codigoTabela: TipoTabela;
  /** Código do procedimento (TUSS ou próprio) */
  codigoProcedimento: string;
  /** Descrição do procedimento */
  descricaoProcedimento: string;
  /** Quantidade realizada */
  quantidadeRealizada: number;
  /** Valor unitário em BRL */
  valorUnitario: number;
  /** Valor total (quantidade × valor unitário) */
  valorTotal: number;
  /** Via de acesso (para procedimentos cirúrgicos) */
  viaAcesso?: string;
  /** Técnica utilizada */
  tecnicaUtilizada?: string;
}

// =============================================================================
// GUIA DE CONSULTA
// =============================================================================

/**
 * Guia de Consulta TISS 4.02.00
 */
export interface GuiaConsulta {
  /** Registro ANS da operadora (6 dígitos) */
  registroANS: string;
  /** Número da guia atribuído pelo prestador */
  numeroGuiaPrestador: string;
  /** Número da guia atribuído pela operadora (após autorização) */
  numeroGuiaOperadora?: string;
  /** Data de autorização (YYYY-MM-DD) */
  dataAutorizacao?: string;
  /** Senha de autorização */
  senha?: string;
  /** Data de validade da senha (YYYY-MM-DD) */
  dataValidadeSenha?: string;
  /** Dados do beneficiário */
  dadosBeneficiario: DadosBeneficiario;
  /** Dados do contratado solicitante */
  contratadoSolicitante: DadosContratado;
  /** Dados do profissional solicitante */
  profissionalSolicitante: DadosProfissional;
  /** Indicação clínica/CID */
  indicacaoClinica?: string;
  /** Tipo de consulta */
  tipoConsulta: TipoConsulta;
  /** Data do atendimento (YYYY-MM-DD) */
  dataAtendimento: string;
  /** Tipo de tabela */
  codigoTabela: TipoTabela;
  /** Código do procedimento de consulta */
  codigoProcedimento: string;
  /** Valor do procedimento em BRL */
  valorProcedimento: number;
  /** Observações adicionais */
  observacao?: string;
}

/**
 * Input para criar guia de consulta
 */
export interface CreateGuiaConsultaInput {
  /** Registro ANS da operadora */
  registroANS: string;
  /** Dados do paciente */
  dadosBeneficiario: DadosBeneficiario;
  /** Tipo de consulta */
  tipoConsulta: TipoConsulta;
  /** Data do atendimento */
  dataAtendimento: string;
  /** Código TUSS do procedimento */
  codigoProcedimento: string;
  /** Valor do procedimento */
  valorProcedimento: number;
  /** Indicação clínica (CID ou texto) */
  indicacaoClinica?: string;
}

// =============================================================================
// GUIA SP/SADT
// =============================================================================

/**
 * Guia SP/SADT (Serviço Profissional / Serviço Auxiliar de Diagnóstico e Terapia)
 */
export interface GuiaSADT {
  /** Registro ANS da operadora (6 dígitos) */
  registroANS: string;
  /** Número da guia atribuído pelo prestador */
  numeroGuiaPrestador: string;
  /** Número da guia principal (se for complementar) */
  numeroGuiaPrincipal?: string;
  /** Número da guia atribuído pela operadora */
  numeroGuiaOperadora?: string;
  /** Data de autorização */
  dataAutorizacao?: string;
  /** Senha de autorização */
  senha?: string;
  /** Data de validade da senha */
  dataValidadeSenha?: string;
  /** Dados do beneficiário */
  dadosBeneficiario: DadosBeneficiario;
  /** Dados do contratado solicitante */
  contratadoSolicitante: DadosContratado;
  /** Dados do profissional solicitante */
  profissionalSolicitante: DadosProfissional;
  /** Dados do contratado executante */
  contratadoExecutante: DadosContratado;
  /** Dados do profissional executante */
  profissionalExecutante: DadosProfissional;
  /** Caráter do atendimento */
  caraterAtendimento: CaraterAtendimento;
  /** Data da solicitação */
  dataSolicitacao: string;
  /** Indicação clínica */
  indicacaoClinica: string;
  /** Lista de procedimentos realizados */
  procedimentosRealizados: ProcedimentoRealizado[];
  /** Valor total dos procedimentos */
  valorTotalProcedimentos: number;
  /** Valor total das taxas */
  valorTotalTaxas?: number;
  /** Valor total de materiais */
  valorTotalMateriais?: number;
  /** Valor total de medicamentos */
  valorTotalMedicamentos?: number;
  /** Valor total de OPME */
  valorTotalOPME?: number;
  /** Valor total geral */
  valorTotalGeral: number;
  /** Observações */
  observacao?: string;
}

/**
 * Input para criar guia SADT
 */
export interface CreateGuiaSADTInput {
  /** Registro ANS da operadora */
  registroANS: string;
  /** Dados do paciente */
  dadosBeneficiario: DadosBeneficiario;
  /** Caráter do atendimento */
  caraterAtendimento: CaraterAtendimento;
  /** Data da solicitação */
  dataSolicitacao: string;
  /** Indicação clínica */
  indicacaoClinica: string;
  /** Lista de procedimentos */
  procedimentos: Omit<ProcedimentoRealizado, 'valorTotal'>[];
}

// =============================================================================
// GLOSAS
// =============================================================================

/**
 * Item glosado em uma guia
 */
export interface ItemGlosado {
  /** Sequência do item na guia */
  sequencialItem: number;
  /** Código do procedimento glosado */
  codigoProcedimento: string;
  /** Descrição do procedimento */
  descricaoProcedimento: string;
  /** Valor glosado em BRL */
  valorGlosado: number;
  /** Código do motivo da glosa */
  codigoGlosa: MotivoGlosa;
  /** Descrição do motivo */
  descricaoGlosa: string;
  /** Justificativa do recurso (se houver) */
  justificativaRecurso?: string;
  /** Status do recurso */
  statusRecurso?: 'pendente' | 'aceito' | 'negado';
}

/**
 * Glosa de uma guia
 */
export interface Glosa {
  /** ID único no Firestore */
  id: string;
  /** Número da guia afetada */
  numeroGuiaPrestador: string;
  /** Tipo da guia */
  tipoGuia: TipoGuia;
  /** Data de recebimento da glosa */
  dataRecebimento: string;
  /** Valor total original da guia */
  valorOriginal: number;
  /** Valor total glosado */
  valorGlosado: number;
  /** Valor aprovado (original - glosado) */
  valorAprovado: number;
  /** Itens glosados */
  itensGlosados: ItemGlosado[];
  /** Prazo para recurso */
  prazoRecurso: string;
  /** Status geral */
  status: 'pendente' | 'em_recurso' | 'resolvida';
  /** Observações da operadora */
  observacaoOperadora?: string;
  /** Data de criação no sistema */
  createdAt: string;
  /** Data de última atualização */
  updatedAt: string;
}

/**
 * Recurso de glosa
 */
export interface RecursoGlosa {
  /** ID único */
  id: string;
  /** ID da glosa original */
  glosaId: string;
  /** Data de envio do recurso */
  dataEnvio: string;
  /** Itens sendo contestados */
  itensContestados: Array<{
    sequencialItem: number;
    justificativa: string;
    documentosAnexos?: string[];
  }>;
  /** Valor total contestado */
  valorContestado: number;
  /** Status do recurso */
  status: 'enviado' | 'em_analise' | 'aceito' | 'negado' | 'aceito_parcial';
  /** Resposta da operadora */
  respostaOperadora?: string;
  /** Data da resposta */
  dataResposta?: string;
  /** Valor recuperado (se aceito) */
  valorRecuperado?: number;
}

// =============================================================================
// GUIA GENESIS (REPRESENTAÇÃO NO FIRESTORE)
// =============================================================================

/**
 * Guia salva no Firestore
 */
export interface GuiaFirestore {
  /** ID único (Firestore doc ID) */
  id: string;
  /** Clinic ID (multi-tenancy) */
  clinicId: string;
  /** ID do paciente */
  patientId: string;
  /** ID da consulta relacionada */
  appointmentId?: string;
  /** Tipo da guia */
  tipo: TipoGuia;
  /** Status atual */
  status: StatusGuia;
  /** Número da guia no prestador */
  numeroGuiaPrestador: string;
  /** Número da guia na operadora (se houver) */
  numeroGuiaOperadora?: string;
  /** Registro ANS da operadora */
  registroANS: string;
  /** Nome da operadora */
  nomeOperadora: string;
  /** Data do atendimento */
  dataAtendimento: string;
  /** Valor total da guia */
  valorTotal: number;
  /** Valor glosado (se houver) */
  valorGlosado?: number;
  /** Valor pago (se houver) */
  valorPago?: number;
  /** XML gerado */
  xmlContent?: string;
  /** Dados completos da guia (JSON) */
  dadosGuia: GuiaConsulta | GuiaSADT;
  /** Glosas relacionadas */
  glosas?: Glosa[];
  /** Data de criação */
  createdAt: string;
  /** Data de última atualização */
  updatedAt: string;
  /** Usuário que criou */
  createdBy: string;
  /** Usuário que atualizou por último */
  updatedBy: string;
}

// =============================================================================
// OPERADORA (CONVÊNIO)
// =============================================================================

/**
 * Operadora de plano de saúde
 */
export interface Operadora {
  /** ID único */
  id: string;
  /** Registro ANS (6 dígitos) */
  registroANS: string;
  /** Nome fantasia */
  nomeFantasia: string;
  /** Razão social */
  razaoSocial: string;
  /** CNPJ */
  cnpj: string;
  /** Código do prestador nesta operadora */
  codigoPrestador: string;
  /** Tabela de preços utilizada */
  tabelaPrecos: TipoTabela;
  /** URL para envio de guias (se WebService) */
  urlWebservice?: string;
  /** Token de autenticação (se houver) */
  tokenAuth?: string;
  /** Email para envio de guias */
  emailFaturamento?: string;
  /** Ativa ou não */
  ativa: boolean;
  /** Configurações específicas */
  configuracoes?: {
    /** Prazo de envio em dias */
    prazoEnvioDias: number;
    /** Exige autorização prévia */
    exigeAutorizacao: boolean;
    /** Permite envio de lote */
    permiteLote: boolean;
  };
}

// =============================================================================
// CÓDIGOS TUSS
// =============================================================================

/**
 * Código TUSS (Terminologia Unificada da Saúde Suplementar)
 */
export interface CodigoTUSS {
  /** Código do procedimento (8 dígitos) */
  codigo: string;
  /** Descrição do procedimento */
  descricao: string;
  /** Grupo/categoria */
  grupo: string;
  /** Subgrupo */
  subgrupo?: string;
  /** Valor de referência ANS (BRL) */
  valorReferencia?: number;
  /** Vigência início (YYYY-MM-DD) */
  vigenciaInicio: string;
  /** Vigência fim (YYYY-MM-DD ou null se vigente) */
  vigenciaFim?: string;
  /** Procedimento ativo */
  ativo: boolean;
}

// =============================================================================
// RELATÓRIOS E ANALYTICS
// =============================================================================

/**
 * Resumo de faturamento por período
 */
export interface ResumoFaturamento {
  /** Período de referência */
  periodo: {
    inicio: string;
    fim: string;
  };
  /** Total de guias emitidas */
  totalGuias: number;
  /** Guias por tipo */
  guiasPorTipo: Record<TipoGuia, number>;
  /** Guias por status */
  guiasPorStatus: Record<StatusGuia, number>;
  /** Valor total faturado */
  valorTotalFaturado: number;
  /** Valor total glosado */
  valorTotalGlosado: number;
  /** Valor total recebido */
  valorTotalRecebido: number;
  /** Taxa de glosa (%) */
  taxaGlosa: number;
  /** Faturamento por operadora */
  porOperadora: Array<{
    registroANS: string;
    nomeOperadora: string;
    valorFaturado: number;
    valorGlosado: number;
    valorRecebido: number;
    quantidadeGuias: number;
  }>;
}

/**
 * Análise de glosas
 */
export interface AnaliseGlosas {
  /** Período de referência */
  periodo: {
    inicio: string;
    fim: string;
  };
  /** Total de glosas */
  totalGlosas: number;
  /** Valor total glosado */
  valorTotalGlosado: number;
  /** Valor recuperado via recurso */
  valorRecuperado: number;
  /** Taxa de recuperação (%) */
  taxaRecuperacao: number;
  /** Glosas por motivo */
  porMotivo: Array<{
    motivo: MotivoGlosa;
    descricao: string;
    quantidade: number;
    valor: number;
    percentual: number;
  }>;
  /** Glosas por operadora */
  porOperadora: Array<{
    registroANS: string;
    nomeOperadora: string;
    quantidade: number;
    valor: number;
  }>;
}

// =============================================================================
// SERVICE TYPES
// =============================================================================

/**
 * Options for generating TISS XML
 */
export interface TissXmlOptions {
  /** Include XML declaration */
  includeDeclaration?: boolean;
  /** Pretty print XML */
  prettyPrint?: boolean;
  /** Validate against XSD before returning */
  validate?: boolean;
}

/**
 * Result of XML validation
 */
export interface TissValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** List of validation errors */
  errors: Array<{
    path: string;
    message: string;
    severity: 'error' | 'warning';
  }>;
  /** List of validation warnings */
  warnings: Array<{
    path: string;
    message: string;
  }>;
}

/**
 * TISS service interface
 */
export interface TissServiceInterface {
  // Guia operations
  createGuiaConsulta(clinicId: string, input: CreateGuiaConsultaInput): Promise<string>;
  createGuiaSADT(clinicId: string, input: CreateGuiaSADTInput): Promise<string>;
  getGuiaById(clinicId: string, guiaId: string): Promise<GuiaFirestore | null>;
  getGuiasByPatient(clinicId: string, patientId: string): Promise<GuiaFirestore[]>;
  getGuiasByStatus(clinicId: string, status: StatusGuia): Promise<GuiaFirestore[]>;
  updateGuiaStatus(clinicId: string, guiaId: string, status: StatusGuia): Promise<void>;

  // XML operations
  generateXmlConsulta(guia: GuiaConsulta, options?: TissXmlOptions): string;
  generateXmlSADT(guia: GuiaSADT, options?: TissXmlOptions): string;
  validateXml(xml: string): TissValidationResult;

  // Glosa operations
  importGlosa(clinicId: string, guiaId: string, glosaData: Omit<Glosa, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
  createRecurso(clinicId: string, glosaId: string, recurso: Omit<RecursoGlosa, 'id' | 'status'>): Promise<string>;

  // TUSS codes
  searchTussCodes(query: string, limit?: number): CodigoTUSS[];
  getTussCodeByCode(codigo: string): CodigoTUSS | null;

  // Reports
  getResumoFaturamento(clinicId: string, inicio: string, fim: string): Promise<ResumoFaturamento>;
  getAnaliseGlosas(clinicId: string, inicio: string, fim: string): Promise<AnaliseGlosas>;
}
