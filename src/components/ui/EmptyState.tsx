/**
 * EmptyState Component
 * ====================
 *
 * Premium empty state with animated SVG illustrations.
 * Use for empty lists, search results, and initial states.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   illustration="documents"
 *   title="Nenhum documento"
 *   description="Comece criando seu primeiro documento"
 *   action={{ label: 'Criar', onClick: handleCreate }}
 * />
 * ```
 */

import React from 'react';
import { ArrowRight } from 'lucide-react';

export type IllustrationType =
  | 'documents'
  | 'search'
  | 'success'
  | 'calendar'
  | 'patients'
  | 'inbox';

export interface EmptyStateProps {
  /** Type of illustration to display */
  illustration?: IllustrationType;
  /** Main title */
  title: string;
  /** Description text */
  description?: string;
  /** Optional action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Additional CSS classes */
  className?: string;
}

/**
 * SVG illustrations with subtle floating animation
 */
const illustrations: Record<IllustrationType, React.ReactNode> = {
  documents: (
    <svg
      className="w-32 h-32 animate-[float_3s_ease-in-out_infinite]"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Back document */}
      <rect
        x="35"
        y="25"
        width="55"
        height="70"
        rx="6"
        className="fill-genesis-border-subtle stroke-genesis-border"
        strokeWidth="2"
      />
      {/* Front document */}
      <rect
        x="25"
        y="20"
        width="55"
        height="70"
        rx="6"
        className="fill-white stroke-genesis-primary"
        strokeWidth="2"
      />
      {/* Lines */}
      <line x1="35" y1="35" x2="70" y2="35" className="stroke-genesis-muted" strokeWidth="2" strokeLinecap="round" />
      <line x1="35" y1="45" x2="65" y2="45" className="stroke-genesis-border" strokeWidth="2" strokeLinecap="round" />
      <line x1="35" y1="55" x2="60" y2="55" className="stroke-genesis-border" strokeWidth="2" strokeLinecap="round" />
      <line x1="35" y1="65" x2="55" y2="65" className="stroke-genesis-border" strokeWidth="2" strokeLinecap="round" />
      {/* Checkmark accent */}
      <circle cx="85" cy="75" r="15" className="fill-genesis-primary-soft" />
      <path
        d="M78 75L83 80L92 71"
        className="stroke-genesis-primary"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),

  search: (
    <svg
      className="w-32 h-32 animate-[float_3s_ease-in-out_infinite]"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Magnifying glass */}
      <circle
        cx="50"
        cy="50"
        r="25"
        className="fill-white stroke-genesis-primary"
        strokeWidth="3"
      />
      <line
        x1="68"
        y1="68"
        x2="90"
        y2="90"
        className="stroke-genesis-primary"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Question marks */}
      <text x="42" y="58" className="fill-genesis-muted text-2xl font-bold">?</text>
      {/* Floating dots */}
      <circle cx="25" cy="30" r="3" className="fill-genesis-primary-muted animate-pulse" />
      <circle cx="95" cy="40" r="2" className="fill-genesis-primary-muted animate-pulse" style={{ animationDelay: '0.5s' }} />
    </svg>
  ),

  success: (
    <svg
      className="w-32 h-32 animate-[float_3s_ease-in-out_infinite]"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Circle */}
      <circle
        cx="60"
        cy="60"
        r="40"
        className="fill-success-soft stroke-success"
        strokeWidth="3"
      />
      {/* Checkmark */}
      <path
        d="M40 60L55 75L80 50"
        className="stroke-success"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Sparkles */}
      <circle cx="95" cy="35" r="4" className="fill-warning animate-pulse" />
      <circle cx="25" cy="45" r="3" className="fill-genesis-primary-muted animate-pulse" style={{ animationDelay: '0.3s' }} />
    </svg>
  ),

  calendar: (
    <svg
      className="w-32 h-32 animate-[float_3s_ease-in-out_infinite]"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Calendar body */}
      <rect
        x="20"
        y="30"
        width="80"
        height="70"
        rx="8"
        className="fill-white stroke-genesis-primary"
        strokeWidth="2"
      />
      {/* Header */}
      <rect x="20" y="30" width="80" height="20" rx="8" className="fill-genesis-primary" />
      {/* Binding holes */}
      <circle cx="40" cy="25" r="4" className="fill-genesis-primary" />
      <circle cx="80" cy="25" r="4" className="fill-genesis-primary" />
      {/* Grid lines */}
      <line x1="20" y1="65" x2="100" y2="65" className="stroke-genesis-border-subtle" strokeWidth="1" />
      <line x1="20" y1="80" x2="100" y2="80" className="stroke-genesis-border-subtle" strokeWidth="1" />
      <line x1="46" y1="50" x2="46" y2="100" className="stroke-genesis-border-subtle" strokeWidth="1" />
      <line x1="73" y1="50" x2="73" y2="100" className="stroke-genesis-border-subtle" strokeWidth="1" />
      {/* Highlight day */}
      <circle cx="60" cy="72" r="8" className="fill-genesis-primary-soft" />
    </svg>
  ),

  patients: (
    <svg
      className="w-32 h-32 animate-[float_3s_ease-in-out_infinite]"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main person */}
      <circle cx="60" cy="40" r="18" className="fill-genesis-primary-soft stroke-genesis-primary" strokeWidth="2" />
      <path
        d="M30 95C30 75 45 60 60 60C75 60 90 75 90 95"
        className="fill-genesis-primary-soft stroke-genesis-primary"
        strokeWidth="2"
      />
      {/* Plus sign */}
      <circle cx="90" cy="75" r="12" className="fill-white stroke-genesis-primary" strokeWidth="2" />
      <line x1="90" y1="69" x2="90" y2="81" className="stroke-genesis-primary" strokeWidth="2" strokeLinecap="round" />
      <line x1="84" y1="75" x2="96" y2="75" className="stroke-genesis-primary" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),

  inbox: (
    <svg
      className="w-32 h-32 animate-[float_3s_ease-in-out_infinite]"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Inbox container */}
      <path
        d="M20 50L35 30H85L100 50V90C100 94 97 97 93 97H27C23 97 20 94 20 90V50Z"
        className="fill-white stroke-genesis-primary"
        strokeWidth="2"
      />
      {/* Inbox lip */}
      <path
        d="M20 50H45L50 60H70L75 50H100"
        className="fill-genesis-primary-soft stroke-genesis-primary"
        strokeWidth="2"
      />
      {/* Sparkle */}
      <circle cx="60" cy="75" r="6" className="fill-genesis-primary-muted animate-pulse" />
    </svg>
  ),
};

/**
 * EmptyState component for empty lists and search results.
 * Features animated SVG illustrations and optional action button.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  illustration = 'documents',
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      {/* Illustration */}
      <div className="flex justify-center mb-6">
        {illustrations[illustration]}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-genesis-dark mb-2">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-genesis-muted max-w-sm mx-auto mb-6">
          {description}
        </p>
      )}

      {/* Action Button */}
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-genesis-primary text-white rounded-lg font-medium hover:bg-genesis-primary-dark hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200"
        >
          {action.label}
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default EmptyState;
