/**
 * NotificationPreferences Component
 *
 * User preferences for multi-channel notifications.
 * Inspired by Klara's 80%+ adoption rate through simplicity.
 *
 * Channels:
 * - WhatsApp (primary for Brazil)
 * - SMS (fallback)
 * - Email
 * - Push notifications
 */

import React, { useState, useCallback } from 'react';
import {
  Bell,
  MessageSquare,
  Mail,
  Smartphone,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';

// ============================================================================
// Types
// ============================================================================

export interface NotificationChannel {
  id: 'whatsapp' | 'sms' | 'email' | 'push';
  enabled: boolean;
}

export interface ReminderTiming {
  id: string;
  label: string;
  hours: number;
  enabled: boolean;
}

export interface NotificationPreferencesData {
  channels: NotificationChannel[];
  reminders: ReminderTiming[];
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm
    end: string; // HH:mm
  };
}

interface NotificationPreferencesProps {
  /** Initial preferences */
  preferences?: NotificationPreferencesData;
  /** Save handler */
  onSave?: (preferences: NotificationPreferencesData) => Promise<void>;
  /** Whether user is patient (simplified view) or professional */
  isPatient?: boolean;
}

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_PREFERENCES: NotificationPreferencesData = {
  channels: [
    { id: 'whatsapp', enabled: true },
    { id: 'sms', enabled: false },
    { id: 'email', enabled: true },
    { id: 'push', enabled: true },
  ],
  reminders: [
    { id: '7d', label: '7 dias antes', hours: 168, enabled: false },
    { id: '24h', label: '24 horas antes', hours: 24, enabled: true },
    { id: '2h', label: '2 horas antes', hours: 2, enabled: true },
  ],
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '07:00',
  },
};

const CHANNEL_CONFIG = {
  whatsapp: {
    icon: MessageSquare,
    label: 'WhatsApp',
    description: 'Lembretes e confirmações via WhatsApp',
    color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30',
  },
  sms: {
    icon: Smartphone,
    label: 'SMS',
    description: 'Mensagens de texto (pode haver custos)',
    color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30',
  },
  email: {
    icon: Mail,
    label: 'E-mail',
    description: 'Confirmações e instruções detalhadas',
    color: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/30',
  },
  push: {
    icon: Bell,
    label: 'Push',
    description: 'Notificações no navegador/app',
    color: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/30',
  },
};

// ============================================================================
// Sub-Components
// ============================================================================

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ enabled, onChange, disabled }) => (
  <button
    type="button"
    onClick={() => !disabled && onChange(!enabled)}
    disabled={disabled}
    className={`
      relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full
      border-2 border-transparent transition-colors duration-200 ease-in-out
      focus:outline-none focus:ring-2 focus:ring-genesis-primary focus:ring-offset-2
      ${enabled ? 'bg-genesis-primary' : 'bg-genesis-border'}
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `}
  >
    <span
      className={`
        pointer-events-none inline-block h-5 w-5 transform rounded-full
        bg-white shadow ring-0 transition duration-200 ease-in-out
        ${enabled ? 'translate-x-5' : 'translate-x-0'}
      `}
    />
  </button>
);

interface ChannelCardProps {
  channel: NotificationChannel;
  onToggle: (id: string, enabled: boolean) => void;
}

