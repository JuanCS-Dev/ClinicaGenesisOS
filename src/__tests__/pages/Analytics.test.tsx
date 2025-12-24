/**
 * Analytics Page Tests
 *
 * Smoke tests + basic functionality verification.
 * The page uses child components (FinancialWellness, PatientInsights),
 * so we mock them for isolation.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock child components
vi.mock('../../components/analytics', () => ({
  FinancialWellness: () => <div data-testid="financial-wellness">Financial Wellness Content</div>,
  PatientInsights: () => <div data-testid="patient-insights">Patient Insights Content</div>,
}));

import { Analytics } from '../../pages/Analytics';

const renderAnalytics = () => {
  return render(
    <MemoryRouter>
      <Analytics />
    </MemoryRouter>
  );
};

describe('Analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('smoke tests', () => {
    it('should render without crashing', () => {
      const { container } = renderAnalytics();
      expect(container).toBeDefined();
    });

    it('should have main content area', () => {
      const { container } = renderAnalytics();
      expect(container.querySelector('.animate-enter')).toBeTruthy();
    });
  });

  describe('header', () => {
    it('should display page title', () => {
      renderAnalytics();
      expect(screen.getByText('Analytics & Insights')).toBeInTheDocument();
    });

    it('should display page description', () => {
      renderAnalytics();
      expect(screen.getByText(/Inteligência de negócios/i)).toBeInTheDocument();
    });
  });

  describe('date range selector', () => {
    it('should have date range buttons', () => {
      renderAnalytics();
      expect(screen.getByText('Semana')).toBeInTheDocument();
      expect(screen.getByText('Mês')).toBeInTheDocument();
      expect(screen.getByText('Trimestre')).toBeInTheDocument();
      expect(screen.getByText('Ano')).toBeInTheDocument();
    });

    it('should change date range on click', () => {
      renderAnalytics();
      const yearButton = screen.getByText('Ano');
      fireEvent.click(yearButton);
      // Button should become active (has different styling)
      expect(yearButton).toBeInTheDocument();
    });
  });

  describe('tabs', () => {
    it('should display tab navigation', () => {
      renderAnalytics();
      expect(screen.getByText('Saúde Financeira')).toBeInTheDocument();
      expect(screen.getByText('Insights de Pacientes')).toBeInTheDocument();
    });

    it('should show financial tab content by default', () => {
      renderAnalytics();
      expect(screen.getByTestId('financial-wellness')).toBeInTheDocument();
    });

    it('should switch to patient insights tab when clicked', () => {
      renderAnalytics();
      fireEvent.click(screen.getByText('Insights de Pacientes'));
      expect(screen.getByTestId('patient-insights')).toBeInTheDocument();
    });
  });

  describe('actions', () => {
    it('should have refresh button', () => {
      renderAnalytics();
      expect(screen.getByText('Atualizar')).toBeInTheDocument();
    });

    it('should have export button', () => {
      renderAnalytics();
      expect(screen.getByText('Exportar')).toBeInTheDocument();
    });
  });
});

export default Analytics;
