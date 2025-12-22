/**
 * Payment Status Component
 * ========================
 *
 * Displays payment status with appropriate styling.
 * Used in payment lists and transaction details.
 *
 * Fase 10: PIX Integration
 */

import React from 'react';
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import type { PaymentDisplayStatus } from '@/types';
import { PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS } from '@/types';

/**
 * Props for PaymentStatus component.
 */
interface PaymentStatusProps {
  /** Payment status */
  status: PaymentDisplayStatus;
  /** Show status label */
  showLabel?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional className */
  className?: string;
}

/**
 * Icon mapping for each status.
 */
const STATUS_ICONS: Record<PaymentDisplayStatus, React.ElementType> = {
  awaiting_payment: Clock,
  processing: Loader2,
  paid: CheckCircle2,
  expired: AlertCircle,
  failed: XCircle,
  refunded: RefreshCw,
};

/**
 * Background colors for each status.
 */
const STATUS_BG_COLORS: Record<PaymentDisplayStatus, string> = {
  awaiting_payment: 'bg-amber-50',
  processing: 'bg-blue-50',
  paid: 'bg-green-50',
  expired: 'bg-gray-50',
  failed: 'bg-red-50',
  refunded: 'bg-purple-50',
};

/**
 * Size classes for different sizes.
 */
const SIZE_CLASSES = {
  sm: {
    container: 'px-2 py-1 gap-1',
    icon: 'w-3 h-3',
    text: 'text-xs',
  },
  md: {
    container: 'px-3 py-1.5 gap-1.5',
    icon: 'w-4 h-4',
    text: 'text-sm',
  },
  lg: {
    container: 'px-4 py-2 gap-2',
    icon: 'w-5 h-5',
    text: 'text-base',
  },
};

/**
 * Payment status badge component.
 *
 * @example
 * ```tsx
 * <PaymentStatus status="paid" showLabel />
 * <PaymentStatus status="awaiting_payment" size="lg" />
 * ```
 */
export const PaymentStatus: React.FC<PaymentStatusProps> = ({
  status,
  showLabel = true,
  size = 'md',
  className = '',
}) => {
  const Icon = STATUS_ICONS[status];
  const color = PAYMENT_STATUS_COLORS[status];
  const bgColor = STATUS_BG_COLORS[status];
  const label = PAYMENT_STATUS_LABELS[status];
  const sizeClasses = SIZE_CLASSES[size];

  const isProcessing = status === 'processing';

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        ${bgColor}
        ${sizeClasses.container}
        ${className}
      `}
      style={{ color }}
    >
      <Icon
        className={`
          ${sizeClasses.icon}
          ${isProcessing ? 'animate-spin' : ''}
        `}
      />
      {showLabel && (
        <span className={sizeClasses.text}>{label}</span>
      )}
    </span>
  );
};

/**
 * Props for PaymentStatusBadge component.
 */
interface PaymentStatusBadgeProps {
  /** Payment status */
  status: PaymentDisplayStatus;
  /** Additional className */
  className?: string;
}

/**
 * Simple dot indicator for payment status.
 *
 * @example
 * ```tsx
 * <PaymentStatusBadge status="paid" />
 * ```
 */
export const PaymentStatusDot: React.FC<PaymentStatusBadgeProps> = ({
  status,
  className = '',
}) => {
  const color = PAYMENT_STATUS_COLORS[status];
  const isAnimated = status === 'awaiting_payment' || status === 'processing';

  return (
    <span
      className={`
        inline-block w-2 h-2 rounded-full
        ${isAnimated ? 'animate-pulse' : ''}
        ${className}
      `}
      style={{ backgroundColor: color }}
      title={PAYMENT_STATUS_LABELS[status]}
    />
  );
};

/**
 * Props for PaymentStatusText component.
 */
interface PaymentStatusTextProps {
  /** Payment status */
  status: PaymentDisplayStatus;
  /** Additional className */
  className?: string;
}

/**
 * Text-only status indicator.
 *
 * @example
 * ```tsx
 * <PaymentStatusText status="paid" />
 * ```
 */
export const PaymentStatusText: React.FC<PaymentStatusTextProps> = ({
  status,
  className = '',
}) => {
  const color = PAYMENT_STATUS_COLORS[status];
  const label = PAYMENT_STATUS_LABELS[status];

  return (
    <span
      className={`font-medium ${className}`}
      style={{ color }}
    >
      {label}
    </span>
  );
};

export default PaymentStatus;

