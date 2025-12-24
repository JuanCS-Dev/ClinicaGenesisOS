/**
 * Workflow Settings Types
 * =======================
 *
 * Type definitions for automated workflow configuration.
 *
 * @module components/settings/workflow/types
 */

import type React from 'react';

/**
 * Base workflow configuration.
 */
export interface WorkflowConfig {
  enabled: boolean;
  templateName?: string;
  delayHours?: number;
  customMessage?: string;
}

/**
 * Follow-up workflow configuration.
 */
export interface FollowUpConfig extends WorkflowConfig {
  delayHours: number;
}

/**
 * NPS survey workflow configuration.
 */
export interface NpsConfig extends WorkflowConfig {
  delayHours: number;
}

/**
 * Patient return reminder configuration.
 */
export interface PatientReturnConfig extends WorkflowConfig {
  inactiveDays: number;
  reminderFrequencyDays: number;
}

/**
 * Labs integration configuration.
 */
export interface LabsIntegrationConfig extends WorkflowConfig {
  webhookSecret?: string;
  notifyPatient: boolean;
  notifyDoctor: boolean;
}

/**
 * Complete workflow settings object.
 */
export interface WorkflowSettingsData {
  followUp: FollowUpConfig;
  nps: NpsConfig;
  patientReturn: PatientReturnConfig;
  labsIntegration: LabsIntegrationConfig;
}

/**
 * Workflow IDs.
 */
export type WorkflowId = keyof WorkflowSettingsData;

/**
 * Workflow category for grouping.
 */
export type WorkflowCategory = 'communication' | 'analytics' | 'integration';

/**
 * Workflow definition for display.
 */
export interface WorkflowDefinition {
  id: WorkflowId;
  name: string;
  description: string;
  icon: React.ElementType;
  color: 'blue' | 'purple' | 'emerald' | 'amber';
  category: WorkflowCategory;
}
