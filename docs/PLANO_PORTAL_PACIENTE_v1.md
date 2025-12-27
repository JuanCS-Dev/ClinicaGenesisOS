# Plano de Implementacao: Portal do Paciente Genesis

> **Filosofia**: Quality First, Fases Coesas, Zero Placeholders (CODE_CONSTITUTION)
>
> **Versao**: 1.0.0 | **Data**: 2025-12-26
>
> **Localizacao Final**: `docs/PLANO_PORTAL_PACIENTE_v1.md`

## Contexto & Pesquisa

### Principais Dores dos Pacientes (2025)
1. Autenticacao frustrante (multiplos passos)
2. Sistemas fragmentados (agendar num app, resultados em outro)
3. Terminologia medica confusa (resultados sem contexto)
4. Botoes que nao funcionam (expectativa quebrada)
5. Agendamento complicado

### Principais Dores dos Operadores (Brasil 2025)
1. Dificuldade de agendamento
2. Cancelamentos sem aviso
3. Interoperabilidade limitada
4. Curva de aprendizado alta

### Estado Atual do Portal Genesis
- **FUNCIONAL**: Auth magic-link, visualizacao (consultas, receitas, exames, mensagens, billing)
- **GHOST BUTTONS (8)**: Pagar, Remarcar, Cancelar, Nova Consulta, Download PDF, Nova Mensagem, Anexo, Refill
- **INEXISTENTE**: Pagamento PIX, sala de video no portal, agendamento online, geracao PDF

---

## Decisoes Tecnicas

| Feature | Tecnologia | Justificativa |
|---------|------------|---------------|
| **Pagamento** | PIX (API do Banco/Gerencianet) | 70%+ transacoes no Brasil, menor friccao |
| **Teleconsulta** | Google Calendar API + Meet | GRATIS, app nativo Android, idosos ja conhecem |
| **PDF** | jsPDF (ja no bundle) | Lazy-loaded, sem servidor |
| **Notificacoes** | Firebase Cloud Messaging | Ja integrado |
| **Autenticacao** | Firebase Auth (Google) | Ja integrado |
| **Storage** | Firebase Storage (GCloud) | Ja integrado |
| **Database** | Firestore (GCloud) | Ja integrado |
| **Functions** | Cloud Functions (GCloud) | Ja integrado |

### Ecossistema Google Completo
```
┌─────────────────────────────────────────────────────────────┐
│                    GENESIS CLINIC OS                         │
├─────────────────────────────────────────────────────────────┤
│  Firebase Auth ─── Google Identity Platform                  │
│  Firestore ─────── Google Cloud Datastore                   │
│  Cloud Functions ─ Google Cloud Run                         │
│  Cloud Storage ─── Google Cloud Storage                     │
│  FCM ───────────── Google Push Notifications                │
│  Calendar API ──── Google Calendar + Meet                   │
│  Meet ──────────── Google Meet (teleconsulta)               │
└─────────────────────────────────────────────────────────────┘
```

---

## Documentacao Oficial Google (Dezembro 2025)

### Google Calendar API - Criar Evento com Meet

**Endpoint:**
```
POST https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events
```

**OAuth Scopes Necessarios (escolher um):**
- `https://www.googleapis.com/auth/calendar` (full access)
- `https://www.googleapis.com/auth/calendar.events` (events only)

**Parametro Critico:**
```
conferenceDataVersion=1  // OBRIGATORIO para criar Meet link
```

**Request Body:**
```json
{
  "summary": "Teleconsulta - Dr. Nome",
  "start": {
    "dateTime": "2025-12-27T10:00:00-03:00",
    "timeZone": "America/Sao_Paulo"
  },
  "end": {
    "dateTime": "2025-12-27T10:30:00-03:00",
    "timeZone": "America/Sao_Paulo"
  },
  "attendees": [
    {"email": "paciente@email.com"},
    {"email": "medico@clinica.com"}
  ],
  "conferenceData": {
    "createRequest": {
      "requestId": "unique-request-id-123",
      "conferenceSolutionKey": {
        "type": "hangoutsMeet"
      }
    }
  }
}
```

