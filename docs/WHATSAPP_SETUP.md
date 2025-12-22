# WhatsApp Business API - Guia de Configuração

## Visão Geral

O Clínica Genesis OS inclui integração completa com WhatsApp Business API para:
- Confirmação automática ao agendar
- Lembrete 24h antes da consulta
- Lembrete 2h antes da consulta
- Processamento de respostas (Confirmar/Remarcar)

---

## Arquitetura

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Meta Cloud    │────▶│  Cloud Functions │────▶│    Firestore    │
│   WhatsApp API  │◀────│  (Webhook)       │◀────│   Appointments  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌──────────────────┐
│   Paciente      │     │ Cloud Scheduler  │
│   (WhatsApp)    │     │ 24h / 2h reminders│
└─────────────────┘     └──────────────────┘
```

### Arquivos do Sistema

| Arquivo | Função |
|---------|--------|
| `functions/src/whatsapp/client.ts` | Cliente WhatsApp Cloud API v21.0 |
| `functions/src/whatsapp/templates.ts` | Templates de mensagem |
| `functions/src/whatsapp/webhook.ts` | Webhook para processar respostas |
| `functions/src/scheduler/reminders.ts` | Schedulers 24h e 2h |
| `functions/src/scheduler/triggers.ts` | Triggers de agendamento |
| `functions/src/utils/config.ts` | Configuração multi-tenant |

---

## Passo 1: Conta Meta Business

1. Acesse [business.facebook.com](https://business.facebook.com/)
2. Crie uma conta Business Manager
3. Verifique seu negócio (opcional, mas recomendado)

---

## Passo 2: WhatsApp Business Platform

1. Acesse [developers.facebook.com](https://developers.facebook.com/)
2. Crie um novo App → Tipo: "Business"
3. Adicione o produto "WhatsApp"
4. Configure o número de teste ou adicione um número verificado

### Obter Credenciais

No dashboard do WhatsApp:
- **Phone Number ID**: ID do número de telefone
- **WhatsApp Business Account ID**: ID da conta
- **Access Token**: Token de acesso (permanente recomendado)

---

## Passo 3: Criar Templates de Mensagem

Acesse: **WhatsApp Manager → Message Templates**

### Template 1: consulta_confirmacao

```
Categoria: UTILITY
Idioma: Portuguese (Brazil)
Nome: consulta_confirmacao

Cabeçalho: Agendamento Confirmado ✅

Corpo:
Olá {{1}}!

Sua consulta foi agendada:
📅 Data: {{2}}
🕐 Horário: {{3}}
👨‍⚕️ Profissional: {{4}}
📍 Local: {{5}}

Dúvidas? Responda esta mensagem.

Rodapé: Clínica Genesis
```

### Template 2: consulta_lembrete_24h

```
Categoria: UTILITY
Idioma: Portuguese (Brazil)
Nome: consulta_lembrete_24h

Cabeçalho: Lembrete de Consulta 🗓️

Corpo:
Olá {{1}}!

Lembramos que você tem consulta amanhã:
📅 Data: {{2}}
🕐 Horário: {{3}}
👨‍⚕️ Dr(a). {{4}}

Responda:
1️⃣ - Confirmar presença
2️⃣ - Preciso remarcar

Rodapé: Clínica Genesis

Botões:
- Resposta Rápida: "Confirmar"
- Resposta Rápida: "Remarcar"
```

### Template 3: consulta_lembrete_2h

```
Categoria: UTILITY
Idioma: Portuguese (Brazil)
Nome: consulta_lembrete_2h

Cabeçalho: Consulta em 2 horas! ⏰

Corpo:
Olá {{1}}!

Sua consulta é daqui a 2 horas:
🕐 {{2}}
👨‍⚕️ Dr(a). {{3}}

Confirme sua presença respondendo esta mensagem.

Rodapé: Clínica Genesis

Botões:
- Resposta Rápida: "Estou a caminho"
- Resposta Rápida: "Preciso remarcar"
```

**Aguarde aprovação do Meta (geralmente 24-48h)**

---

## Passo 4: Configurar Firebase Secrets

```bash
# Navegue para a pasta do projeto
cd /path/to/ClinicaGenesisOS

# Configure os secrets
firebase functions:secrets:set WHATSAPP_TOKEN
# Cole o Access Token quando solicitado

firebase functions:secrets:set WHATSAPP_PHONE_ID
# Cole o Phone Number ID quando solicitado

