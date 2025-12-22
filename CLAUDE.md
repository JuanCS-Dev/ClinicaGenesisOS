# Clínica Genesis OS - Claude Code Instructions

## REGRAS CRÍTICAS

### Gradientes em Texto - NÃO USAR

**REGRA:** Aplicações profissionais/enterprise NÃO usam gradient text. É considerado amador.

```tsx
// ❌ NUNCA fazer isso
<span className="bg-gradient-to-r from-teal-500 to-purple-500 bg-clip-text text-transparent">
  Texto
</span>

// ✅ CORRETO - Cor sólida
<span className="text-genesis-primary">Texto destacado</span>
```

**Exceções:** Gradientes são OK para backgrounds de elementos decorativos, não para texto.

---

### Dark Mode - Tokens Obrigatórios

**REGRA:** NUNCA usar cores hardcoded que não adaptam ao dark mode.

```tsx
// ❌ ERRADO - Não adapta ao dark mode
<div className="bg-white border-gray-100 text-gray-900">

// ✅ CORRETO - Usa tokens do design system
<div className="bg-genesis-surface border-genesis-border-subtle text-genesis-dark">
```

**Tokens que DEVEM ser usados:**
- `bg-genesis-surface` (não `bg-white`)
- `bg-genesis-soft` (não `bg-gray-50`)
- `bg-genesis-hover` (não `hover:bg-gray-50`)
- `border-genesis-border-subtle` (não `border-gray-100`)
- `text-genesis-dark` (não `text-gray-900`)
- `text-genesis-muted` (não `text-gray-500`)
- `text-genesis-subtle` (não `text-gray-400`)

---

## Padrões do Projeto

### Design System
- Usar tokens de cor: `genesis-primary`, `genesis-dark`, `genesis-muted`, etc.
- NUNCA usar `genesis-blue` (deprecated) - usar `genesis-primary`
- Micro-interações nos botões: `hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98]`

### Componentes
- Toast: usar `sonner` (`toast.success()`, `toast.error()`)
- Empty States: usar `<EmptyState />` component
- Loading: usar `<Skeleton />` component com shimmer

### Contextos
- `AuthContext` - autenticação Firebase
- `ClinicContext` - dados da clínica
- `PageContext` - header contextual (título, ações, breadcrumbs)
