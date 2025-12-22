/**
 * DraggableDayView Component
 *
 * Day view with drag-and-drop support for rescheduling appointments.
 */

import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  useDroppable,
  useDraggable,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { format, setHours, setMinutes, isToday, parseISO } from 'date-fns';
import { AppointmentCard } from './AppointmentCard';
import type { Appointment } from '@/types';

interface DraggableDayViewProps {
  /** The date being displayed */
  date: Date;
  /** Appointments to display (already filtered) */
  appointments: Appointment[];
  /** Working hours to display (e.g., [8, 9, 10, ...20]) */
  hours: number[];
  /** Callback when an appointment is rescheduled */
  onReschedule?: (appointmentId: string, newDate: Date) => Promise<void>;
  /** Callback to start a telemedicine session */
  onStartTelemedicine?: (appointment: Appointment) => void;
}

/**
 * Droppable hour slot component.
 */
function DroppableHourSlot({
  hour,
  children,
  isOver,
}: {
  hour: number;
  children: React.ReactNode;
  isOver: boolean;
}) {
  const { setNodeRef } = useDroppable({ id: `hour-${hour}` });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 relative mx-2 transition-colors ${
        isOver ? 'bg-genesis-primary/10 ring-2 ring-genesis-primary/30 rounded-xl' : ''
      }`}
    >
      {children}
    </div>
  );
}

/**
 * Draggable appointment wrapper.
 */
function DraggableAppointment({
  appointment,
  isDragging,
  onStartTelemedicine,
}: {
  appointment: Appointment;
  isDragging: boolean;
  onStartTelemedicine?: (appointment: Appointment) => void;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: appointment.id,
    data: appointment,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`absolute top-2 left-2 right-4 bottom-2 ${isDragging ? 'opacity-50' : ''}`}
    >
      <AppointmentCard
        appointment={appointment}
        onStartTelemedicine={onStartTelemedicine}
      />
    </div>
  );
}

/**
 * Day view with drag-and-drop support.
 */
export function DraggableDayView({
  date,
  appointments,
  hours,
  onReschedule,
  onStartTelemedicine,
}: DraggableDayViewProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const isCurrentDay = isToday(date);

  // Sensor configuration for pointer/touch drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts
      },
    })
  );

  /**
   * Handle drag start.
   */
  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  /**
   * Handle drag over (for visual feedback).
   */
  function handleDragOver(event: { over: { id: string } | null }) {
    setOverId(event.over?.id?.toString() || null);
  }

  /**
   * Handle drag end - reschedule the appointment.
   */
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    setActiveId(null);
    setOverId(null);

    if (!over || !onReschedule) return;

    const appointmentId = active.id as string;
    const targetHour = parseInt(over.id.toString().replace('hour-', ''), 10);

    if (isNaN(targetHour)) return;

    // Find the appointment being dragged
    const appointment = appointments.find((a) => a.id === appointmentId);
    if (!appointment) return;

    // Get current hour of appointment
    const currentHour = parseISO(appointment.date).getHours();

    // Only update if hour changed
    if (currentHour === targetHour) return;

    // Calculate new date with the target hour
    const originalDate = parseISO(appointment.date);
    const newDate = setMinutes(setHours(date, targetHour), originalDate.getMinutes());

    await onReschedule(appointmentId, newDate);
  }

  // Find active appointment for overlay
  const activeAppointment = activeId
    ? appointments.find((a) => a.id === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 overflow-y-auto relative custom-scrollbar bg-genesis-soft/50">
        {hours.map((hour) => {
          const hourAppointments = appointments.filter(
            (app) => parseISO(app.date).getHours() === hour
          );
          const isOverThisHour = overId === `hour-${hour}`;

          return (
            <div
              key={hour}
              className="flex min-h-[120px] group relative border-b border-genesis-border-subtle/50"
            >
              <div className="w-20 p-3 text-[11px] font-bold text-genesis-medium/70 text-center border-r border-genesis-border-subtle/50 bg-[#F5F5F7]/40 backdrop-blur-sm">
                {hour}:00
              </div>

              <DroppableHourSlot hour={hour} isOver={isOverThisHour}>
                {hourAppointments.map((app) => (
                  <React.Fragment key={app.id}>
                    <DraggableAppointment
                      appointment={app}
                      isDragging={activeId === app.id}
                      onStartTelemedicine={onStartTelemedicine}
                    />
                  </React.Fragment>
                ))}
              </DroppableHourSlot>
            </div>
          );
        })}

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

      {/* Drag Overlay - shows the appointment being dragged */}
      <DragOverlay>
        {activeAppointment && (
          <div className="w-80 opacity-90">
            <AppointmentCard appointment={activeAppointment} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