firebase functions:secrets:set WHATSAPP_VERIFY_TOKEN
# Crie um token aleatório (ex: openssl rand -hex 32)
```

### Verificar Secrets

```bash
firebase functions:secrets:access WHATSAPP_TOKEN
firebase functions:secrets:access WHATSAPP_PHONE_ID
firebase functions:secrets:access WHATSAPP_VERIFY_TOKEN
```

---

## Passo 5: Configurar Webhook

### URL do Webhook

```
https://us-central1-[PROJECT_ID].cloudfunctions.net/whatsappWebhook
```

Substitua `[PROJECT_ID]` pelo ID do seu projeto Firebase.

### No Meta Developer Console

1. Acesse **WhatsApp → Configuration**
2. Em **Webhook**, clique em **Edit**
3. Cole a URL do webhook
4. Cole o **Verify Token** (mesmo configurado no Firebase)
5. Assine os eventos:
   - `messages`
   - `message_status`

---

## Passo 6: Deploy

```bash
# Build das functions
cd functions
npm install
npm run build

# Deploy
firebase deploy --only functions:whatsappWebhook,functions:sendReminders24h,functions:sendReminders2h,functions:onAppointmentCreated,functions:onAppointmentUpdated
```

### Verificar Deploy

```bash
firebase functions:log
```

---

## Passo 7: Testar

### Teste Manual via cURL

```bash
# Substitua os valores
curl -X POST "https://graph.facebook.com/v21.0/YOUR_PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "5511999999999",
    "type": "template",
    "template": {
      "name": "consulta_confirmacao",
      "language": { "code": "pt_BR" },
      "components": [
        {
          "type": "body",
          "parameters": [
            { "type": "text", "text": "Maria" },
            { "type": "text", "text": "25/12/2024" },
            { "type": "text", "text": "14:00" },
            { "type": "text", "text": "Dr. João" },
            { "type": "text", "text": "Clínica Genesis" }
          ]
        }
      ]
    }
  }'
```

### Teste via UI

1. Acesse **Configurações → WhatsApp** no sistema
2. Clique em "Testar Conexão"
3. Verifique o status dos templates

---

## Funcionamento Automático

### Ao Criar Agendamento

Trigger `onAppointmentCreated`:
- Envia template `consulta_confirmacao`
- Registra status `whatsapp.confirmationSent = true`

### 24h Antes

Scheduler `sendReminders24h` (executa a cada 1h):
- Busca consultas nas próximas 24-25h
- Envia template `consulta_lembrete_24h`
- Registra `whatsapp.reminder24hSent = true`

### 2h Antes

Scheduler `sendReminders2h` (executa a cada 30min):
- Busca consultas nas próximas 2-2.5h
- Envia template `consulta_lembrete_2h`
- Registra `whatsapp.reminder2hSent = true`

### Ao Receber Resposta

Webhook processa:
- "Confirmar"/"Sim"/"1" → Status = `confirmed`
- "Remarcar"/"2" → Status = `needs_reschedule`
- Qualquer outra → Marca como `read`

---

## Troubleshooting

### Erro: "Template not found"

- Verifique se o template foi aprovado no Meta
- Confirme que o nome está correto (case-sensitive)
- Confirme o idioma (`pt_BR`)

### Erro: "Invalid token"

- Regenere o Access Token no Meta Developer Console
- Atualize o secret: `firebase functions:secrets:set WHATSAPP_TOKEN`
- Redeploy: `firebase deploy --only functions`

### Webhook não recebe mensagens

- Verifique se o Verify Token está correto
- Confirme que os eventos `messages` estão assinados
- Teste a URL no navegador (deve retornar erro de método)

### Mensagens não chegam

- Verifique o número do paciente (formato: 5511999999999)
- Confirme que o número aceita mensagens (opt-in)
- Veja logs: `firebase functions:log --only whatsappWebhook`

---

## Custos

### Meta WhatsApp Business API

| Tipo | Custo (Brasil) |
|------|----------------|
| Template Utility | ~$0.02 USD |
| Template Marketing | ~$0.08 USD |
| Sessão (24h) | ~$0.01 USD |

### Firebase

- Cloud Functions: primeiros 2M invocações grátis/mês
- Cloud Scheduler: 3 jobs grátis/mês

---

## Segurança

1. **Tokens são secrets** - Nunca commit em código
2. **Webhook verificado** - HMAC signature validation
3. **Rate limiting** - Implementado no Meta
4. **LGPD** - Opt-in obrigatório do paciente

---

## Referências

- [WhatsApp Cloud API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Template Guidelines](https://developers.facebook.com/docs/whatsapp/message-templates)
- [Webhook Reference](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks)
- [Firebase Functions Secrets](https://firebase.google.com/docs/functions/config-env)
