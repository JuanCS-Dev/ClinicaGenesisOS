# 🤖 Patient Health Companion - Plano de Implementação
## Genesis Clinic OS - Moonshot #4

**Data:** 2025-12-24
**Versão:** 1.0
**Status:** Implementado

---

## Sumário Executivo

| Métrica | Valor |
|---------|-------|
| **Objetivo** | Assistente de saúde via WhatsApp com IA contextual |
| **Modelo IA** | Gemini 2.5 Flash (73.8% accuracy em triage) |
| **Integrações** | WhatsApp webhook existente + Vertex AI existente |
| **Arquivos novos** | ~12 arquivos em `functions/src/companion/` |
| **Arquivos modificados** | 2 (webhook.ts, index.ts) |

---

## Pesquisa Base (Dezembro 2025)

### Fontes Consultadas
- [WhatsApp Chatbot Healthcare Best Practices](https://respond.io/blog/whatsapp-chatbot-for-healthcare)
- [Gemini Triage Performance Study (BMC 2025)](https://bmcemergmed.biomedcentral.com/articles/10.1186/s12873-025-01337-2)
- [FDA AI Medical Devices Guidance 2025](https://bipartisanpolicy.org/issue-brief/fda-oversight-understanding-the-regulation-of-health-ai-tools/)
- [LangChain Firestore Chat Memory](https://js.langchain.com/docs/integrations/memory/firestore/)
- [Symptom Triage Algorithms (Mayo Clinic)](https://gbs.mayoclinic.org/licensable-content/symptom-triage.php)

### Insights Chave
1. **Gemini 2.5 Flash**: Melhor accuracy (73.8%) e especificidade (88.9%) para triage
2. **Hybrid Approach**: AI para rotina + handoff humano para complexo
3. **FDA Guidance**: Disclosure obrigatório, nunca diagnosticar, plano de escalação
4. **Chat History**: Sessões por paciente, trim de contexto para window

---

## Arquitetura

### Fluxo de Mensagem

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUXO DO COMPANION                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [WhatsApp] ──► [Webhook] ──► [É confirmação?]                   │
│                                   │                              │
│                         Não ◄────┴────► Sim                      │
│                          │              │                        │
│                          ▼              ▼                        │
│                   [Companion]    [Lógica existente]              │
│                          │                                       │
│                          ▼                                       │
│              ┌─────────────────────┐                             │
│              │  Guardrails Check   │                             │
│              │  (emergência?)      │                             │
│              └──────────┬──────────┘                             │
│                         │                                        │
│            Sim ◄────────┴────────► Não                           │
│             │                       │                            │
│             ▼                       ▼                            │
│        [HANDOFF]          [Build Context]                        │
│        + SAMU 192              │                                 │
│                                ▼                                 │
│                    ┌─────────────────────┐                       │
│                    │    Gemini 2.5       │                       │
│                    │  + Patient Context  │                       │
│                    │  + Chat History     │                       │
│                    └──────────┬──────────┘                       │
│                               │                                  │
│                               ▼                                  │
│                    ┌─────────────────────┐                       │
│                    │  Sanitize Response  │                       │
│                    │  + AI Disclaimer    │                       │
│                    └──────────┬──────────┘                       │
│                               │                                  │
│                               ▼                                  │
│                    [Send WhatsApp Message]                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### State Machine

| Estado | Descrição | Transições |
|--------|-----------|------------|
| `idle` | Sem conversa ativa | → greeting |
| `greeting` | Boas-vindas | → symptom_intake, guidance |
| `symptom_intake` | Coletando sintomas | → triage |
| `triage` | Avaliando urgência | → guidance, scheduling, handoff |
| `guidance` | Orientações | → closed |
| `scheduling` | Agendando consulta | → closed |
| `handoff` | Escalado para humano | → closed |
| `closed` | Conversa encerrada | - |

---

## Estrutura de Arquivos

```
functions/src/
├── companion/                        # NOVO MÓDULO
│   ├── index.ts                      # Exports
│   ├── types.ts                      # TypeScript interfaces
│   ├── message-handler.ts            # Processa mensagens
│   ├── ai-service.ts                 # Chamadas Gemini
│   ├── session-manager.ts            # CRUD de sessões
│   ├── context-builder.ts            # Contexto do paciente
│   ├── guardrails.ts                 # Validações de segurança
│   ├── handoff.ts                    # Escalação humana
│   ├── cleanup.ts                    # Limpeza TTL
│   └── prompts/
│       ├── index.ts                  # Versionamento
│       ├── companion-system.ts       # System prompt
│       └── triage.ts                 # Prompt de triage
│
├── whatsapp/
│   └── webhook.ts                    # MODIFICAR: routing
│
└── index.ts                          # MODIFICAR: exports
```

---

## Coleções Firestore

```
/clinics/{clinicId}/
  conversations/{sessionId}/          # Sessão de conversa
    ├── clinicId: string
    ├── patientId: string
    ├── patientPhone: string
    ├── state: ConversationState
    ├── context: PatientCompanionContext
    ├── createdAt: Timestamp
    ├── expiresAt: Timestamp          # 24h TTL
    └── messages/{messageId}/         # Subcollection
        ├── role: 'patient' | 'assistant'
        ├── content: string
        └── timestamp: Timestamp

  handoffs/{handoffId}/               # Escalações
    ├── patientId: string
    ├── sessionId: string
    ├── reason: string
    ├── priority: 'high' | 'medium' | 'low'
    ├── status: 'pending' | 'assigned' | 'resolved'
    └── createdAt: Timestamp

/phoneIndex/{normalizedPhone}/        # Lookup O(1)
  ├── clinicId: string
  └── patientId: string
```

---

## Safety Guardrails

### 1. Keywords de Emergência (Pre-AI)
```typescript
const EMERGENCY_KEYWORDS = [
  'dor no peito', 'infarto', 'avc', 'derrame',
  'não consigo respirar', 'sufocando', 'convulsão',
  'quero morrer', 'suicídio', 'hemorragia'
];
```

### 2. System Prompt (Durante AI)
```
REGRAS ABSOLUTAS:
1. NUNCA diagnosticar
2. NUNCA recomendar medicamentos
3. SEMPRE referir emergências ao SAMU (192)
4. SEMPRE lembrar que é IA
```

### 3. Sanitização (Pós-AI)
```typescript
// Remove linguagem diagnóstica
response.replace(/você tem (\w+)/gi, 'pode haver indicação de');

// Adiciona disclaimer obrigatório
response += '\n\n_Assistente de IA. Não substitui consulta. Emergências: 192_';
```

### 4. Handoff Triggers
| Trigger | Prioridade | Ação |
|---------|------------|------|
| Emergência detectada | Alta | SAMU + staff |
| "falar com humano" | Média | Staff |
| Frustração detectada | Média | Staff |
| Confiança < 40% | Baixa | Staff |

---

## Tipos TypeScript

```typescript
// types.ts
export interface ConversationSession {
  id: string;
  clinicId: string;
  patientId: string;
  patientPhone: string;
  state: ConversationState;
  messages: ConversationMessage[];
  context: PatientCompanionContext;
  triageResult?: SymptomTriageResult;
  createdAt: string;
  expiresAt: string;
}

export interface PatientCompanionContext {
  name: string;
  age: number;
  sex: 'male' | 'female';
  allergies: string[];
  currentMedications: string[];
  chronicConditions: string[];
  lastAppointment?: { date: string; specialty: string };
  recentSOAPNotes?: string;
}

export interface SymptomTriageResult {
  urgency: 'emergency' | 'urgent' | 'routine' | 'self_care';
  symptoms: string[];
  redFlags: string[];
  recommendations: string[];
  shouldSchedule: boolean;
  confidence: number;
}
```

---

## Integração com Código Existente

### 1. Webhook (webhook.ts:166)
```typescript
// Após verificar que não é confirmação de agendamento:
if (appointmentsSnapshot.empty) {
  const patient = await findPatientByPhone(patientPhone);
  if (patient) {
    await handleCompanionMessage(
      patient.clinicId,
      patient.patientId,
      patientPhone,
      messageText,
      messageId
    );
  }
  return;
}
```

### 2. Vertex AI (reutiliza config.ts)
```typescript
// Usa mesmo padrão de getVertexAIClient()
const genAI = await getVertexAIClient();
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash-preview-05-20',
});
```

### 3. Context Builder (reutiliza patient.service.ts)
```typescript
// Busca dados do paciente igual aos outros módulos
const patient = await patientService.getById(clinicId, patientId);
const records = await recordService.getByPatient(clinicId, patientId);
```

---

## Fases de Implementação

### FASE 1: Infraestrutura
- [x] Criar estrutura `functions/src/companion/`
- [x] Definir tipos em `types.ts`
- [x] Implementar `session-manager.ts` (CRUD Firestore)
- [ ] Criar índices Firestore necessários

### FASE 2: Core AI
- [x] Implementar prompts versionados
- [x] Criar `ai-service.ts` com Gemini
- [x] Implementar `context-builder.ts`
- [ ] Testes unitários de prompts

### FASE 3: Guardrails
- [x] Implementar `guardrails.ts`
- [x] Keywords de emergência
- [x] Sanitização de respostas
- [ ] Testes de segurança

### FASE 4: Integração WhatsApp
- [x] Modificar `webhook.ts` com routing
- [x] Implementar `message-handler.ts`
- [x] Criar phone index
- [ ] Testes de integração

### FASE 5: Handoff & Cleanup
- [x] Implementar `handoff.ts`
- [x] Criar função scheduled de cleanup
- [x] Notificações para staff
- [ ] Deploy e testes E2E

---

## Testes Obrigatórios

### Cenários Críticos
| Cenário | Input | Expected |
|---------|-------|----------|
| Emergência | "dor no peito forte" | Handoff + SAMU |
| Sintoma leve | "dor de cabeça leve" | Orientações |
| Solicita humano | "quero falar com atendente" | Handoff |
| Fora do escopo | "quanto custa consulta" | Redireciona |
| Loop detectado | 3x mesma pergunta | Handoff |

### Coverage
- [ ] Unit tests: guardrails.ts, sanitize, emergency keywords
- [ ] Integration tests: session lifecycle, Gemini calls
- [ ] E2E tests: WhatsApp webhook → response

---

## Arquivos Críticos para Modificar

| Arquivo | Modificação |
|---------|-------------|
| `functions/src/whatsapp/webhook.ts` | Adicionar routing para companion |
| `functions/src/index.ts` | Exportar novas functions |
| `firestore.indexes.json` | Índices para conversations |

---

## Verificação de Conclusão

### Critérios de Aceite
- [ ] Paciente envia mensagem → recebe resposta contextual
- [ ] Emergências detectadas → handoff automático + SAMU
- [ ] "Falar com humano" → escalação imediata
- [ ] Todas respostas têm disclaimer de IA
- [ ] Nenhuma resposta contém diagnóstico
- [ ] Sessões expiram após 24h
- [ ] Staff recebe notificação de handoffs
- [ ] 100% dos testes passando
