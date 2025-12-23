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
    color: 'text-genesis-muted',
    bgColor: 'bg-genesis-soft',
    icon: FileText,
  },
  enviada: {
    label: 'Enviada',
    color: 'text-info',
    bgColor: 'bg-info-soft',
    icon: Send,
  },
  em_analise: {
    label: 'Em Análise',
    color: 'text-warning',
    bgColor: 'bg-warning-soft',
    icon: Clock,
  },
  autorizada: {
    label: 'Autorizada',
    color: 'text-success',
    bgColor: 'bg-success-soft',
    icon: CheckCircle2,
  },
  glosada_parcial: {
    label: 'Glosa Parcial',
    color: 'text-warning',
    bgColor: 'bg-warning-soft',
    icon: AlertTriangle,
  },
  glosada_total: {
    label: 'Glosa Total',
    color: 'text-danger',
    bgColor: 'bg-danger-soft',
    icon: XCircle,
  },
  paga: {
    label: 'Paga',
    color: 'text-success',
    bgColor: 'bg-success-soft',
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
