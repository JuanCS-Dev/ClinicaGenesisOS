import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';

interface PricingCardProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  isPremium?: boolean;
  onCta: () => void;
}

export const PricingCard = ({ title, price, description, features, isPremium, onCta }: PricingCardProps) => (
  <div className={`relative p-10 rounded-[32px] transition-all duration-500 group flex flex-col h-full ${isPremium ? 'bg-[#0F172A] text-white shadow-[0_20px_80px_-20px_rgba(0,0,0,0.5)] ring-1 ring-white/10 scale-105 z-10' : 'bg-genesis-surface text-genesis-dark border border-genesis-border-subtle shadow-xl hover:shadow-2xl hover:-translate-y-1'}`}>
    {isPremium && (
      <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold uppercase tracking-[0.2em] pl-[calc(1.5rem+0.2em)] rounded-full shadow-[0_10px_30px_-5px_rgba(79,70,229,0.6)] border border-white/20 whitespace-nowrap z-20 flex items-center justify-center">
        Escolha da Elite
      </div>
    )}
    
    <div className="mb-8">
        <h3 className={`text-xl font-bold mb-2 tracking-tight ${isPremium ? 'text-white' : 'text-genesis-dark'}`}>{title}</h3>
        <p className={`text-sm leading-relaxed ${isPremium ? 'text-genesis-subtle' : 'text-genesis-medium'}`}>{description}</p>
    </div>
    
    <div className="mb-10 flex items-baseline">
      <span className="text-5xl font-bold tracking-tighter">R$ {price}</span>
      <span className={`text-sm ml-2 font-medium ${isPremium ? 'text-genesis-muted' : 'text-genesis-subtle'}`}>/mês</span>
    </div>

    <ul className="space-y-5 mb-10 flex-1">
      {features.map((feat: string, i: number) => (
        <li key={i} className="flex items-start gap-3">
          <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${isPremium ? 'bg-blue-500/20 text-blue-400' : 'bg-green-100 text-green-600'}`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <span className={`text-sm font-medium ${isPremium ? 'text-genesis-subtle' : 'text-genesis-medium'}`}>{feat}</span>
        </li>
      ))}
    </ul>

    <button 
      onClick={onCta}
      className={`w-full py-5 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${isPremium ? 'bg-genesis-surface text-genesis-dark hover:bg-genesis-hover shadow-[0_0_30px_rgba(255,255,255,0.2)]' : 'bg-genesis-soft text-genesis-dark hover:bg-genesis-border-subtle'}`}
    >
      {isPremium ? 'Solicitar Convite' : 'Entrar na Lista'} <ArrowRight className="w-4 h-4" />
    </button>
    <p className={`text-[10px] text-center mt-4 uppercase tracking-wider font-semibold opacity-60`}>
        {isPremium ? 'Vagas limitadas para onboarding' : 'Setup self-service'}
    </p>
  </div>
);
