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

### FASE 4: DESIGN SYSTEM PREMIUM (Sprint 4) ✅ COMPLETO
**Objetivo:** Consistência visual de nível Linear/Stripe
**Status:** Implementado em 22/12/2024

**Entregas:**
- [x] Micro-interações premium (hover lift, active scale, focus ring)
- [x] Card premium com shadow transitions
- [x] Button com micro-animações (scale, translate-y)
- [x] Progress components (ProgressBar, ProgressCircular, LoadingDots, LoadingSpinner, StepProgress)
- [x] EmptyState com ilustrações SVG animadas (6 tipos)
- [x] Skeleton loading com shimmer animation
- [x] Glass morphism, glow effects, gradient borders
- [x] Stagger animations para listas

#### 4.1 Micro-interações ✅
**Inspiração:** Linear, Stripe

**Implementado em `index.css`:**
```css
/* Hover premium - já no Button.tsx e Card.tsx */
.card-premium { hover:translateY(-2px), shadow-lg }
.interactive { hover:translateY(-1px), active:scale(0.98) }
.focus-ring { focus-visible:ring-2 ring-offset-2 }
.glow-primary { hover:shadow com cor primária }
```

**Componentes atualizados:**
- `Button.tsx`: hover:scale-[1.02], active:scale-[0.98], translateY
- `Card.tsx`: interactive mode com hover lift e focus ring

#### 4.2 Loading States Premium ✅
**Inspiração:** Carbon Design System

**Novo componente: `/src/design-system/components/Progress.tsx`**
- [x] ProgressBar - linear com valor ou indeterminate
- [x] ProgressCircular - circular com SVG animado
- [x] LoadingDots - dots bouncing
- [x] LoadingSpinner - spinner SVG
- [x] StepProgress - steps de wizard com checkmarks

**Existentes:**
- [x] Skeleton.tsx com shimmer animation (já implementado)

#### 4.3 Empty States com Personalidade ✅
**Inspiração:** Mailchimp, Notion

**Já implementado: `/src/components/ui/EmptyState.tsx`**
- [x] 6 ilustrações SVG minimalistas (documents, search, success, calendar, patients, inbox)
- [x] Título empático configurável
- [x] Descrição útil
- [x] CTA com ação
- [x] Animação float sutil

---

### FASE 5: INTELIGÊNCIA E ANALYTICS (Sprint 5) ✅ COMPLETO
**Objetivo:** Insights acionáveis
**Status:** Implementado em 22/12/2024

**Entregas:**
- [x] useFinancialWellness hook - métricas financeiras avançadas
- [x] usePatientInsights hook - retenção, NPS, engajamento
- [x] FinancialWellness component - dashboard visual premium
- [x] PatientInsights component - insights de pacientes
- [x] Analytics page - página unificada com tabs
- [x] Rota /analytics configurada + link no Sidebar

#### 5.1 Financial Wellness Dashboard ✅
**Inspiração:** Healthie, athenahealth

**Métricas implementadas:**
- [x] Health Score financeiro (0-100) com breakdown
- [x] Ticket médio por procedimento com ranking
- [x] Taxa de inadimplência com aging (1-30d, 31-60d, 61-90d, 90+d)
- [x] Projeção de receita (mensal, trimestral, anual)
- [x] Comparativo YoY com trend indicators
- [x] Recomendações automáticas baseadas nos dados

**Arquivos:**
- `/src/hooks/useFinancialWellness.ts` - Hook de métricas
- `/src/components/analytics/FinancialWellness.tsx` - Componente visual

#### 5.2 Patient Insights ✅
**Inspiração:** Epic MyChart Central

**Métricas implementadas:**
- [x] Taxa de retorno de pacientes
- [x] NPS automatizado com promoters/passives/detractors
- [x] Alertas de pacientes em risco (no_return, missed_appointments)
- [x] Métricas de engajamento (confirmação, no-show, canais)
- [x] Demographics (idade, gênero, convênio)
- [x] Feedback recente

**Arquivos:**
- `/src/hooks/usePatientInsights.ts` - Hook de métricas
- `/src/components/analytics/PatientInsights.tsx` - Componente visual
- `/src/pages/Analytics.tsx` - Página unificada

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

