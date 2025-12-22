/**
 * DayView Component
 *
 * Renders the day view of the agenda with hour slots and appointments.
 */

import React from 'react';
import { format, isToday, parseISO } from 'date-fns';
import { AppointmentCard } from './AppointmentCard';
import type { Appointment } from '@/types';

interface DayViewProps {
  /** The date being displayed */
  date: Date;
  /** Appointments to display (already filtered) */
  appointments: Appointment[];
  /** Working hours to display (e.g., [8, 9, 10, ...20]) */
  hours: number[];
}

/**
 * Renders a day view with hour slots and appointments.
 */
export function DayView({ date, appointments, hours }: DayViewProps) {
  const isCurrentDay = isToday(date);

  return (
    <div className="flex-1 overflow-y-auto relative custom-scrollbar bg-genesis-soft/50">
      {hours.map((hour) => (
        <div key={hour} className="flex min-h-[120px] group relative border-b border-genesis-border-subtle/50">
          <div className="w-20 p-3 text-[11px] font-bold text-genesis-medium/70 text-center border-r border-genesis-border-subtle/50 bg-[#F5F5F7]/40 backdrop-blur-sm">
            {hour}:00
          </div>

          <div className="flex-1 relative mx-2">
            {appointments
              .filter((app) => parseISO(app.date).getHours() === hour)
              .map((app) => (
                <React.Fragment key={app.id}>
                  <AppointmentCard appointment={app} />
                </React.Fragment>
              ))}
          </div>
        </div>
      ))}

      {/* Current Time Indicator (only shown when viewing today) */}
      {isCurrentDay && (
        <div
          className="absolute left-0 right-0 h-px bg-red-500 z-20 pointer-events-none flex items-center shadow-[0_0_4px_rgba(239,68,68,0.4)]"
          style={{
            top: `${(new Date().getHours() - 8) * 120 + (new Date().getMinutes() / 60) * 120}px`,
          }}
        >
          <div className="w-20 bg-red-50/80 text-red-500 text-[10px] font-bold text-right pr-2 backdrop-blur-sm">
            {format(new Date(), 'HH:mm')}
          </div>
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full -ml-1.5 border-2 border-[#F5F5F7]" />
        </div>
      )}
    </div>
  );
}
