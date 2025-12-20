import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Download, Share2, Info } from 'lucide-react';

const DEMOGRAPHICS = [
  { name: 'Feminino', value: 65, color: '#34C759' }, // Nutri Green
  { name: 'Masculino', value: 35, color: '#007AFF' }, // Genesis Blue
];

const PROCEDURES_DATA = [
  { name: 'Nutrição', value: 120 },
  { name: 'Fisioterapia', value: 80 },
  { name: 'Odonto', value: 45 },
  { name: 'Estética', value: 30 },
];

const AGES_DATA = [
  { name: '18-25', value: 15 },
  { name: '26-35', value: 45 },
  { name: '36-45', value: 25 },
  { name: '46+', value: 15 },
];

interface InsightCardProps {
  title: string;
  value: string;
  footer?: string;
}

const InsightCard = ({ title, value, footer }: InsightCardProps) => (
  <div className="bg-white p-6 rounded-2xl border border-white shadow-soft flex flex-col justify-between">
    <div className="flex justify-between items-start">
      <h4 className="text-sm font-medium text-genesis-medium">{title}</h4>
      <Info className="w-4 h-4 text-gray-300 hover:text-genesis-blue cursor-pointer transition-colors" />
    </div>
    <div className="mt-4">
      <h2 className="text-3xl font-bold text-genesis-dark tracking-tight">{value}</h2>
      {footer && <p className="text-xs text-genesis-medium mt-1">{footer}</p>}
    </div>
  </div>
);

export const Reports: React.FC = () => {
  return (
    <div className="space-y-8 animate-enter pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-genesis-dark tracking-tight">Relatórios Clínicos</h1>
          <p className="text-genesis-medium text-sm">Análise demográfica e desempenho de procedimentos.</p>
        </div>
        <div className="flex gap-3">
          <button className="p-2.5 bg-white border border-gray-200 rounded-xl text-genesis-dark hover:bg-gray-50 transition-colors shadow-sm">
             <Share2 className="w-4 h-4" />
           </button>
           <button className="flex items-center gap-2 px-4 py-2.5 bg-genesis-dark text-white rounded-xl text-sm font-medium hover:bg-black transition-colors shadow-lg shadow-gray-200">
             <Download className="w-4 h-4" /> Exportar PDF
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <InsightCard title="Total de Pacientes" value="1,248" footer="Base ativa" />
        <InsightCard title="Ticket Médio" value="R$ 380" footer="Por consulta" />
        <InsightCard title="LTV (Lifetime Value)" value="R$ 2.450" footer="Média anual" />
        <InsightCard title="NPS (Satisfação)" value="92" footer="Zona de Excelência" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Procedures Chart */}
        <div className="bg-white p-8 rounded-3xl border border-white shadow-soft h-[400px] flex flex-col">
          <h3 className="text-lg font-bold text-genesis-dark mb-6">Procedimentos Populares</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={PROCEDURES_DATA} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#111827', fontSize: 13, fontWeight: 500}} width={100} />
              <Tooltip 
                cursor={{fill: '#F5F5F7'}}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="value" fill="#007AFF" radius={[0, 4, 4, 0]} barSize={32} animationDuration={1000} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Demographics & Age Grid */}
        <div className="grid grid-rows-2 gap-8">
           <div className="bg-white p-6 rounded-3xl border border-white shadow-soft flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-genesis-dark mb-2">Gênero</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#34C759]" />
                    <span className="text-sm text-genesis-medium">Feminino (65%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full bg-[#007AFF]" />
                     <span className="text-sm text-genesis-medium">Masculino (35%)</span>
                  </div>
                </div>
              </div>
              <div className="w-40 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={DEMOGRAPHICS} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                      {DEMOGRAPHICS.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
           </div>

           <div className="bg-white p-6 rounded-3xl border border-white shadow-soft flex flex-col">
              <h3 className="text-lg font-bold text-genesis-dark mb-4">Faixa Etária Predominante</h3>
              <div className="flex items-end justify-between h-full gap-4 px-4">
                 {AGES_DATA.map((d, i) => (
                   <div key={i} className="flex flex-col items-center gap-2 w-full group">
                      <div className="w-full bg-genesis-soft rounded-t-xl relative overflow-hidden h-24 flex items-end">
                         <div 
                          className="w-full bg-genesis-dark/80 group-hover:bg-genesis-blue transition-colors duration-500 rounded-t-xl" 
                          style={{ height: `${d.value * 2}%` }}
                         />
                      </div>
                      <span className="text-xs font-semibold text-genesis-medium">{d.name}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};