/**
 * Workflow Card
 * =============
 *
 * Individual workflow card with expand/collapse and toggle.
 *
 * @module components/settings/workflow/components/WorkflowCard
 */

import React from 'react'
import { Settings } from 'lucide-react'
import type { WorkflowDefinition, WorkflowSettingsData, WorkflowId } from '../types'
import { WORKFLOW_COLOR_CLASSES } from '../constants'
import { FollowUpConfig, NpsConfig, PatientReturnConfig, LabsConfig } from './configs'

interface WorkflowCardProps {
  workflow: WorkflowDefinition
  settings: WorkflowSettingsData
  isExpanded: boolean
  clinicId: string | undefined
  onToggleExpanded: () => void
  onToggleEnabled: () => void
  onUpdateConfig: (field: string, value: unknown) => void
  onCopyWebhookUrl: () => void
}

/**
 * Individual workflow configuration card.
 */
export const WorkflowCard: React.FC<WorkflowCardProps> = ({
  workflow,
  settings,
  isExpanded,
  clinicId,
  onToggleExpanded,
  onToggleEnabled,
  onUpdateConfig,
  onCopyWebhookUrl,
}) => {
  const config = settings[workflow.id]
  const Icon = workflow.icon

  return (
    <div className="bg-genesis-surface rounded-xl border border-genesis-border-subtle overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-genesis-hover transition-colors"
        onClick={onToggleExpanded}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && onToggleExpanded()}
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${WORKFLOW_COLOR_CLASSES[workflow.color]}`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-medium text-genesis-dark">{workflow.name}</h4>
            <p className="text-sm text-genesis-muted">{workflow.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge enabled={config.enabled} />
          <ToggleSwitch
            enabled={config.enabled}
            onToggle={e => {
              e.stopPropagation()
              onToggleEnabled()
            }}
          />
          <Settings
            className={`w-5 h-5 text-genesis-muted transition-transform ${
              isExpanded ? 'rotate-90' : ''
            }`}
          />
        </div>
      </div>

      {/* Expanded Configuration */}
      {isExpanded && (
        <div className="border-t border-genesis-border-subtle p-4 bg-genesis-soft/50 space-y-4">
          <WorkflowConfigSection
            workflowId={workflow.id}
            settings={settings}
            clinicId={clinicId}
            onUpdate={onUpdateConfig}
            onCopyWebhookUrl={onCopyWebhookUrl}
          />
        </div>
      )}
    </div>
  )
}

/**
 * Status badge component.
 */
function StatusBadge({ enabled }: { enabled: boolean }): React.ReactElement {
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
        enabled
          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          : 'bg-genesis-hover text-genesis-muted'
      }`}
    >
      {enabled ? 'Ativo' : 'Inativo'}
    </span>
  )
}

/**
 * Toggle switch component.
 */
function ToggleSwitch({
  enabled,
  onToggle,
}: {
  enabled: boolean
  onToggle: (e: React.MouseEvent) => void
}): React.ReactElement {
  return (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        enabled ? 'bg-genesis-primary' : 'bg-genesis-border'
      }`}
      role="switch"
      aria-checked={enabled}
    >
      <span
        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
          enabled ? 'left-6' : 'left-1'
        }`}
      />
    </button>
  )
}

/**
 * Renders the appropriate config section based on workflow ID.
 */
function WorkflowConfigSection({
  workflowId,
  settings,
  clinicId,
  onUpdate,
  onCopyWebhookUrl,
}: {
  workflowId: WorkflowId
  settings: WorkflowSettingsData
  clinicId: string | undefined
  onUpdate: (field: string, value: unknown) => void
  onCopyWebhookUrl: () => void
}): React.ReactElement | null {
  switch (workflowId) {
    case 'followUp':
      return <FollowUpConfig config={settings.followUp} onUpdate={onUpdate} />
    case 'nps':
      return <NpsConfig config={settings.nps} onUpdate={onUpdate} />
    case 'patientReturn':
      return <PatientReturnConfig config={settings.patientReturn} onUpdate={onUpdate} />
    case 'labsIntegration':
      return (
        <LabsConfig
          config={settings.labsIntegration}
          clinicId={clinicId}
          onUpdate={onUpdate}
          onCopyWebhookUrl={onCopyWebhookUrl}
        />
      )
    default:
      return null
  }
}

export default WorkflowCard
