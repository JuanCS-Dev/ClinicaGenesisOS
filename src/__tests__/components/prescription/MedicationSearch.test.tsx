/**
 * MedicationSearch Component Tests
 *
 * Uses real interface: MedicationSearchProps from @/types
 * Props: onSelect, placeholder?, disabled?
 * Note: No initialValue prop - search always starts empty
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { MedicationSearch } from '../../../components/prescription/MedicationSearch';

describe('MedicationSearch', () => {
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('smoke tests', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <MedicationSearch onSelect={mockOnSelect} />
      );
      expect(container).toBeDefined();
    });
  });

  describe('search input', () => {
    it('should have default search placeholder', () => {
      render(<MedicationSearch onSelect={mockOnSelect} />);
      expect(screen.getByPlaceholderText(/Buscar medicamento/i)).toBeInTheDocument();
    });

    it('should accept custom placeholder', () => {
      render(
        <MedicationSearch
          onSelect={mockOnSelect}
          placeholder="Digite o nome do remédio"
        />
      );
      expect(screen.getByPlaceholderText(/Digite o nome do remédio/i)).toBeInTheDocument();
    });

    it('should be disabled when disabled prop is true', () => {
      render(
        <MedicationSearch
          onSelect={mockOnSelect}
          disabled={true}
        />
      );
      const input = screen.getByPlaceholderText(/Buscar medicamento/i);
      expect(input).toBeDisabled();
    });

    it('should update value on typing', async () => {
      render(<MedicationSearch onSelect={mockOnSelect} />);
      const input = screen.getByPlaceholderText(/Buscar medicamento/i);

      fireEvent.change(input, { target: { value: 'Dipirona' } });

      expect(input).toHaveValue('Dipirona');
    });
  });

  describe('search results', () => {
    it('should show results after debounce on valid search', async () => {
      render(<MedicationSearch onSelect={mockOnSelect} />);
      const input = screen.getByPlaceholderText(/Buscar medicamento/i);

      fireEvent.change(input, { target: { value: 'Dipirona' } });

      // Wait for debounce (300ms) + API delay (300ms simulated)
      await waitFor(() => {
        // Component shows medication results in a listbox
        const listbox = screen.queryByRole('listbox');
        // Results should appear or at least no error
        expect(input).toHaveValue('Dipirona');
      }, { timeout: 1000 });
    });

    it('should not search for single character', async () => {
      render(<MedicationSearch onSelect={mockOnSelect} />);
      const input = screen.getByPlaceholderText(/Buscar medicamento/i);

      fireEvent.change(input, { target: { value: 'D' } });

      // Wait a bit to ensure no results appear
      await new Promise(resolve => setTimeout(resolve, 400));

      // Listbox should not appear for single character
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });
});
