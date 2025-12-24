/**
 * Specialty Templates Types
 *
 * @module components/ai/specialty-templates/types
 */

import type { LucideIcon } from 'lucide-react'

/**
 * SOAP template structure.
 */
export interface SOAPTemplate {
  id: string
  name: string
  specialty: string
  icon: LucideIcon
  subjective: string
  objective: string
  assessment: string
  plan: string
}

/**
 * Template content without metadata.
 */
export type SOAPTemplateContent = Pick<
  SOAPTemplate,
  'subjective' | 'objective' | 'assessment' | 'plan'
>

/**
 * Props for SpecialtyTemplates component.
 */
export interface SpecialtyTemplatesProps {
  /** Callback when template is selected */
  onSelectTemplate: (template: SOAPTemplateContent) => void
  /** Current SOAP has content (show warning) */
  hasExistingContent?: boolean
}
