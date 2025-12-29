/**
 * TabButton Component
 * ===================
 *
 * A reusable tab button component with icon support.
 * Used for navigation between different views/sections.
 *
 * @module components/ui/TabButton
 */

import type { ComponentType } from 'react'

// =============================================================================
// TYPES
// =============================================================================

export interface TabButtonProps {
  /** Whether this tab is currently active */
  active: boolean
  /** Click handler */
  onClick: () => void
  /** Icon component to display */
  icon: ComponentType<{ className?: string }>
  /** Tab label text */
  label: string
  /** Custom color class for active state icon */
  colorClass?: string
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * A tab button with icon and label.
 *
 * @example
 * ```tsx
 * <TabButton
 *   active={activeTab === 'history'}
 *   onClick={() => setActiveTab('history')}
 *   icon={History}
 *   label="Histórico"
 * />
 * ```
 */
export const TabButton = ({
  active,
  onClick,
  icon: Icon,
  label,
  colorClass = 'text-genesis-primary',
}: TabButtonProps) => (
  <button
    onClick={onClick}
    className={`
      relative flex items-center justify-center gap-2 px-6 py-2 text-[13px] font-semibold transition-all duration-300 rounded-lg flex-1 md:flex-none
      ${
        active
          ? `bg-genesis-surface text-genesis-dark shadow-sm ring-1 ring-black/5`
          : 'text-genesis-medium hover:text-genesis-dark hover:bg-black/5'
      }
    `}
  >
    <Icon className={`w-4 h-4 transition-colors ${active ? colorClass : 'text-genesis-subtle'}`} />
    {label}
  </button>
)
