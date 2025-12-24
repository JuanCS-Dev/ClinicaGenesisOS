/**
 * Credentials Form
 * ================
 *
 * WhatsApp API credentials display and connection testing.
 *
 * @module components/settings/whatsapp/components/CredentialsForm
 */

import React, { useState } from 'react';
import {
  Shield,
  Eye,
  EyeOff,
  Send,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import type { WhatsAppConnectionStatus, ConnectionTestResult } from '../types';

interface CredentialsFormProps {
  /** Current connection status */
  status: WhatsAppConnectionStatus;
  /** Whether a connection test is in progress */
  isTesting: boolean;
  /** Result of the last connection test */
  testResult: ConnectionTestResult;
  /** Callback to test connection */
  onTestConnection: () => void;
}

/**
 * Displays credentials (masked) and provides connection testing.
 *
 * Credentials are stored securely in Firebase Secrets and displayed
 * as read-only masked values.
 */
export function CredentialsForm({
  status,
  isTesting,
  testResult,
  onTestConnection,
}: CredentialsFormProps): React.ReactElement {
  const [showToken, setShowToken] = useState(false);

  return (
    <div className="bg-genesis-surface rounded-2xl border border-genesis-border-subtle p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="font-semibold text-genesis-dark">Credenciais</h3>
          <p className="text-sm text-genesis-muted">
            Configuradas via Firebase Secrets (seguro)
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Access Token Field */}
        <TokenField
          showToken={showToken}
          onToggleVisibility={() => setShowToken(!showToken)}
        />

        {/* Phone Number ID Field */}
        <PhoneIdField connected={status.connected} />

        {/* Test Connection Button */}
        <TestConnectionButton
          isTesting={isTesting}
          testResult={testResult}
          onTest={onTestConnection}
        />
      </div>
    </div>
  );
}

/**
 * Masked token input field.
 */
function TokenField({
  showToken,
  onToggleVisibility,
}: {
  showToken: boolean;
  onToggleVisibility: () => void;
}): React.ReactElement {
  return (
    <div>
      <label
        htmlFor="whatsapp-token"
        className="block text-sm font-medium text-genesis-text mb-1"
      >
        Access Token
      </label>
      <div className="relative">
        <input
          id="whatsapp-token"
          type={showToken ? 'text' : 'password'}
          value="••••••••••••••••••••••••"
          readOnly
          className="w-full px-4 py-2.5 pr-10 border border-genesis-border rounded-xl bg-genesis-soft text-genesis-text font-mono text-sm"
        />
        <button
          onClick={onToggleVisibility}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-genesis-muted hover:text-genesis-dark"
          aria-label={showToken ? 'Ocultar token' : 'Mostrar token'}
        >
          {showToken ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>
      <p className="text-xs text-genesis-muted mt-1">
        Gerenciado via: WHATSAPP_TOKEN
      </p>
    </div>
  );
}

/**
 * Phone Number ID display field.
 */
function PhoneIdField({
  connected,
}: {
  connected: boolean;
}): React.ReactElement {
  return (
    <div>
      <label
        htmlFor="whatsapp-phone-id"
        className="block text-sm font-medium text-genesis-text mb-1"
      >
        Phone Number ID
      </label>
      <input
        id="whatsapp-phone-id"
        type="text"
        value={connected ? '1234567890' : 'Não configurado'}
        readOnly
        className="w-full px-4 py-2.5 border border-genesis-border rounded-xl bg-genesis-soft text-genesis-text font-mono text-sm"
      />
      <p className="text-xs text-genesis-muted mt-1">
        Gerenciado via: WHATSAPP_PHONE_ID
      </p>
    </div>
  );
}

/**
 * Connection test button with result indicator.
 */
function TestConnectionButton({
  isTesting,
  testResult,
  onTest,
}: {
  isTesting: boolean;
  testResult: ConnectionTestResult;
  onTest: () => void;
}): React.ReactElement {
  return (
    <div className="pt-4 flex items-center gap-3">
      <button
        onClick={onTest}
        disabled={isTesting}
        className="flex items-center gap-2 px-4 py-2.5 bg-genesis-primary text-white rounded-xl font-medium hover:bg-genesis-primary-dark transition-colors disabled:opacity-50"
      >
        {isTesting ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        {isTesting ? 'Testando...' : 'Testar Conexão'}
      </button>

      {testResult === 'success' && (
        <span className="flex items-center gap-1.5 text-sm text-green-600">
          <CheckCircle2 className="w-4 h-4" />
          Conexão OK
        </span>
      )}
      {testResult === 'error' && (
        <span className="flex items-center gap-1.5 text-sm text-red-600">
          <XCircle className="w-4 h-4" />
          Falha na conexão
        </span>
      )}
    </div>
  );
}

export default CredentialsForm;