### FASE 8: CONVÊNIOS E TISS - PESQUISA PROFUNDA (Sprint 9-10)
**Objetivo:** Pesquisa completa da legislação e requisitos técnicos para faturamento eletrônico
**Status:** 🔴 REQUER PESQUISA ANTES DE IMPLEMENTAÇÃO

> ⚠️ **IMPORTANTE:** Esta fase NÃO é implementação direta. É pesquisa profunda de legislação,
> documentação técnica e requisitos específicos de cada operadora. Convênios de saúde no Brasil
> são regulamentados pela ANS e têm requisitos legais estritos.

#### 8.1 Escopo de Pesquisa

**Operadoras Prioritárias (Mercado Brasil):**
| Operadora | Tipo | Prioridade | Notas |
|-----------|------|------------|-------|
| **UNIMED** | Cooperativa médica | 🔴 CRÍTICA | Maior rede do Brasil, ~18M beneficiários |
| **GEAP** | Autogestão federal | 🔴 CRÍTICA | Servidores públicos federais |
| **CASSI** | Autogestão | 🟡 ALTA | Funcionários Banco do Brasil |
| **POSTAL SAÚDE** | Autogestão | 🟡 ALTA | Funcionários Correios |
| **FAPES** | Autogestão | 🟢 MÉDIA | Funcionários BNDES |
| **SulAmérica** | Seguradora | 🟡 ALTA | Grande operadora privada |
| **Bradesco Saúde** | Seguradora | 🟡 ALTA | Grande operadora privada |
| **Amil** | Medicina de grupo | 🟡 ALTA | UnitedHealth Group |

#### 8.2 Pesquisa Obrigatória - Legislação ANS

**Documentos a estudar:**
- [ ] RN (Resolução Normativa) vigente sobre TISS
- [ ] Versão atual do padrão TISS (verificar se ainda é 4.01.00 ou houve atualização)
- [ ] Componentes obrigatórios: Organizacional, Conteúdo e Estrutura, Representação de Conceitos, Comunicação
- [ ] Prazos legais para envio de guias
- [ ] Penalidades por não conformidade
- [ ] Regras de glosas e recursos

**Fontes oficiais:**
- [ ] Portal ANS: https://www.gov.br/ans/
- [ ] Padrão TISS oficial: https://www.gov.br/ans/pt-br/assuntos/prestadores/padrao-tiss
- [ ] Terminologia Unificada em Saúde Suplementar (TUSS)
- [ ] Tabelas de domínio ANS

#### 8.3 Pesquisa Técnica - Por Operadora

**Para CADA operadora, pesquisar:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    CHECKLIST POR OPERADORA                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CREDENCIAMENTO                                                  │
│  [ ] Processo de credenciamento de prestador                    │
│  [ ] Documentação exigida                                       │
│  [ ] Prazos de aprovação                                        │
│  [ ] Códigos de identificação (CNES, registro ANS)              │
│                                                                  │
│  INTEGRAÇÃO TÉCNICA                                             │
│  [ ] Webservice disponível? URL?                                │
│  [ ] Autenticação (certificado digital, token, usuário/senha)  │
│  [ ] Ambiente de homologação                                    │
│  [ ] Ambiente de produção                                       │
│  [ ] Documentação técnica da API                                │
│  [ ] Suporte técnico (contato, SLA)                            │
│                                                                  │
│  GUIAS ACEITAS                                                  │
│  [ ] Guia de Consulta                                           │
│  [ ] Guia SP/SADT                                               │
│  [ ] Guia de Honorários                                         │
│  [ ] Outras guias específicas                                   │
│                                                                  │
│  PARTICULARIDADES                                               │
│  [ ] Campos obrigatórios além do padrão TISS                   │
│  [ ] Regras específicas de autorização prévia                  │
│  [ ] Prazos de envio específicos                               │
│  [ ] Formato de retorno (glosas, pagamentos)                   │
│  [ ] Portal do prestador (acesso manual)                       │
│                                                                  │
│  FINANCEIRO                                                     │
│  [ ] Tabela de procedimentos aceita (TUSS, CBHPM, própria)     │
│  [ ] Valores de reembolso                                       │
│  [ ] Prazo de pagamento                                         │
│  [ ] Processo de contestação de glosas                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### 8.4 Pesquisa - Certificação Digital

