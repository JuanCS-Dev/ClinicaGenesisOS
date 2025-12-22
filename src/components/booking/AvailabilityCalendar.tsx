/**
 * AvailabilityCalendar Component
 *
 * Displays available time slots for booking.
 * Inspired by Zocdoc and Jane App slot selection.
 *
 * Features:
 * - Week view with day navigation
 * - Time slot grid with availability
 * - Visual feedback for selection
 * - Mobile-optimized layout
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import {
  format,
  addDays,
  startOfWeek,
  isSameDay,
  isToday,
  isBefore,
  parseISO,
  setHours,
  setMinutes,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * A single time slot.
 */
export interface TimeSlot {
  /** ISO datetime string */
  datetime: string;
  /** Whether the slot is available */
  available: boolean;
}

/**
 * A day with its available slots.
 */
export interface DayAvailability {
  date: Date;
  slots: TimeSlot[];
}

interface AvailabilityCalendarProps {
  /** Available slots grouped by day */
  availability: DayAvailability[];
  /** Currently selected slot */
  selectedSlot?: string;
  /** Callback when a slot is selected */
  onSelectSlot: (datetime: string) => void;
  /** Loading state */
  loading?: boolean;
  /** Working hours config */
  workingHours?: {
    start: number; // Hour (e.g., 8)
    end: number; // Hour (e.g., 18)
    slotDuration: number; // Minutes
  };
}

/**
 * Default working hours.
 */
const DEFAULT_WORKING_HOURS = {
  start: 8,
  end: 18,
  slotDuration: 30,
};

/**
 * Generate time slots for a day based on working hours.
 */
export function generateDaySlots(
  date: Date,
  workingHours = DEFAULT_WORKING_HOURS,
  bookedSlots: string[] = []
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const { start, end, slotDuration } = workingHours;

  for (let hour = start; hour < end; hour++) {
    for (let minute = 0; minute < 60; minute += slotDuration) {
      const slotDate = setMinutes(setHours(date, hour), minute);
      const datetime = slotDate.toISOString();

      // Check if slot is in the past or already booked
      const isPast = isBefore(slotDate, new Date());
      const isBooked = bookedSlots.includes(datetime);

      slots.push({
        datetime,
        available: !isPast && !isBooked,
      });
    }
  }

  return slots;
}

/**
 * Day column component.
 */
const DayColumn: React.FC<{
  day: DayAvailability;
  selectedSlot?: string;
  onSelectSlot: (datetime: string) => void;
}> = ({ day, selectedSlot, onSelectSlot }) => {
  const dayIsToday = isToday(day.date);
  const availableCount = day.slots.filter((s) => s.available).length;

  return (
    <div className="flex-1 min-w-[100px]">
      {/* Day Header */}
      <div
        className={`
          text-center p-3 border-b border-genesis-border-subtle sticky top-0
          ${dayIsToday ? 'bg-genesis-primary/5' : 'bg-genesis-surface'}
        `}
      >
        <p className="text-[10px] font-bold text-genesis-muted uppercase">
          {format(day.date, 'EEE', { locale: ptBR })}
        </p>
        <p
          className={`
            text-lg font-bold mt-0.5
            ${dayIsToday ? 'text-genesis-primary' : 'text-genesis-dark'}
          `}
        >
          {format(day.date, 'd')}
        </p>
        <p className="text-[10px] text-genesis-muted mt-0.5">
          {availableCount > 0 ? `${availableCount} horários` : 'Sem vagas'}
        </p>
      </div>

      {/* Time Slots */}
      <div className="p-2 space-y-1.5">
        {day.slots.map((slot) => {
          const isSelected = selectedSlot === slot.datetime;
          const time = format(parseISO(slot.datetime), 'HH:mm');

          return (
            <button
              key={slot.datetime}
              onClick={() => slot.available && onSelectSlot(slot.datetime)}
              disabled={!slot.available}
              className={`
                w-full py-2 px-3 rounded-lg text-sm font-medium transition-all
                ${
                  isSelected
                    ? 'bg-genesis-primary text-white shadow-md'
                    : slot.available
                      ? 'bg-genesis-soft text-genesis-dark hover:bg-genesis-primary/10 hover:text-genesis-primary'
                      : 'bg-genesis-border-subtle/50 text-genesis-subtle cursor-not-allowed line-through'
                }
              `}
            >
              {time}
            </button>
          );
        })}

        {day.slots.length === 0 && (
          <p className="text-center text-xs text-genesis-muted py-4">
            Indisponível
          </p>
        )}
      </div>
    </div>
  );
};