const ChannelCard: React.FC<ChannelCardProps> = ({ channel, onToggle }) => {
  const config = CHANNEL_CONFIG[channel.id];
  const Icon = config.icon;

  return (
    <div
      className={`
        p-4 rounded-xl border transition-all
        ${channel.enabled ? 'border-genesis-primary/30 bg-genesis-primary/5' : 'border-genesis-border-subtle bg-genesis-surface'}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${config.color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="font-medium text-genesis-dark">{config.label}</p>
            <p className="text-xs text-genesis-muted">{config.description}</p>
          </div>
        </div>
        <ToggleSwitch enabled={channel.enabled} onChange={(e) => onToggle(channel.id, e)} />
      </div>
    </div>
  );
};

interface ReminderOptionProps {
  reminder: ReminderTiming;
  onToggle: (id: string, enabled: boolean) => void;
}

const ReminderOption: React.FC<ReminderOptionProps> = ({ reminder, onToggle }) => (
  <label className="flex items-center justify-between p-3 rounded-lg hover:bg-genesis-hover cursor-pointer transition-colors">
    <div className="flex items-center gap-3">
      <Clock className="w-4 h-4 text-genesis-muted" />
      <span className="text-sm text-genesis-dark">{reminder.label}</span>
    </div>
    <input
      type="checkbox"
      checked={reminder.enabled}
      onChange={(e) => onToggle(reminder.id, e.target.checked)}
      className="w-4 h-4 text-genesis-primary border-genesis-border rounded focus:ring-genesis-primary"
    />
  </label>
);

// ============================================================================
// Main Component
// ============================================================================

export function NotificationPreferences({
  preferences: initialPreferences,
  onSave,
  isPatient = false,
}: NotificationPreferencesProps): React.ReactElement {
  const [preferences, setPreferences] = useState<NotificationPreferencesData>(
    initialPreferences || DEFAULT_PREFERENCES
  );
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Channel toggle handler
  const handleChannelToggle = useCallback((id: string, enabled: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      channels: prev.channels.map((c) => (c.id === id ? { ...c, enabled } : c)),
    }));
    setHasChanges(true);
  }, []);

  // Reminder toggle handler
  const handleReminderToggle = useCallback((id: string, enabled: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      reminders: prev.reminders.map((r) => (r.id === id ? { ...r, enabled } : r)),
    }));
    setHasChanges(true);
  }, []);

  // Quiet hours handler
  const handleQuietHoursToggle = useCallback((enabled: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      quietHours: { ...prev.quietHours, enabled },
    }));
    setHasChanges(true);
  }, []);

  const handleQuietHoursChange = useCallback((field: 'start' | 'end', value: string) => {
    setPreferences((prev) => ({
      ...prev,
      quietHours: { ...prev.quietHours, [field]: value },
    }));
    setHasChanges(true);
  }, []);

  // Save handler
  const handleSave = useCallback(async () => {
    if (!onSave) {
      toast.success('Preferências salvas (modo demo)');
      setHasChanges(false);
      return;
    }

    setSaving(true);
    try {
      await onSave(preferences);
      toast.success('Preferências de notificação salvas!');
      setHasChanges(false);
    } catch {
      toast.error('Erro ao salvar preferências');
    } finally {
      setSaving(false);
    }
  }, [preferences, onSave]);

  // Count enabled channels
  const enabledChannels = preferences.channels.filter((c) => c.enabled).length;
  const enabledReminders = preferences.reminders.filter((r) => r.enabled).length;

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div
        className={`
          p-4 rounded-xl flex items-start gap-3
          ${enabledChannels > 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}
        `}
      >
        {enabledChannels > 0 ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        )}
        <div>
          <p className="font-medium text-genesis-dark">
            {enabledChannels > 0
              ? `${enabledChannels} canal(is) ativo(s)`
              : 'Nenhum canal de notificação ativo'}
          </p>
          <p className="text-sm text-genesis-muted mt-0.5">
            {enabledChannels > 0
              ? 'Você receberá lembretes de consultas pelos canais selecionados.'
              : 'Ative pelo menos um canal para receber lembretes de consultas.'}
          </p>
        </div>
      </div>

      {/* Channels Section */}
      <div>
        <h3 className="text-sm font-semibold text-genesis-dark mb-3">Canais de Notificação</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {preferences.channels.map((channel) => (
            <ChannelCard key={channel.id} channel={channel} onToggle={handleChannelToggle} />
          ))}
        </div>
      </div>

      {/* Reminders Section */}
      <div>
        <h3 className="text-sm font-semibold text-genesis-dark mb-3">Lembretes de Consulta</h3>
        <div className="bg-genesis-surface rounded-xl border border-genesis-border-subtle divide-y divide-genesis-border-subtle">
          {preferences.reminders.map((reminder) => (
            <ReminderOption key={reminder.id} reminder={reminder} onToggle={handleReminderToggle} />
          ))}
        </div>
        <p className="text-xs text-genesis-muted mt-2">
          {enabledReminders} lembrete(s) configurado(s)
        </p>
      </div>

      {/* Quiet Hours Section (Professional only) */}
      {!isPatient && (
        <div>
          <h3 className="text-sm font-semibold text-genesis-dark mb-3">Horário de Silêncio</h3>
          <div className="bg-genesis-surface rounded-xl border border-genesis-border-subtle p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-medium text-genesis-dark">Não perturbe</p>
                <p className="text-xs text-genesis-muted">
                  Pausar notificações durante horário definido
                </p>
              </div>
              <ToggleSwitch
                enabled={preferences.quietHours.enabled}
                onChange={handleQuietHoursToggle}
              />
            </div>

            {preferences.quietHours.enabled && (
              <div className="flex items-center gap-4 pt-4 border-t border-genesis-border-subtle">
                <div className="flex-1">
                  <label className="block text-xs text-genesis-muted mb-1">Início</label>
                  <input
                    type="time"
                    value={preferences.quietHours.start}
                    onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-genesis-border bg-genesis-bg text-genesis-dark text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-genesis-muted mb-1">Fim</label>
                  <input
                    type="time"
                    value={preferences.quietHours.end}
                    onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-genesis-border bg-genesis-bg text-genesis-dark text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Save Button */}
      {hasChanges && (
        <div className="flex justify-end pt-4 border-t border-genesis-border-subtle">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-genesis-primary text-white rounded-xl font-medium hover:bg-genesis-primary-dark transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar Preferências
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default NotificationPreferences;
