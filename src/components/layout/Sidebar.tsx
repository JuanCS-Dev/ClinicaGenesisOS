import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { useClinicContext } from '../../contexts/ClinicContext';
import { SpecialtyType } from '../../types';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Wallet,
  BarChart3,
  TrendingUp,
  MessageCircle,
  Settings,
  HelpCircle,
  Apple,
  Activity,
  Stethoscope,
  Brain,
  LogOut,
  FileText
} from 'lucide-react';

const NavItem = ({ to, icon: Icon, label }: { to: string, icon: React.ComponentType<{ className?: string }>, label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `
      group flex items-center gap-3 px-3 py-3 rounded-xl text-[13px] font-medium transition-all duration-300 ease-out relative overflow-hidden
      ${isActive
        ? 'bg-genesis-surface text-genesis-dark shadow-md translate-x-1'
        : 'text-genesis-muted hover:text-genesis-dark hover:bg-genesis-surface/60 hover:shadow-sm'
      }
    `}
  >
    {({ isActive }) => (
      <>
        {/* Active Indicator Strip */}
        {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-genesis-primary rounded-r-full" />}

        <div className={`
          p-1.5 rounded-lg transition-all duration-300
          ${isActive
            ? 'bg-genesis-primary/10'
            : 'bg-genesis-soft group-hover:bg-genesis-hover'
          }
        `}>
          <Icon className={`w-4 h-4 transition-colors duration-200 ${isActive ? 'text-genesis-primary' : 'text-genesis-muted group-hover:text-genesis-medium'}`} />
        </div>
        <span className={isActive ? 'font-semibold' : ''}>{label}</span>
        {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-genesis-primary animate-pulse shadow-[0_0_8px_rgba(15,118,110,0.4)]" />}
      </>
    )}
  </NavLink>
);

const SPECIALTY_COLORS: Record<SpecialtyType, { bg: string; text: string; bgLight: string }> = {
  medicina: { bg: '#2563eb', text: 'text-blue-600', bgLight: 'rgba(37, 99, 235, 0.1)' },
  nutricao: { bg: '#16a34a', text: 'text-green-600', bgLight: 'rgba(22, 163, 74, 0.1)' },
  psicologia: { bg: '#db2777', text: 'text-pink-600', bgLight: 'rgba(219, 39, 119, 0.1)' },
};

const PluginButton = ({
  id,
  icon: Icon,
  label,
}: {
  id: SpecialtyType,
  icon: React.ComponentType<{ className?: string }>,
  label: string,
}) => {
  const { userProfile, updateUserProfile } = useClinicContext();
  const isActive = userProfile?.specialty === id;
  const colors = SPECIALTY_COLORS[id];

  const handleSetSpecialty = () => {
    updateUserProfile({ specialty: id }).catch(console.error);
  };

  return (
    <button
      onClick={handleSetSpecialty}
      className={`
        w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[13px] transition-all duration-300 group relative overflow-hidden
        ${isActive
          ? 'bg-genesis-surface shadow-md translate-x-1'
          : 'hover:bg-genesis-surface/60 hover:shadow-sm text-genesis-muted'
        }
      `}
    >
      {/* Active Indicator Strip */}
      {isActive && (
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full"
          style={{ backgroundColor: colors.bg }}
        />
      )}

      <div
        className={`p-1.5 rounded-md transition-all duration-300 ${!isActive ? 'bg-genesis-soft group-hover:bg-genesis-hover' : ''}`}
        style={isActive ? { backgroundColor: colors.bgLight } : undefined}
      >
        <Icon className={`w-4 h-4 ${isActive ? colors.text : 'text-genesis-muted group-hover:text-genesis-medium'}`} />
      </div>

      <span className={`font-medium ${isActive ? 'text-genesis-dark' : 'group-hover:text-genesis-dark'}`}>{label}</span>

      {isActive && (
        <div
          className="ml-auto w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ backgroundColor: colors.bg }}
        />
      )}
    </button>
  );
};

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside className="w-64 h-screen flex flex-col fixed left-0 top-0 z-20 bg-genesis-soft border-r border-genesis-border-subtle shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] transition-colors duration-300" aria-label="Menu principal">
      {/* Logo Area */}
      <Link to="/" className="h-20 flex items-center px-6 mb-2 hover:opacity-80 transition-opacity">
        <div className="w-9 h-9 bg-genesis-primary rounded-xl flex items-center justify-center mr-3 shadow-lg">
          <Activity className="text-white w-5 h-5" strokeWidth={2.5} />
        </div>
        <div>
          <span className="text-sm font-bold text-genesis-dark tracking-tight block leading-tight">CLÍNICA<br/>GENESIS</span>
        </div>
      </Link>

      <div className="flex-1 overflow-y-auto py-2 px-4 space-y-8 custom-scrollbar">
        {/* Main Menu */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-genesis-subtle uppercase tracking-widest mb-2">Principal</p>
          <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/agenda" icon={Calendar} label="Agenda" />
          <NavItem to="/patients" icon={Users} label="Pacientes" />
          <NavItem to="/finance" icon={Wallet} label="Financeiro" />
          <NavItem to="/billing" icon={FileText} label="TISS" />
          <NavItem to="/reports" icon={BarChart3} label="Relatórios" />
          <NavItem to="/analytics" icon={TrendingUp} label="Analytics" />
          <NavItem to="/whatsapp" icon={MessageCircle} label="WhatsApp" />
        </div>

        {/* Plugins Section - Now Functional */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-3 mb-1">
            <p className="text-[10px] font-bold text-genesis-subtle uppercase tracking-widest">Especialidades</p>
            <span className="text-[9px] bg-genesis-hover text-genesis-muted px-1.5 py-0.5 rounded border border-genesis-border">Mods</span>
          </div>
          
          <PluginButton id="medicina" label="Medicina" icon={Stethoscope} />
          <PluginButton id="nutricao" label="Nutrição" icon={Apple} />
          <PluginButton id="psicologia" label="Psicologia" icon={Brain} />
        </div>
      </div>

      {/* Footer - Compact */}
      <div className="p-3 bg-genesis-surface border-t border-genesis-border-subtle transition-colors duration-300">
        {/* Quick Actions Row */}
        <div className="flex items-center gap-1 mb-3">
          <NavLink
            to="/settings"
            className={({ isActive }) => `
              flex-1 flex items-center justify-center gap-2 px-2 py-2 rounded-lg text-[11px] font-medium transition-all duration-200
              ${isActive
                ? 'bg-genesis-surface shadow-sm text-genesis-primary border border-genesis-border-subtle'
                : 'text-genesis-muted hover:text-genesis-dark hover:bg-genesis-hover'
              }
            `}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Config</span>
          </NavLink>

          <NavLink
            to="/help"
            className={({ isActive }) => `
              flex-1 flex items-center justify-center gap-2 px-2 py-2 rounded-lg text-[11px] font-medium transition-all duration-200
              ${isActive
                ? 'bg-genesis-surface shadow-sm text-genesis-primary border border-genesis-border-subtle'
                : 'text-genesis-muted hover:text-genesis-dark hover:bg-genesis-hover'
              }
            `}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Ajuda</span>
          </NavLink>

          <button
            onClick={handleLogout}
            title="Sair"
            className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3 px-1">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="w-8 h-8 rounded-full border border-genesis-border"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-genesis-primary/10 border border-genesis-primary/20 flex items-center justify-center text-xs font-bold text-genesis-primary">
              {getInitials(user?.displayName)}
            </div>
          )}
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-bold text-genesis-dark truncate">{user?.displayName || 'Usuário'}</p>
            <p className="text-[10px] text-genesis-muted truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};