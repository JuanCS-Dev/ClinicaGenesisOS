/**
 * Patient Portal Layout
 * =====================
 *
 * Clean, mobile-first layout for the patient portal.
 * Inspired by Epic MyChart and modern healthcare portals.
 *
 * @module components/patient-portal/PatientPortalLayout
 * @version 1.0.0
 */

import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Calendar,
  FileText,
  FlaskConical,
  Pill,
  MessageCircle,
  CreditCard,
  Video,
  LogOut,
  User,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { usePatientAuth } from '../../contexts/PatientAuthContext';

// ============================================================================
// Navigation Items
// ============================================================================

const NAV_ITEMS = [
  { path: '/portal', icon: Home, label: 'Início', exact: true },
  { path: '/portal/consultas', icon: Calendar, label: 'Consultas' },
  { path: '/portal/historico', icon: FileText, label: 'Histórico' },
  { path: '/portal/exames', icon: FlaskConical, label: 'Exames' },
  { path: '/portal/receitas', icon: Pill, label: 'Receitas' },
  { path: '/portal/mensagens', icon: MessageCircle, label: 'Mensagens' },
  { path: '/portal/financeiro', icon: CreditCard, label: 'Financeiro' },
  { path: '/portal/teleconsulta', icon: Video, label: 'Teleconsulta' },
];

// ============================================================================
// Components
// ============================================================================

function MobileNav({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { profile, logout } = usePatientAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/portal/login');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-genesis-dark shadow-xl animate-in slide-in-from-left">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-genesis-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-genesis-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-genesis-primary" />
              </div>
              <div>
                <p className="font-medium text-genesis-dark text-sm">
                  {profile?.name || 'Paciente'}
                </p>
                <p className="text-xs text-genesis-muted">{profile?.email}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-genesis-hover"
            >
              <X className="w-5 h-5 text-genesis-muted" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-genesis-primary text-white'
                      : 'text-genesis-medium hover:bg-genesis-hover'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
                <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
              </NavLink>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-genesis-border">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DesktopSidebar() {
  const { profile, logout } = usePatientAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/portal/login');
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-genesis-surface border-r border-genesis-border">
      {/* Logo */}
      <div className="p-6 border-b border-genesis-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-genesis-primary to-genesis-primary-dark flex items-center justify-center">
            <span className="text-white font-bold text-lg">G</span>
          </div>
          <div>
            <h1 className="font-bold text-genesis-dark">Meu Portal</h1>
            <p className="text-xs text-genesis-muted">Clínica Genesis</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 mx-4 mt-4 rounded-xl bg-genesis-soft">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-genesis-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-genesis-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-genesis-dark text-sm truncate">
              {profile?.name || 'Paciente'}
            </p>
            <p className="text-xs text-genesis-muted truncate">
              {profile?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-genesis-primary text-white shadow-lg shadow-genesis-primary/20'
                  : 'text-genesis-medium hover:bg-genesis-hover hover:text-genesis-dark'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-genesis-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-genesis-muted hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sair
        </button>
      </div>
    </aside>
  );
}

// ============================================================================
// Main Layout
// ============================================================================

export function PatientPortalLayout(): React.ReactElement {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const { profile } = usePatientAuth();

  return (
    <div className="min-h-screen bg-genesis-soft flex">
      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Mobile Nav */}
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-40 bg-white dark:bg-genesis-surface border-b border-genesis-border px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="p-2 -ml-2 rounded-lg hover:bg-genesis-hover"
            >
              <Menu className="w-6 h-6 text-genesis-dark" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-genesis-primary to-genesis-primary-dark flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="font-bold text-genesis-dark">Meu Portal</span>
            </div>

            <div className="w-10 h-10 rounded-full bg-genesis-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-genesis-primary" />
            </div>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white dark:bg-genesis-surface border-b border-genesis-border">
          <div>
            <h2 className="text-xl font-bold text-genesis-dark">
              Olá, {profile?.name?.split(' ')[0] || 'Paciente'}!
            </h2>
            <p className="text-sm text-genesis-muted">
              Bem-vindo ao seu portal de saúde
            </p>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default PatientPortalLayout;
