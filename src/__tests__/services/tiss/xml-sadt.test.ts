/**
 * XML SADT Generator Tests
 *
 * Tests for the TISS Guia SP/SADT XML generation.
 */

import { describe, it, expect } from 'vitest';
import {
  generateXmlSADT,
  validateGuiaSADT,
  generateGuiaSADTElement,
  calculateSADTTotals,
} from '@/services/tiss/xml-sadt';
import type { GuiaSADT, ProcedimentoRealizado, TipoTabela } from '@/types';

// Sample valid GuiaSADT
const validGuiaSADT: GuiaSADT = {
  registroANS: '123456',
  numeroGuiaPrestador: 'TEST-SADT-001',
  dadosBeneficiario: {
    numeroCarteira: '12345678901234567',
    nomeBeneficiario: 'João Silva',
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
    nomeProfissional: 'Dr. Maria Santos',
    cbo: '225142',
  },
  contratadoExecutante: {
    codigoPrestadorNaOperadora: 'PREST002',
    nomeContratado: 'Laboratório Central',
    cnes: '7654321',
  },
  profissionalExecutante: {
    conselhoProfissional: '1',
    numeroConselhoProfissional: '54321',
    uf: 'SP',
    nomeProfissional: 'Dr. Pedro Lima',
    cbo: '225265',
  },
  caraterAtendimento: '1',
  dataSolicitacao: '2025-12-21',
  indicacaoClinica: 'Investigação diagnóstica - fadiga crônica',
  procedimentosRealizados: [
    {
      dataRealizacao: '2025-12-21',
      codigoTabela: '22' as TipoTabela,
      codigoProcedimento: '40301117',
      descricaoProcedimento: 'Hemograma completo',
      quantidadeRealizada: 1,
      valorUnitario: 25.00,
      valorTotal: 25.00,
    },
    {
      dataRealizacao: '2025-12-21',
      horaInicial: '08:30',
      horaFinal: '08:35',
      codigoTabela: '22' as TipoTabela,
      codigoProcedimento: '40302016',
      descricaoProcedimento: 'Glicemia de jejum',
      quantidadeRealizada: 1,
      valorUnitario: 15.00,
      valorTotal: 15.00,
    },
  ],
  valorTotalProcedimentos: 40.00,
  valorTotalGeral: 40.00,
};

