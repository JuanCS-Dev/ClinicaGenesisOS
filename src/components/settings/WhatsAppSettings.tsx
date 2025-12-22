/**
 * WhatsApp Business API Settings
 * ===============================
 *
 * Configuration component for WhatsApp Business API integration.
 * Manages credentials, template status, and connection testing.
 *
 * @module components/settings/WhatsAppSettings
 * @version 1.0.0
 */

import React, { useState } from 'react';
import {
  MessageCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Send,
  Clock,
  Shield,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
  Info,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface TemplateStatus {
  name: string;
  status: 'approved' | 'pending' | 'rejected';
  category: string;
  language: string;
}

interface WhatsAppStatus {
  connected: boolean;
  phoneNumber?: string;
  businessName?: string;
  lastSync?: string;
}

// ============================================================================
// Component
// ============================================================================

export function WhatsAppSettings(): React.ReactElement {
  // State
  const [showToken, setShowToken] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  // Mock status (would come from Firebase/API)
  const [status] = useState<WhatsAppStatus>({
    connected: false,
    phoneNumber: undefined,
    businessName: undefined,
    lastSync: undefined,
  });

  // Templates (would come from Meta API)
  const templates: TemplateStatus[] = [
    {
      name: 'consulta_confirmacao',
      status: 'pending',
      category: 'UTILITY',
      language: 'pt_BR',
    },
    {
      name: 'consulta_lembrete_24h',
      status: 'pending',
      category: 'UTILITY',
      language: 'pt_BR',
    },
    {
      name: 'consulta_lembrete_2h',
      status: 'pending',
      category: 'UTILITY',
      language: 'pt_BR',
    },
  ];

  // Handlers
  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    // Simulate API test
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Would call actual API
    setTestResult(status.connected ? 'success' : 'error');
    setIsTesting(false);
  };

  const handleCopyWebhookUrl = () => {
    const webhookUrl = `https://us-central1-clinica-genesis-os-e689e.cloudfunctions.net/whatsappWebhook`;
    navigator.clipboard.writeText(webhookUrl);
  };

  const getStatusIcon = (templateStatus: TemplateStatus['status']) => {
    switch (templateStatus) {
      case 'approved':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusLabel = (templateStatus: TemplateStatus['status']) => {
    switch (templateStatus) {
      case 'approved':
        return 'Aprovado';
      case 'pending':
        return 'Pendente';
      case 'rejected':
        return 'Rejeitado';
    }
  };

  return (
    <div className="space-y-8">
      {/* Connection Status Card */}
      <div className="bg-genesis-surface rounded-2xl border border-genesis-border-subtle p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                status.connected
                  ? 'bg-green-50 dark:bg-green-900/30'
                  : 'bg-amber-50 dark:bg-amber-900/30'
              }`}
            >
              <MessageCircle
                className={`w-5 h-5 ${
                  status.connected
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              />
            </div>
            <div>
              <h3 className="font-semibold text-genesis-dark">
                WhatsApp Business API
              </h3>
              <p className="text-sm text-genesis-muted">
                {status.connected
                  ? `Conectado: ${status.phoneNumber}`
                  : 'Não configurado'}
              </p>
            </div>
          </div>
          <div
            className={`px-3 py-1.5 rounded-full text-xs font-medium ${
              status.connected
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
            }`}
          >
            {status.connected ? 'Ativo' : 'Pendente Configuração'}
          </div>
        </div>

        {!status.connected && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Configuração necessária
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  Para ativar lembretes automáticos via WhatsApp, configure as
                  credenciais da Meta Business API.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Configuration Steps */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-genesis-dark flex items-center gap-2">
            <Info className="w-4 h-4 text-genesis-muted" />
            Passos para Configuração
          </h4>

          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-genesis-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                1
              </span>
              <div>
                <p className="text-genesis-dark font-medium">
                  Criar conta Meta Business
                </p>
                <a
                  href="https://business.facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-genesis-primary hover:underline inline-flex items-center gap-1"
                >
                  business.facebook.com
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </li>

            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-genesis-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                2
              </span>
              <div>
                <p className="text-genesis-dark font-medium">
                  Configurar WhatsApp Business Platform
                </p>
                <a
                  href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-genesis-primary hover:underline inline-flex items-center gap-1"
                >
                  Ver documentação
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </li>

            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-genesis-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                3
              </span>
              <div>
                <p className="text-genesis-dark font-medium">
                  Submeter templates para aprovação
                </p>
                <p className="text-genesis-muted text-xs mt-0.5">
                  Use os nomes: consulta_confirmacao, consulta_lembrete_24h,
                  consulta_lembrete_2h
                </p>
              </div>
            </li>

            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-genesis-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                4
              </span>
              <div>
                <p className="text-genesis-dark font-medium">
                  Configurar Webhook URL
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs bg-genesis-soft px-2 py-1 rounded text-genesis-dark font-mono">
                    ...cloudfunctions.net/whatsappWebhook
                  </code>
                  <button
                    onClick={handleCopyWebhookUrl}
                    className="p-1 hover:bg-genesis-hover rounded"
                    title="Copiar URL"
                  >
                    <Copy className="w-3.5 h-3.5 text-genesis-muted" />
                  </button>
                </div>
              </div>
            </li>

            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-genesis-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                5
              </span>
              <div>
                <p className="text-genesis-dark font-medium">
                  Configurar secrets no Firebase
                </p>
                <code className="text-xs bg-genesis-soft px-2 py-1 rounded text-genesis-dark font-mono block mt-1">
                  firebase functions:secrets:set WHATSAPP_TOKEN
                </code>
              </div>
            </li>
          </ol>
        </div>
      </div>

      {/* Credentials Section */}
      <div className="bg-genesis-surface rounded-2xl border border-genesis-border-subtle p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-genesis-dark">Credenciais</h3>
            <p className="text-sm text-genesis-muted">
              Configuradas via Firebase Secrets (seguro)
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Token */}
          <div>
            <label className="block text-sm font-medium text-genesis-text mb-1">
              Access Token
            </label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value="••••••••••••••••••••••••"
                readOnly
                className="w-full px-4 py-2.5 pr-10 border border-genesis-border rounded-xl bg-genesis-soft text-genesis-text font-mono text-sm"
              />
              <button
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-genesis-muted hover:text-genesis-dark"
              >
                {showToken ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-genesis-muted mt-1">
              Gerenciado via: WHATSAPP_TOKEN
            </p>
          </div>

          {/* Phone Number ID */}
          <div>
            <label className="block text-sm font-medium text-genesis-text mb-1">
              Phone Number ID
            </label>
            <input
              type="text"
              value={status.connected ? '1234567890' : 'Não configurado'}
              readOnly
              className="w-full px-4 py-2.5 border border-genesis-border rounded-xl bg-genesis-soft text-genesis-text font-mono text-sm"
            />
            <p className="text-xs text-genesis-muted mt-1">
              Gerenciado via: WHATSAPP_PHONE_ID
            </p>
          </div>

          {/* Test Connection */}
          <div className="pt-4 flex items-center gap-3">
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="flex items-center gap-2 px-4 py-2.5 bg-genesis-primary text-white rounded-xl font-medium hover:bg-genesis-primary-dark transition-colors disabled:opacity-50"
            >
              {isTesting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {isTesting ? 'Testando...' : 'Testar Conexão'}
            </button>

            {testResult === 'success' && (
              <span className="flex items-center gap-1.5 text-sm text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                Conexão OK
              </span>
            )}
            {testResult === 'error' && (
              <span className="flex items-center gap-1.5 text-sm text-red-600">
                <XCircle className="w-4 h-4" />
                Falha na conexão
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Templates Section */}
      <div className="bg-genesis-surface rounded-2xl border border-genesis-border-subtle p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-genesis-dark">
                Templates de Mensagem
              </h3>
              <p className="text-sm text-genesis-muted">
                Status de aprovação no Meta Business
              </p>
            </div>
          </div>
          <a
            href="https://business.facebook.com/wa/manage/message-templates/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-genesis-primary hover:underline inline-flex items-center gap-1"
          >
            Gerenciar no Meta
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="space-y-3">
          {templates.map((template) => (
            <div
              key={template.name}
              className="flex items-center justify-between p-4 bg-genesis-soft rounded-xl"
            >
              <div>
                <p className="font-medium text-genesis-dark font-mono text-sm">
                  {template.name}
                </p>
                <p className="text-xs text-genesis-muted mt-0.5">
                  {template.category} • {template.language}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(template.status)}
                <span
                  className={`text-sm font-medium ${
                    template.status === 'approved'
                      ? 'text-green-600'
                      : template.status === 'pending'
                        ? 'text-amber-600'
                        : 'text-red-600'
                  }`}
                >
                  {getStatusLabel(template.status)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Conteúdo dos Templates:</strong>
          </p>
          <ul className="text-xs text-blue-700 dark:text-blue-300 mt-2 space-y-1">
            <li>
              • <code>consulta_confirmacao</code>: Confirmação ao agendar
            </li>
            <li>
              • <code>consulta_lembrete_24h</code>: Lembrete 24h antes
            </li>
            <li>
              • <code>consulta_lembrete_2h</code>: Lembrete 2h antes
            </li>
          </ul>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-genesis-surface rounded-2xl border border-genesis-border-subtle p-6">
        <h3 className="font-semibold text-genesis-dark mb-4">
          Funcionalidades Automáticas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 bg-genesis-soft rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-genesis-dark text-sm">
                Confirmação ao Agendar
              </p>
              <p className="text-xs text-genesis-muted mt-0.5">
                Enviada imediatamente após novo agendamento
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-genesis-soft rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-genesis-dark text-sm">
                Lembrete 24h Antes
              </p>
              <p className="text-xs text-genesis-muted mt-0.5">
                Executado a cada hora via Cloud Scheduler
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-genesis-soft rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-genesis-dark text-sm">
                Lembrete 2h Antes
              </p>
              <p className="text-xs text-genesis-muted mt-0.5">
                Executado a cada 30 min via Cloud Scheduler
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-genesis-soft rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-genesis-dark text-sm">
                Atualização Automática
              </p>
              <p className="text-xs text-genesis-muted mt-0.5">
                Webhook processa respostas (Sim/Remarcar)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WhatsAppSettings;
