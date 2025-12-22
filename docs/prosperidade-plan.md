# PLANO PROSPERIDADE - Clínica Genesis OS
## Elevando ao Nível das Melhores Plataformas de Healthcare dos EUA

---

## BENCHMARK: O QUE AS MELHORES FAZEM

### Plataformas Analisadas
| Plataforma | Foco | Destaques UX |
|------------|------|--------------|
| **Epic MyChart** | Portal do paciente | Score KLAS 90.2, informação priorizada, acessibilidade total |
| **SimplePractice** | Mental health | AI Notes (-50% tempo), mobile-first, HIPAA |
| **Jane App** | Clínicas wellness | Self-booking, AI Scribe, wait list management |
| **Klara** | Comunicação | 80%+ adoption, sem login/senha para paciente |
| **Elation Health** | Primary care | Three-panel console, Note Assist ambient AI |
| **DrChrono** | Mobile EHR | iPad-native, #1 Mobile EHR 9 anos seguidos |
| **Carbon Health** | Clínicas | AI charting em <4min vs 16min manual |
| **Zocdoc** | Booking | Card-based design, cores vibrantes, ML search |
| **Healthie** | Nutrição | Goals tracking, wearable integration |
| **athenahealth** | EHR enterprise | 170+ features Summer 2025, Executive Summary |

---

## PRINCÍPIOS EXTRAÍDOS (O QUE COPIAR)

### 1. **"No matter how much power, it needs to be EASY"** - Epic
- Informação priorizada: crítico no topo, secundário ao scroll
- Zero cognitive load para ações principais
- 3 taps máximo para qualquer ação core

### 2. **Personalização Dinâmica**
- Dashboard adapta ao tipo de usuário (médico vs admin vs nutricionista)
- MyChart customiza baseado no histórico de saúde do paciente
- Klara roteia automaticamente com AI

### 3. **AI Ambient Documentation**
- Carbon Health: 88% do texto AI aceito sem edição
- Elation Note Assist: gera durante a consulta, não depois
- Abridge: Best in KLAS 2025 para ambient scribes

### 4. **Zero Friction Communication**
- Klara: Paciente não precisa de login, senha ou app
- Multi-canal: SMS, email, portal, WhatsApp
- Lembretes reduzem no-shows em 30-60%

### 5. **Linear Design Philosophy**
- Monochrome com poucos bold colors
- Densidade alta de informação, ruído visual baixo
- Dark mode inteligente baseado em contexto

---

## GAPS CRÍTICOS NO GENESIS OS

| O que falta | Referência | Impacto |
|-------------|------------|---------|
| KPIs dinâmicos | athenahealth Executive Summary | Alto |
| AI Scribe já existe mas UI é básica | Elation Note Assist | Alto |
| Página /help vazia | Todas têm Help Center | Alto |
| Wait list management | Jane App | Médio |
| Patient self-booking público | Zocdoc, Jane | Alto |
| Financial wellness dashboard | Healthie | Médio |
| Multi-channel notifications | Klara, Epic | Alto |
| Onboarding progressivo | Oscar Health | Alto |

---

## PLANO DE IMPLEMENTAÇÃO

### FASE 1: FUNDAÇÃO PREMIUM (Sprint 1) ✅ COMPLETO
**Objetivo:** Estabelecer a base de qualidade visual e funcional
**Status:** Implementado em 22/12/2024

**Entregas:**
- [x] Dashboard com KPIs dinâmicos e comparação temporal
- [x] Help Center completo (FAQ, artigos searchable, contato)
- [x] useDashboardMetrics hook para métricas calculadas
- [x] KPICard e OccupancyGauge components
- [x] Skeleton loading e empty states

#### 1.1 Dashboard Inteligente
**Inspiração:** athenahealth Executive Summary, Elation three-panel

