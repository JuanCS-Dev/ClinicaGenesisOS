import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Check,
  Brain,
  FileText,
  ShieldCheck,
  CreditCard,
  Code2,
  TestTube2,
  Lock,
  Smartphone,
  Mic,
  ArrowRight
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
    { label: "Linhas de Código", value: "50k+", icon: Code2 },
    { label: "Testes Automatizados", value: "1.028", icon: TestTube2 },
    { label: "Cobertura de Código", value: "91%", icon: ShieldCheck },
    { label: "Uptime Garantido", value: "99.9%", icon: Activity },
  ];

  const features = [
    {
      title: "AI Scribe",
      desc: "Transcrição automática de consultas. O sistema ouve, entende e preenche o prontuário para você.",
      icon: Mic,
      colSpan: "col-span-1 md:col-span-2",
      bg: "bg-clinical-soft border-clinical-muted/20",
      text: "text-clinical-start"
    },
    {
      title: "Diagnóstico Assistido",
      desc: "Consenso Multi-LLM (GPT-4 + Gemini + Claude) para segunda opinião clínica em segundos.",
      icon: Brain,
      colSpan: "col-span-1",
      bg: "bg-genesis-primary-soft border-genesis-primary-light/20",
      text: "text-genesis-primary"
    },
    {
      title: "TISS 4.02.00 Nativo",
      desc: "Faturamento sem glosas. Guias de consulta e SADT validadas automaticamente contra regras da ANS.",
      icon: FileText,
      colSpan: "col-span-1",
      bg: "bg-info-soft border-info-dark/20",
      text: "text-info"
    },
    {
      title: "Telemedicina E2E",
      desc: "Vídeo criptografado, sem links externos. Sala de espera virtual e gravação segura integrada.",
      icon: Smartphone,
      colSpan: "col-span-1 md:col-span-2",
      bg: "bg-clinical-soft border-clinical-muted/20",
      text: "text-clinical-end"
    }
  ];

  const comparison = [
    { feature: "IA Diagnóstico (Multi-LLM)", genesis: true, iclinic: false, doctoralia: false },
    { feature: "AI Scribe (Transcrição)", genesis: true, iclinic: false, doctoralia: false },
    { feature: "TISS 4.02 Nativo", genesis: true, iclinic: "Parcial", doctoralia: false },
    { feature: "Telemedicina Integrada", genesis: true, iclinic: "Parcial", doctoralia: true },
    { feature: "Código Aberto / Auditável", genesis: true, iclinic: false, doctoralia: false },
  ];

  return (
    <div className="min-h-screen bg-genesis-surface font-sans text-genesis-text overflow-x-hidden selection:bg-genesis-primary-soft selection:text-genesis-primary-dark">
      
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-genesis-primary-soft/50 via-genesis-soft to-genesis-surface"></div>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <Badge className="bg-genesis-primary-soft text-genesis-primary-dark border border-genesis-primary-light/20 mb-8 animate-fade-in-up">
            🚀 A plataforma de gestão clínica mais inteligente do Brasil
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-genesis-dark max-w-4xl mx-auto leading-[1.1]">
            Médicos querem cuidar de pacientes, <span className="text-genesis-primary">não de papelada.</span>
          </h1>
          
          <p className="text-xl text-genesis-muted mb-10 max-w-2xl mx-auto leading-relaxed">
            Elimine 40% da burocracia com a primeira plataforma que une 
            <strong> Prontuário, Financeiro, TISS e IA Real</strong> em um único sistema operacional.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
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
              Ver Demo
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
                  {idx === 0 && <Badge className="bg-clinical-start text-white">Novo</Badge>}
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
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Por que migrar para o Genesis?</h2>
            <p className="text-genesis-muted">Compare tecnologia, não apenas preço.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="py-4 px-6 text-sm font-medium text-genesis-muted uppercase tracking-wider">Feature</th>
                  <th className="py-4 px-6 text-xl font-bold text-genesis-primary bg-genesis-surface/5 rounded-t-xl">Genesis</th>
                  <th className="py-4 px-6 text-lg font-semibold text-genesis-border">iClinic</th>
                  <th className="py-4 px-6 text-lg font-semibold text-genesis-border">Doctoralia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {comparison.map((row, idx) => (
                  <tr key={idx} className="hover:bg-genesis-surface/5 transition-colors">
                    <td className="py-6 px-6 font-medium">{row.feature}</td>
                    <td className="py-6 px-6 bg-genesis-surface/5">
                      {row.genesis ? <Check className="w-6 h-6 text-genesis-primary" /> : <span className="text-genesis-muted">-</span>}
                    </td>
                    <td className="py-6 px-6">
                      {row.iclinic === true ? <Check className="w-5 h-5 text-success" /> : 
                       row.iclinic === false ? <span className="text-genesis-muted">-</span> : 
                       <span className="text-warning text-sm">{row.iclinic}</span>}
                    </td>
                    <td className="py-6 px-6">
                      {row.doctoralia === true ? <Check className="w-5 h-5 text-success" /> : 
                       row.doctoralia === false ? <span className="text-genesis-muted">-</span> : 
                       <span className="text-warning text-sm">{row.doctoralia}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* --- PRICING --- */}
      <section id="pricing" className="py-24 bg-genesis-soft">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading 
            title="Preço justo, sem surpresas" 
            subtitle="Comece pequeno e cresça conosco."
          />

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter */}
            <div className="bg-genesis-surface p-8 rounded-2xl border border-genesis-border-subtle shadow-sm hover:shadow-md transition-all">
              <h3 className="text-lg font-semibold text-genesis-dark mb-2">Starter</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-genesis-dark">R$ 199</span>
                <span className="text-genesis-muted">/mês</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm text-genesis-text"><Check className="w-4 h-4 text-genesis-primary"/> 1 Profissional</li>
                <li className="flex items-center gap-3 text-sm text-genesis-text"><Check className="w-4 h-4 text-genesis-primary"/> 100 Pacientes</li>
                <li className="flex items-center gap-3 text-sm text-genesis-text"><Check className="w-4 h-4 text-genesis-primary"/> Prontuário Básico</li>
                <li className="flex items-center gap-3 text-sm text-genesis-text"><Check className="w-4 h-4 text-genesis-primary"/> Agenda Simples</li>
              </ul>
              <button onClick={handleApply} className="w-full py-3 bg-genesis-soft text-genesis-dark font-semibold rounded-lg hover:bg-genesis-hover transition-colors">
                Começar Grátis
              </button>
            </div>

            {/* Professional */}
            <div className="bg-genesis-dark p-8 rounded-2xl shadow-xl transform scale-105 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide" style={{ backgroundImage: 'linear-gradient(to right, #0f766e, #7c3aed)' }}>
                Mais Popular
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Professional</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-white">R$ 399</span>
                <span className="text-genesis-subtle">/mês</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm text-genesis-border"><Check className="w-4 h-4 text-genesis-primary-light"/> 3 Profissionais</li>
                <li className="flex items-center gap-3 text-sm text-genesis-border"><Check className="w-4 h-4 text-genesis-primary-light"/> Pacientes Ilimitados</li>
                <li className="flex items-center gap-3 text-sm text-genesis-border"><Check className="w-4 h-4 text-genesis-primary-light"/> <strong>AI Scribe & Diagnóstico</strong></li>
                <li className="flex items-center gap-3 text-sm text-genesis-border"><Check className="w-4 h-4 text-genesis-primary-light"/> Telemedicina Integrada</li>
                <li className="flex items-center gap-3 text-sm text-genesis-border"><Check className="w-4 h-4 text-genesis-primary-light"/> Faturamento TISS</li>
              </ul>
              <button onClick={handleApply} className="w-full py-3 bg-genesis-primary text-white font-semibold rounded-lg hover:bg-genesis-primary-light transition-colors shadow-lg shadow-genesis-primary/25">
                Escolher Professional
              </button>
            </div>

            {/* Clinic */}
            <div className="bg-genesis-surface p-8 rounded-2xl border border-genesis-border-subtle shadow-sm hover:shadow-md transition-all">
              <h3 className="text-lg font-semibold text-genesis-dark mb-2">Clinic</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-genesis-dark">R$ 799</span>
                <span className="text-genesis-muted">/mês</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm text-genesis-text"><Check className="w-4 h-4 text-genesis-primary"/> 10 Profissionais</li>
                <li className="flex items-center gap-3 text-sm text-genesis-text"><Check className="w-4 h-4 text-genesis-primary"/> Multi-unidade</li>
                <li className="flex items-center gap-3 text-sm text-genesis-text"><Check className="w-4 h-4 text-genesis-primary"/> Gestão Financeira Avançada</li>
                <li className="flex items-center gap-3 text-sm text-genesis-text"><Check className="w-4 h-4 text-genesis-primary"/> Suporte Prioritário</li>
              </ul>
              <button onClick={handleApply} className="w-full py-3 bg-genesis-soft text-genesis-dark font-semibold rounded-lg hover:bg-genesis-hover transition-colors">
                Falar com Vendas
              </button>
            </div>
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
              <a href="#" className="hover:text-genesis-primary">Privacidade</a>
              <a href="#" className="hover:text-genesis-primary">Termos</a>
              <a href="#" className="hover:text-genesis-primary">Contato</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