**Response (campos relevantes):**
```json
{
  "id": "event-id",
  "htmlLink": "https://calendar.google.com/...",
  "hangoutLink": "https://meet.google.com/xxx-yyyy-zzz",
  "conferenceData": {
    "entryPoints": [
      {
        "entryPointType": "video",
        "uri": "https://meet.google.com/xxx-yyyy-zzz"
      }
    ]
  }
}
```

**Fonte:** [Google Calendar API - Create Events](https://developers.google.com/workspace/calendar/api/guides/create-events)

---

### Google Meet REST API v2 - Quotas

| Operacao | Por Minuto (Projeto) | Por Minuto (Usuario) |
|----------|---------------------|---------------------|
| **Read** (get, list) | 6,000 | 600 |
| **Write** (patch, update) | 1,000 | 100 |
| **spaces.create** | 100 | 10 |

**Limites Diarios:** Sem limite diario, desde que respeite per-minute quotas.

**Custo:** **GRATIS** - Nao ha cobranca por uso da API.

**Fonte:** [Google Meet API - Usage Limits](https://developers.google.com/workspace/meet/api/guides/limits)

---

### Google Calendar API - Quotas

| Metrica | Limite |
|---------|--------|
| **Queries por dia** | 1,000,000 |
| **Per-minute per project** | Nao especificado |
| **Per-minute per user** | Nao especificado |

**Importante:** `PATCH` consome 3 unidades de quota. Preferir `GET` + `UPDATE`.

**Custo:** **GRATIS** - Nao ha cobranca adicional.

**Fonte:** [Google Calendar API - Quotas](https://developers.google.com/workspace/calendar/api/guides/quota)

---

### Autenticacao - Service Account com Domain-Wide Delegation

Para criar eventos em nome de usuarios da clinica:

1. **Criar Service Account** no Google Cloud Console
2. **Habilitar Domain-Wide Delegation** no Admin Console
3. **Adicionar Scopes:**
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`

**Codigo Node.js:**
```javascript
const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
  scopes: ['https://www.googleapis.com/auth/calendar'],
  subject: 'clinica@dominio.com' // Impersonate clinic user
});

const calendar = google.calendar({ version: 'v3', auth });
```

**Fonte:** [Meet API Authentication](https://developers.google.com/workspace/meet/api/guides/authenticate-authorize)

---

### Google Meet REST API v2 - Criar Space Diretamente (Alternativa)

**Endpoint:**
```
POST https://meet.googleapis.com/v2/spaces
```

**OAuth Scope:**
```
https://www.googleapis.com/auth/meetings.space.created
```

**Request Body:** Pode ser vazio (desde maio 2023).

**Response:**
```json
{
  "name": "spaces/jQCFfuBOdN5z",
  "meetingUri": "https://meet.google.com/xxx-yyyy-zzz",
  "meetingCode": "xxx-yyyy-zzz",
  "config": { ... }
}
```

**Fonte:** [Meet API - Meeting Spaces](https://developers.google.com/workspace/meet/api/guides/meeting-spaces)

---

## Fases de Implementacao

### FASE 1: Ghost Button Elimination (Fundacao)
> **Objetivo**: Eliminar todos os 8 ghost buttons com implementacao real

#### 1.1 Appointment Management
**Arquivos a modificar:**
- `src/pages/patient-portal/Appointments.tsx`
- `src/services/firestore/appointment.service.ts`
- `src/hooks/usePatientPortal.ts`

**Implementacao:**
```typescript
// Appointments.tsx - Adicionar handlers
const handleReschedule = async (appointmentId: string) => {
  setRescheduleModal({ open: true, appointmentId });
};

const handleCancel = async (appointmentId: string) => {
  const confirmed = await confirmDialog('Cancelar consulta?');
  if (confirmed) {
    await appointmentService.updateStatus(clinicId, appointmentId, Status.CANCELED);
    toast.success('Consulta cancelada');
  }
};
```

**Componentes novos:**
- `src/components/patient-portal/RescheduleModal.tsx` - Calendario para nova data
- `src/components/patient-portal/CancelConfirmDialog.tsx` - Confirmacao com motivo

#### 1.2 PDF Generation
**Arquivos a modificar:**
- `src/pages/patient-portal/Prescriptions.tsx`
- `src/pages/patient-portal/LabResults.tsx`
- `src/pages/patient-portal/History.tsx`

**Novo servico:**
- `src/services/pdf-generation.service.ts`

```typescript
// pdf-generation.service.ts
import { jsPDF } from 'jspdf';

export const pdfService = {
  async generatePrescriptionPDF(prescription: Prescription): Promise<Blob> {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Receita Medica', 105, 20, { align: 'center' });
    // ... layout profissional com QR code se digital
    return doc.output('blob');
  },

  async generateLabResultPDF(result: LabResult): Promise<Blob> {
    // ... resultado com tabela de valores
  }
};
```

#### 1.3 Message Attachments
**Arquivos a modificar:**
- `src/pages/patient-portal/Messages.tsx`
- `src/hooks/usePatientMessages.ts` (ja suporta attachment!)

**Implementacao:**
```typescript
// Messages.tsx - Adicionar file picker
const handleAttachment = () => {
  fileInputRef.current?.click();
};

const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    setSelectedFile(file);
  }
};

