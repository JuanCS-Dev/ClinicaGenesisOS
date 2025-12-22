/**
 * ConsensusBadge Component
 *
 * Fase 3.3.8: Multi-LLM Consensus Engine
 *
 * Visual indicator showing the consensus level between multiple AI models
 * for a given diagnosis. Based on NEJM AI 2024 research.
 *
 * Note: Uses explicit hex colors for Tailwind 4 compatibility.
 *
 * @see https://ai.nejm.org/doi/full/10.1056/AIcs2400502
 */

import {
  CheckCheck,
  Check,
  AlertTriangle,
  HelpCircle,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { type ConsensusLevel, CONSENSUS_INDICATORS } from '@/types/clinical-reasoning';

interface ConsensusBadgeProps {
  /** Consensus level from the aggregation algorithm */
  level: ConsensusLevel;
  /** Whether to show the text label (default: true) */
  showLabel?: boolean;
  /** Size variant (default: 'sm') */
  size?: 'sm' | 'md';
}

/**
 * Icon mapping for consensus levels.
 */
const ICONS: Record<string, LucideIcon> = {
  'check-double': CheckCheck,
  check: Check,
  alert: AlertTriangle,
  question: HelpCircle,
  x: XCircle,
};

/**
 * Tailwind color classes for each color variant.
 * Uses explicit hex colors for Tailwind 4 compatibility.
 */
const COLOR_CLASSES = {
  emerald: 'bg-[#D1FAE5] text-[#047857] border-[#A7F3D0]',
  blue: 'bg-[#DBEAFE] text-[#1D4ED8] border-[#BFDBFE]',
  amber: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]',
  red: 'bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]',
  gray: 'bg-genesis-hover text-genesis-medium border-genesis-border',
};

/**
 * Size classes for the badge.
 */
const SIZE_CLASSES = {
  sm: {
    badge: 'px-2 py-0.5 text-xs gap-1',
    icon: 'w-3 h-3',
  },
  md: {
    badge: 'px-2.5 py-1 text-sm gap-1.5',
    icon: 'w-4 h-4',
  },
};

/**
 * Badge component showing multi-LLM consensus level.
 *
 * Displays an icon and optional label indicating how well
 * multiple AI models agreed on a diagnosis.
 */
export function ConsensusBadge({
  level,
  showLabel = true,
  size = 'sm',
}: ConsensusBadgeProps) {
  const indicator = CONSENSUS_INDICATORS[level];
  const Icon = ICONS[indicator.icon];
  const colorClass = COLOR_CLASSES[indicator.color];
  const sizeClass = SIZE_CLASSES[size];

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full border
        ${colorClass}
        ${sizeClass.badge}
      `}
      title={indicator.description}
    >
      <Icon className={sizeClass.icon} />
      {showLabel && <span>{indicator.label}</span>}
    </span>
  );
}

/**
 * Helper component showing model comparison details.
 */
interface ModelComparisonProps {
  gemini?: { rank: number; confidence: number };
  gpt4o?: { rank: number; confidence: number };
}

export function ModelComparison({ gemini, gpt4o }: ModelComparisonProps) {
  if (!gemini && !gpt4o) return null;

  return (
    <div className="mt-2 pt-2 border-t border-genesis-border-subtle">
      <p className="text-xs text-genesis-muted uppercase mb-1">Detalhes por modelo</p>
      <div className="flex gap-4 text-xs">
        {gemini && (
          <div className="flex items-center gap-1">
            <span className="text-genesis-subtle">Gemini:</span>
            <span className="font-medium">#{gemini.rank}</span>
            <span className="text-genesis-subtle">({gemini.confidence}%)</span>
          </div>
        )}
        {gpt4o && (
          <div className="flex items-center gap-1">
            <span className="text-genesis-subtle">GPT-4o:</span>
            <span className="font-medium">#{gpt4o.rank}</span>
            <span className="text-genesis-subtle">({gpt4o.confidence}%)</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConsensusBadge;
