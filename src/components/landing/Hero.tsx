import React from 'react';
import { ArrowRight, Play, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-20 left-20 w-[500px] h-[500px] bg-genesis-primary/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-0 right-20 w-[400px] h-[400px] bg-genesis-accent/10 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left space-y-8 max-w-2xl mx-auto lg:mx-0">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-genesis-surface/50 border border-genesis-border backdrop-blur-sm shadow-sm animate-fade-in-up">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-sm font-medium text-genesis-dark/80">Novo: Módulo WhatsApp AI 2.0</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-genesis-dark leading-[1.1] animate-fade-in-up delay-100">
              A Inteligência que sua <span className="text-genesis-primary">Clínica Merece.</span>
            </h1>

            <p className="text-xl text-genesis-medium leading-relaxed animate-fade-in-up delay-200">
              GenesisOS unifica agenda, prontuário e financeiro com o poder da IA. 
              Elimine 14h de tarefas manuais por semana e foque no paciente.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-fade-in-up delay-300">
              <Link 
                to="/register" 
                className="w-full sm:w-auto px-8 py-4 bg-genesis-dark text-white rounded-xl font-semibold hover:bg-genesis-dark/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-genesis-dark/20 hover:-translate-y-1"
              >
                Começar Agora
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <Link 
                to="/demo" 
                className="w-full sm:w-auto px-8 py-4 bg-genesis-surface border border-genesis-border text-genesis-dark rounded-xl font-semibold hover:bg-genesis-bg transition-all flex items-center justify-center gap-2 hover:-translate-y-1"
              >
                <Play className="w-5 h-5 fill-current" />
                Ver Demo
              </Link>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-6 pt-4 text-sm text-genesis-medium/80 animate-fade-in-up delay-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Sem cartão necessário</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Setup em 2 minutos</span>
              </div>
            </div>
          </div>

          {/* Hero Image / Dashboard Mockup */}
          <div className="flex-1 w-full relative perspective-1000 animate-fade-in-right delay-500">
            {/* Floating Cards Effect */}
            <div className="relative transform rotate-y-[-5deg] rotate-x-[5deg] hover:rotate-0 transition-transform duration-700 ease-out preserve-3d">
              <div className="rounded-2xl border border-white/20 bg-genesis-surface/40 backdrop-blur-xl shadow-2xl overflow-hidden aspect-[4/3] relative z-10">
                {/* Mockup Content Placeholders */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40"></div>
                <div className="absolute top-4 left-4 right-4 h-8 bg-genesis-surface/50 rounded-full w-1/3"></div>
                <div className="absolute top-16 left-4 right-4 bottom-4 flex gap-4">
                   <div className="w-1/4 bg-genesis-surface/50 rounded-xl h-full"></div>
                   <div className="flex-1 bg-genesis-surface/60 rounded-xl h-full border border-white/50 shadow-inner p-4 grid grid-cols-2 gap-4">
                      <div className="col-span-2 h-32 bg-genesis-primary/5 rounded-lg border border-genesis-primary/10"></div>
                      <div className="h-32 bg-genesis-accent/5 rounded-lg border border-genesis-accent/10"></div>
                      <div className="h-32 bg-blue-500/5 rounded-lg border border-blue-500/10"></div>
                   </div>
                </div>
              </div>

              {/* Decor Elements */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-genesis-primary to-emerald-300 rounded-2xl shadow-xl flex items-center justify-center transform rotate-12 z-20 animate-float">
                <span className="text-4xl">🚀</span>
              </div>
              
              <div className="absolute -bottom-5 -left-5 bg-genesis-surface/90 backdrop-blur p-4 rounded-xl shadow-lg border border-white/50 z-20 animate-float-delayed">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                    +24%
                  </div>
                  <div>
                    <div className="text-xs text-genesis-muted font-medium uppercase">Faturamento</div>
                    <div className="text-lg font-bold text-genesis-dark">R$ 42.500</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
