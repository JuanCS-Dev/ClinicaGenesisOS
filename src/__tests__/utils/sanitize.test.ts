/**
 * HTML Sanitization Utilities Tests
 *
 * Tests for XSS prevention and HTML sanitization functions.
 *
 * @module __tests__/utils/sanitize
 */

import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { sanitizeHTML, sanitizeTextOnly, stripHTML, useSanitizedHTML } from '../../utils/sanitize'

describe('HTML Sanitization Utilities', () => {
  describe('sanitizeHTML', () => {
    it('should allow safe HTML tags', () => {
      const input = '<p>Hello <strong>World</strong></p>'
      const result = sanitizeHTML(input)

      expect(result).toBe('<p>Hello <strong>World</strong></p>')
    })

    it('should allow headings', () => {
      const input = '<h1>Title</h1><h2>Subtitle</h2>'
      const result = sanitizeHTML(input)

      expect(result).toContain('<h1>Title</h1>')
      expect(result).toContain('<h2>Subtitle</h2>')
    })

    it('should allow lists', () => {
      const input = '<ul><li>Item 1</li><li>Item 2</li></ul>'
      const result = sanitizeHTML(input)

      expect(result).toBe('<ul><li>Item 1</li><li>Item 2</li></ul>')
    })

    it('should allow tables', () => {
      const input =
        '<table><thead><tr><th>Header</th></tr></thead><tbody><tr><td>Cell</td></tr></tbody></table>'
      const result = sanitizeHTML(input)

      expect(result).toContain('<table>')
      expect(result).toContain('<th>Header</th>')
      expect(result).toContain('<td>Cell</td>')
    })

    it('should allow links with href', () => {
      const input = '<a href="https://example.com">Link</a>'
      const result = sanitizeHTML(input)

      expect(result).toContain('href="https://example.com"')
    })

    it('should allow images with src', () => {
      const input = '<img src="https://example.com/image.jpg" alt="Test" />'
      const result = sanitizeHTML(input)

      expect(result).toContain('src="https://example.com/image.jpg"')
      expect(result).toContain('alt="Test"')
    })

    // XSS Prevention Tests
    it('should remove script tags', () => {
      const input = '<p>Safe content</p><script>alert("XSS")</script>'
      const result = sanitizeHTML(input)

      expect(result).not.toContain('<script>')
      expect(result).not.toContain('alert')
      expect(result).toBe('<p>Safe content</p>')
    })

    it('should remove inline event handlers', () => {
      const input = '<div onclick="alert(\'XSS\')">Click me</div>'
      const result = sanitizeHTML(input)

      expect(result).not.toContain('onclick')
      expect(result).not.toContain('alert')
    })

    it('should remove onerror handlers', () => {
      const input = '<img src="x" onerror="alert(\'XSS\')">'
      const result = sanitizeHTML(input)

      expect(result).not.toContain('onerror')
    })

    it('should strip javascript: URIs', () => {
      const input = '<a href="javascript:alert(\'XSS\')">Click</a>'
      const result = sanitizeHTML(input)

      expect(result).not.toContain('javascript:')
    })

    it('should strip data: URIs for scripts', () => {
      const input = '<a href="data:text/html,<script>alert(1)</script>">Click</a>'
      const result = sanitizeHTML(input)

      expect(result).not.toContain('<script>')
    })

    it('should remove iframe tags', () => {
      const input = '<iframe src="https://evil.com"></iframe>'
      const result = sanitizeHTML(input)

      expect(result).not.toContain('<iframe>')
    })

    it('should remove object and embed tags', () => {
      const input = '<object data="evil.swf"></object><embed src="evil.swf">'
      const result = sanitizeHTML(input)

      expect(result).not.toContain('<object>')
      expect(result).not.toContain('<embed>')
    })

    it('should handle SVG with embedded script', () => {
      const input = '<svg onload="alert(\'XSS\')"><circle cx="50" cy="50" r="40"/></svg>'
      const result = sanitizeHTML(input)

      expect(result).not.toContain('onload')
      expect(result).not.toContain('alert')
    })

    it('should handle encoded XSS attempts', () => {
      const input = '<img src=x onerror=&#97;&#108;&#101;&#114;&#116;&#40;&#49;&#41;>'
      const result = sanitizeHTML(input)

      expect(result).not.toContain('onerror')
    })

    it('should allow safe attributes', () => {
      const input = '<div class="container" id="main" style="color: red;">Content</div>'
      const result = sanitizeHTML(input)

      expect(result).toContain('class="container"')
      expect(result).toContain('id="main"')
    })

    it('should handle empty input', () => {
      expect(sanitizeHTML('')).toBe('')
    })

    it('should handle null-like input', () => {
      expect(sanitizeHTML(null as unknown as string)).toBe('')
      expect(sanitizeHTML(undefined as unknown as string)).toBe('')
    })

    it('should accept custom configuration', () => {
      const input = '<div>Content</div><span>More</span>'
      const result = sanitizeHTML(input, { ALLOWED_TAGS: ['div'] })

      expect(result).toContain('<div>')
      expect(result).not.toContain('<span>')
    })
  })

  describe('sanitizeTextOnly', () => {
    it('should allow basic text formatting tags', () => {
      const input = '<p>Hello <strong>World</strong> <em>again</em></p>'
      const result = sanitizeTextOnly(input)

      expect(result).toContain('<p>')
      expect(result).toContain('<strong>')
      expect(result).toContain('<em>')
    })

    it('should remove links', () => {
      const input = '<p>Check <a href="https://example.com">this link</a></p>'
      const result = sanitizeTextOnly(input)

      expect(result).not.toContain('<a')
      expect(result).not.toContain('href')
      expect(result).toContain('this link')
    })

    it('should remove images', () => {
      const input = '<p>Text <img src="test.jpg" alt="test"> more text</p>'
      const result = sanitizeTextOnly(input)

      expect(result).not.toContain('<img')
      expect(result).not.toContain('src=')
    })

    it('should remove all attributes', () => {
      const input = '<p class="highlight" id="para">Text</p>'
      const result = sanitizeTextOnly(input)

      expect(result).not.toContain('class=')
      expect(result).not.toContain('id=')
      expect(result).toContain('<p>')
    })

    it('should remove tables', () => {
      const input = '<table><tr><td>Cell</td></tr></table>'
      const result = sanitizeTextOnly(input)

      expect(result).not.toContain('<table>')
      expect(result).toContain('Cell')
    })

    it('should handle empty input', () => {
      expect(sanitizeTextOnly('')).toBe('')
    })
  })

  describe('stripHTML', () => {
    it('should remove all HTML tags', () => {
      const input = '<p>Hello <strong>World</strong></p>'
      const result = stripHTML(input)

      expect(result).toBe('Hello World')
    })

    it('should handle nested tags', () => {
      const input = '<div><ul><li>Item 1</li><li>Item 2</li></ul></div>'
      const result = stripHTML(input)

      expect(result).toBe('Item 1Item 2')
    })

    it('should handle links', () => {
      const input = '<a href="https://example.com">Click here</a>'
      const result = stripHTML(input)

      expect(result).toBe('Click here')
    })

    it('should remove script content', () => {
      const input = '<p>Safe</p><script>alert("evil")</script>'
      const result = stripHTML(input)

      expect(result).not.toContain('alert')
      expect(result).not.toContain('evil')
    })

    it('should handle empty input', () => {
      expect(stripHTML('')).toBe('')
    })

    it('should return plain text as-is', () => {
      const input = 'Just plain text'
      expect(stripHTML(input)).toBe('Just plain text')
    })

    it('should handle special characters in text', () => {
      const input = '<p>&lt;script&gt; is escaped</p>'
      const result = stripHTML(input)

      // HTML entities are decoded by DOMPurify
      expect(result).toContain('&lt;script&gt; is escaped')
    })
  })

  describe('useSanitizedHTML', () => {
    it('should sanitize HTML in hook', () => {
      const { result } = renderHook(() =>
        useSanitizedHTML('<p>Hello <script>alert("XSS")</script></p>')
      )

      expect(result.current).toBe('<p>Hello </p>')
      expect(result.current).not.toContain('<script>')
    })

    it('should memoize result with same input', () => {
      const { result, rerender } = renderHook(({ html }) => useSanitizedHTML(html), {
        initialProps: { html: '<p>Test</p>' },
      })

      const firstResult = result.current
      rerender({ html: '<p>Test</p>' })

      expect(result.current).toBe(firstResult)
    })

    it('should update when input changes', () => {
      const { result, rerender } = renderHook(({ html }) => useSanitizedHTML(html), {
        initialProps: { html: '<p>First</p>' },
      })

      expect(result.current).toContain('First')

      rerender({ html: '<p>Second</p>' })
      expect(result.current).toContain('Second')
    })

    it('should accept custom config', () => {
      const { result } = renderHook(() =>
        useSanitizedHTML('<div>Content</div><span>More</span>', { ALLOWED_TAGS: ['div'] })
      )

      expect(result.current).toContain('<div>')
      expect(result.current).not.toContain('<span>')
    })
  })
})
