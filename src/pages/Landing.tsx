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
  Gem,
  BarChart3,
  Cpu,
  Dna
} from 'lucide-react';

// --- MICRO COMPONENTS ---

const PricingCard = ({ title, price, description, features, isPremium, onCta }: any) => (
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
              onClick={() => navigate('/dashboard')}
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

      {/* --- HERO SECTION: THE COMMAND CENTER --- */}
      <section className="relative pt-48 pb-32 px-6 overflow-hidden perspective-container">
        {/* Background Atmosphere */}
        <div className="absolute top-0 left-0 right-0 h-[80vh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/40 via-[#F8F9FA] to-[#F8F9FA] -z-10" />
        <div className="absolute top-20 right-0 w-[800px] h-[800px] bg-gradient-to-b from-purple-100/30 to-transparent rounded-full blur-[120px] -z-10 pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10 mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm mb-8 animate-enter hover:shadow-md transition-shadow cursor-default">
            <Dna className="w-3 h-3 text-genesis-dark" />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600">Arquitetura Híbrida & Autônoma</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-genesis-dark mb-8 leading-[0.95] animate-enter" style={{animationDelay: '0.1s'}}>
            Não é software. <br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-genesis-blue via-indigo-600 to-purple-600">É extensão da sua consciência.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto mb-12 leading-relaxed font-light animate-enter" style={{animationDelay: '0.2s'}}>
            Esqueça "gestão". Falamos de personalização em nível celular. 
            <br/>Se você quiser um <strong className="text-genesis-dark font-semibold">Daemon autônomo</strong> rodando sua triagem enquanto dorme, nós criamos.
            <br/><span className="text-sm uppercase tracking-widest opacity-70 mt-4 block">O resto é apenas... ferramenta.</span>
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 animate-enter" style={{animationDelay: '0.3s'}}>
            <button 
              onClick={handleApply}
              className="px-10 py-5 bg-genesis-dark text-white rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-black transition-all shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] hover:-translate-y-1 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4)] min-w-[240px]"
            >
              Aplicar para Acesso
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-10 py-5 bg-white text-genesis-dark border border-gray-200 rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-gray-50 transition-all min-w-[240px] flex items-center justify-center gap-2 group"
            >
              Explorar Demo <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* --- 3D DASHBOARD PREVIEW --- */}
        {/* Using CSS perspective to create a "Command Center" tilted look */}
        <div id="tecnologia" className="relative max-w-[1300px] mx-auto animate-enter perspective-[2000px] group" style={{animationDelay: '0.5s'}}>
           {/* Glow Effect behind dashboard */}
           <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 blur-[100px] -z-10 rounded-[60px]" />
           
           <div className="transform rotate-x-[12deg] group-hover:rotate-x-[5deg] transition-transform duration-[1.5s] ease-out shadow-[0_50px_100px_-20px_rgba(50,50,93,0.25)] rounded-t-[24px] overflow-hidden bg-white border-[8px] border-white ring-1 ring-gray-900/5">
              
              {/* Fake OS Header */}
              <div className="h-10 bg-gray-50/90 backdrop-blur border-b border-gray-200 flex items-center px-4 justify-between select-none">
                 <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                 </div>
                 <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400">
                    <Cpu className="w-3 h-3" />
                    genesis_daemon_v9.0_active
                 </div>
                 <div className="w-10"></div>
              </div>

              {/* The Live Dashboard Component */}
              <div className="bg-[#F5F5F7] h-[800px] pointer-events-none select-none relative overflow-hidden">
                 {/* Overlay to prevent interaction and add sheen */}
                 <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/10 z-50"></div>
                 
                 {/* We mock the layout around the dashboard to ensure it looks full screen */}
                 <div className="flex h-full">
                    {/* Sidebar Mock */}
                     <div className="w-64 bg-[#F9FAFB] border-r border-gray-200/60 flex flex-col p-4 z-10 hidden md:flex shrink-0">
                         <div className="h-20 flex items-center px-2 mb-8 opacity-50 grayscale">
                            <div className="w-9 h-9 bg-gray-800 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                               <Activity className="text-white w-5 h-5" />
                            </div>
                         </div>
                         <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map(i => (
                               <div key={i} className="h-8 bg-gray-200/50 rounded-lg w-full animate-pulse"></div>
                            ))}
                         </div>
                     </div>
                     
                     {/* Dashboard Content */}
                     <div className="flex-1 overflow-hidden transform scale-[0.85] origin-top -mt-4">
                        <Dashboard />
                     </div>
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
                      <Gem className="w-8 h-8 text-genesis-dark mb-4" />
                      <h4 className="font-bold text-lg mb-2">Exclusividade</h4>
                      <p className="text-sm text-gray-500 leading-relaxed">Arquitetura modular que se adapta ao seu DNA, não o contrário.</p>
                   </div>
                   <div className="bg-genesis-dark text-white p-8 rounded-[32px] transform translate-y-8">
                      <ShieldCheck className="w-8 h-8 text-genesis-blue mb-4" />
                      <h4 className="font-bold text-lg mb-2">Blindagem</h4>
                      <p className="text-sm text-gray-400 leading-relaxed">Conformidade total (LGPD/HIPAA) sem burocracia visível.</p>
                   </div>
                   <div className="bg-blue-50 p-8 rounded-[32px] transform -translate-y-8">
                      <Zap className="w-8 h-8 text-blue-600 mb-4" />
                      <h4 className="font-bold text-lg mb-2">Velocidade</h4>
                      <p className="text-sm text-gray-500 leading-relaxed">Fluxos desenhados para zerar cliques desnecessários.</p>
                   </div>
                   <div className="bg-gray-50 p-8 rounded-[32px]">
                      <BarChart3 className="w-8 h-8 text-genesis-dark mb-4" />
                      <h4 className="font-bold text-lg mb-2">Clareza</h4>
                      <p className="text-sm text-gray-500 leading-relaxed">Dados financeiros e clínicos cristalinos em tempo real.</p>
                   </div>
                </div>
             </div>

             <div className="order-1 lg:order-2">
                <span className="text-genesis-blue font-bold tracking-widest uppercase text-xs mb-4 block">Manifesto Genesis</span>
                <h2 className="text-5xl font-bold text-genesis-dark mb-8 tracking-tighter leading-tight">
                  A maioria dos softwares<br/>trata você como funcionário.
                </h2>
                <div className="space-y-6 text-lg text-gray-500 font-light leading-relaxed">
                  <p>
                    O mercado está cheio de ferramentas genéricas que cobram pouco e entregam ruído. 
                    Telas poluídas. Botões inúteis. Lentidão.
                  </p>
                  <p>
                    <strong className="text-genesis-dark font-semibold">Isso é um insulto à sua carreira.</strong>
                  </p>
                  <p>
                    O Genesis foi forjado com uma única obsessão: eliminar o atrito entre sua mente clínica e a execução. 
                    Se não é essencial, não existe. Se é essencial, é instantâneo.
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
            <h2 className="text-4xl md:text-5xl font-bold text-genesis-dark mb-6 tracking-tighter">Membership</h2>
            <p className="text-gray-500 text-lg">
              Não vendemos licenças. Iniciamos parcerias.
              <br/>Escolha o nível de compromisso com a excelência da sua clínica.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            
            {/* Card 1: Starter */}
            <PricingCard 
              title="Solo Practice"
              price="127"
              description="Para o profissional que exige perfeição em carreira solo."
              features={[
                "1 Profissional Titular",
                "Plugin de Especialidade Core",
                "Prontuário Inteligente",
                "App do Paciente (White Label)",
                "Suporte via Chat"
              ]}
              isPremium={false}
              onCta={handleApply}
            />

            {/* Card 2: Clinic (HERO) */}
            <PricingCard 
              title="Genesis Black"
              price="297"
              description="A infraestrutura definitiva para clínicas de alto desempenho."
              features={[
                "Até 5 Profissionais Titulares",
                "Acesso Total aos Plugins (All-in)",
                "Gestão Financeira & Conciliação",
                "IA Scribe (Transcrição de Consulta)",
                "Concierge de Onboarding Dedicado",
                "SLA de Suporte < 2h"
              ]}
              isPremium={true}
              onCta={handleApply}
            />

            {/* Card 3: Enterprise */}
            <PricingCard 
              title="Enterprise"
              price="Consultar"
              description="Arquitetura personalizada para redes e hospitais boutique."
              features={[
                "Profissionais Ilimitados",
                "API Gateway & Webhooks",
                "Integração PACS Nativa",
                "Servidor Dedicado (Opcional)",
                "Contrato de Confidencialidade (NDA)",
                "Treinamento In-Company"
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

      <style>{`
        .perspective-container {
          perspective: 2000px;
        }
        .rotate-x-12 {
          transform: rotateX(12deg);
        }
      `}</style>
    </div>
  );
};