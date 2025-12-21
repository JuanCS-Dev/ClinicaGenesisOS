/**
 * RecordingBadge Component
 *
 * Visual indicator that the teleconsultation is being recorded.
 * Important for legal compliance and transparency with patients.
 */

import { Circle } from 'lucide-react';

interface RecordingBadgeProps {
  /** Optional custom label */
  label?: string;
  /** Optional size variant */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * RecordingBadge - Recording indicator with pulsing animation.
 *
 * @param label - Custom label (default: "REC")
 * @param size - Size variant (default: "md")
 */
export function RecordingBadge({ label = 'REC', size = 'md' }: RecordingBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-2',
    lg: 'px-4 py-2 text-base gap-2',
  };

  const iconSizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <div
      className={`flex items-center ${sizeClasses[size]} bg-red-600 text-white rounded-lg font-bold shadow-lg animate-pulse`}
      role="status"
      aria-label="Gravação em andamento"
    >
      <Circle className={`${iconSizes[size]} fill-current`} />
      <span>{label}</span>
    </div>
  );
}
