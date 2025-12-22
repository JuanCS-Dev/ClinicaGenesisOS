/**
 * PrescriptionPreview Component
 *
 * Displays a prescription in a visual preview format.
 * Shows patient info, medications, and status with action buttons.
 */

import { useMemo } from 'react';
import {
  FileText,
  Pill,
  Calendar,
  Clock,
  CheckCircle2,
  Send,
  XCircle,
  Printer,
  AlertTriangle,
  Eye,
  Package,
  User,
  BadgeCheck,
} from 'lucide-react';
import type { Prescription, PrescriptionPreviewProps } from '@/types';
import { PRESCRIPTION_STATUS_LABELS, PRESCRIPTION_TYPE_LABELS } from '@/types';

/**
 * Get status color and icon.
 */
function getStatusConfig(status: Prescription['status']) {
  const configs = {
    draft: { color: 'text-genesis-muted bg-genesis-hover', icon: FileText },
    pending_signature: { color: 'text-amber-600 bg-amber-100', icon: Clock },
    signed: { color: 'text-blue-600 bg-blue-100', icon: BadgeCheck },
    sent: { color: 'text-purple-600 bg-purple-100', icon: Send },
    viewed: { color: 'text-indigo-600 bg-indigo-100', icon: Eye },
    filled: { color: 'text-emerald-600 bg-emerald-100', icon: Package },
    expired: { color: 'text-red-600 bg-red-100', icon: XCircle },
    canceled: { color: 'text-red-600 bg-red-100', icon: XCircle },
  };
  return configs[status];
}

/**
 * Format date to Brazilian format.
 */
function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * PrescriptionPreview - Visual prescription display.
 */
