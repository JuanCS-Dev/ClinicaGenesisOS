/**
 * Landing Page Tests
 *
 * Tests the marketing landing page.
 * Mocks Navbar component and useNavigate.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Landing } from '../../pages/Landing';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock Navbar component
vi.mock('../../components/landing/Navbar', () => ({
  Navbar: () => <nav data-testid="navbar">Navbar Mock</nav>,
}));

describe('Landing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderLanding = () => {
    return render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );
  };

  describe('rendering', () => {
    it('renders the navbar', () => {
      renderLanding();
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });

    it('renders hero headline', () => {
      renderLanding();
      expect(screen.getByText(/Mesmo preço dos concorrentes/i)).toBeInTheDocument();
      expect(screen.getByText(/10x mais tecnologia/i)).toBeInTheDocument();
    });

    it('renders hero subtext', () => {
      renderLanding();
      expect(screen.getByText(/AI Scribe transcreve consultas/i)).toBeInTheDocument();
    });

    it('renders platform badge', () => {
      renderLanding();
      expect(screen.getByText(/O único software médico com IA de verdade/i)).toBeInTheDocument();
    });

    it('renders CTA buttons', () => {
      renderLanding();
      // Multiple "Começar" buttons exist
      expect(screen.getAllByRole('button', { name: /Começar/i }).length).toBeGreaterThan(0);
      expect(screen.getByRole('button', { name: /Ver Demo Médico/i })).toBeInTheDocument();
    });

    it('renders patient portal buttons', () => {
      renderLanding();
      expect(screen.getByRole('button', { name: /Ver Demo Paciente/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Já sou paciente/i })).toBeInTheDocument();
    });
  });

  describe('metrics section', () => {
    it('renders engineering metrics heading', () => {
      renderLanding();
      expect(screen.getByText('Engenharia de Verdade')).toBeInTheDocument();
    });

    it('renders hours saved metric', () => {
      renderLanding();
      expect(screen.getByText('40h')).toBeInTheDocument();
      expect(screen.getByText('Horas economizadas/mês')).toBeInTheDocument();
    });

    it('renders test count metric', () => {
      renderLanding();
      expect(screen.getByText('2.636')).toBeInTheDocument();
      expect(screen.getByText('Testes Automatizados')).toBeInTheDocument();
    });

    it('renders uptime metric', () => {
      renderLanding();
      expect(screen.getByText('99.9%')).toBeInTheDocument();
      expect(screen.getByText('Uptime Garantido')).toBeInTheDocument();
    });

    it('renders bureaucracy reduction metric', () => {
      renderLanding();
      expect(screen.getByText('-40%')).toBeInTheDocument();
      expect(screen.getByText('Menos tempo em burocracia')).toBeInTheDocument();
    });
  });

  describe('problem section', () => {
    it('renders problem headline', () => {
      renderLanding();
      expect(screen.getByText('O mercado de saúde está quebrado')).toBeInTheDocument();
    });

    it('renders bureaucracy problem', () => {
      renderLanding();
      expect(screen.getByText('Burocracia Excessiva')).toBeInTheDocument();
      expect(screen.getByText(/40% do tempo do médico/i)).toBeInTheDocument();
    });

    it('renders TISS glosa problem', () => {
      renderLanding();
      expect(screen.getByText('Glosa no TISS')).toBeInTheDocument();
      expect(screen.getByText(/30% das guias são glosadas/i)).toBeInTheDocument();
    });

    it('renders diagnosis problem', () => {
      renderLanding();
      expect(screen.getByText('Diagnóstico Isolado')).toBeInTheDocument();
    });
  });

  describe('features section', () => {
    it('renders section heading', () => {
      renderLanding();
      expect(screen.getByText('Tudo em uma plataforma')).toBeInTheDocument();
    });

    it('renders AI Scribe feature', () => {
      renderLanding();
      expect(screen.getByText('AI Scribe')).toBeInTheDocument();
      expect(screen.getByText(/Economize 15 minutos por consulta/i)).toBeInTheDocument();
    });

    it('renders Diagnóstico Multi-LLM feature', () => {
      renderLanding();
      // Appears in features and comparison sections
      expect(screen.getAllByText('Diagnóstico Multi-LLM').length).toBeGreaterThan(0);
      expect(screen.getByText(/3 IAs.*analisam o caso/i)).toBeInTheDocument();
    });

    it('renders Análise de Exames feature', () => {
      renderLanding();
      // Appears in features and comparison sections
      expect(screen.getAllByText('Análise de Exames com IA').length).toBeGreaterThan(0);
    });

    it('renders TISS feature', () => {
      renderLanding();
      expect(screen.getByText('TISS 4.02.00 Nativo')).toBeInTheDocument();
    });

    it('renders Telemedicina feature', () => {
      renderLanding();
      expect(screen.getByText('Telemedicina E2E')).toBeInTheDocument();
    });

    it('renders Portal do Paciente feature', () => {
      renderLanding();
      // Portal appears in features and pricing sections
      expect(screen.getAllByText('Portal do Paciente').length).toBeGreaterThan(0);
    });

    it('renders compliance badges', () => {
      renderLanding();
      expect(screen.getByText('LGPD Compliant')).toBeInTheDocument();
      expect(screen.getByText('HIPAA Ready')).toBeInTheDocument();
      expect(screen.getByText('TISS 4.02.00')).toBeInTheDocument();
      expect(screen.getByText('CFM 1.821/07')).toBeInTheDocument();
    });
  });

  describe('comparison section', () => {
    it('renders comparison headline', () => {
      renderLanding();
      expect(screen.getByText(/Mesmo preço. Tecnologia incomparável/i)).toBeInTheDocument();
    });

    it('renders competitor names in table', () => {
      renderLanding();
      expect(screen.getByText('Genesis')).toBeInTheDocument();
      expect(screen.getByText('iClinic')).toBeInTheDocument();
      expect(screen.getByText('Amplimed')).toBeInTheDocument();
      expect(screen.getByText('Feegow')).toBeInTheDocument();
    });

    it('renders comparison features', () => {
      renderLanding();
      // Both Diagnóstico Multi-LLM in feature and comparison sections
      expect(screen.getAllByText(/Diagnóstico Multi-LLM/i).length).toBeGreaterThan(0);
      // AI Scribe comparison row
      expect(screen.getByText(/AI Scribe \(Áudio → SOAP\)/i)).toBeInTheDocument();
    });
  });

  describe('pricing section', () => {
    it('renders pricing headline', () => {
      renderLanding();
      expect(screen.getByText(/Preço justo. IA inclusa/i)).toBeInTheDocument();
    });

    it('renders Starter plan', () => {
      renderLanding();
      expect(screen.getByText('Starter')).toBeInTheDocument();
      expect(screen.getByText('R$149')).toBeInTheDocument();
    });

    it('renders Pro plan', () => {
      renderLanding();
      expect(screen.getByText('Pro')).toBeInTheDocument();
      // R$299 appears multiple times (hero and pricing)
      expect(screen.getAllByText('R$299').length).toBeGreaterThan(0);
      expect(screen.getByText('Mais Popular')).toBeInTheDocument();
    });

    it('renders Business plan', () => {
      renderLanding();
      expect(screen.getByText('Business')).toBeInTheDocument();
      expect(screen.getByText('R$449')).toBeInTheDocument();
    });
  });

  describe('footer', () => {
    it('renders copyright', () => {
      renderLanding();
      expect(screen.getByText(/2025 Vértice Maximus Tecnologia/i)).toBeInTheDocument();
    });

    it('renders footer links', () => {
      renderLanding();
      expect(screen.getByText('Privacidade')).toBeInTheDocument();
      expect(screen.getByText('Termos')).toBeInTheDocument();
      expect(screen.getByText('Contato')).toBeInTheDocument();
    });

    it('renders brand in footer', () => {
      renderLanding();
      // Multiple GENESIS elements exist
      expect(screen.getAllByText('GENESIS').length).toBeGreaterThan(0);
    });
  });

  describe('navigation', () => {
    it('navigates to apply page when clicking "Começar Agora"', () => {
      renderLanding();
      const ctaButton = screen.getAllByRole('button', { name: /Começar Agora/i })[0];
      fireEvent.click(ctaButton);
      expect(mockNavigate).toHaveBeenCalledWith('/apply');
    });

    it('navigates to login when clicking "Ver Demo Médico"', () => {
      renderLanding();
      fireEvent.click(screen.getByRole('button', { name: /Ver Demo Médico/i }));
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('navigates to patient demo when clicking "Ver Demo Paciente"', () => {
      renderLanding();
      fireEvent.click(screen.getByRole('button', { name: /Ver Demo Paciente/i }));
      expect(mockNavigate).toHaveBeenCalledWith('/portal/demo');
    });

    it('navigates to patient login when clicking "Já sou paciente"', () => {
      renderLanding();
      fireEvent.click(screen.getByRole('button', { name: /Já sou paciente/i }));
      expect(mockNavigate).toHaveBeenCalledWith('/portal/login');
    });

    it('navigates to apply from pricing trial buttons', () => {
      renderLanding();
      // Find "Começar Trial Grátis" buttons
      const trialButtons = screen.getAllByRole('button', { name: /Começar Trial Grátis/i });
      fireEvent.click(trialButtons[0]);
      expect(mockNavigate).toHaveBeenCalledWith('/apply');
    });

    it('navigates to apply from "Falar com Vendas" button', () => {
      renderLanding();
      fireEvent.click(screen.getByRole('button', { name: /Falar com Vendas/i }));
      expect(mockNavigate).toHaveBeenCalledWith('/apply');
    });
  });
});
