/**
 * SpecialtyTemplates Component
 *
 * Pre-defined SOAP templates organized by medical specialty.
 * Allows quick population of SOAP fields with common structures.
 *
 * @module components/ai/specialty-templates/SpecialtyTemplates
 */

import React, { useState, useCallback } from 'react'
import { FileText, ChevronRight, Check, X } from 'lucide-react'
import type { SOAPTemplate, SpecialtyTemplatesProps } from './types'
import { TEMPLATES, SPECIALTIES } from './templates.data'

// ============================================================================
// Sub-Components
// ============================================================================

interface TemplateCardProps {
  template: SOAPTemplate
  onSelect: () => void
  onPreview: () => void
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect, onPreview }) => {
  const Icon = template.icon
  return (
    <div className="p-3 bg-genesis-surface rounded-xl border border-genesis-border-subtle hover:border-genesis-primary/30 hover:shadow-md transition-all">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-genesis-primary/10 rounded-lg">
          <Icon className="w-5 h-5 text-genesis-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-genesis-dark text-sm">{template.name}</h4>
          <p className="text-xs text-genesis-muted">{template.specialty}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onPreview}
            className="p-1.5 text-genesis-muted hover:text-genesis-primary hover:bg-genesis-hover rounded-lg transition-colors"
            title="Visualizar"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            onClick={onSelect}
            className="p-1.5 bg-genesis-primary text-white rounded-lg hover:bg-genesis-primary-dark transition-colors"
            title="Aplicar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Modal Components
// ============================================================================

interface PreviewModalProps {
  template: SOAPTemplate
  onClose: () => void
  onApply: () => void
}

const PreviewModal: React.FC<PreviewModalProps> = ({ template, onClose, onApply }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="bg-genesis-surface rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div>
          <h3 className="font-semibold text-genesis-dark">{template.name}</h3>
          <p className="text-sm text-genesis-muted">{template.specialty}</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-genesis-hover rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
        {['S - Subjetivo', 'O - Objetivo', 'A - Avaliação', 'P - Plano'].map((label, i) => {
          const fields = ['subjective', 'objective', 'assessment', 'plan'] as const
          return (
            <div key={label}>
              <h4 className="text-xs font-bold text-blue-600 uppercase mb-1">{label}</h4>
              <pre className="text-sm text-genesis-medium whitespace-pre-wrap bg-genesis-soft p-3 rounded-lg">
                {template[fields[i]]}
              </pre>
            </div>
          )
        })}
      </div>
      <div className="px-6 py-4 border-t flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-genesis-medium hover:bg-genesis-hover rounded-lg"
        >
          Fechar
        </button>
        <button
          onClick={onApply}
          className="flex items-center gap-2 px-4 py-2 bg-genesis-primary text-white rounded-lg hover:bg-genesis-primary-dark"
        >
          <Check className="w-4 h-4" />
          Aplicar Template
        </button>
      </div>
    </div>
  </div>
)

interface ConfirmModalProps {
  onConfirm: () => void
  onCancel: () => void
}

const ConfirmOverwriteModal: React.FC<ConfirmModalProps> = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="bg-genesis-surface rounded-2xl shadow-xl w-full max-w-md p-6">
      <h3 className="font-semibold text-genesis-dark mb-2">Substituir conteúdo?</h3>
      <p className="text-sm text-genesis-muted mb-4">
        Os campos SOAP já possuem conteúdo. Aplicar o template irá substituir o texto existente.
      </p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-genesis-medium hover:bg-genesis-hover rounded-lg"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
        >
          Substituir
        </button>
      </div>
    </div>
  </div>
)

// ============================================================================
// Main Component
// ============================================================================

export function SpecialtyTemplates({
  onSelectTemplate,
  hasExistingContent = false,
}: SpecialtyTemplatesProps): React.ReactElement {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<SOAPTemplate | null>(null)
  const [confirmOverwrite, setConfirmOverwrite] = useState<SOAPTemplate | null>(null)

  const filteredTemplates = selectedSpecialty
    ? TEMPLATES.filter(t => t.specialty === selectedSpecialty)
    : TEMPLATES

  const handleSelectTemplate = useCallback(
    (template: SOAPTemplate) => {
      if (hasExistingContent) {
        setConfirmOverwrite(template)
      } else {
        onSelectTemplate({
          subjective: template.subjective,
          objective: template.objective,
          assessment: template.assessment,
          plan: template.plan,
        })
      }
    },
    [hasExistingContent, onSelectTemplate]
  )

  const handleConfirmOverwrite = useCallback(() => {
    if (confirmOverwrite) {
      onSelectTemplate({
        subjective: confirmOverwrite.subjective,
        objective: confirmOverwrite.objective,
        assessment: confirmOverwrite.assessment,
        plan: confirmOverwrite.plan,
      })
      setConfirmOverwrite(null)
    }
  }, [confirmOverwrite, onSelectTemplate])

  return (
    <div className="space-y-4">
      {/* Specialty Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedSpecialty(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            !selectedSpecialty
              ? 'bg-genesis-primary text-white'
              : 'bg-genesis-soft text-genesis-medium hover:bg-genesis-hover'
          }`}
        >
          Todos
        </button>
        {SPECIALTIES.map(specialty => (
          <button
            key={specialty}
            onClick={() => setSelectedSpecialty(specialty)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedSpecialty === specialty
                ? 'bg-genesis-primary text-white'
                : 'bg-genesis-soft text-genesis-medium hover:bg-genesis-hover'
            }`}
          >
            {specialty}
          </button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {filteredTemplates.map(template => (
          <TemplateCard
            key={template.id}
            template={template}
            onSelect={() => handleSelectTemplate(template)}
            onPreview={() => setPreviewTemplate(template)}
          />
        ))}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <PreviewModal
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onApply={() => {
            handleSelectTemplate(previewTemplate)
            setPreviewTemplate(null)
          }}
        />
      )}

      {/* Confirm Overwrite Modal */}
      {confirmOverwrite && (
        <ConfirmOverwriteModal
          onConfirm={handleConfirmOverwrite}
          onCancel={() => setConfirmOverwrite(null)}
        />
      )}
    </div>
  )
}

export default SpecialtyTemplates
