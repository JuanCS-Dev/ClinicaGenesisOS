# Plano: Eliminação de Mocks - Patient Portal & Sistema Completo

**Data**: 2025-12-24
**Status**: Em execução

---

## Progresso

| Sprint | Status | Data |
|--------|--------|------|
| Sprint 1: Infraestrutura | ✅ Completo | 2025-12-25 |
| Sprint 2: Patient Portal - Core | ✅ Completo | 2025-12-25 |
| Sprint 3: Patient Portal - Avançado | ✅ Completo | 2025-12-25 |
| Auditoria CODE_CONSTITUTION | ✅ Aprovado | 2025-12-25 |
| Sprint 4: Externos | ⏳ Pendente | - |
| Sprint 5: Auditoria Final | ⏳ Pendente | - |

### Sprint 1 - Arquivos Criados
- ✅ `src/contexts/PatientPortalContext.tsx`
- ✅ `src/types/lab-result/lab-result.ts`
- ✅ `src/types/lab-result/index.ts`
- ✅ `src/services/firestore/lab-result.service.ts`
- ✅ `src/hooks/useLabResults.ts`
- ✅ `src/hooks/usePatientPortal.ts` (hooks agregados)

### Sprint 2 - Páginas Refatoradas
- ✅ `patient-portal/Dashboard.tsx` - Mocks removidos, usa `usePatientPortalAppointments`, `usePatientPortalPrescriptions`
- ✅ `patient-portal/Appointments.tsx` - Mocks removidos, usa `usePatientPortalAppointments`
- ✅ `patient-portal/Prescriptions.tsx` - Mocks removidos, usa `usePatientPortalPrescriptions`
- ✅ `patient-portal/Billing.tsx` - Mocks removidos, usa `usePatientPortalBilling`

### Sprint 3 - Arquivos Criados
- ✅ `src/types/message/message.ts` - Tipos para sistema de mensagens
- ✅ `src/types/message/index.ts` - Re-exports
- ✅ `src/services/firestore/message.service.ts` - CRUD de conversas e mensagens
- ✅ `src/hooks/usePatientMessages.ts` - Hook para mensagens do paciente
- ✅ `src/hooks/usePatientTelehealth.ts` - Hook para teleconsultas do paciente

### Sprint 3 - Páginas Refatoradas
- ✅ `patient-portal/LabResults.tsx` - Mocks removidos, usa `useLabResults`
- ✅ `patient-portal/Messages.tsx` - Mocks removidos, usa `usePatientMessages`
- ✅ `patient-portal/Telehealth.tsx` - Mocks removidos, usa `usePatientTelehealth`

---

## Resumo Executivo

Eliminar todos os mocks do sistema, começando pelo Patient Portal (7 páginas) e seguindo com Public Booking e botões fantasma. Estratégia: reutilizar dados existentes do lado médico, criar nova infraestrutura para Lab Results.

## Decisões do Usuário
- **Prioridade**: Patient Portal primeiro
- **Arquitetura**: Reutilizar dados existentes (appointments, prescriptions do médico)
- **Lab Results**: Sistema completo com upload de PDFs

---

## Fase 1: Infraestrutura Base ✅

### 1.1 Patient Context ✅
**Arquivo**: `src/contexts/PatientPortalContext.tsx`

Contexto para identificar o paciente logado e fornecer acesso aos seus dados.

```typescript
interface PatientPortalContextType {
  patientId: string | null;
  patientData: Patient | null;
  loading: boolean;
}
```

### 1.2 Lab Results Types ✅
**Arquivo**: `src/types/lab-result/lab-result.ts`

```typescript
export interface LabResult {
  id: string;
  patientId: string;
  patientName: string;
  examName: string;
  examType: 'hemograma' | 'bioquimica' | 'hormonal' | 'urina' | 'imagem' | 'outros';
  status: 'pending' | 'ready' | 'viewed';
  requestedAt: string;
  completedAt?: string;
  fileUrl?: string;        // PDF do resultado
  fileType?: 'pdf' | 'image';
  requestedBy: string;     // médico que solicitou
  notes?: string;
  clinicId: string;
}
```

