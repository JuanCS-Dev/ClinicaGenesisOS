/**
 * WhatsApp Business API Settings
 * ===============================
 *
 * Configuration component for WhatsApp Business API integration.
 * Orchestrates sub-components for connection, credentials, templates, and features.
 *
 * @module components/settings/whatsapp/WhatsAppSettings
 * @version 2.0.0
 */

import React from 'react';
import { useWhatsAppConnection } from './hooks/useWhatsAppConnection';
import {
  ConnectionStatusCard,
  ConfigurationSteps,
  CredentialsForm,
  TemplatesList,
  FeaturesGrid,
  DEFAULT_TEMPLATES,
} from './components';

/**
 * WhatsApp Business API settings page.
 *
 * Features:
 * - Connection status display
 * - Step-by-step configuration guide
 * - Secure credentials management
 * - Template approval status
 * - Automatic features overview
 *
 * @example
 * ```tsx
 * <WhatsAppSettings />
 * ```
 */
export function WhatsAppSettings(): React.ReactElement {
  const {
    status,
    isTesting,
    testResult,
    testConnection,
    copyWebhookUrl,
  } = useWhatsAppConnection();

  return (
    <div className="space-y-8">
      {/* Connection Status with Configuration Steps */}
      <ConnectionStatusCard status={status}>
        <ConfigurationSteps onCopyWebhookUrl={copyWebhookUrl} />
      </ConnectionStatusCard>

      {/* Credentials Section */}
      <CredentialsForm
        status={status}
        isTesting={isTesting}
        testResult={testResult}
        onTestConnection={testConnection}
      />

      {/* Templates Section */}
      <TemplatesList templates={DEFAULT_TEMPLATES} />

      {/* Features Section */}
      <FeaturesGrid />
    </div>
  );
}

export default WhatsAppSettings;
