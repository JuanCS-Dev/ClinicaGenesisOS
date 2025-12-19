# Fase 3: MVP com Free Tier - Estratégia de Custos

> **Premissa**: MVP 100% funcional gastando R$ 0-50/mês
> **Reserva**: R$ 1800 em créditos GCloud (usar com inteligência)
> **Modelo futuro**: Cada cliente usa sua própria billing account

---

## Decisões Arquiteturais para Free Tier

### 1. Google AI Studio vs Vertex AI

| Aspecto | Google AI Studio | Vertex AI |
|---------|------------------|-----------|
| **Billing** | Não precisa | Obrigatório |
| **Free tier** | 1000 req/dia, 15 RPM | $300 créditos (90 dias) |
| **Modelos** | Gemini 2.5 Flash/Pro | Mesmo + enterprise features |
| **Para MVP** | ✅ **USAR ESTE** | ❌ Deixar para produção |

**Decisão**: Usar **Google AI Studio** no MVP. Zero custo.

### 2. Speech-to-Text vs Gemini Native Audio

| Aspecto | Cloud Speech-to-Text | Gemini Native Audio |
|---------|---------------------|---------------------|
| **Free tier** | 60 min/mês | Incluso no Gemini free tier |
| **Custo após** | $0.048/min (medical) | $0.15/1M tokens |
| **Qualidade médica** | `medical_conversation` otimizado | Bom, não especializado |
| **Para MVP** | ❌ Muito limitado | ✅ **USAR ESTE** |

**Decisão**: Usar **Gemini 2.5 Flash para transcrição** (upload de áudio → texto + SOAP em uma chamada).

Fonte: [Gemini Audio Understanding](https://ai.google.dev/gemini-api/docs/audio)

### 3. WhatsApp - Maximizar Free Window

```
ESTRATÉGIA: Converter lembretes em conversas

FLUXO OTIMIZADO:
─────────────────
1. Paciente agenda consulta
2. Sistema envia 1 template (PAGO ~$0.02)
   "Olá! Sua consulta foi agendada para [data].
    Responda OK para confirmar."
3. Paciente responde "OK" → ABRE WINDOW 24h GRÁTIS
4. Lembrete 24h antes → GRÁTIS (dentro do window? se não, novo template)
5. Lembrete 2h antes → GRÁTIS (se paciente interagiu nas últimas 24h)

RESULTADO: 1-2 templates pagos por paciente, resto grátis
```

**Custo real estimado (100 pacientes/mês)**:
- Melhor caso: 100 templates = ~R$ 10-15/mês
- Pior caso: 300 templates = ~R$ 30-45/mês

---

## Arquitetura MVP Free Tier

### Stack Decidida

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
│                    Firebase Hosting (FREE)                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND                                   │
│  Cloud Functions (2M invocações FREE)                       │
│  Firestore (1GB FREE)                                       │
│  Cloud Storage (5GB FREE)                                   │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Google AI Studio│ │ WhatsApp Cloud  │ │ Cloud Tasks     │
│ (Gemini FREE)   │ │ API (templates) │ │ (scheduler FREE)│
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

### Configuração de API Keys

```typescript
// src/config/ai.ts
// MVP: Google AI Studio (free tier)
// PRODUÇÃO: Cliente fornece sua própria API key

export const getAIConfig = () => {
  // MVP: usa nossa key de desenvolvimento
  if (import.meta.env.MODE === 'development' || import.meta.env.VITE_MVP_MODE) {
    return {
      provider: 'google-ai-studio',
      apiKey: import.meta.env.VITE_GOOGLE_AI_API_KEY,
    };
  }

  // PRODUÇÃO: usa key do cliente (multi-tenant)
  return {
    provider: 'vertex-ai',
    // Key vem do Firestore: /clinics/{clinicId}/settings/ai
    useClientBilling: true,
  };
};
```

---

## 3.1 WhatsApp Lembretes (MVP Free Tier)

### Arquitetura Simplificada

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Firestore  │────▶│Cloud Function│────▶│ WhatsApp Cloud  │
│ appointment │     │ onWrite      │     │ API (Meta)      │
│ created     │     │ trigger      │     │                 │
└─────────────┘     └──────────────┘     └─────────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Cloud Tasks  │ (scheduler para 24h/2h antes)
                    │ (FREE tier)  │
                    └──────────────┘
```

### Implementação Mínima Viável

**Fase MVP (2 semanas)**:
- [ ] Setup WhatsApp Business API (Meta Developer) - GRÁTIS
- [ ] 1 template aprovado: `appointment_confirmation`
- [ ] Cloud Function: `onAppointmentCreated` → agenda reminder
- [ ] Cloud Function: `sendReminder` → envia WhatsApp
- [ ] Cloud Function: `whatsappWebhook` → processa respostas
- [ ] Atualiza status no Firestore (confirmed/cancelled)

**NÃO FAZER no MVP**:
- ❌ Dashboard elaborado de métricas
- ❌ Múltiplos templates
- ❌ Bot de agendamento
- ❌ Analytics avançado

### Código Mínimo

```typescript
// functions/src/whatsapp/sendReminder.ts
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore } from 'firebase-admin/firestore';

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;

