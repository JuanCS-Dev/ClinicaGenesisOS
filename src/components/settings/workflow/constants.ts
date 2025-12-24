/**
 * Workflow Settings Constants
 * ===========================
 *
 * Constants and default values for workflow configuration.
 *
 * @module components/settings/workflow/constants
 */

import { MessageSquare, BarChart3, Users, FlaskConical } from 'lucide-react';
import type { WorkflowSettingsData, WorkflowDefinition } from './types';

/**
 * Default workflow settings.
 */
export const DEFAULT_WORKFLOW_SETTINGS: WorkflowSettingsData = {
  followUp: {
    enabled: false,
    delayHours: 24,
    templateName: 'consulta_followup',
  },
  nps: {
    enabled: false,
    delayHours: 2,
    templateName: 'nps_survey',
  },
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

/**
 * Workflow definitions for UI display.
 */
export const WORKFLOW_DEFINITIONS: WorkflowDefinition[] = [
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

/**
 * Color class mappings for workflow icons.
 */
export const WORKFLOW_COLOR_CLASSES: Record<WorkflowDefinition['color'], string> = {
  blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  emerald: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  amber: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
};

/**
 * Labs webhook URL.
 */
export const LABS_WEBHOOK_URL =
  'https://southamerica-east1-clinica-genesis-os-e689e.cloudfunctions.net/labsResultWebhook';
