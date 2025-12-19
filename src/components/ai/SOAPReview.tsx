/**
 * SOAPReview Component
 * ====================
 *
 * Modal for reviewing and editing AI-generated SOAP notes before saving.
 * Displays transcription alongside SOAP for context.
 */

import React, { useState } from 'react';
import { X, Check, AlertTriangle, Bot, Edit3, FileText } from 'lucide-react';
import type { AIScribeResult } from '../../types';

interface SOAPReviewProps {
  /** AI-generated result to review. */
  result: AIScribeResult;
  /** Called when user approves the SOAP note. */
  onApprove: (editedSoap: AIScribeResult['soap']) => void;
  /** Called when user cancels/closes. */
  onCancel: () => void;
  /** Whether save is in progress. */
  isSaving?: boolean;
}

/**
 * Modal for reviewing AI-generated SOAP notes.
 *
 * Features:
 * - Side-by-side transcription and SOAP view
 * - Editable SOAP fields
 * - AI-generated indicator
 * - Approval workflow
 */
export function SOAPReview({
  result,
  onApprove,
  onCancel,
  isSaving = false,
}: SOAPReviewProps): React.ReactElement {
  const [editedSoap, setEditedSoap] = useState(result.soap);
  const [activeTab, setActiveTab] = useState<'soap' | 'transcription'>('soap');

  const handleFieldChange = (
    field: keyof typeof editedSoap,
    value: string
  ) => {
    setEditedSoap((prev) => ({ ...prev, [field]: value }));
  };

  const handleApprove = () => {
    onApprove(editedSoap);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bot className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Revisar Nota SOAP
              </h2>
              <p className="text-sm text-gray-500">
                Gerada por IA - Revise antes de salvar
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Warning banner */}
        <div className="flex items-center gap-2 px-6 py-3 bg-amber-50 border-b border-amber-100">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <p className="text-sm text-amber-700">
            Conteúdo gerado por IA. Revise cuidadosamente antes de aprovar.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-6">
          <button
            onClick={() => setActiveTab('soap')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'soap'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              Nota SOAP
            </span>
          </button>
          <button
            onClick={() => setActiveTab('transcription')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'transcription'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
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
              {/* Subjective */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  S - Subjetivo
                </label>
                <textarea
                  value={editedSoap.subjective}
                  onChange={(e) => handleFieldChange('subjective', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Queixa principal, história da doença atual..."
                />
              </div>

              {/* Objective */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  O - Objetivo
                </label>
                <textarea
                  value={editedSoap.objective}
                  onChange={(e) => handleFieldChange('objective', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Dados objetivos, exame físico, sinais vitais..."
                />
              </div>

              {/* Assessment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  A - Avaliação
                </label>
                <textarea
                  value={editedSoap.assessment}
                  onChange={(e) => handleFieldChange('assessment', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Diagnóstico, impressão clínica..."
                />
              </div>

              {/* Plan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  P - Plano
                </label>
                <textarea
                  value={editedSoap.plan}
                  onChange={(e) => handleFieldChange('plan', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Conduta, prescrições, orientações, retorno..."
                />
              </div>

              {/* Extracted data summary */}
              {result.extractedData && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Dados Extraídos
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {result.extractedData.chiefComplaint && (
                      <div>
                        <span className="text-gray-500">Queixa:</span>{' '}
                        {result.extractedData.chiefComplaint}
                      </div>
                    )}
                    {result.extractedData.symptoms?.length && (
                      <div>
                        <span className="text-gray-500">Sintomas:</span>{' '}
                        {result.extractedData.symptoms.join(', ')}
                      </div>
                    )}
                    {result.extractedData.medications?.length && (
                      <div>
                        <span className="text-gray-500">Medicações:</span>{' '}
                        {result.extractedData.medications.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="prose prose-sm max-w-none">
              <div className="p-4 bg-gray-50 rounded-lg font-mono text-sm whitespace-pre-wrap">
                {result.transcription || 'Nenhuma transcrição disponível.'}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Bot className="w-4 h-4" />
            <span>
              Processado em{' '}
              {result.processingTimeMs
                ? `${(result.processingTimeMs / 1000).toFixed(1)}s`
                : '—'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              disabled={isSaving}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleApprove}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
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
