# ClinicaGenesisOS: Do Demo ao MVP Production-Ready

## Executive Summary

Transformar o demo atual (React + localStorage) em um MVP production-ready usando o ecossistema Google (Firebase + Cloud Run + Vertex AI), com foco em **clínicas pequenas e médias**, **multi-especialidade**, e **diferenciação via AI** (WhatsApp + ambient documentation).

---

## 📊 STATUS DE IMPLEMENTAÇÃO

> Última atualização: 2025-12-17

| Fase | Status | Progresso |
|------|--------|-----------|
| **Fase 0: Preparação** | ✅ Completa | 100% |
| **Fase 1.1: Autenticação** | ✅ Completa | 100% |
| **Fase 1.2: Backend API** | ⏸️ Adiada | N/A |
| **Fase 1.3: Banco de Dados** | ✅ Completa | 100% |
| **Fase 2: Core Features** | 🔲 Pendente | 0% |
| **Fase 3: AI Integration** | 🔲 Pendente | 0% |
| **Fase 4: Financeiro** | 🔲 Pendente | 0% |
| **Fase 5: Polish & Launch** | 🔲 Pendente | 0% |

### Detalhes das Fases Completas

#### ✅ Fase 0: Preparação (Completada em 2025-12-15)
- Firebase project criado: `clinica-genesis-os-e689e`
- Tailwind migrado de CDN para build local
- ESLint + Prettier configurados
- Vitest + React Testing Library configurados
- README.md atualizado com instruções
- Estrutura de pastas reorganizada

#### ✅ Fase 1.1: Autenticação (Completada em 2025-12-16)
- Firebase Auth implementado (email/senha + Google OAuth)
- Proteção de rotas com `ProtectedRoute`
- Contexto de autenticação (`AuthContext`)
- Hook `useAuth` com todas operações
- Páginas Login e Register com UI premium
- Multi-tenancy implementado (clinicId em todos os docs)
- **100% de cobertura de testes** (75 testes passando)

**Arquivos criados:**
- `src/hooks/useAuth.ts` - Hook de autenticação
- `src/contexts/AuthContext.tsx` - Provider de contexto
- `src/components/auth/ProtectedRoute.tsx` - Proteção de rotas
- `src/pages/auth/Login.tsx` - Página de login
- `src/pages/auth/Register.tsx` - Página de registro
- `src/__tests__/hooks/useAuth.test.ts` - 23 testes
- `src/__tests__/contexts/AuthContext.test.tsx` - 6 testes
- `src/__tests__/components/auth/ProtectedRoute.test.tsx` - 6 testes
- `src/__tests__/pages/auth/Login.test.tsx` - 17 testes
- `src/__tests__/pages/auth/Register.test.tsx` - 21 testes

#### ✅ Fase 1.3: Banco de Dados (Completada em 2025-12-17)
- Schema Firestore com subcollections multi-tenant
- Security Rules deployed em produção
- Índices configurados para queries
- Migração completa de Zustand para Firestore
- Real-time subscriptions funcionando
- Seed data para novas clínicas
- **89 testes passando** (14 novos para patient.service)

**Estrutura Firestore:**
```
/clinics/{clinicId}
  /patients/{patientId}
  /appointments/{appointmentId}
  /records/{recordId}
/users/{userId}
```

**Arquivos criados:**
- `src/services/firestore/` - 6 services (clinic, patient, appointment, record, user, seed)
- `src/hooks/usePatients.ts`, `usePatient.ts`, `useAppointments.ts`, `useRecords.ts`
- `src/contexts/ClinicContext.tsx` - Multi-tenancy provider
- `src/pages/Onboarding.tsx` - Wizard de configuração
- `firestore.rules` - Security rules (deployed)
- `firestore.indexes.json` - Índices
- `src/__tests__/services/firestore/patient.service.test.ts` - 14 testes

**Arquivos removidos:**
- `src/store/useStore.ts` - Zustand removido completamente

#### ⏸️ Fase 1.2: Backend API (Adiada)
> **Decisão**: Adiada para pós-MVP. Firestore com Security Rules atende as necessidades atuais.
> Será implementada quando precisarmos de: webhooks complexos, integrações externas (WhatsApp API), ou lógica de negócio server-side.

---

## PARTE 1: AUDITORIA DO PROJETO ATUAL

