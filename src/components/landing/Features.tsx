import React from 'react';
import { Cpu, ShieldCheck, Zap, BarChart3 } from 'lucide-react';

export function Features() {
  return (
    <section id="manifesto" className="py-32 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
           
           <div className="order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-gray-50 p-8 rounded-[32px] hover:bg-gray-100 transition-colors group">
                    <Cpu className="w-8 h-8 text-genesis-dark mb-4 group-hover:text-genesis-primary transition-colors" />
                    <h4 className="font-bold text-lg mb-2">IA Scribe</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">Transcrição e SOAP automático. Você conversa, o sistema documenta.</p>
                 </div>
                 <div className="bg-genesis-dark text-white p-8 rounded-[32px] transform translate-y-8 shadow-xl">
                    <ShieldCheck className="w-8 h-8 text-genesis-blue mb-4" />
                    <h4 className="font-bold text-lg mb-2">LGPD Nativo</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">Criptografia ponta-a-ponta. Dados no Brasil. Auditoria completa.</p>
                 </div>
                 <div className="bg-blue-50 p-8 rounded-[32px] transform -translate-y-8 group hover:bg-blue-100 transition-colors">
                    <Zap className="w-8 h-8 text-blue-600 mb-4" />
                    <h4 className="font-bold text-lg mb-2">WhatsApp Integrado</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">Lembretes automáticos. Confirmação de consulta. Zero no-shows.</p>
                 </div>
                 <div className="bg-gray-50 p-8 rounded-[32px] hover:bg-gray-100 transition-colors">
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
  );
}
