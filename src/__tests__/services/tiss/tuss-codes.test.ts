/**
 * TUSS Codes Service Tests
 *
 * Tests for the TUSS codes lookup and search functionality.
 */

import { describe, it, expect } from 'vitest';
import {
  searchTussCodes,
  getTussCodeByCode,
  getTussCodesByGroup,
  getTussGroups,
  getConsultaCodes,
  getExamCodes,
  isValidTussCode,
  getTussCodeCount,
  TUSS_CODES,
} from '@/services/tiss/tuss-codes';

describe('TUSS Codes Service', () => {
  describe('TUSS_CODES database', () => {
    it('has a substantial number of codes', () => {
      expect(TUSS_CODES.length).toBeGreaterThan(50);
    });

    it('all codes have required fields', () => {
      TUSS_CODES.forEach((code) => {
        expect(code.codigo).toBeDefined();
        expect(code.codigo.length).toBeGreaterThanOrEqual(8);
        expect(code.descricao).toBeDefined();
        expect(code.descricao.length).toBeGreaterThan(0);
        expect(code.grupo).toBeDefined();
        expect(typeof code.ativo).toBe('boolean');
      });
    });

    it('all codes have valid vigencia format', () => {
      TUSS_CODES.forEach((code) => {
        expect(code.vigenciaInicio).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        if (code.vigenciaFim) {
          expect(code.vigenciaFim).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        }
      });
    });
  });

  describe('searchTussCodes', () => {
    it('returns empty array for short queries', () => {
      expect(searchTussCodes('')).toEqual([]);
      expect(searchTussCodes('a')).toEqual([]);
    });

    it('finds codes by exact code match', () => {
      const results = searchTussCodes('10101012');
      expect(results.length).toBe(1);
      expect(results[0].codigo).toBe('10101012');
    });

    it('finds codes by code prefix', () => {
      const results = searchTussCodes('10101');
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((r) => r.codigo.startsWith('10101'))).toBe(true);
    });

    it('finds codes by description', () => {
      const results = searchTussCodes('consulta');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((r) => r.descricao.toLowerCase().includes('consulta'))).toBe(true);
    });

    it('finds codes by group', () => {
      const results = searchTussCodes('exames');
      expect(results.length).toBeGreaterThan(0);
    });

    it('respects limit parameter', () => {
      const results = searchTussCodes('consulta', 3);
      expect(results.length).toBeLessThanOrEqual(3);
    });

    it('is case insensitive', () => {
      const lowerResults = searchTussCodes('hemograma');
      const upperResults = searchTussCodes('HEMOGRAMA');
      expect(lowerResults.length).toBe(upperResults.length);
    });

    it('only returns active codes', () => {
      const results = searchTussCodes('consulta');
      expect(results.every((r) => r.ativo)).toBe(true);
    });
  });

  describe('getTussCodeByCode', () => {
    it('returns code for valid code string', () => {
      const code = getTussCodeByCode('10101012');
      expect(code).not.toBeNull();
      expect(code?.codigo).toBe('10101012');
      expect(code?.descricao).toContain('Consulta');
    });

    it('returns null for non-existent code', () => {
      const code = getTussCodeByCode('00000000');
      expect(code).toBeNull();
    });

    it('returns null for empty string', () => {
      const code = getTussCodeByCode('');
      expect(code).toBeNull();
    });
  });

  describe('getTussCodesByGroup', () => {
    it('returns codes for valid group', () => {
      const codes = getTussCodesByGroup('Procedimentos clínicos');
      expect(codes.length).toBeGreaterThan(0);
      expect(codes.every((c) => c.grupo === 'Procedimentos clínicos')).toBe(true);
    });

    it('returns empty array for non-existent group', () => {
      const codes = getTussCodesByGroup('Non-existent group');
      expect(codes).toEqual([]);
    });
  });

  describe('getTussGroups', () => {
    it('returns all available groups', () => {
      const groups = getTussGroups();
      expect(groups.length).toBeGreaterThan(0);
      expect(groups).toContain('Procedimentos clínicos');
      expect(groups).toContain('Exames laboratoriais');
    });

    it('returns sorted groups', () => {
      const groups = getTussGroups();
      const sortedGroups = [...groups].sort();
      expect(groups).toEqual(sortedGroups);
    });
  });

  describe('getConsultaCodes', () => {
    it('returns consultation codes', () => {
      const codes = getConsultaCodes();
      expect(codes.length).toBeGreaterThan(0);
      expect(codes.every((c) => c.ativo)).toBe(true);
    });

    it('all returned codes are consultation-related', () => {
      const codes = getConsultaCodes();
      codes.forEach((code) => {
        expect(code.codigo.startsWith('10')).toBe(true);
      });
    });
  });

  describe('getExamCodes', () => {
    it('returns exam codes', () => {
      const codes = getExamCodes();
      expect(codes.length).toBeGreaterThan(0);
      expect(codes.every((c) => c.ativo)).toBe(true);
    });

    it('includes laboratory and imaging exams', () => {
      const codes = getExamCodes();
      const hasLabExams = codes.some((c) => c.grupo === 'Exames laboratoriais');
      const hasImageExams = codes.some((c) => c.grupo === 'Diagnóstico por imagem');
      expect(hasLabExams).toBe(true);
      expect(hasImageExams).toBe(true);
    });
  });

  describe('isValidTussCode', () => {
    it('returns true for valid active code', () => {
      expect(isValidTussCode('10101012')).toBe(true);
    });

    it('returns false for non-existent code', () => {
      expect(isValidTussCode('00000000')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isValidTussCode('')).toBe(false);
    });
  });

  describe('getTussCodeCount', () => {
    it('returns the total count of codes', () => {
      const count = getTussCodeCount();
      expect(count).toBe(TUSS_CODES.length);
      expect(count).toBeGreaterThan(0);
    });
  });
});
