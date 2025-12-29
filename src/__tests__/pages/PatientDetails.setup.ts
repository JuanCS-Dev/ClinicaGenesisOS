/**
 * PatientDetails Test Setup
 * @module __tests__/pages/PatientDetails.setup
 */

import { vi } from 'vitest'

export const mockNavigate = vi.fn()
export const mockAddRecord = vi.fn()

export const mockDefaultPatient = {
  id: 'patient-123',
  name: 'Maria Santos',
  email: 'maria@email.com',
  phone: '11999999999',
  birthDate: '1990-05-15',
  gender: 'Feminino',
  insurance: 'Unimed',
  tags: ['VIP', 'Diabético'],
  avatar: '',
  age: 34,
}

export const mockDefaultRecords = [
  {
    id: 'rec-1',
    patientId: 'patient-123',
    type: 'soap',
    date: new Date().toISOString(),
    subjective: 'Paciente relata dor de cabeça',
    attachments: [],
  },
  {
    id: 'rec-2',
    patientId: 'patient-123',
    type: 'prescription',
    date: new Date().toISOString(),
    medications: [{ name: 'Paracetamol' }, { name: 'Ibuprofeno' }],
    attachments: [{ id: 'att-1', name: 'receita.pdf' }],
  },
]

export const mockDefaultAppointments = [
  {
    id: 'apt-1',
    patientId: 'patient-123',
    date: new Date(Date.now() - 86400000).toISOString(),
    procedure: 'Consulta',
    professional: 'Dr. Silva',
    status: 'Concluída',
  },
]

export const defaultPatientHook = {
  patient: mockDefaultPatient,
  loading: false,
  error: null,
}

export const loadingPatientHook = {
  patient: null,
  loading: true,
  error: null,
}

export const notFoundPatientHook = {
  patient: null,
  loading: false,
  error: null,
}

export const defaultRecordsHook = {
  records: mockDefaultRecords,
  loading: false,
  error: null,
  addRecord: mockAddRecord,
  updateRecord: vi.fn(),
}

export const emptyRecordsHook = {
  records: [],
  loading: false,
  error: null,
  addRecord: mockAddRecord,
  updateRecord: vi.fn(),
}

export const defaultAppointmentsHook = {
  appointments: mockDefaultAppointments,
  loading: false,
}

export const emptyAppointmentsHook = {
  appointments: [],
  loading: false,
}
