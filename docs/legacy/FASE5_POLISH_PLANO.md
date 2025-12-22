# Fase 5: Polish - Plano de Correção dos 38 Airgaps

> Baseado em pesquisa de Dezembro 2025
> Princípio: Simples e Funcional, sem over-engineering

---

## Resumo de Decisões Técnicas

| Categoria | Solução Escolhida | Justificativa |
|-----------|-------------------|---------------|
| **Toast** | Sonner | shadcn/ui choice, API simples, 0 config |
| **Error Boundary** | react-error-boundary | Hooks support, funcional |
| **Skeleton** | CSS puro (shimmer) | Já temos animação shimmer no CSS |
| **Bundle Split** | React.lazy + manualChunks | Padrão Vite 2025 |
| **A11y** | ARIA nativo + htmlFor | Sem biblioteca extra |
| **Validação** | Inline simples | Sem form library (complexidade desnecessária) |

---

## Sprint 1: Crítico + UX (Estimativa: 2-3h)

### 1.1 Sistema de Toast (Sonner)

**Instalar:**
```bash
npm install sonner
```

**Arquivos a modificar:**
- `src/App.tsx` - Adicionar `<Toaster />` no root
- `src/pages/NewPatient.tsx` - Substituir alert() por toast()
- `src/pages/EditPatient.tsx` - Substituir alert() por toast()
- `src/plugins/medicina/SoapEditor.tsx` - Substituir alert() por toast()

**Implementação:**
```tsx
// App.tsx
import { Toaster } from 'sonner';

function App() {
  return (
    <AuthProvider>
      <ClinicProvider>
        <Toaster richColors position="top-right" />
        <Router>
          {/* ... */}
        </Router>
      </ClinicProvider>
    </AuthProvider>
  );
}

// Nos componentes:
import { toast } from 'sonner';

// Sucesso
toast.success('Paciente cadastrado com sucesso!');

// Erro
toast.error('Erro ao salvar. Tente novamente.');

// Validação
toast.warning('Preencha os campos obrigatórios.');
```

**Checklist:**
- [ ] Instalar sonner
- [ ] Adicionar Toaster no App.tsx
- [ ] Substituir 6 alert() em 4 arquivos
- [ ] Testar cada cenário

---

### 1.2 Error Boundary

**Instalar:**
```bash
npm install react-error-boundary
```

**Arquivos a criar:**
- `src/components/ui/ErrorFallback.tsx`

**Arquivos a modificar:**
- `src/App.tsx` - Wrap rotas principais

**Implementação:**
```tsx
// src/components/ui/ErrorFallback.tsx
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  error: Error;
  resetErrorBoundary: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-genesis-soft p-8">
      <div className="max-w-md text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-genesis-dark mb-2">
          Algo deu errado
        </h1>
        <p className="text-genesis-medium mb-6">
          {error.message || 'Erro inesperado na aplicação.'}
        </p>
        <button
          onClick={resetErrorBoundary}
          className="inline-flex items-center gap-2 px-6 py-3 bg-genesis-dark text-white rounded-xl font-medium hover:bg-black transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Tentar novamente
        </button>
      </div>
    </div>
  );
}

// App.tsx - Wrap em rotas críticas
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from './components/ui/ErrorFallback';

<ErrorBoundary FallbackComponent={ErrorFallback}>
  <AppLayout />
</ErrorBoundary>
```

**Checklist:**
- [ ] Instalar react-error-boundary
- [ ] Criar ErrorFallback.tsx
- [ ] Wrap AppLayout no App.tsx
- [ ] Testar com erro intencional

---

### 1.3 Lazy Loading de Páginas

**Arquivos a modificar:**
- `src/App.tsx` - Usar React.lazy para todas as páginas

**Implementação:**
```tsx
// App.tsx
import React, { Suspense, lazy } from 'react';

// Lazy imports
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Agenda = lazy(() => import('./pages/Agenda').then(m => ({ default: m.Agenda })));
const Patients = lazy(() => import('./pages/Patients').then(m => ({ default: m.Patients })));
const PatientDetails = lazy(() => import('./pages/PatientDetails').then(m => ({ default: m.PatientDetails })));
const Finance = lazy(() => import('./pages/Finance').then(m => ({ default: m.Finance })));
const Reports = lazy(() => import('./pages/Reports').then(m => ({ default: m.Reports })));
const WhatsAppMetrics = lazy(() => import('./pages/WhatsAppMetrics').then(m => ({ default: m.WhatsAppMetrics })));
const NewPatient = lazy(() => import('./pages/NewPatient').then(m => ({ default: m.NewPatient })));
const EditPatient = lazy(() => import('./pages/EditPatient').then(m => ({ default: m.EditPatient })));

// Wrap com Suspense no AppLayout
function AppLayout() {
  return (
    <div className="...">
      <Sidebar />
      <div className="...">
        <Header />
        <main className="...">
          <Suspense fallback={<LoadingSpinner />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
```

