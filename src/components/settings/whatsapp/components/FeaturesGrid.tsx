/**
 * Features Grid
 * =============
 *
 * Display of automatic WhatsApp features provided by the integration.
 *
 * @module components/settings/whatsapp/components/FeaturesGrid
 */

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { AutomaticFeature } from '../types';

/**
 * Default automatic features.
 */
export const AUTOMATIC_FEATURES: AutomaticFeature[] = [
  {
    title: 'Confirmação ao Agendar',
    description: 'Enviada imediatamente após novo agendamento',
    enabled: true,
  },
  {
    title: 'Lembrete 24h Antes',
    description: 'Executado a cada hora via Cloud Scheduler',
    enabled: true,
  },
  {
    title: 'Lembrete 2h Antes',
    description: 'Executado a cada 30 min via Cloud Scheduler',
    enabled: true,
  },
  {
    title: 'Atualização Automática',
    description: 'Webhook processa respostas (Sim/Remarcar)',
    enabled: true,
  },
];

interface FeaturesGridProps {
  /** List of features to display */
  features?: AutomaticFeature[];
}

/**
 * Grid displaying automatic WhatsApp features.
 */
export function FeaturesGrid({
  features = AUTOMATIC_FEATURES,
}: FeaturesGridProps): React.ReactElement {
  return (
    <div className="bg-genesis-surface rounded-2xl border border-genesis-border-subtle p-6">
      <h3 className="font-semibold text-genesis-dark mb-4">
        Funcionalidades Automáticas
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature) => (
          <FeatureCard key={feature.title} feature={feature} />
        ))}
      </div>
    </div>
  );
}

/**
 * Individual feature card.
 */
const FeatureCard: React.FC<{
  feature: AutomaticFeature;
}> = ({ feature }) => {
  return (
    <div className="flex items-start gap-3 p-4 bg-genesis-soft rounded-xl">
      <CheckCircle2
        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
          feature.enabled ? 'text-green-500' : 'text-genesis-muted'
        }`}
      />
      <div>
        <p className="font-medium text-genesis-dark text-sm">{feature.title}</p>
        <p className="text-xs text-genesis-muted mt-0.5">
          {feature.description}
        </p>
      </div>
    </div>
  );
}

export default FeaturesGrid;
