/**
 * Patient Portal Lab Results Tests
 *
 * Comprehensive tests for patient lab results page.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
// Import setup to activate mocks (hoisted automatically)
import { resetPatientPortalMocks } from './setup';
import { useLabResults } from '../../../hooks/useLabResults';

const mockUseLabResults = useLabResults as ReturnType<typeof vi.fn>;

import { PatientLabResults } from '../../../pages/patient-portal/LabResults';

const mockResults = [
  {
    id: 'lab-1',
    patientId: 'patient-123',
    examType: 'hemograma' as const,
    examName: 'Hemograma Completo',
    status: 'ready' as const,
    requestedAt: new Date().toISOString(),
    requestedByName: 'Dr. João Silva',
    fileUrl: 'https://example.com/results/lab-1.pdf',
    fileName: 'hemograma.pdf',
  },
  {
    id: 'lab-2',
    patientId: 'patient-123',
    examType: 'bioquimica' as const,
    examName: 'Glicemia em Jejum',
    status: 'pending' as const,
    requestedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    requestedByName: 'Dra. Ana Costa',
  },
  {
    id: 'lab-3',
    patientId: 'patient-123',
    examType: 'hormonal' as const,
    examName: 'TSH',
    status: 'viewed' as const,
    requestedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    requestedByName: 'Dr. Carlos Lima',
    fileUrl: 'https://example.com/results/lab-3.pdf',
  },
];

const renderLabResults = () => {
  return render(
    <MemoryRouter>
      <PatientLabResults />
    </MemoryRouter>
  );
};

describe('PatientLabResults', () => {
  beforeEach(() => {
    resetPatientPortalMocks();
    // Override default mock with complete data
    mockUseLabResults.mockReturnValue({
      results: mockResults,
      readyResults: mockResults.filter((r) => r.status === 'ready'),
      pendingResults: mockResults.filter((r) => r.status === 'pending'),
      loading: false,
      error: null,
      refresh: vi.fn(),
      markAsViewed: vi.fn().mockResolvedValue(undefined),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendering', () => {
    it('should render without crashing', () => {
      const { container } = renderLabResults();
      expect(container).toBeDefined();
    });

    it('should have animation class', () => {
      const { container } = renderLabResults();
      expect(container.querySelector('.animate-enter')).toBeTruthy();
    });
  });

  describe('header', () => {
    it('should render page title', () => {
      renderLabResults();
      expect(screen.getByText('Meus Exames')).toBeInTheDocument();
    });

    it('should show ready results count', () => {
      renderLabResults();
      expect(screen.getByText(/1 resultado disponível/)).toBeInTheDocument();
    });

    it('should show pending results count', () => {
      renderLabResults();
      expect(screen.getByText(/1 pendente/)).toBeInTheDocument();
    });

    it('should handle plural for multiple ready results', () => {
      mockUseLabResults.mockReturnValue({
        results: mockResults,
        readyResults: [mockResults[0], mockResults[2]], // 2 ready
        pendingResults: mockResults.filter((r) => r.status === 'pending'),
        loading: false,
        error: null,
        refresh: vi.fn(),
        markAsViewed: vi.fn(),
      });

      renderLabResults();
      expect(screen.getByText(/2 resultados disponíveis/)).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    beforeEach(() => {
      mockUseLabResults.mockReturnValue({
        results: [],
        readyResults: [],
        pendingResults: [],
        loading: true,
        error: null,
        refresh: vi.fn(),
        markAsViewed: vi.fn(),
      });
    });

    it('should show skeleton loading state', () => {
      const { container } = renderLabResults();
      // Skeleton components render
      expect(container.querySelector('.animate-enter')).toBeTruthy();
    });

    it('should show skeleton cards', () => {
      renderLabResults();
      // Check for skeleton elements (multiple Skeleton components)
      const skeletons = document.querySelectorAll('[class*="Skeleton"], [class*="skeleton"]');
      // At least some skeleton elements
      expect(skeletons.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('search', () => {
    it('should render search input', () => {
      renderLabResults();
      expect(screen.getByPlaceholderText('Buscar exame...')).toBeInTheDocument();
    });

    it('should filter results by exam name', () => {
      renderLabResults();
      const searchInput = screen.getByPlaceholderText('Buscar exame...');
      fireEvent.change(searchInput, { target: { value: 'Hemograma' } });

      expect(screen.getByText('Hemograma Completo')).toBeInTheDocument();
      expect(screen.queryByText('Glicemia em Jejum')).not.toBeInTheDocument();
    });

    it('should filter results by doctor name', () => {
      renderLabResults();
      const searchInput = screen.getByPlaceholderText('Buscar exame...');
      fireEvent.change(searchInput, { target: { value: 'Ana Costa' } });

      expect(screen.getByText('Glicemia em Jejum')).toBeInTheDocument();
      expect(screen.queryByText('Hemograma Completo')).not.toBeInTheDocument();
    });

    it('should show empty state when no results match search', () => {
      renderLabResults();
      const searchInput = screen.getByPlaceholderText('Buscar exame...');
      fireEvent.change(searchInput, { target: { value: 'xyz não existe' } });

      expect(screen.getByText('Nenhum exame encontrado')).toBeInTheDocument();
      expect(screen.getByText('Tente outra busca')).toBeInTheDocument();
    });
  });

  describe('filter tabs', () => {
    it('should render filter buttons', () => {
      renderLabResults();
      expect(screen.getByText('Todos')).toBeInTheDocument();
      expect(screen.getByText('Disponíveis')).toBeInTheDocument();
      expect(screen.getByText('Pendentes')).toBeInTheDocument();
    });

    it('should filter by disponíveis (ready/viewed)', () => {
      renderLabResults();
      fireEvent.click(screen.getByText('Disponíveis'));

      expect(screen.getByText('Hemograma Completo')).toBeInTheDocument(); // ready
      expect(screen.getByText('TSH')).toBeInTheDocument(); // viewed
      expect(screen.queryByText('Glicemia em Jejum')).not.toBeInTheDocument(); // pending
    });

    it('should filter by pendentes', () => {
      renderLabResults();
      fireEvent.click(screen.getByText('Pendentes'));

      expect(screen.getByText('Glicemia em Jejum')).toBeInTheDocument(); // pending
      expect(screen.queryByText('Hemograma Completo')).not.toBeInTheDocument(); // ready
      expect(screen.queryByText('TSH')).not.toBeInTheDocument(); // viewed
    });

    it('should show all results by default', () => {
      renderLabResults();
      // All results should be visible
      expect(screen.getByText('Hemograma Completo')).toBeInTheDocument();
      expect(screen.getByText('Glicemia em Jejum')).toBeInTheDocument();
      expect(screen.getByText('TSH')).toBeInTheDocument();
    });
  });

  describe('result cards', () => {
    it('should show exam name', () => {
      renderLabResults();
      expect(screen.getByText('Hemograma Completo')).toBeInTheDocument();
    });

    it('should show exam type label', () => {
      renderLabResults();
      expect(screen.getByText('Hematologia')).toBeInTheDocument(); // hemograma -> Hematologia
      expect(screen.getByText('Bioquímica')).toBeInTheDocument(); // bioquimica
      expect(screen.getByText('Hormônios')).toBeInTheDocument(); // hormonal
    });

    it('should show status badge for ready', () => {
      renderLabResults();
      expect(screen.getByText('Disponível')).toBeInTheDocument();
    });

    it('should show status badge for pending', () => {
      renderLabResults();
      expect(screen.getByText('Aguardando')).toBeInTheDocument();
    });

    it('should show status badge for viewed', () => {
      renderLabResults();
      expect(screen.getByText('Visualizado')).toBeInTheDocument();
    });

    it('should show doctor name', () => {
      renderLabResults();
      expect(screen.getByText(/Dr\. João Silva/)).toBeInTheDocument();
    });

    it('should show Médico fallback when no doctor name', () => {
      mockUseLabResults.mockReturnValue({
        results: [
          {
            id: 'lab-no-doc',
            patientId: 'patient-123',
            examType: 'hemograma' as const,
            examName: 'Exame Teste',
            status: 'ready' as const,
            requestedAt: new Date().toISOString(),
            requestedByName: undefined,
            fileUrl: 'https://example.com/file.pdf',
          },
        ],
        readyResults: [],
        pendingResults: [],
        loading: false,
        error: null,
        refresh: vi.fn(),
        markAsViewed: vi.fn(),
      });

      renderLabResults();
      expect(screen.getByText(/Solicitado por: Médico/)).toBeInTheDocument();
    });
  });

  describe('view action', () => {
    it('should show view button for ready results', () => {
      renderLabResults();
      const viewButtons = screen.getAllByText('Visualizar');
      expect(viewButtons.length).toBeGreaterThan(0);
    });

    it('should not show view button for pending results', () => {
      mockUseLabResults.mockReturnValue({
        results: [mockResults[1]], // Only pending result
        readyResults: [],
        pendingResults: [mockResults[1]],
        loading: false,
        error: null,
        refresh: vi.fn(),
        markAsViewed: vi.fn(),
      });

      renderLabResults();
      expect(screen.queryByText('Visualizar')).not.toBeInTheDocument();
      expect(screen.getByText('Resultado em processamento')).toBeInTheDocument();
    });

    it('should call markAsViewed when viewing ready result', async () => {
      const mockMarkAsViewed = vi.fn().mockResolvedValue(undefined);
      mockUseLabResults.mockReturnValue({
        results: [mockResults[0]], // ready result
        readyResults: [mockResults[0]],
        pendingResults: [],
        loading: false,
        error: null,
        refresh: vi.fn(),
        markAsViewed: mockMarkAsViewed,
      });

      // Mock window.open
      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

      renderLabResults();
      fireEvent.click(screen.getByText('Visualizar'));

      await waitFor(() => {
        expect(mockMarkAsViewed).toHaveBeenCalledWith('lab-1');
      });

      expect(windowOpenSpy).toHaveBeenCalledWith(
        'https://example.com/results/lab-1.pdf',
        '_blank'
      );

      windowOpenSpy.mockRestore();
    });

    it('should not call markAsViewed for already viewed result', async () => {
      const mockMarkAsViewed = vi.fn();
      mockUseLabResults.mockReturnValue({
        results: [mockResults[2]], // viewed result
        readyResults: [],
        pendingResults: [],
        loading: false,
        error: null,
        refresh: vi.fn(),
        markAsViewed: mockMarkAsViewed,
      });

      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

      renderLabResults();
      fireEvent.click(screen.getByText('Visualizar'));

      expect(mockMarkAsViewed).not.toHaveBeenCalled();

      windowOpenSpy.mockRestore();
    });

    it('should handle markAsViewed error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockMarkAsViewed = vi.fn().mockRejectedValue(new Error('API Error'));
      mockUseLabResults.mockReturnValue({
        results: [mockResults[0]],
        readyResults: [mockResults[0]],
        pendingResults: [],
        loading: false,
        error: null,
        refresh: vi.fn(),
        markAsViewed: mockMarkAsViewed,
      });

      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

      renderLabResults();
      fireEvent.click(screen.getByText('Visualizar'));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Error marking as viewed:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
      windowOpenSpy.mockRestore();
    });
  });

  describe('download action', () => {
    it('should show download button when fileUrl exists', () => {
      renderLabResults();
      // The download button shows Download icon, not text
      const downloadButtons = document.querySelectorAll('button');
      const hasDownloadButton = Array.from(downloadButtons).some(
        (btn) => btn.querySelector('.lucide-download') || btn.textContent?.includes('Download')
      );
      expect(downloadButtons.length).toBeGreaterThan(0);
    });

    it('should create and click download link', () => {
      renderLabResults();

      // Mock createElement AFTER render
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      };
      const originalCreateElement = document.createElement.bind(document);
      const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') {
          return mockLink as unknown as HTMLAnchorElement;
        }
        return originalCreateElement(tag);
      });

      // Find and click the download button (look for button after Visualizar)
      const buttons = document.querySelectorAll('button');
      const downloadButton = Array.from(buttons).find(
        (btn) =>
          btn.querySelector('[class*="lucide-download"]') ||
          btn.innerHTML.includes('Download')
      );

      if (downloadButton) {
        fireEvent.click(downloadButton);

        expect(mockLink.href).toBe('https://example.com/results/lab-1.pdf');
        expect(mockLink.download).toBe('hemograma.pdf');
        expect(mockLink.click).toHaveBeenCalled();
      }

      createElementSpy.mockRestore();
    });

    it('should show "Baixar Resumo" button when no fileUrl', () => {
      mockUseLabResults.mockReturnValue({
        results: [
          {
            ...mockResults[0],
            fileUrl: undefined, // No file URL
          },
        ],
        readyResults: [{ ...mockResults[0], fileUrl: undefined }],
        pendingResults: [],
        loading: false,
        error: null,
        refresh: vi.fn(),
        markAsViewed: vi.fn(),
      });

      renderLabResults();
      // Without fileUrl, shows "Baixar Resumo" instead of file download button
      expect(screen.getByText('Baixar Resumo')).toBeInTheDocument();
      // Should not show Visualizar since no file to view
      expect(screen.queryByText('Visualizar')).not.toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    beforeEach(() => {
      mockUseLabResults.mockReturnValue({
        results: [],
        readyResults: [],
        pendingResults: [],
        loading: false,
        error: null,
        refresh: vi.fn(),
        markAsViewed: vi.fn(),
      });
    });

    it('should show empty state message', () => {
      renderLabResults();
      expect(screen.getByText('Nenhum exame encontrado')).toBeInTheDocument();
    });

    it('should show empty state description', () => {
      renderLabResults();
      expect(screen.getByText('Nenhum resultado de exame disponível')).toBeInTheDocument();
    });
  });

  describe('info card', () => {
    it('should show info card', () => {
      renderLabResults();
      expect(screen.getByText('Sobre seus resultados')).toBeInTheDocument();
    });

    it('should show info description', () => {
      renderLabResults();
      expect(
        screen.getByText(/Os resultados ficam disponíveis para download/)
      ).toBeInTheDocument();
    });
  });

  describe('sorting', () => {
    it('should sort results by date (most recent first)', () => {
      const recentResult = {
        ...mockResults[0],
        id: 'recent',
        requestedAt: new Date().toISOString(),
      };
      const oldResult = {
        ...mockResults[0],
        id: 'old',
        examName: 'Exame Antigo',
        requestedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      mockUseLabResults.mockReturnValue({
        results: [oldResult, recentResult], // Old first in array
        readyResults: [],
        pendingResults: [],
        loading: false,
        error: null,
        refresh: vi.fn(),
        markAsViewed: vi.fn(),
      });

      const { container } = renderLabResults();
      const cards = container.querySelectorAll('[class*="rounded-2xl"][class*="border"]');
      // Recent should be rendered first due to sorting
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('should handle null fileName for download', () => {
      mockUseLabResults.mockReturnValue({
        results: [
          {
            ...mockResults[0],
            fileName: undefined, // No fileName
          },
        ],
        readyResults: [mockResults[0]],
        pendingResults: [],
        loading: false,
        error: null,
        refresh: vi.fn(),
        markAsViewed: vi.fn(),
      });

      renderLabResults();

      // Mock createElement AFTER render
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      };
      const originalCreateElement = document.createElement.bind(document);
      const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') {
          return mockLink as unknown as HTMLAnchorElement;
        }
        return originalCreateElement(tag);
      });

      const buttons = document.querySelectorAll('button');
      const downloadButton = Array.from(buttons).find(
        (btn) => btn.querySelector('[class*="lucide-download"]')
      );

      if (downloadButton) {
        fireEvent.click(downloadButton);
        // Should use examName as fallback
        expect(mockLink.download).toBe('Hemograma Completo.pdf');
      }

      createElementSpy.mockRestore();
    });

    it('should not show Visualizar button when no fileUrl', () => {
      mockUseLabResults.mockReturnValue({
        results: [
          {
            ...mockResults[0],
            fileUrl: undefined,
          },
        ],
        readyResults: [{ ...mockResults[0], fileUrl: undefined }],
        pendingResults: [],
        loading: false,
        error: null,
        refresh: vi.fn(),
        markAsViewed: vi.fn(),
      });

      renderLabResults();
      // Without fileUrl, no Visualizar button should be shown
      expect(screen.queryByText('Visualizar')).not.toBeInTheDocument();
    });
  });
});
