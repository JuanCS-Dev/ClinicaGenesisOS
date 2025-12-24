/**
 * TISS Service Module
 *
 * Main service for TISS billing operations.
 * Handles Firestore CRUD, XML generation, and glosa management.
 *
 * @module services/tiss/service
 */

// Import XML generators from sibling modules
import { generateXmlConsulta } from '../xml-consulta';
import { generateXmlSADT } from '../xml-sadt';
import { searchTussCodes, getTussCodeByCode } from '../tuss-codes';

// Import CRUD operations
import {
  createGuiaConsulta,
  createGuiaSADT,
  getGuiaById,
  getGuiasByPatient,
  getGuiasByStatus,
  getGuiasByDateRange,
  updateGuiaStatus,
  updateGuiaOperadora,
} from './guia-crud';

// Import XML operations
import { regenerateXml, validateXml } from './xml-operations';

// Import glosa operations
import { importGlosa, createRecurso } from './glosa-operations';

// Import reports
import { getResumoFaturamento, getAnaliseGlosas } from './reports';

/**
 * TISS Service object with all operations.
 */
export const tissService = {
  // Guia CRUD
  createGuiaConsulta,
  createGuiaSADT,
  getGuiaById,
  getGuiasByPatient,
  getGuiasByStatus,
  getGuiasByDateRange,
  updateGuiaStatus,
  updateGuiaOperadora,

  // XML Operations
  regenerateXml,
  validateXml,
  generateXmlConsulta,
  generateXmlSADT,

  // Glosa Operations
  importGlosa,
  createRecurso,

  // TUSS Codes
  searchTussCodes,
  getTussCodeByCode,

  // Reports
  getResumoFaturamento,
  getAnaliseGlosas,
};

// Re-export individual functions for direct imports
export {
  // CRUD
  createGuiaConsulta,
  createGuiaSADT,
  getGuiaById,
  getGuiasByPatient,
  getGuiasByStatus,
  getGuiasByDateRange,
  updateGuiaStatus,
  updateGuiaOperadora,
  // XML
  regenerateXml,
  validateXml,
  // Glosa
  importGlosa,
  createRecurso,
  // Reports
  getResumoFaturamento,
  getAnaliseGlosas,
};

// Re-export helpers for advanced usage
export {
  getGuiasCollection,
  getGuiaDoc,
  docToGuia,
  generateGuiaNumber,
} from './helpers';
