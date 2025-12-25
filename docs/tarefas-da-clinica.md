# Tarefas da Clínica - Documentação

## Status: Implementado

Data de implementação: 2025-12-24

---

## Resumo

Sistema de gerenciamento de tarefas pendentes integrado ao Dashboard principal. Permite criar, editar, excluir e marcar tarefas como concluídas com persistência em tempo real no Firestore.

## Funcionalidades

### Criar Tarefa
- **Título** (obrigatório)
- **Descrição** (opcional)
- **Prioridade**: Alta, Média, Baixa
- **Paciente associado** (opcional) - busca com autocomplete
- **Data de vencimento** (opcional)

### Visualizar/Editar Tarefa
- Clicar em qualquer tarefa abre modal de edição
- Possibilidade de marcar como concluída
- Possibilidade de excluir

### Prioridades Visuais
- **Alta**: Indicador vermelho pulsante
- **Média**: Indicador âmbar
- **Baixa**: Indicador sutil

### Características
- **Real-time**: Atualizações instantâneas via Firestore subscriptions
- **Multi-tenancy**: Tarefas isoladas por clínica
- **Visibilidade**: Todos os usuários da clínica veem todas as tarefas

---

## Arquitetura

### Arquivos Criados

```
src/
├── types/task/
│   ├── task.ts          # Task, TaskStatus, TaskPriority, TASK_PRIORITY_CONFIG
│   └── index.ts         # Re-exports
│
├── services/firestore/
│   └── task.service.ts  # CRUD + subscriptions (subscribe, subscribePending)
│
├── hooks/
│   └── useTasks.ts      # Hook com estado, mutations e real-time
│
└── components/tasks/
    ├── TaskModal.tsx    # Modal criar/editar/excluir
    ├── TaskItem.tsx     # Componente de exibição individual
    └── index.ts         # Re-exports
```

### Arquivos Modificados

- `src/pages/Dashboard.tsx` - Integração do card de tarefas
- `src/types/index.ts` - Export do módulo task
- `src/services/firestore/index.ts` - Export do taskService

---

## Estrutura de Dados

### Firestore Path
```
/clinics/{clinicId}/tasks/{taskId}
```

### Task Interface
```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed';
  patientId?: string;
  patientName?: string;
  dueDate?: string;     // ISO date
  createdAt: string;
  createdBy: string;
  completedAt?: string;
}
```

---

## Uso

### No Dashboard
O card "Tarefas Pendentes" exibe até 5 tarefas pendentes ordenadas por prioridade e data de vencimento.

### Via Hook
```typescript
import { useTasks } from '@/hooks/useTasks';

function MyComponent() {
  const {
    pendingTasks,
    addTask,
    updateTask,
    toggleComplete,
    deleteTask
  } = useTasks();

  // Criar tarefa
  await addTask({
    title: 'Ligar para paciente',
    priority: 'high',
    patientId: '123',
    patientName: 'João Silva',
  });

  // Marcar como concluída
  await toggleComplete(taskId, 'pending');
}
```

---

## Padrões Seguidos

- **CODE_CONSTITUTION.md**:
  - Arquivos < 500 linhas
  - Type hints completos
  - Docstrings em funções públicas
  - Design system tokens (sem cores hardcoded)

- **Multi-tenancy**: Todas operações incluem `clinicId`

- **Real-time**: Subscriptions do Firestore para atualizações instantâneas

- **Design System**:
  - Modal do design system
  - Tokens de cor genesis-*
  - Toast via Sonner