// Modificar handleSend para incluir file
const handleSend = async () => {
  await sendMessage(message, selectedFile);
  setSelectedFile(null);
};
```

#### 1.4 New Message Flow
**Novo componente:**
- `src/components/patient-portal/NewConversationModal.tsx`

```typescript
// Lista profissionais disponiveis para contato
// Cria conversation via messageService.createConversation()
```

---

### FASE 2: Pagamento PIX
> **Objetivo**: Permitir pagamento de faturas pendentes via PIX

#### 2.1 Backend (Firebase Functions)
**Novo arquivo:**
- `functions/src/payment/pix.ts`

```typescript
// Integracao com API PIX (Gerencianet/EFI ou banco)
export const createPixCharge = functions.https.onCall(async (data, context) => {
  const { transactionId, amount, patientName } = data;

  // Gerar cobranca PIX
  const pixResponse = await pixApi.createCharge({
    calendario: { expiracao: 3600 }, // 1 hora
    valor: { original: amount.toFixed(2) },
    chave: process.env.PIX_KEY,
    solicitacaoPagador: `Pagamento - ${patientName}`
  });

  return {
    qrCode: pixResponse.pixCopiaECola,
    qrCodeImage: pixResponse.imagemQrcode,
    txid: pixResponse.txid
  };
});

// Webhook para confirmacao
export const pixWebhook = functions.https.onRequest(async (req, res) => {
  const { pix } = req.body;
  for (const payment of pix) {
    await updateTransactionStatus(payment.txid, 'paid');
  }
  res.status(200).send('OK');
});
```

#### 2.2 Frontend
**Arquivos a modificar:**
- `src/pages/patient-portal/Billing.tsx`

**Novo componente:**
- `src/components/patient-portal/PixPaymentModal.tsx`

```typescript
// PixPaymentModal.tsx
export function PixPaymentModal({ transaction, onClose, onSuccess }) {
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'paid'>('loading');

  useEffect(() => {
    const generatePix = async () => {
      const result = await functions.httpsCallable('createPixCharge')({
        transactionId: transaction.id,
        amount: transaction.amount,
        patientName: profile.name
      });
      setPixData(result.data);
      setStatus('ready');
    };
    generatePix();
  }, []);

  // Poll para verificar pagamento ou usar real-time subscription
  useEffect(() => {
    if (!pixData) return;
    const unsubscribe = transactionService.subscribe(clinicId, transaction.id, (tx) => {
      if (tx.status === 'paid') {
        setStatus('paid');
        onSuccess();
      }
    });
    return unsubscribe;
  }, [pixData]);

  return (
    <Modal>
      {status === 'loading' && <Spinner />}
      {status === 'ready' && (
        <>
          <img src={pixData.qrCodeImage} alt="QR Code PIX" />
          <CopyButton text={pixData.qrCode} label="Copiar codigo PIX" />
          <p>Escaneie o QR Code ou copie o codigo</p>
        </>
      )}
      {status === 'paid' && <SuccessAnimation />}
    </Modal>
  );
}
```

---

### FASE 3: Teleconsulta com Google Meet (MIGRACAO COMPLETA)
> **Objetivo**: Substituir Jitsi por Google Meet em TODO o sistema (clinica + paciente)

#### 3.1 Backend (Firebase Functions)
**Novo arquivo:**
- `functions/src/calendar/google-meet.ts`

```typescript
/**
 * Google Meet Integration via Calendar API
 *
 * Cria eventos no Google Calendar com link Meet automatico.
 * Baseado na documentacao oficial:
 * https://developers.google.com/workspace/calendar/api/guides/create-events
 *
 * Quota: 1,000,000 queries/dia (GRATIS)
 * Rate limit spaces.create: 100/min projeto, 10/min usuario
 */

