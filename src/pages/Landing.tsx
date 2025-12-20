import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { Navbar } from '../components/landing/Navbar';
import { Hero } from '../components/landing/Hero';
import { Features } from '../components/landing/Features';
import { PricingCard } from '../components/landing/PricingCard';

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  const handleApply = () => {
    navigate('/apply');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans selection:bg-genesis-dark selection:text-white text-genesis-dark overflow-x-hidden">
      
      <Navbar />
      
      <Hero />

      <Features />

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