### Stack Atual
| Componente | Tecnologia | Status |
|------------|------------|--------|
| Frontend | React 19 + TypeScript | ✅ Sólido |
| Routing | React Router 7 | ✅ Moderno |
| State | Firestore + React Hooks | ✅ Real-time sync |
| Styling | Tailwind (build local) | ✅ Configurado |
| Charts | Recharts 3 | ✅ Ok |
| Build | Vite 6 | ✅ Rápido |
| Testing | Vitest + RTL | ✅ 89 testes |
| Backend | Firestore (serverless) | ✅ Multi-tenant |
| Auth | Firebase Auth | ✅ Implementado |
| DB | Firestore | ✅ Production-ready |

### Funcionalidades Implementadas
- ✅ Landing page premium (marketing)
- ✅ Dashboard com KPIs
- ✅ Agenda visual (day view)
- ✅ CRUD de pacientes (Firestore)
- ✅ Prontuário eletrônico (SOAP, prescrição, exames)
- ✅ Plugin system (Medicina/Nutrição/Psicologia)
- ✅ Timeline de eventos
- ⚠️ Financeiro (mock data)
- ⚠️ Relatórios (mock data)
- ✅ Autenticação real (Firebase Auth)
- ✅ Multi-tenancy (clinicId em todas as collections)
- ✅ Onboarding para novas clínicas
- ❌ Integrações externas

### Débitos Técnicos Críticos
1. ~~**Segurança**: Dados sensíveis em localStorage sem criptografia~~ → ✅ Firestore com Security Rules
2. ~~**IDs**: Math.random() - previsível, inseguro~~ → ✅ Firestore auto-generated IDs
3. **Validação**: Sem validação de email/telefone (pendente Zod)
4. **Arquivos grandes**: Landing.tsx (405 linhas) - precisa refatorar
5. ~~**Sem testes**: 0% cobertura~~ → ✅ **89 testes passando**

---

## PARTE 2: ANÁLISE DE MERCADO

### Concorrentes Principais no Brasil

| Software | Foco | Pontos Fortes | Fraquezas |
|----------|------|---------------|-----------|
| **Simples Dental** | Odontologia | Líder LATAM, suporte excelente | Só odonto, caro |
| **Amplimed** | Multi-especialidade | AI para documentação, TISS | Interface datada |
| **iClinic** | Geral | Telemedicina, UX boa | Preço alto para pequenos |
| **Doctoralia** | Marketplace | Base de pacientes enorme | Comissões, dependência |
| **Clinicorp** | Odontologia | Analytics, imaging | Complexo demais |

### Oportunidades de Diferenciação
1. **AI-first**: Concorrentes usam AI como feature, não como core
2. **Preço**: Mercado dominado por soluções caras (R$200-500/mês)
3. **UX**: Maioria tem interface dos anos 2010
4. **WhatsApp nativo**: Poucos integram de verdade
5. **Multi-especialidade flexível**: Plugin system é diferencial

---

## PARTE 3: DORES DOS PROFISSIONAIS

### Recepcionistas/Secretárias (fonte primária de frustração)
| Dor | Impacto | Solução Genesis |
|-----|---------|-----------------|
| Volume de ligações | 60% do tempo em telefone | WhatsApp AI bot |
| Agendamentos manuais | Erros, overbooking | Agenda inteligente com AI |
| No-shows | 15-25% de faltas | Lembretes multi-canal |
| Verificação de convênio | Processo manual demorado | Automação TISS |
| Cobrança | Pacientes devendo | PIX automático + lembretes |

### Médicos/Profissionais de Saúde
| Dor | Impacto | Solução Genesis |
|-----|---------|-----------------|
| Documentação | 5.8h/dia em EHR | AI Scribe (transcrição automática) |
| Burnout | 51% reportam burnout | Reduzir admin em 60% |
| Prontuário lento | Digitação durante consulta | Voice-to-SOAP |
| Prescrição manual | Risco de erros | Templates + validação |

### Estatísticas-Chave
- 89% dos pacientes querem agendamento digital (Experian 2024)
- 60% dos CIOs citam falta de automação como top frustração
- Lembretes WhatsApp reduzem no-shows em 40%
- AI scribes reduzem tempo de documentação em 60%

---

## PARTE 4: AI NO LOOP (EFETIVA, NÃO GIMMICK)