import * as functions from 'firebase-functions';
import { google, calendar_v3 } from 'googleapis';

// Scopes necessarios (documentacao oficial)
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

interface CreateMeetSessionInput {
  appointmentId: string;
  patientName: string;
  patientEmail: string;
  professionalName: string;
  professionalEmail: string;
  scheduledAt: string;  // ISO 8601 format
  durationMinutes: number;
  clinicName: string;
}

interface CreateMeetSessionOutput {
  meetLink: string;
  calendarEventId: string;
  meetingCode: string;
}

/**
 * Cloud Function para criar sessao de teleconsulta com Google Meet.
 *
 * Usa Google Calendar API para criar evento com conferenceData,
 * que automaticamente gera link do Meet.
 */
export const createMeetSession = functions.https.onCall(
  async (data: CreateMeetSessionInput, context): Promise<CreateMeetSessionOutput> => {
    // Verificar autenticacao
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Usuario nao autenticado'
      );
    }

    const {
      appointmentId,
      patientName,
      patientEmail,
      professionalName,
      professionalEmail,
      scheduledAt,
      durationMinutes,
      clinicName,
    } = data;

    // Validar inputs
    if (!appointmentId || !patientEmail || !professionalEmail || !scheduledAt) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Campos obrigatorios faltando'
      );
    }

    try {
      // Autenticacao com Service Account
      // Requer: GOOGLE_SERVICE_ACCOUNT_JSON no secrets
      const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(
          process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '{}'
        ),
        scopes: SCOPES,
      });

      const calendar = google.calendar({ version: 'v3', auth });

      // Calcular horario de termino
      const startTime = new Date(scheduledAt);
      const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

      // Criar evento com conferenceData (documentacao oficial)
      // CRITICO: conferenceDataVersion=1 e OBRIGATORIO
      const event: calendar_v3.Schema$Event = {
        summary: `Teleconsulta - ${professionalName}`,
        description: `Consulta online com ${patientName}\n\nClinica: ${clinicName}`,
        start: {
          dateTime: startTime.toISOString(),
          timeZone: 'America/Sao_Paulo',
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'America/Sao_Paulo',
        },
        attendees: [
          { email: patientEmail, displayName: patientName },
          { email: professionalEmail, displayName: professionalName },
        ],
        // CRITICO: Esta estrutura cria o Meet link automaticamente
        conferenceData: {
          createRequest: {
            requestId: appointmentId, // Deve ser unico
            conferenceSolutionKey: {
              type: 'hangoutsMeet', // Tipo oficial para Google Meet
            },
          },
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 60 },
            { method: 'popup', minutes: 15 },
          ],
        },
      };

      // Inserir evento
      // CRITICO: conferenceDataVersion: 1 e OBRIGATORIO para criar Meet
      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
        conferenceDataVersion: 1, // OBRIGATORIO!
        sendUpdates: 'all', // Envia convites por email
      });

      const createdEvent = response.data;

      // Extrair Meet link do response
      // O hangoutLink contem o link direto para o Meet
      if (!createdEvent.hangoutLink) {
        throw new functions.https.HttpsError(
          'internal',
          'Meet link nao foi gerado. Verifique configuracoes do Google Workspace.'
        );
      }

      // Extrair meeting code do link (xxx-yyyy-zzz)
      const meetingCode = createdEvent.hangoutLink.split('/').pop() || '';

      return {
        meetLink: createdEvent.hangoutLink,
        calendarEventId: createdEvent.id || '',
        meetingCode,
      };
    } catch (error) {
      console.error('Erro ao criar sessao Meet:', error);

      if (error instanceof Error) {
        throw new functions.https.HttpsError(
          'internal',
          `Falha ao criar teleconsulta: ${error.message}`
        );
      }

      throw new functions.https.HttpsError(
        'internal',
        'Erro desconhecido ao criar teleconsulta'
      );
    }
  }
);

