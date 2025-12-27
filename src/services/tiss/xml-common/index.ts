/**
 * TISS XML Common Module
 *
 * Shared constants and helpers for TISS XML generation.
 *
 * @module services/tiss/xml-common
 */

export { TISS_VERSION, TISS_NAMESPACE, XML_DECLARATION } from './constants';

export {
  escapeXml,
  formatDate,
  formatTime,
  formatCurrency,
  padString,
  xmlElement,
  generateSHA1Hash,
  generateSimpleHash,
} from './helpers';
