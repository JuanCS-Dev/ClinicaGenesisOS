/**
 * SOAPReview Component
 * ====================
 *
 * Modal for reviewing and editing AI-generated SOAP notes before saving.
 * Features quick accept/reject per section and CID-10 suggestions.
 *
 * Inspired by Carbon Health's 88% AI acceptance rate.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  X,
  Check,
  AlertTriangle,
  Bot,
  Edit3,
  FileText,
  RotateCcw,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import type { AIScribeResult } from '../../types';
import { CID10Suggestions } from './CID10Suggestions';

// ============================================================================
// Types
// ============================================================================

interface SOAPReviewProps {
  result: AIScribeResult;
  onApprove: (editedSoap: AIScribeResult['soap']) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

type SOAPField = 'subjective' | 'objective' | 'assessment' | 'plan';
type FieldStatus = 'pending' | 'accepted' | 'edited';

interface FieldState {
  status: FieldStatus;
  original: string;
  current: string;
}

// ============================================================================
// Sub-Components
// ============================================================================

interface SOAPFieldEditorProps {
  field: SOAPField;
  label: string;
  shortLabel: string;
  state: FieldState;
  onAccept: () => void;
  onReset: () => void;
  onChange: (value: string) => void;
  rows?: number;
  placeholder: string;
  children?: React.ReactNode;
}

const SOAPFieldEditor: React.FC<SOAPFieldEditorProps> = ({
  field: _field,
  label,
  shortLabel,
  state,
  onAccept,
  onReset,
  onChange,
  rows = 3,
  placeholder,
  children,
}) => {
  const statusColors = {
    pending: 'border-amber-200 bg-amber-50/50',
    accepted: 'border-emerald-200 bg-emerald-50/50',
    edited: 'border-blue-200 bg-blue-50/50',
  };

  const statusIcons = {
    pending: <Sparkles className="w-3.5 h-3.5 text-amber-500" />,
    accepted: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
    edited: <Edit3 className="w-3.5 h-3.5 text-blue-500" />,
  };

  const statusLabels = {
    pending: 'IA',
    accepted: 'Aprovado',
    edited: 'Editado',
  };

  return (
    <div className={`rounded-xl border p-4 transition-colors ${statusColors[state.status]}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center">
            {shortLabel}
          </span>
          <label className="text-sm font-medium text-genesis-dark">{label}</label>
          <span className="flex items-center gap-1 text-xs text-genesis-muted">
            {statusIcons[state.status]}
            {statusLabels[state.status]}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {state.status === 'pending' && (
            <button
              onClick={onAccept}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              Aceitar
            </button>
          )}
          {(state.status === 'edited' || state.status === 'accepted') && state.current !== state.original && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-genesis-muted hover:text-genesis-dark hover:bg-genesis-hover rounded-lg transition-colors"
              title="Restaurar texto original da IA"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restaurar
            </button>
          )}
        </div>
      </div>
      <textarea
        value={state.current}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full px-3 py-2 border border-genesis-border rounded-lg bg-genesis-bg focus:ring-2 focus:ring-genesis-primary focus:border-genesis-primary resize-none text-sm"
        placeholder={placeholder}
      />
      {children}
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export function SOAPReview({
  result,
  onApprove,
  onCancel,
  isSaving = false,
}: SOAPReviewProps): React.ReactElement {
  // Initialize field states with original values
  const [fields, setFields] = useState<Record<SOAPField, FieldState>>(() => ({
    subjective: { status: 'pending', original: result.soap.subjective, current: result.soap.subjective },
    objective: { status: 'pending', original: result.soap.objective, current: result.soap.objective },
    assessment: { status: 'pending', original: result.soap.assessment, current: result.soap.assessment },
    plan: { status: 'pending', original: result.soap.plan, current: result.soap.plan },
  }));

  const [activeTab, setActiveTab] = useState<'soap' | 'transcription'>('soap');
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);

  // Field change handler
  const handleFieldChange = useCallback((field: SOAPField, value: string) => {
    setFields((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        current: value,
        status: value === prev[field].original ? 'pending' : 'edited',
      },
    }));
  }, []);

  // Accept field handler
  const handleAcceptField = useCallback((field: SOAPField) => {
    setFields((prev) => ({
      ...prev,
      [field]: { ...prev[field], status: 'accepted' },
    }));
  }, []);

  // Reset field to original
  const handleResetField = useCallback((field: SOAPField) => {
    setFields((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        current: prev[field].original,
        status: 'pending',
      },
    }));
  }, []);

  // Accept all fields
  const handleAcceptAll = useCallback(() => {
    setFields((prev) => {
      const updated = { ...prev };
      (Object.keys(updated) as SOAPField[]).forEach((key) => {
        if (updated[key].status === 'pending') {
          updated[key] = { ...updated[key], status: 'accepted' };
        }
      });
      return updated;
    });
  }, []);

  // CID-10 codes change
  const handleCodesChange = useCallback((codes: string[]) => {
    setSelectedCodes(codes);
  }, []);

  // Approve and save
  const handleApprove = () => {
    onApprove({
      subjective: fields.subjective.current,
      objective: fields.objective.current,
      assessment: fields.assessment.current,
      plan: fields.plan.current,
    });
  };

  // Calculate progress
  const progress = useMemo(() => {
    const total = 4;
    const fieldValues = Object.values(fields) as FieldState[];
    const approved = fieldValues.filter(
      (f) => f.status === 'accepted' || f.status === 'edited'
    ).length;
    return { approved, total, percentage: Math.round((approved / total) * 100) };
  }, [fields]);

  const allReviewed = progress.approved === progress.total;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-genesis-surface rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bot className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-genesis-dark">Revisar Nota SOAP</h2>
              <p className="text-sm text-genesis-muted">
                {progress.approved}/{progress.total} seções revisadas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleAcceptAll}
              disabled={allReviewed}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4" />
              Aceitar Tudo
            </button>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-genesis-hover rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-genesis-muted" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-6 py-2 border-b bg-genesis-soft">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-genesis-border rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <span className="text-xs font-medium text-genesis-muted">{progress.percentage}%</span>
          </div>
        </div>

        {/* Warning banner */}
        <div className="flex items-center gap-2 px-6 py-3 bg-amber-50 border-b border-amber-100">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <p className="text-sm text-amber-700">
            Conteúdo gerado por IA. Revise cuidadosamente antes de aprovar.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-6" role="tablist" aria-label="Seções da nota">
          <button
            role="tab"
            aria-selected={activeTab === 'soap'}
            onClick={() => setActiveTab('soap')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'soap'
                ? 'border-genesis-primary text-genesis-primary'
                : 'border-transparent text-genesis-muted hover:text-genesis-text'
            }`}
          >
            <span className="flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              Nota SOAP
            </span>
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'transcription'}
            onClick={() => setActiveTab('transcription')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'transcription'
                ? 'border-genesis-primary text-genesis-primary'
                : 'border-transparent text-genesis-muted hover:text-genesis-text'
            }`}
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Transcrição
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'soap' ? (
            <div className="space-y-4">
              <SOAPFieldEditor
                field="subjective"
                label="Subjetivo"
                shortLabel="S"
                state={fields.subjective}
                onAccept={() => handleAcceptField('subjective')}
                onReset={() => handleResetField('subjective')}
                onChange={(v) => handleFieldChange('subjective', v)}
                placeholder="Queixa principal, história da doença atual..."
              />

              <SOAPFieldEditor
                field="objective"
                label="Objetivo"
                shortLabel="O"
                state={fields.objective}
                onAccept={() => handleAcceptField('objective')}
                onReset={() => handleResetField('objective')}
                onChange={(v) => handleFieldChange('objective', v)}
                placeholder="Dados objetivos, exame físico, sinais vitais..."
              />

              <SOAPFieldEditor
                field="assessment"
                label="Avaliação"
                shortLabel="A"
                state={fields.assessment}
                onAccept={() => handleAcceptField('assessment')}
                onReset={() => handleResetField('assessment')}
                onChange={(v) => handleFieldChange('assessment', v)}
                placeholder="Diagnóstico, impressão clínica..."
              >
                <div className="mt-3">
                  <CID10Suggestions
                    assessmentText={fields.assessment.current}
                    selectedCodes={selectedCodes}
                    onCodesChange={handleCodesChange}
                  />
                </div>
              </SOAPFieldEditor>

              <SOAPFieldEditor
                field="plan"
                label="Plano"
                shortLabel="P"
                state={fields.plan}
                onAccept={() => handleAcceptField('plan')}
                onReset={() => handleResetField('plan')}
                onChange={(v) => handleFieldChange('plan', v)}
                placeholder="Conduta, prescrições, orientações, retorno..."
              />

              {/* Extracted data summary */}
              {result.extractedData && (
                <div className="p-4 bg-genesis-soft rounded-lg border border-genesis-border-subtle">
                  <h4 className="text-sm font-medium text-genesis-text mb-2">Dados Extraídos</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {result.extractedData.chiefComplaint && (
                      <div>
                        <span className="text-genesis-muted">Queixa:</span>{' '}
                        {result.extractedData.chiefComplaint}
                      </div>
                    )}
                    {result.extractedData.symptoms?.length && (
                      <div>
                        <span className="text-genesis-muted">Sintomas:</span>{' '}
                        {result.extractedData.symptoms.join(', ')}
                      </div>
                    )}
                    {result.extractedData.medications?.length && (
                      <div>
                        <span className="text-genesis-muted">Medicações:</span>{' '}
                        {result.extractedData.medications.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="prose prose-sm max-w-none">
              <div className="p-4 bg-genesis-soft rounded-lg font-mono text-sm whitespace-pre-wrap border border-genesis-border-subtle">
                {result.transcription || 'Nenhuma transcrição disponível.'}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-genesis-soft">
          <div className="flex items-center gap-2 text-xs text-genesis-muted">
            <Bot className="w-4 h-4" />
            <span>
              Processado em{' '}
              {result.processingTimeMs ? `${(result.processingTimeMs / 1000).toFixed(1)}s` : '—'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              disabled={isSaving}
              className="px-4 py-2 text-genesis-text hover:bg-genesis-hover rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleApprove}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 bg-genesis-primary hover:bg-genesis-primary-dark text-white rounded-lg font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-genesis-primary/20 disabled:opacity-50 disabled:hover:scale-100"
            >
              <Check className="w-4 h-4" />
              {isSaving ? 'Salvando...' : 'Aprovar e Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SOAPReview;
