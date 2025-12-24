/**
 * PrescriptionModal Component Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('../../../hooks/usePrescription', () => ({
  usePrescription: vi.fn(() => ({
    createPrescription: vi.fn().mockResolvedValue({ id: 'rx-123' }),
    signPrescription: vi.fn().mockResolvedValue(true),
    sendToPatient: vi.fn().mockResolvedValue(true),
    loading: false,
  })),
}));

import { PrescriptionModal } from '../../../components/prescription/PrescriptionModal';

describe('PrescriptionModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('smoke tests', () => {
    it('should render without crashing when open', () => {
      const { container } = render(
        <PrescriptionModal
          isOpen={true}
          onClose={vi.fn()}
          patientId="patient-123"
          patientName="Maria Santos"
        />
      );
      expect(container).toBeDefined();
    });

    it('should not render when closed', () => {
      const { container } = render(
        <PrescriptionModal
          isOpen={false}
          onClose={vi.fn()}
          patientId="patient-123"
          patientName="Maria Santos"
        />
      );
      // Check if modal overlay is not present
      expect(container.querySelector('[class*="fixed inset-0"]')).toBeFalsy();
    });
  });

  describe('modal content', () => {
    it('should show add medication button when open', () => {
      render(
        <PrescriptionModal
          isOpen={true}
          onClose={vi.fn()}
          patientId="patient-123"
          patientName="Maria Santos"
        />
      );
      const addButtons = screen.getAllByText(/Adicionar/i);
      expect(addButtons.length).toBeGreaterThan(0);
    });
  });
});
