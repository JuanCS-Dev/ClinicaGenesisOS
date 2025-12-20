import React from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const FINANCE_DATA = [
  { month: 'Jan', receita: 12500, despesa: 4200 },
  { month: 'Fev', receita: 15000, despesa: 4800 },
  { month: 'Mar', receita: 18200, despesa: 5100 },
  { month: 'Abr', receita: 16800, despesa: 4900 },
  { month: 'Mai', receita: 21000, despesa: 5500 },
  { month: 'Jun', receita: 24500, despesa: 6000 },
];

const TRANSACTIONS = [
  { id: 1, desc: 'Consulta Nutricional - Maria Silva', date: 'Hoje, 14:30', amount: 350, type: 'in', method: 'PIX', status: 'paid' },
  { id: 2, desc: 'Aluguel Sala 02', date: 'Ontem', amount: 2500, type: 'out', method: 'Transferência', status: 'paid' },
  { id: 3, desc: 'Consulta Retorno - João Santos', date: 'Ontem', amount: 150, type: 'in', method: 'Cartão Crédito', status: 'pending' },
  { id: 4, desc: 'Compra Material Escritório', date: '12 Dez', amount: 480, type: 'out', method: 'Cartão Débito', status: 'paid' },
  { id: 5, desc: 'Avaliação Física - Ana Costa', date: '10 Dez', amount: 200, type: 'in', method: 'Dinheiro', status: 'paid' },
];

interface FinanceCardProps {
  title: string;
  value: string;
  trend: string;
  trendValue: string;
  type: 'positive' | 'neutral' | 'negative';
}

const FinanceCard = ({ title, value, trend, trendValue, type }: FinanceCardProps) => {
  const isPositive = type === 'positive';
  const isNeutral = type === 'neutral';
  
  return (
    <div className="group bg-white p-6 rounded-2xl border border-white shadow-soft hover:shadow-float transition-all duration-300 relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${isPositive ? 'from-green-500/10' : isNeutral ? 'from-blue-500/10' : 'from-red-500/10'} to-transparent rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`} />
      
      <div className="relative">
        <p className="text-[13px] font-medium text-genesis-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-genesis-dark tracking-tight mb-4">{value}</h3>
        
        <div className="flex items-center gap-2">
          <div className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 ${isPositive ? 'bg-green-50 text-green-600' : isNeutral ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
             {isPositive ? <TrendingUp className="w-3 h-3" /> : isNeutral ? <Wallet className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
             {trendValue}
          </div>
          <span className="text-[11px] text-genesis-medium/80">{trend}</span>
        </div>
      </div>
    </div>
  );
};

export const Finance: React.FC = () => {
  return (
    <div className="space-y-8 animate-enter pb-10">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-genesis-dark tracking-tight">Gestão Financeira</h1>
          <p className="text-genesis-medium text-sm">Fluxo de caixa e demonstrações de Dezembro.</p>
        </div>
        <div className="flex gap-3">
           <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-genesis-dark hover:bg-gray-50 transition-colors shadow-sm">
             <Filter className="w-4 h-4 text-genesis-medium" /> Filtros
           </button>
           <button className="flex items-center gap-2 px-4 py-2.5 bg-genesis-dark text-white rounded-xl text-sm font-medium hover:bg-black transition-colors shadow-lg shadow-gray-200">
             <Download className="w-4 h-4" /> Exportar Relatório
           </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FinanceCard 
          title="Receita Total" 
          value="R$ 24.500" 
          trend="vs. mês anterior" 
          trendValue="+12%" 
          type="positive" 
        />
        <FinanceCard 
          title="Despesas Operacionais" 
          value="R$ 6.000" 
          trend="vs. mês anterior" 
          trendValue="+5%" 
          type="negative" 
        />
        <FinanceCard 
          title="Saldo Líquido" 
          value="R$ 18.500" 
          trend="Margem de 75%" 
          trendValue="Saudável" 
          type="neutral" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[500px]">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-white shadow-soft p-8 flex flex-col">
          <h3 className="text-lg font-bold text-genesis-dark mb-6">Fluxo de Caixa (Semestral)</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={FINANCE_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#007AFF" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#007AFF" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF3B30" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#FF3B30" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F2F7" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#86868B', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#86868B', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)' }}
                  cursor={{ stroke: '#E5E5EA', strokeWidth: 1 }}
                />
                <Area type="monotone" dataKey="receita" stroke="#007AFF" strokeWidth={3} fillOpacity={1} fill="url(#colorReceita)" name="Receita" />
                <Area type="monotone" dataKey="despesa" stroke="#FF3B30" strokeWidth={3} fillOpacity={1} fill="url(#colorDespesa)" name="Despesa" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="bg-white rounded-3xl border border-white shadow-soft p-0 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-10">
            <h3 className="text-lg font-bold text-genesis-dark">Transações</h3>
            <button className="text-xs font-semibold text-genesis-blue hover:underline">Ver todas</button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {TRANSACTIONS.map((t) => (
              <div key={t.id} className="p-4 hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer group flex items-center justify-between mb-1">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'in' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'} transition-transform group-hover:scale-110`}>
                    {t.type === 'in' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-genesis-dark">{t.desc}</p>
                    <p className="text-[11px] text-genesis-medium flex items-center gap-2">
                      {t.date} • {t.method}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${t.type === 'in' ? 'text-genesis-dark' : 'text-genesis-dark'}`}>
                    {t.type === 'in' ? '+' : '-'} R$ {t.amount}
                  </p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${t.status === 'paid' ? 'bg-gray-100 text-gray-500' : 'bg-amber-50 text-amber-600'}`}>
                    {t.status === 'paid' ? 'Pago' : 'Pendente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};