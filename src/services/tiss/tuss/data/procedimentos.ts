/**
 * TUSS Codes - Procedimentos Ambulatoriais
 *
 * Grupo 30101 - Procedimentos realizados em ambulatório.
 * Inclui: Curativos, Aplicações, Monitorização, Coletas.
 *
 * @module services/tiss/tuss/data/procedimentos
 */

import type { CodigoTUSS } from '@/types';

/**
 * Curativos e suturas
 */
export const CURATIVOS: CodigoTUSS[] = [
  {
    codigo: '30101012',
    descricao: 'Curativo pequeno com ou sem debridamento',
    grupo: 'Procedimentos',
    subgrupo: 'Curativos',
    valorReferencia: 30.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '30101020',
    descricao: 'Curativo médio com ou sem debridamento',
    grupo: 'Procedimentos',
    subgrupo: 'Curativos',
    valorReferencia: 50.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '30101039',
    descricao: 'Curativo grande com ou sem debridamento',
    grupo: 'Procedimentos',
    subgrupo: 'Curativos',
    valorReferencia: 80.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '30101136',
    descricao: 'Retirada de pontos',
    grupo: 'Procedimentos',
    subgrupo: 'Curativos',
    valorReferencia: 20.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
];

/**
 * Aplicações de medicamentos
 */
export const APLICACOES: CodigoTUSS[] = [
  {
    codigo: '30101217',
    descricao: 'Administração de medicamento injetável (IM/EV)',
    grupo: 'Procedimentos',
    subgrupo: 'Aplicações',
    valorReferencia: 15.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '30101225',
    descricao: 'Nebulização',
    grupo: 'Procedimentos',
    subgrupo: 'Aplicações',
    valorReferencia: 20.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
];

/**
 * Monitorização de sinais vitais
 */
export const MONITORIZACAO: CodigoTUSS[] = [
  {
    codigo: '30101314',
    descricao: 'Verificação de pressão arterial',
    grupo: 'Procedimentos',
    subgrupo: 'Monitorização',
    valorReferencia: 10.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '30101322',
    descricao: 'Glicemia capilar',
    grupo: 'Procedimentos',
    subgrupo: 'Monitorização',
    valorReferencia: 12.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
];

/**
 * Coletas de material
 */
export const COLETAS: CodigoTUSS[] = [
  {
    codigo: '30101411',
    descricao: 'Coleta de material para exame',
    grupo: 'Procedimentos',
    subgrupo: 'Coletas',
    valorReferencia: 15.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
];

/**
 * Todos os procedimentos combinados
 */
export const PROCEDIMENTOS: CodigoTUSS[] = [
  ...CURATIVOS,
  ...APLICACOES,
  ...MONITORIZACAO,
  ...COLETAS,
];
