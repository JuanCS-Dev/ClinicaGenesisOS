import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Lock,
  CheckCircle2,
  Loader2,
  Building2,
} from 'lucide-react';

export const Application: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    clinicName: '',
    professionals: '',
    phone: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate AI Analysis / "Daemon" processing
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6 font-sans text-white relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 p-12 rounded-[32px] text-center relative z-10 animate-enter shadow-2xl">
           <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/50">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
           </div>
           <h2 className="text-3xl font-bold mb-4 tracking-tight">Solicitação Criptografada</h2>
           <p className="text-gray-400 mb-8 leading-relaxed">
             Seus dados foram recebidos pelo Concierge Genesis.
             <br/><br/>
             Nossa IA está analisando o perfil da sua clínica. Se houver compatibilidade com o ecossistema, entraremos em contato via WhatsApp Blindado em até 2 horas.
           </p>
           <button 
             onClick={() => navigate('/')}
             className="text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
           >
             Retornar à Base
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col md:flex-row font-sans text-white overflow-hidden">
      
      {/* Left Panel - Brand & Ego */}
      <div className="hidden md:flex w-1/2 bg-[#020617] relative flex-col justify-between p-12 border-r border-white/5">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px]"></div>

         <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => navigate('/')}>
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                  <Activity className="text-[#0F172A] w-5 h-5" />
                </div>
                <div className="flex flex-col">
                    <span className="text-lg font-bold tracking-tighter leading-none">CLÍNICA<span className="text-blue-500">GENESIS</span></span>
                    <span className="text-[9px] uppercase tracking-[0.2em] text-gray-500 font-bold">Secure Gateway</span>
                </div>
            </div>
         </div>

         <div className="relative z-10 max-w-lg">
            <h1 className="text-5xl font-bold tracking-tighter mb-6 leading-tight">
              Apenas 3% das clínicas são aprovadas.
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              O Genesis não é para todos. É para quem já entendeu que o tempo é o único ativo que não se recupera.
              <br/><br/>
              Preencha com precisão.
            </p>
         </div>

         <div className="relative z-10 flex items-center gap-4 text-xs font-mono text-gray-600">
            <Lock className="w-3 h-3" />
            <span>256-BIT ENCRYPTION ACTIVE</span>
         </div>
      </div>

      {/* Right Panel - The Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 relative">
         <div className="max-w-md w-full">
            <div className="mb-10 md:hidden">
               <div className="flex items-center gap-2 mb-4" onClick={() => navigate('/')}>
                   <Activity className="w-6 h-6 text-white" />
                   <span className="font-bold text-lg">GENESIS</span>
               </div>
               <h2 className="text-2xl font-bold">Solicitar Acesso</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 animate-enter">
               
               <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Nome do Titular</label>
                  <input 
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                    placeholder="Dr. Seu Nome"
                  />
               </div>

               <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Nome da Clínica</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input 
                        required
                        name="clinicName"
                        value={formData.clinicName}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                        placeholder="Nome da sua estrutura"
                    />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Whatsapp</label>
                      <input 
                        required
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                        placeholder="(DDD) 99999..."
                      />
                  </div>
                  <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Equipe</label>
                      <div className="relative">
                        <input 
                            required
                            name="professionals"
                            type="number"
                            value={formData.professionals}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                            placeholder="Qtd. Profissionais"
                        />
                      </div>
                  </div>
               </div>

               <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Email Corporativo</label>
                  <input 
                    required
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                    placeholder="voce@suaclinica.com"
                  />
               </div>

               <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-white text-[#0F172A] rounded-xl py-4 font-bold uppercase tracking-widest hover:bg-gray-200 transition-all transform hover:-translate-y-1 shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Validando Perfil...
                        </>
                    ) : (
                        <>
                            Solicitar Credenciamento <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                  </button>
                  <p className="text-center text-gray-500 text-[10px] mt-4 uppercase tracking-wider">
                      Ao clicar, você concorda com nossa política de confidencialidade estrita.
                  </p>
               </div>

            </form>
         </div>
      </div>
    </div>
  );
};