```
┌─────────────────────────────────────────────────────────────┐
│  [Saudação contextual]          [Período ▼] [Relatório]     │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Consultas│ │ Pacientes│ │Faturamento│ │ Ocupação │       │
│  │   HOJE   │ │  ATIVOS  │ │   MÊS    │ │  REAL   │       │
│  │    8     │ │   247    │ │ R$42.5k  │ │   78%   │       │
│  │  +2 vs   │ │  +12 vs  │ │ +15% vs  │ │ Meta:85%│       │
│  │  ontem   │ │ mês ant. │ │ mês ant. │ │         │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────┐  ┌─────────────────────────┐  │
│  │   PRÓXIMAS CONSULTAS    │  │    TAREFAS URGENTES     │  │
│  │   [Timeline visual]     │  │    [Priority list]      │  │
│  │   08:30 Maria Silva     │  │    🔴 Finalizar prontuário │
│  │   09:00 João Santos     │  │    🟡 Confirmar agenda    │
│  │   09:30 Ana Oliveira    │  │    ⚪ Enviar resultados   │
│  └─────────────────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Arquivos:**
- `/src/pages/Dashboard.tsx` - Refatorar KPIs para dados reais
- `/src/hooks/useDashboardMetrics.ts` - NOVO: hook para métricas calculadas
- `/src/components/dashboard/KPICard.tsx` - Adicionar comparação temporal
- `/src/components/dashboard/OccupancyGauge.tsx` - NOVO: gauge visual

**Métricas a calcular:**
- Taxa de ocupação REAL = (consultas agendadas / slots disponíveis) × 100
- Comparação com período anterior (dia, semana, mês)
- Trend indicators (↑ ↓ →)

#### 1.2 Help Center Completo
**Inspiração:** Intercom, Zendesk, SimplePractice

**Arquivos:**
- `/src/pages/Help.tsx` - NOVO: página completa
- `/src/components/help/SearchableArticles.tsx` - Busca em artigos
- `/src/components/help/ContactSupport.tsx` - Formulário de contato
- `/src/components/help/FAQAccordion.tsx` - Perguntas frequentes

**Conteúdo obrigatório:**
- Quick Start Guide
- Guia de Agendamento
- Guia de Prontuário
- Guia Financeiro
- TISS e Faturamento
- Configurações da Conta
- Contato/Suporte

---

### FASE 2: EXPERIÊNCIA DO PACIENTE (Sprint 2) ✅ COMPLETO
**Objetivo:** Self-service para pacientes
**Status:** Implementado em 22/12/2024

**Entregas:**
- [x] BookAppointment.tsx - Wizard de 4 etapas estilo Zocdoc
- [x] ClinicProfile.tsx - Página pública da clínica
- [x] AvailabilityCalendar.tsx - Calendário de disponibilidade
- [x] ProfessionalSelector.tsx - Seleção de profissional
- [x] BookingComponents.tsx - Componentes reutilizáveis
- [x] NotificationPreferences.tsx - Preferências multi-canal (WhatsApp, SMS, Email, Push)
- [x] Aba Notificações integrada no Settings.tsx

#### 2.1 Portal do Paciente (Público)
**Inspiração:** Zocdoc, Jane App, Epic MyChart

**Features:**
- [x] Agendamento público sem login
- [x] Escolha de profissional
- [x] Visualização de horários disponíveis
- [ ] Confirmação por SMS/Email (backend pendente)
- [ ] Check-in digital pré-consulta (futuro)

**Arquivos:**
- `/src/pages/public/BookAppointment.tsx` - ✅ CRIADO
- `/src/pages/public/ClinicProfile.tsx` - ✅ CRIADO
- `/src/components/booking/AvailabilityCalendar.tsx` - ✅ CRIADO
- `/src/components/booking/ProfessionalSelector.tsx` - ✅ CRIADO

#### 2.2 Sistema de Notificações Multi-canal
**Inspiração:** Klara (80%+ adoption), Curogram

**Fluxo de lembretes:**
```
7 dias antes  →  Email com instruções de preparo
24h antes     →  SMS confirmação (resposta Y/N)
2h antes      →  Push notification (se app instalado)
```

**Arquivos:**
- `/src/services/notification.service.ts` - PENDENTE (backend)
- `/src/components/notifications/NotificationPreferences.tsx` - ✅ CRIADO
- `/functions/src/triggers/appointmentReminders.ts` - Cloud Function

---

### FASE 3: DOCUMENTAÇÃO INTELIGENTE (Sprint 3) ✅ COMPLETO
**Objetivo:** AI-powered documentation
**Status:** Implementado em 22/12/2024

**Entregas:**
- [x] RecordingControls.tsx - UI premium com waveform animado e ProcessingIndicator
- [x] CID10Suggestions.tsx - 70+ códigos CID-10, busca e sugestões por keywords
- [x] SpecialtyTemplates.tsx - 6 especialidades médicas com preview
- [x] SOAPReview.tsx - Quick Accept/Reject por seção com barra de progresso
- [x] SoapEditor.tsx - Integração completa de templates e AI Scribe

#### 3.1 AI Scribe Enhancement
**Inspiração:** Elation Note Assist, Carbon Health, Abridge

**Melhorias no sistema existente:**
- [x] UI de gravação mais proeminente (waveform visual, cores por estado)
- [x] Feedback visual durante transcrição (ProcessingIndicator com 3 steps)
- [x] Sugestões de código CID-10 (70+ códigos, busca autocomplete, AI suggestions)
- [x] Templates por especialidade (6 especialidades: Clínica Geral, Cardiologia, Neurologia, Pediatria, Endocrinologia, Nutrição)
- [x] Aceitar/rejeitar com um clique (per-section status: pending/accepted/edited)

**Arquivos:**
- `/src/components/ai/RecordingControls.tsx` - ✅ UI PREMIUM
- `/src/components/ai/CID10Suggestions.tsx` - ✅ CRIADO
- `/src/components/ai/SpecialtyTemplates.tsx` - ✅ CRIADO
- `/src/components/ai/SOAPReview.tsx` - ✅ APRIMORADO
- `/src/plugins/medicina/SoapEditor.tsx` - ✅ INTEGRADO

#### 3.2 SOAP Notes Premium
**Inspiração:** Practice Fusion, CharmHealth

**Features:**
- [x] Templates customizáveis por procedimento (6 especialidades)
- [ ] Macros de texto (atalhos) - FUTURO
- [ ] Auto-populate de dados vitais - FUTURO
- [ ] Histórico de alterações - FUTURO
- [ ] Assinatura digital - FUTURO

---

### FASE 4: DESIGN SYSTEM PREMIUM (Sprint 4)
**Objetivo:** Consistência visual de nível Linear/Stripe

#### 4.1 Micro-interações
**Inspiração:** Linear, Stripe

**Implementar:**
```css
/* Hover premium */
.card-premium {
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
.card-premium:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px -8px rgba(0,0,0,0.15);
}

