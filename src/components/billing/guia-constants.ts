/**
 * Guia Constants and Helpers
 *
 * Shared constants and helper functions for guia-related components.
 */

import type { StatusGuia, TipoGuia } from '@/types';
import type { ElementType } from 'react';
import {
  FileText,
  Send,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  DollarSign,
  RefreshCw,
} from 'lucide-react';

// =============================================================================
// STATUS CONFIGURATION
// =============================================================================

interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  icon: ElementType;
}

export const STATUS_CONFIG: Record<StatusGuia, StatusConfig> = {
  rascunho: {
    label: 'Rascunho',
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    icon: FileText,
  },
  enviada: {
    label: 'Enviada',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    icon: Send,
  },
  em_analise: {
    label: 'Em Análise',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    icon: Clock,
  },
  autorizada: {
    label: 'Autorizada',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    icon: CheckCircle2,
  },
  glosada_parcial: {
    label: 'Glosa Parcial',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    icon: AlertTriangle,
  },
  glosada_total: {
    label: 'Glosa Total',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    icon: XCircle,
  },
  paga: {
    label: 'Paga',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    icon: DollarSign,
  },
  recurso: {
    label: 'Em Recurso',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    icon: RefreshCw,
  },
};

export const TIPO_GUIA_LABELS: Record<TipoGuia, string> = {
  consulta: 'Consulta',
  sadt: 'SP/SADT',
  internacao: 'Internação',
  honorarios: 'Honorários',
  anexo: 'Anexo',
};

// =============================================================================
// FORMATTING HELPERS
// =============================================================================

export function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}
