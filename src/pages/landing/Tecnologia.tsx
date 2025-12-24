/**
 * Tecnologia Page
 *
 * Deep dive into our tech stack, AI capabilities, and engineering excellence.
 * Premium landing subpage showcasing technical superiority.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Brain,
  Cloud,
  Code2,
  Cpu,
  Database,
  FileCode2,
  GitBranch,
  Layers,
  Lock,
  Mic,
  MonitorSmartphone,
  Palette,
  Server,
  Shield,
  Smartphone,
  Sparkles,
  TestTube,
  Video,
  Zap
} from 'lucide-react';

interface TechCardProps {
  icon: React.ElementType;
  name: string;
  version?: string;
  description: string;
  colorClass: string;
}

function TechCard({ icon: Icon, name, version, description, colorClass }: TechCardProps) {
  return (
    <div className="p-6 bg-genesis-surface rounded-2xl border border-genesis-border-subtle shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className={`w-12 h-12 ${colorClass} rounded-xl flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="font-bold text-genesis-dark mb-1">
        {name}
        {version && <span className="text-genesis-primary ml-2 text-sm">{version}</span>}
      </h3>
      <p className="text-sm text-genesis-muted leading-relaxed">{description}</p>
    </div>
  );
}

// StatCard available for future metrics section
// interface StatCardProps {
//   value: string;
//   label: string;
//   colorClass: string;
// }

export function Tecnologia() {
  const navigate = useNavigate();

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
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-8">
            <Code2 className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-bold text-blue-600">Stack Tecnológica</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-genesis-dark leading-[1.1] mb-8">
            Engenharia de{' '}
            <span className="text-genesis-primary">primeira classe.</span>
          </h1>

          <p className="text-xl text-genesis-medium leading-relaxed max-w-2xl mx-auto">
            Não usamos frameworks legados ou gambiarra. Cada linha de código é pensada
            para performance, manutenibilidade e experiência do usuário.
          </p>
        </div>
      </section>

      {/* Quality Metrics */}
      <section className="py-16 bg-genesis-dark">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-white text-center mb-12">Métricas de Qualidade</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-5xl font-black text-emerald-400 mb-2">1028</div>
              <p className="text-genesis-subtle text-sm">Testes Passando</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black text-blue-400 mb-2">91%</div>
              <p className="text-genesis-subtle text-sm">Cobertura de Código</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black text-green-400 mb-2">0</div>
              <p className="text-genesis-subtle text-sm">Erros de Lint</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black text-purple-400 mb-2">AA</div>
              <p className="text-genesis-subtle text-sm">WCAG 2.1</p>
            </div>
          </div>
        </div>
      </section>

      {/* Frontend Stack */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full mb-4">
              <MonitorSmartphone className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Frontend</span>
            </div>
            <h2 className="text-3xl font-bold text-genesis-dark">Interface Moderna</h2>
            <p className="text-genesis-muted mt-2">O que há de mais moderno em desenvolvimento web</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <TechCard
              icon={Layers}
              name="React"
              version="19"
              description="A versão mais recente do React com concurrent features e server components."
              colorClass="bg-blue-100 text-blue-600"
            />
            <TechCard
              icon={FileCode2}
              name="TypeScript"
              version="5.7"
              description="100% tipado. Zero any. Strict mode ativado para máxima segurança."
              colorClass="bg-blue-600 text-white"
            />
            <TechCard
              icon={Palette}
              name="Tailwind CSS"
              version="v4"
              description="Design system próprio com tokens semânticos e dark mode completo."
              colorClass="bg-teal-100 text-teal-600"
            />
            <TechCard
              icon={Zap}
              name="Vite"
              version="6"
              description="Build ultrarrápido. Hot reload instantâneo. Tree shaking otimizado."
              colorClass="bg-purple-100 text-purple-600"
            />
            <TechCard
              icon={Smartphone}
              name="PWA"
              description="Instalável como app nativo. Funciona offline. Notificações push."
              colorClass="bg-orange-100 text-orange-600"
            />
            <TechCard
              icon={TestTube}
              name="Vitest"
              description="1028 testes automatizados. Coverage de 91%. CI/CD integrado."
              colorClass="bg-green-100 text-green-600"
            />
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section className="py-24 text-white" style={{ background: 'linear-gradient(to bottom right, #0f766e, #115e59)' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full mb-4">
              <Brain className="w-4 h-4 text-white" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Inteligência Artificial</span>
            </div>
            <h2 className="text-4xl font-bold mb-4">IA Real, Não Marketing</h2>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Nosso diagnóstico assistido usa consenso Multi-LLM. Três modelos de IA concordando
              é mais confiável que qualquer um sozinho.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-white mb-2">AI Scribe</h3>
              <p className="text-sm text-white/70">
                Transcrição automática de consultas → SOAP notes estruturados
              </p>
            </div>

            <div className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-white mb-2">Multi-LLM</h3>
              <p className="text-sm text-white/70">
                GPT-4 + Gemini + Claude em consenso para diagnóstico assistido
              </p>
            </div>

            <div className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-white mb-2">Explainability</h3>
              <p className="text-sm text-white/70">
                Explicação do raciocínio clínico - o "porquê" de cada diagnóstico
              </p>
            </div>

            <div className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <FileCode2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-white mb-2">Análise de Exames</h3>
              <p className="text-sm text-white/70">
                Upload PDF/imagem → interpretação automática com insights clínicos
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-white/60 text-sm">
              Powered by Azure OpenAI (GPT-4o-mini) + Google Vertex AI (Gemini)
            </p>
          </div>
        </div>
      </section>

      {/* Backend Stack */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 rounded-full mb-4">
              <Server className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Backend</span>
            </div>
            <h2 className="text-3xl font-bold text-genesis-dark">Infraestrutura Escalável</h2>
            <p className="text-genesis-muted mt-2">Firebase + Cloud Functions para performance global</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <TechCard
              icon={Database}
              name="Firestore"
              description="Banco NoSQL em tempo real. Multi-tenancy nativo. Offline sync automático."
              colorClass="bg-orange-100 text-orange-600"
            />
            <TechCard
              icon={Cloud}
              name="Cloud Functions"
              description="Serverless para operações complexas. Auto-scaling. Pay-per-use."
              colorClass="bg-blue-100 text-blue-600"
            />
            <TechCard
              icon={Lock}
              name="Firebase Auth"
              description="Autenticação segura. Email, Google, magic links. MFA ready."
              colorClass="bg-red-100 text-red-600"
            />
            <TechCard
              icon={Video}
              name="Jitsi Meet"
              description="Telemedicina com criptografia E2E. WebRTC nativo. HIPAA compliant."
              colorClass="bg-purple-100 text-purple-600"
            />
            <TechCard
              icon={GitBranch}
              name="Stripe"
              description="Pagamentos seguros. PIX e Boleto integrados. Webhooks automáticos."
              colorClass="bg-indigo-100 text-indigo-600"
            />
            <TechCard
              icon={Shield}
              name="TISS 4.02"
              description="Geração de guias XML. Validação automática. Integração com operadoras."
              colorClass="bg-green-100 text-green-600"
            />
          </div>
        </div>
      </section>

      {/* Architecture Diagram */}
      <section className="py-24 bg-genesis-soft px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-genesis-dark text-center mb-12">Arquitetura do Sistema</h2>

          <div className="bg-genesis-surface rounded-2xl border border-genesis-border-subtle shadow-lg p-8">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Layer 1: Clients */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-genesis-primary uppercase tracking-wider text-center">Clientes</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-genesis-soft rounded-xl text-center">
                    <MonitorSmartphone className="w-6 h-6 text-genesis-dark mx-auto mb-2" />
                    <p className="text-sm font-medium text-genesis-dark">Web App (React PWA)</p>
                  </div>
                  <div className="p-4 bg-genesis-soft rounded-xl text-center">
                    <Smartphone className="w-6 h-6 text-genesis-dark mx-auto mb-2" />
                    <p className="text-sm font-medium text-genesis-dark">Mobile (PWA / RN)</p>
                  </div>
                </div>
              </div>

              {/* Layer 2: Services */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-genesis-primary uppercase tracking-wider text-center">Serviços</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-orange-50 rounded-xl text-center border border-orange-100">
                    <Cloud className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-genesis-dark">Firebase Platform</p>
                    <p className="text-xs text-genesis-muted">Auth, Firestore, Storage</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl text-center border border-blue-100">
                    <Brain className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-genesis-dark">AI Services</p>
                    <p className="text-xs text-genesis-muted">Azure OpenAI, Vertex AI</p>
                  </div>
                </div>
              </div>

              {/* Layer 3: Integrations */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-genesis-primary uppercase tracking-wider text-center">Integrações</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-purple-50 rounded-xl text-center border border-purple-100">
                    <Video className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-genesis-dark">Jitsi Meet</p>
                    <p className="text-xs text-genesis-muted">Telemedicina E2E</p>
                  </div>
                  <div className="p-4 bg-indigo-50 rounded-xl text-center border border-indigo-100">
                    <GitBranch className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-genesis-dark">Stripe + TISS</p>
                    <p className="text-xs text-genesis-muted">Pagamentos & Faturamento</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-genesis-dark text-white text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-4">Pronto para ver em ação?</h2>
          <p className="text-genesis-subtle mb-8">
            Agende uma demonstração e veja a tecnologia funcionando na prática.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/apply')}
              className="px-8 py-4 bg-genesis-primary text-white rounded-xl font-bold hover:bg-genesis-primary/90 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              Agendar Demo <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/demo')}
              className="px-8 py-4 bg-white/10 text-white border border-white/30 rounded-xl font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-2"
            >
              Ver Demo Interativo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Tecnologia;