/* Active feedback */
.btn-premium:active {
  transform: scale(0.98);
}

/* Focus ring premium */
.focus-ring-premium:focus-visible {
  outline: 2px solid var(--color-genesis-primary);
  outline-offset: 2px;
}
```

#### 4.2 Loading States Premium
**Inspiração:** Carbon Design System

- Skeleton com shimmer animation
- Progress indicators contextuais
- Optimistic updates
- Micro-copy durante loading ("Carregando sua agenda...")

#### 4.3 Empty States com Personalidade
**Inspiração:** Mailchimp, Notion

Cada empty state deve ter:
- Ilustração SVG minimalista
- Título empático
- Descrição útil
- CTA claro
- Animação sutil

---

### FASE 5: INTELIGÊNCIA E ANALYTICS (Sprint 5)
**Objetivo:** Insights acionáveis

#### 5.1 Financial Wellness Dashboard
**Inspiração:** Healthie, athenahealth

**Métricas:**
- Faturamento por período
- Ticket médio por procedimento
- Taxa de inadimplência
- Projeção de receita
- Comparativo YoY

#### 5.2 Patient Insights
**Inspiração:** Epic MyChart Central

- Taxa de retorno de pacientes
- NPS automatizado
- Alertas de pacientes em risco
- Histórico de engagement

---

## CHECKLIST DE QUALIDADE

### Antes de cada deploy:
- [ ] WCAG 2.1 AA compliance
- [ ] Dark mode testado em TODAS as telas
- [ ] Mobile responsivo testado
- [ ] Loading states em todas as ações async
- [ ] Error states com recovery path
- [ ] Empty states informativos
- [ ] Keyboard navigation funcional
- [ ] Screen reader testado

### Padrões de código:
- [ ] Nenhum `bg-white` ou `text-gray-*` hardcoded
- [ ] Todos os tokens do design system
- [ ] Nenhum `console.log` em produção
- [ ] Nenhum `alert()` - usar toast
- [ ] TypeScript strict mode

---

### FASE 6: WHATSAPP BUSINESS API - JÁ IMPLEMENTADO!
**Status:** 100% do código pronto, falta apenas configuração/deploy

#### 6.1 O que JÁ EXISTE:
| Arquivo | Funcionalidade |
|---------|----------------|
| `functions/src/whatsapp/client.ts` | WhatsApp Cloud API v21.0 - sendTemplateMessage, sendTextMessage, markAsRead |
| `functions/src/whatsapp/templates.ts` | 3 templates: consulta_lembrete_24h, consulta_lembrete_2h, consulta_confirmacao |
| `functions/src/whatsapp/webhook.ts` | Webhook completo - verificação Meta, processamento de respostas, atualização automática |
| `functions/src/scheduler/reminders.ts` | Schedulers: sendReminders24h (every 1h), sendReminders2h (every 30min) |
| `functions/src/scheduler/triggers.ts` | Triggers: onAppointmentCreated, onAppointmentUpdated |

#### 6.2 O que FALTA (apenas configuração):
```bash
# 1. Configurar secrets no Firebase:
firebase functions:secrets:set WHATSAPP_TOKEN
firebase functions:secrets:set WHATSAPP_PHONE_NUMBER_ID
firebase functions:secrets:set WHATSAPP_VERIFY_TOKEN

