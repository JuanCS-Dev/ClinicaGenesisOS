/**
 * XML Consulta Generator Tests
 *
 * Tests for the TISS Guia de Consulta XML generation.
 */

import { describe, it, expect } from 'vitest';
import {
  generateXmlConsulta,
  validateGuiaConsulta,
  generateGuiaConsultaElement,
} from '@/services/tiss/xml-consulta';
import type { GuiaConsulta } from '@/types';

// Sample valid GuiaConsulta
const validGuiaConsulta: GuiaConsulta = {
  registroANS: '123456',
  numeroGuiaPrestador: 'TEST-001',
  dadosBeneficiario: {
    numeroCarteira: '12345678901234567',
    nomeBeneficiario: 'Maria Silva',
    validadeCarteira: '2025-12-31',
  },
  contratadoSolicitante: {
    codigoPrestadorNaOperadora: 'PREST001',
    nomeContratado: 'Clínica Genesis',
    cnes: '1234567',
  },
  profissionalSolicitante: {
    conselhoProfissional: '1',
    numeroConselhoProfissional: '12345',
    uf: 'SP',
    nomeProfissional: 'Dr. João Silva',
    cbo: '225142',
  },
  tipoConsulta: '1',
  dataAtendimento: '2025-12-21',
  codigoTabela: '22',
  codigoProcedimento: '10101012',
  valorProcedimento: 150.00,
  indicacaoClinica: 'Avaliação clínica geral',
};

