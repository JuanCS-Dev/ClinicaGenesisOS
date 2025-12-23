/**
 * OperadoraForm Component
 *
 * Premium form for adding/editing health insurance operators.
 * Multi-step wizard with validation and clear UX.
 */

import React, { useState } from 'react';
import {
  Building2,
  Settings2,
  Globe,
  Phone,
  Mail,
  Save,
  X,
  ChevronRight,
  Check,
  Info,
} from 'lucide-react';
import type { OperadoraFirestore, CreateOperadoraInput, TipoTabela, TipoIntegracao } from '@/types';

interface OperadoraFormProps {
  operadora?: OperadoraFirestore;
  onSubmit: (data: CreateOperadoraInput) => Promise<void>;
  onCancel: () => void;
}

type Step = 'basic' | 'config' | 'contact';

const TABELA_OPTIONS: { value: TipoTabela; label: string }[] = [
  { value: '22', label: 'TUSS (Tabela Única)' },
  { value: '18', label: 'Tabela própria do prestador' },
  { value: '19', label: 'Tabela própria da operadora' },
  { value: '20', label: 'Tabela própria pacote' },
  { value: '90', label: 'Tabela própria de taxas' },
  { value: '98', label: 'Tabela própria de medicamentos' },
];

const INTEGRACAO_OPTIONS: { value: TipoIntegracao; label: string; desc: string }[] = [
  { value: 'portal', label: 'Portal Web', desc: 'Envio manual pelo portal da operadora' },
  { value: 'email', label: 'E-mail', desc: 'Envio de XML por e-mail' },
  { value: 'webservice', label: 'WebService', desc: 'Integração automática via API' },
  { value: 'manual', label: 'Manual', desc: 'Entrega física ou outro meio' },
];

