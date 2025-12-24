/**
 * TUSS Codes Service
 *
 * Terminologia Unificada da Saúde Suplementar (TUSS)
 * Brazilian unified healthcare terminology standardized by ANS.
 *
 * This module provides the most commonly used procedure codes for
 * medical clinics, including consultations, basic exams, and procedures.
 *
 * Reference: https://www.gov.br/ans/pt-br/assuntos/prestadores/tuss-terminologia-unificada-da-saude-suplementar
 *
 * @module services/tiss/tuss
 */

// Data exports (for direct access to code arrays)
export {
  // Consultas
  CONSULTAS,
  // Especialidades
  NUTRICAO,
  PSICOLOGIA,
  CONSULTAS_ESPECIALIDADES,
  // Exames laboratoriais
  HEMATOLOGIA,
  COAGULACAO,
  BIOQUIMICA,
  HORMONIOS,
  VITAMINAS,
  URINALISE,
  COPROLOGICOS,
  EXAMES_LABORATORIAIS,
  // Exames de imagem
  RADIOLOGIA,
  ULTRASSONOGRAFIA,
  CARDIOLOGIA,
  EXAMES_IMAGEM,
  // Procedimentos
  CURATIVOS,
  APLICACOES,
  MONITORIZACAO,
  COLETAS,
  PROCEDIMENTOS,
} from './data';

// Lookup exports
export {
  TUSS_CODES,
  TUSS_BY_CODE,
  getTussCodeByCode,
  getTussCodesByGroup,
  getTussGroups,
  getConsultaCodes,
  getExamCodes,
  getTussCodeCount,
} from './lookup';

// Search exports
export {
  searchTussCodes,
  isValidTussCode,
} from './search';