**Requisitos de certificado:**
- [ ] Tipo de certificado exigido (e-CPF, e-CNPJ, ICP-Brasil)
- [ ] Cadeia de certificação válida
- [ ] Autoridades certificadoras aceitas
- [ ] Processo de assinatura XML (XMLDSig, XAdES)
- [ ] Renovação e validade

**Perguntas a responder:**
- O certificado do médico (e-CPF) é suficiente ou precisa do e-CNPJ da clínica?
- Cada profissional precisa de certificado individual?
- Como funciona a delegação de assinatura?

#### 8.5 Pesquisa - UNIMED (Prioridade Máxima)

**Estrutura UNIMED:**
- [ ] Entender federação (UNIMED local vs nacional)
- [ ] Cada UNIMED local tem requisitos diferentes?
- [ ] Portal Unimed Prestador: funcionalidades
- [ ] API/Webservice Unimed: documentação
- [ ] Intercâmbio entre UNIMEDs

**Contatos a buscar:**
- [ ] Departamento de credenciamento UNIMED local
- [ ] Suporte técnico para integrações
- [ ] Documentação técnica oficial

#### 8.6 Pesquisa - Convênios Federais (GEAP, CASSI, etc.)

**Particularidades setor público:**
- [ ] Processo licitatório para credenciamento?
- [ ] Requisitos adicionais de compliance
- [ ] Sistemas específicos (SIAPE, etc.)
- [ ] Regras de ressarcimento ao SUS

#### 8.7 Deliverables da Pesquisa

**Ao final desta fase, ter documentado:**

1. **Relatório de Viabilidade**
   - Complexidade técnica real
   - Esforço estimado de implementação
   - Riscos identificados
   - Recomendação go/no-go

2. **Matriz de Requisitos por Operadora**
   - Tabela comparativa
   - Campos obrigatórios
   - Diferenças entre operadoras

3. **Arquitetura Técnica Proposta**
   - Baseada em requisitos REAIS pesquisados
   - Não em suposições

4. **Roadmap de Implementação**
   - Faseamento por operadora
   - MVP: qual operadora primeiro?
   - Critérios de sucesso

5. **Contatos e Recursos**
   - Lista de contatos em cada operadora
   - Documentação coletada
   - Acessos a portais de homologação

#### 8.8 Fontes de Pesquisa

**Oficiais:**
- ANS: https://www.gov.br/ans/
- TISS: https://www.gov.br/ans/pt-br/assuntos/prestadores/padrao-tiss
- DATASUS: https://datasus.saude.gov.br/

**Operadoras:**
- UNIMED Brasil: https://www.unimed.coop.br/
- GEAP: https://www.geap.org.br/
- CASSI: https://www.cassi.com.br/

**Comunidade/Técnico:**
- Grupos de desenvolvedores de sistemas de saúde
- GitHub: projetos open-source de TISS
- Stack Overflow: questões sobre integração

**Consultorias especializadas:**
- Empresas que já fazem integração TISS
- Contadores especializados em saúde
- Advogados de direito em saúde

#### 8.9 Timeline de Pesquisa

```
Semana 1-2: Legislação ANS e padrão TISS atual
Semana 3-4: Pesquisa UNIMED (maior prioridade)
Semana 5-6: Pesquisa GEAP e convênios federais
Semana 7-8: Outras operadoras + consolidação
Semana 9-10: Relatório final + arquitetura proposta
```

#### 8.10 Critérios de Sucesso da Pesquisa

- [ ] Documentação completa do padrão TISS atual
- [ ] Requisitos técnicos de pelo menos 3 operadoras
- [ ] Acesso a ambiente de homologação de 1+ operadora
- [ ] Arquitetura técnica validada com especialista
- [ ] Estimativa realista de esforço de implementação
- [ ] Decisão informada sobre escopo do MVP

---

### FASE 9: N8N WORKFLOW AUTOMATION (Sprint 10)
**Objetivo:** Automação de processos e integrações externas via n8n

#### 9.1 Arquitetura de Integração
**n8n como hub central de automações**

