/**
 * WhatsApp Settings Module
 * ========================
 *
 * Modular WhatsApp Business API settings components.
 *
 * @module components/settings/whatsapp
 */

// Main component
export { WhatsAppSettings, default } from './WhatsAppSettings';

// Types
export type {
  WhatsAppTemplate,
  WhatsAppConnectionStatus,
  TemplateApprovalStatus,
  ConnectionTestResult,
  ConfigurationStep,
  AutomaticFeature,
} from './types';

// Hooks
export { useWhatsAppConnection } from './hooks/useWhatsAppConnection';

// Sub-components (for advanced usage)
export {
  ConnectionStatusCard,
  ConfigurationSteps,
  CredentialsForm,
  TemplatesList,
  FeaturesGrid,
  DEFAULT_TEMPLATES,
  AUTOMATIC_FEATURES,
} from './components';
