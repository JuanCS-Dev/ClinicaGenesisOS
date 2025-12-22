/**
 * Genesis Design System - Components Index
 * =========================================
 * 
 * Central export point for all design system components.
 * 
 * @example
 * ```tsx
 * import { Button, Input, Modal, Card, Badge, Avatar } from '@/design-system/components';
 * ```
 * 
 * @module design-system/components
 * @version 1.0.0
 */

// Button
export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from './Button';

// Input
export { Input, type InputProps, type InputSize } from './Input';

// Modal
export { Modal, type ModalProps, type ModalSize } from './Modal';

// Card
export { 
  Card, 
  CardHeader, 
  CardBody, 
  CardFooter,
  type CardProps, 
  type CardHeaderProps,
  type CardBodyProps,
  type CardFooterProps,
  type CardPadding,
} from './Card';

// Badge
export { Badge, type BadgeProps, type BadgeVariant, type BadgeSize } from './Badge';

// Avatar
export { Avatar, type AvatarProps, type AvatarSize } from './Avatar';

// Theme Toggle
export { 
  ThemeToggle, 
  ThemeSegmented,
  type ThemeToggleProps, 
  type ThemeSegmentedProps,
} from './ThemeToggle';

