/**
 * Agenda Page
 *
 * Calendar view for managing appointments.
 */

import React from 'react';
import { ChevronLeft, ChevronRight, Filter, Plus, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAppointments } from '../hooks/useAppointments';

export function Agenda() {
  const { todaysAppointments, loading } = useAppointments();
  const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8am to 8pm

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-genesis-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-white/60 backdrop-blur-md rounded-3xl border border-white shadow-soft overflow-hidden animate-enter">
      {/* Calendar Header */}
      <div className="p-4 border-b border-white/50 flex justify-between items-center bg-white/80 backdrop-blur-md z-20 sticky top-0 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex bg-gray-100/80 p-1 rounded-xl shadow-inner">
            <button className="px-5 py-1.5 text-xs font-bold bg-white shadow-sm rounded-[0.6rem] text-genesis-dark transition-all scale-100">
              Dia
            </button>
            <button className="px-5 py-1.5 text-xs font-bold text-genesis-medium hover:text-genesis-dark transition-colors">
              Semana
            </button>
            <button className="px-5 py-1.5 text-xs font-bold text-genesis-medium hover:text-genesis-dark transition-colors">
              Mês
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-1.5 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200 shadow-sm hover:shadow-md">
              <ChevronLeft className="w-5 h-5 text-genesis-medium" />
            </button>
            <h2 className="text-lg font-bold text-genesis-dark w-40 text-center tracking-tight flex items-center justify-center gap-2">
              {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}
            </h2>
            <button className="p-1.5 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200 shadow-sm hover:shadow-md">
              <ChevronRight className="w-5 h-5 text-genesis-medium" />
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-xl text-xs font-bold text-genesis-dark hover:bg-gray-50 transition-colors shadow-sm">
            <Filter className="w-3.5 h-3.5 text-genesis-medium" />
            Filtros
          </button>
          <button className="flex items-center gap-2 px-5 py-2 bg-genesis-dark text-white rounded-xl text-xs font-bold hover:bg-black shadow-lg shadow-gray-300 transition-all hover:-translate-y-0.5">
            <Plus className="w-4 h-4" /> Nova Consulta
          </button>
        </div>
      </div>

      {/* Calendar Body (Simple Day View) */}
      <div className="flex-1 overflow-y-auto relative custom-scrollbar bg-genesis-soft/50">
        {hours.map((hour) => (
          <div key={hour} className="flex min-h-[120px] group relative border-b border-gray-100/50">
            <div className="w-20 p-3 text-[11px] font-bold text-genesis-medium/70 text-center border-r border-gray-100/50 bg-[#F5F5F7]/40 backdrop-blur-sm">
              {hour}:00
            </div>

            <div className="flex-1 relative mx-2">
              {/* Render appointments for this hour */}
              {todaysAppointments
                .filter((app) => new Date(app.date).getHours() === hour)
                .map((app) => (
                  <div
                    key={app.id}
                    className={`
                    absolute top-2 left-2 right-4 bottom-2 rounded-2xl border-l-[4px] p-4 shadow-sm cursor-pointer hover:shadow-float transition-all duration-300 hover:-translate-y-0.5 z-10 group/card
                    ${
                      app.procedure.includes('Nutri') || app.specialty === 'nutricao'
                        ? 'bg-gradient-to-br from-green-50/90 to-white border-green-500 hover:shadow-green-100 ring-1 ring-green-100'
                        : app.specialty === 'psicologia'
                          ? 'bg-gradient-to-br from-purple-50/90 to-white border-purple-500 hover:shadow-purple-100 ring-1 ring-purple-100'
                          : 'bg-gradient-to-br from-blue-50/90 to-white border-blue-500 hover:shadow-blue-100 ring-1 ring-blue-100'
                    }
                  `}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-sm text-genesis-dark tracking-tight">
                        {app.patientName}
                      </span>
                      <span className="text-[10px] font-bold text-genesis-dark/60 bg-white/80 px-2 py-1 rounded-lg backdrop-blur-sm shadow-sm">
                        {app.durationMin} min
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          app.specialty === 'nutricao'
                            ? 'bg-green-500'
                            : app.specialty === 'psicologia'
                              ? 'bg-purple-500'
                              : 'bg-blue-500'
                        }`}
                      />
                      <p className="text-xs font-medium text-genesis-medium group-hover/card:text-genesis-dark transition-colors">
                        {app.procedure}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}

        {/* Current Time Indicator */}
        <div
          className="absolute left-0 right-0 h-px bg-red-500 z-20 pointer-events-none flex items-center shadow-[0_0_4px_rgba(239,68,68,0.4)]"
          style={{
            top: `${(new Date().getHours() - 8) * 120 + (new Date().getMinutes() / 60) * 120}px`,
          }}
        >
          <div className="w-20 bg-red-50/80 text-red-500 text-[10px] font-bold text-right pr-2 backdrop-blur-sm">
            {format(new Date(), 'HH:mm')}
          </div>
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full -ml-1.5 border-2 border-[#F5F5F7]" />
        </div>
      </div>
    </div>
  );
}
