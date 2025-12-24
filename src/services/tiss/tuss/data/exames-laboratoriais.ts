/**
 * TUSS Codes - Exames Laboratoriais
 *
 * Grupo 40301 - Exames de laboratório básicos.
 * Inclui: Hematologia, Coagulação, Bioquímica, Hormônios, Vitaminas, Urinálise, Coprológicos.
 *
 * @module services/tiss/tuss/data/exames-laboratoriais
 */

import type { CodigoTUSS } from '@/types';

/**
 * Exames de hematologia
 */
export const HEMATOLOGIA: CodigoTUSS[] = [
  {
    codigo: '40301117',
    descricao: 'Hemograma completo',
    grupo: 'Exames laboratoriais',
    subgrupo: 'Hematologia',
    valorReferencia: 15.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '40301125',
    descricao: 'Hemograma com contagem de plaquetas',
    grupo: 'Exames laboratoriais',
    subgrupo: 'Hematologia',
    valorReferencia: 18.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '40301133',
    descricao: 'VHS (velocidade de hemossedimentação)',
    grupo: 'Exames laboratoriais',
    subgrupo: 'Hematologia',
    valorReferencia: 8.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
];

/**
 * Exames de coagulação
 */
export const COAGULACAO: CodigoTUSS[] = [
  {
    codigo: '40301508',
    descricao: 'Tempo de protrombina (TAP/INR)',
    grupo: 'Exames laboratoriais',
    subgrupo: 'Coagulação',
    valorReferencia: 12.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '40301516',
    descricao: 'Tempo de tromboplastina parcial (TTPA)',
    grupo: 'Exames laboratoriais',
    subgrupo: 'Coagulação',
    valorReferencia: 12.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
];

/**
 * Exames de bioquímica
 */
export const BIOQUIMICA: CodigoTUSS[] = [
  // Glicemia
  {
    codigo: '40301630',
    descricao: 'Glicose (jejum)',
    grupo: 'Exames laboratoriais',
    subgrupo: 'Bioquímica',
    valorReferencia: 6.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '40301648',
    descricao: 'Hemoglobina glicada (HbA1c)',
    grupo: 'Exames laboratoriais',
    subgrupo: 'Bioquímica',
    valorReferencia: 25.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '40301656',
    descricao: 'Curva glicêmica (2 dosagens)',
    grupo: 'Exames laboratoriais',
    subgrupo: 'Bioquímica',
    valorReferencia: 18.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  // Lipídios
  {
    codigo: '40302016',
    descricao: 'Colesterol total',
    grupo: 'Exames laboratoriais',
    subgrupo: 'Bioquímica',
    valorReferencia: 8.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '40302024',
    descricao: 'Colesterol HDL',
    grupo: 'Exames laboratoriais',
    subgrupo: 'Bioquímica',
    valorReferencia: 10.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '40302032',
    descricao: 'Colesterol LDL',
    grupo: 'Exames laboratoriais',
    subgrupo: 'Bioquímica',
    valorReferencia: 10.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '40302040',
    descricao: 'Triglicerídeos',
    grupo: 'Exames laboratoriais',
    subgrupo: 'Bioquímica',
    valorReferencia: 10.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '40302059',
    descricao: 'Lipidograma completo',
    grupo: 'Exames laboratoriais',
    subgrupo: 'Bioquímica',
    valorReferencia: 35.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  // Função renal
  {
    codigo: '40302113',
    descricao: 'Ureia',
    grupo: 'Exames laboratoriais',
    subgrupo: 'Bioquímica',
    valorReferencia: 6.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '40302121',
    descricao: 'Creatinina',
    grupo: 'Exames laboratoriais',
    subgrupo: 'Bioquímica',
    valorReferencia: 6.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '40302130',
    descricao: 'Ácido úrico',
    grupo: 'Exames laboratoriais',
    subgrupo: 'Bioquímica',
    valorReferencia: 8.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  // Função hepática
  {
    codigo: '40302229',
    descricao: 'TGO (AST)',
    grupo: 'Exames laboratoriais',
    subgrupo: 'Bioquímica',
    valorReferencia: 8.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '40302237',
    descricao: 'TGP (ALT)',
    grupo: 'Exames laboratoriais',
    subgrupo: 'Bioquímica',
    valorReferencia: 8.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '40302245',
    descricao: 'Gama GT (GGT)',
    grupo: 'Exames laboratoriais',
    subgrupo: 'Bioquímica',
    valorReferencia: 10.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '40302253',
    descricao: 'Bilirrubinas total e frações',
    grupo: 'Exames laboratoriais',
    subgrupo: 'Bioquímica',
    valorReferencia: 12.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '40302261',
    descricao: 'Fosfatase alcalina',
    grupo: 'Exames laboratoriais',
    subgrupo: 'Bioquímica',
    valorReferencia: 8.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '40302326',
    descricao: 'Proteínas totais e frações',
    grupo: 'Exames laboratoriais',
    subgrupo: 'Bioquímica',
    valorReferencia: 12.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  // Eletrólitos e minerais
  {
    codigo: '40302423',
    descricao: 'Cálcio',
    grupo: 'Exames laboratoriais',
    subgrupo: 'Bioquímica',
    valorReferencia: 8.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '40302431',
    descricao: 'Fósforo',
    grupo: 'Exames laboratoriais',
    subgrupo: 'Bioquímica',
    valorReferencia: 8.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '40302440',
    descricao: 'Magnésio',
    grupo: 'Exames laboratoriais',
    subgrupo: 'Bioquímica',
    valorReferencia: 10.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '40302512',
    descricao: 'Sódio',
    grupo: 'Exames laboratoriais',
    subgrupo: 'Bioquímica',
    valorReferencia: 8.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '40302520',
    descricao: 'Potássio',
    grupo: 'Exames laboratoriais',
    subgrupo: 'Bioquímica',
    valorReferencia: 8.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  // Ferro
  {
    codigo: '40302610',
    descricao: 'Ferro sérico',
    grupo: 'Exames laboratoriais',
    subgrupo: 'Bioquímica',
    valorReferencia: 10.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '40302628',
    descricao: 'Ferritina',
    grupo: 'Exames laboratoriais',
    subgrupo: 'Bioquímica',
    valorReferencia: 25.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '40302636',
    descricao: 'Transferrina',
    grupo: 'Exames laboratoriais',
    subgrupo: 'Bioquímica',
    valorReferencia: 20.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
];

/**
 * Exames de hormônios tireoidianos
 */
export const HORMONIOS: CodigoTUSS[] = [
  {
    codigo: '40316017',
    descricao: 'TSH (hormônio tireoestimulante)',
    grupo: 'Exames laboratoriais',
    subgrupo: 'Hormônios',
    valorReferencia: 25.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '40316025',
    descricao: 'T4 livre',
    grupo: 'Exames laboratoriais',
    subgrupo: 'Hormônios',
    valorReferencia: 25.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '40316033',
    descricao: 'T3 livre',
    grupo: 'Exames laboratoriais',
    subgrupo: 'Hormônios',
    valorReferencia: 25.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
];

/**
 * Exames de vitaminas
 */
export const VITAMINAS: CodigoTUSS[] = [
  {
    codigo: '40316211',
    descricao: 'Vitamina B12',
    grupo: 'Exames laboratoriais',
    subgrupo: 'Vitaminas',
    valorReferencia: 30.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '40316220',
    descricao: 'Vitamina D (25-hidroxi)',
    grupo: 'Exames laboratoriais',
    subgrupo: 'Vitaminas',
    valorReferencia: 40.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '40316238',
    descricao: 'Ácido fólico',
    grupo: 'Exames laboratoriais',
    subgrupo: 'Vitaminas',
    valorReferencia: 25.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
];

/**
 * Exames de urina
 */
export const URINALISE: CodigoTUSS[] = [
  {
    codigo: '40311023',
    descricao: 'Urina tipo I (EAS)',
    grupo: 'Exames laboratoriais',
    subgrupo: 'Urinálise',
    valorReferencia: 8.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '40311031',
    descricao: 'Urocultura com antibiograma',
    grupo: 'Exames laboratoriais',
    subgrupo: 'Urinálise',
    valorReferencia: 25.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
];

/**
 * Exames de fezes
 */
export const COPROLOGICOS: CodigoTUSS[] = [
  {
    codigo: '40311112',
    descricao: 'Exame parasitológico de fezes (EPF)',
    grupo: 'Exames laboratoriais',
    subgrupo: 'Coprológicos',
    valorReferencia: 10.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
  {
    codigo: '40311120',
    descricao: 'Sangue oculto nas fezes',
    grupo: 'Exames laboratoriais',
    subgrupo: 'Coprológicos',
    valorReferencia: 12.00,
    vigenciaInicio: '2024-01-01',
    ativo: true,
  },
];

/**
 * Todos os exames laboratoriais combinados
 */
export const EXAMES_LABORATORIAIS: CodigoTUSS[] = [
  ...HEMATOLOGIA,
  ...COAGULACAO,
  ...BIOQUIMICA,
  ...HORMONIOS,
  ...VITAMINAS,
  ...URINALISE,
  ...COPROLOGICOS,
];
