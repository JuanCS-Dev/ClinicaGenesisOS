/**
 * Workflow Settings Component
 *
 * Configuration for automated workflow features.
 * Manages: Follow-up, NPS, Patient Return, Labs Integration.
 *
 * @module components/settings/WorkflowSettings
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Zap,
  MessageSquare,
  BarChart3,
  Users,
  FlaskConical,
  Settings,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Save,
  RefreshCw,
  Copy,
  ExternalLink,
  Info,
} from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useClinicContext } from '@/contexts/ClinicContext';
import { toast } from 'sonner';

// =============================================================================
// TYPES
// =============================================================================

interface WorkflowConfig {
  enabled: boolean;
  templateName?: string;
  delayHours?: number;
  customMessage?: string;
}

interface WorkflowSettings {
  followUp: WorkflowConfig & { delayHours: number };
  nps: WorkflowConfig & { delayHours: number };
  patientReturn: WorkflowConfig & {
    inactiveDays: number;
    reminderFrequencyDays: number;
  };
  labsIntegration: WorkflowConfig & {
    webhookSecret?: string;
    notifyPatient: boolean;
    notifyDoctor: boolean;
  };
}

const DEFAULT_SETTINGS: WorkflowSettings = {
  followUp: { enabled: false, delayHours: 24, templateName: 'consulta_followup' },
  nps: { enabled: false, delayHours: 2, templateName: 'nps_survey' },
  patientReturn: {
    enabled: false,
    inactiveDays: 90,
    reminderFrequencyDays: 30,
    templateName: 'retorno_lembrete',
  },
  labsIntegration: {
    enabled: false,
    notifyPatient: true,
    notifyDoctor: true,
  },
};

// =============================================================================
// WORKFLOW DEFINITIONS
// =============================================================================

interface WorkflowDefinition {
  id: keyof WorkflowSettings;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  category: 'communication' | 'analytics' | 'integration';
}

const WORKFLOWS: WorkflowDefinition[] = [
  {
    id: 'followUp',
    name: 'Follow-up Pos-Consulta',
    description: 'Envia mensagem de acompanhamento apos consultas finalizadas',
    icon: MessageSquare,
    color: 'blue',
    category: 'communication',
  },
  {
    id: 'nps',
    name: 'Pesquisa NPS',
    description: 'Coleta satisfacao do paciente apos atendimento',
    icon: BarChart3,
    color: 'purple',
    category: 'analytics',
  },
  {
    id: 'patientReturn',
    name: 'Lembrete de Retorno',
    description: 'Lembra pacientes inativos de agendar consulta',
    icon: Users,
    color: 'emerald',
    category: 'communication',
  },
  {
    id: 'labsIntegration',
    name: 'Integracao Labs',
    description: 'Recebe resultados de laboratorios externos',
    icon: FlaskConical,
    color: 'amber',
    category: 'integration',
  },
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function WorkflowSettings(): React.ReactElement {
  const { clinic } = useClinicContext();
  const [settings, setSettings] = useState<WorkflowSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedWorkflow, setExpandedWorkflow] = useState<keyof WorkflowSettings | null>(null);

  // Load settings
  useEffect(() => {
    async function loadSettings() {
      if (!clinic?.id) return;

      try {
        const settingsDoc = await getDoc(
          doc(db, 'clinics', clinic.id, 'settings', 'workflows')
        );

        if (settingsDoc.exists()) {
          setSettings({ ...DEFAULT_SETTINGS, ...settingsDoc.data() } as WorkflowSettings);
        }
      } catch (error) {
        console.error('Failed to load workflow settings:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [clinic?.id]);

  // Save settings
  const handleSave = useCallback(async () => {
    if (!clinic?.id) return;

    setSaving(true);
    try {
      await setDoc(doc(db, 'clinics', clinic.id, 'settings', 'workflows'), {
        ...settings,
        updatedAt: new Date().toISOString(),
      });
      toast.success('Configuracoes salvas com sucesso');
    } catch (error) {
      console.error('Failed to save workflow settings:', error);
      toast.error('Erro ao salvar configuracoes');
    } finally {
      setSaving(false);
    }
  }, [clinic?.id, settings]);

  // Toggle workflow enabled
  const toggleWorkflow = useCallback(
    (workflowId: keyof WorkflowSettings) => {
      setSettings((prev) => ({
        ...prev,
        [workflowId]: {
          ...prev[workflowId],
          enabled: !prev[workflowId].enabled,
        },
      }));
    },
    []
  );

  // Update workflow config
  const updateWorkflowConfig = useCallback(
    (workflowId: keyof WorkflowSettings, field: string, value: unknown) => {
      setSettings((prev) => ({
        ...prev,
        [workflowId]: {
          ...prev[workflowId],
          [field]: value,
        },
      }));
    },
    []
  );

  // Copy webhook URL
  const copyWebhookUrl = useCallback(() => {
    const webhookUrl = `https://southamerica-east1-clinica-genesis-os-e689e.cloudfunctions.net/labsResultWebhook`;
    navigator.clipboard.writeText(webhookUrl);
    toast.success('URL copiada!');
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-genesis-soft rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-genesis-surface rounded-2xl border border-genesis-border-subtle p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-genesis-primary/20 to-genesis-primary/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-genesis-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-genesis-dark">Automacoes</h3>
              <p className="text-sm text-genesis-muted">
                Configure workflows automaticos para sua clinica
              </p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-genesis-primary text-white rounded-xl font-medium hover:bg-genesis-primary-dark transition-colors disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Salvar
          </button>
        </div>
      </div>

      {/* Workflows List */}
      <div className="space-y-4">
        {WORKFLOWS.map((workflow) => {
          const config = settings[workflow.id];
          const isExpanded = expandedWorkflow === workflow.id;
          const Icon = workflow.icon;

          const colorClasses: Record<string, string> = {
            blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
            purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
            emerald: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
            amber: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
          };

          return (
            <div
              key={workflow.id}
              className="bg-genesis-surface rounded-xl border border-genesis-border-subtle overflow-hidden"
            >
              {/* Workflow Header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-genesis-hover transition-colors"
                onClick={() => setExpandedWorkflow(isExpanded ? null : workflow.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[workflow.color]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-genesis-dark">{workflow.name}</h4>
                    <p className="text-sm text-genesis-muted">{workflow.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      config.enabled
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}
                  >
                    {config.enabled ? 'Ativo' : 'Inativo'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWorkflow(workflow.id);
                    }}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      config.enabled ? 'bg-genesis-primary' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        config.enabled ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
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
                  {/* Follow-up Config */}
                  {workflow.id === 'followUp' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-genesis-text mb-1">
                          Delay (horas apos consulta)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={72}
                          value={settings.followUp.delayHours}
                          onChange={(e) =>
                            updateWorkflowConfig('followUp', 'delayHours', parseInt(e.target.value))
                          }
                          className="w-32 px-3 py-2 border border-genesis-border rounded-lg bg-genesis-surface text-genesis-text"
                        />
                      </div>
                      <InfoBox>
                        Mensagem enviada automaticamente apos o tempo configurado quando a consulta e finalizada.
                      </InfoBox>
                    </>
                  )}

                  {/* NPS Config */}
                  {workflow.id === 'nps' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-genesis-text mb-1">
                          Delay (horas apos consulta)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={24}
                          value={settings.nps.delayHours}
                          onChange={(e) =>
                            updateWorkflowConfig('nps', 'delayHours', parseInt(e.target.value))
                          }
                          className="w-32 px-3 py-2 border border-genesis-border rounded-lg bg-genesis-surface text-genesis-text"
                        />
                      </div>
                      <InfoBox>
                        Pesquisa de satisfacao (0-10) enviada para pacientes apos consultas. Detractors (0-6) geram alerta.
                      </InfoBox>
                    </>
                  )}

                  {/* Patient Return Config */}
                  {workflow.id === 'patientReturn' && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-genesis-text mb-1">
                            Dias de inatividade
                          </label>
                          <input
                            type="number"
                            min={30}
                            max={365}
                            value={settings.patientReturn.inactiveDays}
                            onChange={(e) =>
                              updateWorkflowConfig('patientReturn', 'inactiveDays', parseInt(e.target.value))
                            }
                            className="w-full px-3 py-2 border border-genesis-border rounded-lg bg-genesis-surface text-genesis-text"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-genesis-text mb-1">
                            Frequencia de lembrete (dias)
                          </label>
                          <input
                            type="number"
                            min={7}
                            max={90}
                            value={settings.patientReturn.reminderFrequencyDays}
                            onChange={(e) =>
                              updateWorkflowConfig('patientReturn', 'reminderFrequencyDays', parseInt(e.target.value))
                            }
                            className="w-full px-3 py-2 border border-genesis-border rounded-lg bg-genesis-surface text-genesis-text"
                          />
                        </div>
                      </div>
                      <InfoBox>
                        Envia lembretes para pacientes que nao consultam ha mais de {settings.patientReturn.inactiveDays} dias.
                        Limite: 50 lembretes/dia por clinica.
                      </InfoBox>
                    </>
                  )}

                  {/* Labs Integration Config */}
                  {workflow.id === 'labsIntegration' && (
                    <>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-genesis-text mb-1">
                            Webhook URL
                          </label>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 px-3 py-2 bg-genesis-surface border border-genesis-border rounded-lg text-sm font-mono text-genesis-text truncate">
                              https://...cloudfunctions.net/labsResultWebhook
                            </code>
                            <button
                              onClick={copyWebhookUrl}
                              className="p-2 hover:bg-genesis-hover rounded-lg"
                              title="Copiar URL"
                            >
                              <Copy className="w-4 h-4 text-genesis-muted" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.labsIntegration.notifyPatient}
                              onChange={(e) =>
                                updateWorkflowConfig('labsIntegration', 'notifyPatient', e.target.checked)
                              }
                              className="w-4 h-4 rounded border-genesis-border text-genesis-primary focus:ring-genesis-primary"
                            />
                            <span className="text-sm text-genesis-text">Notificar paciente</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.labsIntegration.notifyDoctor}
                              onChange={(e) =>
                                updateWorkflowConfig('labsIntegration', 'notifyDoctor', e.target.checked)
                              }
                              className="w-4 h-4 rounded border-genesis-border text-genesis-primary focus:ring-genesis-primary"
                            />
                            <span className="text-sm text-genesis-text">Notificar medico (valores criticos)</span>
                          </label>
                        </div>
                      </div>

                      <InfoBox>
                        Configure o laboratorio para enviar resultados via POST para o webhook.
                        Inclua o header <code className="px-1 bg-genesis-soft rounded">X-Clinic-Id: {clinic?.id}</code>
                      </InfoBox>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Status Summary */}
      <div className="bg-genesis-surface rounded-xl border border-genesis-border-subtle p-4">
        <h4 className="text-sm font-medium text-genesis-dark mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-genesis-muted" />
          Agendamento dos Workflows
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-genesis-muted">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            Follow-up: A cada 2 horas
          </div>
          <div className="flex items-center gap-2 text-genesis-muted">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            NPS: A cada 1 hora
          </div>
          <div className="flex items-center gap-2 text-genesis-muted">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            Retorno: Diario as 10:00
          </div>
          <div className="flex items-center gap-2 text-genesis-muted">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            Labs: Tempo real (webhook)
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function InfoBox({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-blue-700 dark:text-blue-300">{children}</p>
    </div>
  );
}

export default WorkflowSettings;
