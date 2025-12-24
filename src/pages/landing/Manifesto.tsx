/**
 * Manifesto Page
 *
 * Our vision, mission and values.
 * Premium landing subpage with bold messaging.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  Brain,
  Heart,
  Target,
  Zap,
  Shield,
  Users,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export function Manifesto() {
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-genesis-primary/10 rounded-full mb-8">
            <Heart className="w-4 h-4 text-genesis-primary" />
            <span className="text-sm font-bold text-genesis-primary">Nosso Manifesto</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-genesis-dark leading-[1.1] mb-8">
            Médicos merecem{' '}
            <span className="text-genesis-primary">tecnologia de verdade.</span>
          </h1>

          <p className="text-xl text-genesis-medium leading-relaxed max-w-2xl mx-auto">
            Não viemos para participar do mercado de saúde digital.
            Viemos para <strong>dominá-lo</strong> — com engenharia de primeira classe,
            inteligência artificial real e obsessão por qualidade.
          </p>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-20 bg-genesis-dark text-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">O mercado de saúde está quebrado</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl font-black text-red-400 mb-2">40%</div>
              <p className="text-genesis-subtle">do tempo do médico é gasto com burocracia</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black text-amber-400 mb-2">30%</div>
              <p className="text-genesis-subtle">das guias TISS são glosadas por erros simples</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black text-blue-400 mb-2">5+</div>
              <p className="text-genesis-subtle">sistemas diferentes para fazer o trabalho de um</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Vision */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-genesis-dark mb-4">Nossa Visão</h2>
            <p className="text-genesis-muted">O que acreditamos e lutamos todos os dias</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Belief 1 */}
            <div className="p-8 bg-genesis-surface rounded-2xl border border-genesis-border-subtle shadow-md hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-genesis-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-genesis-primary" />
              </div>
              <h3 className="text-xl font-bold text-genesis-dark mb-3">
                IA Real, Não Marketing
              </h3>
              <p className="text-genesis-medium leading-relaxed">
                Nosso diagnóstico assistido usa consenso Multi-LLM (GPT-4 + Gemini + Claude).
                Não é um chatbot disfarçado — é uma segunda opinião clínica em segundos,
                com explicação do raciocínio diagnóstico.
              </p>
            </div>

            {/* Belief 2 */}
            <div className="p-8 bg-genesis-surface rounded-2xl border border-genesis-border-subtle shadow-md hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-genesis-dark mb-3">
                Queremos Ser os Melhores
              </h3>
              <p className="text-genesis-medium leading-relaxed">
                Não buscamos "participação de mercado". Buscamos excelência absoluta.
                Cada linha de código, cada pixel, cada interação é pensada para ser
                a melhor que o mercado já viu.
              </p>
            </div>

            {/* Belief 3 */}
            <div className="p-8 bg-genesis-surface rounded-2xl border border-genesis-border-subtle shadow-md hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-genesis-dark mb-3">
                Para Profissionais Sérios
              </h3>
              <p className="text-genesis-medium leading-relaxed">
                Construímos para médicos, nutricionistas, psicólogos e outros profissionais
                que levam sua prática a sério. Pessoas que querem a melhor ferramenta,
                não a mais barata.
              </p>
            </div>

            {/* Belief 4 */}
            <div className="p-8 bg-genesis-surface rounded-2xl border border-genesis-border-subtle shadow-md hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-genesis-dark mb-3">
                Pacientes Também Ganham
              </h3>
              <p className="text-genesis-medium leading-relaxed">
                Quando o médico tem ferramentas melhores, o paciente recebe cuidado melhor.
                Diagnósticos mais precisos, menos erros, mais tempo para a consulta.
                Todos ganham.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Promise */}
      <section className="py-24 text-white" style={{ background: 'linear-gradient(to bottom right, #0f766e, #115e59)' }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Zap className="w-12 h-12 mx-auto mb-6 opacity-80" />
          <h2 className="text-4xl font-bold mb-6">Nossa Promessa</h2>
          <p className="text-xl leading-relaxed opacity-90 mb-12">
            Vamos eliminar 40% da burocracia do seu dia. Vamos dar a você uma segunda
            opinião clínica instantânea. Vamos fazer você se apaixonar por tecnologia
            na medicina novamente.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/apply')}
              className="px-8 py-4 bg-white text-genesis-primary rounded-xl font-bold text-lg hover:bg-opacity-90 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              Começar Agora <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/tecnologia')}
              className="px-8 py-4 bg-white/10 text-white border border-white/30 rounded-xl font-bold text-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2"
            >
              Ver Tecnologia
            </button>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-genesis-dark text-center mb-16">Nossos Valores</h2>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-genesis-soft rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-genesis-dark" />
              </div>
              <h3 className="font-bold text-genesis-dark mb-2">Integridade</h3>
              <p className="text-sm text-genesis-muted">Fazemos o certo, mesmo quando ninguém está olhando</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-genesis-soft rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-genesis-dark" />
              </div>
              <h3 className="font-bold text-genesis-dark mb-2">Excelência</h3>
              <p className="text-sm text-genesis-muted">Obsessão por qualidade em cada detalhe</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-genesis-soft rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-genesis-dark" />
              </div>
              <h3 className="font-bold text-genesis-dark mb-2">Inovação</h3>
              <p className="text-sm text-genesis-muted">IA real, não buzzwords de marketing</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-genesis-soft rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-genesis-dark" />
              </div>
              <h3 className="font-bold text-genesis-dark mb-2">Empatia</h3>
              <p className="text-sm text-genesis-muted">Cuidamos de quem cuida</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 bg-genesis-dark text-white text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-4">Pronto para a revolução?</h2>
          <p className="text-genesis-subtle mb-8">
            Junte-se aos profissionais que já escolheram a melhor plataforma.
          </p>
          <button
            onClick={() => navigate('/apply')}
            className="px-8 py-4 bg-genesis-primary text-white rounded-xl font-bold hover:bg-genesis-primary/90 transition-all shadow-lg"
          >
            Falar com Concierge
          </button>
        </div>
      </section>
    </div>
  );
}

export default Manifesto;