### 1.3 Lab Results Service ✅
**Arquivo**: `src/services/firestore/lab-result.service.ts`

- Path: `/clinics/{clinicId}/lab-results/{resultId}`
- Métodos: `getByPatient`, `create`, `update`, `uploadFile`
- Subscriptions: `subscribeByPatient`

### 1.4 Lab Results Hook ✅
**Arquivo**: `src/hooks/useLabResults.ts`

---

## Fase 2: Patient Portal - Core ✅

### 2.1 Dashboard (`patient-portal/Dashboard.tsx`) ✅
**Removido**: `MOCK_NEXT_APPOINTMENT`, `MOCK_NOTIFICATIONS`

**Implementado**:
- `usePatientPortalAppointments()` - próxima consulta real
- `usePatientPortalPrescriptions()` - para notificações de receitas expirando
- Skeleton loading states
- Empty states quando não há dados

---

### 2.2 Appointments (`patient-portal/Appointments.tsx`) ✅
**Removido**: `MOCK_APPOINTMENTS`

**Implementado**:
- `usePatientPortalAppointments()` - lista de consultas
- Filtro por status (upcoming, past)
- Skeleton loading states
- Empty states quando não há dados

---

### 2.3 Prescriptions (`patient-portal/Prescriptions.tsx`) ✅
**Removido**: `MOCK_PRESCRIPTIONS`

**Implementado**:
- `usePatientPortalPrescriptions()` - lista de receitas
- Filtro por busca e status (ativa/expirada)
- Skeleton loading states
- Empty states quando não há dados

---

### 2.4 Billing (`patient-portal/Billing.tsx`) ✅
**Removido**: `MOCK_INVOICES`

**Implementado**:
- `usePatientPortalBilling()` - transações do paciente
- Resumo de pagos/pendentes calculado de dados reais
- Skeleton loading states
- Empty states quando não há dados

---

## Fase 3: Patient Portal - Avançado ✅

### 3.1 Lab Results (`patient-portal/LabResults.tsx`) ✅
**Removido**: `MOCK_RESULTS`

**Implementado**:
- `useLabResults()` - hook que usa PatientPortalContext
- Skeleton loading states
- Empty states quando não há dados
- Ações funcionais (visualizar, download)
- Status 'viewed' para marcar exames já vistos

---

### 3.2 Messages (`patient-portal/Messages.tsx`) ✅
**Removido**: `MOCK_CONVERSATIONS`

**Implementado**:
- `src/types/message/` - tipos completos (Message, Conversation, etc.)
- `messageService` - CRUD de conversas e mensagens com real-time
- `usePatientMessages()` - hook com subscriptions em tempo real
- Conversa em tempo real com auto-scroll
- Status de leitura de mensagens

---

### 3.3 Telehealth (`patient-portal/Telehealth.tsx`) ✅
**Removido**: `MOCK_TELECONSULTA`

**Implementado**:
- `usePatientTelehealth()` - hook para próxima teleconsulta
- Busca próxima teleconsulta a partir de appointments
- Calcula `canJoin` e `minutesUntilJoin` dinamicamente
- Empty state quando não há teleconsulta agendada

---

## Auditoria CODE_CONSTITUTION ✅

**Data**: 2025-12-25
**Auditor**: Claude Code

### Resultado por Critério

| Critério | Status |
|----------|--------|
| 1. Padrão Pagani (Zero Placeholders) | ✅ APROVADO |
| 2. Limites de Arquivo (<500 linhas) | ✅ APROVADO |
| 3. Type Hints (100% cobertura) | ✅ APROVADO |
| 4. Naming Conventions | ✅ APROVADO |
| 5. Docstrings/JSDoc | ✅ APROVADO |
| 6. Error Handling | ✅ APROVADO |
| 7. Security (no hardcoded secrets) | ✅ APROVADO |

