/**
 * LotesTab Component
 *
 * Tab for managing TISS guide batches (lotes) for submission to operators.
 * Allows grouping pending guides into batches and tracking submission status.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Package,
  Plus,
  Send,
  Clock,
  DollarSign,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoteCard } from './LoteCard';
import { CreateLoteModal } from './CreateLoteModal';
import type { LoteGuias, GuiaFirestore } from '@/types';

// =============================================================================
// TYPES
// =============================================================================

interface LotesTabProps {
  /** List of lotes */
  lotes: LoteGuias[];
  /** List of guias (for selecting into lotes) */
  guias: GuiaFirestore[];
  /** Loading state */
  loading?: boolean;
  /** Callback to create a new lote */
  onCreateLote: (operadoraRegistroANS: string, guiaIds: string[]) => Promise<void>;
  /** Callback to send a lote */
  onSendLote: (loteId: string) => Promise<void>;
  /** Callback to delete a lote */
  onDeleteLote: (loteId: string) => Promise<void>;
  /** Callback to download lote XML */
  onDownloadXml?: (loteId: string) => void;
  /** Callback to view a guia */
  onViewGuia?: (guiaId: string) => void;
}

// =============================================================================
// HELPERS
// =============================================================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// =============================================================================
// COMPONENT
// =============================================================================

export function LotesTab({
  lotes,
  guias,
  loading = false,
  onCreateLote,
  onSendLote,
  onDeleteLote,
  onDownloadXml,
  onViewGuia,
}: LotesTabProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const pendingGuiasCount = useMemo(() => {
    return guias.filter((g) => g.status === 'rascunho').length;
  }, [guias]);

  const sortedLotes = useMemo((): LoteGuias[] => {
    return [...lotes].sort(
      (a, b) => new Date(b.dataGeracao).getTime() - new Date(a.dataGeracao).getTime()
    );
  }, [lotes]);

  const handleSendLote = useCallback(
    async (loteId: string) => {
      setActionLoading(loteId);
      try {
        await onSendLote(loteId);
        toast.success('Lote enviado com sucesso');
      } catch {
        toast.error('Erro ao enviar lote');
      } finally {
        setActionLoading(null);
      }
    },
    [onSendLote]
  );

  const handleDeleteLote = useCallback(
    async (loteId: string) => {
      setActionLoading(loteId);
      try {
        await onDeleteLote(loteId);
        toast.success('Lote excluído');
      } catch {
        toast.error('Erro ao excluir lote');
      } finally {
        setActionLoading(null);
      }
    },
    [onDeleteLote]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-genesis-dark">Lotes de Guias</h2>
          <p className="text-sm text-genesis-muted">
            Agrupe guias para envio em lote às operadoras
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          disabled={pendingGuiasCount === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-genesis-primary text-white rounded-xl font-medium hover:bg-genesis-primary/90 transition-all hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0"
        >
          <Plus className="w-4 h-4" />
          Criar Lote
          {pendingGuiasCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-white/20 rounded-full">
              {pendingGuiasCount}
            </span>
          )}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-genesis-surface rounded-xl border border-genesis-border-subtle">
          <div className="flex items-center gap-2 text-genesis-muted mb-1">
            <Package className="w-4 h-4" />
            <span className="text-sm">Total de Lotes</span>
          </div>
          <p className="text-2xl font-bold text-genesis-dark">{lotes.length}</p>
        </div>

        <div className="p-4 bg-genesis-surface rounded-xl border border-genesis-border-subtle">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Pendentes</span>
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {lotes.filter((l) => l.status === 'rascunho' || l.status === 'pronto').length}
          </p>
        </div>

        <div className="p-4 bg-genesis-surface rounded-xl border border-genesis-border-subtle">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
            <Send className="w-4 h-4" />
            <span className="text-sm">Enviados</span>
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {lotes.filter((l) => l.status === 'enviado' || l.status === 'processado').length}
          </p>
        </div>

        <div className="p-4 bg-genesis-surface rounded-xl border border-genesis-border-subtle">
          <div className="flex items-center gap-2 text-genesis-muted mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">Valor Total</span>
          </div>
          <p className="text-xl font-bold text-genesis-dark">
            {formatCurrency(lotes.reduce((sum, l) => sum + l.valorTotal, 0))}
          </p>
        </div>
      </div>

      {/* Lotes List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-genesis-primary" />
        </div>
      ) : sortedLotes.length === 0 ? (
        <EmptyState
          illustration="documents"
          title="Nenhum lote criado"
          description="Crie um lote para agrupar guias e enviá-las às operadoras de uma só vez"
          action={{
            label: 'Criar Primeiro Lote',
            onClick: () => setShowCreateModal(true),
            disabled: pendingGuiasCount === 0,
          }}
        />
      ) : (
        <div className="space-y-3">
          {sortedLotes.map((lote) => (
            <LoteCard
              key={lote.id}
              lote={lote}
              guias={guias}
              onSend={() => handleSendLote(lote.id)}
              onDelete={() => handleDeleteLote(lote.id)}
              onDownloadXml={onDownloadXml ? () => onDownloadXml(lote.id) : undefined}
              onViewGuia={onViewGuia}
              isLoading={actionLoading === lote.id}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateLoteModal
          guias={guias}
          onClose={() => setShowCreateModal(false)}
          onCreate={onCreateLote}
        />
      )}
    </div>
  );
}
