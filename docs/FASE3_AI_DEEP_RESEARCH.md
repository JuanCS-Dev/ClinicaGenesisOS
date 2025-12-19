# Fase 3: AI Integration - Deep Research

> **Data**: 2025-12-18
> **Status**: Pesquisa Completa
> **Stack**: Firebase + Vertex AI (Gemini) + Cloud Functions

---

## Executive Summary

A Fase 3 foca em 3 features de AI que resolvem dores reais e mensuráveis:

| Feature | ROI Esperado | Complexidade | Prioridade |
|---------|-------------|--------------|------------|
| **WhatsApp Lembretes** | -30% no-shows | Média | 1 (Crítica) |
| **AI Scribe MVP** | -14 min/dia/médico | Alta | 2 (Crítica) |
| **AI Diagnostic Helper** | Diferencial competitivo | Alta | 3 (Alta) |

**Decisão Chave**: Começar com WhatsApp Lembretes por ter ROI imediato e menor complexidade técnica.

---

## 1. WhatsApp Lembretes (3.1)

### 1.1 A Dor

| Métrica | Valor | Fonte |
|---------|-------|-------|
| Custo global de no-shows | NHS UK perde £216M/ano | [Gallabox](https://gallabox.com/blog/whatsapp-for-healthcare) |
| Pacientes que trocariam de clínica | 55% por melhor comunicação | [Respond.io](https://respond.io/blog/whatsapp-for-healthcare) |
| Redução com lembretes WhatsApp | 20-30% de no-shows | [DocHours](https://dochours.com/whatsapp-for-healthcare-improve-patient-communication/) |
| Hospital na Índia | -30% no-shows com WhatsApp | [ChatArchitect](https://www.chatarchitect.com/news/implementing-whatsapp-business-api-in-healthcare-enhancing-patient-engagement) |

### 1.2 Mudança de Pricing (Julho 2025)

**IMPORTANTE**: WhatsApp mudou o modelo de pricing em 01/07/2025:
- **Antes**: Cobrança por conversa (24h window)
- **Agora**: Cobrança por template message entregue

| Categoria | Uso no Genesis | Desconto Volume |
|-----------|----------------|-----------------|
| **Utility** | Lembretes de consulta | Até 20% off |
| **Authentication** | Confirmação de cadastro | Até 78% off |

**Oportunidade**: Templates Utility enviados dentro do Customer Service Window (24h após última mensagem do paciente) são **GRÁTIS**.

Fonte: [Respond.io Pricing Update](https://respond.io/blog/whatsapp-business-api-pricing)

### 1.3 Arquitetura Proposta

```
┌─────────────────────────────────────────────────────────────┐
│                      FLUXO DE LEMBRETES                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────┐    ┌──────────────┐    ┌─────────────────────┐
│  Firestore  │───▶│ Cloud Tasks  │───▶│  Cloud Function     │
│ appointments│    │  (scheduler) │    │  sendReminder()     │
└─────────────┘    └──────────────┘    └─────────────────────┘
                                                │
                                                ▼
                                       ┌─────────────────────┐
                                       │  WhatsApp Cloud API │
                                       │   (Meta Business)   │
                                       └─────────────────────┘
                                                │
                                                ▼
                                       ┌─────────────────────┐
                                       │     PACIENTE        │
                                       │   (recebe msg)      │
                                       └─────────────────────┘
                                                │
                    ┌───────────────────────────┼───────────────────────────┐
                    │                           │                           │
                    ▼                           ▼                           ▼
            ┌───────────┐               ┌───────────┐               ┌───────────┐
            │ "SIM" ✅  │               │ "NÃO" ❌  │               │ Remarcar  │
            └───────────┘               └───────────┘               └───────────┘
                    │                           │                           │
                    ▼                           ▼                           ▼
            ┌─────────────────────────────────────────────────────────────────┐
            │                    WEBHOOK (Cloud Function)                      │
            │                    handleWhatsAppReply()                         │
            └─────────────────────────────────────────────────────────────────┘
                                                │
                                                ▼
                                       ┌─────────────────────┐
                                       │  Firestore Update   │
                                       │ appointment.status  │
                                       └─────────────────────┘
```

### 1.4 Template Messages (Meta-Approved)

```
TEMPLATE: appointment_reminder_24h
-----------------------------------
Olá {{1}}! 👋

Lembrete: Sua consulta está agendada para *amanhã*.

📅 *Data*: {{2}}
⏰ *Horário*: {{3}}
👨‍⚕️ *Profissional*: {{4}}
📍 *Local*: {{5}}

Você confirma sua presença?

[Sim, estarei lá] [Preciso remarcar]
```

```
TEMPLATE: appointment_reminder_2h
-----------------------------------
{{1}}, sua consulta é em *2 horas*! ⏰

📍 {{2}}
⏰ {{3}}

Estamos te esperando! 😊
```

### 1.5 Implementação Técnica

**Dependências necessárias:**
```bash
# Cloud Functions (functions/package.json)
npm install @google-cloud/tasks axios
```

**Arquivos a criar:**
```
functions/
├── src/
│   ├── whatsapp/
│   │   ├── client.ts        # WhatsApp Cloud API client
│   │   ├── templates.ts     # Template message builders
│   │   └── webhook.ts       # Incoming message handler
│   ├── scheduler/
│   │   ├── reminders.ts     # Cloud Tasks scheduler
│   │   └── triggers.ts      # Firestore triggers
│   └── index.ts             # Exports
├── package.json
└── tsconfig.json
```

### 1.6 Setup WhatsApp Business API

1. **Meta Business Account** → business.facebook.com
2. **WhatsApp Business App** → developers.facebook.com
3. **Verificar número de telefone** (pode usar número virtual)
4. **Aprovar templates** (demora 24-48h)
5. **Configurar webhook** → Cloud Function URL

### 1.7 Custos Estimados

| Item | Custo | Volume |
|------|-------|--------|
| WhatsApp Utility (Brasil) | ~$0.02/msg | Tier 1 |
| Cloud Functions | $0.40/milhão invocações | |
| Cloud Tasks | Free tier generoso | |
| **Total mensal (500 pacientes)** | **~R$ 150-200** | |

---

## 2. AI Scribe MVP (3.2)

### 2.1 A Dor

| Métrica | Valor | Fonte |
|---------|-------|-------|
| Tempo em EHR por dia | 5.8 horas | [Stanford EHR Poll](https://med.stanford.edu/content/dam/sm/ehr/documents/EHR-Poll-Presentation.pdf) |
| Economia com AI Scribe | 15.700 horas/ano (Permanente Medical) | [NEJM Catalyst](https://catalyst.nejm.org/doi/full/10.1056/CAT.25.0040) |
| Redução tempo por nota | 2 min/consulta, 14 min/dia | [Cleveland Clinic](https://consultqd.clevelandclinic.org/less-typing-more-talking-how-ambient-ai-is-reshaping-clinical-workflow-at-cleveland-clinic) |
| Precisão AI Scribe | 95-98% (vs 96% humano) | [Healos](https://www.healos.ai/blog/the-future-of-healthcare-documentation-why-ambient-clinical-intelligence-is-transforming-patient-care-in-2025) |
| Adoção projetada 2025 | 60% dos providers | [Healos](https://www.healos.ai/blog/what-is-ambient-voice-technology-a-complete-guide-for-ai-medical-scribes-in-2025) |

### 2.2 Modelos de Speech-to-Text

**Google Cloud Speech-to-Text V2** oferece 2 modelos médicos:

| Modelo | Uso | Features |
|--------|-----|----------|
| `medical_conversation` | Diálogo médico-paciente | Auto-detect speakers, labels |
| `medical_dictation` | Médico ditando notas | Spoken commands, headings |

**Pricing Speech-to-Text:**
- $0.024/min (standard)
- $0.048/min (medical models)
- Free tier: 60 min/mês

Fonte: [Google Cloud Docs](https://cloud.google.com/speech-to-text/docs/medical-models)

### 2.3 Abordagem de Prompt Engineering

**Insight da pesquisa**: Modular Pipeline supera naive prompting em **32%**.

Fonte: [SpecialtyScribe - ACM](https://dl.acm.org/doi/10.1145/3701551.3706131)

**Pipeline Recomendado (3 estágios):**

```
┌─────────────────────────────────────────────────────────────┐
│                    AI SCRIBE PIPELINE                        │
└─────────────────────────────────────────────────────────────┘

   ÁUDIO          STAGE 1              STAGE 2              STAGE 3
┌─────────┐    ┌───────────┐       ┌───────────┐       ┌───────────┐
│ Browser │───▶│ Speech-   │──────▶│ Information│──────▶│  SOAP     │
│MediaRec │    │ to-Text   │       │ Extractor  │       │ Generator │
│ ording  │    │ (medical) │       │ (Gemini)   │       │ (Gemini)  │
└─────────┘    └───────────┘       └───────────┘       └───────────┘
                    │                    │                    │
                    ▼                    ▼                    ▼
               Transcrição          Dados Estruturados    SOAP Note
               Raw Text             - Queixa principal    - Subjective
                                    - Sintomas            - Objective
                                    - Medicações          - Assessment
                                    - Exames              - Plan
```

### 2.4 Prompts Otimizados

**Stage 2: Information Extractor**
```
Você é um assistente médico especializado em extrair informações clínicas.

TRANSCRIÇÃO DA CONSULTA:
"""
{transcript}
"""

Extraia as seguintes informações em JSON:
{
  "queixa_principal": "string - motivo da consulta",
  "historia_doenca_atual": "string - evolução dos sintomas",
  "sintomas": ["lista de sintomas mencionados"],
  "medicacoes_em_uso": ["lista de medicações"],
  "alergias": ["lista de alergias mencionadas"],
  "antecedentes": "string - histórico relevante",
  "exame_fisico_relatado": "string - achados mencionados",
  "hipoteses_diagnosticas": ["possíveis diagnósticos discutidos"],
  "conduta_proposta": ["exames solicitados", "medicações prescritas", "orientações"]
}

REGRAS:
- Extraia APENAS informações explicitamente mencionadas
- Use "não mencionado" para campos sem informação
- Mantenha terminologia médica original
- NÃO invente informações
```

**Stage 3: SOAP Generator**
```
Você é um documentador médico profissional.

DADOS EXTRAÍDOS:
{extracted_data}

ESPECIALIDADE: {specialty} (Medicina Geral | Nutrição | Psicologia)

Gere uma nota SOAP profissional seguindo este formato:

## SUBJETIVO (S)
- Queixa principal e história da doença atual
- Use as palavras do paciente quando relevante

## OBJETIVO (O)
- Achados do exame físico
- Resultados de exames mencionados

## AVALIAÇÃO (A)
- Hipóteses diagnósticas
- Diagnóstico diferencial se aplicável

## PLANO (P)
- Exames solicitados
- Prescrições
- Orientações
- Retorno

REGRAS:
- Seja conciso mas completo
- Use terminologia médica apropriada
- NÃO adicione informações não extraídas
- Marque claramente campos sem informação
```

### 2.5 Arquitetura Proposta

```
┌─────────────────────────────────────────────────────────────┐
│                      FLUXO AI SCRIBE                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────┐    ┌──────────────┐    ┌─────────────────────┐
│   Browser   │───▶│  Frontend    │───▶│  Cloud Storage      │
│ MediaRecorder    │ AudioRecorder│    │  (audio upload)     │
└─────────────┘    └──────────────┘    └─────────────────────┘
                                                │
                                                ▼
                                       ┌─────────────────────┐
                                       │  Cloud Function     │
                                       │  processAudio()     │
                                       └─────────────────────┘
                                                │
                        ┌───────────────────────┼───────────────────────┐
                        │                       │                       │
                        ▼                       ▼                       ▼
               ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
               │ Speech-to-Text  │───▶│ Gemini 2.5 Flash│───▶│ Gemini 2.5 Flash│
               │ (medical_conv)  │    │ (Info Extract)  │    │ (SOAP Generate) │
               └─────────────────┘    └─────────────────┘    └─────────────────┘
                                                                      │
                                                                      ▼
                                                             ┌─────────────────┐
                                                             │   Frontend      │
                                                             │ SOAPReviewModal │
                                                             └─────────────────┘
                                                                      │
                                                        ┌─────────────┴─────────────┐
                                                        │                           │
                                                        ▼                           ▼
                                               ┌─────────────────┐         ┌─────────────────┐
                                               │   APROVAR ✅    │         │   EDITAR ✏️    │
                                               └─────────────────┘         └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │   Firestore     │
                                               │ records/{id}    │
                                               │ aiGenerated:true│
                                               └─────────────────┘
```

### 2.6 Componentes Frontend

```typescript
// src/components/ai/AudioRecorder.tsx
interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  maxDuration?: number; // default 30 min
}

// src/components/ai/SOAPReview.tsx
interface SOAPReviewProps {
  generatedSOAP: SOAPNote;
  transcript: string;
  onApprove: (editedSOAP: SOAPNote) => void;
  onReject: () => void;
}
```

### 2.7 Cuidados Críticos (Pesquisa)

**Obrigatório para compliance e ética:**

1. **Revisão médica OBRIGATÓRIA** antes de salvar
2. **Indicador visual** "🤖 AI Generated" no prontuário
3. **Treinamento do usuário** - onboarding específico
4. **Feedback loop** - médico pode marcar erros
5. **Audit trail** - log de todas gerações AI

Fonte: [JMIR - Responsible AI Scribes](https://medinform.jmir.org/2025/1/e80898)

### 2.8 Custos Estimados

| Item | Custo | Volume Esperado |
|------|-------|-----------------|
| Speech-to-Text (medical) | $0.048/min | ~600 min/mês |
| Gemini 2.5 Flash (input) | $0.15/1M tokens | ~500K tokens |
| Gemini 2.5 Flash (output) | $0.60/1M tokens | ~200K tokens |
| Cloud Storage | $0.02/GB | ~5 GB áudio |
| **Total mensal (100 consultas)** | **~R$ 50-80** | |

Fonte: [Vertex AI Pricing](https://cloud.google.com/vertex-ai/generative-ai/pricing)

---

## 3. AI Diagnostic Helper (3.3)

### 3.1 A Dor

| Métrica | Valor | Fonte |
|---------|-------|-------|
| LLM vs Conventional Resources | +27.5 pontos percentuais | [MedRxiv Study](https://www.medrxiv.org/content/10.1101/2025.06.06.25329104v1.full.pdf) |
| Accuracy LLMs em casos comuns | >90% | [PMC Comparative Analysis](https://pmc.ncbi.nlm.nih.gov/articles/PMC12161448/) |
| Claude 3.7 em casos complexos | 83.3% accuracy | [PMC Comparative Analysis](https://pmc.ncbi.nlm.nih.gov/articles/PMC12161448/) |
| FDA AI/ML devices aprovados | ~950 (mid-2024) | [IntuitionLabs](https://intuitionlabs.ai/articles/ai-medical-devices-regulation-2025) |

### 3.2 O Que Funciona (Pesquisa Real)

**Penda Health (Kenya) - AI Consult v2:**
- Roda silenciosamente em background
- Interface "traffic-light": 🟢 verde (ok), 🟡 amarelo (advisory), 🔴 vermelho (mandatory review)
- Médico mantém controle total

Fonte: [OpenAI/Penda Paper](https://cdn.openai.com/pdf/a794887b-5a77-4207-bb62-e52c900463f1/penda_paper.pdf)

**Glass Health:**
- AI co-pilot para diagnóstico diferencial
- Input: descrição do caso
- Output: DDx + rationale

### 3.3 Limitações Críticas

**LLMs NÃO são adequados para decisões autônomas:**
- Propensão a "confabulation" (alucinações)
- Comportamento inconsistente
- Viés contra minorias
- Falta de supervisão regulatória

Fonte: [ScienceDirect - LLM CDS](https://www.sciencedirect.com/science/article/pii/S2667102625000014)

### 3.4 Nossa Abordagem: Integração Lablens

**Conceito**: Ferramenta de APOIO ao médico, não substituição.

```
┌─────────────────────────────────────────────────────────────┐
│              AI DIAGNOSTIC HELPER (Lablens)                  │
└─────────────────────────────────────────────────────────────┘

     ┌─────────────┐         ┌─────────────┐
     │  ANAMNESE   │         │   EXAMES    │
     │ (SOAP.S)    │         │ (Upload/OCR)│
     └──────┬──────┘         └──────┬──────┘
            │                       │
            └───────────┬───────────┘
                        │
                        ▼
              ┌─────────────────────┐
              │   Gemini 2.5 Flash  │
              │   + Functional      │
              │   Optimal Ranges    │
              └─────────────────────┘
                        │
                        ▼
              ┌─────────────────────┐
              │   ANÁLISE OUTPUT    │
              │ ─────────────────── │
              │ 🔴 Valores críticos │
              │ 🟡 Fora do optimal  │
              │ 🟢 Dentro do range  │
              │                     │
              │ Correlações:        │
              │ - Sintoma X + Lab Y │
              │ - Padrão sugestivo  │
              │                     │
              │ Perguntas invest.:  │
              │ - Histórico família?│
              │ - Uso de medicação? │
              └─────────────────────┘
                        │
                        ▼
              ┌─────────────────────┐
              │   MÉDICO DECIDE     │
              │   (sempre humano)   │
              └─────────────────────┘
```

### 3.5 Funcionalidades Planejadas

| Feature | Descrição | Complexidade |
|---------|-----------|--------------|
| Upload de exames | PDF/imagem → OCR → extração | Média |
| Functional Optimal Ranges | Não só lab ranges, mas optimal | Baixa (dados existem no Lablens) |
| Triangulação sintomas-labs | Correlacionar anamnese com resultados | Alta |
| Sugestões investigativas | Perguntas que o médico deve fazer | Média |

### 3.6 Cuidados Éticos/Legais

**OBRIGATÓRIO:**
1. Disclaimer em TODA interface: "Ferramenta de apoio. Não substitui julgamento clínico."
2. Log de auditoria para cada sugestão
3. Médico DEVE confirmar antes de qualquer registro
4. Pesquisar regulamentação CFM sobre AI diagnóstica
5. Indicador "🤖 AI Assisted" em qualquer nota que use sugestões

### 3.7 Código Base Existente

Existe código no Lablens em `/media/juan/DATA/42em7/Day02/Lablens` que pode ser adaptado:
- Protocolo de Deep Phenotyping
- Functional Optimal Ranges database
- Prompts para análise de biomarcadores

---

## 4. Stack Técnica Consolidada

### 4.1 Dependências a Adicionar

```json
// package.json (frontend)
{
  "dependencies": {
    "firebase": "^12.7.0",
    "@google/generative-ai": "^0.21.0"  // Firebase AI Logic
  }
}
```

```json
// functions/package.json (backend)
{
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "firebase-functions": "^5.0.0",
    "@google-cloud/speech": "^6.0.0",
    "@google-cloud/vertexai": "^1.0.0",
    "@google-cloud/tasks": "^4.0.0",
    "axios": "^1.6.0"
  }
}
```

### 4.2 Configuração Firebase AI Logic

```typescript
// src/services/ai.ts
import { getVertexAI, getGenerativeModel } from 'firebase/vertexai';
import { app } from './firebase';

const vertexAI = getVertexAI(app);

export const geminiFlash = getGenerativeModel(vertexAI, {
  model: 'gemini-2.5-flash-preview-05-20',
});

export const geminiPro = getGenerativeModel(vertexAI, {
  model: 'gemini-2.5-pro-preview-05-06',
});
```

Fonte: [Firebase AI Logic Docs](https://firebase.google.com/docs/vertex-ai)

### 4.3 Estrutura de Arquivos Final

```
functions/
├── src/
│   ├── whatsapp/
│   │   ├── client.ts
│   │   ├── templates.ts
│   │   └── webhook.ts
│   ├── scheduler/
│   │   ├── reminders.ts
│   │   └── triggers.ts
│   ├── ai/
│   │   ├── transcribe.ts
│   │   ├── soap-generator.ts
│   │   └── diagnostic-helper.ts
│   └── index.ts
├── package.json
└── tsconfig.json

src/
├── components/
│   └── ai/
│       ├── AudioRecorder.tsx
│       ├── SOAPReview.tsx
│       ├── DiagnosticHelper.tsx
│       └── BiomarkerAnalysis.tsx
├── services/
│   ├── ai.service.ts
│   ├── whatsapp.service.ts
│   └── lablens.service.ts
└── hooks/
    └── useAI.ts
```

---

## 5. Plano de Implementação

### Fase 3.1: WhatsApp Lembretes (1-2 sprints)

**Sprint 1:**
- [ ] Setup WhatsApp Business API (Meta Developer)
- [ ] Criar Cloud Functions project
- [ ] Implementar `sendReminder()` function
- [ ] Configurar Cloud Tasks scheduler
- [ ] Deploy webhook handler

**Sprint 2:**
- [ ] Submeter templates para aprovação Meta
- [ ] Implementar lógica de resposta (Sim/Não)
- [ ] Dashboard de métricas (enviados, confirmados)
- [ ] Testes E2E

### Fase 3.2: AI Scribe MVP (2-3 sprints)

**Sprint 3:**
- [ ] Componente AudioRecorder (browser)
- [ ] Upload para Cloud Storage
- [ ] Cloud Function Speech-to-Text

**Sprint 4:**
- [ ] Prompts Information Extractor
- [ ] Prompts SOAP Generator
- [ ] Componente SOAPReview

**Sprint 5:**
- [ ] Integração com prontuário existente
- [ ] Indicador "AI Generated"
- [ ] Audit trail
- [ ] Testes com médicos reais

### Fase 3.3: AI Diagnostic Helper (2 sprints)

**Sprint 6:**
- [ ] Adaptar código Lablens
- [ ] Upload/OCR de exames
- [ ] Interface BiomarkerAnalysis

**Sprint 7:**
- [ ] Triangulação sintomas-labs
- [ ] Interface DiagnosticHelper
- [ ] Integração com SOAP editor
- [ ] Disclaimers e compliance

---

## 6. Custos Totais Estimados (Mensal)

| Item | Custo Estimado |
|------|----------------|
| WhatsApp API (500 pacientes) | R$ 150-200 |
| Speech-to-Text (100 consultas) | R$ 30-50 |
| Gemini API (AI Scribe + Helper) | R$ 50-100 |
| Cloud Functions | R$ 20-50 |
| Cloud Storage | R$ 10-20 |
| **TOTAL** | **R$ 260-420/mês** |

**ROI**: Se reduzir 30% no-shows + 14min/dia/médico, o ROI é positivo no primeiro mês.

---

## 7. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Templates WhatsApp rejeitados | Média | Alto | Seguir guidelines Meta rigorosamente |
| Baixa precisão Speech-to-Text | Baixa | Médio | Usar modelo `medical_conversation` |
| Alucinações AI Scribe | Média | Alto | Revisão médica obrigatória |
| Compliance CFM | Média | Alto | Pesquisar regulamentação, disclaimers |
| Custo excede budget | Baixa | Médio | Monitoramento, quotas |

---

## 8. Fontes da Pesquisa

### WhatsApp Business API
- [DocHours - WhatsApp Healthcare](https://dochours.com/whatsapp-for-healthcare-improve-patient-communication/)
- [ChatArchitect - Implementing WhatsApp](https://www.chatarchitect.com/news/implementing-whatsapp-business-api-in-healthcare-enhancing-patient-engagement)
- [Respond.io - API Pricing 2025](https://respond.io/blog/whatsapp-business-api-pricing)
- [Gallabox - WhatsApp Healthcare Guide](https://gallabox.com/blog/whatsapp-for-healthcare)

### AI Scribe
- [NEJM Catalyst - 2.5M Uses](https://catalyst.nejm.org/doi/full/10.1056/CAT.25.0040)
- [Cleveland Clinic - Ambient AI](https://consultqd.clevelandclinic.org/less-typing-more-talking-how-ambient-ai-is-reshaping-clinical-workflow-at-cleveland-clinic)
- [ScribeHealth - Ambient Guide 2025](https://www.scribehealth.ai/blog/what-is-ambient-voice-technology-a-complete-guide-for-ai-medical-scribes-in-2025)
- [SpecialtyScribe - ACM](https://dl.acm.org/doi/10.1145/3701551.3706131)
- [JMIR - Responsible Integration](https://medinform.jmir.org/2025/1/e80898)

### AI Diagnostic Support
- [OpenAI/Penda Paper](https://cdn.openai.com/pdf/a794887b-5a77-4207-bb62-e52c900463f1/penda_paper.pdf)
- [MedRxiv - LLM Diagnostic Reasoning](https://www.medrxiv.org/content/10.1101/2025.06.06.25329104v1.full.pdf)
- [PMC - LLM Clinical Diagnosis](https://pmc.ncbi.nlm.nih.gov/articles/PMC12161448/)

### Google Cloud/Vertex AI
- [Vertex AI Pricing](https://cloud.google.com/vertex-ai/generative-ai/pricing)
- [Speech-to-Text Medical Models](https://cloud.google.com/speech-to-text/docs/medical-models)
- [Firebase AI Logic](https://firebase.google.com/docs/vertex-ai)
- [Genkit Framework](https://github.com/firebase/genkit)

---

**Documento criado**: 2025-12-18
**Autor**: Claude Code + Deep Research
**Próximo passo**: Validação com stakeholder e início da implementação
