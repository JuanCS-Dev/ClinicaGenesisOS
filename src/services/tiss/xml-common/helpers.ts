/**
 * TISS XML Helpers
 *
 * Shared helper functions for TISS XML generation.
 *
 * @module services/tiss/xml-common/helpers
 */

/**
 * Escape special XML characters.
 */
export function escapeXml(str: string | undefined): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Format date to TISS format (YYYY-MM-DD).
 */
export function formatDate(dateStr: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date format: ${dateStr}`);
  }
  return date.toISOString().split('T')[0];
}

/**
 * Format time to HH:MM.
 */
export function formatTime(timeStr: string | undefined): string {
  if (!timeStr) return '';
  // If already in HH:MM format
  if (/^\d{2}:\d{2}$/.test(timeStr)) {
    return timeStr;
  }
  // If HH:MM:SS format
  if (/^\d{2}:\d{2}:\d{2}$/.test(timeStr)) {
    return timeStr.slice(0, 5);
  }
  return timeStr;
}

/**
 * Format currency value to 2 decimal places.
 */
export function formatCurrency(value: number): string {
  return value.toFixed(2);
}

/**
 * Pad string to specific length.
 */
export function padString(str: string, length: number, char = '0'): string {
  return str.padStart(length, char);
}

/**
 * Generate XML element with optional value.
 */
export function xmlElement(
  tag: string,
  value: string | number | undefined,
  indent = ''
): string {
  if (value === undefined || value === null || value === '') {
    return '';
  }
  const escapedValue = typeof value === 'string' ? escapeXml(value) : value;
  return `${indent}<ans:${tag}>${escapedValue}</ans:${tag}>\n`;
}

/**
 * Generate SHA-1 hash for TISS XML content.
 *
 * Uses Web Crypto API for proper SHA-1 hash generation
 * as required by ANS TISS 4.02.00 specification.
 *
 * @param content - The XML content to hash (excluding epilogo)
 * @returns Promise resolving to SHA-1 hash as uppercase hex string (40 characters)
 */
export async function generateSHA1Hash(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

/**
 * @deprecated Use generateSHA1Hash instead
 */
export function generateSimpleHash(content: string): string {
  console.warn('generateSimpleHash is deprecated. Use generateSHA1Hash instead.');
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const hexHash = Math.abs(hash).toString(16).toUpperCase();
  return hexHash.padStart(40, '0');
}
