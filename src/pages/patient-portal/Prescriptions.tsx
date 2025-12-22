/**
 * Patient Portal - Prescriptions
 * ==============================
 *
 * View and manage prescriptions and medications.
 *
 * @module pages/patient-portal/Prescriptions
 * @version 1.0.0
 */

import React, { useState } from 'react';
import {
  Pill,
  Download,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  RefreshCw,
  FileText,
  QrCode,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface Prescription {
  id: string;
  date: string;
  doctor: string;
  specialty: string;
  medications: Medication[];
  status: 'active' | 'expired' | 'renewed';
  expiresAt: string;
  hasDigitalSignature: boolean;
}

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_PRESCRIPTIONS: Prescription[] = [
  {
    id: '1',
    date: '2024-12-15',
    doctor: 'Dr. João Silva',
    specialty: 'Clínica Geral',
    medications: [
      {
        name: 'Losartana 50mg',
        dosage: '1 comprimido',
        frequency: '1x ao dia',
        duration: '30 dias',
      },
      {
        name: 'Metformina 850mg',
        dosage: '1 comprimido',
        frequency: '2x ao dia',
        duration: '30 dias',
      },
    ],
    status: 'active',
    expiresAt: '2025-01-15',
    hasDigitalSignature: true,
  },
  {
    id: '2',
    date: '2024-11-20',
    doctor: 'Dra. Maria Santos',
    specialty: 'Cardiologia',
    medications: [
      {
        name: 'AAS 100mg',
        dosage: '1 comprimido',
        frequency: '1x ao dia',
        duration: 'Uso contínuo',
      },
    ],
    status: 'active',
    expiresAt: '2025-02-20',
    hasDigitalSignature: true,
  },
  {
    id: '3',
    date: '2024-10-01',
    doctor: 'Dr. João Silva',
    specialty: 'Clínica Geral',
    medications: [
      {
        name: 'Amoxicilina 500mg',
        dosage: '1 comprimido',
        frequency: '3x ao dia',
        duration: '7 dias',
      },
    ],
    status: 'expired',
    expiresAt: '2024-10-31',
    hasDigitalSignature: false,
  },
];

// ============================================================================
// Helpers
// ============================================================================

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getDaysUntilExpiry(expiresAt: string): number {
  const today = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ============================================================================
// Components
// ============================================================================

interface PrescriptionCardProps {
  prescription: Prescription;
}

const PrescriptionCard: React.FC<PrescriptionCardProps> = ({ prescription }) => {
  const daysLeft = getDaysUntilExpiry(prescription.expiresAt);
  const isExpiringSoon = daysLeft > 0 && daysLeft <= 7;
  const isExpired = daysLeft <= 0;

  return (
    <div className="bg-white dark:bg-genesis-surface rounded-2xl border border-genesis-border overflow-hidden hover:shadow-lg transition-all">
      {/* Header */}
      <div className="p-4 border-b border-genesis-border">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {isExpired ? (
              <div className="px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-600 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Expirada
              </div>
            ) : isExpiringSoon ? (
              <div className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-600 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Expira em {daysLeft} dia{daysLeft !== 1 ? 's' : ''}
              </div>
            ) : (
              <div className="px-2.5 py-1 rounded-lg text-xs font-medium bg-green-50 text-green-600 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Ativa
              </div>
            )}
            {prescription.hasDigitalSignature && (
              <div className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-600 flex items-center gap-1">
                <QrCode className="w-3 h-3" />
                Digital
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
            <Pill className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-genesis-dark flex items-center gap-2">
              <User className="w-4 h-4 text-genesis-muted" />
              {prescription.doctor}
            </p>
            <p className="text-sm text-genesis-muted flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(prescription.date)} • {prescription.specialty}
            </p>
          </div>
        </div>
      </div>

      {/* Medications */}
      <div className="p-4 space-y-3">
        <p className="text-xs font-medium text-genesis-muted uppercase tracking-wide">
          Medicamentos ({prescription.medications.length})
        </p>
        {prescription.medications.map((med, index) => (
          <div
            key={index}
            className="bg-genesis-soft rounded-xl p-3"
          >
            <p className="font-medium text-genesis-dark text-sm">{med.name}</p>
            <p className="text-xs text-genesis-muted mt-1">
              {med.dosage} • {med.frequency} • {med.duration}
            </p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="p-4 pt-0 flex gap-2">
        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-genesis-primary text-white text-sm font-medium hover:bg-genesis-primary-dark transition-colors">
          <Download className="w-4 h-4" />
          Baixar PDF
        </button>
        {!isExpired && (
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-genesis-border text-genesis-medium text-sm font-medium hover:bg-genesis-hover transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function PatientPrescriptions(): React.ReactElement {
  const [search, setSearch] = useState('');
  const [showExpired, setShowExpired] = useState(false);

  const filteredPrescriptions = MOCK_PRESCRIPTIONS.filter((rx) => {
    if (!showExpired && rx.status === 'expired') return false;
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesMed = rx.medications.some((m) =>
        m.name.toLowerCase().includes(searchLower)
      );
      const matchesDoctor = rx.doctor.toLowerCase().includes(searchLower);
      return matchesMed || matchesDoctor;
    }
    return true;
  });

  const activeCount = MOCK_PRESCRIPTIONS.filter(
    (rx) => rx.status === 'active'
  ).length;
  const totalMeds = MOCK_PRESCRIPTIONS.filter(
    (rx) => rx.status === 'active'
  ).reduce((sum, rx) => sum + rx.medications.length, 0);

  return (
    <div className="space-y-6 animate-enter pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-genesis-dark flex items-center gap-3">
          <Pill className="w-7 h-7 text-green-600" />
          Minhas Receitas
        </h1>
        <p className="text-genesis-muted text-sm mt-1">
          {activeCount} receita{activeCount !== 1 ? 's' : ''} ativa
          {activeCount !== 1 ? 's' : ''} • {totalMeds} medicamento
          {totalMeds !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-genesis-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar medicamento ou médico..."
            className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-genesis-border bg-white dark:bg-genesis-surface text-genesis-dark placeholder:text-genesis-muted focus:outline-none focus:ring-2 focus:ring-genesis-primary focus:border-transparent"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showExpired}
            onChange={(e) => setShowExpired(e.target.checked)}
            className="w-4 h-4 rounded border-genesis-border text-genesis-primary focus:ring-genesis-primary"
          />
          <span className="text-sm text-genesis-medium">Mostrar expiradas</span>
        </label>
      </div>

      {/* Prescriptions Grid */}
      {filteredPrescriptions.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredPrescriptions.map((prescription) => (
            <PrescriptionCard key={prescription.id} prescription={prescription} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-genesis-surface rounded-2xl border border-genesis-border">
          <Pill className="w-12 h-12 text-genesis-muted mx-auto mb-4" />
          <p className="text-genesis-dark font-medium">Nenhuma receita encontrada</p>
          <p className="text-genesis-muted text-sm mt-1">
            {search
              ? 'Tente outra busca'
              : 'Nenhuma receita registrada no sistema'}
          </p>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 border border-green-100 dark:border-green-800">
        <div className="flex gap-3">
          <FileText className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              Receitas Digitais
            </p>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              Receitas com assinatura digital podem ser apresentadas
              diretamente na farmácia pelo celular. Basta mostrar o QR Code.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientPrescriptions;