/**
 * Cloud Function para cancelar/deletar evento de teleconsulta.
 */
export const cancelMeetSession = functions.https.onCall(
  async (data: { calendarEventId: string }, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Nao autenticado');
    }

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '{}'),
      scopes: SCOPES,
    });

    const calendar = google.calendar({ version: 'v3', auth });

    await calendar.events.delete({
      calendarId: 'primary',
      eventId: data.calendarEventId,
      sendUpdates: 'all',
    });

    return { success: true };
  }
);
```

**Dependencia npm (functions/package.json):**
```json
{
  "dependencies": {
    "googleapis": "^140.0.0"
  }
}
```

**Secret necessario:**
```bash
firebase functions:secrets:set GOOGLE_SERVICE_ACCOUNT_JSON
# Cole o conteudo do JSON da service account
```

#### 3.2 Adaptar TelemedicineSession
**Arquivos a modificar:**
- `src/types/telemedicine.ts` - Adicionar `meetLink: string`
- `src/services/firestore/telemedicine/mutations.ts` - Chamar Cloud Function

```typescript
// types/telemedicine.ts
export interface TelemedicineSession {
  // ... campos existentes
  meetLink: string;  // NOVO: Link do Google Meet
  calendarEventId?: string;  // NOVO: ID do evento no Calendar
  // REMOVER: roomName (era para Jitsi)
}
```

#### 3.3 MIGRACAO LADO CLINICA

**Arquivos a modificar:**

##### 3.3.1 Agenda - Criacao de Teleconsulta
- `src/pages/Agenda.tsx`
- `src/components/agenda/AppointmentCard.tsx`
- `src/components/agenda/DraggableDayView.tsx`

```typescript
// Quando criar appointment com tipo "teleconsulta":
const handleCreateTeleconsulta = async (appointmentData) => {
  // 1. Criar appointment no Firestore
  const appointmentId = await appointmentService.create(clinicId, appointmentData);

  // 2. Criar sessao Meet via Cloud Function
  const { meetLink, calendarEventId } = await createMeetSession({
    appointmentId,
    patientEmail: patient.email,
    professionalEmail: professional.email,
    scheduledAt: appointmentData.date,
    duration: appointmentData.duration || 30
  });

  // 3. Atualizar appointment com meetLink
  await appointmentService.update(clinicId, appointmentId, {
    meetLink,
    calendarEventId
  });
};
```

##### 3.3.2 VideoRoom Component (SIMPLIFICAR)
- `src/components/telemedicine/VideoRoom.tsx`

```typescript
// ANTES: Jitsi SDK complexo
// DEPOIS: Apenas link para Meet