describe('XML Consulta Generator', () => {
  describe('generateXmlConsulta', () => {
    it('generates valid XML structure', () => {
      const xml = generateXmlConsulta(validGuiaConsulta);

      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('mensagemTISS');
      expect(xml).toContain('ans:cabecalho');
      expect(xml).toContain('ans:guiaConsulta');
      expect(xml).toContain('ans:epilogo');
    });

    it('includes registro ANS', () => {
      const xml = generateXmlConsulta(validGuiaConsulta);
      expect(xml).toContain('<ans:registroANS>123456</ans:registroANS>');
    });

    it('includes numero guia prestador', () => {
      const xml = generateXmlConsulta(validGuiaConsulta);
      expect(xml).toContain('<ans:numeroGuiaPrestador>TEST-001</ans:numeroGuiaPrestador>');
    });

    it('includes beneficiario data', () => {
      const xml = generateXmlConsulta(validGuiaConsulta);
      expect(xml).toContain('<ans:dadosBeneficiario>');
      expect(xml).toContain('<ans:numeroCarteira>12345678901234567</ans:numeroCarteira>');
      expect(xml).toContain('<ans:nomeBeneficiario>Maria Silva</ans:nomeBeneficiario>');
    });

    it('includes procedimento data', () => {
      const xml = generateXmlConsulta(validGuiaConsulta);
      expect(xml).toContain('<ans:codigoProcedimento>0010101012</ans:codigoProcedimento>');
      expect(xml).toContain('<ans:valorProcedimento>150.00</ans:valorProcedimento>');
    });

    it('includes tipo consulta', () => {
      const xml = generateXmlConsulta(validGuiaConsulta);
      expect(xml).toContain('<ans:tipoConsulta>1</ans:tipoConsulta>');
    });

    it('includes indicacao clinica when provided', () => {
      const xml = generateXmlConsulta(validGuiaConsulta);
      expect(xml).toContain('<ans:indicacaoClinica>Avaliação clínica geral</ans:indicacaoClinica>');
    });

    it('includes hash in epilogo', () => {
      const xml = generateXmlConsulta(validGuiaConsulta);
      expect(xml).toMatch(/<ans:hash>[A-F0-9]+<\/ans:hash>/);
    });

    it('includes TISS version', () => {
      const xml = generateXmlConsulta(validGuiaConsulta);
      expect(xml).toContain('<ans:versaoPadrao>4.02.00</ans:versaoPadrao>');
    });

    it('respects includeDeclaration option', () => {
      const withDecl = generateXmlConsulta(validGuiaConsulta, { includeDeclaration: true });
      const withoutDecl = generateXmlConsulta(validGuiaConsulta, { includeDeclaration: false });

      expect(withDecl).toContain('<?xml version');
      expect(withoutDecl).not.toContain('<?xml version');
    });

    it('escapes special XML characters', () => {
      const guiaWithSpecialChars: GuiaConsulta = {
        ...validGuiaConsulta,
        observacao: 'Test with <special> & "chars"',
      };

      const xml = generateXmlConsulta(guiaWithSpecialChars);
      expect(xml).toContain('&lt;special&gt;');
      expect(xml).toContain('&amp;');
      expect(xml).toContain('&quot;chars&quot;');
    });
  });

  describe('generateGuiaConsultaElement', () => {
    it('generates only the guiaConsulta element', () => {
      const element = generateGuiaConsultaElement(validGuiaConsulta);

      expect(element).toContain('<ans:guiaConsulta>');
      expect(element).toContain('</ans:guiaConsulta>');
      expect(element).not.toContain('mensagemTISS');
      expect(element).not.toContain('epilogo');
    });

    it('respects indent parameter', () => {
      const noIndent = generateGuiaConsultaElement(validGuiaConsulta, '');
      const withIndent = generateGuiaConsultaElement(validGuiaConsulta, '  ');

      expect(withIndent).toContain('  <ans:guiaConsulta>');
      expect(noIndent).toContain('<ans:guiaConsulta>');
    });
  });

  describe('validateGuiaConsulta', () => {
    it('returns empty array for valid guia', () => {
      const errors = validateGuiaConsulta(validGuiaConsulta);
      expect(errors).toEqual([]);
    });

    it('validates registro ANS length', () => {
      const invalidGuia = { ...validGuiaConsulta, registroANS: '123' };
      const errors = validateGuiaConsulta(invalidGuia);
      expect(errors).toContain('Registro ANS deve ter 6 dígitos');
    });

    it('validates numero guia prestador required', () => {
      const invalidGuia = { ...validGuiaConsulta, numeroGuiaPrestador: '' };
      const errors = validateGuiaConsulta(invalidGuia);
      expect(errors).toContain('Número da guia do prestador é obrigatório');
    });

    it('validates beneficiario numero carteira required', () => {
      const invalidGuia = {
        ...validGuiaConsulta,
        dadosBeneficiario: { ...validGuiaConsulta.dadosBeneficiario, numeroCarteira: '' },
      };
      const errors = validateGuiaConsulta(invalidGuia);
      expect(errors).toContain('Número da carteira do beneficiário é obrigatório');
    });

    it('validates beneficiario nome required', () => {
      const invalidGuia = {
        ...validGuiaConsulta,
        dadosBeneficiario: { ...validGuiaConsulta.dadosBeneficiario, nomeBeneficiario: '' },
      };
      const errors = validateGuiaConsulta(invalidGuia);
      expect(errors).toContain('Nome do beneficiário é obrigatório');
    });

    it('validates codigo prestador required', () => {
      const invalidGuia = {
        ...validGuiaConsulta,
        contratadoSolicitante: { ...validGuiaConsulta.contratadoSolicitante, codigoPrestadorNaOperadora: '' },
      };
      const errors = validateGuiaConsulta(invalidGuia);
      expect(errors).toContain('Código do prestador na operadora é obrigatório');
    });

    it('validates profissional data required', () => {
      const invalidGuia = {
        ...validGuiaConsulta,
        profissionalSolicitante: {
          conselhoProfissional: '' as '1',
          numeroConselhoProfissional: '',
          uf: '' as 'SP',
        },
      };
      const errors = validateGuiaConsulta(invalidGuia);
      expect(errors).toContain('Conselho profissional é obrigatório');
      expect(errors).toContain('Número no conselho profissional é obrigatório');
      expect(errors).toContain('UF do conselho profissional é obrigatório');
    });

    it('validates tipo consulta required', () => {
      const invalidGuia = { ...validGuiaConsulta, tipoConsulta: '' as '1' };
      const errors = validateGuiaConsulta(invalidGuia);
      expect(errors).toContain('Tipo de consulta é obrigatório');
    });

    it('validates data atendimento required', () => {
      const invalidGuia = { ...validGuiaConsulta, dataAtendimento: '' };
      const errors = validateGuiaConsulta(invalidGuia);
      expect(errors).toContain('Data do atendimento é obrigatória');
    });

    it('validates codigo procedimento required', () => {
      const invalidGuia = { ...validGuiaConsulta, codigoProcedimento: '' };
      const errors = validateGuiaConsulta(invalidGuia);
      expect(errors).toContain('Código do procedimento é obrigatório');
    });

    it('validates valor procedimento non-negative', () => {
      const invalidGuia = { ...validGuiaConsulta, valorProcedimento: -10 };
      const errors = validateGuiaConsulta(invalidGuia);
      expect(errors).toContain('Valor do procedimento deve ser maior ou igual a zero');
    });
  });
});
