/**
 * HTML Sanitization Utilities
 * ===========================
 *
 * Provides XSS-safe HTML rendering using DOMPurify.
 * Use these utilities whenever rendering user-generated or external HTML content.
 *
 * @see https://github.com/cure53/DOMPurify
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
 */

import DOMPurify, { Config } from 'dompurify';

/**
 * Default DOMPurify configuration for Genesis OS.
 * - Allows safe HTML tags for rich text content
 * - Removes all potentially dangerous content
 * - Strips javascript: URLs
 */
const DEFAULT_CONFIG: Config = {
  ALLOWED_TAGS: [
    // Text formatting
    'p', 'br', 'b', 'i', 'strong', 'em', 'u', 's', 'mark', 'small', 'sub', 'sup',
    // Headings
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    // Lists
    'ul', 'ol', 'li',
    // Links and media (URLs validated)
    'a', 'img',
    // Tables
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    // Structural
    'div', 'span', 'blockquote', 'pre', 'code', 'hr',
  ],
  ALLOWED_ATTR: [
    // Common
    'class', 'id', 'style',
    // Links
    'href', 'target', 'rel',
    // Images
    'src', 'alt', 'width', 'height', 'loading',
    // Tables
    'colspan', 'rowspan',
  ],
  // Force all links to open in new tab with noopener
  ADD_ATTR: ['target', 'rel'],
  // Strip dangerous URI schemes
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  // Return string (not DOM node)
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
};

/**
 * Sanitize HTML content to prevent XSS attacks.
 *
 * @param dirty - Potentially unsafe HTML string
 * @param config - Optional DOMPurify configuration override
 * @returns Sanitized HTML string safe for dangerouslySetInnerHTML
 *
 * @example
 * ```tsx
 * import { sanitizeHTML } from '@/utils/sanitize';
 *
 * function ArticleContent({ content }: { content: string }) {
 *   return (
 *     <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(content) }} />
 *   );
 * }
 * ```
 */
export function sanitizeHTML(dirty: string, config?: Config): string {
  return DOMPurify.sanitize(dirty, { ...DEFAULT_CONFIG, ...config, RETURN_TRUSTED_TYPE: false }) as string;
}

/**
 * Sanitize HTML with strict configuration (text only, no links/images).
 * Use for user-generated content in comments, notes, etc.
 *
 * @param dirty - Potentially unsafe HTML string
 * @returns Sanitized HTML string with minimal formatting
 */
export function sanitizeTextOnly(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['p', 'br', 'b', 'i', 'strong', 'em', 'u'],
    ALLOWED_ATTR: [],
    RETURN_TRUSTED_TYPE: false,
  }) as string;
}

/**
 * Strip all HTML and return plain text.
 * Use when HTML is not needed at all.
 *
 * @param dirty - HTML string
 * @returns Plain text with all HTML removed
 */
export function stripHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    RETURN_TRUSTED_TYPE: false,
  }) as string;
}

/**
 * Hook for memoized HTML sanitization in React components.
 * Prevents re-sanitization on every render.
 *
 * @example
 * ```tsx
 * import { useSanitizedHTML } from '@/utils/sanitize';
 *
 * function HelpArticle({ content }: { content: string }) {
 *   const safeContent = useSanitizedHTML(content);
 *   return <div dangerouslySetInnerHTML={{ __html: safeContent }} />;
 * }
 * ```
 */
import { useMemo } from 'react';

export function useSanitizedHTML(html: string, config?: Config): string {
  return useMemo(() => sanitizeHTML(html, config), [html, config]);
}

export default {
  sanitizeHTML,
  sanitizeTextOnly,
  stripHTML,
  useSanitizedHTML,
};
