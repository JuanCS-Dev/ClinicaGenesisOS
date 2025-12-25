/**
 * Command Palette Component
 * =========================
 *
 * Global search modal triggered by Cmd+K / Ctrl+K.
 * Allows quick navigation and search across the application.
 *
 * Built with cmdk (same lib used by Stripe, Linear, Vercel).
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import {
  Search,
  User,
  Calendar,
  FileText,
  Pill,
  DollarSign,
  Home,
  Users,
  UserPlus,
  BarChart3,
  Settings,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import { useGlobalSearch, type SearchResultType } from '@/hooks/useGlobalSearch';
import './command-palette.css';

/**
 * Props for CommandPalette component.
 */
interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Quick actions for navigation.
 */
const quickActions = [
  { id: 'dashboard', label: 'Ir para Dashboard', path: '/dashboard', icon: Home, keywords: 'inicio home' },
  { id: 'agenda', label: 'Ir para Agenda', path: '/agenda', icon: Calendar, keywords: 'consultas calendario' },
  { id: 'patients', label: 'Ir para Pacientes', path: '/patients', icon: Users, keywords: 'lista clientes' },
  { id: 'new-patient', label: 'Novo Paciente', path: '/patients/new', icon: UserPlus, keywords: 'criar adicionar cadastrar' },
  { id: 'finance', label: 'Ir para Financeiro', path: '/finance', icon: DollarSign, keywords: 'dinheiro pagamentos receitas' },
  { id: 'reports', label: 'Ir para Relatórios', path: '/reports', icon: BarChart3, keywords: 'graficos metricas analytics' },
  { id: 'settings', label: 'Configurações', path: '/settings', icon: Settings, keywords: 'opcoes preferencias' },
  { id: 'help', label: 'Ajuda', path: '/help', icon: HelpCircle, keywords: 'suporte faq' },
];

/**
 * Get icon for result type.
 */
function getTypeIcon(type: SearchResultType): React.ReactNode {
  const iconClass = "w-4 h-4";
  switch (type) {
    case 'patient':
      return <User className={iconClass} />;
    case 'appointment':
      return <Calendar className={iconClass} />;
    case 'medical_record':
      return <FileText className={iconClass} />;
    case 'prescription':
      return <Pill className={iconClass} />;
    case 'transaction':
      return <DollarSign className={iconClass} />;
    default:
      return <FileText className={iconClass} />;
  }
}

/**
 * Command Palette component.
 */
export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const {
    query,
    setQuery,
    loading,
    hasSearched,
    groupedResults,
    clear,
  } = useGlobalSearch();

  // Clear search when closing
  useEffect(() => {
    if (!isOpen) {
      clear();
    }
  }, [isOpen, clear]);

  const handleSelect = (path: string) => {
    navigate(path);
    clear();
    onClose();
  };

  const hasPatients = groupedResults.patient.length > 0;
  const hasAppointments = groupedResults.appointment.length > 0;
  const hasResults = hasPatients || hasAppointments;

  return (
    <Command.Dialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      label="Command Palette"
      className="command-palette-dialog"
    >
      <div className="command-palette-container">
        {/* Search Input */}
        <div className="command-palette-header">
          <Search className="w-5 h-5 text-genesis-subtle" />
          <Command.Input
            value={query}
            onValueChange={setQuery}
            placeholder="Buscar pacientes, consultas ou ir para..."
            className="command-palette-input"
          />
          {loading && <Loader2 className="w-5 h-5 text-genesis-subtle animate-spin" />}
          <kbd className="command-palette-kbd">ESC</kbd>
        </div>

        {/* Results List */}
        <Command.List className="command-palette-list">
          <Command.Empty className="command-palette-empty">
            {hasSearched ? `Nenhum resultado para "${query}"` : 'Digite para buscar...'}
          </Command.Empty>

          {/* Quick Actions - show when no search or searching */}
          {(!hasSearched || !hasResults) && (
            <Command.Group heading="Ações Rápidas" className="command-palette-group">
              {quickActions.map((action) => (
                <Command.Item
                  key={action.id}
                  value={`${action.label} ${action.keywords}`}
                  onSelect={() => handleSelect(action.path)}
                  className="command-palette-item"
                >
                  <div className="command-palette-item-icon bg-genesis-hover text-genesis-medium">
                    <action.icon className="w-4 h-4" />
                  </div>
                  <span className="command-palette-item-label">{action.label}</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {/* Patients Results */}
          {hasPatients && (
            <Command.Group heading="Pacientes" className="command-palette-group">
              {groupedResults.patient.map((result) => (
                <Command.Item
                  key={`patient-${result.id}`}
                  value={`${result.title} ${result.subtitle || ''}`}
                  onSelect={() => handleSelect(result.path)}
                  className="command-palette-item"
                >
                  <div className="command-palette-item-icon bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    {getTypeIcon(result.type)}
                  </div>
                  <div className="command-palette-item-content">
                    <span className="command-palette-item-label">{result.title}</span>
                    {result.subtitle && (
                      <span className="command-palette-item-subtitle">{result.subtitle}</span>
                    )}
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {/* Appointments Results */}
          {hasAppointments && (
            <Command.Group heading="Consultas" className="command-palette-group">
              {groupedResults.appointment.map((result) => (
                <Command.Item
                  key={`appointment-${result.id}`}
                  value={`${result.title} ${result.subtitle || ''}`}
                  onSelect={() => handleSelect(result.path)}
                  className="command-palette-item"
                >
                  <div className="command-palette-item-icon bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                    {getTypeIcon(result.type)}
                  </div>
                  <div className="command-palette-item-content">
                    <span className="command-palette-item-label">{result.title}</span>
                    {result.subtitle && (
                      <span className="command-palette-item-subtitle">{result.subtitle}</span>
                    )}
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
          )}
        </Command.List>

        {/* Footer */}
        <div className="command-palette-footer">
          <div className="command-palette-footer-hints">
            <span><kbd>↑↓</kbd> navegar</span>
            <span><kbd>↵</kbd> selecionar</span>
            <span><kbd>esc</kbd> fechar</span>
          </div>
        </div>
      </div>
    </Command.Dialog>
  );
};

export default CommandPalette;
