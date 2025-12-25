/**
 * Dashboard Page Tests
 *
 * Comprehensive tests for the main dashboard.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => ({
    clinicId: 'clinic-123',
    userProfile: { displayName: 'Dr. Silva' },
  })),
}));

const mockToggleComplete = vi.fn();
const mockAddTask = vi.fn();

// Use future dates so they pass the upcomingAppointments filter
const mockDefaultAppointments = [
  {
    id: 'apt-1',
    patientName: 'Maria Santos',
    date: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    startTime: '09:00',
    endTime: '09:30',
    status: 'Confirmado',
    procedure: 'Consulta',
  },
  {
    id: 'apt-2',
    patientName: 'João Silva',
    date: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
    startTime: '10:00',
    endTime: '10:30',
    status: 'Pendente',
    procedure: 'Exame',
  },
];

vi.mock('../../hooks/useAppointments', () => ({
  useAppointments: vi.fn(() => ({
    appointments: mockDefaultAppointments,
    loading: false,
    setFilters: vi.fn(),
  })),
}));

import { useAppointments } from '../../hooks/useAppointments';
const mockUseAppointments = useAppointments as ReturnType<typeof vi.fn>;

const mockDefaultTasks = [
  { id: 'task-1', title: 'Ligar para paciente', status: 'pending', priority: 'high' },
  { id: 'task-2', title: 'Revisar prontuário', status: 'pending', priority: 'medium' },
];

vi.mock('../../hooks/useTasks', () => ({
  useTasks: vi.fn(() => ({
    tasks: mockDefaultTasks,
    pendingTasks: mockDefaultTasks,
    loading: false,
    error: null,
    addTask: mockAddTask,
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    toggleComplete: mockToggleComplete,
    refresh: vi.fn(),
  })),
}));

import { useTasks } from '../../hooks/useTasks';
const mockUseTasks = useTasks as ReturnType<typeof vi.fn>;

vi.mock('../../contexts/AuthContext', () => ({
  useAuthContext: vi.fn(() => ({
    user: { uid: 'user-123', email: 'doctor@clinic.com' },
    userProfile: { displayName: 'Dr. Silva', role: 'admin' },
    loading: false,
    error: null,
  })),
}));

// Mock TaskModal
vi.mock('../../components/tasks', () => ({
  TaskModal: ({ isOpen, onClose, task }: { isOpen: boolean; onClose: () => void; task?: { title: string } }) =>
    isOpen ? (
      <div data-testid="task-modal">
        <span data-testid="task-modal-title">{task?.title || 'Nova Tarefa'}</span>
        <button onClick={onClose}>Fechar Modal</button>
      </div>
    ) : null,
  TaskItem: ({ task, compact, onClick, onToggleComplete }: { task: { id: string; title: string; status: string }; compact?: boolean; onClick?: () => void; onToggleComplete?: () => void }) => (
    <div data-testid="task-item" data-compact={compact} onClick={onClick}>
      <span>{task.title}</span>
      <button data-testid={`toggle-${task.id}`} onClick={(e) => { e.stopPropagation(); onToggleComplete?.(); }}>Toggle</button>
    </div>
  ),
}));

const mockDefaultMetrics = {
  loading: false,
  todayAppointments: {
    value: 12,
    previousValue: 10,
    changePercent: 20,
    trend: 'up',
    comparisonText: 'vs ontem',
  },
  activePatients: {
    value: 150,
    previousValue: 140,
    changePercent: 7,
    trend: 'up',
    comparisonText: 'vs mês anterior',
  },
  revenue: {
    value: 45000,
    previousValue: 40000,
    changePercent: 12.5,
    trend: 'up',
    comparisonText: 'vs mês anterior',
    averageTicket: 350,
    completedCount: 8,
  },
  occupancy: {
    rate: 75,
    target: 85,
    bookedSlots: 15,
    totalSlots: 20,
    status: 'good',
  },
  breakdown: {
    confirmed: 8,
    pending: 3,
    cancelled: 1,
    total: 12,
    completed: 5,
    noShow: 2,
  },
};

vi.mock('../../hooks/useDashboardMetrics', () => ({
  useDashboardMetrics: vi.fn(() => mockDefaultMetrics),
}));

import { useDashboardMetrics } from '../../hooks/useDashboardMetrics';
const mockUseDashboardMetrics = useDashboardMetrics as ReturnType<typeof vi.fn>;

import { Dashboard } from '../../pages/Dashboard';

const renderDashboard = () => {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );
};

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to defaults
    mockUseDashboardMetrics.mockReturnValue(mockDefaultMetrics);
    mockUseAppointments.mockReturnValue({
      appointments: mockDefaultAppointments,
      loading: false,
      setFilters: vi.fn(),
    });
    mockUseTasks.mockReturnValue({
      tasks: mockDefaultTasks,
      pendingTasks: mockDefaultTasks,
      loading: false,
      error: null,
      addTask: mockAddTask,
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      toggleComplete: mockToggleComplete,
      refresh: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendering', () => {
    it('should render without crashing', () => {
      const { container } = renderDashboard();
      expect(container).toBeDefined();
    });

    it('should have main content area with animation', () => {
      const { container } = renderDashboard();
      expect(container.querySelector('.animate-enter')).toBeTruthy();
    });

    it('should display greeting with user name', () => {
      renderDashboard();
      // Should contain "Silva" from "Dr. Silva"
      expect(screen.getByText(/Silva/)).toBeInTheDocument();
    });

    it('should display current date', () => {
      renderDashboard();
      expect(screen.getByText(/Resumo operacional de hoje/)).toBeInTheDocument();
    });

    it('should render report button', () => {
      renderDashboard();
      expect(screen.getByRole('button', { name: /Relatório Completo/i })).toBeInTheDocument();
    });
  });

  describe('KPI cards', () => {
    it('should display today appointments value', () => {
      renderDashboard();
      expect(screen.getByText('12')).toBeInTheDocument();
    });

    it('should display appointments label', () => {
      renderDashboard();
      expect(screen.getByText('Consultas Hoje')).toBeInTheDocument();
    });

    it('should display active patients value', () => {
      renderDashboard();
      expect(screen.getByText('150')).toBeInTheDocument();
    });

    it('should display active patients label', () => {
      renderDashboard();
      expect(screen.getByText('Pacientes Ativos')).toBeInTheDocument();
    });

    it('should display revenue formatted', () => {
      renderDashboard();
      expect(screen.getByText('Faturamento Mês')).toBeInTheDocument();
    });

    it('should display occupancy rate', () => {
      renderDashboard();
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('should display occupancy label', () => {
      renderDashboard();
      expect(screen.getByText('Taxa de Ocupação')).toBeInTheDocument();
    });
  });

  describe('appointments section', () => {
    it('should display section title', () => {
      renderDashboard();
      expect(screen.getByText('Próximas Consultas')).toBeInTheDocument();
    });

    it('should display patient names', () => {
      renderDashboard();
      const mariaSantos = screen.getAllByText('Maria Santos');
      expect(mariaSantos.length).toBeGreaterThan(0);
    });

    it('should display appointment count', () => {
      renderDashboard();
      expect(screen.getByText(/agendadas/)).toBeInTheDocument();
    });

    it('should display view agenda button', () => {
      renderDashboard();
      expect(screen.getByText('Ver Agenda')).toBeInTheDocument();
    });

    it('should navigate to agenda on button click', () => {
      renderDashboard();
      fireEvent.click(screen.getByText('Ver Agenda'));
      expect(mockNavigate).toHaveBeenCalledWith('/agenda');
    });
  });

  describe('empty appointments state', () => {
    beforeEach(() => {
      mockUseAppointments.mockReturnValue({
        appointments: [],
        loading: false,
        setFilters: vi.fn(),
      });
    });

    it('should show empty state message', () => {
      renderDashboard();
      expect(screen.getByText('Nenhuma consulta agendada.')).toBeInTheDocument();
    });

    it('should show schedule button', () => {
      renderDashboard();
      expect(screen.getByText('Agendar consulta')).toBeInTheDocument();
    });

    it('should navigate to agenda on schedule click', () => {
      renderDashboard();
      fireEvent.click(screen.getByText('Agendar consulta'));
      expect(mockNavigate).toHaveBeenCalledWith('/agenda');
    });
  });

  describe('tasks section', () => {
    it('should display tasks title', () => {
      renderDashboard();
      expect(screen.getByText('Tarefas Pendentes')).toBeInTheDocument();
    });

    it('should display task count', () => {
      renderDashboard();
      expect(screen.getByText('2 itens')).toBeInTheDocument();
    });

    it('should display task items', () => {
      renderDashboard();
      const taskItems = screen.getAllByTestId('task-item');
      expect(taskItems.length).toBe(2);
    });

    it('should display add task button', () => {
      renderDashboard();
      expect(screen.getByText(/Adicionar Tarefa/i)).toBeInTheDocument();
    });

    it('should open task modal on add click', () => {
      renderDashboard();
      fireEvent.click(screen.getByText(/Adicionar Tarefa/i));
      expect(screen.getByTestId('task-modal')).toBeInTheDocument();
    });

    it('should show "Nova Tarefa" in modal for new task', () => {
      renderDashboard();
      fireEvent.click(screen.getByText(/Adicionar Tarefa/i));
      expect(screen.getByTestId('task-modal-title')).toHaveTextContent('Nova Tarefa');
    });

    it('should close task modal', () => {
      renderDashboard();
      fireEvent.click(screen.getByText(/Adicionar Tarefa/i));
      fireEvent.click(screen.getByText('Fechar Modal'));
      expect(screen.queryByTestId('task-modal')).not.toBeInTheDocument();
    });

    it('should open task modal with task data on edit', () => {
      renderDashboard();
      const taskItems = screen.getAllByTestId('task-item');
      fireEvent.click(taskItems[0]);
      expect(screen.getByTestId('task-modal-title')).toHaveTextContent('Ligar para paciente');
    });

    it('should toggle task completion', () => {
      renderDashboard();
      fireEvent.click(screen.getByTestId('toggle-task-1'));
      expect(mockToggleComplete).toHaveBeenCalledWith('task-1', 'pending');
    });
  });

  describe('empty tasks state', () => {
    beforeEach(() => {
      mockUseTasks.mockReturnValue({
        tasks: [],
        pendingTasks: [],
        loading: false,
        error: null,
        addTask: mockAddTask,
        updateTask: vi.fn(),
        deleteTask: vi.fn(),
        toggleComplete: mockToggleComplete,
        refresh: vi.fn(),
      });
    });

    it('should show empty state message', () => {
      renderDashboard();
      expect(screen.getByText('Nenhuma tarefa pendente')).toBeInTheDocument();
    });

    it('should show empty state description', () => {
      renderDashboard();
      expect(screen.getByText('Adicione tarefas para organizar seu dia')).toBeInTheDocument();
    });
  });

  describe('quick stats bar', () => {
    it('should display confirmed count', () => {
      renderDashboard();
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('Confirmados')).toBeInTheDocument();
    });

    it('should display pending count', () => {
      renderDashboard();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('Pendentes')).toBeInTheDocument();
    });

    it('should display completed count', () => {
      renderDashboard();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('Finalizados')).toBeInTheDocument();
    });

    it('should display no show count', () => {
      renderDashboard();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('Faltas')).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('should navigate to finance on report button click', () => {
      renderDashboard();
      fireEvent.click(screen.getByRole('button', { name: /Relatório Completo/i }));
      expect(mockNavigate).toHaveBeenCalledWith('/finance');
    });
  });

  describe('loading state', () => {
    beforeEach(() => {
      mockUseDashboardMetrics.mockReturnValue({
        ...mockDefaultMetrics,
        loading: true,
      });
    });

    it('should show loading spinner', () => {
      renderDashboard();
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('should not show KPI cards while loading', () => {
      renderDashboard();
      expect(screen.queryByText('Consultas Hoje')).not.toBeInTheDocument();
    });
  });

  describe('single task count', () => {
    beforeEach(() => {
      mockUseTasks.mockReturnValue({
        tasks: [mockDefaultTasks[0]],
        pendingTasks: [mockDefaultTasks[0]],
        loading: false,
        error: null,
        addTask: mockAddTask,
        updateTask: vi.fn(),
        deleteTask: vi.fn(),
        toggleComplete: mockToggleComplete,
        refresh: vi.fn(),
      });
    });

    it('should show singular "item" for 1 task', () => {
      renderDashboard();
      expect(screen.getByText('1 item')).toBeInTheDocument();
    });
  });

});
