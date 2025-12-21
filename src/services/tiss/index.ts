/**
 * TISS Services Index
 *
 * Exports all TISS-related services for billing and insurance management.
 */

export { tissService } from './tiss.service';
export { generateXmlConsulta, validateGuiaConsulta, generateGuiaConsultaElement } from './xml-consulta';
export { generateXmlSADT, validateGuiaSADT, calculateSADTTotals, generateGuiaSADTElement } from './xml-sadt';
export {
  searchTussCodes,
  getTussCodeByCode,
  getTussCodesByGroup,
  getTussGroups,
  getConsultaCodes,
  getExamCodes,
  isValidTussCode,
  getTussCodeCount,
  TUSS_CODES,
} from './tuss-codes';
export { parseGlosaXml, parseGlosaResponse, getGlosaDescription } from './glosa-parser';
