import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Check,
  Brain,
  FileText,
  ShieldCheck,
  CreditCard,
  TestTube2,
  Lock,
  Smartphone,
  Mic,
  ArrowRight,
  Clock,
  TrendingUp,
  X,
  Sparkles,
  Zap,
  Users,
  FlaskConical
} from 'lucide-react';
import { Navbar } from '../components/landing/Navbar';

// --- COMPONENTS ---

const Badge = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
);

const SectionHeading = ({ title, subtitle, align = "center" }: { title: string, subtitle?: string, align?: "center" | "left" }) => (
  <div className={`mb-12 ${align === "center" ? "text-center" : "text-left"}`}>
    <h2 className="text-3xl md:text-4xl font-bold text-genesis-dark tracking-tight mb-4">
      {title}
    </h2>
    {subtitle && (
      <p className="text-lg text-genesis-muted max-w-2xl mx-auto leading-relaxed">
        {subtitle}
      </p>
    )}
  </div>
);

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  const handleApply = () => {
    navigate('/apply');
  };

  const handleDemo = () => {
    navigate('/login');
  };

  // --- CONTENT DATA ---

  const metrics = [
    { label: "Horas economizadas/mês", value: "40h", icon: Clock },
    { label: "Menos tempo em burocracia", value: "-40%", icon: TrendingUp },
    { label: "Testes Automatizados", value: "2.636", icon: TestTube2 },
    { label: "Uptime Garantido", value: "99.9%", icon: Activity },
  ];

  const features = [
    {
      title: "AI Scribe",
      desc: "Fale com seu paciente normalmente. O sistema ouve, entende e preenche o prontuário SOAP automaticamente. Economize 15 minutos por consulta.",
      icon: Mic,
      colSpan: "col-span-1 md:col-span-2",
      bg: "bg-clinical-soft border-clinical-muted/20",
      text: "text-clinical-start",
      badge: "Exclusivo"
    },
    {
      title: "Diagnóstico Multi-LLM",
      desc: "3 IAs (GPT-4 + Gemini + Claude) analisam o caso e chegam a um consenso. Segunda opinião clínica em segundos, com explicação do raciocínio.",
      icon: Brain,
      colSpan: "col-span-1",
      bg: "bg-genesis-primary-soft border-genesis-primary-light/20",
      text: "text-genesis-primary",
      badge: "Exclusivo"
    },
    {
      title: "Análise de Exames com IA",
      desc: "Upload do PDF do laboratório → OCR automático → Interpretação inteligente com correlações e alertas.",
      icon: FlaskConical,
      colSpan: "col-span-1",
      bg: "bg-info-soft border-info-dark/20",
      text: "text-info",
      badge: "Exclusivo"
    },
    {
      title: "TISS 4.02.00 Nativo",
      desc: "Faturamento sem glosas. Guias de consulta e SADT validadas automaticamente. Gestão de glosas e recursos integrada.",
      icon: FileText,
      colSpan: "col-span-1",
      bg: "bg-success-soft border-success-dark/20",
      text: "text-success"
    },
    {
      title: "Telemedicina E2E",
      desc: "Vídeo criptografado ponta-a-ponta via Jitsi. Sala de espera, gravação e prontuário na mesma tela. Ilimitado.",
      icon: Smartphone,
      colSpan: "col-span-1",
      bg: "bg-clinical-soft border-clinical-muted/20",
      text: "text-clinical-end"
    },
    {
      title: "Portal do Paciente",
      desc: "Seus pacientes acessam consultas, exames, receitas e pagam online. Menos ligações, mais autonomia.",
      icon: Users,
      colSpan: "col-span-1",
      bg: "bg-warning-soft border-warning/20",
      text: "text-warning"
    }
  ];

  const comparison = [
    { feature: "AI Scribe (Áudio → SOAP)", genesis: true, iclinic: false, amplimed: false, feegow: false },
    { feature: "Diagnóstico Multi-LLM (3 IAs)", genesis: true, iclinic: false, amplimed: false, feegow: false },
    { feature: "Análise de Exames com IA", genesis: true, iclinic: false, amplimed: false, feegow: false },
    { feature: "Explainability (IA explica)", genesis: true, iclinic: false, amplimed: false, feegow: false },
    { feature: "Telemedicina Ilimitada", genesis: true, iclinic: "Extra", amplimed: true, feegow: "Extra" },
    { feature: "TISS 4.02.00 Completo", genesis: true, iclinic: true, amplimed: true, feegow: true },
    { feature: "Portal do Paciente", genesis: true, iclinic: "Básico", amplimed: "Básico", feegow: true },
    { feature: "PWA Offline", genesis: true, iclinic: false, amplimed: false, feegow: false },
    { feature: "Dark Mode", genesis: true, iclinic: false, amplimed: false, feegow: false },
    { feature: "Preço (plano completo)", genesis: "R$299", iclinic: "R$299", amplimed: "R$200+", feegow: "R$299" },
  ];

  return (
    <div className="min-h-screen bg-genesis-surface font-sans text-genesis-text overflow-x-hidden selection:bg-genesis-primary-soft selection:text-genesis-primary-dark">
      
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-genesis-primary-soft/50 via-genesis-soft to-genesis-surface"></div>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <Badge className="bg-genesis-primary-soft text-genesis-primary-dark border border-genesis-primary-light/20 mb-8 animate-fade-in-up">
            <Sparkles className="w-3 h-3 mr-1" /> O único software médico com IA de verdade
          </Badge>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-genesis-dark max-w-4xl mx-auto leading-[1.1]">
            Mesmo preço dos concorrentes. <span className="text-genesis-primary">10x mais tecnologia.</span>
          </h1>

          <p className="text-xl text-genesis-muted mb-6 max-w-2xl mx-auto leading-relaxed">
            Enquanto outros vendem agenda e prontuário, nós devolvemos seu <strong>tempo</strong>.
            AI Scribe transcreve consultas, 3 IAs fazem diagnóstico em consenso, e análise de exames automática.
          </p>

          <p className="text-lg text-genesis-primary font-semibold mb-10">
            R$299/mês — Tudo incluso. Sem surpresas.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <button
              onClick={handleApply}
              className="px-8 py-4 bg-genesis-dark text-white rounded-xl font-semibold text-lg hover:bg-genesis-text transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              Começar Agora <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={handleDemo}
              className="px-8 py-4 bg-genesis-surface text-genesis-text border border-genesis-border rounded-xl font-semibold text-lg hover:bg-genesis-soft transition-all flex items-center gap-2"
            >
              Ver Demo Médico
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={() => navigate('/portal/demo')}
              className="px-6 py-3 bg-genesis-primary/10 text-genesis-primary border border-genesis-primary/20 rounded-xl font-medium hover:bg-genesis-primary/20 transition-all flex items-center gap-2"
            >
              Ver Demo Paciente <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/portal/login')}
              className="text-sm text-genesis-muted hover:text-genesis-primary transition-colors flex items-center gap-2"
            >
              Já sou paciente - Login <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Social Proof / Engineering Truth */}
          <div className="pt-8 border-t border-genesis-border-subtle max-w-5xl mx-auto">
            <p className="text-sm text-genesis-subtle font-medium mb-6 uppercase tracking-widest">Engenharia de Verdade</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {metrics.map((m, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className="flex items-center gap-2 text-genesis-dark font-bold text-2xl">
                    <m.icon className="w-5 h-5 text-genesis-primary" />
                    {m.value}
                  </div>
                  <span className="text-sm text-genesis-muted">{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- PROBLEM SECTION --- */}
      <section className="py-24 bg-genesis-soft">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading 
            title="O mercado de saúde está quebrado" 
            subtitle="Médicos usam 5+ ferramentas diferentes para fazer o trabalho de uma."
          />
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-genesis-surface p-8 rounded-2xl shadow-sm border border-genesis-border-subtle">
              <div className="w-12 h-12 bg-danger-soft rounded-lg flex items-center justify-center mb-6">
                <FileText className="w-6 h-6 text-danger" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-genesis-dark">Burocracia Excessiva</h3>
              <p className="text-genesis-muted">40% do tempo do médico é gasto preenchendo formulários e prontuários manuais.</p>
            </div>
            <div className="bg-genesis-surface p-8 rounded-2xl shadow-sm border border-genesis-border-subtle">
              <div className="w-12 h-12 bg-warning-soft rounded-lg flex items-center justify-center mb-6">
                <CreditCard className="w-6 h-6 text-warning" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-genesis-dark">Glosa no TISS</h3>
              <p className="text-genesis-muted">30% das guias são glosadas por erros simples de preenchimento ou versão.</p>
            </div>
            <div className="bg-genesis-surface p-8 rounded-2xl shadow-sm border border-genesis-border-subtle">
              <div className="w-12 h-12 bg-genesis-hover rounded-lg flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-genesis-medium" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-genesis-dark">Diagnóstico Isolado</h3>
              <p className="text-genesis-muted">Decisões clínicas dependem 100% da memória humana, sem suporte de dados.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- BENTO GRID SOLUTION --- */}
      <section className="py-24 bg-genesis-surface">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading 
            title="Tudo em uma plataforma" 
            subtitle="Não somos apenas um prontuário. Somos o sistema operacional da sua clínica."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, idx) => (
              <div key={idx} className={`${feature.colSpan} p-8 rounded-3xl border ${feature.bg} transition-all hover:scale-[1.01]`}>
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-3 rounded-xl bg-genesis-surface shadow-sm ${feature.text}`}>
                    <feature.icon className="w-8 h-8" />
                  </div>
                  {feature.badge && (
                    <Badge className="bg-genesis-primary text-white">
                      <Zap className="w-3 h-3 mr-1" /> {feature.badge}
                    </Badge>
                  )}
                </div>
                <h3 className={`text-2xl font-bold mb-3 text-genesis-dark`}>{feature.title}</h3>
                <p className="text-genesis-text leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Compliance Strip */}
          <div className="mt-16 py-8 border-y border-genesis-border-subtle flex flex-wrap justify-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all">
            <div className="flex items-center gap-2 font-semibold text-genesis-muted">
              <ShieldCheck className="w-5 h-5 text-genesis-primary" /> LGPD Compliant
            </div>
            <div className="flex items-center gap-2 font-semibold text-genesis-muted">
              <Lock className="w-5 h-5 text-genesis-primary" /> HIPAA Ready
            </div>
            <div className="flex items-center gap-2 font-semibold text-genesis-muted">
              <FileText className="w-5 h-5 text-genesis-primary" /> TISS 4.02.00
            </div>
            <div className="flex items-center gap-2 font-semibold text-genesis-muted">
              <Check className="w-5 h-5 text-genesis-primary" /> CFM 1.821/07
            </div>
          </div>
        </div>
      </section>

      {/* --- COMPARISON TABLE --- */}
      <section className="py-24 bg-genesis-dark text-genesis-surface">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-genesis-primary/20 text-genesis-primary-light border-none mb-6">
              Comparativo Honesto
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Mesmo preço. Tecnologia incomparável.</h2>
            <p className="text-genesis-muted max-w-2xl mx-auto">
              Pelo preço de um sistema tradicional, você tem o único com IA clínica de verdade.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="py-4 px-4 text-sm font-medium text-genesis-muted uppercase tracking-wider">Feature</th>
                  <th className="py-4 px-4 text-xl font-bold text-genesis-primary bg-genesis-surface/10 rounded-t-xl text-center">Genesis</th>
                  <th className="py-4 px-4 text-base font-semibold text-genesis-border text-center">iClinic</th>
                  <th className="py-4 px-4 text-base font-semibold text-genesis-border text-center">Amplimed</th>
                  <th className="py-4 px-4 text-base font-semibold text-genesis-border text-center">Feegow</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {comparison.map((row, idx) => (
                  <tr key={idx} className="hover:bg-genesis-surface/5 transition-colors">
                    <td className="py-5 px-4 font-medium text-sm">{row.feature}</td>
                    <td className="py-5 px-4 bg-genesis-surface/10 text-center">
                      {row.genesis === true ? <Check className="w-6 h-6 text-genesis-primary mx-auto" /> :
                       row.genesis === false ? <X className="w-5 h-5 text-genesis-muted mx-auto" /> :
                       <span className="text-genesis-primary font-bold">{row.genesis}</span>}
                    </td>
                    <td className="py-5 px-4 text-center">
                      {row.iclinic === true ? <Check className="w-5 h-5 text-success mx-auto" /> :
                       row.iclinic === false ? <X className="w-5 h-5 text-danger/50 mx-auto" /> :
                       <span className="text-warning text-xs">{row.iclinic}</span>}
                    </td>
                    <td className="py-5 px-4 text-center">
                      {row.amplimed === true ? <Check className="w-5 h-5 text-success mx-auto" /> :
                       row.amplimed === false ? <X className="w-5 h-5 text-danger/50 mx-auto" /> :
                       <span className="text-warning text-xs">{row.amplimed}</span>}
                    </td>
                    <td className="py-5 px-4 text-center">
                      {row.feegow === true ? <Check className="w-5 h-5 text-success mx-auto" /> :
                       row.feegow === false ? <X className="w-5 h-5 text-danger/50 mx-auto" /> :
                       <span className="text-warning text-xs">{row.feegow}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-12 text-center">
            <p className="text-genesis-muted text-sm mb-6">
              * Dados baseados em pesquisa de mercado Dez/2025. Preços podem variar.
            </p>
            <button
              onClick={handleApply}
              className="px-8 py-4 bg-genesis-primary text-white rounded-xl font-semibold text-lg hover:bg-genesis-primary-light transition-all shadow-lg shadow-genesis-primary/25"
            >
              Começar com Genesis <ArrowRight className="inline w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* --- PRICING --- */}
      <section id="pricing" className="py-24 bg-genesis-soft">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading
            title="Preço justo. IA inclusa."
            subtitle="Sem taxa de adesão. Sem fidelidade. Cancele quando quiser."
          />

          {/* Pricing Toggle */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex items-center gap-3 bg-genesis-surface p-1 rounded-lg border border-genesis-border-subtle">
              <span className="text-sm text-genesis-muted px-3">Mensal</span>
              <div className="w-12 h-6 bg-genesis-primary rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow" />
              </div>
              <span className="text-sm font-semibold text-genesis-dark px-3">Anual <span className="text-genesis-primary">(-20%)</span></span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter */}
            <div className="bg-genesis-surface p-8 rounded-2xl border border-genesis-border-subtle shadow-sm hover:shadow-md transition-all">
              <h3 className="text-lg font-semibold text-genesis-dark mb-2">Starter</h3>
              <p className="text-sm text-genesis-muted mb-4">Para profissionais solo</p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold text-genesis-dark">R$149</span>
                <span className="text-genesis-muted">/mês</span>
              </div>
              <p className="text-xs text-genesis-subtle mb-6">ou R$189/mês no mensal</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-sm text-genesis-text"><Check className="w-4 h-4 text-genesis-primary flex-shrink-0"/> Até 300 pacientes</li>
                <li className="flex items-center gap-3 text-sm text-genesis-text"><Check className="w-4 h-4 text-genesis-primary flex-shrink-0"/> Prontuário SOAP completo</li>
                <li className="flex items-center gap-3 text-sm text-genesis-text"><Check className="w-4 h-4 text-genesis-primary flex-shrink-0"/> Prescrição digital</li>
                <li className="flex items-center gap-3 text-sm text-genesis-text"><Check className="w-4 h-4 text-genesis-primary flex-shrink-0"/> <strong>AI Scribe (30/mês)</strong></li>
                <li className="flex items-center gap-3 text-sm text-genesis-text"><Check className="w-4 h-4 text-genesis-primary flex-shrink-0"/> Telemedicina (10/mês)</li>
                <li className="flex items-center gap-3 text-sm text-genesis-text"><Check className="w-4 h-4 text-genesis-primary flex-shrink-0"/> WhatsApp lembretes (100/mês)</li>
              </ul>
              <button onClick={handleApply} className="w-full py-3 bg-genesis-hover text-genesis-dark font-semibold rounded-lg hover:bg-genesis-border transition-colors">
                Começar Trial Grátis
              </button>
            </div>

            {/* Pro */}
            <div className="bg-genesis-dark p-8 rounded-2xl shadow-xl transform md:scale-105 relative z-10">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-genesis-primary text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Mais Popular
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Pro</h3>
              <p className="text-sm text-genesis-muted mb-4">Para clínicas que buscam excelência</p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold text-white">R$299</span>
                <span className="text-genesis-subtle">/mês</span>
              </div>
              <p className="text-xs text-genesis-muted mb-6">ou R$379/mês no mensal • Igual ao iClinic Pro</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-sm text-genesis-border"><Check className="w-4 h-4 text-genesis-primary-light flex-shrink-0"/> <strong>Pacientes ilimitados</strong></li>
                <li className="flex items-center gap-3 text-sm text-genesis-border"><Check className="w-4 h-4 text-genesis-primary-light flex-shrink-0"/> Tudo do Starter +</li>
                <li className="flex items-center gap-3 text-sm text-genesis-border"><Check className="w-4 h-4 text-genesis-primary-light flex-shrink-0"/> <strong>AI Scribe ilimitado</strong></li>
                <li className="flex items-center gap-3 text-sm text-genesis-border"><Check className="w-4 h-4 text-genesis-primary-light flex-shrink-0"/> <strong>Diagnóstico Multi-LLM</strong></li>
                <li className="flex items-center gap-3 text-sm text-genesis-border"><Check className="w-4 h-4 text-genesis-primary-light flex-shrink-0"/> <strong>Análise de Exames IA</strong></li>
                <li className="flex items-center gap-3 text-sm text-genesis-border"><Check className="w-4 h-4 text-genesis-primary-light flex-shrink-0"/> Telemedicina E2E ilimitada</li>
                <li className="flex items-center gap-3 text-sm text-genesis-border"><Check className="w-4 h-4 text-genesis-primary-light flex-shrink-0"/> Faturamento TISS completo</li>
                <li className="flex items-center gap-3 text-sm text-genesis-border"><Check className="w-4 h-4 text-genesis-primary-light flex-shrink-0"/> Portal do Paciente</li>
                <li className="flex items-center gap-3 text-sm text-genesis-border"><Check className="w-4 h-4 text-genesis-primary-light flex-shrink-0"/> Suporte prioritário (24h)</li>
              </ul>
              <button onClick={handleApply} className="w-full py-3 bg-genesis-primary text-white font-semibold rounded-lg hover:bg-genesis-primary-light transition-colors shadow-lg shadow-genesis-primary/25">
                Começar Trial Grátis
              </button>
            </div>

            {/* Business */}
            <div className="bg-genesis-surface p-8 rounded-2xl border border-genesis-border-subtle shadow-sm hover:shadow-md transition-all">
              <h3 className="text-lg font-semibold text-genesis-dark mb-2">Business</h3>
              <p className="text-sm text-genesis-muted mb-4">Para clínicas maiores</p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold text-genesis-dark">R$449</span>
                <span className="text-genesis-muted">/mês</span>
              </div>
              <p className="text-xs text-genesis-subtle mb-6">ou R$549/mês no mensal</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-sm text-genesis-text"><Check className="w-4 h-4 text-genesis-primary flex-shrink-0"/> Tudo do Pro +</li>
                <li className="flex items-center gap-3 text-sm text-genesis-text"><Check className="w-4 h-4 text-genesis-primary flex-shrink-0"/> Até 10 profissionais</li>
                <li className="flex items-center gap-3 text-sm text-genesis-text"><Check className="w-4 h-4 text-genesis-primary flex-shrink-0"/> Analytics avançado</li>
                <li className="flex items-center gap-3 text-sm text-genesis-text"><Check className="w-4 h-4 text-genesis-primary flex-shrink-0"/> Relatórios personalizados</li>
                <li className="flex items-center gap-3 text-sm text-genesis-text"><Check className="w-4 h-4 text-genesis-primary flex-shrink-0"/> Onboarding assistido</li>
                <li className="flex items-center gap-3 text-sm text-genesis-text"><Check className="w-4 h-4 text-genesis-primary flex-shrink-0"/> SLA 99.9%</li>
              </ul>
              <button onClick={handleApply} className="w-full py-3 bg-genesis-hover text-genesis-dark font-semibold rounded-lg hover:bg-genesis-border transition-colors">
                Falar com Vendas
              </button>
            </div>
          </div>

          {/* Enterprise CTA */}
          <div className="mt-12 text-center">
            <p className="text-genesis-muted mb-4">
              Redes, hospitais ou mais de 10 profissionais?
            </p>
            <button onClick={handleApply} className="text-genesis-primary font-semibold hover:underline">
              Conheça o plano Enterprise →
            </button>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-genesis-surface border-t border-genesis-border-subtle py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-genesis-dark rounded-lg flex items-center justify-center">
                <Activity className="text-white w-4 h-4" />
              </div>
              <span className="font-bold text-genesis-dark">GENESIS</span>
            </div>
            <p className="text-sm text-genesis-muted">
              © 2025 Vértice Maximus Tecnologia. Cuidando de quem cuida.
            </p>
            <div className="flex gap-6 text-sm text-genesis-muted">
              <a href="#pricing" className="hover:text-genesis-primary transition-colors">Privacidade</a>
              <a href="#pricing" className="hover:text-genesis-primary transition-colors">Termos</a>
              <a href="mailto:contato@clinicagenesis.com.br" className="hover:text-genesis-primary transition-colors">Contato</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