### Detalhes

**Limites de Arquivo:**
- 🏆 EXCELLENT (<300): 9 arquivos
- ✅ IDEAL (<400): 5 arquivos
- ⚠️ WARNING (400-499): 3 arquivos (message.service.ts, prescription.service.ts, Dashboard.tsx)
- ❌ FORBIDDEN (≥500): 0 arquivos

**Recomendações Futuras:**
1. Refatorar arquivos >400 linhas
2. Adicionar tipo explícito em `useClinicLabResults`
3. History.tsx ainda tem MOCK (Sprint 4)

---

## Fase 4: Public Booking

### 3.1 BookAppointment (`public/BookAppointment.tsx`)
**Remover**: `MOCK_CLINIC`, `MOCK_PROFESSIONALS`

**Substituir por**:
- Buscar clínica por slug/ID da URL
- `usePublicClinicData(clinicSlug)`
- Profissionais reais com disponibilidade

---

## Fase 4: Botões Fantasma (5 correções)

| Arquivo | Botão | Ação |
|---------|-------|------|
| `Analytics.tsx:84` | Atualizar | Refetch dos dados |
| `Analytics.tsx:88` | Exportar | Gerar PDF/Excel |
| `Finance.tsx:124` | Filtros | Abrir drawer de filtros |
| `Reports.tsx:180` | Compartilhar | Modal de compartilhamento |
| `WhatsAppMetrics.tsx:103` | Atualizar | Refetch métricas |

---

## Fase 5: Auditoria Final - Caça aos Mocks

### 5.1 Script de Auditoria Automatizada
**Arquivo**: `scripts/audit-mocks.sh`

Script que detecta padrões de mock disfarçados:

```bash
#!/bin/bash
# Auditoria de Mocks - Zero Tolerance Policy

echo "🔍 AUDITORIA DE MOCKS - ClinicaGenesisOS"
echo "=========================================="

FOUND_ISSUES=0

# 1. Variáveis MOCK_*
echo -e "\n📋 1. Variáveis MOCK_* explícitas:"
MOCKS=$(grep -rn "MOCK_\|mock_\|Mock_" src/pages src/components --include="*.tsx" --include="*.ts" 2>/dev/null)
if [ -n "$MOCKS" ]; then
  echo "$MOCKS"
  FOUND_ISSUES=$((FOUND_ISSUES + $(echo "$MOCKS" | wc -l)))
else
  echo "   ✅ Nenhum encontrado"
fi

# 2. Arrays hardcoded que parecem dados
echo -e "\n📋 2. Arrays hardcoded suspeitos (dados inline):"
HARDCODED=$(grep -rn "const.*=.*\[{.*id:" src/pages --include="*.tsx" 2>/dev/null | grep -v "node_modules\|\.test\.")
if [ -n "$HARDCODED" ]; then
  echo "$HARDCODED"
  FOUND_ISSUES=$((FOUND_ISSUES + $(echo "$HARDCODED" | wc -l)))
else
  echo "   ✅ Nenhum encontrado"
fi

# 3. Botões sem handler
echo -e "\n📋 3. Botões sem onClick handler:"
NO_HANDLER=$(grep -rn "<button" src/pages --include="*.tsx" -A2 | grep -v "onClick" | grep "<button")
if [ -n "$NO_HANDLER" ]; then
  echo "$NO_HANDLER"
  FOUND_ISSUES=$((FOUND_ISSUES + $(echo "$NO_HANDLER" | wc -l)))
else
  echo "   ✅ Nenhum encontrado"
fi

# 4. onClick vazio
echo -e "\n📋 4. onClick handlers vazios:"
EMPTY_HANDLER=$(grep -rn "onClick={() => {}}\|onClick={()=>{}}\|onClick={() => console" src/pages src/components --include="*.tsx" 2>/dev/null)
if [ -n "$EMPTY_HANDLER" ]; then
  echo "$EMPTY_HANDLER"
  FOUND_ISSUES=$((FOUND_ISSUES + $(echo "$EMPTY_HANDLER" | wc -l)))
else
  echo "   ✅ Nenhum encontrado"
fi

# 5. Dados fake com nomes comuns
echo -e "\n📋 5. Nomes/dados fake comuns:"
FAKE_DATA=$(grep -rn "João Silva\|Maria Santos\|Pedro Oliveira\|Lorem ipsum\|example@\|123456\|Av\. Paulista" src/pages --include="*.tsx" 2>/dev/null | grep -v "placeholder\|// ")
if [ -n "$FAKE_DATA" ]; then
  echo "$FAKE_DATA"
  FOUND_ISSUES=$((FOUND_ISSUES + $(echo "$FAKE_DATA" | wc -l)))
else
  echo "   ✅ Nenhum encontrado"
fi

# 6. Funções que só fazem console.log
echo -e "\n📋 6. Handlers que só fazem console.log:"
CONSOLE_ONLY=$(grep -rn "=> {" src/pages --include="*.tsx" -A1 | grep "console.log" | grep -v "error\|warn")
if [ -n "$CONSOLE_ONLY" ]; then
  echo "$CONSOLE_ONLY"
  FOUND_ISSUES=$((FOUND_ISSUES + $(echo "$CONSOLE_ONLY" | wc -l)))
else
  echo "   ✅ Nenhum encontrado"
fi

# 7. TODO/FIXME/HACK em código
echo -e "\n📋 7. Placeholders proibidos (TODO/FIXME/HACK):"
PLACEHOLDERS=$(grep -rn "// TODO\|// FIXME\|// HACK\|// XXX" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "node_modules")
if [ -n "$PLACEHOLDERS" ]; then
  echo "$PLACEHOLDERS"
  FOUND_ISSUES=$((FOUND_ISSUES + $(echo "$PLACEHOLDERS" | wc -l)))
else
  echo "   ✅ Nenhum encontrado"
fi

# 8. Datas hardcoded (2024-*, 2025-*)
echo -e "\n📋 8. Datas hardcoded:"
HARDCODED_DATES=$(grep -rn "'2024-\|\"2024-\|'2025-\|\"2025-" src/pages --include="*.tsx" 2>/dev/null | grep -v "// \|format\|parse")
if [ -n "$HARDCODED_DATES" ]; then
  echo "$HARDCODED_DATES"
  FOUND_ISSUES=$((FOUND_ISSUES + $(echo "$HARDCODED_DATES" | wc -l)))
else
  echo "   ✅ Nenhum encontrado"
fi

# Resumo
echo -e "\n=========================================="
if [ $FOUND_ISSUES -eq 0 ]; then
  echo "✅ AUDITORIA PASSOU - Zero mocks encontrados!"
  exit 0
else
  echo "❌ AUDITORIA FALHOU - $FOUND_ISSUES problemas encontrados"
  echo "   Corrija todos os itens antes de fazer deploy."
  exit 1
fi
```

### 5.2 Checklist Manual de Validação

Após implementação, verificar manualmente:

- [ ] **Cada página carrega dados do Firestore** (verificar Network tab)
- [ ] **Empty states aparecem quando não há dados** (não dados fake)
- [ ] **Todos os botões têm feedback visual** (loading, disabled, etc.)
- [ ] **Console não tem logs de desenvolvimento** (remover console.log)
- [ ] **Nenhum nome/email/telefone hardcoded** no código
- [ ] **Todas as datas são dinâmicas** (new Date(), não strings fixas)
- [ ] **Filtros e buscas funcionam** (não apenas aparentam funcionar)

### 5.3 Integração com CI/CD

Adicionar ao pipeline:

```yaml
# .github/workflows/audit.yml
- name: Mock Audit
  run: |
    chmod +x scripts/audit-mocks.sh
    ./scripts/audit-mocks.sh
```

---

## Ordem de Execução