**Checklist:**
- [ ] Converter 9 páginas para lazy imports
- [ ] Adicionar Suspense wrapper
- [ ] Verificar que LoadingSpinner já existe

---

### 1.4 Bundle Splitting (Vite)

**Arquivos a modificar:**
- `vite.config.ts`

**Implementação:**
```typescript
// vite.config.ts
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    // ... existing config
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // React core
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                return 'react-vendor';
              }
              // Charts
              if (id.includes('recharts') || id.includes('d3')) {
                return 'charts-vendor';
              }
              // Firebase
              if (id.includes('firebase')) {
                return 'firebase-vendor';
              }
              // PDF/Excel
              if (id.includes('jspdf') || id.includes('xlsx') || id.includes('html2canvas')) {
                return 'export-vendor';
              }
              // Utils
              if (id.includes('date-fns') || id.includes('uuid') || id.includes('lucide')) {
                return 'utils-vendor';
              }
            }
          }
        }
      }
    }
  };
});
```

**Checklist:**
- [ ] Adicionar manualChunks ao vite.config.ts
- [ ] Rodar build e verificar chunks
- [ ] Confirmar bundle principal < 500KB

---

### 1.5 Confirmação em Ações Destrutivas

**Arquivos a criar:**
- `src/components/ui/ConfirmDialog.tsx`

**Implementação:**
```tsx
// src/components/ui/ConfirmDialog.tsx
interface Props {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning';
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  onConfirm,
  onCancel,
  variant = 'danger'
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-bold text-genesis-dark mb-2">{title}</h3>
        <p className="text-genesis-medium text-sm mb-6">{description}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-genesis-dark hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
              variant === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-500 hover:bg-amber-600'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Checklist:**
- [ ] Criar ConfirmDialog.tsx
- [ ] Usar em ações de delete (onde existirem)

---

## Sprint 2: Acessibilidade (Estimativa: 1-2h)

### 2.1 Labels com htmlFor

**Arquivos a modificar (principais):**
- `src/pages/NewPatient.tsx`
- `src/pages/EditPatient.tsx`
- `src/components/onboarding/StepClinicInfo.tsx`
- `src/components/onboarding/StepSettings.tsx`
- `src/components/finance/TransactionForm.tsx`

**Padrão:**
```tsx
// ANTES
<label className="...">Nome</label>
<input name="name" ... />

// DEPOIS
<label htmlFor="patient-name" className="...">Nome</label>
<input id="patient-name" name="name" ... />
```

**Checklist:**
- [ ] Adicionar htmlFor em ~30 labels
- [ ] Garantir IDs únicos por contexto

---

### 2.2 ARIA Básico

**Adições simples:**
```tsx
// Botões com ícone só
<button aria-label="Fechar modal">
  <X className="w-5 h-5" />
</button>

// Modais
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">

// Alerts
<div role="alert" aria-live="polite">

// Navegação
<nav aria-label="Menu principal">

// Loading
<div aria-busy="true" aria-label="Carregando...">
```

**Checklist:**
- [ ] Adicionar aria-label em botões de ícone
- [ ] Adicionar role="dialog" em modais
- [ ] Adicionar aria-label na Sidebar

---

### 2.3 Imagem Alt Vazio

**Arquivo:**
- `src/pages/Patients.tsx:141`

**Fix:**
```tsx
// ANTES
alt=""

