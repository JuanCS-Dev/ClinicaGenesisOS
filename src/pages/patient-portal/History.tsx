/**
 * Patient Portal - Medical History
 * ================================
 *
 * View complete medical history and records.
 *
 * @module pages/patient-portal/History
 * @version 1.0.0
 */

import React from 'react';
import { FileText, Calendar, User, ChevronRight, Download } from 'lucide-react';

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_RECORDS = [
  {
    id: '1',
    date: '2024-12-15',
    type: 'Consulta',
    provider: 'Dr. João Silva',
    specialty: 'Clínica Geral',
    summary: 'Consulta de rotina. Paciente em bom estado geral.',
  },
  {
    id: '2',
    date: '2024-11-20',
    type: 'Consulta',
    provider: 'Dra. Maria Santos',
    specialty: 'Cardiologia',
    summary: 'Avaliação cardiológica. ECG normal.',
  },
  {
    id: '3',
    date: '2024-10-01',
    type: 'Consulta',
    provider: 'Dr. João Silva',
    specialty: 'Clínica Geral',
    summary: 'Quadro gripal. Prescrito tratamento sintomático.',
  },
  {
    id: '4',
    date: '2024-08-15',
    type: 'Exame',
    provider: 'Laboratório',
    specialty: 'Exames',
    summary: 'Check-up anual completo.',
  },
];

// ============================================================================
// Main Component
// ============================================================================

export function PatientHistory(): React.ReactElement {
  return (
    <div className="space-y-6 animate-enter pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-genesis-dark flex items-center gap-3">
            <FileText className="w-7 h-7 text-blue-600" />
            Meu Histórico
          </h1>
          <p className="text-genesis-muted text-sm mt-1">
            Histórico completo de atendimentos e prontuário
          </p>
        </div>

        <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-genesis-border text-genesis-medium font-medium hover:bg-genesis-hover hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
          <Download className="w-5 h-5" />
          Exportar Histórico
        </button>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {MOCK_RECORDS.map((record, index) => (
          <div
            key={record.id}
            className="relative pl-8 before:absolute before:left-3 before:top-0 before:bottom-0 before:w-px before:bg-genesis-border"
          >
            {/* Timeline Dot */}
            <div className="absolute left-0 top-4 w-6 h-6 rounded-full bg-genesis-primary flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>

            {/* Card */}
            <div className="bg-white dark:bg-genesis-surface rounded-2xl border border-genesis-border p-4 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-info-soft text-info">
                      {record.type}
                    </span>
                    <span className="text-xs text-genesis-muted flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(record.date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="font-medium text-genesis-dark flex items-center gap-2">
                    <User className="w-4 h-4 text-genesis-muted" />
                    {record.provider}
                  </p>
                  <p className="text-sm text-genesis-muted">{record.specialty}</p>
                  <p className="text-sm text-genesis-medium mt-2">{record.summary}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-genesis-muted flex-shrink-0" />
              </div>
            </div>

            {/* Last item doesn't need the line continuing */}
            {index === MOCK_RECORDS.length - 1 && (
              <div className="absolute left-0 bottom-0 w-6 h-4 bg-genesis-soft" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default PatientHistory;
