/**
 * Patient Portal Test Setup
 * =========================
 *
 * Common mocks and utilities for patient portal tests.
 * NOTE: vi.mock() calls are hoisted, so they must be at module level.
 * Import this file at the top of your test to set up mocks.
 */

import { vi } from 'vitest';
import React from 'react';

// Mock data
export const mockPatientProfile = {
  id: 'patient-123',
  name: 'Maria Santos',
  email: 'maria@email.com',
  phone: '11999999999',
};

export const mockAppointments = [
  {
    id: 'apt-1',
    patientId: 'patient-123',
    patientName: 'Maria Santos',
    professional: 'Dr. João Silva',
    specialty: 'Cardiologia',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    time: '14:00',
    status: 'scheduled',
    notes: 'Retorno',
  },
  {
    id: 'apt-2',
    patientId: 'patient-123',
    patientName: 'Maria Santos',
    professional: 'Dra. Ana Costa',
    specialty: 'Dermatologia',
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    time: '10:00',
    status: 'completed',
    notes: '',
  },
];

export const mockPrescriptions = [
  {
    id: 'rx-1',
    patientId: 'patient-123',
    patientName: 'Maria Santos',
    professional: 'Dr. João Silva',
    status: 'active',
    medications: [
      { name: 'Losartana 50mg', dosage: '1 comprimido', frequency: '1x ao dia' },
    ],
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockTransactions = [
  {
    id: 'tx-1',
    patientId: 'patient-123',
    type: 'income',
    amount: 250,
    status: 'pending',
    description: 'Consulta Cardiologia',
    date: new Date().toISOString(),
  },
];

// Module-level mocks (these are hoisted automatically by vitest)

// Mock ClinicContext
vi.mock('../../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => ({
    clinic: {
      id: 'clinic-123',
      name: 'Clínica Genesis Demo',
      settings: {
        workingHours: { startHour: 8, endHour: 18 },
      },
    },
    loading: false,
    error: null,
  })),
  ClinicProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock PatientAuthContext
vi.mock('../../../contexts/PatientAuthContext', () => ({
  usePatientAuth: vi.fn(() => ({
    profile: {
      id: 'patient-123',
      name: 'Maria Santos',
      email: 'maria@email.com',
    },
    user: { uid: 'user-123', email: 'maria@email.com' },
    loading: false,
    error: null,
  })),
}));

