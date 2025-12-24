/**
 * Agenda Page
 *
 * Calendar view for managing appointments.
 * Supports day/week/month views with date navigation.
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Filter, Plus, Loader2, Calendar, X, User, Clock } from 'lucide-react';
import { toast } from 'sonner';
import {
  format,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isToday,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAppointments } from '../hooks/useAppointments';
import { Status, type SpecialtyType, type Appointment } from '@/types';
import {
  DraggableDayView,
  WeekView,
  MonthView,
  FilterPanel,
  AppointmentModal,
  type LocalFilters,
} from '../components/agenda';
import { TelemedicineModal } from '../components/telemedicine';
import { expandRecurringAppointments } from '@/lib/recurrence';
import { usePatients } from '@/hooks/usePatients';
import { Modal } from '@/design-system';

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

  // Telemedicine modal state
  const [telemedicineModalOpen, setTelemedicineModalOpen] = useState(false);
  const [selectedAppointmentForTele, setSelectedAppointmentForTele] = useState<Appointment | null>(null);

  // New appointment modal state
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);

  // For week view, we need all appointments (no date filter)
  // For day view, we filter by specific date
  const shouldFilterByDate = viewMode === 'day';

  // Get appointments
  const { appointments, loading, setFilters, updateAppointment } = useAppointments(
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

  // Calculate the date range for the current view (for recurring expansion)
  const viewDateRange = useMemo(() => {
    switch (viewMode) {
      case 'month': {
        // For month view, we need the full calendar grid (may include days from adjacent months)
        const monthStart = startOfMonth(selectedDate);
        const monthEnd = endOfMonth(selectedDate);
        return {
          start: startOfWeek(monthStart, { weekStartsOn: 0 }),
          end: endOfWeek(monthEnd, { weekStartsOn: 0 }),
        };
      }
      case 'week':
        return {
          start: weekDates[0],
          end: weekDates[6],
        };
      default:
        // Day view: just the selected day
        return {
          start: selectedDate,
          end: selectedDate,
        };
    }
  }, [viewMode, selectedDate, weekDates]);

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
   * Expand recurring appointments and filter based on local filters.
   */
  const filteredAppointments = useMemo(() => {
    // First, expand recurring appointments within the view date range
    const expanded = expandRecurringAppointments(
      appointments,
      viewDateRange.start,
      viewDateRange.end
    );

    // Then apply local filters
    return expanded.filter((app) => {
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
  }, [appointments, localFilters, viewDateRange]);

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
   * Handle drag-and-drop reschedule of an appointment.
   */
  const handleReschedule = useCallback(
    async (appointmentId: string, newDate: Date): Promise<void> => {
      await updateAppointment(appointmentId, { date: newDate.toISOString() });
    },
    [updateAppointment]
  );

  /**
   * Handle starting a telemedicine session from an appointment.
   */
  const handleStartTelemedicine = useCallback((appointment: Appointment) => {
    setSelectedAppointmentForTele(appointment);
    setTelemedicineModalOpen(true);
  }, []);

  /**
   * Handle closing the telemedicine modal.
   */
  const handleCloseTelemedicine = useCallback(() => {
    setTelemedicineModalOpen(false);
    setSelectedAppointmentForTele(null);
  }, []);

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
        <Loader2 className="w-8 h-8 text-genesis-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-genesis-surface/60 backdrop-blur-md rounded-2xl border border-genesis-border-subtle shadow-md overflow-hidden animate-enter">
      {/* Calendar Header */}
      <div className="p-4 border-b border-genesis-border-subtle flex justify-between items-center bg-genesis-surface/80 backdrop-blur-md z-20 sticky top-0 shadow-sm">
        <div className="flex items-center gap-6">
          {/* View Mode Toggle */}
          <div className="flex bg-genesis-hover/80 p-1 rounded-xl shadow-inner">
            <button
              onClick={() => setViewMode('day')}
              className={`px-5 py-1.5 text-xs font-bold rounded-[0.6rem] transition-all ${
                viewMode === 'day'
                  ? 'bg-genesis-surface shadow-sm text-genesis-dark'
                  : 'text-genesis-medium hover:text-genesis-dark'
              }`}
            >
              Dia
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-5 py-1.5 text-xs font-bold rounded-[0.6rem] transition-all ${
                viewMode === 'week'
                  ? 'bg-genesis-surface shadow-sm text-genesis-dark'
                  : 'text-genesis-medium hover:text-genesis-dark'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-5 py-1.5 text-xs font-bold rounded-[0.6rem] transition-all ${
                viewMode === 'month'
                  ? 'bg-genesis-surface shadow-sm text-genesis-dark'
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
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-genesis-primary bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Calendar className="w-3.5 h-3.5" />
                Hoje
              </button>
            )}

            <button
              onClick={goToPrevious}
              className="p-1.5 hover:bg-genesis-surface rounded-lg transition-colors border border-transparent hover:border-genesis-border shadow-sm hover:shadow-md"
            >
              <ChevronLeft className="w-5 h-5 text-genesis-medium" />
            </button>
            <h2 className="text-lg font-bold text-genesis-dark min-w-[200px] text-center tracking-tight flex items-center justify-center gap-2 capitalize">
              {dateDisplay}
              {viewMode === 'day' && isSelectedToday && (
                <span className="text-[10px] font-bold text-genesis-primary bg-blue-50 px-2 py-0.5 rounded-full">
                  HOJE
                </span>
              )}
            </h2>
            <button
              onClick={goToNext}
              className="p-1.5 hover:bg-genesis-surface rounded-lg transition-colors border border-transparent hover:border-genesis-border shadow-sm hover:shadow-md"
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
                  ? 'border-genesis-primary bg-blue-50 text-genesis-primary'
                  : 'border-genesis-border bg-genesis-surface text-genesis-dark hover:bg-genesis-soft'
              }`}
            >
              <Filter className={`w-3.5 h-3.5 ${hasActiveFilters ? 'text-genesis-primary' : 'text-genesis-medium'}`} />
              Filtros
              {hasActiveFilters && (
                <span className="flex items-center justify-center w-5 h-5 bg-genesis-primary text-white text-[10px] font-bold rounded-full">
                  {localFilters.statuses.length + localFilters.specialties.length}
                </span>
              )}
            </button>

            {/* Filter Panel */}
            {showFilters && (
              <FilterPanel
                filters={localFilters}
                onToggleStatus={toggleStatusFilter}
                onToggleSpecialty={toggleSpecialtyFilter}
                onClear={clearLocalFilters}
                onClose={() => setShowFilters(false)}
              />
            )}
          </div>

          <button
            onClick={() => setAppointmentModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2 bg-genesis-dark text-white rounded-xl text-xs font-bold hover:bg-black shadow-lg shadow-genesis-medium/30 transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" /> Nova Consulta
          </button>
        </div>
      </div>

      {/* Calendar Body - Conditional Day/Week View */}
      {viewMode === 'day' && (
        <DraggableDayView
          date={selectedDate}
          appointments={filteredAppointments}
          hours={hours}
          onReschedule={handleReschedule}
          onStartTelemedicine={handleStartTelemedicine}
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

      {/* Telemedicine Modal */}
      {selectedAppointmentForTele && (
        <TelemedicineModal
          isOpen={telemedicineModalOpen}
          onClose={handleCloseTelemedicine}
          appointmentData={{
            appointmentId: selectedAppointmentForTele.id,
            patientId: selectedAppointmentForTele.patientId,
            patientName: selectedAppointmentForTele.patientName,
            scheduledAt: selectedAppointmentForTele.date,
          }}
        />
      )}

      {/* New Appointment Modal */}
      <AppointmentModal
        isOpen={appointmentModalOpen}
        onClose={() => setAppointmentModalOpen(false)}
        initialDate={selectedDate}
      />
    </div>
  );
}
