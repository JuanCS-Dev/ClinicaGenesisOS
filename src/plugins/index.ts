/**
 * Plugin System - Ponto de Entrada
 * =================================
 *
 * Exporta todos os módulos do sistema de plugins de especialidades.
 *
 * Estrutura:
 * - registry: Catálogo de especialidades (PLUGINS)
 * - medicina: Editores médicos (SOAP, Prescrição, Exames)
 * - nutricao: Editor nutricional (Antropometria)
 * - psicologia: Editor psicológico (Sessões, Humor)
 *
 * @module plugins
 */

// Catálogo central
export { PLUGINS, getPlugin, getAvailableSpecialties } from './registry';

// Módulo Medicina
export { MedicineEditor, SoapEditor, PrescriptionEditor, ExamRequestEditor } from './medicina';
export { COMMON_EXAMS } from './medicina';

// Módulo Nutrição
export { NutritionEditor } from './nutricao';

// Módulo Psicologia
export { PsychologyEditor, MOODS } from './psicologia';
export type { MoodOption, MoodId } from './psicologia';
