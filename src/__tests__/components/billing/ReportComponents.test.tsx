/**
 * Tests for ReportComponents
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  StatCard,
  StatusChart,
  OperatorBreakdown,
  STATUS_COLORS,
  STATUS_LABELS,
  formatCurrency,
} from '@/components/billing/ReportComponents';
import { DollarSign, TrendingUp } from 'lucide-react';
import type { GuiaFirestore, StatusGuia } from '@/types';

// Mock Lucide icons
vi.mock('lucide-react', async () => {
  const actual = await vi.importActual('lucide-react');
  return {
    ...actual,
    DollarSign: () => <span data-testid="dollar-icon">$</span>,
    TrendingUp: () => <span data-testid="trending-up-icon">↑</span>,
    TrendingDown: () => <span data-testid="trending-down-icon">↓</span>,
    PieChart: () => <span data-testid="pie-chart-icon">○</span>,
    Building2: () => <span data-testid="building-icon">🏢</span>,
  };
});

describe('ReportComponents', () => {
  describe('STATUS_COLORS', () => {
    it('should have colors for all status types', () => {
      const statuses: StatusGuia[] = [
        'rascunho',
        'enviada',
        'em_analise',
        'autorizada',
        'glosada_parcial',
        'glosada_total',
        'paga',
        'recurso',
      ];

      statuses.forEach((status) => {
        expect(STATUS_COLORS[status]).toBeDefined();
        expect(STATUS_COLORS[status]).toContain('bg-');
      });
    });
  });

  describe('STATUS_LABELS', () => {
    it('should have Portuguese labels for all status types', () => {
      expect(STATUS_LABELS.rascunho).toBe('Rascunho');
      expect(STATUS_LABELS.enviada).toBe('Enviada');
      expect(STATUS_LABELS.em_analise).toBe('Em Análise');
      expect(STATUS_LABELS.autorizada).toBe('Autorizada');
      expect(STATUS_LABELS.glosada_parcial).toBe('Glosa Parcial');
      expect(STATUS_LABELS.glosada_total).toBe('Glosa Total');
      expect(STATUS_LABELS.paga).toBe('Paga');
      expect(STATUS_LABELS.recurso).toBe('Em Recurso');
    });
  });

  describe('formatCurrency', () => {
    it('should format values as BRL currency', () => {
      expect(formatCurrency(1000)).toContain('R$');
      expect(formatCurrency(1234.56)).toContain('1.234,56');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toContain('0,00');
    });
  });

  describe('StatCard', () => {
    it('should render title and value', () => {
      render(
        <StatCard
          title="Test Title"
          value="R$ 1.000,00"
          icon={DollarSign}
          color="blue"
        />
      );

      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('R$ 1.000,00')).toBeInTheDocument();
    });

    it('should render subtitle when provided', () => {
      render(
        <StatCard
          title="Revenue"
          value="R$ 5.000,00"
          subtitle="10 guias"
          icon={DollarSign}
          color="green"
        />
      );

      expect(screen.getByText('10 guias')).toBeInTheDocument();
    });

    it('should render positive trend', () => {
      render(
        <StatCard
          title="Growth"
          value="25%"
          trend={{ value: 5, label: '+5%' }}
          icon={TrendingUp}
          color="green"
        />
      );

      expect(screen.getByText('+5%')).toBeInTheDocument();
    });

    it('should render negative trend with different styling', () => {
      render(
        <StatCard
          title="Decline"
          value="10%"
          trend={{ value: -3, label: '-3%' }}
          icon={TrendingUp}
          color="red"
        />
      );

      expect(screen.getByText('-3%')).toBeInTheDocument();
    });

    it('should apply correct color classes', () => {
      const { container } = render(
        <StatCard
          title="Test"
          value="100"
          icon={DollarSign}
          color="amber"
        />
      );

      // Check that amber color class is applied
      expect(container.innerHTML).toContain('amber');
    });
  });

  describe('StatusChart', () => {
    const mockGuiasPorStatus: Record<StatusGuia, number> = {
      rascunho: 5,
      enviada: 10,
      em_analise: 3,
      autorizada: 15,
      glosada_parcial: 2,
      glosada_total: 1,
      paga: 20,
      recurso: 0,
    };

    it('should render status bars for non-zero counts', () => {
      render(<StatusChart guiasPorStatus={mockGuiasPorStatus} total={56} />);

      expect(screen.getByText('Paga')).toBeInTheDocument();
      expect(screen.getByText('Autorizada')).toBeInTheDocument();
      expect(screen.getByText('Enviada')).toBeInTheDocument();
    });

    it('should not render status bars for zero counts', () => {
      render(<StatusChart guiasPorStatus={mockGuiasPorStatus} total={56} />);

      // 'recurso' has 0 count and shouldn't be shown
      expect(screen.queryByText('Em Recurso')).not.toBeInTheDocument();
    });

    it('should show empty state when total is zero', () => {
      const emptyStatus: Record<StatusGuia, number> = {
        rascunho: 0,
        enviada: 0,
        em_analise: 0,
        autorizada: 0,
        glosada_parcial: 0,
        glosada_total: 0,
        paga: 0,
        recurso: 0,
      };

      render(<StatusChart guiasPorStatus={emptyStatus} total={0} />);

      expect(screen.getByText('Sem dados para exibir')).toBeInTheDocument();
    });

    it('should display count and percentage', () => {
      render(<StatusChart guiasPorStatus={mockGuiasPorStatus} total={56} />);

      // Paga has 20 out of 56 = ~36%
      expect(screen.getByText(/20/)).toBeInTheDocument();
    });
  });

  describe('OperatorBreakdown', () => {
    const createMockGuia = (overrides: Partial<GuiaFirestore>): GuiaFirestore => ({
      id: 'guia-1',
      clinicId: 'clinic-1',
      patientId: 'patient-1',
      appointmentId: 'apt-1',
      tipo: 'consulta',
      registroANS: '123456',
      nomeOperadora: 'Unimed',
      numeroGuiaPrestador: 'GP-001',
      dataAtendimento: '2024-01-15',
      status: 'paga',
      valorTotal: 500,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      dadosGuia: {
        dadosBeneficiario: {
          numeroCarteira: '123456789',
          nomeBeneficiario: 'João Silva',
        },
      },
      ...overrides,
    } as GuiaFirestore);

    it('should render operator breakdown with data', () => {
      const guias = [
        createMockGuia({ valorTotal: 1000, valorPago: 800, valorGlosado: 100 }),
        createMockGuia({ id: 'guia-2', valorTotal: 500, valorPago: 500 }),
      ];

      render(<OperatorBreakdown guias={guias} />);

      expect(screen.getByText('Unimed')).toBeInTheDocument();
      expect(screen.getByText(/ANS: 123456/)).toBeInTheDocument();
    });

    it('should show empty state when no guias', () => {
      render(<OperatorBreakdown guias={[]} />);

      expect(screen.getByText('Sem dados de operadoras')).toBeInTheDocument();
    });

    it('should aggregate values by operator', () => {
      const guias = [
        createMockGuia({ valorTotal: 1000, valorPago: 800 }),
        createMockGuia({ id: 'guia-2', valorTotal: 500, valorPago: 400 }),
      ];

      render(<OperatorBreakdown guias={guias} />);

      // Should show 2 guias for this operator
      expect(screen.getByText('2 guias')).toBeInTheDocument();
    });

    it('should group by different operators', () => {
      const guias = [
        createMockGuia({ registroANS: '111111', nomeOperadora: 'Unimed' }),
        createMockGuia({
          id: 'guia-2',
          registroANS: '222222',
          nomeOperadora: 'Bradesco Saúde',
        }),
      ];

      render(<OperatorBreakdown guias={guias} />);

      expect(screen.getByText('Unimed')).toBeInTheDocument();
      expect(screen.getByText('Bradesco Saúde')).toBeInTheDocument();
    });

    it('should show at most 5 operators', () => {
      const guias = [];
      for (let i = 0; i < 7; i++) {
        guias.push(
          createMockGuia({
            id: `guia-${i}`,
            registroANS: `${100000 + i}`,
            nomeOperadora: `Operadora ${i}`,
            valorTotal: 1000 - i * 100, // Decreasing values
          })
        );
      }

      render(<OperatorBreakdown guias={guias} />);

      // Should show top 5 operators by total value
      expect(screen.getByText('Operadora 0')).toBeInTheDocument();
      expect(screen.getByText('Operadora 4')).toBeInTheDocument();
      expect(screen.queryByText('Operadora 5')).not.toBeInTheDocument();
      expect(screen.queryByText('Operadora 6')).not.toBeInTheDocument();
    });
  });
});
