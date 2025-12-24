/**
 * TISS XML SADT Module
 *
 * Generates XML for Guia SP/SADT conforming to TISS 4.02.00 standard.
 *
 * @module services/tiss/xml-sadt
 */

// Generator functions
export { generateXmlSADT, generateGuiaSADTElement } from './generator';

// Validation
export { validateGuiaSADT } from './validation';

// Calculator
export { calculateSADTTotals } from './calculator';

// Block generators (for advanced usage)
export {
  generateBeneficiarioXml,
  generateContratadoXml,
  generateProfissionalXml,
  generateSolicitanteXml,
  generateExecutanteXml,
  generateSolicitacaoXml,
  generateProcedimentoXml,
  generateProcedimentosXml,
  generateValorTotalXml,
} from './block-generators';
