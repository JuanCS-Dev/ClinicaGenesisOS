/**
 * TelemedicineButton Component
 *
 * Button to start a teleconsultation from an appointment card.
 * Shows different states based on session status.
 */

import React, { useState, useCallback } from 'react';
import { Video, Loader2, PhoneCall } from 'lucide-react';
import type { Appointment } from '@/types';

interface TelemedicineButtonProps {
  /** The appointment to start teleconsultation for */
  appointment: Appointment;
  /** Callback when button is clicked */
  onStart: (appointment: Appointment) => void;
  /** Whether a session is already active for this appointment */
  hasActiveSession?: boolean;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Whether button is in loading state */
  loading?: boolean;
}

/**
 * TelemedicineButton - Start or join a teleconsultation.
 *
 * @param appointment - The appointment
 * @param onStart - Callback when clicked
 * @param hasActiveSession - Whether session exists
 * @param size - Button size
 * @param loading - Loading state
 */
export function TelemedicineButton({
  appointment,
  onStart,
  hasActiveSession = false,
  size = 'sm',
  loading = false,
}: TelemedicineButtonProps) {
  const [isHovering, setIsHovering] = useState(false);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent card click
      onStart(appointment);
    },
    [appointment, onStart]
  );

  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-[10px] gap-1.5',
    md: 'px-4 py-2 text-xs gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
  };

  // Don't show for canceled or finished appointments
  if (appointment.status === 'Cancelado' || appointment.status === 'Finalizado') {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      disabled={loading}
      className={`
        flex items-center ${sizeClasses[size]} rounded-lg font-bold
        transition-all duration-200 shadow-sm
        ${loading ? 'cursor-wait' : 'cursor-pointer'}
        ${
          hasActiveSession
            ? 'bg-success hover:bg-success/90 text-white shadow-success/20'
            : 'bg-genesis-primary hover:bg-genesis-primary-dark text-white shadow-genesis-primary/20'
        }
        hover:scale-[1.05] active:scale-[0.98] hover:shadow-md
      `}
      title={hasActiveSession ? 'Entrar na teleconsulta' : 'Iniciar teleconsulta'}
    >
      {loading ? (
        <Loader2 className={`${iconSizes[size]} animate-spin`} />
      ) : hasActiveSession ? (
        <PhoneCall className={iconSizes[size]} />
      ) : (
        <Video className={iconSizes[size]} />
      )}
      <span className={isHovering || size === 'md' ? '' : 'sr-only sm:not-sr-only'}>
        {hasActiveSession ? 'Entrar' : 'Teleconsulta'}
      </span>
    </button>
  );
}
