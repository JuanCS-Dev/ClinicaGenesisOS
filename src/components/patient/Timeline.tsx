import React from 'react';
import { TimelineEvent, TimelineEventType } from '../../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileText, Stethoscope, Pill, Camera, DollarSign, ChevronRight } from 'lucide-react';

const EventIcon = ({ type }: { type: TimelineEventType }) => {
  switch (type) {
    case TimelineEventType.CONSULTATION: return <Stethoscope className="w-3.5 h-3.5 text-white" />;
    case TimelineEventType.EXAM: return <FileText className="w-3.5 h-3.5 text-white" />;
    case TimelineEventType.PRESCRIPTION: return <Pill className="w-3.5 h-3.5 text-white" />;
    case TimelineEventType.PHOTO: return <Camera className="w-3.5 h-3.5 text-white" />;
    case TimelineEventType.PAYMENT: return <DollarSign className="w-3.5 h-3.5 text-white" />;
    default: return <div className="w-2 h-2 bg-genesis-surface rounded-full" />;
  }
};

const EventGradient = (type: TimelineEventType) => {
  switch (type) {
    case TimelineEventType.CONSULTATION: return 'from-blue-500 to-blue-600 shadow-blue-200';
    case TimelineEventType.EXAM: return 'from-cyan-400 to-cyan-500 shadow-cyan-200';
    case TimelineEventType.PRESCRIPTION: return 'from-purple-500 to-purple-600 shadow-purple-200';
    case TimelineEventType.PHOTO: return 'from-orange-400 to-orange-500 shadow-orange-200';
    case TimelineEventType.PAYMENT: return 'from-gray-500 to-gray-600 shadow-genesis-medium/20';
    default: return 'from-gray-400 to-gray-500';
  }
};

interface TimelineProps {
  events: TimelineEvent[];
}

export const Timeline: React.FC<TimelineProps> = ({ events }) => {
  return (
    <div className="relative pl-8 py-2">
      {/* Vertical Line - Ultra thin */}
      <div className="absolute left-[15px] top-0 bottom-0 w-[1px] bg-gradient-to-b from-gray-200 via-gray-200 to-transparent"></div>

      <div className="space-y-10">
        {events.map((event) => (
          <div key={event.id} className="relative group">
            {/* Dot/Icon with Gradient and Glow */}
            <div className={`
              absolute -left-[31px] top-1 w-8 h-8 rounded-full border-[3px] border-white 
              bg-gradient-to-br ${EventGradient(event.type)} shadow-lg
              flex items-center justify-center z-10 transition-transform duration-300 group-hover:scale-110
            `}>
              <EventIcon type={event.type} />
            </div>

            {/* Content Card - Minimalist */}
            <div className="bg-genesis-surface border border-genesis-border-subtle rounded-2xl p-5 shadow-sm hover:shadow-float transition-all duration-300 cursor-pointer ml-2 group-hover:border-blue-100/50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-bold text-genesis-medium uppercase tracking-widest">
                  {format(event.date, "dd MMM yyyy", { locale: ptBR })}
                </span>
                <span className="text-[10px] font-semibold text-genesis-medium/70 uppercase border border-genesis-border-subtle bg-genesis-soft px-2 py-0.5 rounded-full">
                  {event.type}
                </span>
              </div>
              
              <h4 className="text-base font-bold text-genesis-dark mb-1.5 flex items-center gap-2 group-hover:text-genesis-primary transition-colors">
                {event.title}
                <ChevronRight className="w-4 h-4 text-genesis-medium opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </h4>
              <p className="text-sm text-genesis-medium leading-relaxed font-normal">
                {event.description}
              </p>

              {event.type === TimelineEventType.PHOTO && event.details && (
                <div className="mt-4 overflow-hidden rounded-xl border border-genesis-border-subtle shadow-sm relative group/img">
                  <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors z-10" />
                  <img src={event.details} alt="Evolução" loading="lazy" className="w-40 h-28 object-cover transform group-hover/img:scale-105 transition-transform duration-500" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};