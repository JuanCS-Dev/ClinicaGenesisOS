/**
 * Plugin Registry - Catálogo de Especialidades
 * =============================================
 *
 * Definições centralizadas das especialidades médicas suportadas.
 * Cada especialidade define sua identidade visual e funcionalidades.
 *
 * @module plugins/registry
 */

import { Stethoscope, Apple, Brain } from 'lucide-react';
import type { SpecialtyType, PluginDefinition } from '../types';

/**
 * Catálogo de plugins por especialidade.
 *
 * Cada entrada define:
 * - `id`: Identificador único (matches SpecialtyType)
 * - `name`: Nome de exibição
 * - `color`: Classes Tailwind para identidade visual
 * - `icon`: Componente Lucide para representação gráfica
 * - `features`: Lista de funcionalidades disponíveis
 */
export const PLUGINS: Record<SpecialtyType, PluginDefinition> = {
  medicina: {
    id: 'medicina',
    name: 'Medicina Geral',
    color: 'text-blue-600 bg-blue-50 border-blue-100',
    icon: Stethoscope,
    features: ['Anamnese SOAP', 'Prescrição Digital', 'Solicitação de Exames'],
  },
  nutricao: {
    id: 'nutricao',
    name: 'Nutrição',
    color: 'text-green-600 bg-green-50 border-green-100',
    icon: Apple,
    features: ['Antropometria', 'Plano Alimentar', 'Recordatório 24h'],
  },
  psicologia: {
    id: 'psicologia',
    name: 'Psicologia',
    color: 'text-pink-600 bg-pink-50 border-pink-100',
    icon: Brain,
    features: ['Evolução de Sessão', 'Diário de Humor', 'Anotações Privadas'],
  },
};

/**
 * Obtém a definição de um plugin por especialidade.
 */
export function getPlugin(specialty: SpecialtyType): PluginDefinition {
  return PLUGINS[specialty];
}

/**
 * Lista todas as especialidades disponíveis.
 */
export function getAvailableSpecialties(): SpecialtyType[] {
  return Object.keys(PLUGINS) as SpecialtyType[];
}
