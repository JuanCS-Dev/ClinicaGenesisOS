import React, { useState } from 'react';
import { toast } from 'sonner';
import { FileText, Plus, Download, AlertTriangle, CheckCircle, Clock, Filter } from 'lucide-react';
import { TissConsultaForm } from '@/components/billing';
import type { TissConsultaFormData } from '@/components/billing/TissConsultaForm';
import { EmptyState } from '@/components/ui/EmptyState';

type TabType = 'nova-guia' | 'historico' | 'glosas';

export const Billing: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('nova-guia');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: TissConsultaFormData) => {
    setIsLoading(true);
    try {
      console.log('TISS Form Data:', data);
      // TODO: Save to Firestore and generate XML
      toast.success('Guia TISS gerada com sucesso', {
        description: `Paciente: ${data.beneficiario.nomeBeneficiario} - Consulta: ${data.tipoConsulta}`,
        action: {
          label: 'Ver histórico',
          onClick: () => setActiveTab('historico'),
        },
      });
    } catch (error) {
      console.error('Error generating TISS:', error);
      toast.error('Erro ao gerar guia TISS', {
        description: 'Verifique os dados e tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'nova-guia', label: 'Nova Guia', icon: <Plus className="w-4 h-4" /> },
    { id: 'historico', label: 'Histórico', icon: <FileText className="w-4 h-4" /> },
    { id: 'glosas', label: 'Glosas', icon: <AlertTriangle className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-genesis-dark">Faturamento TISS</h1>
          <p className="text-genesis-muted mt-1">
            Geração de guias TISS 4.02.00 para convênios
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-genesis-text bg-genesis-surface border border-genesis-border rounded-lg hover:bg-genesis-hover transition-colors">
            <Filter className="w-4 h-4" />
            Filtros
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-genesis-text bg-genesis-surface border border-genesis-border rounded-lg hover:bg-genesis-hover transition-colors">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-genesis-surface border border-genesis-border-subtle rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-info-soft rounded-lg">
              <FileText className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-genesis-dark">0</p>
              <p className="text-sm text-genesis-muted">Guias este mês</p>
            </div>
          </div>
        </div>
        <div className="bg-genesis-surface border border-genesis-border-subtle rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning-soft rounded-lg">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-genesis-dark">0</p>
              <p className="text-sm text-genesis-muted">Pendentes</p>
            </div>
          </div>
        </div>
        <div className="bg-genesis-surface border border-genesis-border-subtle rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success-soft rounded-lg">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-genesis-dark">0</p>
              <p className="text-sm text-genesis-muted">Aprovadas</p>
            </div>
          </div>
        </div>
        <div className="bg-genesis-surface border border-genesis-border-subtle rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-danger-soft rounded-lg">
              <AlertTriangle className="w-5 h-5 text-danger" />
            </div>
            <div>
              <p className="text-2xl font-bold text-genesis-dark">0</p>
              <p className="text-sm text-genesis-muted">Glosas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-genesis-border-subtle">
        <nav className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-genesis-primary text-genesis-primary'
                  : 'border-transparent text-genesis-muted hover:text-genesis-text hover:border-genesis-border'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-genesis-surface border border-genesis-border-subtle rounded-xl">
        {activeTab === 'nova-guia' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-genesis-dark mb-4">
              Criar Guia de Consulta
            </h2>
            <TissConsultaForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isLoading}
            />
          </div>
        )}

        {activeTab === 'historico' && (
          <EmptyState
            illustration="documents"
            title="Nenhuma guia registrada"
            description="Crie sua primeira guia TISS para começar o histórico"
            action={{
              label: 'Criar Guia',
              onClick: () => setActiveTab('nova-guia'),
            }}
          />
        )}

        {activeTab === 'glosas' && (
          <EmptyState
            illustration="success"
            title="Sem glosas pendentes"
            description="Todas as guias foram processadas sem glosas"
          />
        )}
      </div>
    </div>
  );
};

export default Billing;
