/**
 * MedicationForm Component Tests
 *
 * Uses real interface: MedicationFormProps from component
 * Props: medication, index, onMedicationSelect, onUpdate, onRemove
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import { MedicationForm } from '../../../components/prescription/MedicationForm';

// Mock medication matching PrescriptionMedication interface
const mockMedication = {
  id: 'med-123',
  name: 'Dipirona 500mg',
  dosage: '1 comprimido',
  unit: 'comprimido' as const,
  route: 'oral' as const,
  frequency: '8/8h',
  duration: '5 dias',
  quantity: 15,
  isControlled: false,
  continuousUse: false,
};

describe('MedicationForm', () => {
  const mockOnMedicationSelect = vi.fn();
  const mockOnUpdate = vi.fn();
  const mockOnRemove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('smoke tests', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <MedicationForm
          medication={mockMedication}
          index={0}
          onMedicationSelect={mockOnMedicationSelect}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
        />
      );
      expect(container).toBeDefined();
    });
  });

  describe('form fields', () => {
    it('should display medication name when set', () => {
      render(
        <MedicationForm
          medication={mockMedication}
          index={0}
          onMedicationSelect={mockOnMedicationSelect}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
        />
      );
      // Medication name is displayed in a span (blue-900 text), not an input
      const nameElements = screen.getAllByText(/Dipirona/i);
      expect(nameElements.length).toBeGreaterThan(0);
    });

    it('should display medication index label', () => {
      render(
        <MedicationForm
          medication={mockMedication}
          index={2}
          onMedicationSelect={mockOnMedicationSelect}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
        />
      );
      // Shows "Medicamento 3" (1-indexed)
      expect(screen.getByText(/Medicamento 3/i)).toBeInTheDocument();
    });

    it('should have remove button', () => {
      const { container } = render(
        <MedicationForm
          medication={mockMedication}
          index={0}
          onMedicationSelect={mockOnMedicationSelect}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
        />
      );
      // Trash icon button exists
      expect(container.querySelector('button')).toBeTruthy();
    });

    it('should have dosage input with value', () => {
      render(
        <MedicationForm
          medication={mockMedication}
          index={0}
          onMedicationSelect={mockOnMedicationSelect}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
        />
      );
      const dosageInput = screen.getByDisplayValue('1 comprimido');
      expect(dosageInput).toBeInTheDocument();
    });
  });
});
