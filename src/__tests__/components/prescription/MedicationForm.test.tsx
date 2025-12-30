/**
 * MedicationForm Component Tests
 *
 * Uses real interface: MedicationFormProps from component
 * Props: medication, index, onMedicationSelect, onUpdate, onRemove
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { MedicationForm } from '../../../components/prescription/MedicationForm'

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
  instructions: '',
}

const controlledMedication = {
  ...mockMedication,
  id: 'med-controlled',
  name: 'Rivotril 2mg',
  isControlled: true,
  controlType: 'B1' as const,
}

describe('MedicationForm', () => {
  const mockOnMedicationSelect = vi.fn()
  const mockOnUpdate = vi.fn()
  const mockOnRemove = vi.fn()

  const defaultProps = {
    medication: mockMedication,
    index: 0,
    onMedicationSelect: mockOnMedicationSelect,
    onUpdate: mockOnUpdate,
    onRemove: mockOnRemove,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('smoke tests', () => {
    it('should render without crashing', () => {
      const { container } = render(<MedicationForm {...defaultProps} />)
      expect(container).toBeDefined()
    })

    it('should render all form sections', () => {
      const { container } = render(<MedicationForm {...defaultProps} />)
      expect(container.querySelector('.space-y-4')).toBeInTheDocument()
    })
  })

  describe('medication display', () => {
    it('should display medication name when set', () => {
      render(<MedicationForm {...defaultProps} />)
      const nameElements = screen.getAllByText(/Dipirona/i)
      expect(nameElements.length).toBeGreaterThan(0)
    })

    it('should display medication index label', () => {
      render(<MedicationForm {...defaultProps} index={2} />)
      expect(screen.getByText(/Medicamento 3/i)).toBeInTheDocument()
    })

    it('should show controlled badge for controlled medications', () => {
      render(<MedicationForm {...defaultProps} medication={controlledMedication} />)
      expect(screen.getByText('B1')).toBeInTheDocument()
    })

    it('should not show controlled badge for non-controlled medications', () => {
      render(<MedicationForm {...defaultProps} />)
      expect(screen.queryByText('B1')).not.toBeInTheDocument()
    })

    it('should not show medication name section when name is empty', () => {
      const emptyNameMed = { ...mockMedication, name: '' }
      render(<MedicationForm {...defaultProps} medication={emptyNameMed} />)
      expect(screen.queryByText(/Dipirona/)).not.toBeInTheDocument()
    })
  })

  describe('remove button', () => {
    it('should have remove button with title', () => {
      render(<MedicationForm {...defaultProps} />)
      expect(screen.getByTitle('Remover medicamento')).toBeInTheDocument()
    })

    it('should call onRemove with correct index when clicked', async () => {
      const user = userEvent.setup()
      render(<MedicationForm {...defaultProps} index={2} />)

      const removeButton = screen.getByTitle('Remover medicamento')
      await user.click(removeButton)

      expect(mockOnRemove).toHaveBeenCalledWith(2)
    })
  })

  describe('dosage and frequency inputs', () => {
    it('should show dosage input with value', () => {
      render(<MedicationForm {...defaultProps} />)
      expect(screen.getByDisplayValue('1 comprimido')).toBeInTheDocument()
    })

    it('should show frequency input with value', () => {
      render(<MedicationForm {...defaultProps} />)
      expect(screen.getByDisplayValue('8/8h')).toBeInTheDocument()
    })

    it('should call onUpdate when dosage changes', async () => {
      const user = userEvent.setup()
      render(<MedicationForm {...defaultProps} />)

      const dosageInput = screen.getByDisplayValue('1 comprimido')
      await user.clear(dosageInput)
      await user.type(dosageInput, '2 comprimidos')

      expect(mockOnUpdate).toHaveBeenCalledWith(0, 'dosage', expect.any(String))
    })

    it('should call onUpdate when frequency changes', async () => {
      const user = userEvent.setup()
      render(<MedicationForm {...defaultProps} />)

      const frequencyInput = screen.getByDisplayValue('8/8h')
      await user.clear(frequencyInput)
      await user.type(frequencyInput, '12/12h')

      expect(mockOnUpdate).toHaveBeenCalledWith(0, 'frequency', expect.any(String))
    })

    it('should have posologia label', () => {
      render(<MedicationForm {...defaultProps} />)
      expect(screen.getByText('Posologia')).toBeInTheDocument()
    })

    it('should have frequência label', () => {
      render(<MedicationForm {...defaultProps} />)
      expect(screen.getByText('Frequência')).toBeInTheDocument()
    })
  })

  describe('duration and quantity inputs', () => {
    it('should show duration input with value', () => {
      render(<MedicationForm {...defaultProps} />)
      expect(screen.getByDisplayValue('5 dias')).toBeInTheDocument()
    })

    it('should show quantity input with value', () => {
      render(<MedicationForm {...defaultProps} />)
      expect(screen.getByDisplayValue('15')).toBeInTheDocument()
    })

    it('should call onUpdate when duration changes', async () => {
      const user = userEvent.setup()
      render(<MedicationForm {...defaultProps} />)

      const durationInput = screen.getByDisplayValue('5 dias')
      await user.clear(durationInput)
      await user.type(durationInput, '7 dias')

      expect(mockOnUpdate).toHaveBeenCalledWith(0, 'duration', expect.any(String))
    })

    it('should call onUpdate when quantity changes', () => {
      render(<MedicationForm {...defaultProps} />)

      const quantityInput = screen.getByDisplayValue('15')
      fireEvent.change(quantityInput, { target: { value: '20' } })

      expect(mockOnUpdate).toHaveBeenCalledWith(0, 'quantity', 20)
    })

    it('should have duração label', () => {
      render(<MedicationForm {...defaultProps} />)
      expect(screen.getByText('Duração')).toBeInTheDocument()
    })

    it('should have quantidade label', () => {
      render(<MedicationForm {...defaultProps} />)
      expect(screen.getByText('Quantidade')).toBeInTheDocument()
    })
  })

  describe('unit select', () => {
    it('should have unidade label', () => {
      render(<MedicationForm {...defaultProps} />)
      expect(screen.getByText('Unidade')).toBeInTheDocument()
    })

    it('should show current unit value', () => {
      render(<MedicationForm {...defaultProps} />)
      const unitSelect = screen.getByDisplayValue('comprimido')
      expect(unitSelect).toBeInTheDocument()
    })

    it('should have all unit options', () => {
      render(<MedicationForm {...defaultProps} />)
      expect(screen.getByRole('option', { name: 'comprimido' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'cápsula' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'ml' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'mg' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'gota' })).toBeInTheDocument()
    })

    it('should call onUpdate when unit changes', () => {
      render(<MedicationForm {...defaultProps} />)

      const unitSelect = screen.getByDisplayValue('comprimido')
      fireEvent.change(unitSelect, { target: { value: 'cápsula' } })

      expect(mockOnUpdate).toHaveBeenCalledWith(0, 'unit', 'cápsula')
    })
  })

  describe('route select', () => {
    it('should have via de administração label', () => {
      render(<MedicationForm {...defaultProps} />)
      expect(screen.getByText('Via de Administração')).toBeInTheDocument()
    })

    it('should call onUpdate when route changes', () => {
      render(<MedicationForm {...defaultProps} />)

      // Find the route select (it has Oral as current value)
      const selects = screen.getAllByRole('combobox')
      const routeSelect = selects.find(
        s => s.textContent?.includes('Oral') || (s as HTMLSelectElement).value === 'oral'
      )

      if (routeSelect) {
        fireEvent.change(routeSelect, { target: { value: 'sublingual' } })
        expect(mockOnUpdate).toHaveBeenCalledWith(0, 'route', 'sublingual')
      }
    })
  })

  describe('continuous use checkbox', () => {
    it('should have uso contínuo label', () => {
      render(<MedicationForm {...defaultProps} />)
      expect(screen.getByText('Uso contínuo')).toBeInTheDocument()
    })

    it('should show unchecked when continuousUse is false', () => {
      render(<MedicationForm {...defaultProps} />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeChecked()
    })

    it('should show checked when continuousUse is true', () => {
      const continuousMed = { ...mockMedication, continuousUse: true }
      render(<MedicationForm {...defaultProps} medication={continuousMed} />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeChecked()
    })

    it('should call onUpdate when checkbox is toggled', async () => {
      const user = userEvent.setup()
      render(<MedicationForm {...defaultProps} />)

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      expect(mockOnUpdate).toHaveBeenCalledWith(0, 'continuousUse', true)
    })
  })

  describe('instructions input', () => {
    it('should have instruções label', () => {
      render(<MedicationForm {...defaultProps} />)
      expect(screen.getByText(/Instruções adicionais/i)).toBeInTheDocument()
    })

    it('should have placeholder text', () => {
      render(<MedicationForm {...defaultProps} />)
      expect(screen.getByPlaceholderText(/Tomar com água/i)).toBeInTheDocument()
    })

    it('should show empty when instructions is empty', () => {
      render(<MedicationForm {...defaultProps} />)
      const instructionsInput = screen.getByPlaceholderText(/Tomar com água/i)
      expect(instructionsInput).toHaveValue('')
    })

    it('should show value when instructions is set', () => {
      const medWithInstructions = { ...mockMedication, instructions: 'Tomar em jejum' }
      render(<MedicationForm {...defaultProps} medication={medWithInstructions} />)
      expect(screen.getByDisplayValue('Tomar em jejum')).toBeInTheDocument()
    })

    it('should call onUpdate when instructions changes', async () => {
      const user = userEvent.setup()
      render(<MedicationForm {...defaultProps} />)

      const instructionsInput = screen.getByPlaceholderText(/Tomar com água/i)
      await user.type(instructionsInput, 'Antes das refeições')

      expect(mockOnUpdate).toHaveBeenCalledWith(0, 'instructions', expect.any(String))
    })
  })

  describe('edge cases', () => {
    it('should handle quantity of 0 becoming 1', () => {
      render(<MedicationForm {...defaultProps} />)

      const quantityInput = screen.getByDisplayValue('15')
      fireEvent.change(quantityInput, { target: { value: '' } })

      // NaN becomes 1
      expect(mockOnUpdate).toHaveBeenCalledWith(0, 'quantity', 1)
    })

    it('should handle null instructions', () => {
      const medWithNullInstructions = { ...mockMedication, instructions: undefined }
      render(<MedicationForm {...defaultProps} medication={medWithNullInstructions} />)
      expect(screen.getByPlaceholderText(/Tomar com água/i)).toHaveValue('')
    })

    it('should render different index correctly', () => {
      render(<MedicationForm {...defaultProps} index={9} />)
      expect(screen.getByText(/Medicamento 10/i)).toBeInTheDocument()
    })
  })
})
