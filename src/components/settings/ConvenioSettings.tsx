/**
 * ConvenioSettings Component
 *
 * Premium settings interface for managing health insurance operators (convênios).
 * Allows clinics to configure CNES, CNPJ, and manage their operadora partnerships.
 */

import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Power,
  PowerOff,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Search,
  ExternalLink,
  Phone,
  Mail,
  Globe,
} from 'lucide-react';
import { toast } from 'sonner';
import { useOperadoras } from '@/hooks/useOperadoras';
import { EmptyState } from '@/components/ui/EmptyState';
import { OperadoraForm } from './OperadoraForm';
import type { OperadoraFirestore, CreateOperadoraInput } from '@/types';

interface ConvenioSettingsProps {
  cnes?: string;
  cnpj?: string;
}

export function ConvenioSettings({
  cnes,
  cnpj,
}: ConvenioSettingsProps): React.ReactElement {
  const {
    operadoras,
    operadorasAtivas,
    loading,
    addOperadora,
    updateOperadora,
    toggleAtiva,
    deleteOperadora,
  } = useOperadoras();

  const [showForm, setShowForm] = useState(false);
  const [editingOperadora, setEditingOperadora] = useState<OperadoraFirestore | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredOperadoras = operadoras.filter(
    (op) =>
      op.nomeFantasia.toLowerCase().includes(searchQuery.toLowerCase()) ||
      op.registroANS.includes(searchQuery)
  );

  const handleAddOperadora = async (data: CreateOperadoraInput) => {
    try {
      await addOperadora(data);
      setShowForm(false);
      toast.success('Convênio cadastrado com sucesso');
    } catch (error) {
      console.error('Error adding operadora:', error);
      toast.error('Erro ao cadastrar convênio');
    }
  };

  const handleUpdateOperadora = async (data: CreateOperadoraInput) => {
    if (!editingOperadora) return;
    try {
      await updateOperadora(editingOperadora.id, data);
      setEditingOperadora(null);
      toast.success('Convênio atualizado com sucesso');
    } catch (error) {
      console.error('Error updating operadora:', error);
      toast.error('Erro ao atualizar convênio');
    }
  };

  const handleToggleAtiva = async (op: OperadoraFirestore) => {
    try {
      await toggleAtiva(op.id, !op.ativa);
      toast.success(op.ativa ? 'Convênio desativado' : 'Convênio ativado');
    } catch (error) {
      console.error('Error toggling operadora:', error);
      toast.error('Erro ao alterar status');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteOperadora(id);
      setDeletingId(null);
      toast.success('Convênio removido com sucesso');
    } catch (error) {
      console.error('Error deleting operadora:', error);
      toast.error('Erro ao remover convênio');
    }
  };

  // Show form modal
  if (showForm || editingOperadora) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setShowForm(false);
              setEditingOperadora(null);
            }}
            className="flex items-center gap-2 text-genesis-muted hover:text-genesis-dark transition-colors"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Voltar
          </button>
        </div>

        <OperadoraForm
          operadora={editingOperadora || undefined}
          onSubmit={editingOperadora ? handleUpdateOperadora : handleAddOperadora}
          onCancel={() => {
            setShowForm(false);
            setEditingOperadora(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Clinic Info Card */}
      <div className="bg-genesis-surface rounded-2xl border border-genesis-border-subtle p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="font-semibold text-genesis-dark">
              Dados do Estabelecimento
            </h3>
            <p className="text-sm text-genesis-muted">
              Informações para faturamento TISS
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-genesis-text">CNES</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={cnes || ''}
                placeholder="Não configurado"
                readOnly
                className="flex-1 px-4 py-2.5 border border-genesis-border rounded-xl bg-genesis-soft text-genesis-text"
              />
              {cnes ? (
                <CheckCircle2 className="w-5 h-5 text-success" />
              ) : (
                <AlertCircle className="w-5 h-5 text-warning" />
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-genesis-text">CNPJ</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={cnpj || ''}
                placeholder="Não configurado"
                readOnly
                className="flex-1 px-4 py-2.5 border border-genesis-border rounded-xl bg-genesis-soft text-genesis-text"
              />
              {cnpj ? (
                <CheckCircle2 className="w-5 h-5 text-success" />
              ) : (
                <AlertCircle className="w-5 h-5 text-warning" />
              )}
            </div>
          </div>
        </div>

        {(!cnes || !cnpj) && (
          <div className="mt-4 p-4 bg-warning-soft rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-genesis-dark">
                Configuração incompleta
              </p>
              <p className="text-sm text-genesis-muted mt-1">
                Configure o CNES e CNPJ da clínica para habilitar o faturamento TISS.
                Entre em contato com o suporte para atualizar estes dados.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Operadoras Section */}
      <div className="bg-genesis-surface rounded-2xl border border-genesis-border-subtle p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-genesis-dark">
                Convênios Cadastrados
              </h3>
              <p className="text-sm text-genesis-muted">
                {operadorasAtivas.length} ativo{operadorasAtivas.length !== 1 ? 's' : ''} de {operadoras.length} total
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-genesis-primary text-white rounded-xl font-medium hover:bg-genesis-primary/90 transition-all hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Adicionar Convênio
          </button>
        </div>

        {/* Search */}
        {operadoras.length > 0 && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-genesis-muted" />
            <input
              type="text"
              placeholder="Buscar por nome ou registro ANS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-genesis-border rounded-xl bg-genesis-soft text-genesis-text placeholder:text-genesis-subtle focus:ring-2 focus:ring-genesis-primary/20 focus:border-genesis-primary transition-all"
            />
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-genesis-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!loading && operadoras.length === 0 && (
          <EmptyState
            illustration="documents"
            title="Nenhum convênio cadastrado"
            description="Adicione os planos de saúde com os quais sua clínica trabalha para começar a faturar"
            action={{
              label: 'Adicionar Convênio',
              onClick: () => setShowForm(true),
            }}
          />
        )}

        {/* Operadoras list */}
        {!loading && filteredOperadoras.length > 0 && (
          <div className="space-y-3">
            {filteredOperadoras.map((op) => (
              <div
                key={op.id}
                className={`group p-4 rounded-xl border transition-all hover:shadow-md ${
                  op.ativa
                    ? 'bg-genesis-soft border-genesis-border-subtle hover:border-genesis-primary/30'
                    : 'bg-genesis-hover/50 border-genesis-border-subtle opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${
                        op.ativa
                          ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400'
                          : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                      }`}
                    >
                      {op.nomeFantasia.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-genesis-dark">
                          {op.nomeFantasia}
                        </h4>
                        {!op.ativa && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 rounded-full">
                            Inativo
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-1 text-sm text-genesis-muted">
                        <span>ANS: {op.registroANS}</span>
                        <span>Cód: {op.codigoPrestador}</span>
                      </div>

                      {/* Contact info */}
                      {op.contatos && (
                        <div className="flex items-center gap-3 mt-2">
                          {op.contatos.emailFaturamento && (
                            <a
                              href={`mailto:${op.contatos.emailFaturamento}`}
                              className="flex items-center gap-1 text-xs text-genesis-muted hover:text-genesis-primary transition-colors"
                            >
                              <Mail className="w-3 h-3" />
                              {op.contatos.emailFaturamento}
                            </a>
                          )}
                          {op.contatos.telefoneFaturamento && (
                            <span className="flex items-center gap-1 text-xs text-genesis-muted">
                              <Phone className="w-3 h-3" />
                              {op.contatos.telefoneFaturamento}
                            </span>
                          )}
                          {op.contatos.portalUrl && (
                            <a
                              href={op.contatos.portalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-genesis-muted hover:text-genesis-primary transition-colors"
                            >
                              <Globe className="w-3 h-3" />
                              Portal
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleToggleAtiva(op)}
                      className={`p-2 rounded-lg transition-colors ${
                        op.ativa
                          ? 'hover:bg-warning-soft text-warning'
                          : 'hover:bg-success-soft text-success'
                      }`}
                      title={op.ativa ? 'Desativar' : 'Ativar'}
                    >
                      {op.ativa ? (
                        <PowerOff className="w-4 h-4" />
                      ) : (
                        <Power className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => setEditingOperadora(op)}
                      className="p-2 rounded-lg hover:bg-genesis-hover text-genesis-muted hover:text-genesis-dark transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {deletingId === op.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(op.id)}
                          className="p-2 rounded-lg bg-danger text-white hover:bg-danger/90 transition-colors"
                          title="Confirmar"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="p-2 rounded-lg hover:bg-genesis-hover text-genesis-muted transition-colors"
                          title="Cancelar"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeletingId(op.id)}
                        className="p-2 rounded-lg hover:bg-danger-soft text-genesis-muted hover:text-danger transition-colors"
                        title="Remover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Config summary */}
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-genesis-border-subtle">
                  <span className="text-xs text-genesis-muted">
                    Prazo envio: {op.configuracoes.prazoEnvioDias} dias
                  </span>
                  {op.configuracoes.exigeAutorizacao && (
                    <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full">
                      Exige autorização
                    </span>
                  )}
                  {op.configuracoes.permiteLote && (
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                      Aceita lote
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No search results */}
        {!loading && operadoras.length > 0 && filteredOperadoras.length === 0 && (
          <div className="text-center py-8 text-genesis-muted">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Nenhum convênio encontrado para "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
