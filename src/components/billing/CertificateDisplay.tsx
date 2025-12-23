/**
 * CertificateDisplay Component
 *
 * Displays configured certificate information with status and actions.
 */

import React from 'react';
import {
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  X,
  FileKey,
  Calendar,
  Building2,
} from 'lucide-react';
import type { CertificadoInfo, StatusDisplay } from './certificate-utils';

interface CertificateDisplayProps {
  certificado: CertificadoInfo;
  statusDisplay: StatusDisplay;
  confirmRemove: boolean;
  onUpdateClick: () => void;
  onRemoveClick: () => void;
  onConfirmRemove: () => void;
  onCancelRemove: () => void;
}

/**
 * Displays configured certificate with status and management actions.
 */
export function CertificateDisplay({
  certificado,
  statusDisplay,
  confirmRemove,
  onUpdateClick,
  onRemoveClick,
  onConfirmRemove,
  onCancelRemove,
}: CertificateDisplayProps): React.ReactElement {
  return (
    <div className={`p-4 rounded-xl border ${statusDisplay.bgColor}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <CheckCircle2 className={`w-5 h-5 ${statusDisplay.color} flex-shrink-0 mt-0.5`} />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-genesis-dark">
                Certificado configurado
              </span>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusDisplay.color} ${statusDisplay.bgColor}`}>
                {statusDisplay.label}
              </span>
            </div>

            <div className="mt-3 space-y-2 text-sm">
              {certificado.razaoSocial && (
                <div className="flex items-center gap-2 text-genesis-muted">
                  <Building2 className="w-4 h-4" />
                  {certificado.razaoSocial}
                </div>
              )}
              {certificado.cnpj && (
                <div className="flex items-center gap-2 text-genesis-muted">
                  <FileKey className="w-4 h-4" />
                  CNPJ: {certificado.cnpj}
                </div>
              )}
              {certificado.validoAte && (
                <div className="flex items-center gap-2 text-genesis-muted">
                  <Calendar className="w-4 h-4" />
                  Válido até: {new Date(certificado.validoAte).toLocaleDateString('pt-BR')}
                </div>
              )}
              {certificado.emissor && (
                <div className="text-xs text-genesis-subtle mt-2">
                  Emissor: {certificado.emissor}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={onUpdateClick}
            className="p-2 rounded-lg hover:bg-white/50 text-genesis-muted hover:text-genesis-dark transition-colors"
            title="Atualizar certificado"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {confirmRemove ? (
            <div className="flex items-center gap-1">
              <button
                onClick={onConfirmRemove}
                className="p-2 rounded-lg bg-danger text-white hover:bg-danger/90 transition-colors"
                title="Confirmar remoção"
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
              <button
                onClick={onCancelRemove}
                className="p-2 rounded-lg hover:bg-white/50 text-genesis-muted transition-colors"
                title="Cancelar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onRemoveClick}
              className="p-2 rounded-lg hover:bg-red-100 text-genesis-muted hover:text-danger transition-colors"
              title="Remover certificado"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Warning for expiring/expired */}
      {certificado.status === 'expiring_soon' && (
        <div className="mt-4 p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Seu certificado expira em breve. Renove-o para evitar interrupções no faturamento.
          </p>
        </div>
      )}

      {certificado.status === 'expired' && (
        <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 dark:text-red-200">
            Seu certificado expirou! Faça upload de um novo certificado para continuar enviando guias.
          </p>
        </div>
      )}
    </div>
  );
}
