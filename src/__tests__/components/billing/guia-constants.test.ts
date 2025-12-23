/**
 * Tests for guia-constants.ts
 */

import { describe, it, expect } from 'vitest';
import {
  STATUS_CONFIG,
  TIPO_GUIA_LABELS,
  formatDate,
  formatDateTime,
  formatCurrency,
} from '@/components/billing/guia-constants';
import type { StatusGuia, TipoGuia } from '@/types';

describe('guia-constants', () => {
  describe('STATUS_CONFIG', () => {
    const statusKeys: StatusGuia[] = [
      'rascunho',
      'enviada',
      'em_analise',
      'autorizada',
      'glosada_parcial',
      'glosada_total',
      'paga',
      'recurso',
    ];

    it('should have config for all status types', () => {
      statusKeys.forEach((status) => {
        expect(STATUS_CONFIG[status]).toBeDefined();
      });
    });

    it('should have label for each status', () => {
      statusKeys.forEach((status) => {
        expect(STATUS_CONFIG[status].label).toBeTruthy();
        expect(typeof STATUS_CONFIG[status].label).toBe('string');
      });
    });

    it('should have color classes for each status', () => {
      statusKeys.forEach((status) => {
        expect(STATUS_CONFIG[status].color).toContain('text-');
        expect(STATUS_CONFIG[status].bgColor).toContain('bg-');
      });
    });

    it('should have icon for each status', () => {
      statusKeys.forEach((status) => {
        expect(STATUS_CONFIG[status].icon).toBeDefined();
        // Lucide icons are ForwardRef components (objects with $$typeof)
        expect(STATUS_CONFIG[status].icon).toBeTruthy();
      });
    });

    it('should have correct labels in Portuguese', () => {
      expect(STATUS_CONFIG.rascunho.label).toBe('Rascunho');
      expect(STATUS_CONFIG.enviada.label).toBe('Enviada');
      expect(STATUS_CONFIG.em_analise.label).toBe('Em Análise');
      expect(STATUS_CONFIG.autorizada.label).toBe('Autorizada');
      expect(STATUS_CONFIG.glosada_parcial.label).toBe('Glosa Parcial');
      expect(STATUS_CONFIG.glosada_total.label).toBe('Glosa Total');
      expect(STATUS_CONFIG.paga.label).toBe('Paga');
      expect(STATUS_CONFIG.recurso.label).toBe('Em Recurso');
    });
  });

  describe('TIPO_GUIA_LABELS', () => {
    const tipoKeys: TipoGuia[] = ['consulta', 'sadt', 'internacao', 'honorarios', 'anexo'];

    it('should have labels for all guia types', () => {
      tipoKeys.forEach((tipo) => {
        expect(TIPO_GUIA_LABELS[tipo]).toBeDefined();
        expect(typeof TIPO_GUIA_LABELS[tipo]).toBe('string');
      });
    });

    it('should have correct labels in Portuguese', () => {
      expect(TIPO_GUIA_LABELS.consulta).toBe('Consulta');
      expect(TIPO_GUIA_LABELS.sadt).toBe('SP/SADT');
      expect(TIPO_GUIA_LABELS.internacao).toBe('Internação');
      expect(TIPO_GUIA_LABELS.honorarios).toBe('Honorários');
      expect(TIPO_GUIA_LABELS.anexo).toBe('Anexo');
    });
  });

  describe('formatDate', () => {
    it('should format valid date string in DD/MM/YYYY format', () => {
      const result = formatDate('2024-01-15');
      // Format should be DD/MM/YYYY (may vary by 1 day due to timezone)
      expect(result).toMatch(/^\d{2}\/01\/2024$/);
    });

    it('should format ISO date string correctly', () => {
      const result = formatDate('2024-12-25T10:30:00Z');
      // The day might vary by timezone, so just check format
      expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });

    it('should handle invalid date gracefully', () => {
      const result = formatDate('invalid-date');
      // The function doesn't throw, returns 'Invalid Date' string
      expect(typeof result).toBe('string');
    });

    it('should handle empty string gracefully', () => {
      const result = formatDate('');
      // Empty string creates invalid date
      expect(typeof result).toBe('string');
    });
  });

  describe('formatDateTime', () => {
    it('should format date with time correctly', () => {
      const result = formatDateTime('2024-01-15T14:30:00');
      // Format varies by locale, but should contain date and time
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
      expect(result).toMatch(/\d{2}:\d{2}/);
    });

    it('should handle invalid date gracefully', () => {
      const result = formatDateTime('not-a-date');
      // Returns 'Invalid Date' string for invalid input
      expect(typeof result).toBe('string');
    });
  });

  describe('formatCurrency', () => {
    it('should format positive values as BRL', () => {
      const result = formatCurrency(1234.56);
      expect(result).toContain('R$');
      expect(result).toContain('1.234,56');
    });

    it('should format zero correctly', () => {
      const result = formatCurrency(0);
      expect(result).toContain('R$');
      expect(result).toContain('0,00');
    });

    it('should format negative values', () => {
      const result = formatCurrency(-500.75);
      expect(result).toContain('R$');
      expect(result).toContain('500,75');
    });

    it('should format large values with thousands separator', () => {
      const result = formatCurrency(1234567.89);
      expect(result).toContain('1.234.567,89');
    });

    it('should handle decimal precision', () => {
      const result = formatCurrency(99.9);
      expect(result).toContain('99,90');
    });
  });
});