# 2. Deploy das functions:
cd functions && npm run deploy

# 3. Configurar Webhook URL no Meta Business:
# https://[project-id].cloudfunctions.net/whatsappWebhook
```

**Templates no código (precisam estar aprovados no Meta):**
- [x] `consulta_confirmacao` - Confirmação ao agendar
- [x] `consulta_lembrete_24h` - Lembrete 24h antes
- [x] `consulta_lembrete_2h` - Lembrete 2h antes

---

### FASE 7: PORTAL DO PACIENTE COMPLETO (Sprint 7-8)
**Objetivo:** Self-service completo para pacientes

#### 7.1 Autenticação Segura
**Inspiração:** Epic MyChart, SMART on FHIR

**Stack:**
- Firebase Auth (já configurado)
- OAuth 2.0 para apps terceiros
- Magic Link (sem senha)
- Biometric login (mobile)

**Arquivos:**
- `/src/pages/patient-portal/Login.tsx` - Login paciente
- `/src/pages/patient-portal/MagicLink.tsx` - Link mágico
- `/src/contexts/PatientAuthContext.tsx` - Auth separado

#### 7.2 Features do Portal
**Inspiração:** MyChart (90.2 KLAS), OnPatient

```
┌─────────────────────────────────────────────────────────────┐
│  PORTAL DO PACIENTE - Clínica Genesis                       │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Olá, Maria! Sua próxima consulta é em 3 dias.       │  │
│  │  [Ver Detalhes]  [Reagendar]                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Consultas  │  │  Histórico  │  │  Receitas   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Exames     │  │  Mensagens  │  │  Financeiro │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

**Funcionalidades:**
- [ ] Dashboard personalizado
- [ ] Histórico de consultas
- [ ] Resultados de exames (PDF/visualização)
- [ ] Receitas e prescrições
- [ ] Mensagens seguras com médico
- [ ] Agendamento online
- [ ] Pagamentos e faturas
- [ ] Teleconsulta integrada
- [ ] Dependentes (filhos/idosos)