```
┌─────────────────────────────────────────────────────────────────┐
│                        n8n Workflow Engine                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │  Triggers    │    │  Processors  │    │  Actions     │      │
│  │  ──────────  │    │  ──────────  │    │  ──────────  │      │
│  │  • Webhook   │───▶│  • Transform │───▶│  • Firebase  │      │
│  │  • Schedule  │    │  • Filter    │    │  • WhatsApp  │      │
│  │  • Firestore │    │  • AI/LLM    │    │  • Email     │      │
│  │  • HTTP      │    │  • Validate  │    │  • Slack     │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Firestore  │    │  Cloud Functions │    │  External APIs  │
│  (eventos)  │    │  (processamento) │    │  (integrações)  │
└─────────────┘    └─────────────────┘    └─────────────────┘
```

#### 9.2 Workflows Prioritários

**1. Agendamento Inteligente**
```
Trigger: Novo agendamento no Firestore
   ↓
Verificar conflitos de horário
   ↓
Enriquecer dados do paciente
   ↓
Enviar confirmação (WhatsApp + Email)
   ↓
Criar evento no Google Calendar
   ↓
Notificar profissional (Slack/Push)
```

**2. Follow-up Pós-Consulta**
```
Trigger: Consulta finalizada (status = FINISHED)
   ↓
Aguardar 24h (delay node)
   ↓
Enviar pesquisa NPS (WhatsApp)
   ↓
Coletar resposta via webhook
   ↓
Atualizar score no Firestore
   ↓
Se NPS < 7: Alertar gestor
```

**3. Lembretes de Retorno**
```
Trigger: Schedule (diário às 9h)
   ↓
Buscar pacientes sem consulta há 90+ dias
   ↓
Filtrar por condições crônicas
   ↓
Enviar lembrete personalizado
   ↓
Registrar contato no histórico
```

**4. Integração com Labs**
```
Trigger: Webhook do laboratório
   ↓
Validar assinatura/origem
   ↓
Fazer parse do resultado (HL7/PDF)
   ↓
Anexar ao prontuário do paciente
   ↓
Notificar médico se valores críticos
   ↓
Notificar paciente que resultado chegou
```

**5. Sincronização de Agenda**
```
Trigger: Mudança em appointment
   ↓
Sync bidirecional Google Calendar
   ↓
Atualizar disponibilidade
   ↓
Recalcular slots livres
```

**6. Backup e Auditoria**
```
Trigger: Schedule (diário às 2h)
   ↓
Export dados críticos
   ↓
Criptografar e enviar para storage
   ↓
Gerar log de auditoria
   ↓
Notificar admin se falha
```

#### 9.3 Setup Técnico

**Opção A: n8n Cloud (Recomendado para MVP)**
```bash
# Criar conta em n8n.io
# Configurar webhooks apontando para:
https://[n8n-instance].n8n.cloud/webhook/[workflow-id]
```

**Opção B: n8n Self-Hosted (Docker)**
```yaml
# docker-compose.yml
version: '3.8'
services:
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=secure_password
      - WEBHOOK_URL=https://n8n.clinicagenesis.com.br
    volumes:
      - n8n_data:/home/node/.n8n
```

**Opção C: Cloud Run (GCP)**
```bash
gcloud run deploy n8n \
  --image n8nio/n8n \
  --port 5678 \
  --memory 1Gi \
  --allow-unauthenticated
```

#### 9.4 Integrações Disponíveis

| Categoria | Serviço | Uso no Genesis |
|-----------|---------|----------------|
| **Comunicação** | WhatsApp Business | Lembretes, confirmações |
| | Twilio SMS | Fallback SMS |
| | SendGrid/Mailgun | Emails transacionais |
| | Slack | Alertas internos |
| **Calendário** | Google Calendar | Sync agenda |
| | Cal.com | Booking público |
| **Pagamentos** | Stripe | Webhooks de pagamento |
| | Pix (bancos) | Confirmação automática |
| **Storage** | Google Cloud Storage | Backup, arquivos |
| | Firebase Storage | Anexos |
| **AI/ML** | OpenAI | Processamento NLP |
| | Vertex AI | Análise de exames |
| **Healthcare** | HL7 FHIR | Interoperabilidade |
| | Labs APIs | Resultados de exames |

#### 9.5 Segurança

**Credenciais:**
- [ ] Usar n8n Credentials para armazenar secrets
- [ ] Nunca expor tokens em workflows
- [ ] Rotacionar API keys regularmente

