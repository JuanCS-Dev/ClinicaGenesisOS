/**
 * TUSS Codes - Consultas Médicas
 *
 * Grupo 10101 - Consultas em consultório, domicílio, pronto socorro, etc.
 *
 * @module services/tiss/tuss/data/consultas
 */

import type { CodigoTUSS } from '@/types';

/**
 * Consultas médicas - Grupo 10101
 */
export const CONSULTAS: CodigoTUSS[] = [
  // Consultas em consultório
  {
    codigo: '10101012',
    descricao: 'Consulta em consultório (no horário normal ou preestabelecido)',
    grupo: 'Procedimentos clínicos',
    subgrupo: 'Consultas',
    valorReferencia: 150.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '10101020',
    descricao: 'Consulta em domicílio',
    grupo: 'Procedimentos clínicos',
    subgrupo: 'Consultas',
    valorReferencia: 250.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '10101039',
    descricao: 'Consulta em pronto socorro',
    grupo: 'Procedimentos clínicos',
    subgrupo: 'Consultas',
    valorReferencia: 200.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '10102019',
    descricao: 'Consulta eletiva em consultório (no horário normal)',
    grupo: 'Procedimentos clínicos',
    subgrupo: 'Consultas',
    valorReferencia: 150.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '10103015',
    descricao: 'Teleconsulta médica',
    grupo: 'Procedimentos clínicos',
    subgrupo: 'Consultas',
    valorReferencia: 130.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '10104011',
    descricao: 'Consulta de retorno (até 15 dias)',
    grupo: 'Procedimentos clínicos',
    subgrupo: 'Consultas',
    valorReferencia: 100.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
];