export function PrescriptionPreview({
  prescription,
  compact = false,
  showActions = true,
  onSign,
  onSend,
  onCancel,
  onPrint,
}: PrescriptionPreviewProps) {
  const statusConfig = useMemo(() => getStatusConfig(prescription.status), [prescription.status]);
  const StatusIcon = statusConfig.icon;

  const hasControlled = useMemo(
    () => prescription.medications.some((m) => m.isControlled),
    [prescription.medications]
  );

  const isExpired = useMemo(() => new Date(prescription.expiresAt) < new Date(), [prescription.expiresAt]);

  if (compact) {
    return (
      <div className="flex items-center gap-4 p-4 bg-genesis-surface rounded-xl border border-genesis-border hover:border-blue-300 transition-colors">
        <div className={`p-2 rounded-lg ${statusConfig.color}`}>
          <StatusIcon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-genesis-dark">{prescription.patientName}</span>
            {hasControlled && (
              <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded">
                Controlado
              </span>
            )}
          </div>
          <div className="text-sm text-genesis-muted">
            {prescription.medications.length} medicamento(s) • {formatDate(prescription.prescribedAt)}
          </div>
        </div>

        <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusConfig.color}`}>
          {PRESCRIPTION_STATUS_LABELS[prescription.status]}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-genesis-surface rounded-2xl border border-genesis-border overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-genesis-border-subtle">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${statusConfig.color}`}>
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-genesis-dark text-lg">
                {PRESCRIPTION_TYPE_LABELS[prescription.type]}
              </h3>
              <p className="text-sm text-genesis-muted">
                Código: {prescription.validationCode}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1.5 text-sm font-medium rounded-full ${statusConfig.color}`}>
              <StatusIcon className="w-4 h-4 inline mr-1.5" />
              {PRESCRIPTION_STATUS_LABELS[prescription.status]}
            </span>
            {isExpired && prescription.status !== 'expired' && (
              <span className="px-3 py-1.5 text-sm font-medium rounded-full bg-red-100 text-red-600">
                Expirada
              </span>
            )}
          </div>
        </div>

        {/* Patient & Professional Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-genesis-soft rounded-lg">
            <User className="w-5 h-5 text-genesis-subtle" />
            <div>
              <div className="text-sm text-genesis-muted">Paciente</div>
              <div className="font-medium text-genesis-dark">{prescription.patientName}</div>
              {prescription.patientCpf && (
                <div className="text-xs text-genesis-subtle">CPF: {prescription.patientCpf}</div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-genesis-soft rounded-lg">
            <BadgeCheck className="w-5 h-5 text-genesis-subtle" />
            <div>
              <div className="text-sm text-genesis-muted">Profissional</div>
              <div className="font-medium text-genesis-dark">{prescription.professionalName}</div>
              <div className="text-xs text-genesis-subtle">
                CRM {prescription.professionalCrm}/{prescription.professionalCrmState}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Medications */}
      <div className="p-6 border-b border-genesis-border-subtle">
        <h4 className="font-medium text-genesis-dark mb-4 flex items-center gap-2">
          <Pill className="w-5 h-5 text-blue-500" />
          Medicamentos ({prescription.medications.length})
        </h4>

        <div className="space-y-3">
          {prescription.medications.map((med, index) => (
            <div
              key={med.id || index}
              className={`p-4 rounded-xl border ${
                med.isControlled ? 'border-amber-200 bg-amber-50' : 'border-genesis-border-subtle bg-genesis-soft'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-genesis-dark">{med.name}</span>
                    {med.isControlled && med.controlType && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-amber-200 text-amber-800 rounded">
                        {med.controlType}
                      </span>
                    )}
                    {med.continuousUse && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                        Uso contínuo
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-genesis-medium space-y-0.5">
                    <p>
                      <span className="text-genesis-subtle">Posologia:</span> {med.dosage} - {med.frequency}
                    </p>
                    <p>
                      <span className="text-genesis-subtle">Duração:</span> {med.duration}
                    </p>
                    <p>
                      <span className="text-genesis-subtle">Quantidade:</span> {med.quantity} {med.unit}
                    </p>
                    {med.instructions && (
                      <p className="text-genesis-muted italic mt-1">{med.instructions}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {hasControlled && (
          <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              Esta receita contém medicamentos controlados e requer receituário especial.
            </p>
          </div>
        )}
      </div>

      {/* Observations */}
      {prescription.observations && (
        <div className="p-6 border-b border-genesis-border-subtle">
          <h4 className="font-medium text-genesis-dark mb-2">Observações</h4>
          <p className="text-genesis-medium">{prescription.observations}</p>
        </div>
      )}

      {/* Dates & Signature */}
      <div className="p-6 border-b border-genesis-border-subtle">
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-genesis-subtle" />
            <div>
              <div className="text-sm text-genesis-muted">Emissão</div>
              <div className="font-medium text-genesis-dark">{formatDate(prescription.prescribedAt)}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-genesis-subtle" />
            <div>
              <div className="text-sm text-genesis-muted">Validade</div>
              <div className={`font-medium ${isExpired ? 'text-red-600' : 'text-genesis-dark'}`}>
                {formatDate(prescription.expiresAt)}
              </div>
            </div>
          </div>

          {prescription.signature && (
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <div>
                <div className="text-sm text-genesis-muted">Assinada em</div>
                <div className="font-medium text-genesis-dark">
                  {formatDate(prescription.signature.signedAt)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="p-6 bg-genesis-soft flex items-center gap-3">
          {prescription.status === 'draft' && onSign && (
            <button
              onClick={onSign}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
            >
              <BadgeCheck className="w-5 h-5" />
              Assinar Digitalmente
            </button>
          )}

          {prescription.status === 'signed' && onSend && (
            <button
              onClick={onSend}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors"
            >
              <Send className="w-5 h-5" />
              Enviar ao Paciente
            </button>
          )}

          {onPrint && (
            <button
              onClick={onPrint}
              className="flex items-center gap-2 px-4 py-2.5 border border-genesis-border hover:bg-genesis-hover text-genesis-text rounded-xl font-medium transition-colors"
            >
              <Printer className="w-5 h-5" />
              Imprimir
            </button>
          )}

          {['draft', 'pending_signature', 'signed'].includes(prescription.status) && onCancel && (
            <button
              onClick={onCancel}
              className="flex items-center gap-2 px-4 py-2.5 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl font-medium transition-colors ml-auto"
            >
              <XCircle className="w-5 h-5" />
              Cancelar
            </button>
          )}
        </div>
      )}
    </div>
  );
}