```
SPRINT 1: Infraestrutura
├── 1.1 PatientPortalContext
├── 1.2 Lab Result Types
├── 1.3 Lab Result Service
└── 1.4 Lab Result Hook

SPRINT 2: Patient Portal - Core
├── 2.1 Dashboard
├── 2.2 Appointments
├── 2.3 Prescriptions
└── 2.6 Billing

SPRINT 3: Patient Portal - Avançado
├── 2.4 Lab Results (upload PDF)
├── 2.5 Messages (sistema completo)
└── 2.7 Telehealth

SPRINT 4: Externos
├── 3.1 Public Booking
└── 4.* Botões Fantasma

SPRINT 5: Auditoria Final
├── 5.1 Executar script de auditoria
├── 5.2 Checklist manual
└── 5.3 Integrar no CI/CD
```

---

## Arquivos a Criar

| # | Arquivo | Descrição |
|---|---------|-----------|
| 1 | `src/contexts/PatientPortalContext.tsx` | Contexto do paciente logado |
| 2 | `src/types/lab-result/lab-result.ts` | Types de resultados de exames |
| 3 | `src/types/lab-result/index.ts` | Re-exports |
| 4 | `src/types/message/message.ts` | Types de mensagens |
| 5 | `src/types/message/index.ts` | Re-exports |
| 6 | `src/services/firestore/lab-result.service.ts` | CRUD lab results |
| 7 | `src/services/firestore/message.service.ts` | CRUD mensagens |
| 8 | `src/hooks/useLabResults.ts` | Hook lab results |
| 9 | `src/hooks/usePatientMessages.ts` | Hook mensagens |
| 10 | `src/hooks/usePatientPortal.ts` | Hooks agregados do portal |
| 11 | `scripts/audit-mocks.sh` | Script de auditoria automatizada |

---

## Arquivos a Modificar

| # | Arquivo | Modificação |
|---|---------|-------------|
| 1 | `patient-portal/Dashboard.tsx` | Remover mocks, usar hooks reais |
| 2 | `patient-portal/Appointments.tsx` | Remover mocks, usar hooks reais |
| 3 | `patient-portal/LabResults.tsx` | Remover mocks, integrar upload |
| 4 | `patient-portal/Prescriptions.tsx` | Remover mocks, usar hooks reais |
| 5 | `patient-portal/Messages.tsx` | Remover mocks, sistema real |
| 6 | `patient-portal/Billing.tsx` | Remover mocks, usar hooks reais |
| 7 | `patient-portal/Telehealth.tsx` | Remover mocks, usar hooks reais |
| 8 | `public/BookAppointment.tsx` | Remover mocks, dados reais |
| 9 | `Analytics.tsx` | Adicionar handlers |
| 10 | `Finance.tsx` | Adicionar handler filtros |
| 11 | `Reports.tsx` | Adicionar handler share |
| 12 | `WhatsAppMetrics.tsx` | Adicionar handler refresh |
| 13 | `src/types/index.ts` | Exports novos tipos |
| 14 | `src/services/firestore/index.ts` | Exports novos services |

---

## Padrões Obrigatórios

### Multi-tenancy
- Sempre incluir `clinicId` nas queries
- Path: `/clinics/{clinicId}/[collection]`

### Design System
- Tokens genesis-* (sem cores hardcoded)
- Modal do design system
- Toast via Sonner
- Empty states com componente padrão

### CODE_CONSTITUTION
- Arquivos < 500 linhas
- Type hints completos
- Docstrings em funções públicas

### Zero Mock Policy
- **PROIBIDO**: Dados hardcoded em componentes de página
- **PROIBIDO**: Botões sem handler funcional
- **PROIBIDO**: console.log como "implementação"
- **OBRIGATÓRIO**: Empty state quando não há dados
- **OBRIGATÓRIO**: Loading state durante fetch

---

## Estimativa Total
- **Criar**: 11 arquivos
- **Modificar**: 14 arquivos
- **~1500 linhas de código**
- **5 sprints de trabalho**
