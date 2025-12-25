# Plano: Demo do Portal do Paciente

## Objetivo
Expor o portal do paciente como demo para mostrar a potenciais clientes que o sistema funciona de verdade - usando dados reais do Firestore.

## Dados Demo (Existentes)
```
clinicId:  5aEI4f6S4e7q6G5M91M9  (Clinica Genesis)
patientId: 3xBppjJ550Jg0B4Yw8rg
```

---

## Arquitetura

```
Landing (/)
    │
    └── "Ver Demo Paciente" → /portal/demo
                                    │
                         ┌──────────┴──────────┐
                         │ DemoPatientWrapper  │
                         │ (injeta IDs demo)   │
                         └──────────┬──────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                Dashboard      Consultas       Exames...
                (mesmo UI, dados reais via Firestore)
```

---

## Arquivos a Criar (4 arquivos)

### 1. `src/contexts/DemoPatientContext.tsx` (~100 linhas)
Provider que substitui PatientAuthContext e PatientPortalContext para demo:
- Retorna profile hardcoded com clinicId/patientId demo
- Usa Firestore real para buscar dados do paciente
- Interface idêntica aos contextos originais

### 2. `src/components/patient-portal/DemoPatientPortalLayout.tsx` (~60 linhas)
- Reutiliza PatientPortalLayout
- Adiciona banner "Modo Demonstração"
- Ajusta navegação para rotas `/portal/demo/*`

### 3. `src/components/patient-portal/DemoBanner.tsx` (~30 linhas)
- Banner fixo no topo: "Modo Demonstração - Você está explorando como paciente demo"
- Link para `/portal/login` para acessar conta real

### 4. `src/pages/patient-portal/DemoEntry.tsx` (~40 linhas)
- Wrapper que combina providers demo
- Renderiza Outlet para rotas filhas

---

## Arquivos a Modificar (2 arquivos)

### 1. `src/App.tsx`
Adicionar rotas demo:
```tsx
{/* Patient Portal Demo Routes */}
<Route path="/portal/demo" element={<DemoPatientWrapper />}>
  <Route index element={<PatientDashboard />} />
  <Route path="consultas" element={<PatientAppointments />} />
  <Route path="historico" element={<PatientHistory />} />
  <Route path="exames" element={<PatientLabResults />} />
  <Route path="receitas" element={<PatientPrescriptions />} />
  <Route path="mensagens" element={<PatientMessages />} />
  <Route path="financeiro" element={<PatientBilling />} />
  <Route path="teleconsulta" element={<PatientTelehealth />} />
</Route>
```

### 2. `src/pages/Landing.tsx`
Adicionar botão "Ver Demo Paciente":
```tsx
<button onClick={() => navigate('/portal/demo')}>
  Ver Demo Paciente
</button>
```

---

## Constantes Demo

```typescript
// src/config/demo.ts
export const DEMO_CONFIG = {
  clinicId: '5aEI4f6S4e7q6G5M91M9',
  patientId: '3xBppjJ550Jg0B4Yw8rg',
  patientName: 'Paciente Demo',
  patientEmail: 'demo@clinicagenesis.com',
} as const;
```

---

## Fluxo de Implementação

1. **Criar constantes demo** (`src/config/demo.ts`)
2. **Criar DemoPatientContext** - provider que injeta IDs demo
3. **Criar DemoBanner** - indicador visual de demo
4. **Criar DemoPatientPortalLayout** - layout com banner
5. **Criar DemoEntry** - wrapper para rotas
6. **Modificar App.tsx** - adicionar rotas `/portal/demo/*`
7. **Modificar Landing.tsx** - adicionar botão de acesso

---

## Segurança

- IDs demo são hardcoded, não podem ser alterados via URL
- Dados são reais mas isolados na clínica demo
- Ações de escrita (mensagens, agendamentos) funcionam mas vão para clínica demo
- Não há bypass de auth em produção - rotas demo usam provider separado

---

## Resultado Esperado

Visitante acessa `/portal/demo` e vê:
- Banner amarelo "Modo Demonstração"
- Dashboard com consultas reais da clínica demo
- Pode navegar por todas as seções do portal
- Vê como o sistema funciona na prática
