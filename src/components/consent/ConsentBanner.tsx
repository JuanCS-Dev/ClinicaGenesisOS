/**
 * Consent Banner Component
 * ========================
 *
 * LGPD consent banner displayed to new users.
 * Allows accepting or customizing data processing consent.
 *
 * Fase 11: LGPD Compliance
 */

import React, { useState } from 'react';
import {
  Shield,
  X,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useConsent } from '../../contexts/ConsentContext';
import {
  PURPOSE_LABELS,
  DATA_CATEGORY_LABELS,
  getLegalBasis,
  isSensitiveCategory,
  type ProcessingPurpose,
  type DataCategory,
} from '@/types/lgpd';

/**
 * Data categories for each purpose.
 */
const PURPOSE_CATEGORIES: Record<ProcessingPurpose, DataCategory[]> = {
  healthcare_provision: ['identification', 'contact', 'health'],
  legal_obligation: ['identification', 'health'],
  vital_interests: ['identification', 'health'],
  legitimate_interest: ['identification', 'behavioral'],
  consent_based: ['identification'],
  marketing: ['contact'],
  analytics: ['behavioral'],
  research: ['health'],
};

/**
 * Consent Banner component.
 */
export const ConsentBanner: React.FC = () => {
  const { showBanner, acceptAll, dismissBanner, loading } = useConsent();
  const [expanded, setExpanded] = useState(false);
  const [accepting, setAccepting] = useState(false);

  // Don't render if banner shouldn't be shown
  if (!showBanner) {
    return null;
  }

  const handleAcceptAll = async () => {
    setAccepting(true);
    try {
      await acceptAll();
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-black/20 to-transparent pointer-events-none">
      <div className="max-w-4xl mx-auto pointer-events-auto">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="p-6 pb-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#4F46E5]/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-[#4F46E5]" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">
                  Sua Privacidade é Nossa Prioridade
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Utilizamos seus dados para prestar serviços de saúde de qualidade.
                  Em conformidade com a LGPD (Lei Geral de Proteção de Dados),
                  precisamos do seu consentimento para processar suas informações.
                </p>
              </div>
              <button
                onClick={dismissBanner}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Fechar banner"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Expandable details */}
          {expanded && (
            <div className="px-6 pb-4 border-t border-gray-100 pt-4">
              <h4 className="font-medium text-gray-900 mb-3">
                Como utilizamos seus dados:
              </h4>
              <div className="space-y-3">
                {(['healthcare_provision', 'legal_obligation'] as ProcessingPurpose[]).map(
                  (purpose) => (
                    <div
                      key={purpose}
                      className="p-3 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                        <span className="font-medium text-gray-900">
                          {PURPOSE_LABELS[purpose]}
                        </span>
                        <span className="text-xs text-gray-500 ml-auto">
                          {getLegalBasis(purpose)}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {PURPOSE_CATEGORIES[purpose].map((category) => (
                          <span
                            key={category}
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              isSensitiveCategory(category)
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            {DATA_CATEGORY_LABELS[category]}
                            {isSensitiveCategory(category) && ' (sensível)'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Rights info */}
              <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                <h5 className="font-medium text-blue-900 text-sm">
                  Seus Direitos (LGPD Art. 18):
                </h5>
                <ul className="mt-2 text-xs text-blue-700 space-y-1">
                  <li>• Acesso e correção dos seus dados</li>
                  <li>• Portabilidade para outro serviço</li>
                  <li>• Exclusão quando não mais necessários</li>
                  <li>• Revogação do consentimento a qualquer momento</li>
                </ul>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="p-4 bg-gray-50 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Menos detalhes
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Ver detalhes
                </>
              )}
            </button>

            <div className="flex-1" />

            <a
              href="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-[#4F46E5] hover:underline"
            >
              Política de Privacidade
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={handleAcceptAll}
              disabled={accepting || loading}
              className="px-6 py-2.5 bg-[#4F46E5] text-white rounded-xl font-medium hover:bg-[#4338CA] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {accepting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Aceitar e Continuar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsentBanner;

