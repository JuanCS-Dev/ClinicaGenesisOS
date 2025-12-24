/**
 * Help Page Constants
 * ===================
 *
 * Constants for the help center.
 *
 * @module pages/help/constants
 */

import { Calendar, FileText, Wallet, Settings } from 'lucide-react';
import type { QuickCategory } from './types';

/**
 * Quick access category cards.
 */
export const QUICK_CATEGORIES: QuickCategory[] = [
  {
    id: 'agenda',
    label: 'Agenda',
    description: 'Agendar, cancelar e gerenciar consultas',
    icon: Calendar,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/30',
  },
  {
    id: 'prontuario',
    label: 'Prontuário',
    description: 'Documentação, AI Scribe e histórico',
    icon: FileText,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-900/30',
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    description: 'Faturamento, TISS e relatórios',
    icon: Wallet,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/30',
  },
  {
    id: 'configuracoes',
    label: 'Configurações',
    description: 'WhatsApp, equipe e preferências',
    icon: Settings,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/30',
  },
];
