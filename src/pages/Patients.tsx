/**
 * Patients Page
 *
 * Displays list of all patients in the clinic.
 *
 * PERFORMANCE: Uses TanStack Virtual for 60 FPS scrolling with large patient lists.
 * Only renders visible rows (~15-20) instead of all patients (500+).
 */

import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MoreVertical, Plus, ChevronRight, Loader2 } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { usePatients } from '../hooks/usePatients';

// Row height for virtualization calculations
const ROW_HEIGHT = 72;

export function Patients() {
  const navigate = useNavigate();
  const { patients, loading } = usePatients();
  const [searchTerm, setSearchTerm] = useState('');

  // Ref for the scrollable container (required by TanStack Virtual)
  const parentRef = useRef<HTMLDivElement>(null);

  // Filter patients by name, email, phone, insurance, or tags
  const filteredPatients = useMemo(() => {
    if (!searchTerm.trim()) return patients;

    const term = searchTerm.toLowerCase().trim();
    return patients.filter((patient) => {
      const searchableFields = [
        patient.name,
        patient.email,
        patient.phone,
        patient.insurance,
        ...patient.tags,
      ].filter(Boolean);

      return searchableFields.some((field) =>
        field?.toLowerCase().includes(term)
      );
    });
  }, [patients, searchTerm]);

  // TanStack Virtual - only renders visible rows for 60 FPS scrolling
  const rowVirtualizer = useVirtualizer({
    count: filteredPatients.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5, // Render 5 extra rows above/below viewport for smooth scrolling
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-genesis-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-enter">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-genesis-dark tracking-tight">Pacientes</h1>
          <p className="text-genesis-medium text-sm font-medium">
            Gerencie seus cadastros e histórico clínico.
          </p>
        </div>
        <button
          onClick={() => navigate('/patients/new')}
          className="flex items-center gap-2 px-5 py-2.5 bg-genesis-dark text-white rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg shadow-genesis-medium/20 hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" /> Novo Paciente
        </button>
      </div>

      <div className="bg-genesis-surface rounded-3xl border border-white shadow-soft overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-genesis-border-subtle flex gap-4 bg-genesis-surface/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-genesis-medium group-focus-within:text-genesis-primary transition-colors" />
            <input
              type="text"
              placeholder="Buscar por nome, telefone ou convênio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-genesis-soft border-none rounded-xl text-sm font-medium text-genesis-dark focus:ring-2 focus:ring-genesis-primary/20 focus:bg-genesis-surface transition-all placeholder-gray-400 shadow-inner"
            />
          </div>
          {searchTerm && (
            <span className="text-xs text-genesis-medium self-center">
              {filteredPatients.length} de {patients.length} pacientes
            </span>
          )}
        </div>

        {/* Table */}
        {patients.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-genesis-medium text-sm mb-4">
              Nenhum paciente cadastrado ainda.
            </p>
            <button
              onClick={() => navigate('/patients/new')}
              className="text-genesis-primary font-semibold text-sm hover:underline"
            >
              Cadastrar primeiro paciente
            </button>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-genesis-medium text-sm mb-2">
              Nenhum paciente encontrado para "{searchTerm}"
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="text-genesis-primary font-semibold text-sm hover:underline"
            >
              Limpar busca
            </button>
          </div>
        ) : (
          <>
            {/* Table Header - Fixed */}
            <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 px-6 py-4 bg-genesis-soft/80 border-b border-genesis-border-subtle">
              <div className="font-bold text-genesis-medium uppercase tracking-wider text-[10px]">Nome</div>
              <div className="font-bold text-genesis-medium uppercase tracking-wider text-[10px]">Contato</div>
              <div className="font-bold text-genesis-medium uppercase tracking-wider text-[10px]">Convênio</div>
              <div className="font-bold text-genesis-medium uppercase tracking-wider text-[10px]">Tags</div>
              <div className="w-16" />
            </div>

            {/* Virtualized List - Only renders visible rows */}
            <div
              ref={parentRef}
              className="overflow-auto"
              style={{ height: 'calc(100vh - 320px)', maxHeight: '600px' }}
            >
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const patient = filteredPatients[virtualRow.index];
                  return (
                    <div
                      key={patient.id}
                      className="absolute top-0 left-0 w-full grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 px-6 items-center hover:bg-genesis-soft/80 transition-all cursor-pointer group border-b border-gray-50"
                      style={{
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                      onClick={() => navigate(`/patients/${patient.id}`)}
                    >
                      {/* Name Column */}
                      <div className="flex items-center gap-4">
                        <div className="relative flex-shrink-0">
                          <img
                            src={
                              patient.avatar ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name)}`
                            }
                            alt={patient.name}
                            loading="lazy"
                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-genesis-dark text-sm group-hover:text-genesis-primary transition-colors truncate">
                            {patient.name}
                          </p>
                          <p className="text-[11px] font-medium text-genesis-medium">
                            {patient.age} anos
                          </p>
                        </div>
                      </div>

                      {/* Contact Column */}
                      <div className="min-w-0">
                        <p className="font-semibold text-genesis-dark text-xs truncate">{patient.phone}</p>
                        <p className="text-[11px] text-genesis-medium truncate">{patient.email}</p>
                      </div>

                      {/* Insurance Column */}
                      <div className="w-24">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide bg-genesis-hover text-genesis-medium border border-genesis-border truncate max-w-full">
                          {patient.insurance || 'Particular'}
                        </span>
                      </div>

                      {/* Tags Column */}
                      <div className="flex gap-2 w-32 overflow-hidden">
                        {patient.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 bg-genesis-surface border border-genesis-border-subtle text-genesis-medium text-[10px] font-bold rounded-md uppercase tracking-wide shadow-sm truncate"
                          >
                            {tag}
                          </span>
                        ))}
                        {patient.tags.length > 2 && (
                          <span className="text-[10px] text-genesis-medium">+{patient.tags.length - 2}</span>
                        )}
                      </div>

                      {/* Actions Column */}
                      <div className="w-16 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-2 text-genesis-subtle hover:text-genesis-dark hover:bg-genesis-surface rounded-full transition-all shadow-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        <ChevronRight className="w-4 h-4 text-genesis-subtle" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
