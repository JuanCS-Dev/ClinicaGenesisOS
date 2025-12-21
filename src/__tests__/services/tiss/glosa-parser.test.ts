/**
 * Glosa Parser Tests
 *
 * Tests for parsing glosa (denial) responses from health insurance operators.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  parseGlosaXml,
  parseGlosaResponse,
  getGlosaDescription,
  calculateGlosaStats,
  isWithinAppealDeadline,
  getDaysToAppealDeadline,
} from '@/services/tiss/glosa-parser';
import type { Glosa } from '@/types';

describe('Glosa Parser', () => {
  describe('parseGlosaXml', () => {
    it('parses basic glosa XML', () => {
      const xml = `
        <ans:mensagemTISS>
          <ans:guiaConsulta>
            <ans:numeroGuiaPrestador>TEST-001</ans:numeroGuiaPrestador>
            <ans:valorInformado>150.00</ans:valorInformado>
            <ans:valorGlosado>50.00</ans:valorGlosado>
            <ans:itemGlosado>
              <ans:codigoProcedimento>10101012</ans:codigoProcedimento>
              <ans:descricaoProcedimento>Consulta</ans:descricaoProcedimento>
              <ans:valorGlosa>50.00</ans:valorGlosa>
              <ans:codigoGlosa>A2</ans:codigoGlosa>
              <ans:descricaoGlosa>Procedimento não coberto</ans:descricaoGlosa>
            </ans:itemGlosado>
          </ans:guiaConsulta>
        </ans:mensagemTISS>
      `;

      const result = parseGlosaXml(xml);

      expect(result.numeroGuiaPrestador).toBe('TEST-001');
      expect(result.tipoGuia).toBe('consulta');
      expect(result.valorOriginal).toBe(150);
      expect(result.valorGlosado).toBe(50);
      expect(result.valorAprovado).toBe(100);
      expect(result.itensGlosados.length).toBe(1);
      expect(result.itensGlosados[0].codigoGlosa).toBe('A2');
      expect(result.status).toBe('pendente');
    });

    it('detects guide type from XML', () => {
      const consultaXml = '<guiaConsulta></guiaConsulta>';
      const sadtXml = '<guiaSP-SADT></guiaSP-SADT>';

      const consultaResult = parseGlosaXml(consultaXml);
      const sadtResult = parseGlosaXml(sadtXml);

      expect(consultaResult.tipoGuia).toBe('consulta');
      expect(sadtResult.tipoGuia).toBe('sadt');
    });

    it('handles multiple glosa items', () => {
      const xml = `
        <ans:mensagemTISS>
          <ans:guiaSP-SADT>
            <ans:numeroGuiaPrestador>TEST-002</ans:numeroGuiaPrestador>
            <ans:valorInformado>300.00</ans:valorInformado>
            <ans:valorGlosado>100.00</ans:valorGlosado>
            <ans:itemGlosado>
              <ans:codigoProcedimento>40301117</ans:codigoProcedimento>
              <ans:valorGlosa>50.00</ans:valorGlosa>
              <ans:codigoGlosa>A1</ans:codigoGlosa>
            </ans:itemGlosado>
            <ans:itemGlosado>
              <ans:codigoProcedimento>40302016</ans:codigoProcedimento>
              <ans:valorGlosa>50.00</ans:valorGlosa>
              <ans:codigoGlosa>B2</ans:codigoGlosa>
            </ans:itemGlosado>
          </ans:guiaSP-SADT>
        </ans:mensagemTISS>
      `;

      const result = parseGlosaXml(xml);

      expect(result.itensGlosados.length).toBe(2);
      expect(result.itensGlosados[0].sequencialItem).toBe(1);
      expect(result.itensGlosados[1].sequencialItem).toBe(2);
    });

    it('calculates appeal deadline (30 days from receipt)', () => {
      const xml = `
        <dataRecebimento>2025-12-21</dataRecebimento>
        <numeroGuiaPrestador>TEST-003</numeroGuiaPrestador>
      `;

      const result = parseGlosaXml(xml);

      // Should be 30 days after 2025-12-21
      expect(result.prazoRecurso).toBe('2026-01-20');
    });

    it('creates generic item when no items but value exists', () => {
      const xml = `
        <numeroGuiaPrestador>TEST-004</numeroGuiaPrestador>
        <valorInformado>100.00</valorInformado>
        <valorGlosado>25.00</valorGlosado>
        <codigoGlosa>A7</codigoGlosa>
      `;

      const result = parseGlosaXml(xml);

      expect(result.itensGlosados.length).toBe(1);
      expect(result.itensGlosados[0].valorGlosado).toBe(25);
      expect(result.itensGlosados[0].codigoGlosa).toBe('A7');
    });
  });

  describe('parseGlosaResponse', () => {
    it('parses structured glosa data', () => {
      const data = {
        numeroGuiaPrestador: 'TEST-005',
        tipoGuia: 'consulta' as const,
        valorOriginal: 200,
        valorGlosado: 75,
        itens: [
          {
            codigoProcedimento: '10101012',
            descricao: 'Consulta',
            valor: 75,
            motivo: 'A3' as const,
          },
        ],
        observacao: 'Procedimento já realizado',
      };

      const result = parseGlosaResponse(data);

      expect(result.numeroGuiaPrestador).toBe('TEST-005');
      expect(result.valorOriginal).toBe(200);
      expect(result.valorGlosado).toBe(75);
      expect(result.valorAprovado).toBe(125);
      expect(result.itensGlosados.length).toBe(1);
      expect(result.itensGlosados[0].codigoGlosa).toBe('A3');
      expect(result.observacaoOperadora).toBe('Procedimento já realizado');
    });

    it('defaults tipoGuia to consulta', () => {
      const data = {
        numeroGuiaPrestador: 'TEST-006',
        valorOriginal: 100,
        valorGlosado: 50,
      };

      const result = parseGlosaResponse(data);
      expect(result.tipoGuia).toBe('consulta');
    });

    it('creates generic item when no items provided', () => {
      const data = {
        numeroGuiaPrestador: 'TEST-007',
        valorOriginal: 100,
        valorGlosado: 30,
      };

      const result = parseGlosaResponse(data);

      expect(result.itensGlosados.length).toBe(1);
      expect(result.itensGlosados[0].codigoGlosa).toBe('outros');
    });
  });

  describe('getGlosaDescription', () => {
    it('returns description and recommendation for known codes', () => {
      const a1 = getGlosaDescription('A1');
      expect(a1.description).toBe('Guia não preenchida corretamente');
      expect(a1.recommendation).toContain('Revise');

      const a2 = getGlosaDescription('A2');
      expect(a2.description).toBe('Procedimento não coberto pelo plano');
      expect(a2.recommendation).toContain('cobertura');
    });

    it('returns generic description for outros code', () => {
      const outros = getGlosaDescription('outros');
      expect(outros.description).toBe('Outro motivo');
      expect(outros.recommendation).toContain('operadora');
    });
  });

  describe('calculateGlosaStats', () => {
    const sampleGlosas: Glosa[] = [
      {
        id: 'glosa-1',
        numeroGuiaPrestador: 'TEST-001',
        tipoGuia: 'consulta',
        dataRecebimento: '2025-12-20',
        valorOriginal: 100,
        valorGlosado: 30,
        valorAprovado: 70,
        itensGlosados: [
          {
            sequencialItem: 1,
            codigoProcedimento: '10101012',
            descricaoProcedimento: 'Consulta',
            valorGlosado: 30,
            codigoGlosa: 'A1',
            descricaoGlosa: 'Guia não preenchida',
          },
        ],
        prazoRecurso: '2026-01-19',
        status: 'pendente',
        createdAt: '2025-12-20T10:00:00Z',
        updatedAt: '2025-12-20T10:00:00Z',
      },
      {
        id: 'glosa-2',
        numeroGuiaPrestador: 'TEST-002',
        tipoGuia: 'sadt',
        dataRecebimento: '2025-12-21',
        valorOriginal: 200,
        valorGlosado: 50,
        valorAprovado: 150,
        itensGlosados: [
          {
            sequencialItem: 1,
            codigoProcedimento: '40301117',
            descricaoProcedimento: 'Hemograma',
            valorGlosado: 50,
            codigoGlosa: 'A1',
            descricaoGlosa: 'Guia não preenchida',
          },
        ],
        prazoRecurso: '2026-01-20',
        status: 'resolvida',
        createdAt: '2025-12-21T10:00:00Z',
        updatedAt: '2025-12-21T10:00:00Z',
      },
    ];

    it('calculates total glosas', () => {
      const stats = calculateGlosaStats(sampleGlosas);
      expect(stats.totalGlosas).toBe(2);
    });

    it('calculates total value glosado', () => {
      const stats = calculateGlosaStats(sampleGlosas);
      expect(stats.valorTotal).toBe(80);
    });

    it('calculates recovered value for resolved glosas', () => {
      const stats = calculateGlosaStats(sampleGlosas);
      expect(stats.valorRecuperado).toBe(150); // valorAprovado of resolved glosa
    });

    it('groups by motivo', () => {
      const stats = calculateGlosaStats(sampleGlosas);
      expect(stats.principaisMotivos.length).toBe(1);
      expect(stats.principaisMotivos[0].motivo).toBe('A1');
      expect(stats.principaisMotivos[0].quantidade).toBe(2);
      expect(stats.principaisMotivos[0].valor).toBe(80);
    });
  });

  describe('isWithinAppealDeadline', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns true when within deadline', () => {
      vi.setSystemTime(new Date('2025-12-21'));

      const glosa: Glosa = {
        id: 'test',
        numeroGuiaPrestador: 'TEST',
        tipoGuia: 'consulta',
        dataRecebimento: '2025-12-20',
        valorOriginal: 100,
        valorGlosado: 50,
        valorAprovado: 50,
        itensGlosados: [],
        prazoRecurso: '2026-01-20', // 30 days ahead
        status: 'pendente',
        createdAt: '2025-12-20T10:00:00Z',
        updatedAt: '2025-12-20T10:00:00Z',
      };

      expect(isWithinAppealDeadline(glosa)).toBe(true);
    });

    it('returns false when past deadline', () => {
      vi.setSystemTime(new Date('2026-02-01'));

      const glosa: Glosa = {
        id: 'test',
        numeroGuiaPrestador: 'TEST',
        tipoGuia: 'consulta',
        dataRecebimento: '2025-12-20',
        valorOriginal: 100,
        valorGlosado: 50,
        valorAprovado: 50,
        itensGlosados: [],
        prazoRecurso: '2026-01-20',
        status: 'pendente',
        createdAt: '2025-12-20T10:00:00Z',
        updatedAt: '2025-12-20T10:00:00Z',
      };

      expect(isWithinAppealDeadline(glosa)).toBe(false);
    });
  });

  describe('getDaysToAppealDeadline', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns correct number of days', () => {
      vi.setSystemTime(new Date('2025-12-21'));

      const glosa: Glosa = {
        id: 'test',
        numeroGuiaPrestador: 'TEST',
        tipoGuia: 'consulta',
        dataRecebimento: '2025-12-20',
        valorOriginal: 100,
        valorGlosado: 50,
        valorAprovado: 50,
        itensGlosados: [],
        prazoRecurso: '2025-12-31',
        status: 'pendente',
        createdAt: '2025-12-20T10:00:00Z',
        updatedAt: '2025-12-20T10:00:00Z',
      };

      expect(getDaysToAppealDeadline(glosa)).toBe(10);
    });

    it('returns negative days when past deadline', () => {
      vi.setSystemTime(new Date('2026-01-05'));

      const glosa: Glosa = {
        id: 'test',
        numeroGuiaPrestador: 'TEST',
        tipoGuia: 'consulta',
        dataRecebimento: '2025-12-20',
        valorOriginal: 100,
        valorGlosado: 50,
        valorAprovado: 50,
        itensGlosados: [],
        prazoRecurso: '2025-12-31',
        status: 'pendente',
        createdAt: '2025-12-20T10:00:00Z',
        updatedAt: '2025-12-20T10:00:00Z',
      };

      expect(getDaysToAppealDeadline(glosa)).toBeLessThan(0);
    });
  });
});
