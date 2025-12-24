/**
 * Membership Page
 *
 * Pricing plans and membership benefits.
 * Premium landing subpage with tiered offerings.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Brain,
  Building2,
  Calendar,
  CheckCircle2,
  Crown,
  FileText,
  HeadphonesIcon,
  Lock,
  MessageCircle,
  Rocket,
  Shield,
  Sparkles,
  Star,
  Users,
  Video,
  Zap
} from 'lucide-react';

interface PlanProps {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  icon: React.ElementType;
  ctaText: string;
  key?: React.Key;
}

function PricingCard({
  name,
  price,
  period,
  description,
  features,
  highlighted = false,
  icon: Icon,
  ctaText
}: PlanProps) {
  const navigate = useNavigate();

  return (
    <div
      className={`relative p-8 rounded-2xl transition-all duration-300 ${
        highlighted
          ? 'bg-genesis-dark text-white shadow-2xl scale-105 z-10'
          : 'bg-genesis-surface border border-genesis-border-subtle shadow-md hover:shadow-lg'
      }`}
    >
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-1 px-4 py-1.5 bg-genesis-primary text-white text-xs font-bold rounded-full">
            <Star className="w-3 h-3" />
            MAIS POPULAR
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            highlighted ? 'bg-white/20' : 'bg-genesis-primary/10'
          }`}
        >
          <Icon className={`w-6 h-6 ${highlighted ? 'text-white' : 'text-genesis-primary'}`} />
        </div>
        <h3 className={`text-xl font-bold ${highlighted ? 'text-white' : 'text-genesis-dark'}`}>{name}</h3>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className={`text-4xl font-black ${highlighted ? 'text-white' : 'text-genesis-dark'}`}>
            {price}
          </span>
          <span className={`text-sm ${highlighted ? 'text-white/70' : 'text-genesis-muted'}`}>/{period}</span>
        </div>
        <p className={`text-sm mt-2 ${highlighted ? 'text-white/70' : 'text-genesis-muted'}`}>{description}</p>
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <CheckCircle2
              className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                highlighted ? 'text-genesis-primary' : 'text-green-500'
              }`}
            />
            <span className={`text-sm ${highlighted ? 'text-white/90' : 'text-genesis-medium'}`}>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => navigate('/apply')}
        className={`w-full py-3 rounded-xl font-bold transition-all ${
          highlighted
            ? 'bg-genesis-primary text-white hover:bg-genesis-primary/90'
            : 'bg-genesis-dark text-white hover:bg-black'
        }`}
      >
        {ctaText}
      </button>
    </div>
  );
}

export function Membership() {
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');

  const plans: PlanProps[] = [
    {
      name: 'Solo',
      price: billingPeriod === 'yearly' ? 'R$197' : 'R$247',
      period: 'mês',
      description: 'Para profissionais autônomos que querem começar',
      icon: Users,
      ctaText: 'Começar Agora',
      features: [
        'Até 200 pacientes',
        'Agenda completa',
        'Prontuário eletrônico SOAP',
        'Prescrição digital',
        'WhatsApp lembretes (100/mês)',
        'Suporte por email'
      ]
    },
    {
      name: 'Pro',
      price: billingPeriod === 'yearly' ? 'R$397' : 'R$497',
      period: 'mês',
      description: 'Para clínicas que buscam excelência',
      icon: Rocket,
      highlighted: true,
      ctaText: 'Começar Teste Grátis',
      features: [
        'Pacientes ilimitados',
        'Tudo do Solo +',
        'AI Scribe (transcrição)',
        'Diagnóstico Multi-LLM',
        'Telemedicina E2E',
        'Faturamento TISS',
        'WhatsApp ilimitado',
        'Suporte prioritário'
      ]
    },
    {
      name: 'Enterprise',
      price: 'Sob consulta',
      period: '',
      description: 'Para redes e hospitais',
      icon: Building2,
      ctaText: 'Falar com Vendas',
      features: [
        'Tudo do Pro +',
        'Multi-unidades',
        'API & Integrações',
        'SLA garantido 99.9%',
        'Onboarding dedicado',
        'Gerente de conta',
        'Customizações',
        'Treinamento in-loco'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-genesis-surface">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-genesis-surface/90 backdrop-blur-xl border-b border-genesis-border/50 py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-genesis-muted hover:text-genesis-dark transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Voltar</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-genesis-dark rounded-lg flex items-center justify-center">
              <Activity className="text-white w-4 h-4" />
            </div>
            <span className="font-bold text-genesis-dark">GENESIS</span>
          </div>
          <button
            onClick={() => navigate('/apply')}
            className="px-4 py-2 bg-genesis-dark text-white rounded-lg text-sm font-bold hover:bg-black transition-colors"
          >
            Começar
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full mb-8">
            <Crown className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-bold text-purple-600">Planos & Preços</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-genesis-dark leading-[1.1] mb-8">
            Invista na melhor{' '}
            <span className="text-genesis-primary">ferramenta.</span>
          </h1>

          <p className="text-xl text-genesis-medium leading-relaxed max-w-2xl mx-auto mb-12">
            Escolha o plano ideal para sua prática. Todos incluem 14 dias grátis
            para você experimentar sem compromisso.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 p-1.5 bg-genesis-soft rounded-xl">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-genesis-surface text-genesis-dark shadow-sm'
                  : 'text-genesis-muted hover:text-genesis-dark'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                billingPeriod === 'yearly'
                  ? 'bg-genesis-surface text-genesis-dark shadow-sm'
                  : 'text-genesis-muted hover:text-genesis-dark'
              }`}
            >
              Anual
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">-20%</span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 items-center">
            {plans.map((plan, index) => {
              const cardProps: PlanProps = {
                name: plan.name,
                price: plan.price,
                period: plan.period,
                description: plan.description,
                features: plan.features,
                highlighted: plan.highlighted,
                icon: plan.icon,
                ctaText: plan.ctaText
              };
              return <PricingCard key={index} {...cardProps} />;
            })}
          </div>
        </div>
      </section>

      {/* All Features */}
      <section className="py-24 bg-genesis-soft px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-genesis-dark text-center mb-4">Tudo Incluído</h2>
          <p className="text-genesis-muted text-center mb-16">
            Funcionalidades premium em todos os planos
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-genesis-dark mb-1">Agenda Inteligente</h3>
                  <p className="text-sm text-genesis-muted">Drag & drop, visualização semanal, conflitos automáticos</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-genesis-dark mb-1">Prontuário SOAP</h3>
                  <p className="text-sm text-genesis-muted">Subjetivo, Objetivo, Avaliação, Plano estruturado</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-genesis-dark mb-1">WhatsApp Lembretes</h3>
                  <p className="text-sm text-genesis-muted">Confirmação, lembrete 24h, lembrete 2h automáticos</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Brain className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-genesis-dark mb-1">AI Diagnóstico</h3>
                  <p className="text-sm text-genesis-muted">Multi-LLM consensus com explicação do raciocínio</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Video className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-genesis-dark mb-1">Telemedicina</h3>
                  <p className="text-sm text-genesis-muted">Videochamada E2E encryption, sala de espera virtual</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-bold text-genesis-dark mb-1">TISS 4.02</h3>
                  <p className="text-sm text-genesis-muted">Guias de consulta e SADT com validação automática</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lock className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-genesis-dark mb-1">LGPD Compliant</h3>
                  <p className="text-sm text-genesis-muted">Consentimento, logs de auditoria, exportação de dados</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-bold text-genesis-dark mb-1">Dark Mode</h3>
                  <p className="text-sm text-genesis-muted">Interface adaptável para conforto visual</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <HeadphonesIcon className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-genesis-dark mb-1">Suporte Humano</h3>
                  <p className="text-sm text-genesis-muted">Time de atendimento real, não bots</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-genesis-dark text-center mb-16">Perguntas Frequentes</h2>

          <div className="space-y-6">
            <div className="p-6 bg-genesis-surface rounded-2xl border border-genesis-border-subtle shadow-md">
              <h3 className="font-bold text-genesis-dark mb-2">Posso cancelar a qualquer momento?</h3>
              <p className="text-genesis-muted text-sm leading-relaxed">
                Sim! Você pode cancelar sua assinatura a qualquer momento sem multa ou burocracia.
                Seus dados ficam disponíveis por 30 dias após o cancelamento.
              </p>
            </div>

            <div className="p-6 bg-genesis-surface rounded-2xl border border-genesis-border-subtle shadow-md">
              <h3 className="font-bold text-genesis-dark mb-2">Como funciona a migração de dados?</h3>
              <p className="text-genesis-muted text-sm leading-relaxed">
                Nosso time de onboarding ajuda você a migrar dados de outros sistemas gratuitamente.
                Importamos de planilhas, PDFs e sistemas legados.
              </p>
            </div>

            <div className="p-6 bg-genesis-surface rounded-2xl border border-genesis-border-subtle shadow-md">
              <h3 className="font-bold text-genesis-dark mb-2">A IA substitui o médico?</h3>
              <p className="text-genesis-muted text-sm leading-relaxed">
                Jamais. Nossa IA é uma ferramenta de apoio ao diagnóstico, uma "segunda opinião" digital.
                A decisão final sempre é do profissional de saúde.
              </p>
            </div>

            <div className="p-6 bg-genesis-surface rounded-2xl border border-genesis-border-subtle shadow-md">
              <h3 className="font-bold text-genesis-dark mb-2">Meus dados estão seguros?</h3>
              <p className="text-genesis-muted text-sm leading-relaxed">
                Absolutamente. Usamos criptografia E2E, infraestrutura Firebase com compliance SOC2,
                e seguimos rigorosamente a LGPD e HIPAA.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-white text-center" style={{ background: 'linear-gradient(to bottom right, #0f766e, #115e59)' }}>
        <div className="max-w-2xl mx-auto px-6">
          <Zap className="w-12 h-12 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl font-bold mb-4">Comece seu teste grátis hoje</h2>
          <p className="text-white/80 mb-8">
            14 dias grátis. Sem cartão de crédito. Cancele quando quiser.
          </p>
          <button
            onClick={() => navigate('/apply')}
            className="px-8 py-4 bg-white text-genesis-primary rounded-xl font-bold text-lg hover:bg-opacity-90 transition-all shadow-lg flex items-center justify-center gap-2 mx-auto"
          >
            Começar Agora <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
}

export default Membership;