**Webhooks:**
- [ ] Validar origem das requisições
- [ ] Implementar HMAC signature
- [ ] Rate limiting por IP

**Dados Sensíveis:**
- [ ] Não logar dados de pacientes
- [ ] Criptografar payloads sensíveis
- [ ] Compliance LGPD/HIPAA

#### 9.6 Arquivos

**Cloud Functions (triggers para n8n):**
```
functions/src/n8n/
├── webhooks.ts          # Receber callbacks do n8n
├── triggers.ts          # Enviar eventos para n8n
└── validators.ts        # Validação de requests
```

**Frontend (configuração):**
```
src/components/settings/
├── N8NSettings.tsx      # UI de configuração
└── WorkflowStatus.tsx   # Status dos workflows
```

**Features:**
- [ ] Trigger de eventos para n8n via Cloud Functions
- [ ] Webhook receiver para callbacks
- [ ] UI de configuração de workflows
- [ ] Dashboard de status/logs
- [ ] Templates de workflows prontos
- [ ] Documentação de integrações

---

## CRONOGRAMA E PROGRESSO

| Fase | Status | Prioridade |
|------|--------|------------|
| Fase 1: Fundação Premium | ✅ COMPLETO (22/12/2024) | 🔴 CRÍTICA |
| Fase 2: Experiência Paciente | ✅ COMPLETO (22/12/2024) | 🔴 CRÍTICA |
| Fase 3: Documentação AI | ✅ COMPLETO (22/12/2024) | 🟡 ALTA |
| Fase 4: Design System | ✅ COMPLETO (22/12/2024) | 🟡 ALTA |
| Fase 5: Analytics | ✅ COMPLETO (22/12/2024) | 🟢 MÉDIA |
| Fase 6: WhatsApp Business API | ✅ COMPLETO (22/12/2024) | 🔴 CRÍTICA |
| Fase 7: Portal do Paciente | ✅ COMPLETO (22/12/2024) | 🔴 CRÍTICA |
| Fase 8: Convênios/TISS - PESQUISA | 🔴 REQUER PESQUISA PROFUNDA | 🔴 CRÍTICA |
| Fase 9: n8n Workflow Automation | ⏳ PENDENTE | 🟡 ALTA |

**Progresso Geral:** 7/9 fases completas (77.8%)

> ⚠️ **NOTA FASE 8:** Convênios brasileiros (UNIMED, GEAP, etc.) exigem pesquisa profunda
> de legislação ANS, TISS, certificação digital e requisitos específicos de cada operadora.
> NÃO implementar sem documentação completa.

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

### n8n & Workflow Automation
- [n8n Official Docs](https://docs.n8n.io/)
- [n8n Healthcare Templates](https://n8n.io/workflows/?categories=Healthcare)
- [n8n Firebase Integration](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.firebase/)
- [n8n WhatsApp Integration](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.whatsapp/)
- [n8n Webhook Security](https://docs.n8n.io/hosting/security/)
- [n8n Self-Hosting Guide](https://docs.n8n.io/hosting/)

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

### Convênios Brasil - Legislação e TISS (PESQUISA OBRIGATÓRIA)
**ANS (Agência Nacional de Saúde Suplementar):**
- [Portal ANS Oficial](https://www.gov.br/ans/)
- [Padrão TISS ANS](https://www.gov.br/ans/pt-br/assuntos/prestadores/padrao-tiss)
- [Terminologia TUSS](https://www.gov.br/ans/pt-br/assuntos/prestadores/tuss)
- [Resoluções Normativas](https://www.gov.br/ans/pt-br/regulacao)

**Operadoras Prioritárias:**
- [UNIMED Brasil](https://www.unimed.coop.br/)
- [GEAP Autogestão](https://www.geap.org.br/)
- [CASSI](https://www.cassi.com.br/)

**Certificação Digital ICP-Brasil:**
- [ITI - Instituto Nacional de TI](https://www.gov.br/iti/)
- [Certificados e-CPF/e-CNPJ](https://www.gov.br/iti/pt-br/assuntos/certificado-digital)

**Ferramentas e Cadastros:**
- [DATASUS](https://datasus.saude.gov.br/)
- [CNES - Cadastro Nacional](https://cnes.datasus.gov.br/)
- [Validador TISS](https://www.validadortiss.com.br/)

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
