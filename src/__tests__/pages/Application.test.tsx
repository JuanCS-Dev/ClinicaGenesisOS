/**
 * Application Page Tests
 *
 * Tests the clinic application/signup form page.
 * No Firebase or context dependencies - just form state and navigation.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Application } from '../../pages/Application';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Application', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderApplication = () => {
    return render(
      <MemoryRouter>
        <Application />
      </MemoryRouter>
    );
  };

  describe('form rendering', () => {
    it('renders the application form', () => {
      renderApplication();
      expect(screen.getByPlaceholderText('Dr. Seu Nome')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Nome da sua estrutura')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/\(DDD\)/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Qtd. Profissionais')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('voce@suaclinica.com')).toBeInTheDocument();
    });

    it('renders submit button', () => {
      renderApplication();
      expect(screen.getByRole('button', { name: /Solicitar Credenciamento/i })).toBeInTheDocument();
    });

    it('renders brand logo', () => {
      renderApplication();
      // Multiple GENESIS texts exist (mobile + desktop versions)
      expect(screen.getAllByText('GENESIS').length).toBeGreaterThan(0);
    });

    it('renders marketing copy', () => {
      renderApplication();
      expect(screen.getByText(/Apenas 3% das clínicas são aprovadas/i)).toBeInTheDocument();
    });
  });

  describe('form interaction', () => {
    it('updates name field', () => {
      renderApplication();
      const nameInput = screen.getByPlaceholderText('Dr. Seu Nome');

      fireEvent.change(nameInput, { target: { value: 'Dr. Maria Silva', name: 'name' } });

      expect(nameInput).toHaveValue('Dr. Maria Silva');
    });

    it('updates clinic name field', () => {
      renderApplication();
      const clinicInput = screen.getByPlaceholderText('Nome da sua estrutura');

      fireEvent.change(clinicInput, { target: { value: 'Clínica Genesis', name: 'clinicName' } });

      expect(clinicInput).toHaveValue('Clínica Genesis');
    });

    it('updates phone field', () => {
      renderApplication();
      const phoneInput = screen.getByPlaceholderText(/\(DDD\)/);

      fireEvent.change(phoneInput, { target: { value: '11999998888', name: 'phone' } });

      expect(phoneInput).toHaveValue('11999998888');
    });

    it('updates professionals field', () => {
      renderApplication();
      const profInput = screen.getByPlaceholderText('Qtd. Profissionais');

      fireEvent.change(profInput, { target: { value: '5', name: 'professionals' } });

      expect(profInput).toHaveValue(5);
    });

    it('updates email field', () => {
      renderApplication();
      const emailInput = screen.getByPlaceholderText('voce@suaclinica.com');

      fireEvent.change(emailInput, { target: { value: 'contato@clinica.com', name: 'email' } });

      expect(emailInput).toHaveValue('contato@clinica.com');
    });
  });

  describe('form submission', () => {
    it('shows loading state during submission', async () => {
      renderApplication();

      // Fill form
      fireEvent.change(screen.getByPlaceholderText('Dr. Seu Nome'), {
        target: { value: 'Dr. Test', name: 'name' }
      });
      fireEvent.change(screen.getByPlaceholderText('Nome da sua estrutura'), {
        target: { value: 'Test Clinic', name: 'clinicName' }
      });
      fireEvent.change(screen.getByPlaceholderText(/\(DDD\)/), {
        target: { value: '11999998888', name: 'phone' }
      });
      fireEvent.change(screen.getByPlaceholderText('Qtd. Profissionais'), {
        target: { value: '3', name: 'professionals' }
      });
      fireEvent.change(screen.getByPlaceholderText('voce@suaclinica.com'), {
        target: { value: 'test@clinic.com', name: 'email' }
      });

      // Submit form
      const submitButton = screen.getByRole('button', { name: /Solicitar Credenciamento/i });
      fireEvent.click(submitButton);

      // Should show loading text
      expect(screen.getByText(/Validando Perfil/i)).toBeInTheDocument();
    });

    it('shows success state after submission', async () => {
      renderApplication();

      // Fill minimal form
      fireEvent.change(screen.getByPlaceholderText('Dr. Seu Nome'), {
        target: { value: 'Dr. Test', name: 'name' }
      });
      fireEvent.change(screen.getByPlaceholderText('Nome da sua estrutura'), {
        target: { value: 'Test Clinic', name: 'clinicName' }
      });
      fireEvent.change(screen.getByPlaceholderText(/\(DDD\)/), {
        target: { value: '11999998888', name: 'phone' }
      });
      fireEvent.change(screen.getByPlaceholderText('Qtd. Profissionais'), {
        target: { value: '3', name: 'professionals' }
      });
      fireEvent.change(screen.getByPlaceholderText('voce@suaclinica.com'), {
        target: { value: 'test@clinic.com', name: 'email' }
      });

      // Submit form
      const form = screen.getByRole('button', { name: /Solicitar Credenciamento/i }).closest('form')!;
      fireEvent.submit(form);

      // Fast-forward through setTimeout (2500ms in component)
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(screen.getByText('Solicitação Criptografada')).toBeInTheDocument();
    });

    it('navigates to home from success screen', async () => {
      renderApplication();

      // Fill and submit form
      fireEvent.change(screen.getByPlaceholderText('Dr. Seu Nome'), {
        target: { value: 'Dr. Test', name: 'name' }
      });
      fireEvent.change(screen.getByPlaceholderText('Nome da sua estrutura'), {
        target: { value: 'Test Clinic', name: 'clinicName' }
      });
      fireEvent.change(screen.getByPlaceholderText(/\(DDD\)/), {
        target: { value: '11999998888', name: 'phone' }
      });
      fireEvent.change(screen.getByPlaceholderText('Qtd. Profissionais'), {
        target: { value: '3', name: 'professionals' }
      });
      fireEvent.change(screen.getByPlaceholderText('voce@suaclinica.com'), {
        target: { value: 'test@clinic.com', name: 'email' }
      });

      const form = screen.getByRole('button', { name: /Solicitar Credenciamento/i }).closest('form')!;
      fireEvent.submit(form);

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(screen.getByText('Retornar à Base')).toBeInTheDocument();

      // Click return button
      fireEvent.click(screen.getByText('Retornar à Base'));
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('navigation', () => {
    it('navigates to home when clicking logo', () => {
      renderApplication();

      // Click on the logo area (first clickable element with GENESIS)
      const logoArea = screen.getAllByText('GENESIS')[0].closest('[class*="cursor-pointer"]');
      if (logoArea) {
        fireEvent.click(logoArea);
        expect(mockNavigate).toHaveBeenCalledWith('/');
      }
    });
  });

  describe('accessibility', () => {
    it('has all required inputs', () => {
      renderApplication();

      // All inputs should have labels
      expect(screen.getByText(/Nome do Titular/i)).toBeInTheDocument();
      expect(screen.getByText(/Nome da Clínica/i)).toBeInTheDocument();
      expect(screen.getByText(/Whatsapp/i)).toBeInTheDocument();
      expect(screen.getByText(/Equipe/i)).toBeInTheDocument();
      expect(screen.getByText(/Email Corporativo/i)).toBeInTheDocument();
    });

    it('disables submit button while submitting', async () => {
      renderApplication();

      fireEvent.change(screen.getByPlaceholderText('Dr. Seu Nome'), {
        target: { value: 'Dr. Test', name: 'name' }
      });

      const form = screen.getByRole('button', { name: /Solicitar Credenciamento/i }).closest('form')!;
      fireEvent.submit(form);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });
});
