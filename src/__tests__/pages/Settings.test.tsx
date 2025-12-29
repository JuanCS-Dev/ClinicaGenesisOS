/**
 * Settings Page Tests
 *
 * Comprehensive tests for the settings page.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

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
}))

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: { uid: 'user-123', email: 'admin@clinica.com' },
    userProfile: { displayName: 'Dr. Admin', role: 'admin' },
  })),
  useAuthContext: vi.fn(() => ({
    user: { uid: 'user-123', email: 'admin@clinica.com' },
    userProfile: { displayName: 'Dr. Admin', role: 'admin' },
    loading: false,
    error: null,
  })),
}))

// Mock child components to avoid complex dependencies
vi.mock('../../components/settings/PixSettings', () => ({
  PixSettings: () => <div data-testid="pix-settings">PIX Settings Content</div>,
}))

vi.mock('../../components/consent/DataExportRequest', () => ({
  DataExportRequest: () => <div data-testid="data-export">Data Export Content</div>,
}))

vi.mock('../../components/prescription/CertificateSetup', () => ({
  CertificateSetup: () => <div data-testid="certificate-setup">Certificate Setup Content</div>,
}))

vi.mock('../../components/ai/scribe/MetricsDashboard', () => ({
  MetricsDashboard: () => <div data-testid="metrics-dashboard">AI Metrics Content</div>,
}))

vi.mock('../../components/notifications', () => ({
  NotificationPreferences: () => (
    <div data-testid="notification-prefs">Notification Preferences Content</div>
  ),
}))

vi.mock('../../components/settings/WhatsAppSettings', () => ({
  WhatsAppSettings: () => <div data-testid="whatsapp-settings">WhatsApp Settings Content</div>,
}))

vi.mock('../../components/settings/ConvenioSettings', () => ({
  ConvenioSettings: () => <div data-testid="convenio-settings">Convenio Settings Content</div>,
}))

vi.mock('../../components/settings/WorkflowSettings', () => ({
  WorkflowSettings: () => <div data-testid="workflow-settings">Workflow Settings Content</div>,
}))

vi.mock('../../components/settings/ProfileSettings', () => ({
  ProfileSettings: () => <div data-testid="profile-settings">Profile Settings Content</div>,
}))

import { Settings } from '../../pages/Settings'

const renderSettings = () => {
  return render(
    <MemoryRouter>
      <Settings />
    </MemoryRouter>
  )
}

describe('Settings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('rendering', () => {
    it('should render without crashing', () => {
      const { container } = renderSettings()
      expect(container).toBeDefined()
    })

    it('should render page title', () => {
      renderSettings()
      expect(screen.getByText('Configurações')).toBeInTheDocument()
    })

    it('should render page description', () => {
      renderSettings()
      expect(screen.getByText('Gerencie as configurações da sua clínica')).toBeInTheDocument()
    })

    it('should have animation class', () => {
      const { container } = renderSettings()
      expect(container.querySelector('.animate-enter')).toBeTruthy()
    })
  })

  describe('navigation tabs', () => {
    it('should render Meu Perfil tab', () => {
      renderSettings()
      expect(screen.getByText('Meu Perfil')).toBeInTheDocument()
    })

    it('should render Clínica tab', () => {
      renderSettings()
      expect(screen.getByText('Clínica')).toBeInTheDocument()
    })

    it('should render Convênios tab', () => {
      renderSettings()
      expect(screen.getByText('Convênios')).toBeInTheDocument()
    })

    it('should render Notificações tab', () => {
      renderSettings()
      expect(screen.getByText('Notificações')).toBeInTheDocument()
    })

    it('should render WhatsApp tab', () => {
      renderSettings()
      expect(screen.getByText('WhatsApp')).toBeInTheDocument()
    })

    it('should render Automações tab', () => {
      renderSettings()
      expect(screen.getByText('Automações')).toBeInTheDocument()
    })

    it('should render PIX tab', () => {
      renderSettings()
      expect(screen.getByText('PIX')).toBeInTheDocument()
    })

    it('should render Certificado tab', () => {
      renderSettings()
      expect(screen.getByText('Certificado')).toBeInTheDocument()
    })

    it('should render Privacidade tab', () => {
      renderSettings()
      expect(screen.getByText('Privacidade')).toBeInTheDocument()
    })

    it('should render IA tab', () => {
      renderSettings()
      expect(screen.getByText('IA')).toBeInTheDocument()
    })
  })

  describe('default tab', () => {
    // Note: Uses findByTestId (async) because Settings uses lazy loading
    it('should show profile tab content by default', async () => {
      renderSettings()
      expect(await screen.findByTestId('profile-settings')).toBeInTheDocument()
    })
  })

  describe('tab switching', () => {
    it('should switch to Clínica tab when clicked', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Clínica'))
      // Clinic tab should show clinic info (we'd need to check the actual content)
      expect(screen.queryByTestId('profile-settings')).not.toBeInTheDocument()
    })

    // Note: Tests use findByTestId (async) because Settings uses lazy loading
    it('should switch to Convênios tab when clicked', async () => {
      renderSettings()
      fireEvent.click(screen.getByText('Convênios'))
      expect(await screen.findByTestId('convenio-settings')).toBeInTheDocument()
    })

    it('should switch to Notificações tab when clicked', async () => {
      renderSettings()
      fireEvent.click(screen.getByText('Notificações'))
      expect(await screen.findByTestId('notification-prefs')).toBeInTheDocument()
    })

    it('should switch to WhatsApp tab when clicked', async () => {
      renderSettings()
      fireEvent.click(screen.getByText('WhatsApp'))
      expect(await screen.findByTestId('whatsapp-settings')).toBeInTheDocument()
    })

    it('should switch to Automações tab when clicked', async () => {
      renderSettings()
      fireEvent.click(screen.getByText('Automações'))
      expect(await screen.findByTestId('workflow-settings')).toBeInTheDocument()
    })

    it('should switch to PIX tab when clicked', async () => {
      renderSettings()
      fireEvent.click(screen.getByText('PIX'))
      expect(await screen.findByTestId('pix-settings')).toBeInTheDocument()
    })

    it('should switch to Privacidade tab when clicked', async () => {
      renderSettings()
      fireEvent.click(screen.getByText('Privacidade'))
      expect(await screen.findByTestId('data-export')).toBeInTheDocument()
    })

    it('should switch to IA tab when clicked', async () => {
      renderSettings()
      fireEvent.click(screen.getByText('IA'))
      expect(await screen.findByTestId('metrics-dashboard')).toBeInTheDocument()
    })

    it('should switch back to Meu Perfil tab', async () => {
      renderSettings()
      // Switch away
      fireEvent.click(screen.getByText('PIX'))
      expect(await screen.findByTestId('pix-settings')).toBeInTheDocument()

      // Switch back
      fireEvent.click(screen.getByText('Meu Perfil'))
      expect(await screen.findByTestId('profile-settings')).toBeInTheDocument()
    })
  })

  describe('settings panel structure', () => {
    it('should render settings page successfully', () => {
      const { container } = renderSettings()
      expect(container).toBeDefined()
    })
  })

  describe('tab icons', () => {
    it('should render tab icons', () => {
      renderSettings()
      // Check for lucide icons
      const icons = document.querySelectorAll('[class*="lucide"]')
      expect(icons.length).toBeGreaterThan(0)
    })
  })
})
