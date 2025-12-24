/**
 * Settings Page
 * =============
 *
 * Clinic configuration hub with tabs for different settings.
 * Integrates: PixSettings, DataExportRequest, CertificateSetup, MetricsDashboard.
 *
 * Fase 15: Air Gap Resolution
 */

import React, { useState, useCallback } from 'react';
import {
  Settings as SettingsIcon,
  QrCode,
  FileText,
  Shield,
  Brain,
  Building,
  Bell,
  MessageCircle,
  HeartPulse,
  Zap,
  User,
} from 'lucide-react';
import { PixSettings } from '@/components/settings/PixSettings';
import { DataExportRequest } from '@/components/consent/DataExportRequest';
import { CertificateSetup } from '@/components/prescription/CertificateSetup';
import { MetricsDashboard } from '@/components/ai/scribe/MetricsDashboard';
import { NotificationPreferences } from '@/components/notifications';
import { WhatsAppSettings } from '@/components/settings/WhatsAppSettings';
import { ConvenioSettings } from '@/components/settings/ConvenioSettings';
import { WorkflowSettings } from '@/components/settings/WorkflowSettings';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import { useClinicContext } from '@/contexts/ClinicContext';

/**
 * Tab configuration.
 */
const TABS = [
  {
    id: 'profile',
    label: 'Meu Perfil',
    icon: User,
    description: 'Suas informações pessoais',
  },
  {
    id: 'clinic',
    label: 'Clínica',
    icon: Building,
    description: 'Informações básicas da clínica',
  },
  {
    id: 'convenios',
    label: 'Convênios',
    icon: HeartPulse,
    description: 'Planos de saúde e faturamento TISS',
  },
  {
    id: 'notifications',
    label: 'Notificações',
    icon: Bell,
    description: 'Preferências de lembretes e alertas',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: MessageCircle,
    description: 'Integração WhatsApp Business API',
  },
  {
    id: 'workflows',
    label: 'Automações',
    icon: Zap,
    description: 'Workflows automáticos',
  },
  {
    id: 'pix',
    label: 'PIX',
    icon: QrCode,
    description: 'Configurações de pagamento PIX',
  },
  {
    id: 'certificate',
    label: 'Certificado',
    icon: FileText,
    description: 'Certificado digital para prescrições',
  },
  {
    id: 'lgpd',
    label: 'Privacidade',
    icon: Shield,
    description: 'LGPD e exportação de dados',
  },
  {
    id: 'ai',
    label: 'IA',
    icon: Brain,
    description: 'Métricas e configurações de IA',
  },
] as const;

type TabId = (typeof TABS)[number]['id'];

/**
 * Settings page component.
 */
export function Settings(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const { clinic } = useClinicContext();
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  // Handle certificate configuration
  const handleCertificateConfigured = useCallback(() => {
    setShowCertificateModal(false);
  }, []);

  return (
    <div className="space-y-6 animate-enter pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <SettingsIcon className="w-6 h-6 text-genesis-medium" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-genesis-dark tracking-tight">
            Configurações
          </h1>
          <p className="text-genesis-medium text-sm">
            Gerencie as configurações da sua clínica
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 bg-genesis-surface p-1.5 rounded-2xl border border-genesis-border-subtle shadow-sm overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 whitespace-nowrap
                ${
                  isActive
                    ? 'bg-genesis-dark text-white shadow-lg'
                    : 'text-genesis-medium hover:bg-genesis-hover'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-genesis-surface rounded-2xl border border-genesis-border-subtle p-6 animate-in fade-in zoom-in-95">
            <ProfileSettings />
          </div>
        )}

        {/* Clinic Info Tab */}
        {activeTab === 'clinic' && (
          <div className="bg-genesis-surface rounded-2xl border border-genesis-border-subtle p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Building className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-genesis-dark">
                  Informações da Clínica
                </h3>
                <p className="text-sm text-genesis-muted">
                  Dados básicos e configurações gerais
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-genesis-text mb-1">
                  Nome da Clínica
                </label>
                <input
                  type="text"
                  value={clinic?.name || ''}
                  readOnly
                  className="w-full px-4 py-2.5 border border-genesis-border rounded-xl bg-genesis-soft text-genesis-text"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-genesis-text mb-1">
                  Tipo
                </label>
                <input
                  type="text"
                  value="Clínica Médica"
                  readOnly
                  className="w-full px-4 py-2.5 border border-genesis-border rounded-xl bg-genesis-soft text-genesis-text"
                />
              </div>

              <div className="pt-4 text-center text-sm text-genesis-subtle">
                <p>Para alterar informações da clínica, entre em contato com o suporte.</p>
              </div>
            </div>
          </div>
        )}

        {/* Convenios Tab */}
        {activeTab === 'convenios' && (
          <div className="animate-in fade-in zoom-in-95">
            <ConvenioSettings
              cnes={clinic?.cnpj ? undefined : undefined}
              cnpj={clinic?.cnpj}
            />
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-genesis-surface rounded-2xl border border-genesis-border-subtle p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                <Bell className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-genesis-dark">
                  Preferências de Notificação
                </h3>
                <p className="text-sm text-genesis-muted">
                  Configure como você deseja receber lembretes e alertas
                </p>
              </div>
            </div>
            <NotificationPreferences />
          </div>
        )}

        {/* WhatsApp Settings Tab */}
        {activeTab === 'whatsapp' && (
          <div className="animate-in fade-in zoom-in-95">
            <WhatsAppSettings />
          </div>
        )}

        {/* Workflows Tab */}
        {activeTab === 'workflows' && (
          <div className="animate-in fade-in zoom-in-95">
            <WorkflowSettings />
          </div>
        )}

        {/* PIX Settings Tab */}
        {activeTab === 'pix' && (
          <div className="animate-in fade-in zoom-in-95">
            <PixSettings />
          </div>
        )}

        {/* Certificate Tab */}
        {activeTab === 'certificate' && (
          <div className="animate-in fade-in zoom-in-95">
            <div className="bg-genesis-surface rounded-2xl border border-genesis-border-subtle p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-genesis-dark">
                    Certificado Digital
                  </h3>
                  <p className="text-sm text-genesis-muted">
                    Configure seu certificado e-CPF para assinatura digital
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowCertificateModal(true)}
                className="px-4 py-2.5 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors"
              >
                Configurar Certificado
              </button>

              {showCertificateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                  <div className="bg-genesis-surface rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                    <CertificateSetup
                      onCertificateConfigured={handleCertificateConfigured}
                      onClose={() => setShowCertificateModal(false)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* LGPD Tab */}
        {activeTab === 'lgpd' && (
          <div className="animate-in fade-in zoom-in-95">
            <DataExportRequest />
          </div>
        )}

        {/* AI Metrics Tab */}
        {activeTab === 'ai' && (
          <div className="animate-in fade-in zoom-in-95">
            <MetricsDashboard />
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;

