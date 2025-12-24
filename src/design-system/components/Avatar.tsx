/**
 * Genesis Design System - Avatar Component
 * =========================================
 * 
 * User representation with image, initials, or icon fallback.
 * 
 * @example
 * ```tsx
 * <Avatar
 *   src="/user.jpg"
 *   alt="Maria Silva"
 *   fallback="MS"
 *   size="lg"
 * />
 * ```
 * 
 * @module design-system/components/Avatar
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { User } from 'lucide-react';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  /** Image source URL */
  src?: string;
  /** Alt text for image */
  alt?: string;
  /** Fallback text (initials) */
  fallback?: string;
  /** Size of the avatar */
  size?: AvatarSize;
  /** Whether to show online status indicator */
  status?: 'online' | 'offline' | 'busy' | 'away';
  /** Custom background color */
  color?: string;
  /** Additional class name */
  className?: string;
}

/**
 * Size configurations
 */
const sizeConfigs: Record<AvatarSize, { container: string; text: string; icon: number; status: string }> = {
  xs: { container: 'w-6 h-6', text: 'text-xs', icon: 12, status: 'w-1.5 h-1.5 border' },
  sm: { container: 'w-8 h-8', text: 'text-xs', icon: 14, status: 'w-2 h-2 border' },
  md: { container: 'w-10 h-10', text: 'text-sm', icon: 18, status: 'w-2.5 h-2.5 border-2' },
  lg: { container: 'w-12 h-12', text: 'text-base', icon: 22, status: 'w-3 h-3 border-2' },
  xl: { container: 'w-16 h-16', text: 'text-lg', icon: 28, status: 'w-3.5 h-3.5 border-2' },
};

/**
 * Status colors
 */
const statusColors = {
  online: 'bg-[var(--color-success)]',
  offline: 'bg-[var(--color-genesis-muted)]',
  busy: 'bg-[var(--color-danger)]',
  away: 'bg-[var(--color-warning)]',
};

/**
 * Generate color from string (for consistent fallback colors)
 */
function stringToColor(str: string): string {
  const colors = [
    'bg-[var(--color-genesis-primary)]',
    'bg-[var(--color-clinical-start)]',
    'bg-[var(--color-success)]',
    'bg-[var(--color-info)]',
    'bg-[var(--color-specialty-psico)]',
    'bg-[var(--color-specialty-estetica)]',
  ];
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Extract initials from name
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

/**
 * Premium Avatar Component
 * 
 * Features:
 * - Image with fallback
 * - Initials fallback with consistent colors
 * - Icon fallback
 * - 5 sizes (xs, sm, md, lg, xl)
 * - Status indicator
 * - Accessible
 */
export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  fallback,
  size = 'md',
  status,
  color,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);
  const config = sizeConfigs[size];
  
  const showImage = src && !imgError;
  const initials = fallback || (alt ? getInitials(alt) : '');
  const bgColor = color || (initials ? stringToColor(initials) : 'bg-[var(--color-genesis-hover)]');

  return (
    <div className={`relative inline-flex ${className}`}>
      {/* Avatar container */}
      <div
        className={[
          config.container,
          'rounded-full overflow-hidden flex items-center justify-center',
          !showImage ? bgColor : '',
          'ring-2 ring-[var(--color-genesis-surface)] ring-offset-0',
        ].join(' ')}
        role={alt ? 'img' : 'presentation'}
        aria-label={alt || undefined}
      >
        {/* Image */}
        {showImage && (
          <img
            src={src}
            alt={alt}
            loading="lazy"
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        )}

        {/* Initials fallback */}
        {!showImage && initials && (
          <span className={`${config.text} font-medium text-white select-none`}>
            {initials}
          </span>
        )}

        {/* Icon fallback */}
        {!showImage && !initials && (
          <User size={config.icon} className="text-white" aria-hidden="true" />
        )}
      </div>

      {/* Status indicator */}
      {status && (
        <span
          className={[
            'absolute bottom-0 right-0 rounded-full',
            config.status,
            statusColors[status],
            'border-[var(--color-genesis-surface)]',
          ].join(' ')}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
};

Avatar.displayName = 'Avatar';

export default Avatar;

