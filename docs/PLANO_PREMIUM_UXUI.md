# Plano: Premium UX/UI - Clínica Genesis OS

## Objetivo
Elevar a experiência do usuário para nível premium, inspirado em apps como **Linear**, **Notion**, **Stripe Dashboard**, e **One Medical** (healthcare).

---

## Fase 1: PWA Install Prompt - Mover para dentro do App

### Problema
O `InstallPrompt` está montado globalmente em `App.tsx`, aparecendo até na Landing Page pública.

### Solução
Mover o `InstallPrompt` para dentro do `AppLayout` (rotas autenticadas).

### Arquivos a Modificar
- `/src/App.tsx` - Remover `<InstallPrompt />` do nível global
- `/src/App.tsx` - Adicionar `<InstallPrompt />` dentro de `AppLayout()`

### Mudança Específica
```tsx
// REMOVER da linha 131 (nível global):
<InstallPrompt />

// ADICIONAR dentro de AppLayout():
function AppLayout() {
  return (
    <div className="...">
      <InstallPrompt /> {/* Novo local */}
      <Sidebar />
      ...
    </div>
  );
}
```

---

## Fase 2: Substituir alert() por Toast Premium

### Problema
`Billing.tsx:17` usa `alert()` nativo - UX de 2010.

### Solução
Usar Sonner com feedback contextual e ações.

### Arquivos a Modificar
- `/src/pages/Billing.tsx` - Substituir alert por toast.success com ação

### Mudança Específica
```tsx
// DE:
alert('Guia gerada com sucesso! (Em desenvolvimento)');

// PARA:
import { toast } from 'sonner';
toast.success('Guia TISS gerada com sucesso', {
  description: 'Número da guia: TISS-2025-001',
  action: {
    label: 'Ver guia',
    onClick: () => setActiveTab('historico'),
  },
});
```

---

## Fase 3: Micro-interações Premium nos Botões

### Problema
Botões têm apenas `transition-colors` - falta feedback tátil.

### Solução
Adicionar scale, shadow e ripple effect ao design system.

### Arquivos a Modificar
- `/src/design-system/components/Button.tsx` - Adicionar micro-interações
- `/index.css` - Adicionar keyframe para ripple effect

### CSS a Adicionar (index.css)
```css
@keyframes ripple {
  to {
    transform: scale(2);
    opacity: 0;
  }
}

.btn-premium {
  position: relative;
  overflow: hidden;
}

.btn-premium::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 60%);
  transform: scale(0);
  opacity: 1;
}

.btn-premium:active::after {
  animation: ripple 0.4s ease-out;
}
```

### Classes Tailwind a Adicionar nos Botões
```
hover:scale-[1.02] active:scale-[0.98]
hover:shadow-lg hover:-translate-y-0.5
transition-all duration-200 ease-out
```

---

## Fase 4: Estados Vazios Premium

### Problema
Empty states são genéricos (ícone + texto).

### Solução
Criar componente `EmptyState` reutilizável com ilustrações SVG.

### Arquivos a Criar/Modificar
- `/src/components/ui/EmptyState.tsx` - Novo componente
- `/src/pages/Billing.tsx` - Usar novo EmptyState

### Estrutura do Componente
```tsx
interface EmptyStateProps {
  illustration: 'documents' | 'search' | 'success' | 'calendar';
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

### Ilustrações SVG (inline, minimalistas)
- Usar estilo "line art" com cores do design system
- Animação sutil de float nos elementos

---

## Fase 5: Feedback de Loading Premium

### Problema
Loading usa apenas spinner genérico.

### Solução
Implementar Skeleton loading e shimmer effect.

### Arquivos a Criar/Modificar
- `/src/components/ui/Skeleton.tsx` - Componente skeleton
- `/index.css` - Shimmer animation

### CSS Shimmer
```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-genesis-hover) 25%,
    var(--color-genesis-soft) 50%,
    var(--color-genesis-hover) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

---

## Fase 6: Padronização de Tokens de Cor

