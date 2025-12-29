/**
 * PatientDetails Page Tests
 * @module __tests__/pages/PatientDetails.test
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import {
  mockNavigate,
  mockAddRecord,
  mockDefaultPatient,
  mockDefaultRecords,
  mockDefaultAppointments,
  defaultPatientHook,
  loadingPatientHook,
  notFoundPatientHook,
  defaultRecordsHook,
  emptyRecordsHook,
  defaultAppointmentsHook,
  emptyAppointmentsHook,
} from './PatientDetails.setup'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate, useParams: () => ({ id: 'patient-123' }) }
})

vi.mock('../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => ({
    clinicId: 'clinic-123',
    clinic: { settings: { specialties: ['medicina', 'nutricao', 'psicologia'] } },
    userProfile: { specialty: 'medicina' },
  })),
}))

vi.mock('../../hooks/usePatient', () => ({ usePatient: vi.fn(() => defaultPatientHook) }))
vi.mock('../../hooks/useRecords', () => ({ useRecords: vi.fn(() => defaultRecordsHook) }))
vi.mock('../../hooks/useAppointments', () => ({
  usePatientAppointments: vi.fn(() => defaultAppointmentsHook),
}))

import { usePatient } from '../../hooks/usePatient'
import { useRecords } from '../../hooks/useRecords'
import { usePatientAppointments } from '../../hooks/useAppointments'
const mockUsePatient = usePatient as ReturnType<typeof vi.fn>
const mockUseRecords = useRecords as ReturnType<typeof vi.fn>
const mockUsePatientAppointments = usePatientAppointments as ReturnType<typeof vi.fn>

vi.mock('../../plugins', () => ({
  PLUGINS: {
    medicina: {
      id: 'medicina',
      name: 'Medicina Geral',
      color: 'text-blue-600 bg-blue-50',
      icon: () => null,
      features: [],
    },
    nutricao: {
      id: 'nutricao',
      name: 'Nutrição',
      color: 'text-green-600 bg-green-50',
      icon: () => null,
      features: [],
    },
    psicologia: {
      id: 'psicologia',
      name: 'Psicologia',
      color: 'text-pink-600 bg-pink-50',
      icon: () => null,
      features: [],
    },
  },
  MedicineEditor: ({ onSave }: { onSave: () => void }) => (
    <div data-testid="medicine-editor">
      <button onClick={onSave}>Salvar Registro</button>
    </div>
  ),
  NutritionEditor: ({ onSave }: { onSave: () => void }) => (
    <div data-testid="nutrition-editor">
      <button onClick={onSave}>Salvar Nutrição</button>
    </div>
  ),
  PsychologyEditor: ({ onSave }: { onSave: () => void }) => (
    <div data-testid="psychology-editor">
      <button onClick={onSave}>Salvar Psicologia</button>
    </div>
  ),
}))

vi.mock('../../components/patient/Timeline', () => ({
  Timeline: ({ events }: { events: { id: string }[] }) => (
    <div data-testid="timeline">
      <span data-testid="timeline-count">{events.length} eventos</span>
    </div>
  ),
}))

vi.mock('../../components/ai/clinical-reasoning', () => ({
  ClinicalReasoningPanel: ({ patientId }: { patientId: string }) => (
    <div data-testid="clinical-reasoning">Clinical AI for {patientId}</div>
  ),
}))

vi.mock('../../components/prescription', () => ({
  PrescriptionModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="prescription-modal">
        <button onClick={onClose}>Fechar Prescrição</button>
      </div>
    ) : null,
}))

import { PatientDetails } from '../../pages/PatientDetails'
const renderPatientDetails = () =>
  render(
    <MemoryRouter initialEntries={['/patients/patient-123']}>
      <Routes>
        <Route path="/patients/:id" element={<PatientDetails />} />
      </Routes>
    </MemoryRouter>
  )

describe('PatientDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUsePatient.mockReturnValue(defaultPatientHook)
    mockUseRecords.mockReturnValue(defaultRecordsHook)
    mockUsePatientAppointments.mockReturnValue(defaultAppointmentsHook)
  })

  afterEach(() => vi.restoreAllMocks())

  describe('rendering', () => {
    it('should render without crashing', () => {
      const { container } = renderPatientDetails()
      expect(container).toBeDefined()
    })

    it('should have animation class', () => {
      const { container } = renderPatientDetails()
      expect(container.querySelector('.animate-enter')).toBeTruthy()
    })
  })

  describe('patient header', () => {
    it('should display patient name', () => {
      renderPatientDetails()
      expect(screen.getByText('Maria Santos')).toBeInTheDocument()
    })

    it('should display patient age', () => {
      renderPatientDetails()
      expect(screen.getByText('34 anos')).toBeInTheDocument()
    })

    it('should display patient phone', () => {
      renderPatientDetails()
      expect(screen.getByText('11999999999')).toBeInTheDocument()
    })

    it('should display patient insurance', () => {
      renderPatientDetails()
      expect(screen.getByText('Unimed')).toBeInTheDocument()
    })

    it('should display patient tags', () => {
      renderPatientDetails()
      expect(screen.getByText('VIP')).toBeInTheDocument()
      expect(screen.getByText('Diabético')).toBeInTheDocument()
    })

    it('should show Particular when no insurance', () => {
      mockUsePatient.mockReturnValue({
        patient: { ...mockDefaultPatient, insurance: '' },
        loading: false,
        error: null,
      })
      renderPatientDetails()
      expect(screen.getByText('Particular')).toBeInTheDocument()
    })
  })

  describe('header actions', () => {
    it('should render edit button', () => {
      renderPatientDetails()
      expect(screen.getByText('Editar')).toBeInTheDocument()
    })

    it('should navigate to edit on click', () => {
      renderPatientDetails()
      fireEvent.click(screen.getByText('Editar'))
      expect(mockNavigate).toHaveBeenCalledWith('/patients/patient-123/edit')
    })

    it('should render prescribe button', () => {
      renderPatientDetails()
      expect(screen.getByText('Prescrever')).toBeInTheDocument()
    })

    // Note: Tests use findByTestId (async) because PatientDetails uses lazy loading
    it('should open prescription modal on click', async () => {
      renderPatientDetails()
      fireEvent.click(screen.getByText('Prescrever'))
      expect(await screen.findByTestId('prescription-modal')).toBeInTheDocument()
    })

    it('should close prescription modal', async () => {
      renderPatientDetails()
      fireEvent.click(screen.getByText('Prescrever'))
      await screen.findByTestId('prescription-modal')
      fireEvent.click(screen.getByText('Fechar Prescrição'))
      expect(screen.queryByTestId('prescription-modal')).not.toBeInTheDocument()
    })
  })

  describe('tab navigation', () => {
    it('should show prontuario tab active by default', () => {
      renderPatientDetails()
      expect(screen.getByTestId('medicine-editor')).toBeInTheDocument()
    })

    // Note: Tests use findByTestId (async) because lazy-loaded components
    it('should switch to timeline tab', async () => {
      renderPatientDetails()
      fireEvent.click(screen.getByText('Histórico'))
      expect(await screen.findByTestId('timeline')).toBeInTheDocument()
    })

    it('should switch to clinical AI tab', async () => {
      renderPatientDetails()
      fireEvent.click(screen.getByText('Diagnóstico Assistido'))
      expect(await screen.findByTestId('clinical-reasoning')).toBeInTheDocument()
    })

    it('should switch back to prontuario', async () => {
      renderPatientDetails()
      fireEvent.click(screen.getByText('Histórico'))
      await screen.findByTestId('timeline')
      fireEvent.click(screen.getByText('Prontuário'))
      expect(screen.getByTestId('medicine-editor')).toBeInTheDocument()
    })
  })

  describe('specialty selector', () => {
    it('should display specialty label', () => {
      renderPatientDetails()
      expect(screen.getByText('Especialidade Ativa:')).toBeInTheDocument()
    })

    it('should display all specialties', () => {
      renderPatientDetails()
      expect(screen.getAllByText('Medicina Geral').length).toBeGreaterThan(0)
      expect(screen.getByText('Nutrição')).toBeInTheDocument()
      expect(screen.getByText('Psicologia')).toBeInTheDocument()
    })

    it('should switch to nutrition editor', () => {
      renderPatientDetails()
      fireEvent.click(screen.getByText('Nutrição'))
      expect(screen.getByTestId('nutrition-editor')).toBeInTheDocument()
    })

    it('should switch to psychology editor', () => {
      renderPatientDetails()
      fireEvent.click(screen.getByText('Psicologia'))
      expect(screen.getByTestId('psychology-editor')).toBeInTheDocument()
    })
  })

  describe('records sidebar', () => {
    it('should display records header', () => {
      renderPatientDetails()
      expect(screen.getByText('Registros')).toBeInTheDocument()
    })

    it('should show empty state when no records', () => {
      mockUseRecords.mockReturnValue(emptyRecordsHook)
      renderPatientDetails()
      expect(screen.getByText('Nenhum registro encontrado.')).toBeInTheDocument()
    })
  })

  describe('timeline', () => {
    // Note: Uses findByTestId (async) because Timeline is lazy-loaded
    it('should generate timeline events from records and appointments', async () => {
      renderPatientDetails()
      fireEvent.click(screen.getByText('Histórico'))
      expect(await screen.findByTestId('timeline-count')).toHaveTextContent('3 eventos')
    })

    it('should show empty state when no events', async () => {
      mockUseRecords.mockReturnValue(emptyRecordsHook)
      mockUsePatientAppointments.mockReturnValue(emptyAppointmentsHook)
      renderPatientDetails()
      fireEvent.click(screen.getByText('Histórico'))
      expect(await screen.findByText('Nenhum evento registrado no histórico.')).toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    it('should show loader when loading patient', () => {
      mockUsePatient.mockReturnValue(loadingPatientHook)
      renderPatientDetails()
      expect(document.querySelector('.animate-spin')).toBeInTheDocument()
    })
  })

  describe('not found state', () => {
    it('should show not found message', () => {
      mockUsePatient.mockReturnValue(notFoundPatientHook)
      renderPatientDetails()
      expect(screen.getByText(/não encontrado/i)).toBeInTheDocument()
    })
  })

  describe('clinical AI', () => {
    // Note: Uses findByText (async) because ClinicalReasoningPanel is lazy-loaded
    it('should pass patient id to clinical reasoning', async () => {
      renderPatientDetails()
      fireEvent.click(screen.getByText('Diagnóstico Assistido'))
      expect(await screen.findByText('Clinical AI for patient-123')).toBeInTheDocument()
    })
  })

  describe('save record', () => {
    it('should call addRecord when saving', () => {
      renderPatientDetails()
      fireEvent.click(screen.getByText('Salvar Registro'))
      expect(mockAddRecord).toHaveBeenCalled()
    })
  })

  describe('patient avatar', () => {
    it('should use default avatar when none provided', () => {
      renderPatientDetails()
      const img = document.querySelector('img[alt="Maria Santos"]')
      expect(img?.getAttribute('src')).toContain('ui-avatars.com')
    })

    it('should use patient avatar when provided', () => {
      mockUsePatient.mockReturnValue({
        patient: { ...mockDefaultPatient, avatar: 'https://example.com/avatar.jpg' },
        loading: false,
        error: null,
      })
      renderPatientDetails()
      const img = document.querySelector('img[alt="Maria Santos"]')
      expect(img?.getAttribute('src')).toBe('https://example.com/avatar.jpg')
    })
  })

  describe('record types display', () => {
    it('should show SOAP record as Evolução Médica', () => {
      mockUseRecords.mockReturnValue({
        ...defaultRecordsHook,
        records: [
          {
            id: 'rec-soap',
            patientId: 'patient-123',
            type: 'soap',
            date: new Date().toISOString(),
            subjective: 'Dor de cabeça',
            attachments: [],
          },
        ],
      })
      renderPatientDetails()
      expect(screen.getByText('Evolução Médica')).toBeInTheDocument()
    })

    it('should show prescription record', () => {
      mockUseRecords.mockReturnValue({
        ...defaultRecordsHook,
        records: [
          {
            id: 'rec-presc',
            patientId: 'patient-123',
            type: 'prescription',
            date: new Date().toISOString(),
            medications: [{ name: 'Paracetamol' }],
            attachments: [],
          },
        ],
      })
      renderPatientDetails()
      expect(screen.getByText('Prescrição Médica')).toBeInTheDocument()
    })

    it('should show exam request record', () => {
      mockUseRecords.mockReturnValue({
        ...defaultRecordsHook,
        records: [
          {
            id: 'rec-exam',
            patientId: 'patient-123',
            type: 'exam_request',
            date: new Date().toISOString(),
            exams: ['Hemograma'],
            attachments: [],
          },
        ],
      })
      renderPatientDetails()
      expect(screen.getByText('Solicitação de Exames')).toBeInTheDocument()
    })

    it('should show anthropometry record', () => {
      mockUseRecords.mockReturnValue({
        ...defaultRecordsHook,
        records: [
          {
            id: 'rec-anthro',
            patientId: 'patient-123',
            type: 'anthropometry',
            date: new Date().toISOString(),
            weight: 70,
            imc: 24.5,
            attachments: [],
          },
        ],
      })
      renderPatientDetails()
      expect(screen.getByText('Antropometria')).toBeInTheDocument()
    })

    it('should show psycho session record', () => {
      mockUseRecords.mockReturnValue({
        ...defaultRecordsHook,
        records: [
          {
            id: 'rec-psycho',
            patientId: 'patient-123',
            type: 'psycho_session',
            date: new Date().toISOString(),
            summary: 'Sessão de terapia',
            attachments: [],
          },
        ],
      })
      renderPatientDetails()
      expect(screen.getByText('Sessão de Terapia')).toBeInTheDocument()
    })
  })
})
