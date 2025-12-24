/**
 * TUSS Data Module
 *
 * Re-exports all TUSS code data arrays by category.
 *
 * @module services/tiss/tuss/data
 */

// Consultas médicas
export { CONSULTAS } from './consultas';

// Especialidades (Nutrição, Psicologia)
export {
  NUTRICAO,
  PSICOLOGIA,
  CONSULTAS_ESPECIALIDADES,
} from './especialidades';

// Exames laboratoriais
export {
  HEMATOLOGIA,
  COAGULACAO,
  BIOQUIMICA,
  HORMONIOS,
  VITAMINAS,
  URINALISE,
  COPROLOGICOS,
  EXAMES_LABORATORIAIS,
} from './exames-laboratoriais';

// Exames de imagem
export {
  RADIOLOGIA,
  ULTRASSONOGRAFIA,
  CARDIOLOGIA,
  EXAMES_IMAGEM,
} from './exames-imagem';

// Procedimentos ambulatoriais
export {
  CURATIVOS,
  APLICACOES,
  MONITORIZACAO,
  COLETAS,
  PROCEDIMENTOS,
} from './procedimentos';