**Arquivos:**
- `/src/pages/patient-portal/Dashboard.tsx`
- `/src/pages/patient-portal/Appointments.tsx`
- `/src/pages/patient-portal/MedicalRecords.tsx`
- `/src/pages/patient-portal/LabResults.tsx`
- `/src/pages/patient-portal/Prescriptions.tsx`
- `/src/pages/patient-portal/Messages.tsx`
- `/src/pages/patient-portal/Billing.tsx`
- `/src/pages/patient-portal/Telehealth.tsx`

---

### FASE 8: GERAÇÃO XML TISS REAL (Sprint 9)
**Objetivo:** Faturamento eletrônico com convênios

#### 8.1 Implementação TISS 4.01.00
**Padrão ANS obrigatório desde março/2023**

**Tipos de Guia suportados:**
- Guia de Consulta
- Guia SP/SADT (Serviços Profissionais/Diagnóstico)
- Guia de Honorários
- Guia de Internação
- Resumo de Internação

**Arquivos:**
- `/src/services/tiss/tiss.service.ts` - Geração XML
- `/src/services/tiss/schemas/` - XSD schemas ANS
- `/src/services/tiss/validators/` - Validação prévia
- `/src/services/tiss/templates/` - Templates por tipo
- `/functions/src/tiss/generate-xml.ts` - Cloud Function

#### 8.2 Estrutura XML Guia Consulta
```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<ans:mensagemTISS xmlns:ans="http://www.ans.gov.br/padroes/tiss/schemas">
  <ans:cabecalho>
    <ans:identificacaoTransacao>
      <ans:tipoTransacao>ENVIO_LOTE_GUIAS</ans:tipoTransacao>
      <ans:sequencialTransacao>1</ans:sequencialTransacao>
      <ans:dataRegistroTransacao>2025-01-15</ans:dataRegistroTransacao>
    </ans:identificacaoTransacao>
    <ans:versaoPadrao>4.01.00</ans:versaoPadrao>
  </ans:cabecalho>
  <ans:prestadorParaOperadora>
    <ans:loteGuias>
      <ans:guiaConsulta>
        <!-- Dados do beneficiário -->
        <!-- Dados do contratado -->
        <!-- Dados do atendimento -->
      </ans:guiaConsulta>
    </ans:loteGuias>
  </ans:prestadorParaOperadora>
</ans:mensagemTISS>
```

#### 8.3 Workflow de Faturamento
```
1. Consulta finalizada
   ↓
2. Formulário TISS preenchido (já existe)
   ↓
3. Validação dos campos obrigatórios
   ↓
4. Geração XML conforme schema ANS
   ↓
5. Validação XML contra XSD
   ↓
6. Hash MD5 do arquivo
   ↓
7. Download ou envio direto
   ↓
8. Registro no histórico
```

**Features:**
- [ ] Validação prévia (antes de gerar)
- [ ] Geração XML compliant ANS 4.01.00
- [ ] Validador integrado (XSD)
- [ ] Preview da guia (visual)
- [ ] Download XML + PDF
- [ ] Histórico de envios
- [ ] Controle de glosas
- [ ] Integração com convênios (webservice)

---

## CRONOGRAMA E PROGRESSO

| Fase | Status | Prioridade |
|------|--------|------------|
| Fase 1: Fundação Premium | ✅ COMPLETO (22/12/2024) | 🔴 CRÍTICA |
| Fase 2: Experiência Paciente | ✅ COMPLETO (22/12/2024) | 🔴 CRÍTICA |
| Fase 3: Documentação AI | ✅ COMPLETO (22/12/2024) | 🟡 ALTA |
| Fase 4: Design System | ⏳ PENDENTE | 🟡 ALTA |
| Fase 5: Analytics | ⏳ PENDENTE | 🟢 MÉDIA |
| Fase 6: WhatsApp Business API | ✅ CÓDIGO PRONTO (falta deploy) | 🔴 CRÍTICA |
| Fase 7: Portal do Paciente | ⏳ PENDENTE | 🔴 CRÍTICA |
| Fase 8: TISS XML Real | ⏳ PENDENTE | 🟡 ALTA |

