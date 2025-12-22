/**
 * Data Export Request Component
 * =============================
 *
 * Allows users to request export of their personal data.
 * LGPD Art. 18, V - Data portability right.
 *
 * Fase 11: LGPD Compliance
 */

import React, { useState, useEffect } from 'react';
import {
  Download,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useClinicContext } from '../../contexts/ClinicContext';
import { useAuthContext } from '../../contexts/AuthContext';
import {
  createDataExportRequest,
  getUserExportRequests,
} from '../../services/firestore/lgpd.service';
import {
  RIGHT_LABELS,
  DATA_CATEGORY_LABELS,
  type DataExportRequest as DataExportRequestType,
  type DataSubjectRight,
  type DataCategory,
} from '@/types/lgpd';

/**
 * Status colors for export requests.
 */
const STATUS_CONFIG: Record<
  DataExportRequestType['status'],
  { color: string; bgColor: string; label: string }
> = {
  pending: { color: 'text-amber-600', bgColor: 'bg-amber-50', label: 'Pendente' },
  processing: { color: 'text-blue-600', bgColor: 'bg-blue-50', label: 'Processando' },
  completed: { color: 'text-green-600', bgColor: 'bg-green-50', label: 'Concluído' },
  failed: { color: 'text-red-600', bgColor: 'bg-red-50', label: 'Falhou' },
  expired: { color: 'text-genesis-medium', bgColor: 'bg-genesis-soft', label: 'Expirado' },
};

/**
 * Available export types.
 */
const EXPORT_TYPES: DataSubjectRight[] = [
  'access',
  'portability',
  'deletion',
];

/**
 * Available data categories for export.
 */
const EXPORTABLE_CATEGORIES: DataCategory[] = [
  'identification',
  'contact',
  'health',
  'financial',
];

/**
 * Data Export Request component.
 */
export const DataExportRequest: React.FC = () => {
  const { clinicId } = useClinicContext();
  const { user } = useAuthContext();

  // State
  const [requests, setRequests] = useState<DataExportRequestType[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [selectedType, setSelectedType] = useState<DataSubjectRight>('access');
  const [selectedCategories, setSelectedCategories] = useState<DataCategory[]>([
    'identification',
    'contact',
    'health',
  ]);
  const [format, setFormat] = useState<'json' | 'pdf' | 'csv'>('pdf');
  const [reason, setReason] = useState('');

  // Load existing requests
  useEffect(() => {
    const loadRequests = async () => {
      if (!clinicId || !user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const userRequests = await getUserExportRequests(clinicId, user.uid);
        setRequests(userRequests);
      } catch (err) {
        console.error('Failed to load export requests:', err);
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [clinicId, user?.uid]);

  // Toggle category selection
  const toggleCategory = (category: DataCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Submit new request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clinicId || !user?.uid) return;
    if (selectedCategories.length === 0) {
      setError('Selecione pelo menos uma categoria de dados');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      await createDataExportRequest(clinicId, user.uid, {
        type: selectedType,
        dataCategories: selectedCategories,
        format,
        reason: reason || undefined,
      });

      // Refresh list
      const userRequests = await getUserExportRequests(clinicId, user.uid);
      setRequests(userRequests);

      setSuccess(true);
      setReason('');
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to create export request:', err);
      setError('Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* New Request Form */}
      <div className="bg-genesis-surface rounded-2xl border border-genesis-border-subtle p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#4F46E5]/10 flex items-center justify-center">
            <Download className="w-5 h-5 text-[#4F46E5]" />
          </div>
          <div>
            <h3 className="font-semibold text-genesis-dark">
              Solicitar Meus Dados
            </h3>
            <p className="text-sm text-genesis-muted">
              LGPD Art. 18 - Direitos do Titular
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Request type */}
          <div>
            <label className="block text-sm font-medium text-genesis-text mb-2">
              Tipo de Solicitação
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {EXPORT_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedType === type
                      ? 'border-[#4F46E5] bg-[#4F46E5]/5 ring-1 ring-[#4F46E5]'
                      : 'border-genesis-border hover:border-genesis-border'
                  }`}
                >
                  <span className="font-medium text-genesis-dark text-sm">
                    {RIGHT_LABELS[type]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Data categories */}
          <div>
            <label className="block text-sm font-medium text-genesis-text mb-2">
              Categorias de Dados
            </label>
            <div className="flex flex-wrap gap-2">
              {EXPORTABLE_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    selectedCategories.includes(category)
                      ? 'bg-[#4F46E5] text-white'
                      : 'bg-genesis-hover text-genesis-medium hover:bg-genesis-border-subtle'
                  }`}
                >
                  {DATA_CATEGORY_LABELS[category]}
                </button>
              ))}
            </div>
          </div>

          {/* Format */}
          <div>
            <label className="block text-sm font-medium text-genesis-text mb-2">
              Formato
            </label>
            <div className="flex gap-2">
              {(['pdf', 'json', 'csv'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormat(f)}
                  className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                    format === f
                      ? 'border-[#4F46E5] bg-[#4F46E5]/5 text-[#4F46E5]'
                      : 'border-genesis-border text-genesis-medium hover:border-genesis-border'
                  }`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Reason (optional) */}
          <div>
            <label className="block text-sm font-medium text-genesis-text mb-1">
              Motivo (opcional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder="Descreva o motivo da solicitação..."
              className="w-full px-4 py-2 border border-genesis-border rounded-xl focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] resize-none"
            />
          </div>

          {/* Error/Success messages */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 text-green-600 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm">
                Solicitação enviada! Você será notificado quando estiver pronta.
              </span>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={submitting || selectedCategories.length === 0}
            className="w-full py-3 bg-[#4F46E5] text-white rounded-xl font-medium hover:bg-[#4338CA] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Enviar Solicitação
              </>
            )}
          </button>
        </form>
      </div>

      {/* Previous Requests */}
      <div className="bg-genesis-surface rounded-2xl border border-genesis-border-subtle p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-genesis-dark">
            Minhas Solicitações
          </h3>
          <button
            onClick={() => window.location.reload()}
            className="p-2 hover:bg-genesis-hover rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-genesis-muted" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-genesis-subtle" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-8 text-genesis-muted">
            <Clock className="w-12 h-12 text-genesis-subtle mx-auto mb-3" />
            <p>Nenhuma solicitação ainda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div
                key={request.id}
                className="p-4 border border-genesis-border-subtle rounded-xl"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-genesis-dark">
                      {RIGHT_LABELS[request.type]}
                    </span>
                    <span className="text-genesis-subtle mx-2">•</span>
                    <span className="text-sm text-genesis-muted">
                      {request.format.toUpperCase()}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      STATUS_CONFIG[request.status].bgColor
                    } ${STATUS_CONFIG[request.status].color}`}
                  >
                    {STATUS_CONFIG[request.status].label}
                  </span>
                </div>

                <div className="mt-2 text-xs text-genesis-subtle">
                  Solicitado em {formatDate(request.createdAt)}
                </div>

                {request.status === 'completed' && request.downloadUrl && (
                  <a
                    href={request.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-[#22C55E] text-white rounded-lg text-sm font-medium hover:bg-[#16A34A] transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Baixar Dados
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataExportRequest;

