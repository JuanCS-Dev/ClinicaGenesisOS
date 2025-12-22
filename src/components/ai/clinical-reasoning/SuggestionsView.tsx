/**
 * SuggestionsView Component
 *
 * Displays investigative questions and suggested tests.
 */

import React from 'react';
import { Target, FlaskConical, ClipboardList } from 'lucide-react';
import type { LabAnalysisResult } from '../../../types';

interface SuggestionsViewProps {
  result: LabAnalysisResult;
}

/**
 * Suggestions view showing investigative questions and suggested tests.
 */
export function SuggestionsView({ result }: SuggestionsViewProps) {
  return (
    <div className="space-y-6">
      {/* Investigative Questions */}
      {result.investigativeQuestions.length > 0 && (
        <div>
          <h3 className="font-semibold text-genesis-dark mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-[#D97706]" />
            Perguntas Investigativas
          </h3>
          <div className="space-y-3">
            {result.investigativeQuestions.map((q, idx) => (
              <div
                key={idx}
                className="p-4 bg-[#FFFBEB]/50 rounded-xl border border-[#FDE68A]"
              >
                <p className="font-medium text-genesis-dark">{q.question}</p>
                <p className="text-sm text-[#B45309] mt-1">{q.rationale}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Tests */}
      {result.suggestedTests.length > 0 && (
        <div>
          <h3 className="font-semibold text-genesis-dark mb-4 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-[#2563EB]" />
            Exames Sugeridos
          </h3>
          <div className="space-y-3">
            {result.suggestedTests.map((test, idx) => (
              <div
                key={idx}
                className="p-4 bg-genesis-surface rounded-xl border border-genesis-border-subtle hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-genesis-dark">{test.name}</span>
                  <span
                    className={`
                      text-xs font-medium px-2.5 py-1 rounded-full
                      ${
                        test.urgency === 'urgent'
                          ? 'bg-[#FEE2E2] text-[#B91C1C]'
                          : test.urgency === 'routine'
                          ? 'bg-genesis-hover text-genesis-medium'
                          : 'bg-[#DBEAFE] text-[#2563EB]'
                      }
                    `}
                  >
                    {test.urgency === 'urgent'
                      ? 'Urgente'
                      : test.urgency === 'routine'
                      ? 'Rotina'
                      : 'Seguimento'}
                  </span>
                </div>
                <p className="text-sm text-genesis-medium">{test.rationale}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {result.investigativeQuestions.length === 0 && result.suggestedTests.length === 0 && (
        <div className="text-center py-12">
          <div className="p-4 bg-genesis-hover rounded-2xl w-fit mx-auto mb-4">
            <ClipboardList className="w-8 h-8 text-genesis-subtle" />
          </div>
          <p className="text-genesis-muted">Nenhuma sugestão adicional</p>
        </div>
      )}
    </div>
  );
}

export default SuggestionsView;
