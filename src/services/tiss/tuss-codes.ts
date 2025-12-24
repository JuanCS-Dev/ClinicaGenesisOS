/**
 * TUSS Codes Service - Re-export
 *
 * This file re-exports from the modular tuss/ directory.
 * Maintains backward compatibility with existing imports.
 *
 * @module services/tiss/tuss-codes
 * @see services/tiss/tuss
 */

export {
  // Data arrays
  CONSULTAS,
  NUTRICAO,
  PSICOLOGIA,
  CONSULTAS_ESPECIALIDADES,
  HEMATOLOGIA,
  COAGULACAO,
  BIOQUIMICA,
  HORMONIOS,
  VITAMINAS,
  URINALISE,
  COPROLOGICOS,
  EXAMES_LABORATORIAIS,
  RADIOLOGIA,
  ULTRASSONOGRAFIA,
  CARDIOLOGIA,
  EXAMES_IMAGEM,
  CURATIVOS,
  APLICACOES,
  MONITORIZACAO,
  COLETAS,
  PROCEDIMENTOS,
  // Combined
  TUSS_CODES,
  TUSS_BY_CODE,
  // Lookup functions
  getTussCodeByCode,
  getTussCodesByGroup,
  getTussGroups,
  getConsultaCodes,
  getExamCodes,
  getTussCodeCount,
  // Search functions
  searchTussCodes,
  isValidTussCode,
} from './tuss';