**Progresso Geral:** 3/8 fases completas (37.5%)

---

## REFERÊNCIAS

### Plataformas Analisadas
- [Epic MyChart Best in KLAS 2025](https://www.techtarget.com/PatientEngagement/news/366618817/Epic-leads-2025-Best-in-KLAS-for-MyChart-patient-portal)
- [SimplePractice Features](https://www.simplepractice.com/features/)
- [Jane App Review 2025](https://www.medesk.net/en/blog/jane-app-review/)
- [Klara Patient Communication](https://www.klara.com/)
- [Elation Health AI Features](https://www.elationhealth.com/)
- [DrChrono Mobile EHR](https://www.drchrono.com/mobile-ipad-ehr-app/)
- [Carbon Health AI Charting](https://www.businesswire.com/news/home/20230605005211/en/Carbon-Health-Launches-AI-Charting)
- [Zocdoc UX Case Study](https://usabilitygeek.com/ux-case-study-zocdoc-mobile-app/)
- [Healthie Nutrition Platform](https://www.gethealthie.com/nutrition)
- [athenahealth Summer 2025](https://www.athenahealth.com/resources/blog/athenaone-summer-2025-update)

### UX/UI Design
- [Healthcare UX Trends 2025](https://www.webstacks.com/blog/healthcare-ux-design)
- [50 Healthcare UX/UI Examples](https://www.koruux.com/50-examples-of-healthcare-UI/)
- [Linear Design Trend](https://blog.logrocket.com/ux-design/linear-design/)
- [Skeleton Loading Best Practices](https://www.nngroup.com/articles/skeleton-screens/)
- [Healthcare Dashboard Design](https://www.thinkitive.com/blog/best-practices-in-healthcare-dashboard-design/)

### AI & Documentation
- [AI Ambient Scribe Guide 2025](https://www.scribehealth.ai/blog/what-is-ambient-voice-technology-a-complete-guide-for-ai-medical-scribes-in-2025)
- [Abridge Best in KLAS](https://catalyst.nejm.org/doi/full/10.1056/CAT.25.0040)

### WhatsApp Business API
- [WhatsApp for Healthcare Guide](https://www.wati.io/blog/whatsapp-for-healthcare-how-medical-institutions-can-use-it/)
- [97% médicos Brasil usam WhatsApp](https://respond.io/blog/whatsapp-for-healthcare)

### TISS Brasil
- [Padrão TISS ANS Oficial](https://www.gov.br/ans/pt-br/assuntos/prestadores/padrao-para-troca-de-informacao-de-saude-suplementar-2013-tiss)
- [TISS Janeiro 2025](https://www.gov.br/ans/pt-br/assuntos/prestadores/padrao-para-troca-de-informacao-de-saude-suplementar-2013-tiss/padrao-tiss-janeiro-2025)

---

## RESULTADO ESPERADO

Após implementação completa:

### UX & Design
1. **UX Score** comparável a SimplePractice/Jane App/Zocdoc
2. **Onboarding** em menos de 3 minutos
3. **Ações principais** em 3 taps ou menos
4. **Dark mode** 100% funcional em todas as telas
5. **Accessibility** WCAG 2.1 AA certified

### Engagement
6. **No-show rate** reduzido em 30-60% com lembretes WhatsApp
7. **NPS** acima de 60 (nível enterprise)
8. **Patient adoption** 80%+ (benchmark Klara)

### Operacional
9. **Documentação** 50% mais rápida com AI Scribe
10. **Faturamento TISS** automatizado e compliant ANS
11. **Portal do paciente** self-service completo

### Técnico
12. **Zero console.logs** em produção
13. **TypeScript strict** sem erros
14. **Design tokens** 100% consistentes
15. **Mobile-first** responsive em todos dispositivos

---

*"No matter how much power we put into it, it needs to be EASY"* - Epic Systems

*"A design is only a reference, never any deliverable itself"* - Karri Saarinen, Linear
