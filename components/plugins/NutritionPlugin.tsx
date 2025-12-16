import React, { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { MOCK_ANTHRO_DATA } from '../../constants';
import { Scale, Ruler, Activity, Utensils, Download, ArrowRight, Flame, Droplets } from 'lucide-react';

export const NutritionPlugin: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'anthro' | 'plan'>('anthro');
  const latest = MOCK_ANTHRO_DATA[MOCK_ANTHRO_DATA.length - 1];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Plugin Header/Nav */}
      <div className="flex items-center justify-between">
        <div className="flex p-1 bg-gray-100 rounded-xl w-fit">
            <button 
            onClick={() => setActiveSubTab('anthro')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${activeSubTab === 'anthro' ? 'bg-white text-genesis-dark shadow-sm' : 'text-genesis-medium hover:text-genesis-dark'}`}
            >
            <Activity className="w-3.5 h-3.5" />
            Dados Corporais
            </button>
            <button 
            onClick={() => setActiveSubTab('plan')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${activeSubTab === 'plan' ? 'bg-white text-genesis-dark shadow-sm' : 'text-genesis-medium hover:text-genesis-dark'}`}
            >
            <Utensils className="w-3.5 h-3.5" />
            Plano Alimentar
            </button>
        </div>
        <div className="text-[10px] font-semibold text-genesis-medium uppercase tracking-widest bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-100">
            Plugin Ativo • v2.4
        </div>
      </div>

      {activeSubTab === 'anthro' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Stats - Apple Health Cards */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-white shadow-soft group hover:shadow-float transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-orange-400 to-orange-500 text-white rounded-full shadow-lg shadow-orange-200">
                      <Scale className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-genesis-dark">Peso</h4>
                </div>
                <span className="text-[10px] font-medium text-genesis-medium uppercase tracking-wider">12 DEZ</span>
              </div>
              <div className="flex items-baseline gap-1">
                 <p className="text-3xl font-bold text-genesis-dark tracking-tight">{latest.weight}</p>
                 <span className="text-sm font-medium text-genesis-medium">kg</span>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">-2.0kg</span>
                <span className="text-[10px] text-genesis-medium">vs. anterior</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-white shadow-soft hover:shadow-float transition-all">
                   <div className="p-2 w-fit bg-gradient-to-br from-blue-400 to-blue-500 text-white rounded-full shadow-lg shadow-blue-200 mb-3">
                      <Activity className="w-3.5 h-3.5" />
                   </div>
                   <p className="text-[10px] font-bold text-genesis-medium uppercase mb-1">IMC</p>
                   <p className="text-xl font-bold text-genesis-dark">{latest.imc}</p>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-white shadow-soft hover:shadow-float transition-all">
                   <div className="p-2 w-fit bg-gradient-to-br from-purple-400 to-purple-500 text-white rounded-full shadow-lg shadow-purple-200 mb-3">
                      <Ruler className="w-3.5 h-3.5" />
                   </div>
                   <p className="text-[10px] font-bold text-genesis-medium uppercase mb-1">Cintura</p>
                   <p className="text-xl font-bold text-genesis-dark">{latest.waist} <span className="text-xs text-gray-400">cm</span></p>
                </div>
            </div>

            <div className="bg-gradient-to-br from-[#34C759] to-[#28A745] p-6 rounded-3xl text-white shadow-glow">
                <div className="flex justify-between items-start mb-4">
                    <h4 className="font-bold">Metas do Mês</h4>
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <Flame className="w-4 h-4 text-white" />
                    </div>
                </div>
                <div className="space-y-3">
                    <div>
                        <div className="flex justify-between text-xs font-medium mb-1 opacity-90">
                            <span>Gordura Corporal</span>
                            <span>28% / 25%</span>
                        </div>
                        <div className="h-1.5 bg-black/10 rounded-full overflow-hidden">
                            <div className="h-full bg-white w-[80%] rounded-full"></div>
                        </div>
                    </div>
                     <div>
                        <div className="flex justify-between text-xs font-medium mb-1 opacity-90">
                            <span>Hidratação</span>
                            <span>2.1L / 3.0L</span>
                        </div>
                        <div className="h-1.5 bg-black/10 rounded-full overflow-hidden">
                            <div className="h-full bg-white w-[60%] rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>
          </div>

          {/* Chart - Clean & Minimal */}
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-white shadow-soft flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-start mb-8 relative z-10">
                <div>
                    <h3 className="text-lg font-bold text-genesis-dark tracking-tight">Evolução de Peso</h3>
                    <p className="text-xs text-genesis-medium font-medium">Últimos 4 meses</p>
                </div>
                <button className="text-xs font-bold text-genesis-blue bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">
                    Ver Histórico
                </button>
            </div>
            
            <div className="flex-1 min-h-[300px] w-[105%] -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_ANTHRO_DATA} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34C759" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#34C759" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F2F7" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#86868B', fontSize: 11, fontWeight: 500}} dy={15} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#86868B', fontSize: 11}} domain={['dataMin - 2', 'dataMax + 2']} hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)', padding: '12px' }}
                    itemStyle={{ color: '#111827', fontWeight: 600, fontSize: '13px' }}
                    cursor={{ stroke: '#34C759', strokeWidth: 2, strokeDasharray: '4 4' }}
                  />
                  <Area type="monotone" dataKey="weight" stroke="#34C759" strokeWidth={4} fillOpacity={1} fill="url(#colorWeight)" name="Peso (kg)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'plan' && (
        <div className="bg-white border border-white rounded-3xl shadow-soft overflow-hidden group">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gradient-to-r from-white to-gray-50">
            <div>
              <div className="flex items-center gap-3 mb-1">
                 <h3 className="text-xl font-bold text-genesis-dark tracking-tight">Reeducação Metabólica</h3>
                 <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-md tracking-wider">Ativo</span>
              </div>
              <p className="text-xs font-medium text-genesis-medium">Vigência: 10 Dez - 10 Jan • Dr. André</p>
            </div>
            <button className="flex items-center gap-2 text-genesis-dark bg-white border border-gray-200 hover:border-genesis-blue hover:text-genesis-blue px-4 py-2 rounded-xl transition-all text-xs font-bold shadow-sm">
              <Download className="w-4 h-4" /> Baixar PDF
            </button>
          </div>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
             <div className="relative pl-6 border-l-2 border-green-500/20">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-green-500"></div>
                <h4 className="font-bold text-genesis-dark mb-4 text-sm flex items-center justify-between">
                  Café da Manhã
                  <span className="text-[10px] text-genesis-medium font-medium bg-gray-100 px-2 py-0.5 rounded">07:30</span>
                </h4>
                <ul className="space-y-4">
                  <li className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl border border-transparent hover:border-green-200 hover:bg-green-50/30 transition-all cursor-pointer group/item">
                    <span className="text-sm font-medium text-genesis-dark">Ovos mexidos</span>
                    <span className="text-xs font-semibold text-genesis-medium group-hover/item:text-green-600">2 un</span>
                  </li>
                  <li className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl border border-transparent hover:border-green-200 hover:bg-green-50/30 transition-all cursor-pointer group/item">
                    <span className="text-sm font-medium text-genesis-dark">Mamão papaya</span>
                    <span className="text-xs font-semibold text-genesis-medium group-hover/item:text-green-600">1/2 un</span>
                  </li>
                   <li className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl border border-transparent hover:border-green-200 hover:bg-green-50/30 transition-all cursor-pointer group/item">
                    <span className="text-sm font-medium text-genesis-dark">Aveia em flocos</span>
                    <span className="text-xs font-semibold text-genesis-medium group-hover/item:text-green-600">1 col.</span>
                  </li>
                </ul>
             </div>

             <div className="relative pl-6 border-l-2 border-orange-500/20">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-orange-500"></div>
                <h4 className="font-bold text-genesis-dark mb-4 text-sm flex items-center justify-between">
                  Almoço
                  <span className="text-[10px] text-genesis-medium font-medium bg-gray-100 px-2 py-0.5 rounded">12:30</span>
                </h4>
                <ul className="space-y-4">
                  <li className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl border border-transparent hover:border-orange-200 hover:bg-orange-50/30 transition-all cursor-pointer group/item">
                    <span className="text-sm font-medium text-genesis-dark">Peito de frango</span>
                    <span className="text-xs font-semibold text-genesis-medium group-hover/item:text-orange-600">120g</span>
                  </li>
                  <li className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl border border-transparent hover:border-orange-200 hover:bg-orange-50/30 transition-all cursor-pointer group/item">
                    <span className="text-sm font-medium text-genesis-dark">Arroz integral</span>
                    <span className="text-xs font-semibold text-genesis-medium group-hover/item:text-orange-600">4 col.</span>
                  </li>
                   <li className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl border border-transparent hover:border-orange-200 hover:bg-orange-50/30 transition-all cursor-pointer group/item">
                    <span className="text-sm font-medium text-genesis-dark">Brócolis</span>
                    <span className="text-xs font-semibold text-genesis-medium group-hover/item:text-orange-600">1 xíc.</span>
                  </li>
                </ul>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};