// Mock PatientPortalContext
vi.mock('../../../contexts/PatientPortalContext', () => ({
  usePatientPortal: vi.fn(() => ({
    clinicId: 'clinic-123',
    patientId: 'patient-123',
    patient: {
      id: 'patient-123',
      name: 'Maria Santos',
      email: 'maria@email.com',
    },
    loading: false,
    error: null,
  })),
  PatientPortalProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock usePatientPortal hooks
vi.mock('../../../hooks/usePatientPortal', () => ({
  usePatientPortal: vi.fn(() => ({
    clinicId: 'clinic-123',
    patientId: 'patient-123',
    patient: {
      id: 'patient-123',
      name: 'Maria Santos',
      email: 'maria@email.com',
    },
    loading: false,
    error: null,
  })),
  usePatientPortalAppointments: vi.fn(() => ({
    appointments: [
      {
        id: 'apt-1',
        patientId: 'patient-123',
        patientName: 'Maria Santos',
        professional: 'Dr. João Silva',
        specialty: 'Cardiologia',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        time: '14:00',
        status: 'scheduled',
        notes: 'Retorno',
      },
    ],
    upcomingAppointments: [
      {
        id: 'apt-1',
        patientId: 'patient-123',
        patientName: 'Maria Santos',
        professional: 'Dr. João Silva',
        specialty: 'Cardiologia',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        time: '14:00',
        status: 'scheduled',
        notes: 'Retorno',
      },
    ],
    pastAppointments: [],
    nextAppointment: {
      id: 'apt-1',
      patientId: 'patient-123',
      patientName: 'Maria Santos',
      professional: 'Dr. João Silva',
      specialty: 'Cardiologia',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      time: '14:00',
      status: 'scheduled',
      notes: 'Retorno',
    },
    loading: false,
    error: null,
    cancelAppointment: vi.fn(),
    rescheduleAppointment: vi.fn(),
  })),
  usePatientPortalPrescriptions: vi.fn(() => ({
    prescriptions: [
      {
        id: 'rx-1',
        patientId: 'patient-123',
        patientName: 'Maria Santos',
        professional: 'Dr. João Silva',
        status: 'active',
        medications: [
          { name: 'Losartana 50mg', dosage: '1 comprimido', frequency: '1x ao dia' },
        ],
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    activePrescriptions: [
      {
        id: 'rx-1',
        patientId: 'patient-123',
        patientName: 'Maria Santos',
        professional: 'Dr. João Silva',
        status: 'active',
        medications: [
          { name: 'Losartana 50mg', dosage: '1 comprimido', frequency: '1x ao dia' },
        ],
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    loading: false,
    error: null,
  })),
  usePatientPortalBilling: vi.fn(() => ({
    transactions: [
      {
        id: 'tx-1',
        patientId: 'patient-123',
        type: 'income',
        amount: 250,
        status: 'pending',
        description: 'Consulta Cardiologia',
        date: new Date().toISOString(),
      },
    ],
    pendingPayments: [
      {
        id: 'tx-1',
        patientId: 'patient-123',
        type: 'income',
        amount: 250,
        status: 'pending',
        description: 'Consulta Cardiologia',
        date: new Date().toISOString(),
      },
    ],
    totalPending: 250,
    loading: false,
    error: null,
  })),
}));

// Mock usePatientMessages
vi.mock('../../../hooks/usePatientMessages', () => ({
  usePatientMessages: vi.fn(() => ({
    conversations: [
      {
        id: 'conv-1',
        providerId: 'provider-1',
        providerName: 'Dr. João Silva',
        providerSpecialty: 'Cardiologia',
        lastMessage: 'Olá, como posso ajudar?',
        lastMessageAt: new Date().toISOString(),
        unreadCount: 1,
      },
    ],
    activeConversation: null,
    messages: [],
    loading: false,
    error: null,
    sendMessage: vi.fn(),
    selectConversation: vi.fn(),
    createConversation: vi.fn(),
    refresh: vi.fn(),
  })),
}));

// Mock usePatientTelehealth
vi.mock('../../../hooks/usePatientTelehealth', () => ({
  usePatientTelehealth: vi.fn(() => ({
    nextTeleconsulta: {
      appointment: {
        id: 'apt-tele-1',
        patientId: 'patient-123',
        patientName: 'Maria Santos',
        professional: 'Dr. João Silva',
        specialty: 'Cardiologia',
        date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        time: '14:00',
        status: 'scheduled',
        type: 'teleconsulta',
      },
      session: null,
    },
    loading: false,
    error: null,
    canJoin: false,
    minutesUntilJoin: 60,
    joinWaitingRoom: vi.fn(),
    leaveWaitingRoom: vi.fn(),
    refresh: vi.fn(),
  })),
}));

// Mock usePatientInsights
vi.mock('../../../hooks/usePatientInsights', () => ({
  usePatientInsights: vi.fn(() => ({
    insights: [],
    loading: false,
    error: null,
  })),
}));

// Mock useLabResults
vi.mock('../../../hooks/useLabResults', () => ({
  useLabResults: vi.fn(() => ({
    results: [
      {
        id: 'lab-1',
        patientId: 'patient-123',
        examType: 'blood',
        examName: 'Hemograma Completo',
        status: 'completed',
        collectionDate: new Date().toISOString(),
        resultDate: new Date().toISOString(),
        professional: 'Dra. Maria Lab',
        lab: 'Laboratório Central',
      },
    ],
    readyResults: [
      {
        id: 'lab-1',
        patientId: 'patient-123',
        examType: 'blood',
        examName: 'Hemograma Completo',
        status: 'completed',
        collectionDate: new Date().toISOString(),
        resultDate: new Date().toISOString(),
        professional: 'Dra. Maria Lab',
        lab: 'Laboratório Central',
      },
    ],
    pendingResults: [],
    loading: false,
    error: null,
    refresh: vi.fn(),
    markAsViewed: vi.fn(),
  })),
}));

// Helper function to reset mocks between tests
export function resetPatientPortalMocks() {
  vi.clearAllMocks();
}