/**
 * Skeleton loader for availability calendar.
 */
function AvailabilityCalendarSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex justify-between items-center mb-4">
        <div className="h-8 w-32 bg-genesis-soft rounded" />
        <div className="flex gap-2">
          <div className="h-10 w-10 bg-genesis-soft rounded-lg" />
          <div className="h-10 w-10 bg-genesis-soft rounded-lg" />
        </div>
      </div>
      <div className="flex gap-2 overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex-1 min-w-[100px]">
            <div className="h-20 bg-genesis-soft rounded-t-lg" />
            <div className="space-y-2 p-2">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-10 bg-genesis-soft rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Availability calendar with week navigation.
 *
 * @example
 * <AvailabilityCalendar
 *   availability={weekAvailability}
 *   selectedSlot={selectedSlot}
 *   onSelectSlot={(slot) => setSelectedSlot(slot)}
 * />
 */
export function AvailabilityCalendar({
  availability,
  selectedSlot,
  onSelectSlot,
  loading = false,
}: AvailabilityCalendarProps): React.ReactElement {
  const [weekOffset, setWeekOffset] = useState(0);

  // Calculate current week start
  const weekStart = useMemo(() => {
    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    return addDays(start, weekOffset * 7);
  }, [weekOffset]);

  // Get days for current week (excluding weekends for now)
  const weekDays = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  // Filter availability for current week
  const weekAvailability = useMemo(() => {
    return weekDays.map((date) => {
      const dayData = availability.find((d) => isSameDay(d.date, date));
      return dayData || { date, slots: [] };
    });
  }, [weekDays, availability]);

  // Navigation handlers
  const goToPreviousWeek = useCallback(() => {
    if (weekOffset > 0) {
      setWeekOffset((prev) => prev - 1);
    }
  }, [weekOffset]);

  const goToNextWeek = useCallback(() => {
    setWeekOffset((prev) => prev + 1);
  }, []);

  if (loading) {
    return <AvailabilityCalendarSkeleton />;
  }

  // Check if any slots are available this week
  const hasAvailableSlots = weekAvailability.some((day) =>
    day.slots.some((slot) => slot.available)
  );

  return (
    <div>
      {/* Header with navigation */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-semibold text-genesis-dark">
            {format(weekStart, "MMMM 'de' yyyy", { locale: ptBR })}
          </h3>
          <p className="text-xs text-genesis-muted">
            Semana de {format(weekStart, 'd', { locale: ptBR })} a{' '}
            {format(addDays(weekStart, 4), 'd', { locale: ptBR })}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={goToPreviousWeek}
            disabled={weekOffset === 0}
            className={`
              p-2.5 rounded-lg border transition-all
              ${
                weekOffset === 0
                  ? 'border-genesis-border-subtle text-genesis-subtle cursor-not-allowed'
                  : 'border-genesis-border text-genesis-dark hover:bg-genesis-hover'
              }
            `}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNextWeek}
            className="p-2.5 rounded-lg border border-genesis-border text-genesis-dark hover:bg-genesis-hover transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Week Grid */}
      <div className="bg-genesis-surface rounded-2xl border border-genesis-border-subtle overflow-hidden">
        {!hasAvailableSlots ? (
          <div className="p-8 text-center">
            <Calendar className="w-12 h-12 text-genesis-muted mx-auto mb-3 opacity-50" />
            <p className="text-genesis-muted font-medium">
              Nenhum horário disponível nesta semana.
            </p>
            <button
              onClick={goToNextWeek}
              className="mt-4 text-sm text-genesis-primary font-semibold hover:underline"
            >
              Ver próxima semana
            </button>
          </div>
        ) : (
          <div className="flex overflow-x-auto">
            {weekAvailability.map((day) => (
              <DayColumn
                key={day.date.toISOString()}
                day={day}
                selectedSlot={selectedSlot}
                onSelectSlot={onSelectSlot}
              />
            ))}
          </div>
        )}
      </div>

      {/* Selected slot confirmation */}
      {selectedSlot && (
        <div className="mt-4 p-4 bg-genesis-primary/5 border border-genesis-primary/20 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-genesis-primary flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-genesis-dark">
              Horário selecionado
            </p>
            <p className="text-sm text-genesis-medium">
              {format(parseISO(selectedSlot), "EEEE, d 'de' MMMM 'às' HH:mm", {
                locale: ptBR,
              })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AvailabilityCalendar;
