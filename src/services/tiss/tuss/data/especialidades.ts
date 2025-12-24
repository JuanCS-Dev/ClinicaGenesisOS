/**
 * TUSS Codes - Consultas Especialidades
 *
 * Nutrição e Psicologia - Códigos especializados.
 *
 * @module services/tiss/tuss/data/especialidades
 */

import type { CodigoTUSS } from '@/types';

/**
 * Consultas de nutrição
 */
export const NUTRICAO: CodigoTUSS[] = [
  {
    codigo: '20104022',
    descricao: 'Consulta/sessão com nutricionista',
    grupo: 'Procedimentos clínicos',
    subgrupo: 'Nutrição',
    valorReferencia: 120.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '20104030',
    descricao: 'Avaliação nutricional completa',
    grupo: 'Procedimentos clínicos',
    subgrupo: 'Nutrição',
    valorReferencia: 180.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '20104049',
    descricao: 'Elaboração de plano alimentar',
    grupo: 'Procedimentos clínicos',
    subgrupo: 'Nutrição',
    valorReferencia: 150.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
];

/**
 * Consultas de psicologia
 */
export const PSICOLOGIA: CodigoTUSS[] = [
  {
    codigo: '20104103',
    descricao: 'Consulta/sessão com psicólogo',
    grupo: 'Procedimentos clínicos',
    subgrupo: 'Psicologia',
    valorReferencia: 150.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '20104111',
    descricao: 'Avaliação psicológica (por sessão)',
    grupo: 'Procedimentos clínicos',
    subgrupo: 'Psicologia',
    valorReferencia: 180.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '20104120',
    descricao: 'Psicoterapia individual (por sessão)',
    grupo: 'Procedimentos clínicos',
    subgrupo: 'Psicologia',
    valorReferencia: 160.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '20104138',
    descricao: 'Orientação/aconselhamento psicológico',
    grupo: 'Procedimentos clínicos',
    subgrupo: 'Psicologia',
    valorReferencia: 130.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '20104146',
    descricao: 'Aplicação de testes psicológicos',
    grupo: 'Procedimentos clínicos',
    subgrupo: 'Psicologia',
    valorReferencia: 200.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
];

/**
 * Todas as consultas de especialidades combinadas
 */
export const CONSULTAS_ESPECIALIDADES: CodigoTUSS[] = [
  ...NUTRICAO,
  ...PSICOLOGIA,
];
