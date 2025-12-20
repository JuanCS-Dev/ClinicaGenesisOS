import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dashboard } from './Dashboard';
import {
  Activity,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  BarChart3,
  Cpu
} from 'lucide-react';

// --- MICRO COMPONENTS ---

interface PricingCardProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  isPremium?: boolean;
  onCta: () => void;
}

const PricingCard = ({ title, price, description, features, isPremium, onCta }: PricingCardProps) => (
  <div className={`relative p-10 rounded-[32px] transition-all duration-500 group flex flex-col h-full ${isPremium ? 'bg-[#0F172A] text-white shadow-[0_20px_80px_-20px_rgba(0,0,0,0.5)] ring-1 ring-white/10 scale-105 z-10' : 'bg-white text-genesis-dark border border-gray-100 shadow-xl hover:shadow-2xl hover:-translate-y-1'}`}>
    {isPremium && (
      <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold uppercase tracking-[0.2em] pl-[calc(1.5rem+0.2em)] rounded-full shadow-[0_10px_30px_-5px_rgba(79,70,229,0.6)] border border-white/20 whitespace-nowrap z-20 flex items-center justify-center">
        Escolha da Elite
      </div>
    )}
    
    <div className="mb-8">
        <h3 className={`text-xl font-bold mb-2 tracking-tight ${isPremium ? 'text-white' : 'text-genesis-dark'}`}>{title}</h3>
        <p className={`text-sm leading-relaxed ${isPremium ? 'text-gray-400' : 'text-genesis-medium'}`}>{description}</p>
    </div>
    
    <div className="mb-10 flex items-baseline">
      <span className="text-5xl font-bold tracking-tighter">R$ {price}</span>
      <span className={`text-sm ml-2 font-medium ${isPremium ? 'text-gray-500' : 'text-gray-400'}`}>/mês</span>
    </div>

    <ul className="space-y-5 mb-10 flex-1">
      {features.map((feat: string, i: number) => (
        <li key={i} className="flex items-start gap-3">
          <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${isPremium ? 'bg-blue-500/20 text-blue-400' : 'bg-green-100 text-green-600'}`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <span className={`text-sm font-medium ${isPremium ? 'text-gray-300' : 'text-gray-600'}`}>{feat}</span>
        </li>
      ))}
    </ul>

    <button 
      onClick={onCta}
      className={`w-full py-5 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${isPremium ? 'bg-white text-genesis-dark hover:bg-gray-100 shadow-[0_0_30px_rgba(255,255,255,0.2)]' : 'bg-genesis-soft text-genesis-dark hover:bg-gray-200'}`}
    >
      {isPremium ? 'Solicitar Convite' : 'Entrar na Lista'} <ArrowRight className="w-4 h-4" />
    </button>
    <p className={`text-[10px] text-center mt-4 uppercase tracking-wider font-semibold opacity-60`}>
        {isPremium ? 'Vagas limitadas para onboarding' : 'Setup self-service'}
    </p>
  </div>
);

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleApply = () => {
    // Navigate to the premium application flow
    navigate('/apply');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans selection:bg-genesis-dark selection:text-white text-genesis-dark overflow-x-hidden">
      
      {/* --- PREMIUM NAVBAR --- */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/90 backdrop-blur-xl border-b border-gray-200/50 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-genesis-dark rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-500">
              <Activity className="text-white w-5 h-5" />
            </div>
            <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tighter leading-none">CLÍNICA<span className="text-genesis-blue">GENESIS</span></span>
                <span className="text-[9px] uppercase tracking-[0.2em] text-genesis-medium font-bold">System One</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-10">
            {['Manifesto', 'Tecnologia', 'Membership'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-genesis-dark transition-colors relative group">
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-genesis-dark transition-all duration-300 group-hover:w-full"></span>
                </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="hidden md:block text-xs font-bold uppercase tracking-wider text-genesis-dark hover:text-genesis-blue transition-colors"
            >
              Login
            </button>
            <button 
              onClick={handleApply}
              className="px-6 py-3 bg-genesis-dark text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 group"
            >
              <Lock className="w-3 h-3 group-hover:text-genesis-blue transition-colors" />
              Falar com Concierge
            </button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-40 pb-24 px-6">
        {/* Background - clean gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#F0F4FF] to-[#F8F9FA] -z-10" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm mb-10">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-medium text-gray-600">Sistema operacional para clínicas de alto padrão</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-genesis-dark mb-6 leading-[1.1]">
            Sua consulta.<br/>
            <span style={{background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 50%, #AF52DE 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Documentada em 9 segundos.</span>
          </h1>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Enquanto você conversa com seu paciente, a IA transcreve e estrutura o prontuário. Você só revisa e assina.
          </p>

          {/* Metrics */}
          <div className="flex items-center justify-center gap-12 mb-12">
            <div className="text-center">
              <span className="text-4xl font-bold text-genesis-dark">8.7s</span>
              <p className="text-sm text-gray-400 mt-1">Latência média</p>
            </div>
            <div className="w-px h-14 bg-gray-200"></div>
            <div className="text-center">
              <span className="text-4xl font-bold text-genesis-dark">-30%</span>
              <p className="text-sm text-gray-400 mt-1">No-shows</p>
            </div>
            <div className="w-px h-14 bg-gray-200"></div>
            <div className="text-center">
              <span className="text-4xl font-bold text-genesis-dark">2h</span>
              <p className="text-sm text-gray-400 mt-1">Recuperadas/dia</p>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleApply}
              className="px-8 py-4 bg-genesis-dark text-white rounded-xl text-sm font-semibold hover:bg-black transition-all shadow-lg hover:shadow-xl min-w-[200px]"
            >
              Agendar Demonstração
            </button>
            <button
              onClick={() => navigate('/demo')}
              className="px-8 py-4 bg-white text-genesis-dark border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all min-w-[200px] flex items-center justify-center gap-2"
            >
              Ver o Sistema <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dashboard Preview - Clean */}
        <div id="tecnologia" className="relative max-w-6xl mx-auto mt-20">
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white">
            {/* Browser Header */}
            <div className="h-10 bg-gray-100 border-b border-gray-200 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <span className="ml-4 text-xs text-gray-400 font-mono">app.clinicagenesis.com</span>
            </div>

            {/* Dashboard */}
            <div className="h-[600px] overflow-hidden pointer-events-none select-none">
              <div className="transform scale-[0.8] origin-top-left w-[125%]">
                <Dashboard />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- THE EGO SECTION (Pain & Solution) --- */}
      <section id="manifesto" className="py-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
             
             <div className="order-2 lg:order-1">
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-gray-50 p-8 rounded-[32px] hover:bg-gray-100 transition-colors">
                      <Cpu className="w-8 h-8 text-genesis-dark mb-4" />
                      <h4 className="font-bold text-lg mb-2">IA Scribe</h4>
                      <p className="text-sm text-gray-500 leading-relaxed">Transcrição e SOAP automático. Você conversa, o sistema documenta.</p>
                   </div>
                   <div className="bg-genesis-dark text-white p-8 rounded-[32px] transform translate-y-8">
                      <ShieldCheck className="w-8 h-8 text-genesis-blue mb-4" />
                      <h4 className="font-bold text-lg mb-2">LGPD Nativo</h4>
                      <p className="text-sm text-gray-400 leading-relaxed">Criptografia ponta-a-ponta. Dados no Brasil. Auditoria completa.</p>
                   </div>
                   <div className="bg-blue-50 p-8 rounded-[32px] transform -translate-y-8">
                      <Zap className="w-8 h-8 text-blue-600 mb-4" />
                      <h4 className="font-bold text-lg mb-2">WhatsApp Integrado</h4>
                      <p className="text-sm text-gray-500 leading-relaxed">Lembretes automáticos. Confirmação de consulta. Zero no-shows.</p>
                   </div>
                   <div className="bg-gray-50 p-8 rounded-[32px]">
                      <BarChart3 className="w-8 h-8 text-genesis-dark mb-4" />
                      <h4 className="font-bold text-lg mb-2">Multi-especialidade</h4>
                      <p className="text-sm text-gray-500 leading-relaxed">Medicina, Nutrição, Psicologia. Cada um com seu fluxo específico.</p>
                   </div>
                </div>
             </div>

             <div className="order-1 lg:order-2">
                <span className="text-genesis-blue font-bold tracking-widest uppercase text-xs mb-4 block">O Problema</span>
                <h2 className="text-5xl font-bold text-genesis-dark mb-8 tracking-tighter leading-tight">
                  Você não estudou 12 anos<br/>para preencher formulário.
                </h2>
                <div className="space-y-6 text-lg text-gray-500 font-light leading-relaxed">
                  <p>
                    Médicos perdem <strong className="text-genesis-dark font-semibold">2 horas por dia</strong> em documentação.
                    Isso são 40 horas por mês. 480 horas por ano. Tempo que poderia estar com pacientes ou com sua família.
                  </p>
                  <p>
                    Os sistemas atuais foram feitos para hospitais públicos e operadoras.
                    <strong className="text-genesis-dark font-semibold">Não para você.</strong>
                  </p>
                  <p>
                    O Genesis foi construído por quem entende: sua consulta é sagrada.
                    A tecnologia deve ser invisível. O prontuário deve se escrever sozinho.
                  </p>
                </div>
             </div>

          </div>
        </div>
      </section>

      {/* --- MEMBERSHIP PRICING --- */}
      <section id="membership" className="py-32 bg-[#F8F9FA] relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-genesis-dark mb-6 tracking-tighter">Investimento</h2>
            <p className="text-gray-500 text-lg">
              O custo de não ter o Genesis é maior: horas perdidas, pacientes que não voltam, burnout.
              <br/>Escolha o plano que faz sentido para sua operação.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            
            {/* Card 1: Starter */}
            <PricingCard
              title="Essencial"
              price="497"
              description="Para consultórios individuais que querem o melhor."
              features={[
                "1 Profissional",
                "Prontuário completo (SOAP, prescrição)",
                "Agenda com confirmação automática",
                "WhatsApp: lembretes de consulta",
                "Suporte em horário comercial"
              ]}
              isPremium={false}
              onCta={handleApply}
            />

            {/* Card 2: Clinic (HERO) */}
            <PricingCard
              title="Clínica"
              price="1.497"
              description="Para clínicas que não toleram ineficiência."
              features={[
                "Até 5 Profissionais",
                "Tudo do Essencial +",
                "IA Scribe (transcrição automática)",
                "Multi-especialidade (Medicina, Nutri, Psico)",
                "Relatórios financeiros",
                "Suporte prioritário < 4h"
              ]}
              isPremium={true}
              onCta={handleApply}
            />

            {/* Card 3: Enterprise */}
            <PricingCard
              title="Rede"
              price="4.997"
              description="Para redes, hospitais e operações complexas."
              features={[
                "Profissionais ilimitados",
                "Tudo do Clínica +",
                "API para integrações",
                "Multi-unidades",
                "Onboarding dedicado",
                "SLA garantido em contrato"
              ]}
              isPremium={false}
              onCta={handleApply}
            />

          </div>

          <div className="mt-20 text-center">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">Garantia de Satisfação Total</p>
            <p className="text-gray-500 text-sm max-w-lg mx-auto">
              Se em 30 dias você sentir que o Genesis não elevou o padrão da sua clínica, 
              devolvemos 100% do seu investimento. Sem perguntas. Apenas respeito.
            </p>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-gray-200 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
           <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-20">
              <div className="max-w-xs">
                 <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-genesis-dark rounded-lg flex items-center justify-center">
                       <Activity className="text-white w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm tracking-tight">CLÍNICA GENESIS</span>
                 </div>
                 <p className="text-sm text-gray-500 leading-relaxed">
                    Nascido da frustração com o medíocre. <br/>Criado para a elite médica global.
                 </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
                 <div>
                    <h5 className="font-bold text-genesis-dark mb-4 text-xs uppercase tracking-widest">Produto</h5>
                    <ul className="space-y-3 text-sm text-gray-500">
                       <li className="hover:text-genesis-blue cursor-pointer">Medicina</li>
                       <li className="hover:text-genesis-blue cursor-pointer">Nutrição</li>
                       <li className="hover:text-genesis-blue cursor-pointer">Odontologia</li>
                       <li className="hover:text-genesis-blue cursor-pointer">Roadmap</li>
                    </ul>
                 </div>
                 <div>
                    <h5 className="font-bold text-genesis-dark mb-4 text-xs uppercase tracking-widest">Empresa</h5>
                    <ul className="space-y-3 text-sm text-gray-500">
                       <li className="hover:text-genesis-blue cursor-pointer">Sobre Nós</li>
                       <li className="hover:text-genesis-blue cursor-pointer">Carreiras</li>
                       <li className="hover:text-genesis-blue cursor-pointer">Blog</li>
                       <li className="hover:text-genesis-blue cursor-pointer">Press Kit</li>
                    </ul>
                 </div>
                 <div>
                    <h5 className="font-bold text-genesis-dark mb-4 text-xs uppercase tracking-widest">Legal</h5>
                    <ul className="space-y-3 text-sm text-gray-500">
                       <li className="hover:text-genesis-blue cursor-pointer">Privacidade</li>
                       <li className="hover:text-genesis-blue cursor-pointer">Termos</li>
                       <li className="hover:text-genesis-blue cursor-pointer">Compliance</li>
                       <li className="hover:text-genesis-blue cursor-pointer">DPA</li>
                    </ul>
                 </div>
              </div>
           </div>

           <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs text-gray-400">© 2025 Vértice Maximus Tecnologia. Todos os direitos reservados.</p>
              <div className="flex gap-4">
                 <div className="w-2 h-2 rounded-full bg-green-500"></div>
                 <span className="text-xs text-gray-500 font-medium">Systems Operational</span>
              </div>
           </div>
        </div>
      </footer>

    </div>
  );
};