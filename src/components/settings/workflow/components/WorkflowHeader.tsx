/**
 * Workflow Header
 * ===============
 *
 * Header section with title and save button.
 *
 * @module components/settings/workflow/components/WorkflowHeader
 */

import React from 'react';
import { Zap, Save, RefreshCw } from 'lucide-react';

interface WorkflowHeaderProps {
  saving: boolean;
  onSave: () => void;
}

/**
 * Header for workflow settings page.
 */
export function WorkflowHeader({
  saving,
  onSave,
}: WorkflowHeaderProps): React.ReactElement {
  return (
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
          onClick={onSave}
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
  );
}

export default WorkflowHeader;
