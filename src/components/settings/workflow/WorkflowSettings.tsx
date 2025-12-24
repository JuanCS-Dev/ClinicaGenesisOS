/**
 * Workflow Settings Component
 * ===========================
 *
 * Configuration for automated workflow features.
 * Orchestrates sub-components for a modular, maintainable structure.
 *
 * @module components/settings/workflow/WorkflowSettings
 * @version 2.0.0
 */

import React from 'react';
import { useWorkflowSettings } from './hooks/useWorkflowSettings';
import { WORKFLOW_DEFINITIONS } from './constants';
import {
  WorkflowHeader,
  WorkflowCard,
  ScheduleSummary,
} from './components';

/**
 * Loading skeleton for workflow settings.
 */
function LoadingSkeleton(): React.ReactElement {
  return (
    <div className="space-y-6 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-24 bg-genesis-soft rounded-xl" />
      ))}
    </div>
  );
}

/**
 * Workflow settings page.
 *
 * Manages:
 * - Follow-up post-consultation
 * - NPS surveys
 * - Patient return reminders
 * - Labs integration
 *
 * @example
 * ```tsx
 * <WorkflowSettings />
 * ```
 */
export function WorkflowSettings(): React.ReactElement {
  const {
    settings,
    loading,
    saving,
    expandedWorkflow,
    clinicId,
    toggleExpanded,
    toggleEnabled,
    updateConfig,
    save,
    copyWebhookUrl,
  } = useWorkflowSettings();

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header with save button */}
      <WorkflowHeader saving={saving} onSave={save} />

      {/* Workflow cards */}
      <div className="space-y-4">
        {WORKFLOW_DEFINITIONS.map((workflow) => (
          <WorkflowCard
            key={workflow.id}
            workflow={workflow}
            settings={settings}
            isExpanded={expandedWorkflow === workflow.id}
            clinicId={clinicId}
            onToggleExpanded={() => toggleExpanded(workflow.id)}
            onToggleEnabled={() => toggleEnabled(workflow.id)}
            onUpdateConfig={(field, value) =>
              updateConfig(workflow.id, field, value)
            }
            onCopyWebhookUrl={copyWebhookUrl}
          />
        ))}
      </div>

      {/* Schedule summary */}
      <ScheduleSummary />
    </div>
  );
}

export default WorkflowSettings;
