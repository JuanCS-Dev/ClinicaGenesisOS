/**
 * TISS Service - Re-export
 *
 * This file re-exports from the modular service/ directory.
 * Maintains backward compatibility with existing imports.
 *
 * @module services/tiss/tiss.service
 * @see services/tiss/service
 */

export {
  // Main service object
  tissService,
  // CRUD operations
  createGuiaConsulta,
  createGuiaSADT,
  getGuiaById,
  getGuiasByPatient,
  getGuiasByStatus,
  getGuiasByDateRange,
  updateGuiaStatus,
  updateGuiaOperadora,
  // XML operations
  regenerateXml,
  validateXml,
  // Glosa operations
  importGlosa,
  createRecurso,
  // Reports
  getResumoFaturamento,
  getAnaliseGlosas,
  // Helpers
  getGuiasCollection,
  getGuiaDoc,
  docToGuia,
  generateGuiaNumber,
} from './service';
