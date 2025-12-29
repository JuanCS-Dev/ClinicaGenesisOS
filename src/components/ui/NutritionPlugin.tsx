/**
 * NutritionPlugin Component
 *
 * Displays anthropometry data and nutrition plans.
 * Receives data via props from parent component.
 */

import React, { useState } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { Scale, Ruler, Activity, Utensils, Download, Flame } from 'lucide-react'
import type { AnthropometryData } from '@/types'

interface NutritionPluginProps {
  /** Anthropometry data points for the chart */
  anthropometryData?: AnthropometryData[]
}

/**
 * Default empty data when no real data is available.
 */
const EMPTY_ANTHRO_DATA: AnthropometryData[] = []

export const NutritionPlugin: React.FC<NutritionPluginProps> = ({
  anthropometryData = EMPTY_ANTHRO_DATA,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'anthro' | 'plan'>('anthro')

  // Use provided data or show empty state
  const data = anthropometryData.length > 0 ? anthropometryData : null
  const latest = data ? data[data.length - 1] : null

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Plugin Header/Nav */}
      <div className="flex items-center justify-between">
        <div className="flex p-1 bg-genesis-hover rounded-xl w-fit">
          <button
            onClick={() => setActiveSubTab('anthro')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${activeSubTab === 'anthro' ? 'bg-genesis-surface text-genesis-dark shadow-sm' : 'text-genesis-medium hover:text-genesis-dark'}`}
          >
            <Activity className="w-3.5 h-3.5" />
            Dados Corporais
          </button>
          <button
            onClick={() => setActiveSubTab('plan')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${activeSubTab === 'plan' ? 'bg-genesis-surface text-genesis-dark shadow-sm' : 'text-genesis-medium hover:text-genesis-dark'}`}
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
        <>
          {!latest ? (
            /* Empty State */
            <div className="bg-genesis-surface p-12 rounded-3xl border border-genesis-border-subtle text-center">
              <Scale className="w-12 h-12 text-genesis-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-genesis-dark mb-2">
                Nenhum dado antropométrico
              </h3>
              <p className="text-genesis-muted text-sm max-w-md mx-auto">
                Os dados de antropometria aparecerão aqui após serem registrados durante as
                consultas.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Stats - Apple Health Cards */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-genesis-surface p-6 rounded-3xl border border-genesis-border-subtle shadow-md group hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 text-white rounded-full shadow-lg shadow-orange-200"
                        style={{ background: 'linear-gradient(to bottom right, #fb923c, #f97316)' }}
                      >
                        <Scale className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-genesis-dark">Peso</h4>
                    </div>
                    <span className="text-[10px] font-medium text-genesis-medium uppercase tracking-wider">
                      {latest.date}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <p className="text-3xl font-bold text-genesis-dark tracking-tight">
                      {latest.weight}
                    </p>
                    <span className="text-sm font-medium text-genesis-medium">kg</span>
                  </div>
                  {data && data.length > 1 && (
                    <div className="mt-4 pt-4 border-t border-genesis-border-subtle flex justify-between items-center">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-md border ${
                          latest.weight < data[data.length - 2].weight
                            ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
                            : 'text-red-600 bg-red-50 border-red-100'
                        }`}
                      >
                        {(latest.weight - data[data.length - 2].weight).toFixed(1)}kg
                      </span>
                      <span className="text-[10px] text-genesis-medium">vs. anterior</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-genesis-surface p-5 rounded-3xl border border-genesis-border-subtle shadow-md hover:shadow-lg transition-all">
                    <div
                      className="p-2 w-fit text-white rounded-full shadow-lg shadow-blue-200 mb-3"
                      style={{ background: 'linear-gradient(to bottom right, #60a5fa, #3b82f6)' }}
                    >
                      <Activity className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-[10px] font-bold text-genesis-medium uppercase mb-1">IMC</p>
                    <p className="text-xl font-bold text-genesis-dark">{latest.imc}</p>
                  </div>
                  <div className="bg-genesis-surface p-5 rounded-3xl border border-genesis-border-subtle shadow-md hover:shadow-lg transition-all">
                    <div
                      className="p-2 w-fit text-white rounded-full shadow-lg shadow-purple-200 mb-3"
                      style={{ background: 'linear-gradient(to bottom right, #c084fc, #a855f7)' }}
                    >
                      <Ruler className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-[10px] font-bold text-genesis-medium uppercase mb-1">
                      Cintura
                    </p>
                    <p className="text-xl font-bold text-genesis-dark">
                      {latest.waist} <span className="text-xs text-genesis-subtle">cm</span>
                    </p>
                  </div>
                </div>

                <div
                  className="p-6 rounded-3xl text-white shadow-glow"
                  style={{ background: 'linear-gradient(to bottom right, #34C759, #28A745)' }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-bold">Metas do Mês</h4>
                    <div className="w-8 h-8 rounded-full bg-genesis-surface/20 flex items-center justify-center backdrop-blur-sm">
                      <Flame className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1 opacity-90">
                        <span>Gordura Corporal</span>
                        <span>{latest.bodyFat}% / 25%</span>
                      </div>
                      <div className="h-1.5 bg-black/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-genesis-surface rounded-full"
                          style={{
                            width: `${Math.min(100, (25 / (latest.bodyFat || 30)) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1 opacity-90">
                        <span>Hidratação</span>
                        <span>2.1L / 3.0L</span>
                      </div>
                      <div className="h-1.5 bg-black/10 rounded-full overflow-hidden">
                        <div className="h-full bg-genesis-surface w-[60%] rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart - Clean & Minimal */}
              <div className="lg:col-span-2 bg-genesis-surface p-8 rounded-3xl border border-genesis-border-subtle shadow-md flex flex-col relative overflow-hidden">
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div>
                    <h3 className="text-lg font-bold text-genesis-dark tracking-tight">
                      Evolução de Peso
                    </h3>
                    <p className="text-xs text-genesis-medium font-medium">
                      {data && data.length > 1
                        ? `Últimos ${data.length} registros`
                        : 'Primeiro registro'}
                    </p>
                  </div>
                  <button className="text-xs font-bold text-genesis-primary bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">
                    Ver Histórico
                  </button>
                </div>

                <div className="flex-1 min-h-[300px] w-[105%] -ml-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data ?? []} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#34C759" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#34C759" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F2F7" />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#86868B', fontSize: 11, fontWeight: 500 }}
                        dy={15}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#86868B', fontSize: 11 }}
                        domain={['dataMin - 2', 'dataMax + 2']}
                        hide
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '12px',
                          border: 'none',
                          boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)',
                          padding: '12px',
                        }}
                        itemStyle={{ color: '#111827', fontWeight: 600, fontSize: '13px' }}
                        cursor={{ stroke: '#34C759', strokeWidth: 2, strokeDasharray: '4 4' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="weight"
                        stroke="#34C759"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorWeight)"
                        name="Peso (kg)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeSubTab === 'plan' && (
        <div className="bg-genesis-surface border border-genesis-border-subtle rounded-2xl shadow-md overflow-hidden group">
          <div className="p-8 border-b border-genesis-border-subtle flex justify-between items-center bg-gradient-to-r from-white to-gray-50 dark:from-genesis-surface dark:to-genesis-soft">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-xl font-bold text-genesis-dark tracking-tight">
                  Plano Alimentar
                </h3>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase rounded-md tracking-wider">
                  Em breve
                </span>
              </div>
              <p className="text-xs font-medium text-genesis-medium">
                Os planos alimentares aparecerão aqui
              </p>
            </div>
            <button
              disabled
              className="flex items-center gap-2 text-genesis-muted bg-genesis-soft border border-genesis-border px-4 py-2 rounded-xl transition-all text-xs font-bold shadow-sm cursor-not-allowed opacity-50"
            >
              <Download className="w-4 h-4" /> Baixar PDF
            </button>
          </div>

          <div className="p-12 text-center">
            <Utensils className="w-12 h-12 text-genesis-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-genesis-dark mb-2">Nenhum plano alimentar</h3>
            <p className="text-genesis-muted text-sm max-w-md mx-auto">
              Os planos alimentares prescritos pelo nutricionista aparecerão aqui após serem
              criados.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
