/**
 * RecurrenceSelector Component
 *
 * UI component for configuring appointment recurrence patterns.
 * Allows users to set frequency, end date, and days of week.
 */

import React, { useCallback } from 'react';
import { Repeat, Calendar, X } from 'lucide-react';
import { format, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { RecurrencePattern, RecurrenceFrequency } from '@/types';

interface RecurrenceSelectorProps {
  /** Current recurrence pattern (null if not recurring) */
  value: RecurrencePattern | null;
  /** Callback when recurrence changes */
  onChange: (pattern: RecurrencePattern | null) => void;
  /** The appointment start date (for weekly day calculation) */
  appointmentDate?: Date;
}

/** Frequency options with labels. */
const FREQUENCY_OPTIONS: { value: RecurrenceFrequency; label: string }[] = [
  { value: 'daily', label: 'Diariamente' },
  { value: 'weekly', label: 'Semanalmente' },
  { value: 'biweekly', label: 'Quinzenalmente' },
  { value: 'monthly', label: 'Mensalmente' },
];

/** Days of week with labels (Portuguese). */
const DAYS_OF_WEEK = [
  { value: 0, label: 'D', fullLabel: 'Domingo' },
  { value: 1, label: 'S', fullLabel: 'Segunda' },
  { value: 2, label: 'T', fullLabel: 'Terça' },
  { value: 3, label: 'Q', fullLabel: 'Quarta' },
  { value: 4, label: 'Q', fullLabel: 'Quinta' },
  { value: 5, label: 'S', fullLabel: 'Sexta' },
  { value: 6, label: 'S', fullLabel: 'Sábado' },
];

/**
 * Recurrence selector for appointment forms.
 */
export function RecurrenceSelector({
  value,
  onChange,
  appointmentDate,
}: RecurrenceSelectorProps) {
  // Track whether recurrence is enabled
  const isEnabled = value !== null;

  // Default end date is 3 months from now
  const defaultEndDate = format(addMonths(new Date(), 3), 'yyyy-MM-dd');

  /**
   * Toggle recurrence on/off.
   */
  const toggleRecurrence = useCallback(() => {
    if (isEnabled) {
      onChange(null);
    } else {
      // Enable with default weekly pattern
      const dayOfWeek = appointmentDate ? appointmentDate.getDay() : new Date().getDay();
      onChange({
        frequency: 'weekly',
        endDate: defaultEndDate,
        daysOfWeek: [dayOfWeek],
      });
    }
  }, [isEnabled, onChange, appointmentDate, defaultEndDate]);

  /**
   * Update the frequency.
   */
  const updateFrequency = useCallback(
    (frequency: RecurrenceFrequency) => {
      if (!value) return;
      onChange({
        ...value,
        frequency,
        // Reset daysOfWeek when switching away from weekly
        daysOfWeek: frequency === 'weekly' ? value.daysOfWeek : undefined,
      });
    },
    [value, onChange]
  );

  /**
   * Update the end date.
   */
  const updateEndDate = useCallback(
    (endDate: string | null) => {
      if (!value) return;
      onChange({
        ...value,
        endDate,
      });
    },
    [value, onChange]
  );

  /**
   * Toggle a day of week for weekly recurrence.
   */
  const toggleDayOfWeek = useCallback(
    (day: number) => {
      if (!value || value.frequency !== 'weekly') return;
      const currentDays = value.daysOfWeek || [];
      const newDays = currentDays.includes(day)
        ? currentDays.filter((d) => d !== day)
        : [...currentDays, day].sort();

      // Ensure at least one day is selected
      if (newDays.length === 0) return;

      onChange({
        ...value,
        daysOfWeek: newDays,
      });
    },
    [value, onChange]
  );

  return (
    <div className="space-y-4">
      {/* Toggle Button */}
      <button
        type="button"
        onClick={toggleRecurrence}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
          isEnabled
            ? 'bg-genesis-blue text-white shadow-lg shadow-blue-200'
            : 'bg-gray-100 text-genesis-medium hover:bg-gray-200'
        }`}
      >
        <Repeat className={`w-4 h-4 ${isEnabled ? 'animate-pulse' : ''}`} />
        {isEnabled ? 'Consulta Recorrente' : 'Tornar Recorrente'}
      </button>

      {/* Recurrence Options (when enabled) */}
      {isEnabled && value && (
        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 space-y-4 animate-enter">
          {/* Frequency Selection */}
          <div>
            <label className="block text-xs font-bold text-genesis-medium uppercase tracking-wider mb-2">
              Frequência
            </label>
            <div className="flex flex-wrap gap-2">
              {FREQUENCY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateFrequency(option.value)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    value.frequency === option.value
                      ? 'bg-genesis-blue text-white shadow-md'
                      : 'bg-white text-genesis-medium hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Days of Week (only for weekly) */}
          {value.frequency === 'weekly' && (
            <div>
              <label className="block text-xs font-bold text-genesis-medium uppercase tracking-wider mb-2">
                Dias da Semana
              </label>
              <div className="flex gap-1">
                {DAYS_OF_WEEK.map((day) => {
                  const isSelected = value.daysOfWeek?.includes(day.value) || false;
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDayOfWeek(day.value)}
                      title={day.fullLabel}
                      className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-genesis-blue text-white shadow-md'
                          : 'bg-white text-genesis-medium hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* End Date */}
          <div>
            <label className="block text-xs font-bold text-genesis-medium uppercase tracking-wider mb-2">
              Repetir até
            </label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-genesis-medium" />
                <input
                  type="date"
                  value={value.endDate || ''}
                  onChange={(e) => updateEndDate(e.target.value || null)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="w-full pl-10 pr-4 py-2.5 text-sm font-medium bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-genesis-blue focus:border-transparent outline-none transition-all"
                />
              </div>
              {value.endDate && (
                <button
                  type="button"
                  onClick={() => updateEndDate(null)}
                  className="p-2 text-genesis-medium hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remover data limite"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {!value.endDate && (
              <p className="text-xs text-genesis-medium mt-1">
                Sem data limite (repetirá indefinidamente)
              </p>
            )}
          </div>

          {/* Preview */}
          <div className="pt-3 border-t border-blue-200/50">
            <p className="text-xs text-genesis-dark font-medium">
              <span className="text-genesis-blue font-bold">Resumo:</span>{' '}
              {getRecurrenceSummary(value, appointmentDate)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Generate a human-readable summary of the recurrence pattern.
 */
function getRecurrenceSummary(pattern: RecurrencePattern, _startDate?: Date): string {
  const frequencyText: Record<RecurrenceFrequency, string> = {
    daily: 'Todos os dias',
    weekly: 'Toda semana',
    biweekly: 'A cada 2 semanas',
    monthly: 'Todo mês',
  };

  let summary = frequencyText[pattern.frequency];

  // Add days of week for weekly
  if (pattern.frequency === 'weekly' && pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
    const dayNames = pattern.daysOfWeek.map((d) => DAYS_OF_WEEK[d].fullLabel);
    if (dayNames.length === 1) {
      summary = `Toda ${dayNames[0]}`;
    } else {
      summary = `Às ${dayNames.slice(0, -1).join(', ')} e ${dayNames[dayNames.length - 1]}`;
    }
  }

  // Add end date
  if (pattern.endDate) {
    const endDateFormatted = format(new Date(pattern.endDate), "d 'de' MMMM 'de' yyyy", {
      locale: ptBR,
    });
    summary += ` até ${endDateFormatted}`;
  } else {
    summary += ' (sem limite)';
  }

  return summary;
}

export default RecurrenceSelector;