export const sendReminders = onSchedule('every 1 hours', async () => {
  const db = getFirestore();
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // Busca appointments que precisam de lembrete
  const appointments = await db.collectionGroup('appointments')
    .where('dateTime', '>=', now)
    .where('dateTime', '<=', in24h)
    .where('reminderSent', '==', false)
    .get();

  for (const doc of appointments.docs) {
    const apt = doc.data();
    await sendWhatsAppTemplate(apt.patientPhone, 'appointment_reminder', [
      apt.patientName,
      apt.date,
      apt.time,
      apt.professionalName,
      apt.clinicAddress,
    ]);
    await doc.ref.update({ reminderSent: true });
  }
});

async function sendWhatsAppTemplate(to: string, template: string, params: string[]) {
  const response = await fetch(
    `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_ID}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: template,
          language: { code: 'pt_BR' },
          components: [{
            type: 'body',
            parameters: params.map(p => ({ type: 'text', text: p })),
          }],
        },
      }),
    }
  );
  return response.json();
}
```

---

## 3.2 AI Scribe MVP (Free Tier)

### Arquitetura Simplificada (Gemini Native Audio)

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Browser   │────▶│Cloud Storage │────▶│ Cloud Function  │
│ MediaRecorder     │ (audio file) │     │ processAudio()  │
└─────────────┘     └──────────────┘     └─────────────────┘
                                                 │
                                                 ▼
                                         ┌─────────────────┐
                                         │ Google AI Studio│
                                         │ Gemini 2.5 Flash│
                                         │ (FREE tier)     │
                                         └─────────────────┘
                                                 │
                                                 ▼
                                         ┌─────────────────┐
                                         │   SOAP Note     │
                                         │   (JSON)        │
                                         └─────────────────┘
```

### Uma Chamada, Tudo Incluso

**ANTES (caro)**:
1. Áudio → Speech-to-Text ($0.048/min) → Texto
2. Texto → Gemini Extract → JSON
3. JSON → Gemini Generate → SOAP

**AGORA (free tier)**:
1. Áudio → Gemini 2.5 Flash (transcreve + extrai + gera SOAP) → SOAP

```typescript
// functions/src/ai/processConsultation.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export async function processConsultationAudio(
  audioBase64: string,
  mimeType: string,
  specialty: 'medicina' | 'nutricao' | 'psicologia'
): Promise<SOAPNote> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-05-20' });

  const prompt = `Você é um assistente médico. Analise este áudio de consulta e gere uma nota SOAP.

ESPECIALIDADE: ${specialty}

INSTRUÇÕES:
1. Transcreva o diálogo médico-paciente
2. Extraia informações clínicas relevantes
3. Gere uma nota SOAP estruturada

Retorne APENAS JSON válido no formato:
{
  "transcription": "transcrição completa do áudio",
  "soap": {
    "subjective": "queixa principal, história da doença atual, sintomas relatados",
    "objective": "achados do exame físico mencionados, sinais vitais",
    "assessment": "hipóteses diagnósticas discutidas",
    "plan": "conduta proposta, exames, medicações, orientações"
  },
  "extractedData": {
    "chiefComplaint": "queixa principal",
    "symptoms": ["lista", "de", "sintomas"],
    "medications": ["medicações mencionadas"],
    "allergies": ["alergias mencionadas"]
  }
}

Se algum campo não tiver informação, use "Não mencionado".
NÃO invente informações que não estão no áudio.`;

  const result = await model.generateContent([
    { text: prompt },
    {
      inlineData: {
        mimeType,
        data: audioBase64,
      },
    },
  ]);

  const responseText = result.response.text();
  // Limpa markdown se houver
  const jsonStr = responseText.replace(/```json\n?|\n?```/g, '');
  return JSON.parse(jsonStr);
}
```

### Implementação Mínima Viável

**Fase MVP (2 semanas)**:
- [ ] Componente `AudioRecorder.tsx` (browser MediaRecorder)
- [ ] Upload para Cloud Storage (trigger function)
- [ ] Cloud Function `processAudio` (Gemini free tier)
- [ ] Componente `SOAPReview.tsx` (modal simples de revisão)
- [ ] Salvar no prontuário com flag `aiGenerated: true`
- [ ] Indicador visual "🤖 AI" no registro

**NÃO FAZER no MVP**:
- ❌ Real-time streaming transcription
- ❌ Multiple speakers detection elaborado
- ❌ Feedback loop de erros
- ❌ Fine-tuning de prompts por especialidade

### Limites Free Tier (Google AI Studio)

| Limite | Valor | Impacto |
|--------|-------|---------|
| Requests/dia | 1000 | ~33 consultas/dia (ok para MVP) |
| RPM | 15 | Processar 1 áudio por vez |
| Tokens/min | 250K | ~5-10 áudios simultâneos |

**Para MVP com ~50-100 consultas/mês**: ✅ Free tier é suficiente

---

## 3.3 AI Diagnostic Helper MVP (Free Tier)

### Simplificação Máxima

**ANTES (complexo)**:
- OCR de exames
- Extração de biomarcadores
- Triangulação com anamnese
- Interface traffic-light

**MVP (simples)**:
- Upload de exame (imagem/PDF)
- Gemini analisa visualmente
- Sugere pontos de atenção
- Médico decide

### Implementação Mínima

```typescript
// functions/src/ai/analyzeExam.ts
export async function analyzeLabExam(
  imageBase64: string,
  mimeType: string,
  clinicalContext?: string
): Promise<ExamAnalysis> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-05-20' });

  const prompt = `Você é um assistente médico analisando um exame laboratorial.

${clinicalContext ? `CONTEXTO CLÍNICO: ${clinicalContext}` : ''}

ANALISE A IMAGEM DO EXAME E RETORNE JSON:
{
  "examType": "tipo do exame identificado",
  "values": [
    {
      "name": "nome do biomarcador",
      "value": "valor encontrado",
      "unit": "unidade",
      "referenceRange": "faixa de referência do laudo",
      "status": "normal | altered | critical",
      "note": "observação se relevante"
    }
  ],
  "summary": "resumo dos achados principais",
  "attentionPoints": ["pontos que merecem atenção clínica"],
  "suggestedQuestions": ["perguntas investigativas sugeridas"]
}

IMPORTANTE:
- Use APENAS dados visíveis no exame
- NÃO faça diagnósticos, apenas destaque alterações
- Isso é ferramenta de APOIO, não substitui julgamento médico`;

  const result = await model.generateContent([
    { text: prompt },
    { inlineData: { mimeType, data: imageBase64 } },
  ]);

  return JSON.parse(result.response.text().replace(/```json\n?|\n?```/g, ''));
}
```

**Fase MVP (1 semana)**:
- [ ] Componente `ExamUpload.tsx` (upload imagem/PDF)
- [ ] Cloud Function `analyzeExam` (Gemini Vision)
- [ ] Componente `ExamAnalysis.tsx` (exibe resultado)
- [ ] Disclaimer obrigatório na interface

---

## Custos MVP Estimados

### Cenário: 50 pacientes, 30 consultas com AI Scribe

| Item | Uso | Custo |
|------|-----|-------|
| Cloud Functions | ~5K invocações | R$ 0 (free) |
| Firestore | ~100MB | R$ 0 (free) |
| Cloud Storage | ~2GB | R$ 0 (free) |
| Google AI Studio | ~500 requests | R$ 0 (free) |
| WhatsApp Templates | ~100 msgs | R$ 10-20 |
| **TOTAL** | | **R$ 10-20/mês** |

### Quando Escalar (Pós-MVP)

```
MVP (free tier)           →    PRODUÇÃO (billing cliente)
─────────────────────────────────────────────────────────
Google AI Studio          →    Vertex AI (cliente paga)
Nossa WhatsApp account    →    WhatsApp do cliente
Nossa Firebase            →    Firebase do cliente (ou nosso multi-tenant)
```

---

## Arquitetura Multi-Tenant (Preparação)

### Modelo de Dados

```typescript
// /clinics/{clinicId}/settings/integrations
interface ClinicIntegrations {
  whatsapp?: {
    phoneNumberId: string;
    accessToken: string; // encrypted
    businessAccountId: string;
  };
  ai?: {
    provider: 'google-ai-studio' | 'vertex-ai' | 'openai';
    apiKey?: string; // encrypted, se próprio
    useShared: boolean; // usa nossa key compartilhada
  };
  billing?: {
    plan: 'free' | 'starter' | 'pro';
    stripeCustomerId?: string;
  };
}
```

### Código Preparado para Multi-Tenant

```typescript
// functions/src/utils/getClientConfig.ts
export async function getAIClient(clinicId: string) {
  const settings = await getClinicSettings(clinicId);

  if (settings.ai?.useShared || !settings.ai?.apiKey) {
    // MVP: usa nossa key compartilhada
    return new GoogleGenerativeAI(process.env.SHARED_AI_KEY!);
  }

  // PRODUÇÃO: usa key do cliente
  const decryptedKey = await decrypt(settings.ai.apiKey);
  return new GoogleGenerativeAI(decryptedKey);
}
```

---

## Cronograma MVP (4 semanas)

### Semana 1-2: WhatsApp Lembretes
- Setup Meta Business
- Template approval
- Cloud Functions básicas
- Webhook de respostas

### Semana 3-4: AI Scribe + Diagnostic Helper
- AudioRecorder component
- Gemini integration (free tier)
- SOAP Review modal
- Exam upload + analysis

### Entregável
- Sistema funcional
- Custo < R$ 50/mês
- Pronto para escalar com billing por cliente

---

## Próximos Passos Imediatos

1. **Criar conta Meta Business** (WhatsApp API)
2. **Gerar API Key Google AI Studio** (free tier)
3. **Setup `functions/` directory** (Cloud Functions)
4. **Começar com WhatsApp** (ROI mais rápido)

---

**Documento criado**: 2025-12-18
**Estratégia**: MVP Free Tier
**Budget reserva**: R$ 1800 (usar só quando necessário)
