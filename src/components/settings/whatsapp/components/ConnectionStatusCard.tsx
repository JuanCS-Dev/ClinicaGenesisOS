/**
 * Connection Status Card
 * ======================
 *
 * Displays WhatsApp Business API connection status with visual indicators.
 *
 * @module components/settings/whatsapp/components/ConnectionStatusCard
 */

import React from 'react';
import { MessageCircle, AlertTriangle } from 'lucide-react';
import type { WhatsAppConnectionStatus } from '../types';

interface ConnectionStatusCardProps {
  /** Current connection status */
  status: WhatsAppConnectionStatus;
  /** Child content (configuration steps, etc.) */
  children?: React.ReactNode;
}

/**
 * Card showing WhatsApp connection status.
 *
 * Features:
 * - Visual status indicator (connected/pending)
 * - Phone number display when connected
 * - Warning banner when not configured
 */
export function ConnectionStatusCard({
  status,
  children,
}: ConnectionStatusCardProps): React.ReactElement {
  return (
    <div className="bg-genesis-surface rounded-2xl border border-genesis-border-subtle p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              status.connected
                ? 'bg-green-50 dark:bg-green-900/30'
                : 'bg-amber-50 dark:bg-amber-900/30'
            }`}
          >
            <MessageCircle
              className={`w-5 h-5 ${
                status.connected
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            />
          </div>
          <div>
            <h3 className="font-semibold text-genesis-dark">
              WhatsApp Business API
            </h3>
            <p className="text-sm text-genesis-muted">
              {status.connected
                ? `Conectado: ${status.phoneNumber}`
                : 'Não configurado'}
            </p>
          </div>
        </div>

        <StatusBadge connected={status.connected} />
      </div>

      {/* Warning when not connected */}
      {!status.connected && <ConfigurationWarning />}

      {/* Additional content */}
      {children}
    </div>
  );
}

/**
 * Status badge component.
 */
function StatusBadge({ connected }: { connected: boolean }): React.ReactElement {
  return (
    <div
      className={`px-3 py-1.5 rounded-full text-xs font-medium ${
        connected
          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
      }`}
    >
      {connected ? 'Ativo' : 'Pendente Configuração'}
    </div>
  );
}

/**
 * Warning banner for missing configuration.
 */
function ConfigurationWarning(): React.ReactElement {
  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
      <div className="flex gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            Configuração necessária
          </p>
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
            Para ativar lembretes automáticos via WhatsApp, configure as
            credenciais da Meta Business API.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ConnectionStatusCard;
