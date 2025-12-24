/**
 * InvoiceGenerator Component Tests
 *
 * Uses real interface: InvoiceGeneratorProps from component
 * Props: patient?, initialItems?, onGenerate?, onSend?, onClose?
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock ClinicContext
vi.mock('../../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => ({
    clinicId: 'clinic-123',
    clinic: {
      name: 'Clinica Genesis',
      cnpj: '12.345.678/0001-90',
      address: 'Rua Exemplo, 123',
      phone: '11999999999',
      email: 'contato@clinica.com',
    },
  })),
}));

import { InvoiceGenerator } from '../../../components/payments/InvoiceGenerator';

describe('InvoiceGenerator', () => {
  const mockOnGenerate = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('smoke tests', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <InvoiceGenerator onClose={mockOnClose} />
      );
      expect(container).toBeDefined();
    });
  });

  describe('invoice content', () => {
    it('should display patient name when provided', () => {
      render(
        <InvoiceGenerator
          patient={{
            name: 'Maria Santos',
            cpf: '123.456.789-00',
            email: 'maria@email.com',
          }}
          onClose={mockOnClose}
        />
      );
      // Patient name appears in the customer name input
      const nameInput = screen.getByDisplayValue('Maria Santos');
      expect(nameInput).toBeInTheDocument();
    });

    it('should display title', () => {
      render(
        <InvoiceGenerator onClose={mockOnClose} />
      );
      // Title is "Gerar Fatura"
      expect(screen.getByText(/Gerar Fatura/i)).toBeInTheDocument();
    });

    it('should have close button', () => {
      const { container } = render(
        <InvoiceGenerator onClose={mockOnClose} />
      );
      // Close button exists
      expect(container.querySelector('button')).toBeTruthy();
    });

    it('should display initial items total when provided', () => {
      render(
        <InvoiceGenerator
          initialItems={[
            { description: 'Consulta', quantity: 1, unitPrice: 25000, total: 25000 },
          ]}
          onClose={mockOnClose}
        />
      );
      // Total should show - formatPaymentAmount(25000) = "R$ 250,00"
      const totalElements = screen.getAllByText(/250/);
      expect(totalElements.length).toBeGreaterThan(0);
    });
  });

  describe('form fields', () => {
    it('should have customer name input', () => {
      render(<InvoiceGenerator onClose={mockOnClose} />);
      expect(screen.getByPlaceholderText(/Nome do cliente/i)).toBeInTheDocument();
    });

    it('should have CPF input', () => {
      render(<InvoiceGenerator onClose={mockOnClose} />);
      expect(screen.getByPlaceholderText(/000\.000\.000-00/i)).toBeInTheDocument();
    });

    it('should have email input', () => {
      render(<InvoiceGenerator onClose={mockOnClose} />);
      expect(screen.getByPlaceholderText(/email@exemplo.com/i)).toBeInTheDocument();
    });
  });
});
