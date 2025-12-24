/**
 * OperadoraForm Component
 *
 * Premium form for adding/editing health insurance operators.
 * Multi-step wizard with validation and clear UX.
 *
 * @module components/settings/operadora-form/OperadoraForm
 */

import React, { useState, useCallback } from 'react'
import { Building2, Settings2, Phone, Save, X, ChevronRight, Check } from 'lucide-react'
import type { CreateOperadoraInput } from '@/types'
import type {
  OperadoraFormProps,
  Step,
  BasicFormData,
  ConfigFormData,
  ContactFormData,
} from './types'
import { OperadoraBasicStep } from './OperadoraBasicStep'
import { OperadoraConfigStep } from './OperadoraConfigStep'
import { OperadoraContactStep } from './OperadoraContactStep'

const STEPS: { id: Step; label: string; icon: React.ReactNode }[] = [
  { id: 'basic', label: 'Dados Básicos', icon: <Building2 className="w-4 h-4" /> },
  { id: 'config', label: 'Configurações', icon: <Settings2 className="w-4 h-4" /> },
  { id: 'contact', label: 'Contato', icon: <Phone className="w-4 h-4" /> },
]

export function OperadoraForm({
  operadora,
  onSubmit,
  onCancel,
}: OperadoraFormProps): React.ReactElement {
  const [currentStep, setCurrentStep] = useState<Step>('basic')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state grouped by step
  const [basicData, setBasicData] = useState<BasicFormData>({
    registroANS: operadora?.registroANS || '',
    nomeFantasia: operadora?.nomeFantasia || '',
    razaoSocial: operadora?.razaoSocial || '',
    cnpj: operadora?.cnpj || '',
    codigoPrestador: operadora?.codigoPrestador || '',
    tabelaPrecos: operadora?.tabelaPrecos || '22',
  })

  const [configData, setConfigData] = useState<ConfigFormData>({
    prazoEnvioDias: operadora?.configuracoes?.prazoEnvioDias ?? 30,
    exigeAutorizacao: operadora?.configuracoes?.exigeAutorizacao ?? false,
    permiteLote: operadora?.configuracoes?.permiteLote ?? true,
    aceitaRecursoOnline: operadora?.configuracoes?.aceitaRecursoOnline ?? false,
    diasPrazoRecurso: operadora?.configuracoes?.diasPrazoRecurso ?? 30,
    tipoIntegracao: operadora?.webservice?.tipoIntegracao || 'portal',
  })

  const [contactData, setContactData] = useState<ContactFormData>({
    emailFaturamento: operadora?.contatos?.emailFaturamento || '',
    telefoneFaturamento: operadora?.contatos?.telefoneFaturamento || '',
    portalUrl: operadora?.contatos?.portalUrl || '',
    observacoes: operadora?.observacoes || '',
  })

  const isBasicValid =
    basicData.registroANS.length === 6 &&
    basicData.nomeFantasia.length >= 2 &&
    basicData.codigoPrestador.length >= 1

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep)

  const handleBasicChange = useCallback((updates: Partial<BasicFormData>) => {
    setBasicData(prev => ({ ...prev, ...updates }))
  }, [])

  const handleConfigChange = useCallback((updates: Partial<ConfigFormData>) => {
    setConfigData(prev => ({ ...prev, ...updates }))
  }, [])

  const handleContactChange = useCallback((updates: Partial<ContactFormData>) => {
    setContactData(prev => ({ ...prev, ...updates }))
  }, [])

  const handleSubmit = async () => {
    if (!isBasicValid) return

    setIsSubmitting(true)
    try {
      const data: CreateOperadoraInput = {
        ...basicData,
        razaoSocial: basicData.razaoSocial || undefined,
        cnpj: basicData.cnpj || undefined,
        ativa: operadora?.ativa ?? true,
        configuracoes: {
          prazoEnvioDias: configData.prazoEnvioDias,
          exigeAutorizacao: configData.exigeAutorizacao,
          permiteLote: configData.permiteLote,
          aceitaRecursoOnline: configData.aceitaRecursoOnline,
          diasPrazoRecurso: configData.diasPrazoRecurso,
        },
        webservice: {
          tipoIntegracao: configData.tipoIntegracao,
          usarHomologacao: false,
          timeoutMs: 30000,
          tentativasRetry: 3,
        },
        contatos: {
          emailFaturamento: contactData.emailFaturamento || undefined,
          telefoneFaturamento: contactData.telefoneFaturamento || undefined,
          portalUrl: contactData.portalUrl || undefined,
        },
        observacoes: contactData.observacoes || undefined,
      }

      await onSubmit(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    if (currentStep === 'basic') setCurrentStep('config')
    else if (currentStep === 'config') setCurrentStep('contact')
  }

  const prevStep = () => {
    if (currentStep === 'contact') setCurrentStep('config')
    else if (currentStep === 'config') setCurrentStep('basic')
  }

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
              {operadora ? 'Atualize os dados do convênio' : 'Cadastre um novo plano de saúde'}
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
          {STEPS.map((step, index) => (
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
                {index < currentStepIndex ? <Check className="w-4 h-4" /> : step.icon}
                <span className="hidden sm:inline">{step.label}</span>
              </button>
              {index < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-genesis-subtle" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6 space-y-6">
        {currentStep === 'basic' && (
          <OperadoraBasicStep data={basicData} onChange={handleBasicChange} />
        )}
        {currentStep === 'config' && (
          <OperadoraConfigStep data={configData} onChange={handleConfigChange} />
        )}
        {currentStep === 'contact' && (
          <OperadoraContactStep data={contactData} onChange={handleContactChange} />
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
  )
}

export default OperadoraForm
