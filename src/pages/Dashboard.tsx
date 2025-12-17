/**
 * Dashboard Page
 *
 * Main overview page showing KPIs, upcoming appointments, and tasks.
 */

import React from 'react';
import {
  Users,
  Calendar,
  Wallet,
  TrendingUp,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { Status } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useClinicContext } from '../contexts/ClinicContext';
import { usePatients } from '../hooks/usePatients';
import { useAppointments } from '../hooks/useAppointments';

interface KpiCardProps {
  title: string;
  value: string | number;
  sub: string;
  icon: React.ElementType;
  colorClass: string;
  iconBg: string;
}

function KpiCard({ title, value, sub, icon: Icon, colorClass, iconBg }: KpiCardProps) {
  return (
    <div className="group bg-white p-6 rounded-2xl border border-white shadow-soft hover:shadow-float hover:-translate-y-1 transition-all duration-300 ease-out">
      <div className="flex justify-between items-start mb-5">
        <div
          className={`p-3 rounded-xl ${iconBg} text-opacity-100 transition-transform duration-300 group-hover:scale-110`}
        >
          <Icon className={`w-5 h-5 ${colorClass}`} strokeWidth={2.5} />
        </div>
        <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1 border border-emerald-100">
          <TrendingUp className="w-3 h-3" />
        </span>
      </div>
      <div className="space-y-1">
        <h3 className="text-3xl font-bold text-genesis-dark tracking-tight">{value}</h3>
        <p className="text-[13px] font-medium text-genesis-medium">{title}</p>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="text-[10px] text-genesis-medium">{sub}</span>
        <ArrowRight className="w-3 h-3 text-genesis-blue" />
      </div>
    </div>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const { userProfile } = useClinicContext();
  const { patients, loading: patientsLoading } = usePatients();
  const { appointments, todaysAppointments, loading: appointmentsLoading } = useAppointments();

  const loading = patientsLoading || appointmentsLoading;

  // Calculate KPIs
  const activePatients = patients.length;
  const estimatedRevenue =
    appointments.filter((a) => a.status === Status.FINISHED).length * 350;

  // Get user's display name
  const userName = userProfile?.displayName || 'Profissional';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-genesis-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-enter">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-genesis-dark tracking-tight mb-1">
            Olá, {userName}
          </h1>
          <p className="text-genesis-medium text-sm font-medium">
            Resumo operacional de hoje, {format(new Date(), "d 'de' MMMM", { locale: ptBR })}.
          </p>
        </div>
        <button className="bg-genesis-dark text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-black transition-colors shadow-lg shadow-gray-200">
          Relatório Completo
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Consultas Hoje"
          value={todaysAppointments.length}
          sub="Agenda do dia"
          icon={Calendar}
          colorClass="text-genesis-blue"
          iconBg="bg-blue-50"
        />
        <KpiCard
          title="Pacientes Totais"
          value={activePatients}
          sub="Base ativa"
          icon={Users}
          colorClass="text-specialty-odonto"
          iconBg="bg-cyan-50"
        />
        <KpiCard
          title="Faturamento Est."
          value={`R$ ${estimatedRevenue}`}
          sub="Baseado em finalizados"
          icon={Wallet}
          colorClass="text-specialty-nutri"
          iconBg="bg-green-50"
        />
        <KpiCard
          title="Taxa de Ocupação"
          value="85%"
          sub="Excelente"
          icon={CheckCircle2}
          colorClass="text-specialty-fisio"
          iconBg="bg-purple-50"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Next Appointments */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-white shadow-soft overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-white">
            <h3 className="font-semibold text-genesis-dark text-base">Próximas Consultas</h3>
            <button
              onClick={() => navigate('/agenda')}
              className="text-xs text-genesis-blue font-semibold hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              Ver Agenda
            </button>
          </div>
          <div className="flex-1 overflow-auto max-h-[400px]">
            {appointments.length === 0 ? (
              <div className="p-8 text-center text-genesis-medium text-sm">
                Nenhuma consulta agendada.
              </div>
            ) : (
              appointments
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((app) => (
                  <div
                    key={app.id}
                    className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group cursor-pointer border-b border-gray-50/50 last:border-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center justify-center w-12 h-12 bg-genesis-soft rounded-xl text-genesis-dark border border-gray-100 group-hover:border-genesis-blue/30 group-hover:bg-white transition-all shadow-sm">
                        <span className="text-[10px] font-bold text-genesis-medium uppercase">
                          {format(new Date(app.date), 'MMM', { locale: ptBR })}
                        </span>
                        <span className="text-lg font-bold text-genesis-dark leading-none">
                          {format(new Date(app.date), 'dd')}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-genesis-dark text-sm mb-0.5">
                          {app.patientName}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-genesis-medium">
                          <Clock className="w-3 h-3" />
                          <span className="font-medium">
                            {format(new Date(app.date), 'HH:mm')}
                          </span>
                          <span className="text-gray-300">•</span>
                          <span>{app.procedure}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border
                        ${
                          app.status === Status.CONFIRMED
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : app.status === Status.PENDING
                              ? 'bg-amber-50 text-amber-600 border-amber-100'
                              : app.status === Status.IN_PROGRESS
                                ? 'bg-purple-50 text-purple-600 border-purple-100'
                                : 'bg-gray-50 text-gray-600 border-gray-100'
                        }`}
                      >
                        {app.status}
                      </span>
                      <button className="p-2 text-gray-300 hover:text-genesis-dark hover:bg-white rounded-full transition-all">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Quick Tasks */}
        <div className="bg-white rounded-2xl border border-white shadow-soft p-6 flex flex-col h-full">
          <h3 className="font-semibold text-genesis-dark mb-6 text-base">Tarefas Pendentes</h3>
          <div className="space-y-4 flex-1">
            <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-red-100 transition-all cursor-pointer group">
              <div className="w-2 h-2 mt-1.5 bg-red-500 rounded-full flex-shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
              <div>
                <p className="text-sm font-medium text-genesis-dark group-hover:text-red-600 transition-colors">
                  Finalizar Prontuário
                </p>
                <p className="text-[11px] text-genesis-medium mt-1">João Santos • Ontem às 16:00</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group">
              <div className="w-2 h-2 mt-1.5 bg-gray-400 rounded-full flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-genesis-dark group-hover:text-black transition-colors">
                  Confirmar agenda
                </p>
                <p className="text-[11px] text-genesis-medium mt-1">3 pacientes para amanhã</p>
              </div>
            </div>
          </div>
          <button className="w-full mt-4 py-2.5 border border-dashed border-gray-300 text-genesis-medium rounded-xl text-xs font-semibold hover:bg-gray-50 hover:border-genesis-medium transition-all uppercase tracking-wide">
            + Adicionar Tarefa
          </button>
        </div>
      </div>
    </div>
  );
}
