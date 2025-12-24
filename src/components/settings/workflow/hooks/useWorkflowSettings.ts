/**
 * Workflow Settings Hook
 * ======================
 *
 * Manages workflow settings state, loading, and persistence.
 *
 * @module components/settings/workflow/hooks/useWorkflowSettings
 */

import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useClinicContext } from '@/contexts/ClinicContext';
import { toast } from 'sonner';
import type { WorkflowSettingsData, WorkflowId } from '../types';
import { DEFAULT_WORKFLOW_SETTINGS, LABS_WEBHOOK_URL } from '../constants';

interface UseWorkflowSettingsReturn {
  /** Current settings */
  settings: WorkflowSettingsData;
  /** Whether settings are loading */
  loading: boolean;
  /** Whether settings are being saved */
  saving: boolean;
  /** Currently expanded workflow */
  expandedWorkflow: WorkflowId | null;
  /** Clinic ID for display */
  clinicId: string | undefined;
  /** Toggle a workflow's expanded state */
  toggleExpanded: (workflowId: WorkflowId) => void;
  /** Toggle a workflow's enabled state */
  toggleEnabled: (workflowId: WorkflowId) => void;
  /** Update a workflow config field */
  updateConfig: (workflowId: WorkflowId, field: string, value: unknown) => void;
  /** Save settings to Firestore */
  save: () => Promise<void>;
  /** Copy labs webhook URL to clipboard */
  copyWebhookUrl: () => void;
}

/**
 * Hook for managing workflow settings.
 *
 * Handles:
 * - Loading settings from Firestore
 * - Saving settings to Firestore
 * - UI state (expanded, enabled toggles)
 *
 * @example
 * ```tsx
 * const { settings, loading, save } = useWorkflowSettings();
 *
 * if (loading) return <Skeleton />;
 *
 * return (
 *   <button onClick={save}>Save</button>
 * );
 * ```
 */
export function useWorkflowSettings(): UseWorkflowSettingsReturn {
  const { clinic } = useClinicContext();
  const [settings, setSettings] = useState<WorkflowSettingsData>(DEFAULT_WORKFLOW_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedWorkflow, setExpandedWorkflow] = useState<WorkflowId | null>(null);

  // Load settings from Firestore
  useEffect(() => {
    async function loadSettings(): Promise<void> {
      if (!clinic?.id) return;

      try {
        const settingsDoc = await getDoc(
          doc(db, 'clinics', clinic.id, 'settings', 'workflows')
        );

        if (settingsDoc.exists()) {
          setSettings({
            ...DEFAULT_WORKFLOW_SETTINGS,
            ...settingsDoc.data(),
          } as WorkflowSettingsData);
        }
      } catch (error) {
        console.error('Failed to load workflow settings:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [clinic?.id]);

  // Save settings to Firestore
  const save = useCallback(async (): Promise<void> => {
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

  // Toggle expanded state
  const toggleExpanded = useCallback((workflowId: WorkflowId): void => {
    setExpandedWorkflow((prev) => (prev === workflowId ? null : workflowId));
  }, []);

  // Toggle enabled state
  const toggleEnabled = useCallback((workflowId: WorkflowId): void => {
    setSettings((prev) => ({
      ...prev,
      [workflowId]: {
        ...prev[workflowId],
        enabled: !prev[workflowId].enabled,
      },
    }));
  }, []);

  // Update a config field
  const updateConfig = useCallback(
    (workflowId: WorkflowId, field: string, value: unknown): void => {
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
  const copyWebhookUrl = useCallback((): void => {
    navigator.clipboard.writeText(LABS_WEBHOOK_URL);
    toast.success('URL copiada!');
  }, []);

  return {
    settings,
    loading,
    saving,
    expandedWorkflow,
    clinicId: clinic?.id,
    toggleExpanded,
    toggleEnabled,
    updateConfig,
    save,
    copyWebhookUrl,
  };
}

export default useWorkflowSettings;
