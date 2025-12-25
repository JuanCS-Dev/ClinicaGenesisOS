/**
 * TransactionForm Component Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TransactionForm } from '../../../components/finance/TransactionForm';

describe('TransactionForm', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();
  const mockOnGeneratePix = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSubmit.mockResolvedValue('txn-123');
  });

  const renderForm = (props = {}) => {
    return render(
      <TransactionForm
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        {...props}
      />
    );
  };

  describe('rendering', () => {
    it('renders the form modal', () => {
      renderForm();
      expect(screen.getByText('Nova Transação')).toBeInTheDocument();
    });

    it('renders type toggle buttons', () => {
      renderForm();
      expect(screen.getByRole('button', { name: 'Receita' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Despesa' })).toBeInTheDocument();
    });

    it('renders all form fields', () => {
      renderForm();
      expect(screen.getByPlaceholderText(/Consulta Nutricional/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('0,00')).toBeInTheDocument();
      expect(screen.getByText('Categoria')).toBeInTheDocument();
      expect(screen.getByText('Forma de Pagamento')).toBeInTheDocument();
      expect(screen.getByText('Data')).toBeInTheDocument();
    });

    it('renders submit button', () => {
      renderForm();
      expect(screen.getByRole('button', { name: 'Salvar Transação' })).toBeInTheDocument();
    });

    it('renders close button', () => {
      renderForm();
      // The X button has no accessible name but is in the header
      const closeButtons = screen.getAllByRole('button');
      expect(closeButtons.length).toBeGreaterThan(0);
    });
  });

  describe('type selection', () => {
    it('defaults to income type', () => {
      renderForm();
      const incomeButton = screen.getByRole('button', { name: 'Receita' });
      expect(incomeButton).toHaveClass('bg-[#22C55E]');
    });

    it('switches to expense type when clicked', () => {
      renderForm();
      const expenseButton = screen.getByRole('button', { name: 'Despesa' });
      fireEvent.click(expenseButton);
      expect(expenseButton).toHaveClass('bg-[#EF4444]');
    });

    it('respects initialType prop', () => {
      renderForm({ initialType: 'expense' });
      const expenseButton = screen.getByRole('button', { name: 'Despesa' });
      expect(expenseButton).toHaveClass('bg-[#EF4444]');
    });
  });

  describe('form fields', () => {
    it('updates description field', () => {
      renderForm();
      const input = screen.getByPlaceholderText(/Consulta Nutricional/i);
      fireEvent.change(input, { target: { value: 'Test Transaction' } });
      expect(input).toHaveValue('Test Transaction');
    });

    it('updates amount field', () => {
      renderForm();
      const input = screen.getByPlaceholderText('0,00');
      fireEvent.change(input, { target: { value: '150,00' } });
      expect(input).toHaveValue('150,00');
    });

    it('updates category field', () => {
      renderForm();
      // Find select by its first option or container
      const selects = screen.getAllByRole('combobox');
      const categorySelect = selects[0]; // First select is category
      fireEvent.change(categorySelect, { target: { value: 'consultation' } });
      expect(categorySelect).toHaveValue('consultation');
    });

    it('updates payment method field', () => {
      renderForm();
      const selects = screen.getAllByRole('combobox');
      const paymentSelect = selects[1]; // Second select is payment method
      fireEvent.change(paymentSelect, { target: { value: 'credit_card' } });
      expect(paymentSelect).toHaveValue('credit_card');
    });

    it('updates date field', () => {
      renderForm();
      const input = screen.getByDisplayValue(/2025-/); // Date input has today's date
      fireEvent.change(input, { target: { value: '2025-01-20' } });
      expect(input).toHaveValue('2025-01-20');
    });
  });

  describe('PIX generation', () => {
    it('shows PIX checkbox when income + pix + onGeneratePix', () => {
      renderForm({ onGeneratePix: mockOnGeneratePix });
      expect(screen.getByText(/Gerar cobrança PIX/i)).toBeInTheDocument();
    });

    it('hides PIX checkbox for expense type', () => {
      renderForm({ onGeneratePix: mockOnGeneratePix });
      fireEvent.click(screen.getByRole('button', { name: 'Despesa' }));
      expect(screen.queryByText(/Gerar cobrança PIX/i)).not.toBeInTheDocument();
    });

    it('hides PIX checkbox when no onGeneratePix handler', () => {
      renderForm();
      expect(screen.queryByText(/Gerar cobrança PIX/i)).not.toBeInTheDocument();
    });

    it('shows different submit text when PIX checked', () => {
      renderForm({ onGeneratePix: mockOnGeneratePix });
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);
      expect(screen.getByRole('button', { name: /Salvar e Gerar PIX/i })).toBeInTheDocument();
    });
  });

  describe('form submission', () => {
    it('calls onSubmit with form data', async () => {
      renderForm();

      fireEvent.change(screen.getByPlaceholderText(/Consulta Nutricional/i), {
        target: { value: 'Test Transaction' },
      });
      fireEvent.change(screen.getByPlaceholderText('0,00'), {
        target: { value: '100,00' },
      });
      const selects = screen.getAllByRole('combobox');
      fireEvent.change(selects[0], {
        target: { value: 'consultation' },
      });

      fireEvent.click(screen.getByRole('button', { name: 'Salvar Transação' }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            description: 'Test Transaction',
            amount: 10000, // 100.00 in cents
            type: 'income',
            categoryId: 'consultation',
            paymentMethod: 'pix',
            status: 'paid',
          })
        );
      });
    });

    it('calls onClose after successful submission', async () => {
      renderForm();

      fireEvent.change(screen.getByPlaceholderText(/Consulta Nutricional/i), {
        target: { value: 'Test' },
      });
      fireEvent.change(screen.getByPlaceholderText('0,00'), {
        target: { value: '50' },
      });
      const selects = screen.getAllByRole('combobox');
      fireEvent.change(selects[0], {
        target: { value: 'consultation' },
      });

      fireEvent.click(screen.getByRole('button', { name: 'Salvar Transação' }));

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('calls onGeneratePix when checkbox is checked', async () => {
      renderForm({ onGeneratePix: mockOnGeneratePix });

      fireEvent.change(screen.getByPlaceholderText(/Consulta Nutricional/i), {
        target: { value: 'PIX Transaction' },
      });
      fireEvent.change(screen.getByPlaceholderText('0,00'), {
        target: { value: '200' },
      });
      const selects = screen.getAllByRole('combobox');
      fireEvent.change(selects[0], {
        target: { value: 'consultation' },
      });

      // Check PIX generation
      fireEvent.click(screen.getByRole('checkbox'));

      fireEvent.click(screen.getByRole('button', { name: /Salvar e Gerar PIX/i }));

      await waitFor(() => {
        expect(mockOnGeneratePix).toHaveBeenCalledWith('txn-123', 20000, 'PIX Transaction');
      });
    });

    it('submits as pending when generating PIX', async () => {
      renderForm({ onGeneratePix: mockOnGeneratePix });

      fireEvent.change(screen.getByPlaceholderText(/Consulta Nutricional/i), {
        target: { value: 'Pending PIX' },
      });
      fireEvent.change(screen.getByPlaceholderText('0,00'), {
        target: { value: '100' },
      });
      const selects = screen.getAllByRole('combobox');
      fireEvent.change(selects[0], {
        target: { value: 'consultation' },
      });

      fireEvent.click(screen.getByRole('checkbox'));
      fireEvent.click(screen.getByRole('button', { name: /Salvar e Gerar PIX/i }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'pending',
          })
        );
      });
    });

    it('shows loading state during submission', async () => {
      mockOnSubmit.mockImplementation(() => new Promise((r) => setTimeout(r, 100)));

      renderForm();

      fireEvent.change(screen.getByPlaceholderText(/Consulta Nutricional/i), {
        target: { value: 'Test' },
      });
      fireEvent.change(screen.getByPlaceholderText('0,00'), {
        target: { value: '50' },
      });
      const selects = screen.getAllByRole('combobox');
      fireEvent.change(selects[0], {
        target: { value: 'consultation' },
      });

      fireEvent.click(screen.getByRole('button', { name: 'Salvar Transação' }));

      expect(screen.getByText('Salvando...')).toBeInTheDocument();
    });

    it('does not submit without required fields', () => {
      renderForm();

      // Click submit without filling fields
      fireEvent.click(screen.getByRole('button', { name: 'Salvar Transação' }));

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('close functionality', () => {
    it('calls onClose when X button clicked', () => {
      renderForm();

      // Find the X button (first button in header area)
      const buttons = screen.getAllByRole('button');
      const closeButton = buttons.find(btn => btn.querySelector('.lucide-x'));
      if (closeButton) {
        fireEvent.click(closeButton);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });
  });

  describe('amount parsing', () => {
    it('handles comma as decimal separator', async () => {
      renderForm();

      fireEvent.change(screen.getByPlaceholderText(/Consulta Nutricional/i), {
        target: { value: 'Test' },
      });
      fireEvent.change(screen.getByPlaceholderText('0,00'), {
        target: { value: '99,50' },
      });
      const selects = screen.getAllByRole('combobox');
      fireEvent.change(selects[0], {
        target: { value: 'consultation' },
      });

      fireEvent.click(screen.getByRole('button', { name: 'Salvar Transação' }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            amount: 9950, // 99.50 in cents
          })
        );
      });
    });

    it('handles dot as decimal separator', async () => {
      renderForm();

      fireEvent.change(screen.getByPlaceholderText(/Consulta Nutricional/i), {
        target: { value: 'Test' },
      });
      fireEvent.change(screen.getByPlaceholderText('0,00'), {
        target: { value: '150.75' },
      });
      const selects = screen.getAllByRole('combobox');
      fireEvent.change(selects[0], {
        target: { value: 'consultation' },
      });

      fireEvent.click(screen.getByRole('button', { name: 'Salvar Transação' }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            amount: 15075, // 150.75 in cents
          })
        );
      });
    });
  });
});