describe('XML SADT Generator', () => {
  describe('generateXmlSADT', () => {
    it('generates valid XML structure', async () => {
      const xml = await generateXmlSADT(validGuiaSADT);

      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('mensagemTISS');
      expect(xml).toContain('ans:cabecalho');
      expect(xml).toContain('ans:guiaSP-SADT');
      expect(xml).toContain('ans:epilogo');
    });

    it('includes registro ANS', async () => {
      const xml = await generateXmlSADT(validGuiaSADT);
      expect(xml).toContain('<ans:registroANS>123456</ans:registroANS>');
    });

    it('includes numero guia prestador', async () => {
      const xml = await generateXmlSADT(validGuiaSADT);
      expect(xml).toContain('<ans:numeroGuiaPrestador>TEST-SADT-001</ans:numeroGuiaPrestador>');
    });

    it('includes beneficiario data', async () => {
      const xml = await generateXmlSADT(validGuiaSADT);
      expect(xml).toContain('<ans:dadosBeneficiario>');
      expect(xml).toContain('<ans:numeroCarteira>12345678901234567</ans:numeroCarteira>');
      expect(xml).toContain('<ans:nomeBeneficiario>João Silva</ans:nomeBeneficiario>');
    });

    it('includes solicitante data', async () => {
      const xml = await generateXmlSADT(validGuiaSADT);
      expect(xml).toContain('<ans:dadosSolicitante>');
      expect(xml).toContain('<ans:contratadoSolicitante>');
      expect(xml).toContain('<ans:profissionalSolicitante>');
    });

    it('includes executante data', async () => {
      const xml = await generateXmlSADT(validGuiaSADT);
      expect(xml).toContain('<ans:dadosExecutante>');
      expect(xml).toContain('<ans:contratadoExecutante>');
      expect(xml).toContain('<ans:profissionalExecutante>');
    });

    it('includes procedimentos realizados', async () => {
      const xml = await generateXmlSADT(validGuiaSADT);
      expect(xml).toContain('<ans:procedimentosRealizados>');
      expect(xml).toContain('<ans:codigoProcedimento>0040301117</ans:codigoProcedimento>');
      expect(xml).toContain('<ans:descricaoProcedimento>Hemograma completo</ans:descricaoProcedimento>');
    });

    it('includes valor total', async () => {
      const xml = await generateXmlSADT(validGuiaSADT);
      expect(xml).toContain('<ans:valorTotal>');
      expect(xml).toContain('<ans:valorProcedimentos>40.00</ans:valorProcedimentos>');
      expect(xml).toContain('<ans:valorTotalGeral>40.00</ans:valorTotalGeral>');
    });

    it('includes indicacao clinica', async () => {
      const xml = await generateXmlSADT(validGuiaSADT);
      expect(xml).toContain('<ans:indicacaoClinica>Investigação diagnóstica - fadiga crônica</ans:indicacaoClinica>');
    });

    it('includes hash in epilogo', async () => {
      const xml = await generateXmlSADT(validGuiaSADT);
      expect(xml).toMatch(/<ans:hash>[A-F0-9]+<\/ans:hash>/);
    });

    it('includes TISS version', async () => {
      const xml = await generateXmlSADT(validGuiaSADT);
      expect(xml).toContain('<ans:versaoPadrao>4.02.00</ans:versaoPadrao>');
    });

    it('respects includeDeclaration option', async () => {
      const withDecl = await generateXmlSADT(validGuiaSADT, { includeDeclaration: true });
      const withoutDecl = await generateXmlSADT(validGuiaSADT, { includeDeclaration: false });

      expect(withDecl).toContain('<?xml version');
      expect(withoutDecl).not.toContain('<?xml version');
    });

    it('escapes special XML characters in observacao', async () => {
      const guiaWithObs: GuiaSADT = {
        ...validGuiaSADT,
        observacao: 'Test with <special> & "chars"',
      };

      const xml = await generateXmlSADT(guiaWithObs);
      expect(xml).toContain('&lt;special&gt;');
      expect(xml).toContain('&amp;');
      expect(xml).toContain('&quot;chars&quot;');
    });

    it('includes optional fields when provided', async () => {
      const guiaWithOptional: GuiaSADT = {
        ...validGuiaSADT,
        numeroGuiaPrincipal: 'MAIN-001',
        dataAutorizacao: '2025-12-20',
        senha: 'ABC123',
        dataValidadeSenha: '2025-12-31',
        numeroGuiaOperadora: 'OP-001',
        observacao: 'Teste de observação',
        valorTotalTaxas: 5.00,
        valorTotalMateriais: 10.00,
        valorTotalMedicamentos: 15.00,
        valorTotalOPME: 20.00,
      };

      const xml = await generateXmlSADT(guiaWithOptional);
      expect(xml).toContain('<ans:numeroGuiaPrincipal>MAIN-001</ans:numeroGuiaPrincipal>');
      expect(xml).toContain('<ans:senha>ABC123</ans:senha>');
      expect(xml).toContain('<ans:valorTaxasAlugueis>5.00</ans:valorTaxasAlugueis>');
      expect(xml).toContain('<ans:valorMateriais>10.00</ans:valorMateriais>');
      expect(xml).toContain('<ans:valorMedicamentos>15.00</ans:valorMedicamentos>');
      expect(xml).toContain('<ans:valorOPME>20.00</ans:valorOPME>');
    });

    it('formats time correctly in procedimentos', async () => {
      const xml = await generateXmlSADT(validGuiaSADT);
      expect(xml).toContain('<ans:horaInicial>08:30</ans:horaInicial>');
      expect(xml).toContain('<ans:horaFinal>08:35</ans:horaFinal>');
    });

    it('includes viaAcesso and tecnicaUtilizada when provided', async () => {
      const guiaWithVia: GuiaSADT = {
        ...validGuiaSADT,
        procedimentosRealizados: [
          {
            ...validGuiaSADT.procedimentosRealizados[0],
            viaAcesso: '1' as const,
            tecnicaUtilizada: '2' as const,
          },
        ],
      };

      const xml = await generateXmlSADT(guiaWithVia);
      expect(xml).toContain('<ans:viaAcesso>1</ans:viaAcesso>');
      expect(xml).toContain('<ans:tecnicaUtilizada>2</ans:tecnicaUtilizada>');
    });
  });

  describe('generateGuiaSADTElement', () => {
    it('generates only the guiaSP-SADT element', () => {
      const element = generateGuiaSADTElement(validGuiaSADT);

      expect(element).toContain('<ans:guiaSP-SADT>');
      expect(element).toContain('</ans:guiaSP-SADT>');
      expect(element).not.toContain('mensagemTISS');
      expect(element).not.toContain('epilogo');
    });

    it('respects indent parameter', () => {
      const noIndent = generateGuiaSADTElement(validGuiaSADT, '');
      const withIndent = generateGuiaSADTElement(validGuiaSADT, '  ');

      expect(withIndent).toContain('  <ans:guiaSP-SADT>');
      expect(noIndent).toContain('<ans:guiaSP-SADT>');
    });

    it('includes observacao when provided', () => {
      const guiaWithObs: GuiaSADT = {
        ...validGuiaSADT,
        observacao: 'Nota importante',
      };

      const element = generateGuiaSADTElement(guiaWithObs);
      expect(element).toContain('<ans:observacao>Nota importante</ans:observacao>');
    });
  });

  describe('validateGuiaSADT', () => {
    it('returns empty array for valid guia', () => {
      const errors = validateGuiaSADT(validGuiaSADT);
      expect(errors).toEqual([]);
    });

    it('validates registro ANS length', () => {
      const invalidGuia = { ...validGuiaSADT, registroANS: '123' };
      const errors = validateGuiaSADT(invalidGuia);
      expect(errors).toContain('Registro ANS deve ter 6 dígitos');
    });

    it('validates numero guia prestador required', () => {
      const invalidGuia = { ...validGuiaSADT, numeroGuiaPrestador: '' };
      const errors = validateGuiaSADT(invalidGuia);
      expect(errors).toContain('Número da guia do prestador é obrigatório');
    });

    it('validates beneficiario numero carteira required', () => {
      const invalidGuia = {
        ...validGuiaSADT,
        dadosBeneficiario: { ...validGuiaSADT.dadosBeneficiario, numeroCarteira: '' },
      };
      const errors = validateGuiaSADT(invalidGuia);
      expect(errors).toContain('Número da carteira do beneficiário é obrigatório');
    });

    it('validates beneficiario nome required', () => {
      const invalidGuia = {
        ...validGuiaSADT,
        dadosBeneficiario: { ...validGuiaSADT.dadosBeneficiario, nomeBeneficiario: '' },
      };
      const errors = validateGuiaSADT(invalidGuia);
      expect(errors).toContain('Nome do beneficiário é obrigatório');
    });

    it('validates contratado solicitante required', () => {
      const invalidGuia = {
        ...validGuiaSADT,
        contratadoSolicitante: { ...validGuiaSADT.contratadoSolicitante, codigoPrestadorNaOperadora: '' },
      };
      const errors = validateGuiaSADT(invalidGuia);
      expect(errors).toContain('Código do prestador solicitante é obrigatório');
    });

    it('validates profissional solicitante required', () => {
      const invalidGuia = {
        ...validGuiaSADT,
        profissionalSolicitante: {
          conselhoProfissional: '' as '1',
          numeroConselhoProfissional: '',
          uf: '' as 'SP',
        },
      };
      const errors = validateGuiaSADT(invalidGuia);
      expect(errors).toContain('Conselho profissional do solicitante é obrigatório');
      expect(errors).toContain('Número no conselho do solicitante é obrigatório');
    });

    it('validates contratado executante required', () => {
      const invalidGuia = {
        ...validGuiaSADT,
        contratadoExecutante: { ...validGuiaSADT.contratadoExecutante, codigoPrestadorNaOperadora: '' },
      };
      const errors = validateGuiaSADT(invalidGuia);
      expect(errors).toContain('Código do prestador executante é obrigatório');
    });

    it('validates profissional executante required', () => {
      const invalidGuia = {
        ...validGuiaSADT,
        profissionalExecutante: {
          conselhoProfissional: '' as '1',
          numeroConselhoProfissional: '',
          uf: '' as 'SP',
        },
      };
      const errors = validateGuiaSADT(invalidGuia);
      expect(errors).toContain('Conselho profissional do executante é obrigatório');
      expect(errors).toContain('Número no conselho do executante é obrigatório');
    });

    it('validates carater atendimento required', () => {
      const invalidGuia = { ...validGuiaSADT, caraterAtendimento: '' as '1' };
      const errors = validateGuiaSADT(invalidGuia);
      expect(errors).toContain('Caráter do atendimento é obrigatório');
    });

    it('validates data solicitacao required', () => {
      const invalidGuia = { ...validGuiaSADT, dataSolicitacao: '' };
      const errors = validateGuiaSADT(invalidGuia);
      expect(errors).toContain('Data da solicitação é obrigatória');
    });

    it('validates indicacao clinica required', () => {
      const invalidGuia = { ...validGuiaSADT, indicacaoClinica: '' };
      const errors = validateGuiaSADT(invalidGuia);
      expect(errors).toContain('Indicação clínica é obrigatória');
    });

    it('validates procedimentos required', () => {
      const invalidGuia = { ...validGuiaSADT, procedimentosRealizados: [] };
      const errors = validateGuiaSADT(invalidGuia);
      expect(errors).toContain('Pelo menos um procedimento é obrigatório');
    });

    it('validates procedimento fields', () => {
      const invalidGuia = {
        ...validGuiaSADT,
        procedimentosRealizados: [
          {
            dataRealizacao: '',
            codigoTabela: '22' as TipoTabela,
            codigoProcedimento: '',
            descricaoProcedimento: '',
            quantidadeRealizada: 0,
            valorUnitario: -10,
            valorTotal: -10,
          },
        ],
      };
      const errors = validateGuiaSADT(invalidGuia);
      expect(errors).toContain('Procedimento 1: data de realização é obrigatória');
      expect(errors).toContain('Procedimento 1: código do procedimento é obrigatório');
      expect(errors).toContain('Procedimento 1: descrição é obrigatória');
      expect(errors).toContain('Procedimento 1: quantidade deve ser maior que zero');
      expect(errors).toContain('Procedimento 1: valor unitário não pode ser negativo');
    });

    it('validates valor total geral', () => {
      const invalidGuia = { ...validGuiaSADT, valorTotalGeral: -100 };
      const errors = validateGuiaSADT(invalidGuia);
      expect(errors).toContain('Valor total geral é obrigatório e não pode ser negativo');
    });
  });

  describe('calculateSADTTotals', () => {
    it('calculates total from procedures', () => {
      const procedimentos: ProcedimentoRealizado[] = [
        {
          dataRealizacao: '2025-12-21',
          codigoTabela: '22' as TipoTabela,
          codigoProcedimento: '40301117',
          descricaoProcedimento: 'Hemograma',
          quantidadeRealizada: 1,
          valorUnitario: 25.00,
          valorTotal: 25.00,
        },
        {
          dataRealizacao: '2025-12-21',
          codigoTabela: '22' as TipoTabela,
          codigoProcedimento: '40302016',
          descricaoProcedimento: 'Glicemia',
          quantidadeRealizada: 2,
          valorUnitario: 15.00,
          valorTotal: 30.00,
        },
      ];

      const totals = calculateSADTTotals(procedimentos);

      expect(totals.valorTotalProcedimentos).toBe(55.00);
      expect(totals.valorTotalGeral).toBe(55.00);
    });

    it('handles empty procedures array', () => {
      const totals = calculateSADTTotals([]);

      expect(totals.valorTotalProcedimentos).toBe(0);
      expect(totals.valorTotalGeral).toBe(0);
    });

    it('handles single procedure', () => {
      const procedimentos: ProcedimentoRealizado[] = [
        {
          dataRealizacao: '2025-12-21',
          codigoTabela: '22' as TipoTabela,
          codigoProcedimento: '40301117',
          descricaoProcedimento: 'Hemograma',
          quantidadeRealizada: 1,
          valorUnitario: 100.50,
          valorTotal: 100.50,
        },
      ];

      const totals = calculateSADTTotals(procedimentos);

      expect(totals.valorTotalProcedimentos).toBe(100.50);
      expect(totals.valorTotalGeral).toBe(100.50);
    });
  });
});
