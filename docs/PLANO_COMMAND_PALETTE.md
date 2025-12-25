# Plano: Command Palette Moderno (estilo Stripe/GCloud)

> Status: Pendente implementacao
> Data: 2025-12-25

## Objetivo
Implementar busca global tipo Cmd+K que busca qualquer coisa do sistema.

---

## Analise da Implementacao Atual

### Arquivos existentes:
- `src/hooks/useGlobalSearch.ts` - Busca apenas **Patients** e **Appointments**
- `src/components/search/CommandPalette.tsx` - UI basica, sem navegacao por teclado funcional
- `src/hooks/useCommandPalette.ts` - Gerencia estado open/close

### Limitacoes atuais:
- So busca 2 tipos de entidade (types definidos para 5, mas so 2 implementados)
- Navegacao por setas nao funciona (so mostra hint visual)
- Sem quick actions (ir para paginas, criar itens)
- Sem busca em prontuarios, prescricoes, transacoes

---

## Decisao Tecnica

**Migrar para `cmdk`** (mesma lib que Stripe, Linear, Vercel usam)

**Razoes:**
1. Navegacao por teclado ja vem pronta (arrow up/down + Enter)
2. Renderizacao otimizada para performance
3. Acessibilidade (ARIA) incluida
4. Padrao da industria - users ja conhecem o comportamento
5. shadcn/ui tem componente Command baseado nele

---

## Implementacao

### 1. Instalar cmdk
```bash
npm install cmdk
```

### 2. Quick Actions (navegacao estatica)

```typescript
const quickActions = [
  { id: 'dashboard', label: 'Ir para Dashboard', path: '/dashboard', icon: Home },
  { id: 'agenda', label: 'Ir para Agenda', path: '/agenda', icon: Calendar },
  { id: 'patients', label: 'Ir para Pacientes', path: '/patients', icon: Users },
  { id: 'new-patient', label: 'Novo Paciente', path: '/patients/new', icon: UserPlus },
  { id: 'finance', label: 'Ir para Financeiro', path: '/finance', icon: DollarSign },
  { id: 'reports', label: 'Ir para Relatorios', path: '/reports', icon: BarChart },
  { id: 'settings', label: 'Configuracoes', path: '/settings', icon: Settings },
]
```

### 3. Reescrever CommandPalette com cmdk

**Arquivo:** `src/components/search/CommandPalette.tsx` (~150 linhas)

```tsx
import { Command } from 'cmdk'

<Command.Dialog open={isOpen} onOpenChange={onClose}>
  <Command.Input placeholder="Buscar ou ir para..." />
  <Command.List>
    <Command.Empty>Nenhum resultado</Command.Empty>

    {/* Quick Actions - sempre visiveis inicialmente */}
    <Command.Group heading="Acoes Rapidas">
      {quickActions.map(action => (
        <Command.Item key={action.id} onSelect={() => navigate(action.path)}>
          <action.icon /> {action.label}
        </Command.Item>
      ))}
    </Command.Group>

    {/* Resultados de busca - aparecem quando digita */}
    {groupedResults.patient.length > 0 && (
      <Command.Group heading="Pacientes">
        {groupedResults.patient.map(p => (
          <Command.Item key={p.id} onSelect={() => navigate(p.path)}>
            ...
          </Command.Item>
        ))}
      </Command.Group>
    )}

    {groupedResults.appointment.length > 0 && (
      <Command.Group heading="Consultas">
        ...
      </Command.Group>
    )}
  </Command.List>
</Command.Dialog>
```

### 4. Manter useGlobalSearch
O hook atual ja funciona bem - apenas conecta-lo ao novo componente.

### 5. Estilizacao com Design System
- `bg-genesis-surface` para fundo
- `border-genesis-border` para bordas
- `bg-genesis-hover` para item selecionado (via [cmdk-item-active])
- `text-genesis-dark` / `text-genesis-muted` para textos

---

## Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `package.json` | Adicionar `cmdk` como dependencia |
| `src/components/search/CommandPalette.tsx` | Reescrever usando cmdk |

---

## Resultado Final

| Antes | Depois |
|-------|--------|
| So busca pacientes/consultas | Busca + Quick Actions |
| Navegacao setas nao funciona | Arrow keys + Enter + Esc funcionais |
| UI basica | UI polida estilo Stripe |

---

## Ordem de Execucao

1. `npm install cmdk`
2. Reescrever `CommandPalette.tsx`
3. Testar navegacao por teclado + busca
4. Validar build
