/**
 * TUSS Codes - Exames de Imagem
 *
 * Grupo 40401 - Diagnóstico por imagem.
 * Inclui: Radiologia, Ultrassonografia, Cardiologia.
 *
 * @module services/tiss/tuss/data/exames-imagem
 */

import type { CodigoTUSS } from '@/types';

/**
 * Radiografias
 */
export const RADIOLOGIA: CodigoTUSS[] = [
  {
    codigo: '40401014',
    descricao: 'Radiografia de tórax (PA e perfil)',
    grupo: 'Diagnóstico por imagem',
    subgrupo: 'Radiologia',
    valorReferencia: 40.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '40401022',
    descricao: 'Radiografia de coluna lombar',
    grupo: 'Diagnóstico por imagem',
    subgrupo: 'Radiologia',
    valorReferencia: 35.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
];

/**
 * Ultrassonografias
 */
export const ULTRASSONOGRAFIA: CodigoTUSS[] = [
  {
    codigo: '40901114',
    descricao: 'Ultrassonografia de abdômen total',
    grupo: 'Diagnóstico por imagem',
    subgrupo: 'Ultrassonografia',
    valorReferencia: 100.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '40901122',
    descricao: 'Ultrassonografia de tireoide',
    grupo: 'Diagnóstico por imagem',
    subgrupo: 'Ultrassonografia',
    valorReferencia: 80.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '40901130',
    descricao: 'Ultrassonografia pélvica (via abdominal)',
    grupo: 'Diagnóstico por imagem',
    subgrupo: 'Ultrassonografia',
    valorReferencia: 80.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '40901149',
    descricao: 'Ultrassonografia transvaginal',
    grupo: 'Diagnóstico por imagem',
    subgrupo: 'Ultrassonografia',
    valorReferencia: 90.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '40901157',
    descricao: 'Ultrassonografia de mama bilateral',
    grupo: 'Diagnóstico por imagem',
    subgrupo: 'Ultrassonografia',
    valorReferencia: 85.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
];

/**
 * Exames cardiológicos
 */
export const CARDIOLOGIA: CodigoTUSS[] = [
  {
    codigo: '40701018',
    descricao: 'Eletrocardiograma de repouso (ECG)',
    grupo: 'Diagnóstico por imagem',
    subgrupo: 'Cardiologia',
    valorReferencia: 35.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '40701026',
    descricao: 'Ecocardiograma transtorácico',
    grupo: 'Diagnóstico por imagem',
    subgrupo: 'Cardiologia',
    valorReferencia: 200.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
];

/**
 * Todos os exames de imagem combinados
 */
export const EXAMES_IMAGEM: CodigoTUSS[] = [
  ...RADIOLOGIA,
  ...ULTRASSONOGRAFIA,
  ...CARDIOLOGIA,
];
