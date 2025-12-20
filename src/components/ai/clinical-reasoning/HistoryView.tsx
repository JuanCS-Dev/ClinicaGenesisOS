/**
 * HistoryView Component
 *
 * Displays history of lab analysis sessions for a patient.
 */

import React from 'react';
import { History, FlaskConical, ChevronRight } from 'lucide-react';
import type { LabAnalysisResult } from '../../../types';

interface HistorySession {
  id: string;
  createdAt: string | Date;
  status: string;
  result?: LabAnalysisResult;
}

interface HistoryViewProps {
  sessions: HistorySession[];
  onClose: () => void;
}

/**
 * History view showing previous lab analyses.
 */
export function HistoryView({ sessions, onClose }: HistoryViewProps) {
  return (
    <div className="max-w-2xl mx-auto animate-[fadeIn_0.3s_ease-out]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Análises Anteriores
        </h3>
        <button
          onClick={onClose}
          className="text-sm text-[#4F46E5] hover:text-[#4338CA] font-medium"
        >
          Voltar
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-12">
          <div className="p-4 bg-gray-100 rounded-2xl w-fit mx-auto mb-4">
            <History className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500">Nenhuma análise anterior encontrada</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="
                p-4 bg-white rounded-xl border border-gray-100
                hover:shadow-lg hover:border-gray-200
                cursor-pointer transition-all duration-200
              "
              onClick={onClose}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#EEF2FF] rounded-lg">
                    <FlaskConical className="w-5 h-5 text-[#4F46E5]" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(session.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-gray-500">
                      {session.result
                        ? `${session.result.markers.length} marcadores analisados`
                        : session.status}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HistoryView;
