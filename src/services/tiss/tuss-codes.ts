/**
 * TUSS Codes Service
 *
 * Terminologia Unificada da Saúde Suplementar (TUSS)
 * Brazilian unified healthcare terminology standardized by ANS.
 *
 * This module provides the most commonly used procedure codes for
 * medical clinics, including consultations, basic exams, and procedures.
 *
 * Reference: https://www.gov.br/ans/pt-br/assuntos/prestadores/tuss-702013-terminologia-unificada-da-saude-suplementar
 */

import type { CodigoTUSS } from '@/types';

// =============================================================================
// CONSULTAS MÉDICAS - Grupo 10101
// =============================================================================

const CONSULTAS: CodigoTUSS[] = [
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

// =============================================================================
// CONSULTAS ESPECIALIDADES - Nutrição e Psicologia
// =============================================================================

const CONSULTAS_ESPECIALIDADES: CodigoTUSS[] = [
  // Nutrição
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
  // Psicologia
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

// =============================================================================
// EXAMES LABORATORIAIS BÁSICOS - Grupo 40301
// =============================================================================

const EXAMES_LABORATORIAIS: CodigoTUSS[] = [
  // Hemograma e coagulação
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
  // Bioquímica
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
  // Hormônios tireoidianos
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
  // Vitaminas
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
  // Urina
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
  // Fezes
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

// =============================================================================
// EXAMES DE IMAGEM - Grupo 40401
// =============================================================================

const EXAMES_IMAGEM: CodigoTUSS[] = [
  // Radiografias
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
  // Ultrassonografias
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
  // Eletrocardiograma
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

// =============================================================================
// PROCEDIMENTOS AMBULATORIAIS - Grupo 30101
// =============================================================================

const PROCEDIMENTOS: CodigoTUSS[] = [
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

// =============================================================================
// ALL CODES COMBINED
// =============================================================================

/**
 * Complete TUSS codes database
 */
export const TUSS_CODES: CodigoTUSS[] = [
  ...CONSULTAS,
  ...CONSULTAS_ESPECIALIDADES,
  ...EXAMES_LABORATORIAIS,
  ...EXAMES_IMAGEM,
  ...PROCEDIMENTOS,
];

/**
 * Quick lookup map by code
 */
const TUSS_BY_CODE = new Map<string, CodigoTUSS>(
  TUSS_CODES.map((code) => [code.codigo, code])
);

/**
 * Quick lookup map by group
 */
const TUSS_BY_GROUP = new Map<string, CodigoTUSS[]>();
TUSS_CODES.forEach((code) => {
  const existing = TUSS_BY_GROUP.get(code.grupo) || [];
  existing.push(code);
  TUSS_BY_GROUP.set(code.grupo, existing);
});

// =============================================================================
// SERVICE FUNCTIONS
// =============================================================================

/**
 * Search TUSS codes by description or code.
 *
 * @param query - Search query (code or description)
 * @param limit - Maximum results to return
 * @returns Matching TUSS codes
 */
export function searchTussCodes(query: string, limit = 20): CodigoTUSS[] {
  if (!query || query.length < 2) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();

  // First, check for exact code match
  const exactMatch = TUSS_BY_CODE.get(normalizedQuery);
  if (exactMatch) {
    return [exactMatch];
  }

  // Search by code prefix or description
  const results = TUSS_CODES.filter((code) => {
    if (!code.ativo) return false;

    // Match by code
    if (code.codigo.startsWith(normalizedQuery)) {
      return true;
    }

    // Match by description (case-insensitive)
    if (code.descricao.toLowerCase().includes(normalizedQuery)) {
      return true;
    }

    // Match by group
    if (code.grupo.toLowerCase().includes(normalizedQuery)) {
      return true;
    }

    // Match by subgroup
    if (code.subgrupo?.toLowerCase().includes(normalizedQuery)) {
      return true;
    }

    return false;
  });

  // Sort by relevance (exact code match first, then alphabetically)
  results.sort((a, b) => {
    const aStartsWithCode = a.codigo.startsWith(normalizedQuery);
    const bStartsWithCode = b.codigo.startsWith(normalizedQuery);

    if (aStartsWithCode && !bStartsWithCode) return -1;
    if (!aStartsWithCode && bStartsWithCode) return 1;

    return a.descricao.localeCompare(b.descricao);
  });

  return results.slice(0, limit);
}

/**
 * Get a TUSS code by its exact code.
 *
 * @param codigo - The 8-digit TUSS code
 * @returns The TUSS code or null if not found
 */
export function getTussCodeByCode(codigo: string): CodigoTUSS | null {
  return TUSS_BY_CODE.get(codigo) || null;
}

/**
 * Get all TUSS codes in a specific group.
 *
 * @param grupo - Group name
 * @returns Array of TUSS codes in the group
 */
export function getTussCodesByGroup(grupo: string): CodigoTUSS[] {
  return TUSS_BY_GROUP.get(grupo) || [];
}

/**
 * Get all available groups.
 *
 * @returns Array of group names
 */
export function getTussGroups(): string[] {
  return Array.from(TUSS_BY_GROUP.keys()).sort();
}

/**
 * Get common consultation codes for quick selection.
 */
export function getConsultaCodes(): CodigoTUSS[] {
  return CONSULTAS.filter((c) => c.ativo);
}

/**
 * Get common exam codes for quick selection.
 */
export function getExamCodes(): CodigoTUSS[] {
  return [...EXAMES_LABORATORIAIS, ...EXAMES_IMAGEM].filter((c) => c.ativo);
}

/**
 * Validate if a code exists and is active.
 *
 * @param codigo - The TUSS code to validate
 * @returns true if valid and active
 */
export function isValidTussCode(codigo: string): boolean {
  const tuss = TUSS_BY_CODE.get(codigo);
  return tuss !== undefined && tuss.ativo;
}

/**
 * Get total number of TUSS codes in the database.
 */
export function getTussCodeCount(): number {
  return TUSS_CODES.length;
}
