/**
 * PatientDetails Page Tests
 *
 * Smoke tests + basic functionality verification.
 * This page is very complex with many child components, so we mock extensively.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
    clinic: { settings: { specialties: ['medicina'] } },
    userProfile: { specialty: 'medicina' },
  })),
}));

vi.mock('../../hooks/usePatient', () => ({
  usePatient: vi.fn(() => ({
    patient: {
      id: 'patient-123',
      name: 'Maria Santos',
      email: 'maria@email.com',
      phone: '11999999999',
      birthDate: '1990-05-15',
      gender: 'Feminino',
      insurance: 'Unimed',
      tags: ['VIP'],
      avatar: '',
      age: 34,
    },
    loading: false,
    error: null,
  })),
}));

vi.mock('../../hooks/useAppointments', () => ({
  usePatientAppointments: vi.fn(() => ({
    appointments: [],
    loading: false,
  })),
}));

vi.mock('../../hooks/useRecords', () => ({
  useRecords: vi.fn(() => ({
    records: [],
    loading: false,
    error: null,
    addRecord: vi.fn(),
    updateRecord: vi.fn(),
  })),
}));

// Mock ALL complex components
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
  MedicineEditor: () => <div>Medicine Editor</div>,
  NutritionEditor: () => <div>Nutrition Editor</div>,
  PsychologyEditor: () => <div>Psychology Editor</div>,
}));

vi.mock('../../components/patient/Timeline', () => ({
  Timeline: () => <div data-testid="timeline">Timeline</div>,
}));

vi.mock('../../components/records/AttachmentUpload', () => ({
  AttachmentList: () => null,
}));

vi.mock('../../components/ai/clinical-reasoning', () => ({
  ClinicalReasoningPanel: () => <div data-testid="clinical-reasoning">Clinical AI</div>,
}));

vi.mock('../../components/prescription', () => ({
  PrescriptionModal: () => null,
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
  });

  describe('smoke tests', () => {
    it('should render without crashing', () => {
      const { container } = renderPatientDetails();
      expect(container).toBeDefined();
    });

    it('should have main content area', () => {
      const { container } = renderPatientDetails();
      expect(container.querySelector('.animate-enter')).toBeTruthy();
    });
  });

  describe('patient header', () => {
    it('should display patient name in header', () => {
      renderPatientDetails();
      // The patient name should appear somewhere in the document
      const nameElements = screen.getAllByText(/Maria Santos/i);
      expect(nameElements.length).toBeGreaterThan(0);
    });
  });

  describe('loading state', () => {
    it('should show loader when fetching patient', async () => {
      const { usePatient } = await import('../../hooks/usePatient');
      vi.mocked(usePatient).mockReturnValue({
        patient: null,
        loading: true,
        error: null,
      });

      renderPatientDetails();
      expect(document.querySelector('.animate-spin')).toBeTruthy();
    });

    it('should show not found when patient is null', async () => {
      const { usePatient } = await import('../../hooks/usePatient');
      vi.mocked(usePatient).mockReturnValue({
        patient: null,
        loading: false,
        error: null,
      });

      renderPatientDetails();
      expect(screen.getByText(/não encontrado/i)).toBeInTheDocument();
    });
  });
});
