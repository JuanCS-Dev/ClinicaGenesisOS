/**
 * CertificateSetup Component Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('../../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => ({
    clinicId: 'clinic-123',
    clinic: {
      name: 'Clinica Genesis',
    },
    userProfile: {
      id: 'user-123',
      name: 'Dr. João Silva',
      crm: '123456-SP',
    },
  })),
}));

import { CertificateSetup } from '../../../components/prescription/CertificateSetup';

describe('CertificateSetup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('smoke tests', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <CertificateSetup onComplete={vi.fn()} />
      );
      expect(container).toBeDefined();
    });
  });

  describe('certificate instructions', () => {
    it('should show certificate info', () => {
      render(<CertificateSetup onComplete={vi.fn()} />);
      const certElements = screen.getAllByText(/Certificado|e-CPF/i);
      expect(certElements.length).toBeGreaterThan(0);
    });
  });
});
