import React from 'react';
import { Clock, Sparkles } from 'lucide-react';

interface StepSettingsProps {
  workStart: string;
  setWorkStart: (value: string) => void;
  workEnd: string;
  setWorkEnd: (value: string) => void;
  appointmentDuration: number;
  setAppointmentDuration: (value: number) => void;
  seedData: boolean;
  setSeedData: (value: boolean) => void;
}

export function StepSettings({
  workStart,
  setWorkStart,
  workEnd,
  setWorkEnd,
  appointmentDuration,
  setAppointmentDuration,
  seedData,
  setSeedData,
}: StepSettingsProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-genesis-dark">
          Configurações de funcionamento
        </h2>
        <p className="text-genesis-medium mt-2">
          Defina o horário padrão de atendimento da clínica
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="workStart" className="block text-sm font-semibold text-genesis-dark mb-2">
              Horário de Início
            </label>
            <div className="relative group">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-genesis-medium group-focus-within:text-genesis-blue transition-colors" />
              <input
                id="workStart"
                type="time"
                value={workStart}
                onChange={(e) => setWorkStart(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-genesis-dark focus:outline-none focus:ring-2 focus:ring-genesis-blue/20 focus:border-genesis-blue transition-all cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label htmlFor="workEnd" className="block text-sm font-semibold text-genesis-dark mb-2">
              Horário de Término
            </label>
            <div className="relative group">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-genesis-medium group-focus-within:text-genesis-blue transition-colors" />
              <input
                id="workEnd"
                type="time"
                value={workEnd}
                onChange={(e) => setWorkEnd(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-genesis-dark focus:outline-none focus:ring-2 focus:ring-genesis-blue/20 focus:border-genesis-blue transition-all cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm font-semibold text-genesis-dark mb-2">
            Duração padrão das consultas
          </label>
          <div className="relative">
            <select
              id="duration"
              value={appointmentDuration}
              onChange={(e) => setAppointmentDuration(Number(e.target.value))}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-genesis-dark focus:outline-none focus:ring-2 focus:ring-genesis-blue/20 focus:border-genesis-blue transition-all appearance-none cursor-pointer"
            >
              <option value={15}>15 minutos (Rápida)</option>
              <option value={20}>20 minutos</option>
              <option value={30}>30 minutos (Padrão)</option>
              <option value={45}>45 minutos</option>
              <option value={50}>50 minutos (Sessão Terapêutica)</option>
              <option value={60}>1 hora (Primeira Consulta)</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100">
          <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            seedData 
              ? 'border-amber-200 bg-amber-50' 
              : 'border-gray-100 hover:border-gray-200'
          }`}>
            <div className="pt-1">
              <input
                type="checkbox"
                checked={seedData}
                onChange={(e) => setSeedData(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500/20" />
                <span className="font-bold text-genesis-dark">Modo Demonstração</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Adicionar pacientes e agendamentos fictícios para você explorar o sistema imediatamente. (Recomendado)
              </p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