### Implementações de Alto Impacto

#### 1. WhatsApp AI Assistant (Prioridade Máxima)
```
Fluxo:
Paciente → WhatsApp → AI entende intenção →
  - Agendamento: Mostra horários → Confirma
  - FAQ: Responde automaticamente
  - Urgência: Escala para humano
  - Lembrete: Envia 24h e 1h antes
```
**Impacto**: Reduz 65% das ligações, 40% menos no-shows

#### 2. AI Scribe (Ambient Documentation)
```
Fluxo:
Consulta (áudio) → Vertex AI transcreve →
  Gera SOAP estruturado → Médico revisa → Salva no prontuário
```
**Impacto**: Economiza 2h/dia por médico, reduz burnout em 40%

#### 3. Smart Scheduling
```
Fluxo:
Solicitação de horário → AI analisa:
  - Histórico do paciente
  - Padrões de no-show
  - Duração típica do procedimento
→ Sugere melhor horário → Otimiza ocupação
```
**Impacto**: Aumenta ocupação em 15-20%

#### 4. Clinical Decision Support (Fase 2)
```
Fluxo:
Médico digita sintomas → AI sugere:
  - Diagnósticos diferenciais
  - Exames recomendados
  - Alertas de interação medicamentosa
```
**Impacto**: Reduz erros, melhora qualidade

### Tecnologia: Firebase AI Logic + Vertex AI
- **Gemini Pro**: Conversação WhatsApp, SOAP generation
- **Gemini Flash**: Respostas rápidas, triagem
- **Speech-to-Text**: Transcrição de consultas
- Custo: ~$0.001-0.003 por interação (muito acessível)

---

## PARTE 5: IDEIAS DISRUPTIVAS (Simples, Alto Impacto)

### 1. "Zero Telefone" Mode
**Conceito**: Clínica opera 100% sem telefone
- WhatsApp AI para tudo
- Agenda online
- Confirmações automáticas
- **Diferencial**: Nenhum concorrente oferece isso

### 2. "Consulta Invisível"
**Conceito**: Documentação acontece sem o médico perceber
- Microfone ambiente (opt-in do paciente)
- AI transcreve e gera prontuário
- Médico só revisa e assina
- **Diferencial**: Nuance DAX custa $1000+/mês, nós oferecemos incluso

### 3. "Pagamento Sem Fricção"
**Conceito**: Cobrança automatizada pós-consulta
- PIX gerado automaticamente
- Enviado por WhatsApp
- Lembrete se não pagar em 24h
- **Diferencial**: Reduz inadimplência em 50%

### 4. "Paciente Digital Twin"
**Conceito**: Perfil unificado do paciente
- Timeline visual de toda história
- Alertas proativos (exames vencidos, retornos)
- Score de risco baseado em histórico
- **Diferencial**: Visão 360º que ninguém tem

### 5. "Onboarding em 5 Minutos"
**Conceito**: Clínica funcionando em minutos, não dias
- Importa dados de planilha/outro sistema
- Templates prontos por especialidade
- Suporte AI para configuração inicial
- **Diferencial**: Simples Dental leva semanas

---

## PARTE 6: STACK TECNOLÓGICA RECOMENDADA