// DEPOIS
alt={patient.name}
```

**Checklist:**
- [ ] Corrigir alt vazio

---

### 2.4 Index como Key (14 ocorrências)

**Arquivos a modificar:**
- `src/pages/Reports.tsx` - 2 ocorrências
- `src/components/agenda/MonthView.tsx`
- `src/components/agenda/WeekView.tsx` - 2 ocorrências
- `src/components/ai/clinical-reasoning/*.tsx` - 6 ocorrências
- `src/plugins/medicina/PrescriptionEditor.tsx`

**Padrão:**
```tsx
// ANTES (estático, ok manter)
{days.map((day, index) => <div key={index}>...)}

// DEPOIS (dinâmico, precisa ID)
{items.map((item) => <div key={item.id || `item-${item.name}`}>...)}
```

**Checklist:**
- [ ] Avaliar cada caso (estático vs dinâmico)
- [ ] Corrigir apenas listas dinâmicas

---

## Sprint 3: Performance (Estimativa: 1h)

### 3.1 Imagens com loading="lazy"

**Arquivos:**
- `src/pages/PatientDetails.tsx`
- `src/pages/Patients.tsx`
- `src/components/ui/AvatarUpload.tsx`
- `src/components/patient/Timeline.tsx`
- `src/components/records/AttachmentUpload.tsx`

**Fix:**
```tsx
<img src={url} alt={alt} loading="lazy" />
```

**Checklist:**
- [ ] Adicionar loading="lazy" em 9 imgs

---

### 3.2 Catch Blocks Vazios

**Arquivos:**
- `src/pages/auth/Register.tsx:43,56`
- `src/pages/auth/Login.tsx:23,35`
- `src/components/layout/Sidebar.tsx:101`
- `src/components/records/AttachmentUpload.tsx:122`

**Fix:**
```tsx
// ANTES
} catch {
  // silenciado
}

// DEPOIS
} catch (err) {
  console.error('Context: what failed', err);
  // ou toast.error se relevante para usuário
}
```

**Checklist:**
- [ ] Adicionar log em 6 catch blocks

---

### 3.3 Skeleton Loader (CSS puro)

Já temos a animação `shimmer` no `index.css`. Criar componente simples:

**Arquivo a criar:**
- `src/components/ui/Skeleton.tsx`

```tsx
interface Props {
  className?: string;
}

export function Skeleton({ className = '' }: Props) {
  return (
    <div
      className={`bg-gray-200 animate-shimmer rounded ${className}`}
      aria-hidden="true"
    />
  );
}

// Uso:
<Skeleton className="h-4 w-32" />
<Skeleton className="h-10 w-full" />
```

**Checklist:**
- [ ] Criar Skeleton.tsx
- [ ] Usar em 2-3 locais críticos (lista pacientes, transações)

---

## Sprint 4: Quick Wins (Estimativa: 30min)

### 4.1 Lint Warning Fix

**Arquivo:** `src/components/onboarding/StepSpecialties.tsx:35`

```tsx
// ANTES
const SPECIALTIES = [
  { id: 'medicina', name: 'Medicina', icon: Stethoscope, color: 'bg-blue-500' },

// DEPOIS (prefixar com _)
{ id: 'medicina', name: 'Medicina', icon: Stethoscope, _color: 'bg-blue-500' },
// ou remover se não usado
```

---

### 4.2 404 Page

**Arquivo a criar:**
- `src/pages/NotFound.tsx`

```tsx
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-genesis-soft p-8">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-genesis-dark/10 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-genesis-dark mb-2">
          Página não encontrada
        </h2>
        <p className="text-genesis-medium mb-8">
          A página que você procura não existe ou foi movida.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 text-genesis-dark hover:bg-white rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-genesis-dark text-white rounded-xl font-medium hover:bg-black transition-colors"
          >
            <Home className="w-4 h-4" /> Ir para Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Checklist:**
- [ ] Criar NotFound.tsx
- [ ] Atualizar App.tsx para usar o componente

---

## Backlog (Pós-MVP)

Estes itens NÃO serão implementados agora:

- [ ] Dark Mode
- [ ] Print Styles
- [ ] PWA/Service Worker
- [ ] Form Library (react-hook-form)
- [ ] Skip Links
- [ ] Debounce em buscas
- [ ] React.memo em listas

---

## Ordem de Execução

1. **Instalar dependências** (sonner, react-error-boundary)
2. **Sprint 1.1** - Toast system
3. **Sprint 1.2** - Error Boundary
4. **Sprint 1.3** - Lazy Loading
5. **Sprint 1.4** - Bundle Splitting
6. **Sprint 1.5** - ConfirmDialog
7. **Sprint 2** - A11y (htmlFor, ARIA, alt, keys)
8. **Sprint 3** - Performance (lazy imgs, catch blocks, skeleton)
9. **Sprint 4** - Quick wins (lint, 404)
10. **Validar** - Lint, Types, Tests, Build

---

## Arquivos Críticos

```
src/
├── App.tsx                          # Lazy loading, ErrorBoundary, Toaster
├── vite.config.ts                   # manualChunks
├── components/
│   └── ui/
│       ├── ErrorFallback.tsx        # NOVO
│       ├── ConfirmDialog.tsx        # NOVO
│       └── Skeleton.tsx             # NOVO
├── pages/
│   ├── NewPatient.tsx               # Toast, htmlFor
│   ├── EditPatient.tsx              # Toast, htmlFor
│   ├── Patients.tsx                 # alt fix
│   ├── NotFound.tsx                 # NOVO
│   └── auth/
│       ├── Login.tsx                # Catch fix
│       └── Register.tsx             # Catch fix
└── plugins/
    └── medicina/
        └── SoapEditor.tsx           # Toast
```

---

## Métricas de Sucesso

| Métrica | Antes | Depois |
|---------|-------|--------|
| Bundle principal | 2.2MB | < 500KB |
| alert() | 6 | 0 |
| Error Boundaries | 0 | 1+ |
| htmlFor | 12 | 42 |
| Lazy pages | 1 | 10 |
| Catch vazios | 6 | 0 |

---

## Fontes

- [Sonner vs React Hot Toast - LogRocket 2025](https://blog.logrocket.com/react-toast-libraries-compared-2025/)
- [Vite Code Splitting Best Practices](https://www.mykolaaleksandrov.dev/posts/2025/11/taming-large-chunks-vite-react/)
- [react-error-boundary GitHub](https://github.com/bvaughn/react-error-boundary)
- [React A11y Best Practices 2025](https://dev.to/mridudixit15/accessibility-in-react-best-practices-every-developer-should-know-dp1)
