/**
 * Settings Page Tests
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => ({
    clinicId: 'clinic-123',
    clinic: {
      id: 'clinic-123',
      name: 'Clínica Genesis',
      cnpj: '12345678000190',
      address: 'Rua Exemplo, 123',
      phone: '11999999999',
    },
    updateClinic: vi.fn(),
  })),
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: { uid: 'user-123', email: 'admin@clinica.com' },
    userProfile: { displayName: 'Dr. Admin', role: 'admin' },
  })),
}));

// Mock child components to avoid complex dependencies
vi.mock('../../components/settings/PixSettings', () => ({
  PixSettings: () => <div data-testid="pix-settings">PIX Settings</div>,
}));

vi.mock('../../components/consent/DataExportRequest', () => ({
  DataExportRequest: () => <div data-testid="data-export">Data Export</div>,
}));

vi.mock('../../components/prescription/CertificateSetup', () => ({
  CertificateSetup: () => <div data-testid="certificate-setup">Certificate Setup</div>,
}));

vi.mock('../../components/ai/scribe/MetricsDashboard', () => ({
  MetricsDashboard: () => <div data-testid="metrics-dashboard">AI Metrics</div>,
}));

vi.mock('../../components/notifications', () => ({
  NotificationPreferences: () => <div data-testid="notification-prefs">Notification Preferences</div>,
}));

vi.mock('../../components/settings/WhatsAppSettings', () => ({
  WhatsAppSettings: () => <div data-testid="whatsapp-settings">WhatsApp Settings</div>,
}));

vi.mock('../../components/settings/ConvenioSettings', () => ({
  ConvenioSettings: () => <div data-testid="convenio-settings">Convenio Settings</div>,
}));

vi.mock('../../components/settings/WorkflowSettings', () => ({
  WorkflowSettings: () => <div data-testid="workflow-settings">Workflow Settings</div>,
}));

import { Settings } from '../../pages/Settings';

const renderSettings = () => {
  return render(
    <MemoryRouter>
      <Settings />
    </MemoryRouter>
  );
};

describe('Settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render page title', () => {
      renderSettings();
      expect(screen.getByText('Configurações')).toBeInTheDocument();
    });

    it('should render page description', () => {
      renderSettings();
      expect(screen.getByText('Gerencie as configurações da sua clínica')).toBeInTheDocument();
    });
  });

  describe('navigation tabs', () => {
    it('should render all tab buttons', () => {
      renderSettings();
      expect(screen.getByText('Clínica')).toBeInTheDocument();
      expect(screen.getByText('Convênios')).toBeInTheDocument();
      expect(screen.getByText('Notificações')).toBeInTheDocument();
      expect(screen.getByText('WhatsApp')).toBeInTheDocument();
      expect(screen.getByText('Automações')).toBeInTheDocument();
      expect(screen.getByText('PIX')).toBeInTheDocument();
      expect(screen.getByText('Certificado')).toBeInTheDocument();
      expect(screen.getByText('Privacidade')).toBeInTheDocument();
      expect(screen.getByText('IA')).toBeInTheDocument();
    });

    it('should show clinic tab content by default', () => {
      renderSettings();
      expect(screen.getByText('Informações da Clínica')).toBeInTheDocument();
    });

    it('should display clinic name in clinic tab', () => {
      renderSettings();
      // The clinic name is shown in the input field
      const input = screen.getByDisplayValue('Clínica Genesis');
      expect(input).toBeInTheDocument();
    });
  });

  describe('tab navigation', () => {
    it('should switch to Convênios tab when clicked', () => {
      renderSettings();
      fireEvent.click(screen.getByText('Convênios'));
      expect(screen.getByTestId('convenio-settings')).toBeInTheDocument();
    });

    it('should switch to Notificações tab when clicked', () => {
      renderSettings();
      fireEvent.click(screen.getByText('Notificações'));
      expect(screen.getByTestId('notification-prefs')).toBeInTheDocument();
    });

    it('should switch to WhatsApp tab when clicked', () => {
      renderSettings();
      fireEvent.click(screen.getByText('WhatsApp'));
      expect(screen.getByTestId('whatsapp-settings')).toBeInTheDocument();
    });

    it('should switch to PIX tab when clicked', () => {
      renderSettings();
      fireEvent.click(screen.getByText('PIX'));
      expect(screen.getByTestId('pix-settings')).toBeInTheDocument();
    });

    it('should switch to IA tab when clicked', () => {
      renderSettings();
      fireEvent.click(screen.getByText('IA'));
      expect(screen.getByTestId('metrics-dashboard')).toBeInTheDocument();
    });
  });

  describe('clinic info section', () => {
    it('should have readonly clinic name input', () => {
      renderSettings();
      const input = screen.getByDisplayValue('Clínica Genesis');
      expect(input).toHaveAttribute('readonly');
    });

    it('should show support message', () => {
      renderSettings();
      expect(screen.getByText(/entre em contato com o suporte/i)).toBeInTheDocument();
    });
  });
});