### Problema
Inconsistência: `genesis-blue` vs `genesis-primary` usados intercaladamente.

### Solução
Substituir todas as ocorrências de `genesis-blue` por `genesis-primary`.

### Arquivos a Modificar (grep encontrou 15+ arquivos)
- `/src/components/layout/Sidebar.tsx`
- `/src/components/layout/Header.tsx`
- `/src/pages/Dashboard.tsx`
- Outros componentes com `text-genesis-blue` ou `bg-genesis-blue`

### Busca e Substituição
```
text-genesis-blue → text-genesis-primary
bg-genesis-blue → bg-genesis-primary
border-genesis-blue → border-genesis-primary
ring-genesis-blue → ring-genesis-primary
```

---

## Fase 7: Header Contextual

### Problema
Header mostra mesmo conteúdo em todas as páginas - não adapta ao contexto.

### Solução
Criar `PageContext` que permite cada página definir suas ações no header.

### Arquivos a Criar/Modificar
- `/src/contexts/PageContext.tsx` - Novo contexto
- `/src/components/layout/Header.tsx` - Consumir contexto
- `/src/pages/*.tsx` - Páginas definem suas ações

### Estrutura do Contexto
```tsx
interface PageContextValue {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

// Hook para páginas usarem:
const { setPageContext } = usePageContext();

useEffect(() => {
  setPageContext({
    title: 'Paciente: João Silva',
    actions: (
      <>
        <Button variant="outline">Agendar</Button>
        <Button>Nova Consulta</Button>
      </>
    ),
  });
  return () => setPageContext({});
}, []);
```

### Exemplo de Header Adaptável
- **Dashboard**: Mostra saudação + data
- **Pacientes**: Mostra botão "Novo Paciente"
- **PatientDetails**: Mostra nome do paciente + ações específicas
- **Billing**: Mostra filtros de período + exportar

---

## Ordem de Execução Recomendada

| # | Fase | Impacto | Complexidade |
|---|------|---------|--------------|
| 1 | PWA Install Prompt | Alto | Baixa |
| 2 | Substituir alert() | Alto | Baixa |
| 3 | Micro-interações Botões | Alto | Média |
| 4 | Padronização Tokens | Médio | Baixa |
| 5 | Skeleton Loading | Médio | Média |
| 6 | Empty States Premium | Médio | Média |
| 7 | Header Contextual | Alto | Média |

---

## Arquivos Críticos

```
/src/App.tsx                              # PWA location
/src/pages/Billing.tsx                    # alert() → toast
/src/design-system/components/Button.tsx  # micro-interactions
/src/components/ui/Skeleton.tsx           # NOVO
/src/components/ui/EmptyState.tsx         # NOVO
/src/contexts/PageContext.tsx             # NOVO - Header contextual
/index.css                                # animações CSS
/src/components/layout/Sidebar.tsx        # tokens
/src/components/layout/Header.tsx         # tokens + PageContext
/src/pages/Dashboard.tsx                  # PageContext
/src/pages/Patients.tsx                   # PageContext
/src/pages/PatientDetails.tsx             # PageContext
```

---

## Referências 2025

- [Healthcare UX Design Trends 2025](https://www.webstacks.com/blog/healthcare-ux-design)
- [UX Psychology Principles](https://www.uxmatters.com/mt/archives/2025/11/the-psychology-of-user-experience-how-small-design-tweaks-can-cause-big-behavioral-changes.php)
- [SaaS UI/UX Trends 2025](https://innovizionstudio.com/ui-ux-design-trends-for-saas-startups-in-2025/)
- [Aesthetic-Usability Effect](https://www.userflow.com/blog/18-user-psychology-concepts-for-successful-ux-design)

---

## Resultado Esperado

Após implementação:
- Sensação de "polish" e profissionalismo
- Feedback imediato em cada interação
- Consistência visual 100%
- Loading states informativos (não genéricos)
- PWA install apenas para usuários engajados (dentro do app)
