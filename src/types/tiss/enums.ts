/**
 * TISS Enums - Padrão TISS 4.02.00
 * All type literals and enums for TISS billing
 */

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

/**
 * Status do lote de guias
 */
export type StatusLote =
  | 'rascunho'       // Lote em preparação
  | 'validando'      // Validando XML
  | 'pronto'         // Pronto para envio
  | 'enviando'       // Transmitindo
  | 'enviado'        // Enviado com sucesso
  | 'erro'           // Erro no envio
  | 'processado';    // Processado pela operadora

/**
 * Tipo de integração com a operadora
 */
export type TipoIntegracao = 'webservice' | 'portal' | 'email' | 'manual';
