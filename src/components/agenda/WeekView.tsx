/**
 * WeekView Component
 *
 * Renders a week view of the agenda with 7 day columns.
 * Each column shows appointments for that day in a compact format.
 */

import React from 'react';
import { format, isToday, parseISO } from 'date-fns';
import { AppointmentCard } from './AppointmentCard';
import type { Appointment } from '@/types';

/** Day names in Portuguese. */
const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

interface WeekViewProps {
  /** Array of 7 dates representing the week */
  weekDates: Date[];
  /** All appointments for the week (will be filtered by day) */
  appointments: Appointment[];
  /** Callback when clicking on a day (to switch to day view) */
  onDayClick?: (date: Date) => void;
}

/**
 * Get appointments for a specific date.
 */
function getAppointmentsForDate(appointments: Appointment[], date: Date): Appointment[] {
  const dateStr = format(date, 'yyyy-MM-dd');
  return appointments.filter((app) => app.date.startsWith(dateStr));
}

/**
 * Renders a week view with 7 day columns.
 */
export function WeekView({ weekDates, appointments, onDayClick }: WeekViewProps) {
  return (
    <div className="flex-1 overflow-hidden bg-genesis-soft/50">
      {/* Week Header */}
      <div className="flex border-b border-gray-200 bg-white/80 sticky top-0 z-10">
        {weekDates.map((date, index) => {
          const isCurrentDay = isToday(date);
          return (
            <div
              key={index}
              className={`flex-1 p-2 text-center border-r border-gray-100 last:border-r-0 cursor-pointer hover:bg-gray-50 transition-colors ${
                isCurrentDay ? 'bg-blue-50' : ''
              }`}
              onClick={() => onDayClick?.(date)}
            >
              <div className="text-[10px] font-bold text-genesis-medium uppercase">
                {DAY_NAMES[index]}
              </div>
              <div
                className={`text-lg font-bold mt-0.5 ${
                  isCurrentDay
                    ? 'text-white bg-genesis-blue rounded-full w-8 h-8 flex items-center justify-center mx-auto'
                    : 'text-genesis-dark'
                }`}
              >
                {format(date, 'd')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Week Body */}
      <div className="flex h-[calc(100%-60px)] overflow-y-auto">
        {weekDates.map((date, index) => {
          const dayAppointments = getAppointmentsForDate(appointments, date);
          const isCurrentDay = isToday(date);

          return (
            <div
              key={index}
              className={`flex-1 border-r border-gray-100 last:border-r-0 p-2 overflow-y-auto custom-scrollbar ${
                isCurrentDay ? 'bg-blue-50/30' : ''
              }`}
            >
              {dayAppointments.length === 0 ? (
                <div className="text-center text-xs text-genesis-medium/50 mt-4">
                  Nenhuma consulta
                </div>
              ) : (
                <div className="space-y-2">
                  {dayAppointments
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map((app) => (
                      <div key={app.id} className="relative">
                        <div className="text-[10px] font-bold text-genesis-medium mb-1">
                          {format(parseISO(app.date), 'HH:mm')}
                        </div>
                        <AppointmentCard appointment={app} compact />
                      </div>
                    ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
