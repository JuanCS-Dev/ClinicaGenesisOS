/**
 * PrescriptionPreview Component Tests
 *
 * Uses real interface: PrescriptionPreviewProps from @/types/prescription.props
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import { PrescriptionPreview } from '../../../components/prescription/PrescriptionPreview';

// Mock prescription based on real Prescription interface
const mockPrescription = {
  id: 'rx-123',
  clinicId: 'clinic-123',
  patientId: 'patient-123',
  patientName: 'Maria Santos',
  patientCpf: '123.456.789-00',
  professionalId: 'prof-123',
  professionalName: 'Dr. João Silva',
  professionalCrm: '123456',
  professionalCrmState: 'SP',
  type: 'simple' as const,
  status: 'signed' as const,
  medications: [
    {
      id: 'med-1',
      name: 'Dipirona 500mg',
      dosage: '1',
      unit: 'comprimido' as const,
      route: 'oral' as const,
      frequency: '8/8h',
      duration: '5 dias',
      quantity: 15,
      isControlled: false,
      continuousUse: false,
    },
    {
      id: 'med-2',
      name: 'Omeprazol 20mg',
      dosage: '1',
      unit: 'cápsula' as const,
      route: 'oral' as const,
      frequency: '1x ao dia',
      duration: '30 dias',
      quantity: 30,
      isControlled: false,
      continuousUse: true,
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('PrescriptionPreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('smoke tests', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <PrescriptionPreview prescription={mockPrescription} />
      );
      expect(container).toBeDefined();
    });
  });

  describe('prescription content', () => {
    it('should display patient name', () => {
      render(<PrescriptionPreview prescription={mockPrescription} />);
      const nameElements = screen.getAllByText(/Maria Santos/i);
      expect(nameElements.length).toBeGreaterThan(0);
    });

    it('should display medications', () => {
      render(<PrescriptionPreview prescription={mockPrescription} />);
      const dipironaElements = screen.getAllByText(/Dipirona/i);
      expect(dipironaElements.length).toBeGreaterThan(0);
    });

    it('should display professional name', () => {
      render(<PrescriptionPreview prescription={mockPrescription} />);
      const drElements = screen.getAllByText(/Dr\. João Silva/i);
      expect(drElements.length).toBeGreaterThan(0);
    });
  });
});