export function VideoRoom({ session, onCallEnd }: VideoRoomProps) {
  const handleJoinMeet = () => {
    window.open(session.meetLink, '_blank');
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <Video className="w-16 h-16 text-genesis-primary mb-4" />
      <h2 className="text-xl font-bold mb-2">Teleconsulta Pronta</h2>
      <p className="text-genesis-muted mb-6">
        Clique para entrar na sala do Google Meet
      </p>
      <button
        onClick={handleJoinMeet}
        className="flex items-center gap-2 px-6 py-3 bg-genesis-primary text-white rounded-xl font-medium hover:bg-genesis-primary-dark"
      >
        <ExternalLink className="w-5 h-5" />
        Entrar no Google Meet
      </button>
      <p className="text-sm text-genesis-muted mt-4">
        O paciente recebera o mesmo link por email
      </p>
    </div>
  );
}
```

##### 3.3.3 TelemedicineModal (SIMPLIFICAR)
- `src/components/telemedicine/TelemedicineModal.tsx`

```typescript
// Remover: Jitsi pre-join checks
// Manter: Apenas informacoes + botao para Meet
```

##### 3.3.4 TelemedicineButton
- `src/components/telemedicine/TelemedicineButton.tsx`

```typescript
// Ajustar para abrir Meet link ao inves de VideoRoom com Jitsi
```

##### 3.3.5 Hooks
- `src/hooks/useTelemedicine.ts`

```typescript
// Simplificar: remover logica Jitsi-specific
// startCall agora apenas atualiza status e abre Meet link
const startCall = useCallback(async (): Promise<void> => {
  if (!session?.meetLink) {
    throw new Error('Meet link not available');
  }

  await telemedicineService.updateStatus(clinicId, session.id, 'in_progress', {
    startedAt: new Date().toISOString(),
  });

  // Abrir Meet em nova aba
  window.open(session.meetLink, '_blank');
}, [clinicId, session]);
```

#### 3.4 MIGRACAO PORTAL DO PACIENTE
**Arquivos a modificar:**
- `src/pages/patient-portal/Telehealth.tsx`

```typescript
// Simplificar - nao precisa mais de device check fake
export function PatientTelehealth() {
  const { nextTeleconsulta, canJoin } = usePatientTelehealth();

  const handleJoinCall = () => {
    if (nextTeleconsulta?.meetLink) {
      window.open(nextTeleconsulta.meetLink, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* Info do appointment */}
      <AppointmentInfo appointment={nextTeleconsulta} />

      {/* Botao grande para entrar */}
      <button
        onClick={handleJoinCall}
        disabled={!canJoin}
        className="w-full py-4 bg-success text-white rounded-xl font-bold text-lg"
      >
        <Video className="w-6 h-6 inline mr-2" />
        Entrar na Consulta (Google Meet)
      </button>

      {/* Instrucoes simples */}
      <InstructionsCard />
    </div>
  );
}
```

#### 3.5 Remover Dependencias Jitsi
**package.json:**
```json
// REMOVER:
"@jitsi/react-sdk": "^1.x.x"
```

**Arquivos a deletar (opcional, ou manter como historico):**
- `src/components/telemedicine/WaitingRoom.tsx` (nao mais necessario)
- `src/components/telemedicine/ConsultationTimer.tsx` (Meet tem proprio timer)
- `src/components/telemedicine/RecordingBadge.tsx` (Meet gerencia gravacao)

#### 3.6 Testes de Migracao
```bash
# Atualizar testes para novo fluxo
src/__tests__/components/telemedicine/VideoRoom.test.tsx
src/__tests__/components/telemedicine/TelemedicineModal.test.tsx
src/__tests__/components/telemedicine/TelemedicineButton.test.tsx
src/__tests__/hooks/telemedicine/useTelemedicine.test.ts
src/__tests__/pages/patient-portal/Telehealth.test.tsx
```

---

### FASE 4: Agendamento Online
> **Objetivo**: Permitir paciente agendar novas consultas

#### 4.1 Novo componente de agendamento
**Novos arquivos:**
- `src/pages/patient-portal/ScheduleAppointment.tsx`
- `src/components/patient-portal/AvailabilityCalendar.tsx`
- `src/components/patient-portal/SpecialtySelector.tsx`
- `src/components/patient-portal/TimeSlotPicker.tsx`

**Hooks necessarios:**
- `src/hooks/useClinicAvailability.ts` - Buscar horarios disponiveis

```typescript
// ScheduleAppointment.tsx - Fluxo em 4 steps
export function ScheduleAppointment() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selection, setSelection] = useState<AppointmentSelection>({});

  return (
    <div>
      <StepIndicator current={step} total={4} />

      {step === 1 && (
        <SpecialtySelector
          onSelect={(specialty) => {
            setSelection(s => ({ ...s, specialty }));
            setStep(2);
          }}
        />
      )}

      {step === 2 && (
        <ProfessionalSelector
          specialty={selection.specialty}
          onSelect={(professional) => {
            setSelection(s => ({ ...s, professional }));
            setStep(3);
          }}
        />
      )}

      {step === 3 && (
        <AvailabilityCalendar
          professionalId={selection.professional.id}
          onSelectSlot={(date, time) => {
            setSelection(s => ({ ...s, date, time }));
            setStep(4);
          }}
        />
      )}

      {step === 4 && (
        <ConfirmationStep
          selection={selection}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}
```

#### 4.2 Rotas
**Arquivo a modificar:**
- `src/App.tsx` - Adicionar rota `/portal/agendar`

---

### FASE 5: Prescription Refill Request
> **Objetivo**: Permitir solicitacao de renovacao de receita

#### 5.1 Backend
**Novo tipo:**
```typescript
// types/prescription.ts
export interface RefillRequest {
  id: string;
  prescriptionId: string;
  patientId: string;
  status: 'pending' | 'approved' | 'denied';
  requestedAt: string;
  respondedAt?: string;
  responseNote?: string;
}
```

**Novo servico:**
- `src/services/firestore/refill-request.service.ts`

#### 5.2 Frontend
**Arquivos a modificar:**
- `src/pages/patient-portal/Prescriptions.tsx`

```typescript
const handleRefillRequest = async (prescriptionId: string) => {
  await refillRequestService.create(clinicId, {
    prescriptionId,
    patientId,
    status: 'pending'
  });
  toast.success('Solicitacao enviada ao medico');
};
```

---

## Arquivos Criticos

### A Criar
| Arquivo | Fase | Prioridade |
|---------|------|------------|
| `src/services/pdf-generation.service.ts` | 1 | Alta |
| `src/components/patient-portal/RescheduleModal.tsx` | 1 | Alta |
| `src/components/patient-portal/PixPaymentModal.tsx` | 2 | Alta |
| `functions/src/payment/pix.ts` | 2 | Alta |
| `functions/src/calendar/google-meet.ts` | 3 | Alta |
| `src/pages/patient-portal/ScheduleAppointment.tsx` | 4 | Media |
| `src/components/patient-portal/AvailabilityCalendar.tsx` | 4 | Media |

### A Modificar (Portal Paciente)
| Arquivo | Fase | Mudancas |
|---------|------|----------|
| `src/pages/patient-portal/Appointments.tsx` | 1 | Handlers para remarcar/cancelar |
| `src/pages/patient-portal/Prescriptions.tsx` | 1,5 | PDF download + refill request |
| `src/pages/patient-portal/Billing.tsx` | 2 | Handler para pagamento PIX |
| `src/pages/patient-portal/Messages.tsx` | 1 | File attachment + new conversation |
| `src/pages/patient-portal/Telehealth.tsx` | 3 | Simplificar para Google Meet link |
| `src/App.tsx` | 4 | Nova rota /portal/agendar |

### A Modificar (Lado Clinica - Migracao Google Meet)
| Arquivo | Fase | Mudancas |
|---------|------|----------|
| `src/types/telemedicine.ts` | 3 | Adicionar meetLink, remover roomName |
| `src/pages/Agenda.tsx` | 3 | Criar Meet ao agendar teleconsulta |
| `src/components/agenda/AppointmentCard.tsx` | 3 | Mostrar link Meet |
| `src/components/telemedicine/VideoRoom.tsx` | 3 | Simplificar para abrir Meet |
| `src/components/telemedicine/TelemedicineModal.tsx` | 3 | Remover Jitsi checks |
| `src/components/telemedicine/TelemedicineButton.tsx` | 3 | Abrir Meet ao inves de Jitsi |
| `src/hooks/useTelemedicine.ts` | 3 | Remover logica Jitsi |
| `src/services/firestore/telemedicine/mutations.ts` | 3 | Chamar Cloud Function Meet |

### A Remover (Apos Migracao)
| Arquivo | Fase | Motivo |
|---------|------|--------|
| `src/components/telemedicine/WaitingRoom.tsx` | 3 | Meet tem propria sala de espera |
| `src/components/telemedicine/ConsultationTimer.tsx` | 3 | Meet tem proprio timer |
| `src/components/telemedicine/RecordingBadge.tsx` | 3 | Meet gerencia gravacao |
| `@jitsi/react-sdk` (dep) | 3 | Nao mais necessario |

---

## Testes Requeridos (CODE_CONSTITUTION)

Cada fase deve manter **>=90% coverage**:

```bash
# Fase 1 - Ghost buttons
src/__tests__/pages/patient-portal/Appointments.test.tsx
src/__tests__/pages/patient-portal/Prescriptions.test.tsx
src/__tests__/services/pdf-generation.test.ts

# Fase 2 - PIX
functions/src/__tests__/payment/pix.test.ts
src/__tests__/components/patient-portal/PixPaymentModal.test.tsx

# Fase 3 - Google Meet
functions/src/__tests__/calendar/google-meet.test.ts
src/__tests__/pages/patient-portal/Telehealth.test.tsx

# Fase 4 - Agendamento
src/__tests__/pages/patient-portal/ScheduleAppointment.test.tsx
src/__tests__/hooks/useClinicAvailability.test.ts
```

---

## Estimativa por Fase

| Fase | Escopo | Complexidade | Arquivos |
|------|--------|--------------|----------|
| **Fase 1** | 8 ghost buttons + PDF service | Media | ~10 |
| **Fase 2** | PIX integration (backend + frontend) | Alta | ~5 |
| **Fase 3** | Google Meet (clinica + paciente) | Alta | ~15 |
| **Fase 4** | Scheduling flow completo | Alta | ~8 |
| **Fase 5** | Refill requests | Baixa | ~3 |

---

## Ordem de Execucao Recomendada

### Sprint 1: Fundacao (Ghost Buttons)
1. **Fase 1.2** - PDF Generation Service
2. **Fase 1.1** - Appointment Management (remarcar/cancelar)
3. **Fase 1.3/1.4** - Message attachments + new conversation

### Sprint 2: Monetizacao
4. **Fase 2** - PIX Payment (maior impacto de receita)

### Sprint 3: Migracao Google (Maior escopo)
5. **Fase 3.1** - Cloud Function Google Calendar + Meet
6. **Fase 3.3** - Migracao lado clinica (Agenda, VideoRoom, hooks)
7. **Fase 3.4** - Migracao portal paciente
8. **Fase 3.5** - Cleanup Jitsi dependencies

### Sprint 4: Growth Features
9. **Fase 4** - Agendamento online completo
10. **Fase 5** - Refill requests (conveniencia)

---

## Validacao Final

Antes de cada merge:
- [ ] Zero ghost buttons na fase
- [ ] Testes >=90% coverage
- [ ] Build sem warnings
- [ ] Lint clean
- [ ] Dark mode funcional
- [ ] Mobile responsive
- [ ] Funciona offline (PWA)

---

## Fontes

- [Google Meet REST API](https://developers.google.com/workspace/meet/api/guides/overview)
- [Google Calendar API - Create Events](https://developers.google.com/workspace/calendar/api/guides/create-events)
- [Healthcare UX Problems](https://www.drawbackwards.com/blog/healthcareux-4-common-problems-with-patient-portals)
- [Epic MyChart Reviews](https://www.gartner.com/reviews/market/next-generation-interactive-patient-care/vendor/epic/product/mychart)
