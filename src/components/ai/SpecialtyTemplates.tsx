/**
 * SpecialtyTemplates Component - Re-exports
 *
 * This file re-exports all specialty template components from the modular structure.
 * Maintained for backward compatibility with existing imports.
 *
 * @module components/ai/SpecialtyTemplates
 * @deprecated Import directly from '@/components/ai/specialty-templates' for new code.
 */

export { SpecialtyTemplates, default, TEMPLATES, SPECIALTIES } from './specialty-templates'

export type {
  SOAPTemplate,
  SOAPTemplateContent,
  SpecialtyTemplatesProps,
} from './specialty-templates'
