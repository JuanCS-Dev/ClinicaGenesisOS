/**
 * Patient Portal Dashboard
 * ========================
 *
 * Main landing page for the patient portal.
 * Shows upcoming appointments, quick actions, and health summary.
 *
 * Inspired by Epic MyChart patient dashboard.
 *
 * @module pages/patient-portal/Dashboard
 * @version 1.0.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  FileText,
  FlaskConical,
  Pill,
  MessageCircle,
  Video,
  ChevronRight,
  Bell,
  Heart,
  Activity,
} from 'lucide-react';
import { usePatientAuth } from '../../contexts/PatientAuthContext';

// ============================================================================
// Mock Data (would come from Firestore)
// ============================================================================

const MOCK_NEXT_APPOINTMENT = {
  id: '1',
  date: '2024-12-28',
  time: '14:30',
  professional: 'Dr. João Silva',
  specialty: 'Clínica Geral',
  location: 'Sala 3',
  status: 'confirmed',
};

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    type: 'exam',
    title: 'Resultado de exame disponível',
    description: 'Hemograma Completo',
    date: '2024-12-20',
    read: false,
  },
  {
    id: '2',
    type: 'appointment',
    title: 'Lembrete de consulta',
    description: 'Consulta em 3 dias',
    date: '2024-12-22',
    read: true,
  },
];

const QUICK_ACTIONS = [
  {
    icon: Calendar,
    label: 'Agendar Consulta',
    href: '/portal/consultas',
    color: 'bg-blue-500',
  },
  {
    icon: FlaskConical,
    label: 'Ver Exames',
    href: '/portal/exames',
    color: 'bg-purple-500',
  },
  {
    icon: Pill,
    label: 'Receitas',
    href: '/portal/receitas',
    color: 'bg-green-500',
  },
  {
    icon: MessageCircle,
    label: 'Mensagens',
    href: '/portal/mensagens',
    color: 'bg-amber-500',
  },
];

// ============================================================================
// Components
// ============================================================================

function NextAppointmentCard() {
  const appointment = MOCK_NEXT_APPOINTMENT;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  return (
    <div className="bg-gradient-to-br from-genesis-primary to-genesis-primary-dark rounded-2xl p-6 text-white shadow-lg shadow-genesis-primary/20">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-white/70 text-sm font-medium">Próxima Consulta</p>
          <h3 className="text-xl font-bold mt-1">{formatDate(appointment.date)}</h3>
        </div>
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
          <Calendar className="w-6 h-6" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 text-white/70" />
          <span>{appointment.time}</span>
        </div>
        <div className="flex items-center gap-3">
          <User className="w-4 h-4 text-white/70" />
          <span>
            {appointment.professional} - {appointment.specialty}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <MapPin className="w-4 h-4 text-white/70" />
          <span>{appointment.location}</span>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Link
          to="/portal/consultas"
          className="flex-1 py-2.5 rounded-xl bg-white text-genesis-primary font-medium text-center hover:bg-white/90 transition-colors"
        >
          Ver Detalhes
        </Link>
        <Link
          to="/portal/teleconsulta"
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 text-white font-medium hover:bg-white/30 transition-colors"
        >
          <Video className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

function QuickActionsGrid() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {QUICK_ACTIONS.map((action) => (
        <Link
          key={action.label}
          to={action.href}
          className="bg-white dark:bg-genesis-surface rounded-2xl p-4 border border-genesis-border hover:shadow-lg transition-all group"
        >
          <div
            className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
          >
            <action.icon className="w-6 h-6 text-white" />
          </div>
          <p className="font-medium text-genesis-dark text-sm">{action.label}</p>
        </Link>
      ))}
    </div>
  );
}

function NotificationsCard() {
  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <div className="bg-white dark:bg-genesis-surface rounded-2xl border border-genesis-border overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-genesis-border">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-genesis-primary" />
          <h3 className="font-semibold text-genesis-dark">Notificações</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-danger-soft text-danger text-xs font-medium">
              {unreadCount}
            </span>
          )}
        </div>
        <Link
          to="/portal/mensagens"
          className="text-sm text-genesis-primary hover:underline"
        >
          Ver todas
        </Link>
      </div>

      <div className="divide-y divide-genesis-border">
        {MOCK_NOTIFICATIONS.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 hover:bg-genesis-hover transition-colors ${
              !notification.read ? 'bg-genesis-primary/5' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-2 h-2 rounded-full mt-2 ${
                  !notification.read ? 'bg-genesis-primary' : 'bg-transparent'
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-genesis-dark text-sm">
                  {notification.title}
                </p>
                <p className="text-genesis-muted text-xs mt-0.5">
                  {notification.description}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-genesis-muted flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HealthSummaryCard() {
  return (
    <div className="bg-white dark:bg-genesis-surface rounded-2xl border border-genesis-border p-4">
      <div className="flex items-center gap-2 mb-4">
        <Heart className="w-5 h-5 text-red-500" />
        <h3 className="font-semibold text-genesis-dark">Minha Saúde</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-genesis-soft rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-genesis-primary" />
            <span className="text-xs text-genesis-muted">Última Consulta</span>
          </div>
          <p className="font-semibold text-genesis-dark text-sm">15/12/2024</p>
        </div>
        <div className="bg-genesis-soft rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-genesis-primary" />
            <span className="text-xs text-genesis-muted">Exames Pendentes</span>
          </div>
          <p className="font-semibold text-genesis-dark text-sm">2</p>
        </div>
      </div>

      <Link
        to="/portal/historico"
        className="flex items-center justify-center gap-2 mt-4 py-2.5 rounded-xl border border-genesis-border text-genesis-medium hover:bg-genesis-hover transition-colors text-sm font-medium"
      >
        Ver Histórico Completo
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function PatientDashboard(): React.ReactElement {
  const { profile } = usePatientAuth();
  const firstName = profile?.name?.split(' ')[0] || 'Paciente';

  return (
    <div className="space-y-6 animate-enter pb-8">
      {/* Welcome */}
      <div className="lg:hidden">
        <h1 className="text-xl font-bold text-genesis-dark">Olá, {firstName}!</h1>
        <p className="text-sm text-genesis-muted">
          Bem-vindo ao seu portal de saúde
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Next Appointment */}
          <NextAppointmentCard />

          {/* Quick Actions - Mobile */}
          <div className="lg:hidden">
            <QuickActionsGrid />
          </div>

          {/* Notifications */}
          <NotificationsCard />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions - Desktop */}
          <div className="hidden lg:block">
            <h3 className="font-semibold text-genesis-dark mb-4">Acesso Rápido</h3>
            <QuickActionsGrid />
          </div>

          {/* Health Summary */}
          <HealthSummaryCard />
        </div>
      </div>
    </div>
  );
}

export default PatientDashboard;
