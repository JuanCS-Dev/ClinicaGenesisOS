/**
 * Patient Portal Messages Tests
 *
 * Smoke tests for secure messaging.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../contexts/PatientAuthContext', () => ({
  usePatientAuth: vi.fn(() => ({
    patient: { id: 'patient-123', name: 'Maria Santos' },
    isAuthenticated: true,
  })),
}));

import { PatientMessages } from '../../../pages/patient-portal/Messages';

const renderMessages = () => {
  return render(
    <MemoryRouter>
      <PatientMessages />
    </MemoryRouter>
  );
};

describe('PatientMessages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('smoke tests', () => {
    it('should render without crashing', () => {
      const { container } = renderMessages();
      expect(container).toBeDefined();
    });
  });

  describe('header', () => {
    it('should render page title', () => {
      renderMessages();
      expect(screen.getByText(/Mensagens/i)).toBeInTheDocument();
    });

    it('should render new message button', () => {
      renderMessages();
      expect(screen.getByText(/Nova Mensagem/i)).toBeInTheDocument();
    });
  });

  describe('conversations list', () => {
    it('should display provider names from mock data', () => {
      renderMessages();
      const drElements = screen.getAllByText(/Dr\. João Silva/i);
      expect(drElements.length).toBeGreaterThan(0);
    });
  });

  describe('search', () => {
    it('should render search input', () => {
      renderMessages();
      expect(screen.getByPlaceholderText(/Buscar/i)).toBeInTheDocument();
    });
  });
});
