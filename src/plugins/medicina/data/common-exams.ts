/**
 * Exames Laboratoriais Comuns
 * ===========================
 *
 * Lista de exames frequentemente solicitados em consultas médicas.
 * Organizado por relevância clínica para facilitar seleção rápida.
 */

export const COMMON_EXAMS = [
  'Hemograma Completo',
  'Glicemia em Jejum',
  'Colesterol Total e Frações',
  'Triglicerídeos',
  'TSH e T4 Livre',
  'Creatinina',
  'Ureia',
  'TGO / TGP',
  'Vitamina D',
  'Urina Tipo I',
] as const;

export type CommonExam = (typeof COMMON_EXAMS)[number];
