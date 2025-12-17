/**
 * Agenda Page
 *
 * Calendar view for managing appointments.
 * Supports day/week/month views with date navigation.
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Loader2,
  Calendar,
  X,
  Check,
} from 'lucide-react';
import {
  format,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  startOfWeek,
  isToday,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAppointments } from '../hooks/useAppointments';
import { Status, type SpecialtyType } from '@/types';
import { STATUS_COLORS, SPECIALTY_COLORS, DayView, WeekView, MonthView } from '../components/agenda';

/** Client-side filters for appointments. */
interface LocalFilters {
  statuses: Status[];
  specialties: SpecialtyType[];
}

/** All available statuses. */
const ALL_STATUSES = Object.values(Status);

/** All available specialties with labels. */
const SPECIALTY_LABELS: Record<SpecialtyType, string> = {
  medicina: 'Medicina',
  nutricao: 'Nutrição',
  psicologia: 'Psicologia',
};

/** View modes for the agenda. */
type ViewMode = 'day' | 'week' | 'month';

/**
 * Format a date to YYYY-MM-DD for filtering.
 */
function toDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function Agenda() {
  // Selected date and view mode
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('day');

  // Filter panel state
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState<LocalFilters>({
    statuses: [],
    specialties: [],
  });
  const filterRef = useRef<HTMLDivElement>(null);

  // For week view, we need all appointments (no date filter)
  // For day view, we filter by specific date
  const shouldFilterByDate = viewMode === 'day';

  // Get appointments
  const { appointments, loading, setFilters } = useAppointments(
    shouldFilterByDate ? { date: toDateString(selectedDate) } : {}
  );

  // Working hours (8am to 8pm)
  const hours = Array.from({ length: 13 }, (_, i) => i + 8);

  // Calculate week dates for week view
  const weekDates = useMemo(() => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 }); // Sunday
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [selectedDate]);

  // Week display range (e.g., "15 - 21 de Dezembro")
  const weekDisplay = useMemo(() => {
    const start = weekDates[0];
    const end = weekDates[6];
    if (format(start, 'MMMM', { locale: ptBR }) === format(end, 'MMMM', { locale: ptBR })) {
      return `${format(start, 'd')} - ${format(end, "d 'de' MMMM", { locale: ptBR })}`;
    }
    return `${format(start, "d 'de' MMM", { locale: ptBR })} - ${format(end, "d 'de' MMM", { locale: ptBR })}`;
  }, [weekDates]);

  // Close filter panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    }
    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilters]);

  /**
   * Toggle a status in the filter.
   */
  const toggleStatusFilter = useCallback((status: Status) => {
    setLocalFilters((prev) => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter((s) => s !== status)
        : [...prev.statuses, status],
    }));
  }, []);

  /**
   * Toggle a specialty in the filter.
   */
  const toggleSpecialtyFilter = useCallback((specialty: SpecialtyType) => {
    setLocalFilters((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter((s) => s !== specialty)
        : [...prev.specialties, specialty],
    }));
  }, []);

  /**
   * Clear all local filters.
   */
  const clearLocalFilters = useCallback(() => {
    setLocalFilters({ statuses: [], specialties: [] });
  }, []);

  /**
   * Check if any filter is active.
   */
  const hasActiveFilters = localFilters.statuses.length > 0 || localFilters.specialties.length > 0;

  /**
   * Filter appointments client-side based on local filters.
   */
  const filteredAppointments = useMemo(() => {
    return appointments.filter((app) => {
      // Status filter
      if (localFilters.statuses.length > 0 && !localFilters.statuses.includes(app.status)) {
        return false;
      }
      // Specialty filter
      if (localFilters.specialties.length > 0 && !localFilters.specialties.includes(app.specialty)) {
        return false;
      }
      return true;
    });
  }, [appointments, localFilters]);

  /**
   * Navigate to previous period (day, week, or month based on view mode).
   */
  const goToPrevious = useCallback(() => {
    let newDate: Date;
    switch (viewMode) {
      case 'month': {
        newDate = subMonths(selectedDate, 1);
        break;
      }
      case 'week': {
        newDate = subWeeks(selectedDate, 1);
        break;
      }
      default: {
        newDate = subDays(selectedDate, 1);
      }
    }
    setSelectedDate(newDate);
    if (viewMode === 'day') {
      setFilters({ date: toDateString(newDate) });
    }
  }, [selectedDate, setFilters, viewMode]);

  /**
   * Navigate to next period (day, week, or month based on view mode).
   */
  const goToNext = useCallback(() => {
    let newDate: Date;
    switch (viewMode) {
      case 'month': {
        newDate = addMonths(selectedDate, 1);
        break;
      }
      case 'week': {
        newDate = addWeeks(selectedDate, 1);
        break;
      }
      default: {
        newDate = addDays(selectedDate, 1);
      }
    }
    setSelectedDate(newDate);
    if (viewMode === 'day') {
      setFilters({ date: toDateString(newDate) });
    }
  }, [selectedDate, setFilters, viewMode]);

  /**
   * Navigate to today.
   */
  const goToToday = useCallback(() => {
    const today = new Date();
    setSelectedDate(today);
    if (viewMode === 'day') {
      setFilters({ date: toDateString(today) });
    }
  }, [setFilters, viewMode]);

  /**
   * Handle clicking a day in week view - switches to day view.
   */
  const handleDayClick = useCallback((date: Date) => {
    setSelectedDate(date);
    setViewMode('day');
    setFilters({ date: toDateString(date) });
  }, [setFilters]);

  /**
   * Formatted date display based on view mode.
   */
  const dateDisplay = useMemo(() => {
    switch (viewMode) {
      case 'month':
        return format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR });
      case 'week':
        return weekDisplay;
      default:
        return format(selectedDate, "dd 'de' MMMM", { locale: ptBR });
    }
  }, [selectedDate, viewMode, weekDisplay]);

  /**
   * Check if selected date is today.
   */
  const isSelectedToday = isToday(selectedDate);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-genesis-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-white/60 backdrop-blur-md rounded-3xl border border-white shadow-soft overflow-hidden animate-enter">
      {/* Calendar Header */}
      <div className="p-4 border-b border-white/50 flex justify-between items-center bg-white/80 backdrop-blur-md z-20 sticky top-0 shadow-sm">
        <div className="flex items-center gap-6">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100/80 p-1 rounded-xl shadow-inner">
            <button
              onClick={() => setViewMode('day')}
              className={`px-5 py-1.5 text-xs font-bold rounded-[0.6rem] transition-all ${
                viewMode === 'day'
                  ? 'bg-white shadow-sm text-genesis-dark'
                  : 'text-genesis-medium hover:text-genesis-dark'
              }`}
            >
              Dia
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-5 py-1.5 text-xs font-bold rounded-[0.6rem] transition-all ${
                viewMode === 'week'
                  ? 'bg-white shadow-sm text-genesis-dark'
                  : 'text-genesis-medium hover:text-genesis-dark'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-5 py-1.5 text-xs font-bold rounded-[0.6rem] transition-all ${
                viewMode === 'month'
                  ? 'bg-white shadow-sm text-genesis-dark'
                  : 'text-genesis-medium hover:text-genesis-dark'
              }`}
            >
              Mês
            </button>
          </div>

          {/* Date Navigation */}
          <div className="flex items-center gap-3">
            {/* Today Button */}
            {!isSelectedToday && (
              <button
                onClick={goToToday}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-genesis-blue bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Calendar className="w-3.5 h-3.5" />
                Hoje
              </button>
            )}

            <button
              onClick={goToPrevious}
              className="p-1.5 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200 shadow-sm hover:shadow-md"
            >
              <ChevronLeft className="w-5 h-5 text-genesis-medium" />
            </button>
            <h2 className="text-lg font-bold text-genesis-dark min-w-[200px] text-center tracking-tight flex items-center justify-center gap-2 capitalize">
              {dateDisplay}
              {viewMode === 'day' && isSelectedToday && (
                <span className="text-[10px] font-bold text-genesis-blue bg-blue-50 px-2 py-0.5 rounded-full">
                  HOJE
                </span>
              )}
            </h2>
            <button
              onClick={goToNext}
              className="p-1.5 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200 shadow-sm hover:shadow-md"
            >
              <ChevronRight className="w-5 h-5 text-genesis-medium" />
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          {/* Filter Button + Popover */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-bold transition-colors shadow-sm ${
                hasActiveFilters
                  ? 'border-genesis-blue bg-blue-50 text-genesis-blue'
                  : 'border-gray-200 bg-white text-genesis-dark hover:bg-gray-50'
              }`}
            >
              <Filter className={`w-3.5 h-3.5 ${hasActiveFilters ? 'text-genesis-blue' : 'text-genesis-medium'}`} />
              Filtros
              {hasActiveFilters && (
                <span className="flex items-center justify-center w-5 h-5 bg-genesis-blue text-white text-[10px] font-bold rounded-full">
                  {localFilters.statuses.length + localFilters.specialties.length}
                </span>
              )}
            </button>

            {/* Filter Panel */}
            {showFilters && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-enter">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                  <span className="text-sm font-bold text-genesis-dark">Filtros</span>
                  <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                      <button
                        onClick={clearLocalFilters}
                        className="text-xs font-medium text-genesis-medium hover:text-genesis-dark transition-colors"
                      >
                        Limpar
                      </button>
                    )}
                    <button
                      onClick={() => setShowFilters(false)}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-genesis-medium" />
                    </button>
                  </div>
                </div>

                {/* Status Filters */}
                <div className="p-4 border-b border-gray-100">
                  <p className="text-xs font-bold text-genesis-medium uppercase tracking-wider mb-3">Status</p>
                  <div className="flex flex-wrap gap-2">
                    {ALL_STATUSES.map((status) => {
                      const isActive = localFilters.statuses.includes(status);
                      const colors = STATUS_COLORS[status];
                      return (
                        <button
                          key={status}
                          onClick={() => toggleStatusFilter(status)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            isActive
                              ? `${colors.bg} ${colors.text} ring-2 ring-offset-1 ring-current`
                              : 'bg-gray-100 text-genesis-medium hover:bg-gray-200'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${isActive ? colors.dot : 'bg-gray-400'}`} />
                          {status}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Specialty Filters */}
                <div className="p-4">
                  <p className="text-xs font-bold text-genesis-medium uppercase tracking-wider mb-3">Especialidade</p>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(SPECIALTY_LABELS) as SpecialtyType[]).map((specialty) => {
                      const isActive = localFilters.specialties.includes(specialty);
                      const colors = SPECIALTY_COLORS[specialty];
                      return (
                        <button
                          key={specialty}
                          onClick={() => toggleSpecialtyFilter(specialty)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            isActive
                              ? `${colors.bg.replace('from-', 'bg-').replace('/90 to-white', '')} ${colors.border.replace('border-', 'text-')} ring-2 ring-offset-1 ring-current`
                              : 'bg-gray-100 text-genesis-medium hover:bg-gray-200'
                          }`}
                        >
                          {isActive && <Check className="w-3 h-3" />}
                          {SPECIALTY_LABELS[specialty]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          <button className="flex items-center gap-2 px-5 py-2 bg-genesis-dark text-white rounded-xl text-xs font-bold hover:bg-black shadow-lg shadow-gray-300 transition-all hover:-translate-y-0.5">
            <Plus className="w-4 h-4" /> Nova Consulta
          </button>
        </div>
      </div>

      {/* Calendar Body - Conditional Day/Week View */}
      {viewMode === 'day' && (
        <DayView
          date={selectedDate}
          appointments={filteredAppointments}
          hours={hours}
        />
      )}

      {viewMode === 'week' && (
        <WeekView
          weekDates={weekDates}
          appointments={filteredAppointments}
          onDayClick={handleDayClick}
        />
      )}

      {viewMode === 'month' && (
        <MonthView
          selectedDate={selectedDate}
          appointments={filteredAppointments}
          onDayClick={handleDayClick}
        />
      )}
    </div>
  );
}
