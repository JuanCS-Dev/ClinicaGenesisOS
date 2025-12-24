/**
 * TISS XML SADT Generator - Re-export
 *
 * This file re-exports from the modular xml-sadt/ directory.
 * Maintains backward compatibility with existing imports.
 *
 * @module services/tiss/xml-sadt
 * @see services/tiss/xml-sadt/
 */

export {
  // Main generator
  generateXmlSADT,
  generateGuiaSADTElement,
  // Validation
  validateGuiaSADT,
  // Calculator
  calculateSADTTotals,
  // Block generators
  generateBeneficiarioXml,
  generateContratadoXml,
  generateProfissionalXml,
  generateSolicitanteXml,
  generateExecutanteXml,
  generateSolicitacaoXml,
  generateProcedimentoXml,
  generateProcedimentosXml,
  generateValorTotalXml,
} from './xml-sadt/index';
