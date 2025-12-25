/**
 * PatientDetails Page Tests
 *
 * Comprehensive tests for the patient details page.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: 'patient-123' }),
  };
});

vi.mock('../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => ({
    clinicId: 'clinic-123',
    clinic: { settings: { specialties: ['medicina', 'nutricao', 'psicologia'] } },
    userProfile: { specialty: 'medicina' },
  })),
}));

const mockDefaultPatient = {
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
};

vi.mock('../../hooks/usePatient', () => ({
  usePatient: vi.fn(() => ({
    patient: mockDefaultPatient,
    loading: false,
    error: null,
  })),
}));

import { usePatient } from '../../hooks/usePatient';
const mockUsePatient = usePatient as ReturnType<typeof vi.fn>;

const mockAddRecord = vi.fn();
const mockDefaultRecords = [
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
];

vi.mock('../../hooks/useRecords', () => ({
  useRecords: vi.fn(() => ({
    records: mockDefaultRecords,
    loading: false,
    error: null,
    addRecord: mockAddRecord,
    updateRecord: vi.fn(),
  })),
}));

import { useRecords } from '../../hooks/useRecords';
const mockUseRecords = useRecords as ReturnType<typeof vi.fn>;

const mockDefaultAppointments = [
  {
    id: 'apt-1',
    patientId: 'patient-123',
    date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    procedure: 'Consulta',
    professional: 'Dr. Silva',
    status: 'Concluída',
  },
];

vi.mock('../../hooks/useAppointments', () => ({
  usePatientAppointments: vi.fn(() => ({
    appointments: mockDefaultAppointments,
    loading: false,
  })),
}));

import { usePatientAppointments } from '../../hooks/useAppointments';
const mockUsePatientAppointments = usePatientAppointments as ReturnType<typeof vi.fn>;

// Mock plugins - use inline function to avoid hoisting issues
vi.mock('../../plugins', () => ({
  PLUGINS: {
    medicina: {
      id: 'medicina',
      name: 'Medicina Geral',
      color: 'text-blue-600 bg-blue-50 border-blue-100',
      icon: () => null,
      features: ['Anamnese SOAP', 'Prescrição Digital'],
    },
    nutricao: {
      id: 'nutricao',
      name: 'Nutrição',
      color: 'text-green-600 bg-green-50 border-green-100',
      icon: () => null,
      features: ['Antropometria'],
    },
    psicologia: {
      id: 'psicologia',
      name: 'Psicologia',
      color: 'text-pink-600 bg-pink-50 border-pink-100',
      icon: () => null,
      features: ['Evolução de Sessão'],
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
}));

vi.mock('../../components/patient/Timeline', () => ({
  Timeline: ({ events }: { events: { id: string }[] }) => (
    <div data-testid="timeline">
      <span data-testid="timeline-count">{events.length} eventos</span>
    </div>
  ),
}));

vi.mock('../../components/records/AttachmentUpload', () => ({
  AttachmentList: ({ attachments }: { attachments: { name: string }[] }) => (
    <div data-testid="attachment-list">{attachments.length} anexos</div>
  ),
}));

vi.mock('../../components/ai/clinical-reasoning', () => ({
  ClinicalReasoningPanel: ({ patientId }: { patientId: string }) => (
    <div data-testid="clinical-reasoning">Clinical AI for {patientId}</div>
  ),
}));

vi.mock('../../components/prescription', () => ({
  PrescriptionModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="prescription-modal">
        <button onClick={onClose}>Fechar Prescrição</button>
      </div>
    ) : null,
}));

import { PatientDetails } from '../../pages/PatientDetails';

const renderPatientDetails = () => {
  return render(
    <MemoryRouter initialEntries={['/patients/patient-123']}>
      <Routes>
        <Route path="/patients/:id" element={<PatientDetails />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('PatientDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to defaults
    mockUsePatient.mockReturnValue({
      patient: mockDefaultPatient,
      loading: false,
      error: null,
    });
    mockUseRecords.mockReturnValue({
      records: mockDefaultRecords,
      loading: false,
      error: null,
      addRecord: mockAddRecord,
      updateRecord: vi.fn(),
    });
    mockUsePatientAppointments.mockReturnValue({
      appointments: mockDefaultAppointments,
      loading: false,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendering', () => {
    it('should render without crashing', () => {
      const { container } = renderPatientDetails();
      expect(container).toBeDefined();
    });

    it('should have main content area with animation', () => {
      const { container } = renderPatientDetails();
      expect(container.querySelector('.animate-enter')).toBeTruthy();
    });
  });

  describe('patient header', () => {
    it('should display patient name', () => {
      renderPatientDetails();
      expect(screen.getByText('Maria Santos')).toBeInTheDocument();
    });

    it('should display patient age', () => {
      renderPatientDetails();
      expect(screen.getByText('34 anos')).toBeInTheDocument();
    });

    it('should display patient phone', () => {
      renderPatientDetails();
      expect(screen.getByText('11999999999')).toBeInTheDocument();
    });

    it('should display patient insurance', () => {
      renderPatientDetails();
      expect(screen.getByText('Unimed')).toBeInTheDocument();
    });

    it('should display patient tags', () => {
      renderPatientDetails();
      expect(screen.getByText('VIP')).toBeInTheDocument();
      expect(screen.getByText('Diabético')).toBeInTheDocument();
    });

    it('should show Particular when no insurance', () => {
      mockUsePatient.mockReturnValue({
        patient: { ...mockDefaultPatient, insurance: '' },
        loading: false,
        error: null,
      });
      renderPatientDetails();
      expect(screen.getByText('Particular')).toBeInTheDocument();
    });
  });

  describe('header actions', () => {
    it('should render edit button', () => {
      renderPatientDetails();
      expect(screen.getByText('Editar')).toBeInTheDocument();
    });

    it('should navigate to edit on click', () => {
      renderPatientDetails();
      fireEvent.click(screen.getByText('Editar'));
      expect(mockNavigate).toHaveBeenCalledWith('/patients/patient-123/edit');
    });

    it('should render prescribe button', () => {
      renderPatientDetails();
      expect(screen.getByText('Prescrever')).toBeInTheDocument();
    });

    it('should open prescription modal on click', () => {
      renderPatientDetails();
      fireEvent.click(screen.getByText('Prescrever'));
      expect(screen.getByTestId('prescription-modal')).toBeInTheDocument();
    });

    it('should close prescription modal', () => {
      renderPatientDetails();
      fireEvent.click(screen.getByText('Prescrever'));
      fireEvent.click(screen.getByText('Fechar Prescrição'));
      expect(screen.queryByTestId('prescription-modal')).not.toBeInTheDocument();
    });

    it('should render schedule button', () => {
      renderPatientDetails();
      expect(screen.getByText('Agendar')).toBeInTheDocument();
    });
  });

  describe('tab navigation', () => {
    it('should show prontuario tab active by default', () => {
      renderPatientDetails();
      expect(screen.getByTestId('medicine-editor')).toBeInTheDocument();
    });

    it('should switch to timeline tab', () => {
      renderPatientDetails();
      fireEvent.click(screen.getByText('Histórico'));
      expect(screen.getByTestId('timeline')).toBeInTheDocument();
    });

    it('should switch to clinical AI tab', () => {
      renderPatientDetails();
      fireEvent.click(screen.getByText('Diagnóstico Assistido'));
      expect(screen.getByTestId('clinical-reasoning')).toBeInTheDocument();
    });

    it('should switch back to prontuario', () => {
      renderPatientDetails();
      fireEvent.click(screen.getByText('Histórico'));
      fireEvent.click(screen.getByText('Prontuário'));
      expect(screen.getByTestId('medicine-editor')).toBeInTheDocument();
    });
  });

  describe('specialty selector', () => {
    it('should display specialty label', () => {
      renderPatientDetails();
      expect(screen.getByText('Especialidade Ativa:')).toBeInTheDocument();
    });

    it('should display all specialties', () => {
      renderPatientDetails();
      // Medicina Geral appears in header and selector
      const medicinaElements = screen.getAllByText('Medicina Geral');
      expect(medicinaElements.length).toBeGreaterThan(0);
      expect(screen.getByText('Nutrição')).toBeInTheDocument();
      expect(screen.getByText('Psicologia')).toBeInTheDocument();
    });

    it('should switch to nutrition editor', () => {
      renderPatientDetails();
      fireEvent.click(screen.getByText('Nutrição'));
      expect(screen.getByTestId('nutrition-editor')).toBeInTheDocument();
    });

    it('should switch to psychology editor', () => {
      renderPatientDetails();
      fireEvent.click(screen.getByText('Psicologia'));
      expect(screen.getByTestId('psychology-editor')).toBeInTheDocument();
    });
  });

  describe('records sidebar', () => {
    it('should display records header', () => {
      renderPatientDetails();
      expect(screen.getByText('Registros')).toBeInTheDocument();
    });

    it('should show empty state when no records', () => {
      mockUseRecords.mockReturnValue({
        records: [],
        loading: false,
        error: null,
        addRecord: mockAddRecord,
        updateRecord: vi.fn(),
      });
      renderPatientDetails();
      expect(screen.getByText('Nenhum registro encontrado.')).toBeInTheDocument();
    });
  });

  describe('timeline', () => {
    it('should generate timeline events from records and appointments', () => {
      renderPatientDetails();
      fireEvent.click(screen.getByText('Histórico'));
      // Should have 2 records + 1 appointment = 3 events
      expect(screen.getByTestId('timeline-count')).toHaveTextContent('3 eventos');
    });

    it('should show empty state when no events', () => {
      mockUseRecords.mockReturnValue({
        records: [],
        loading: false,
        error: null,
        addRecord: mockAddRecord,
        updateRecord: vi.fn(),
      });
      mockUsePatientAppointments.mockReturnValue({
        appointments: [],
        loading: false,
      });
      renderPatientDetails();
      fireEvent.click(screen.getByText('Histórico'));
      expect(screen.getByText('Nenhum evento registrado no histórico.')).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('should show loader when loading patient', () => {
      mockUsePatient.mockReturnValue({
        patient: null,
        loading: true,
        error: null,
      });
      renderPatientDetails();
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });

  describe('not found state', () => {
    it('should show not found message', () => {
      mockUsePatient.mockReturnValue({
        patient: null,
        loading: false,
        error: null,
      });
      renderPatientDetails();
      expect(screen.getByText(/não encontrado/i)).toBeInTheDocument();
    });
  });

  describe('clinical AI', () => {
    it('should pass patient id to clinical reasoning', () => {
      renderPatientDetails();
      fireEvent.click(screen.getByText('Diagnóstico Assistido'));
      expect(screen.getByText('Clinical AI for patient-123')).toBeInTheDocument();
    });
  });

  describe('save record', () => {
    it('should call addRecord when saving', () => {
      renderPatientDetails();
      fireEvent.click(screen.getByText('Salvar Registro'));
      expect(mockAddRecord).toHaveBeenCalled();
    });
  });

  describe('patient avatar', () => {
    it('should use default avatar when none provided', () => {
      renderPatientDetails();
      const img = document.querySelector('img[alt="Maria Santos"]');
      expect(img).toBeInTheDocument();
      expect(img?.getAttribute('src')).toContain('ui-avatars.com');
    });

    it('should use patient avatar when provided', () => {
      mockUsePatient.mockReturnValue({
        patient: { ...mockDefaultPatient, avatar: 'https://example.com/avatar.jpg' },
        loading: false,
        error: null,
      });
      renderPatientDetails();
      const img = document.querySelector('img[alt="Maria Santos"]');
      expect(img?.getAttribute('src')).toBe('https://example.com/avatar.jpg');
    });
  });

  describe('record types display', () => {
    it('should show SOAP record as Evolução Médica', () => {
      mockUseRecords.mockReturnValue({
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
        loading: false,
        error: null,
        addRecord: mockAddRecord,
        updateRecord: vi.fn(),
      });
      renderPatientDetails();
      expect(screen.getByText('Evolução Médica')).toBeInTheDocument();
    });

    it('should show prescription record', () => {
      mockUseRecords.mockReturnValue({
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
        loading: false,
        error: null,
        addRecord: mockAddRecord,
        updateRecord: vi.fn(),
      });
      renderPatientDetails();
      expect(screen.getByText('Prescrição Médica')).toBeInTheDocument();
    });

    it('should show exam request record', () => {
      mockUseRecords.mockReturnValue({
        records: [
          {
            id: 'rec-exam',
            patientId: 'patient-123',
            type: 'exam_request',
            date: new Date().toISOString(),
            exams: ['Hemograma', 'Glicemia'],
            attachments: [],
          },
        ],
        loading: false,
        error: null,
        addRecord: mockAddRecord,
        updateRecord: vi.fn(),
      });
      renderPatientDetails();
      expect(screen.getByText('Solicitação de Exames')).toBeInTheDocument();
    });

    it('should show anthropometry record', () => {
      mockUseRecords.mockReturnValue({
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
        loading: false,
        error: null,
        addRecord: mockAddRecord,
        updateRecord: vi.fn(),
      });
      renderPatientDetails();
      expect(screen.getByText('Antropometria')).toBeInTheDocument();
    });

    it('should show psycho session record', () => {
      mockUseRecords.mockReturnValue({
        records: [
          {
            id: 'rec-psycho',
            patientId: 'patient-123',
            type: 'psycho_session',
            date: new Date().toISOString(),
            summary: 'Sessão de terapia cognitiva',
            attachments: [],
          },
        ],
        loading: false,
        error: null,
        addRecord: mockAddRecord,
        updateRecord: vi.fn(),
      });
      renderPatientDetails();
      expect(screen.getByText('Sessão de Terapia')).toBeInTheDocument();
    });
  });
});
