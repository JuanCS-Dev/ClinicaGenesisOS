/**
 * MonthView Component
 *
 * Renders a month calendar grid with appointment indicators.
 */

import React from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isToday,
  isSameDay,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Appointment } from '@/types';
import { SPECIALTY_COLORS } from './AppointmentCard';

/** Day names in Portuguese. */
const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

interface MonthViewProps {
  /** The month to display (any date within the month) */
  selectedDate: Date;
  /** All appointments for the month */
  appointments: Appointment[];
  /** Callback when clicking on a day */
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
 * Generate calendar days for a month (includes days from prev/next months to fill grid).
 */
function getCalendarDays(date: Date): Date[] {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days: Date[] = [];
  let current = calendarStart;

  while (current <= calendarEnd) {
    days.push(current);
    current = addDays(current, 1);
  }

  return days;
}

/**
 * Renders a month view with a calendar grid.
 */
export function MonthView({ selectedDate, appointments, onDayClick }: MonthViewProps) {
  const calendarDays = getCalendarDays(selectedDate);

  return (
    <div className="flex-1 overflow-auto bg-genesis-soft/50 p-4">
      {/* Month Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAY_NAMES.map((day) => (
          <div
            key={day}
            className="text-center text-[11px] font-bold text-genesis-medium uppercase py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const dayAppointments = getAppointmentsForDate(appointments, day);
          const isCurrentMonth = isSameMonth(day, selectedDate);
          const isCurrentDay = isToday(day);
          const isSelected = isSameDay(day, selectedDate);

          return (
            <div
              key={index}
              onClick={() => onDayClick?.(day)}
              className={`
                min-h-[100px] p-2 rounded-xl border cursor-pointer transition-all
                ${isCurrentMonth ? 'bg-white border-gray-100' : 'bg-gray-50/50 border-transparent'}
                ${isCurrentDay ? 'ring-2 ring-genesis-blue ring-offset-1' : ''}
                ${isSelected ? 'bg-blue-50' : ''}
                hover:shadow-md hover:border-gray-200
              `}
            >
              {/* Day Number */}
              <div
                className={`text-sm font-bold mb-1 ${
                  isCurrentDay
                    ? 'text-white bg-genesis-blue rounded-full w-6 h-6 flex items-center justify-center'
                    : isCurrentMonth
                      ? 'text-genesis-dark'
                      : 'text-gray-400'
                }`}
              >
                {format(day, 'd')}
              </div>

              {/* Appointment Indicators */}
              <div className="space-y-1">
                {dayAppointments.slice(0, 3).map((app) => {
                  const colors = SPECIALTY_COLORS[app.specialty] || SPECIALTY_COLORS.medicina;
                  return (
                    <div
                      key={app.id}
                      className={`text-[10px] font-medium truncate px-1.5 py-0.5 rounded ${colors.border.replace('border-', 'bg-').replace('-500', '-100')} ${colors.border.replace('border-', 'text-').replace('-500', '-700')}`}
                    >
                      {format(new Date(app.date), 'HH:mm')} {app.patientName.split(' ')[0]}
                    </div>
                  );
                })}
                {dayAppointments.length > 3 && (
                  <div className="text-[10px] text-genesis-medium text-center">
                    +{dayAppointments.length - 3} mais
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
