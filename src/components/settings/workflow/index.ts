/**
 * Workflow Settings Module
 * ========================
 *
 * Modular workflow settings components.
 *
 * @module components/settings/workflow
 */

// Main component
export { WorkflowSettings, default } from './WorkflowSettings';

// Types
export type {
  WorkflowConfig,
  FollowUpConfig,
  NpsConfig,
  PatientReturnConfig,
  LabsIntegrationConfig,
  WorkflowSettingsData,
  WorkflowId,
  WorkflowCategory,
  WorkflowDefinition,
} from './types';

// Constants
export {
  DEFAULT_WORKFLOW_SETTINGS,
  WORKFLOW_DEFINITIONS,
  WORKFLOW_COLOR_CLASSES,
  LABS_WEBHOOK_URL,
} from './constants';

// Hooks
export { useWorkflowSettings } from './hooks/useWorkflowSettings';

// Sub-components (for advanced usage)
export {
  InfoBox,
  WorkflowHeader,
  WorkflowCard,
  ScheduleSummary,
  FollowUpConfig as FollowUpConfigComponent,
  NpsConfig as NpsConfigComponent,
  PatientReturnConfig as PatientReturnConfigComponent,
  LabsConfig as LabsConfigComponent,
} from './components';