export function OperadoraForm({
  operadora,
  onSubmit,
  onCancel,
}: OperadoraFormProps): React.ReactElement {
  const [currentStep, setCurrentStep] = useState<Step>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [registroANS, setRegistroANS] = useState(operadora?.registroANS || '');
  const [nomeFantasia, setNomeFantasia] = useState(operadora?.nomeFantasia || '');
  const [razaoSocial, setRazaoSocial] = useState(operadora?.razaoSocial || '');
  const [cnpj, setCnpj] = useState(operadora?.cnpj || '');
  const [codigoPrestador, setCodigoPrestador] = useState(operadora?.codigoPrestador || '');
  const [tabelaPrecos, setTabelaPrecos] = useState<TipoTabela>(operadora?.tabelaPrecos || '22');
  const [ativa] = useState(operadora?.ativa ?? true);

  // Config
  const [prazoEnvioDias, setPrazoEnvioDias] = useState(operadora?.configuracoes?.prazoEnvioDias ?? 30);
  const [exigeAutorizacao, setExigeAutorizacao] = useState(operadora?.configuracoes?.exigeAutorizacao ?? false);
  const [permiteLote, setPermiteLote] = useState(operadora?.configuracoes?.permiteLote ?? true);
  const [aceitaRecursoOnline, setAceitaRecursoOnline] = useState(operadora?.configuracoes?.aceitaRecursoOnline ?? false);
  const [diasPrazoRecurso, setDiasPrazoRecurso] = useState(operadora?.configuracoes?.diasPrazoRecurso ?? 30);
  const [tipoIntegracao, setTipoIntegracao] = useState<TipoIntegracao>(operadora?.webservice?.tipoIntegracao || 'portal');

  // Contact
  const [emailFaturamento, setEmailFaturamento] = useState(operadora?.contatos?.emailFaturamento || '');
  const [telefoneFaturamento, setTelefoneFaturamento] = useState(operadora?.contatos?.telefoneFaturamento || '');
  const [portalUrl, setPortalUrl] = useState(operadora?.contatos?.portalUrl || '');
  const [observacoes, setObservacoes] = useState(operadora?.observacoes || '');

  const steps: { id: Step; label: string; icon: React.ReactNode }[] = [
    { id: 'basic', label: 'Dados Básicos', icon: <Building2 className="w-4 h-4" /> },
    { id: 'config', label: 'Configurações', icon: <Settings2 className="w-4 h-4" /> },
    { id: 'contact', label: 'Contato', icon: <Phone className="w-4 h-4" /> },
  ];

  const isBasicValid = registroANS.length === 6 && nomeFantasia.length >= 2 && codigoPrestador.length >= 1;
  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const handleSubmit = async () => {
    if (!isBasicValid) return;

    setIsSubmitting(true);
    try {
      const data: CreateOperadoraInput = {
        registroANS,
        nomeFantasia,
        razaoSocial: razaoSocial || undefined,
        cnpj: cnpj || undefined,
        codigoPrestador,
        tabelaPrecos,
        ativa,
        configuracoes: {
          prazoEnvioDias,
          exigeAutorizacao,
          permiteLote,
          aceitaRecursoOnline,
          diasPrazoRecurso,
        },
        webservice: {
          tipoIntegracao,
          usarHomologacao: false,
          timeoutMs: 30000,
          tentativasRetry: 3,
        },
        contatos: {
          emailFaturamento: emailFaturamento || undefined,
          telefoneFaturamento: telefoneFaturamento || undefined,
          portalUrl: portalUrl || undefined,
        },
        observacoes: observacoes || undefined,
      };

      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 'basic') setCurrentStep('config');
    else if (currentStep === 'config') setCurrentStep('contact');
  };

  const prevStep = () => {
    if (currentStep === 'contact') setCurrentStep('config');
    else if (currentStep === 'config') setCurrentStep('basic');
  };

  return (
    <div className="bg-genesis-surface rounded-2xl border border-genesis-border-subtle">
      {/* Header */}
      <div className="p-6 border-b border-genesis-border-subtle">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-genesis-dark">
              {operadora ? 'Editar Convênio' : 'Novo Convênio'}
            </h2>
            <p className="text-sm text-genesis-muted mt-1">
              {operadora
                ? 'Atualize os dados do convênio'
                : 'Cadastre um novo plano de saúde'}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-lg hover:bg-genesis-hover text-genesis-muted hover:text-genesis-dark transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 mt-6">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <button
                onClick={() => setCurrentStep(step.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  currentStep === step.id
                    ? 'bg-genesis-primary text-white'
                    : index < currentStepIndex
                      ? 'bg-success-soft text-success'
                      : 'bg-genesis-soft text-genesis-muted hover:bg-genesis-hover'
                }`}
              >
                {index < currentStepIndex ? (
                  <Check className="w-4 h-4" />
                ) : (
                  step.icon
                )}
                <span className="hidden sm:inline">{step.label}</span>
              </button>
              {index < steps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-genesis-subtle" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6 space-y-6">
        {/* Basic Step */}
        {currentStep === 'basic' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-genesis-text">
                  Registro ANS <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={registroANS}
                  onChange={(e) => setRegistroANS(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-2.5 border border-genesis-border rounded-xl bg-genesis-soft text-genesis-text focus:ring-2 focus:ring-genesis-primary/20 focus:border-genesis-primary transition-all"
                />
                <p className="text-xs text-genesis-subtle">6 dígitos do registro ANS</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-genesis-text">
                  Código do Prestador <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={codigoPrestador}
                  onChange={(e) => setCodigoPrestador(e.target.value)}
                  placeholder="Seu código nesta operadora"
                  className="w-full px-4 py-2.5 border border-genesis-border rounded-xl bg-genesis-soft text-genesis-text focus:ring-2 focus:ring-genesis-primary/20 focus:border-genesis-primary transition-all"
                />
                <p className="text-xs text-genesis-subtle">Código fornecido pela operadora</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-genesis-text">
                Nome Fantasia <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={nomeFantasia}
                onChange={(e) => setNomeFantasia(e.target.value)}
                placeholder="Ex: UNIMED, Bradesco Saúde..."
                className="w-full px-4 py-2.5 border border-genesis-border rounded-xl bg-genesis-soft text-genesis-text focus:ring-2 focus:ring-genesis-primary/20 focus:border-genesis-primary transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-genesis-text">Razão Social</label>
                <input
                  type="text"
                  value={razaoSocial}
                  onChange={(e) => setRazaoSocial(e.target.value)}
                  placeholder="Opcional"
                  className="w-full px-4 py-2.5 border border-genesis-border rounded-xl bg-genesis-soft text-genesis-text focus:ring-2 focus:ring-genesis-primary/20 focus:border-genesis-primary transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-genesis-text">CNPJ</label>
                <input
                  type="text"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value.replace(/\D/g, '').slice(0, 14))}
                  placeholder="Opcional"
                  maxLength={14}
                  className="w-full px-4 py-2.5 border border-genesis-border rounded-xl bg-genesis-soft text-genesis-text focus:ring-2 focus:ring-genesis-primary/20 focus:border-genesis-primary transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-genesis-text">Tabela de Preços</label>
              <select
                value={tabelaPrecos}
                onChange={(e) => setTabelaPrecos(e.target.value as TipoTabela)}
                className="w-full px-4 py-2.5 border border-genesis-border rounded-xl bg-genesis-soft text-genesis-text focus:ring-2 focus:ring-genesis-primary/20 focus:border-genesis-primary transition-all"
              >
                {TABELA_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Config Step */}
        {currentStep === 'config' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-genesis-text">
                  Prazo de Envio (dias)
                </label>
                <input
                  type="number"
                  value={prazoEnvioDias}
                  onChange={(e) => setPrazoEnvioDias(parseInt(e.target.value) || 30)}
                  min={1}
                  max={365}
                  className="w-full px-4 py-2.5 border border-genesis-border rounded-xl bg-genesis-soft text-genesis-text focus:ring-2 focus:ring-genesis-primary/20 focus:border-genesis-primary transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-genesis-text">
                  Prazo para Recurso (dias)
                </label>
                <input
                  type="number"
                  value={diasPrazoRecurso}
                  onChange={(e) => setDiasPrazoRecurso(parseInt(e.target.value) || 30)}
                  min={1}
                  max={365}
                  className="w-full px-4 py-2.5 border border-genesis-border rounded-xl bg-genesis-soft text-genesis-text focus:ring-2 focus:ring-genesis-primary/20 focus:border-genesis-primary transition-all"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 rounded-xl border border-genesis-border-subtle hover:bg-genesis-hover cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={exigeAutorizacao}
                  onChange={(e) => setExigeAutorizacao(e.target.checked)}
                  className="w-5 h-5 rounded border-genesis-border text-genesis-primary focus:ring-genesis-primary"
                />
                <div>
                  <span className="font-medium text-genesis-text">Exige autorização prévia</span>
                  <p className="text-sm text-genesis-muted">Procedimentos precisam de senha</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 rounded-xl border border-genesis-border-subtle hover:bg-genesis-hover cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={permiteLote}
                  onChange={(e) => setPermiteLote(e.target.checked)}
                  className="w-5 h-5 rounded border-genesis-border text-genesis-primary focus:ring-genesis-primary"
                />
                <div>
                  <span className="font-medium text-genesis-text">Permite envio em lote</span>
                  <p className="text-sm text-genesis-muted">Várias guias em um único envio</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 rounded-xl border border-genesis-border-subtle hover:bg-genesis-hover cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={aceitaRecursoOnline}
                  onChange={(e) => setAceitaRecursoOnline(e.target.checked)}
                  className="w-5 h-5 rounded border-genesis-border text-genesis-primary focus:ring-genesis-primary"
                />
                <div>
                  <span className="font-medium text-genesis-text">Aceita recurso online</span>
                  <p className="text-sm text-genesis-muted">Contestação de glosas via sistema</p>
                </div>
              </label>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-genesis-text">Tipo de Integração</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {INTEGRACAO_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      tipoIntegracao === opt.value
                        ? 'border-genesis-primary bg-genesis-primary/5'
                        : 'border-genesis-border-subtle hover:bg-genesis-hover'
                    }`}
                  >
                    <input
                      type="radio"
                      name="tipoIntegracao"
                      value={opt.value}
                      checked={tipoIntegracao === opt.value}
                      onChange={(e) => setTipoIntegracao(e.target.value as TipoIntegracao)}
                      className="mt-0.5 w-4 h-4 border-genesis-border text-genesis-primary focus:ring-genesis-primary"
                    />
                    <div>
                      <span className="font-medium text-genesis-text">{opt.label}</span>
                      <p className="text-sm text-genesis-muted">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Contact Step */}
        {currentStep === 'contact' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <div className="flex items-start gap-3 p-4 bg-info-soft rounded-xl">
              <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
              <p className="text-sm text-genesis-text">
                Informações de contato ajudam a agilizar o faturamento e resolução de glosas.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-genesis-text flex items-center gap-2">
                <Mail className="w-4 h-4 text-genesis-muted" />
                E-mail de Faturamento
              </label>
              <input
                type="email"
                value={emailFaturamento}
                onChange={(e) => setEmailFaturamento(e.target.value)}
                placeholder="faturamento@operadora.com.br"
                className="w-full px-4 py-2.5 border border-genesis-border rounded-xl bg-genesis-soft text-genesis-text focus:ring-2 focus:ring-genesis-primary/20 focus:border-genesis-primary transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-genesis-text flex items-center gap-2">
                <Phone className="w-4 h-4 text-genesis-muted" />
                Telefone de Faturamento
              </label>
              <input
                type="tel"
                value={telefoneFaturamento}
                onChange={(e) => setTelefoneFaturamento(e.target.value)}
                placeholder="(00) 0000-0000"
                className="w-full px-4 py-2.5 border border-genesis-border rounded-xl bg-genesis-soft text-genesis-text focus:ring-2 focus:ring-genesis-primary/20 focus:border-genesis-primary transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-genesis-text flex items-center gap-2">
                <Globe className="w-4 h-4 text-genesis-muted" />
                URL do Portal
              </label>
              <input
                type="url"
                value={portalUrl}
                onChange={(e) => setPortalUrl(e.target.value)}
                placeholder="https://portal.operadora.com.br"
                className="w-full px-4 py-2.5 border border-genesis-border rounded-xl bg-genesis-soft text-genesis-text focus:ring-2 focus:ring-genesis-primary/20 focus:border-genesis-primary transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-genesis-text">Observações</label>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Anotações sobre este convênio..."
                rows={3}
                className="w-full px-4 py-2.5 border border-genesis-border rounded-xl bg-genesis-soft text-genesis-text focus:ring-2 focus:ring-genesis-primary/20 focus:border-genesis-primary transition-all resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-genesis-border-subtle flex items-center justify-between">
        <button
          onClick={currentStep === 'basic' ? onCancel : prevStep}
          className="px-4 py-2.5 text-genesis-muted hover:text-genesis-dark transition-colors font-medium"
        >
          {currentStep === 'basic' ? 'Cancelar' : 'Voltar'}
        </button>

        <div className="flex items-center gap-3">
          {currentStep !== 'contact' ? (
            <button
              onClick={nextStep}
              disabled={currentStep === 'basic' && !isBasicValid}
              className="flex items-center gap-2 px-6 py-2.5 bg-genesis-primary text-white rounded-xl font-medium hover:bg-genesis-primary/90 transition-all hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0"
            >
              Próximo
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!isBasicValid || isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-success text-white rounded-xl font-medium hover:bg-success/90 transition-all hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {operadora ? 'Atualizar' : 'Cadastrar'}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
