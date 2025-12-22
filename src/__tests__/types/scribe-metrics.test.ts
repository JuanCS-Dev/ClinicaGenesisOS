/**
 * Scribe Metrics Types Tests
 * ==========================
 *
 * Unit tests for scribe metrics type utilities.
 * Fase 12: AI Scribe Enhancement
 */

import { describe, it, expect } from 'vitest';
import {
  calculateEditDistance,
  calculateChangePercentage,
  createFieldEdit,
  FEEDBACK_CATEGORY_LABELS,
  SOAP_FIELD_LABELS,
  type SOAPField,
  type FeedbackCategory,
} from '../../types/scribe-metrics';

describe('Scribe Metrics Types', () => {
  describe('calculateEditDistance', () => {
    it('returns 0 for identical strings', () => {
      expect(calculateEditDistance('hello', 'hello')).toBe(0);
    });

    it('returns length of b when a is empty', () => {
      expect(calculateEditDistance('', 'hello')).toBe(5);
    });

    it('returns length of a when b is empty', () => {
      expect(calculateEditDistance('hello', '')).toBe(5);
    });

    it('calculates single character substitution', () => {
      expect(calculateEditDistance('cat', 'bat')).toBe(1);
    });

    it('calculates single character insertion', () => {
      expect(calculateEditDistance('cat', 'cart')).toBe(1);
    });

    it('calculates single character deletion', () => {
      expect(calculateEditDistance('cart', 'cat')).toBe(1);
    });

    it('calculates multiple edits', () => {
      expect(calculateEditDistance('kitten', 'sitting')).toBe(3);
    });

    it('handles different length strings', () => {
      expect(calculateEditDistance('abc', 'abcdef')).toBe(3);
    });

    it('handles completely different strings', () => {
      expect(calculateEditDistance('abc', 'xyz')).toBe(3);
    });
  });

  describe('calculateChangePercentage', () => {
    it('returns 0 for identical strings', () => {
      expect(calculateChangePercentage('hello', 'hello')).toBe(0);
    });

    it('returns 0 for two empty strings', () => {
      expect(calculateChangePercentage('', '')).toBe(0);
    });

    it('returns 100 for empty original with non-empty edited', () => {
      expect(calculateChangePercentage('', 'hello')).toBe(100);
    });

    it('calculates small change percentage', () => {
      const pct = calculateChangePercentage('hello', 'hallo');
      expect(pct).toBeGreaterThan(0);
      expect(pct).toBeLessThan(50);
    });

    it('calculates larger change percentage', () => {
      const pct = calculateChangePercentage('abc', 'xyz');
      expect(pct).toBe(100);
    });

    it('caps at 100%', () => {
      const pct = calculateChangePercentage('a', 'abcdefghij');
      expect(pct).toBeLessThanOrEqual(100);
    });
  });

  describe('createFieldEdit', () => {
    it('creates field edit with correct structure', () => {
      const edit = createFieldEdit('subjective', 'Original text', 'Edited text');

      expect(edit.field).toBe('subjective');
      expect(edit.original).toBe('Original text');
      expect(edit.edited).toBe('Edited text');
      expect(edit.editDistance).toBeGreaterThan(0);
      expect(edit.changePercentage).toBeGreaterThan(0);
    });

    it('creates field edit for identical content', () => {
      const edit = createFieldEdit('objective', 'Same text', 'Same text');

      expect(edit.editDistance).toBe(0);
      expect(edit.changePercentage).toBe(0);
    });

    it('works for all SOAP fields', () => {
      const fields: SOAPField[] = ['subjective', 'objective', 'assessment', 'plan'];

      fields.forEach((field) => {
        const edit = createFieldEdit(field, 'a', 'b');
        expect(edit.field).toBe(field);
      });
    });
  });

  describe('FEEDBACK_CATEGORY_LABELS', () => {
    it('has label for accuracy', () => {
      expect(FEEDBACK_CATEGORY_LABELS.accuracy).toBe('Precisão');
    });

    it('has label for hallucination', () => {
      expect(FEEDBACK_CATEGORY_LABELS.hallucination).toBe('Informação Inventada');
    });

    it('has all categories defined', () => {
      const categories: FeedbackCategory[] = [
        'accuracy',
        'completeness',
        'relevance',
        'formatting',
        'clinical_accuracy',
        'time_saved',
        'hallucination',
        'missing_info',
        'other',
      ];

      categories.forEach((category) => {
        expect(FEEDBACK_CATEGORY_LABELS[category]).toBeDefined();
        expect(typeof FEEDBACK_CATEGORY_LABELS[category]).toBe('string');
      });
    });
  });

  describe('SOAP_FIELD_LABELS', () => {
    it('has label for subjective', () => {
      expect(SOAP_FIELD_LABELS.subjective).toBe('Subjetivo');
    });

    it('has label for objective', () => {
      expect(SOAP_FIELD_LABELS.objective).toBe('Objetivo');
    });

    it('has label for assessment', () => {
      expect(SOAP_FIELD_LABELS.assessment).toBe('Avaliação');
    });

    it('has label for plan', () => {
      expect(SOAP_FIELD_LABELS.plan).toBe('Plano');
    });

    it('has all fields defined', () => {
      const fields: SOAPField[] = ['subjective', 'objective', 'assessment', 'plan'];

      fields.forEach((field) => {
        expect(SOAP_FIELD_LABELS[field]).toBeDefined();
        expect(typeof SOAP_FIELD_LABELS[field]).toBe('string');
      });
    });
  });
});