### Arquitetura Production-Ready

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND                                │
│  React 19 + TypeScript + Vite + Tailwind                    │
│  Firebase App Hosting (CDN global)                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND                                 │
│  Cloud Run (Node.js/Express ou Hono)                        │
│  - REST API                                                 │
│  - WebSocket (real-time)                                    │
│  - Background jobs (Cloud Tasks)                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                              │
│  Firestore (main DB) ─── BigQuery (analytics)               │
│  Cloud Storage (arquivos, imagens)                          │
│  Cloud Healthcare API (FHIR - opcional futuro)              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      AI SERVICES                             │
│  Firebase AI Logic (Gemini SDK)                             │
│  Vertex AI (Speech-to-Text, custom models)                  │
│  Cloud Functions (triggers, webhooks)                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      INTEGRATIONS                            │
│  WhatsApp Business API (via Cloud Functions)                │
│  Stripe/PagSeguro (pagamentos)                              │
│  SendGrid (emails transacionais)                            │
└─────────────────────────────────────────────────────────────┘
```

### Justificativa das Escolhas

| Tecnologia | Por quê? |
|------------|----------|
| **Firebase App Hosting** | Deploy automático, CDN global, SSL grátis, integração GitHub |
| **Cloud Run** | Serverless, escala automática, paga por uso, sem gerenciar servers |
| **Firestore** | Real-time sync, offline-first, HIPAA-eligible, escala infinita |
| **Firebase AI Logic** | SDK simples, Gemini direto do frontend, custo baixo |
| **Cloud Storage** | Imagens, PDFs, backups, integrado com Firestore |
| **WhatsApp Business API** | Oficial, confiável, sem risco de bloqueio |

### LGPD Compliance
- Firestore: BAA disponível (HIPAA-eligible)
- Dados em região São Paulo (southamerica-east1)
- Criptografia em trânsito e em repouso
- Logs de auditoria via Cloud Logging
- Consentimento explícito no cadastro
- Direito ao esquecimento implementável

---

## PARTE 7: ROADMAP DO DEMO AO MVP

### Fase 0: Preparação (Sprint 0) ✅
- [x] Setup projeto Firebase
- [x] Configurar ambiente de desenvolvimento
- [x] Migrar Tailwind de CDN para build
- [x] Setup ESLint + Prettier
- [x] Configurar Vitest para testes
- [x] Criar README.md com instruções

### Fase 1: Infraestrutura Core (Sprints 1-2)

#### 1.1 Autenticação ✅
- [x] Firebase Auth (email/senha + Google)
- [x] Proteção de rotas
- [x] Contexto de usuário
- [x] Multi-tenancy (clinicId em todos os docs)

#### 1.2 Backend API ⏸️ (Adiada)
- [ ] ~~Criar projeto Cloud Run~~ → Adiado
- [ ] ~~API REST~~ → Usando Firestore direto
- [ ] ~~Middleware de autenticação~~ → Security Rules
- [ ] Validação com Zod (mover para Fase 2)

#### 1.3 Banco de Dados ✅
- [x] Schema Firestore definitivo
- [x] Security Rules (deployed)
- [x] Índices para queries
- [x] Migrar dados mock para Firestore

**Arquivos modificados/criados:**
- ~~`store/useStore.ts`~~ → Removido, migrado para Firestore hooks
- `App.tsx` → ClinicProvider adicionado
- `src/services/firestore/*` → 6 services criados
- `src/hooks/use*.ts` → 4 hooks criados

### Fase 2: Core Features Production (Sprints 3-4)

#### 2.1 Agenda Aprimorada
- [ ] Week/Month view
- [ ] Drag-and-drop
- [ ] Recorrência
- [ ] Cores por status/profissional
- [ ] Filtros funcionais

#### 2.2 Pacientes Completo
- [ ] Busca funcional (full-text)
- [ ] Edição de paciente
- [ ] Foto de perfil (upload)
- [ ] Histórico completo

#### 2.3 Prontuário Eletrônico
- [ ] Salvar em Firestore
- [ ] Versionamento de registros
- [ ] Templates por especialidade
- [ ] Anexos (PDFs, imagens)

**Arquivos a modificar:**
- `pages/Agenda.tsx`
- `pages/Patients.tsx`
- `pages/PatientDetails.tsx`
- `plugins/registry.tsx` → refatorar em arquivos separados

### Fase 3: AI Integration (Sprints 5-6)

#### 3.1 WhatsApp Bot
- [ ] Setup WhatsApp Business API
- [ ] Cloud Function para webhook
- [ ] Integração Firebase AI Logic
- [ ] Fluxos: agendamento, FAQ, lembretes
- [ ] Fallback para humano

#### 3.2 Lembretes Automáticos
- [ ] Cloud Scheduler para triggers
- [ ] Template de mensagens
- [ ] Confirmação por resposta
- [ ] Log de entregas

#### 3.3 AI Scribe (MVP básico)
- [ ] Gravação de áudio (browser)
- [ ] Speech-to-Text (Vertex AI)
- [ ] Geração de SOAP (Gemini)
- [ ] Review e edição
- [ ] Salvar no prontuário

**Arquivos novos:**
- `services/whatsapp.ts`
- `services/ai.ts`
- `components/AudioRecorder.tsx`
- `functions/whatsapp-webhook/*`

### Fase 4: Financeiro & Relatórios (Sprints 7-8)

#### 4.1 Financeiro Real
- [ ] Transações CRUD
- [ ] Categorias
- [ ] Relatório de fluxo de caixa
- [ ] Integração com pagamentos

#### 4.2 Relatórios Dinâmicos
- [ ] Dados reais do Firestore
- [ ] Filtros por período
- [ ] Export PDF/Excel
- [ ] Dashboard customizável

#### 4.3 Pagamentos
- [ ] Integração PIX (Stripe ou PagSeguro)
- [ ] Geração automática pós-consulta
- [ ] Envio por WhatsApp
- [ ] Reconciliação

**Arquivos a modificar:**
- `pages/Finance.tsx` → conectar com dados reais
- `pages/Reports.tsx` → queries Firestore

### Fase 5: Polish & Launch (Sprints 9-10)

#### 5.1 UX Refinements
- [ ] Loading states
- [ ] Error boundaries
- [ ] Toast notifications (substituir alert())
- [ ] Confirmações de ações destrutivas
- [ ] Responsividade mobile completa

#### 5.2 Performance
- [ ] Lazy loading de páginas
- [ ] Image optimization
- [ ] Bundle splitting
- [ ] Service worker (offline básico)

#### 5.3 Segurança Final
- [ ] Auditoria de security rules
- [ ] Rate limiting
- [ ] LGPD: consentimento, exportação, exclusão
- [ ] Logs de auditoria

#### 5.4 Deploy
- [ ] Firebase App Hosting configurado
- [ ] Domínio customizado
- [ ] SSL
- [ ] Monitoramento (Cloud Monitoring)
- [ ] Alertas

---

## PARTE 8: ESTRUTURA DE ARQUIVOS MVP

```
ClinicaGenesisOS/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   └── providers.tsx
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── dashboard/
│   │   │   └── Dashboard.tsx
│   │   ├── agenda/
│   │   │   └── Agenda.tsx
│   │   ├── patients/
│   │   │   ├── PatientsList.tsx
│   │   │   ├── PatientDetails.tsx
│   │   │   └── PatientForm.tsx
│   │   ├── records/
│   │   │   ├── MedicalRecord.tsx
│   │   │   └── editors/
│   │   │       ├── SoapEditor.tsx
│   │   │       ├── NutritionEditor.tsx
│   │   │       └── PsychologyEditor.tsx
│   │   ├── finance/
│   │   │   └── Finance.tsx
│   │   └── reports/
│   │       └── Reports.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Toast.tsx
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   ├── patient/
│   │   │   └── Timeline.tsx
│   │   └── ai/
│   │       ├── AudioRecorder.tsx
│   │       └── AIAssistant.tsx
│   ├── services/
│   │   ├── firebase.ts
│   │   ├── auth.ts
│   │   ├── patients.ts
│   │   ├── appointments.ts
│   │   ├── records.ts
│   │   ├── ai.ts
│   │   └── whatsapp.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── usePatients.ts
│   │   ├── useAppointments.ts
│   │   └── useAI.ts
│   ├── types/
│   │   ├── patient.ts
│   │   ├── appointment.ts
│   │   ├── record.ts
│   │   └── clinic.ts
│   └── lib/
│       ├── utils.ts
│       └── validators.ts
├── functions/
│   ├── src/
│   │   ├── whatsapp/
│   │   │   └── webhook.ts
│   │   ├── scheduler/
│   │   │   └── reminders.ts
│   │   └── ai/
│   │       └── transcription.ts
│   └── package.json
├── firestore.rules
├── firestore.indexes.json
├── firebase.json
├── .env.example
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

---

## PARTE 9: MODELO DE PRICING SUGERIDO

| Plano | Preço | Inclui |
|-------|-------|--------|
| **Solo** | R$ 97/mês | 1 profissional, 500 pacientes, agenda, prontuário, WhatsApp lembretes |
| **Clínica** | R$ 247/mês | Até 5 profissionais, ilimitado pacientes, AI scribe, WhatsApp bot, relatórios |
| **Genesis Black** | R$ 497/mês | Até 15 profissionais, tudo + API access, onboarding VIP, suporte prioritário |

**Diferencial competitivo**: WhatsApp AI e AI Scribe inclusos em todos os planos (concorrentes cobram à parte ou não têm).

---

## PARTE 10: MÉTRICAS DE SUCESSO DO MVP

### Técnicas
- [ ] Tempo de carregamento < 2s (LCP)
- [ ] 0 erros críticos em produção
- [ ] 99.5% uptime
- [ ] Cobertura de testes > 60%

### Produto
- [ ] 10 clínicas beta usando ativamente
- [ ] NPS > 50
- [ ] Redução de no-shows > 30% (vs baseline)
- [ ] Tempo de documentação reduzido > 40%

### Negócio
- [ ] CAC < R$ 500
- [ ] Churn mensal < 5%
- [ ] MRR > R$ 5.000 em 3 meses

---

## PRÓXIMOS PASSOS IMEDIATOS

1. ~~**Validar este plano** com você~~ ✅
2. ~~**Setup inicial**: Firebase project, ambiente dev~~ ✅
3. ~~**Começar Fase 0**: Preparação e limpeza do código~~ ✅
4. ~~**Implementar auth**: Firebase Auth + proteção de rotas~~ ✅
5. ~~**Migrar para Firestore**: Dados persistentes reais~~ ✅
6. ~~**Implementar multi-tenancy**: clinicId em todos os documentos~~ ✅
7. ~~**Backend API**: Cloud Run com endpoints REST~~ ⏸️ Adiado
8. **Fase 2: Core Features** ← **PRÓXIMO**
   - Agenda Aprimorada (week/month view, drag-drop)
   - Pacientes Completo (busca, edição, upload foto)
   - Prontuário melhorado (templates, anexos)

---

## FONTES DA PESQUISA

### Mercado e Concorrentes
- [Simples Dental - Capterra](https://www.capterra.com/p/219187/Simples-Dental/)
- [Amplimed - Capterra](https://www.capterra.com/p/204304/Amplimed/)
- [Best Dental Software 2025](https://www.daydream.dental/blog-post/best-dental-practice-management-software-2025)

### AI em Healthcare
- [AI in Healthcare 2025 - Menlo Ventures](https://menlovc.com/perspective/2025-the-state-of-ai-in-healthcare/)
- [AI Scheduling in Healthcare - Sprypt](https://www.sprypt.com/blog/ai-at-the-front-desk)
- [BCG: Digital AI Healthcare 2025](https://www.bcg.com/publications/2025/digital-ai-solutions-reshape-health-care-2025)

### Dores dos Profissionais
- [Healthcare Front Desk Problems](https://www.welcomeware.live/5-common-healthcare-front-desk-problems-and-their-solutions/)
- [EHR Workflow Inefficiencies](https://healthtechresourcesinc.com/most-common-ehr-workflow-inefficiencies)
- [Hidden Cost of Inefficiency](https://ache-cahl.org/articles/the-hidden-cost-of-inefficiency-how-poor-operational-efficiency-impacts-healthcare/)

### AI Scribe
- [Ambient AI Scribe 2025 - Healos](https://www.healos.ai/blog/how-ambient-ai-scribe-technology-is-transforming-healthcare-documentation-in-2025)
- [AI Medical Scribes - Sprypt](https://www.sprypt.com/blog/top-7-ai-medical-scribes-of-2025)
- [AI Scribe Burnout Impact - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC12193156/)

### Tecnologia Google
- [Firebase AI Logic](https://firebase.google.com/docs/vertex-ai)
- [Firebase App Hosting GA](https://firebase.blog/posts/2025/04/apphosting-general-availability/)
- [Cloud Healthcare API](https://docs.cloud.google.com/healthcare-api/docs/introduction)
- [Firebase HIPAA Compliance](https://www.blaze.tech/post/is-firebase-hipaa-compliant)

### LGPD
- [LGPD Healthcare - IBA](https://www.ibanet.org/electronic-medical-records-brazil)
- [LGPD Compliance 2025](https://captaincompliance.com/education/lgpd-compliance-checklist/)
- [Data Protection Brazil 2025](https://iclg.com/practice-areas/data-protection-laws-and-regulations/brazil)

### WhatsApp Integration
- [WhatsApp Healthcare - Wati](https://www.wati.io/healthcare/)
- [AI Voice Agents Healthcare](https://www.conversailabs.com/blog/ai-voice-agents-for-healthcare-automating-appointment-reminders-and-patient-follow-ups-at-98percent-show-up-rate)
- [No-Show Reduction - Archiz](https://archizsolutions.com/healthcare-appointment-reminders/)
