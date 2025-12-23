/**
 * Billing Page
 *
 * Premium TISS billing interface for managing health insurance guides (guias).
 * Features: Create guides, view history, manage denials (glosas).
 */

import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  FileText,
  Plus,
  Download,
  AlertTriangle,
  Clock,
  Search,
  Eye,
  Send,
  TrendingUp,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { TissConsultaForm } from '@/components/billing';
import type { TissConsultaFormData } from '@/components/billing/TissConsultaForm';
import { EmptyState } from '@/components/ui/EmptyState';
import { useGuias } from '@/hooks/useGuias';
import { useOperadoras } from '@/hooks/useOperadoras';
import type { GuiaFirestore, StatusGuia } from '@/types';

type TabType = 'nova-guia' | 'historico' | 'glosas';

const STATUS_CONFIG: Record<StatusGuia, { label: string; color: string; bg: string }> = {
  rascunho: { label: 'Rascunho', color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-800' },
  enviada: { label: 'Enviada', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  em_analise: { label: 'Em Análise', color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  autorizada: { label: 'Autorizada', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
  glosada_parcial: { label: 'Glosa Parcial', color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  glosada_total: { label: 'Glosa Total', color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
  paga: { label: 'Paga', color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  recurso: { label: 'Em Recurso', color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR');
}

export function Billing(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<TabType>('nova-guia');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusGuia | 'all'>('all');

  const { guias, stats, loading, addGuia, updateStatus, refresh } = useGuias();
  const { operadorasAtivas } = useOperadoras();

  const filteredGuias = guias.filter((g) => {
    const matchesSearch =
      g.numeroGuiaPrestador.includes(searchQuery) ||
      g.nomeOperadora.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || g.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const glosas = guias.filter(
    (g) => g.status === 'glosada_parcial' || g.status === 'glosada_total' || g.status === 'recurso'
  );

  const handleSubmit = useCallback(
    async (data: TissConsultaFormData) => {
      setIsSubmitting(true);
      try {
        const operadora = operadorasAtivas.find(
          (op) => op.registroANS === data.registroANS
        );

        await addGuia({
          patientId: data.beneficiario.numeroCarteira,
          tipo: 'consulta',
          status: 'rascunho',
          registroANS: data.registroANS,
          nomeOperadora: data.nomeOperadora || operadora?.nomeFantasia || 'Operadora',
          dataAtendimento: data.dataAtendimento,
          valorTotal: data.valorProcedimento,
          dadosGuia: {
            registroANS: data.registroANS,
            numeroGuiaPrestador: '',
            dadosBeneficiario: data.beneficiario,
            contratadoSolicitante: {
              codigoPrestadorNaOperadora: operadora?.codigoPrestador || '',
            },
            profissionalSolicitante: {
              conselhoProfissional: '1',
              numeroConselhoProfissional: '',
              uf: 'SP',
            },
            tipoConsulta: data.tipoConsulta,
            dataAtendimento: data.dataAtendimento,
            codigoTabela: '22',
            codigoProcedimento: data.codigoProcedimento,
            valorProcedimento: data.valorProcedimento,
            indicacaoClinica: data.indicacaoClinica,
          },
        });

        toast.success('Guia TISS criada com sucesso', {
          description: `Paciente: ${data.beneficiario.nomeBeneficiario}`,
          action: {
            label: 'Ver histórico',
            onClick: () => setActiveTab('historico'),
          },
        });
      } catch (error) {
        console.error('Error creating guia:', error);
        toast.error('Erro ao criar guia TISS');
      } finally {
        setIsSubmitting(false);
      }
    },
    [addGuia, operadorasAtivas]
  );

  const tabs: { id: TabType; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'nova-guia', label: 'Nova Guia', icon: <Plus className="w-4 h-4" /> },
    { id: 'historico', label: 'Histórico', icon: <FileText className="w-4 h-4" />, count: stats.total },
    { id: 'glosas', label: 'Glosas', icon: <AlertTriangle className="w-4 h-4" />, count: stats.glosadas },
  ];

  return (
    <div className="space-y-6 animate-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center">
            <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-genesis-dark tracking-tight">
              Faturamento TISS
            </h1>
            <p className="text-genesis-muted text-sm">
              Geração de guias TISS 4.02.00 para convênios
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-genesis-muted hover:text-genesis-dark hover:bg-genesis-hover rounded-xl transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-genesis-text bg-genesis-surface border border-genesis-border rounded-xl hover:bg-genesis-hover transition-colors">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-genesis-surface border border-genesis-border-subtle rounded-2xl p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-info-soft flex items-center justify-center">
              <FileText className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-genesis-dark">{stats.total}</p>
              <p className="text-sm text-genesis-muted">Total de Guias</p>
            </div>
          </div>
        </div>

        <div className="bg-genesis-surface border border-genesis-border-subtle rounded-2xl p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning-soft flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-genesis-dark">{stats.pendentes}</p>
              <p className="text-sm text-genesis-muted">Pendentes</p>
            </div>
          </div>
        </div>

        <div className="bg-genesis-surface border border-genesis-border-subtle rounded-2xl p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success-soft flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-genesis-dark">
                {formatCurrency(stats.valorRecebido)}
              </p>
              <p className="text-sm text-genesis-muted">Recebido</p>
            </div>
          </div>
        </div>

        <div className="bg-genesis-surface border border-genesis-border-subtle rounded-2xl p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-danger-soft flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-danger" />
            </div>
            <div>
              <p className="text-2xl font-bold text-genesis-dark">
                {formatCurrency(stats.valorGlosado)}
              </p>
              <p className="text-sm text-genesis-muted">Glosado</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-genesis-surface p-1.5 rounded-2xl border border-genesis-border-subtle shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
              ${
                activeTab === tab.id
                  ? 'bg-genesis-dark text-white shadow-lg'
                  : 'text-genesis-muted hover:bg-genesis-hover'
              }
            `}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={`px-1.5 py-0.5 text-xs rounded-full ${
                  activeTab === tab.id ? 'bg-white/20' : 'bg-genesis-hover'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'nova-guia' && (
          <div className="bg-genesis-surface border border-genesis-border-subtle rounded-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                <Plus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="font-semibold text-genesis-dark">Criar Guia de Consulta</h2>
                <p className="text-sm text-genesis-muted">Preencha os dados para gerar uma nova guia TISS</p>
              </div>
            </div>

            {operadorasAtivas.length === 0 ? (
              <EmptyState
                illustration="documents"
                title="Nenhum convênio configurado"
                description="Configure os convênios da sua clínica em Configurações para começar a faturar"
                action={{
                  label: 'Ir para Configurações',
                  onClick: () => window.location.href = '/settings',
                }}
              />
            ) : (
              <TissConsultaForm
                onSubmit={handleSubmit}
                onCancel={() => setActiveTab('historico')}
                isLoading={isSubmitting}
              />
            )}
          </div>
        )}

        {activeTab === 'historico' && (
          <div className="bg-genesis-surface border border-genesis-border-subtle rounded-2xl animate-in fade-in zoom-in-95">
            {/* Filters */}
            <div className="p-4 border-b border-genesis-border-subtle flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-genesis-muted" />
                <input
                  type="text"
                  placeholder="Buscar por número ou operadora..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-genesis-border rounded-xl bg-genesis-soft text-genesis-text focus:ring-2 focus:ring-genesis-primary/20 focus:border-genesis-primary transition-all"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusGuia | 'all')}
                className="px-4 py-2.5 border border-genesis-border rounded-xl bg-genesis-soft text-genesis-text focus:ring-2 focus:ring-genesis-primary/20"
              >
                <option value="all">Todos os status</option>
                {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-genesis-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredGuias.length === 0 ? (
              <EmptyState
                illustration="documents"
                title="Nenhuma guia encontrada"
                description={guias.length === 0 ? "Crie sua primeira guia TISS" : "Ajuste os filtros"}
                action={guias.length === 0 ? {
                  label: 'Criar Guia',
                  onClick: () => setActiveTab('nova-guia'),
                } : undefined}
              />
            ) : (
              <div className="divide-y divide-genesis-border-subtle">
                {filteredGuias.map((guia) => (
                  <GuiaListItem key={guia.id} guia={guia} onStatusChange={updateStatus} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'glosas' && (
          <div className="bg-genesis-surface border border-genesis-border-subtle rounded-2xl animate-in fade-in zoom-in-95">
            {glosas.length === 0 ? (
              <EmptyState
                illustration="success"
                title="Sem glosas pendentes"
                description="Parabéns! Todas as suas guias foram processadas sem glosas"
              />
            ) : (
              <div className="divide-y divide-genesis-border-subtle">
                {glosas.map((guia) => (
                  <GuiaListItem key={guia.id} guia={guia} onStatusChange={updateStatus} showGlosaDetails />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface GuiaListItemProps {
  guia: GuiaFirestore;
  onStatusChange: (guiaId: string, status: StatusGuia) => Promise<void>;
  showGlosaDetails?: boolean;
}

const GuiaListItem: React.FC<GuiaListItemProps> = ({ guia, onStatusChange, showGlosaDetails }) => {
  const statusConfig = STATUS_CONFIG[guia.status];

  return (
    <div className="p-4 hover:bg-genesis-hover/50 transition-colors group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-genesis-soft flex items-center justify-center text-genesis-muted font-mono text-sm">
            {guia.tipo === 'consulta' ? 'C' : 'S'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-genesis-dark">
                #{guia.numeroGuiaPrestador}
              </span>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusConfig.bg} ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-genesis-muted">
              <span>{guia.nomeOperadora}</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(guia.dataAtendimento)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-semibold text-genesis-dark">{formatCurrency(guia.valorTotal)}</p>
            {showGlosaDetails && guia.valorGlosado && (
              <p className="text-sm text-danger">-{formatCurrency(guia.valorGlosado)}</p>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              className="p-2 rounded-lg hover:bg-genesis-hover text-genesis-muted hover:text-genesis-dark transition-colors"
              title="Ver detalhes"
            >
              <Eye className="w-4 h-4" />
            </button>
            {guia.status === 'rascunho' && (
              <button
                onClick={() => onStatusChange(guia.id, 'enviada')}
                className="p-2 rounded-lg hover:bg-genesis-primary/10 text-genesis-primary transition-colors"
                title="Enviar"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;
