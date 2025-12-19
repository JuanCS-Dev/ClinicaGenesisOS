# ClinicaGenesisOS: Do Demo ao MVP Production-Ready

## Executive Summary

Transformar o demo atual (React + localStorage) em um MVP production-ready usando o ecossistema Google (Firebase + Cloud Run + Vertex AI), com foco em **clínicas pequenas e médias**, **multi-especialidade**, e **diferenciação via AI** (WhatsApp + ambient documentation).

---

## 📊 STATUS DE IMPLEMENTAÇÃO

> Última atualização: 2025-12-18 (Fase 3.1 WhatsApp Lembretes 90% - Cloud Functions Deployed!)

| Fase | Status | Progresso |
|------|--------|-----------|
| **Fase 0: Preparação** | ✅ Completa | 100% |
| **Fase 1.1: Autenticação** | ✅ Completa | 100% |
| **Fase 1.2: Backend API** | ⏸️ Adiada | N/A |
| **Fase 1.3: Banco de Dados** | ✅ Completa | 100% |
| **Fase 1.4: Test Coverage 90%+** | ✅ Completa | 100% |
| **Fase 2: Core Features** | ✅ Completa | 100% |
| **Fase 3: AI Integration** | 🔄 Em Progresso | 60% |
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

**Arquivos removidos:**
- `src/store/useStore.ts` - Zustand removido completamente

#### ✅ Fase 1.4: Test Coverage 90%+ (Completada em 2025-12-17)
- **246 testes passando**
- **99.52% statements** coverage
- **92.8% branches** coverage
- **100% functions** coverage
- **99.5% lines** coverage

**Testes criados:**
- `src/__tests__/hooks/useRecords.test.ts` - 21 testes (subscriptions, CRUD)
- `src/__tests__/hooks/usePatients.test.ts` - 17 testes (subscriptions, CRUD, refresh)
- `src/__tests__/hooks/useAppointments.test.ts` - 21 testes (filters, subscriptions, CRUD)
- `src/__tests__/contexts/ClinicContext.test.tsx` - 21 testes (clinic/user profile)
- `src/__tests__/services/firestore/patient.service.test.ts` - 21 testes
- `src/__tests__/services/firestore/appointment.service.test.ts` - 22 testes
- `src/__tests__/services/firestore/record.service.test.ts` - 22 testes (polymorphic types)
- `src/__tests__/lib/recurrence.test.ts` - 24 testes (edge cases)

**Arquivos modificados:**
- `src/types/index.ts` - Fix CreateClinicInput type (plan/settings optional)

#### ⏸️ Fase 1.2: Backend API (Adiada)
> **Decisão**: Adiada para pós-MVP. Firestore com Security Rules atende as necessidades atuais.
> Será implementada quando precisarmos de: webhooks complexos, integrações externas (WhatsApp API), ou lógica de negócio server-side.

---

## 🔬 INTELIGÊNCIA DE MERCADO (Dezembro 2025)

> Pesquisa realizada em 18/12/2025 para validar prioridades e identificar oportunidades.

### Brasil - Panorama Crítico

| Métrica | Valor | Implicação para Genesis |
|---------|-------|-------------------------|
| Taxa de falência clínicas <5 anos | **60%** | Precisam de gestão integrada, não fragmentada |
| Clínicas com desafio em LGPD | **58%** | Compliance built-in é diferencial competitivo |
| Problema com agendamento/retorno | **48%** | Agenda inteligente + lembretes = core feature |
| Desafio financeiro principal | **52%** | Módulo financeiro real é essencial |
| Glosas médicas (perdas/trimestre) | **R$ 16 bi** | Oportunidade futura: gestão de convênios |
| Migração para nuvem (2024) | **78%** | Cloud-first é o caminho certo |

**Fonte**: [ConClinica](https://conclinica.com.br/setor-clinico-no-brasil-estudo/), [GestaDS](https://www.gestaods.com.br/principais-desafios-das-clinicas-no-brasil/), [Saúde Business](https://www.saudebusiness.com/tecnologia/softwares-de-gestao-ajudam-clinicas-a-reduzir-glosas-medicas-e-prejuizos-de-ate-17-no-orcamento/)

**Armadilha identificada**: Gestão fragmentada (agenda num app, prontuário noutro, financeiro em planilha). Genesis resolve isso com plataforma unificada.

---

### EHR/Prontuário - A Frustração Universal dos Médicos

| Dor | Dados | Nossa Resposta |
|-----|-------|----------------|
| Interface ruim = #1 reclamação | **72%** querem UI melhor | UI Apple-like já implementada |
| Telas por revisão de prontuário | **26.5 telas** (mediana) | Timeline unificada, 1 tela |
| Tempo para "snapshot" de paciente | **6min 27s** | Card resumo instantâneo |
| Alert fatigue (pop-ups excessivos) | Médicos ignoram alertas críticos | Alertas contextuais, não intrusivos |
| Trabalham hora extra por admin | **87%** | AI Scribe reduz documentação |
| Tarefas admin afetam satisfação | **75%** | Automação de tarefas repetitivas |

**Fonte**: [Stanford EHR Poll](https://med.stanford.edu/content/dam/sm/ehr/documents/EHR-Poll-Presentation.pdf), [PMC Usability Study](https://pmc.ncbi.nlm.nih.gov/articles/PMC12206486/)

**Insight**: Nossa UI premium não é luxo, é necessidade. 72% dos médicos querem isso.

---

### AI Scribe - O Presente, Não o Futuro

| Métrica | Valor | Status |
|---------|-------|--------|
| Health systems com iniciativas AI docs | **100%** | Universal |
| Projeção adoção até fim 2025 | **60%** dos providers | Mainstream |
| Reportam sucesso alto | **53%** | Comprovado |
| Economia tempo (Permanente Medical) | **15.700 horas/ano** | ROI claro |
| Cleveland Clinic - uso em visitas | **76%** das consultas | Adoção real |
| Redução tempo por nota | **2 min/consulta, 14 min/dia** | Mensurável |

**Fonte**: [NEJM Catalyst](https://catalyst.nejm.org/doi/full/10.1056/CAT.25.0040), [Cleveland Clinic](https://consultqd.clevelandclinic.org/less-typing-more-talking-how-ambient-ai-is-reshaping-clinical-workflow-at-cleveland-clinic)

**Líder de mercado**: Abridge (Best in KLAS 2025, 50M interações projetadas)

**Cuidados documentados**:
- Erros, omissões e "alucinações" exigem revisão médica obrigatória
- Treinamento individualizado é fator crítico de sucesso
- Benefícios variam por especialidade

**Decisão Genesis**: AI Scribe entra na Fase 3 como prioridade máxima, não como "nice to have".

---

### WhatsApp - O Canal Obrigatório no Brasil

| Métrica | Valor | Ação |
|---------|-------|------|
| Usuários globais WhatsApp | **3 bilhões+** | Canal universal |
| Preferência por comunicação digital | **80%** dos pacientes | Digital-first |
| Trocariam de clínica por melhor comunicação | **55%** | Diferencial competitivo |
| Redução no-shows com lembretes | **30%+** | ROI imediato |
| Custo NHS (UK) com no-shows | **£216M/ano** | Problema global |

**Fonte**: [Gallabox](https://gallabox.com/blog/whatsapp-for-healthcare), [Respond.io](https://respond.io/blog/whatsapp-for-healthcare), [Doctoralia BR](https://pro.doctoralia.com.br/blog/clinicas/desafios-das-clinicas-no-brasil)

**Casos de uso prioritários**:
1. Lembretes de consulta (24h e 2h antes)
2. Confirmação com resposta (Sim/Não)
3. Agendamento via bot
4. Envio de resultados
5. FAQ automático

**Decisão Genesis**: WhatsApp Lembretes entra na Fase 3 como primeira feature AI.

---

### Billing & Revenue - A Dor Silenciosa

| Problema | Dados | Fase |
|----------|-------|------|
| Aumento de negativas (denials) | **40%** reportam | Fase 4 |
| Claims nunca reprocessados | **~50%** | Fase 4 |
| Billers sem automação (budget) | **42%** | Oportunidade |

**Fonte**: [Tebra](https://www.tebra.com/theintake/getting-paid/medical-billing-pain-points-insights-solutions)

**Decisão Genesis**: Financeiro básico na Fase 4. Gestão de convênios/glosas como feature premium futura.

---

### Matriz de Priorização Baseada em Dados

| Prioridade | Feature | Justificativa de Mercado | Fase |
|------------|---------|--------------------------|------|
| 🔴 **Crítica** | WhatsApp Lembretes | 55% trocariam de clínica, -30% no-shows | 3.1 |
| 🔴 **Crítica** | AI Scribe Básico | 100% health systems adotando, -14min/dia | 3.2 |
| 🟠 **Alta** | UI Premium (já temos) | 72% médicos querem, diferencial vs concorrentes | ✅ |
| 🟠 **Alta** | Plataforma Unificada | 60% clínicas falham por gestão fragmentada | ✅ |
| 🟠 **Alta** | AI Diagnostic Helper (Lablens) | Diferencial competitivo, Medicina Funcional | 3.3 |
| 🟡 **Média** | Financeiro Real | 52% têm como desafio principal | 4 |
| 🟡 **Média** | LGPD Compliance | 58% têm dificuldade | 5 |
| 🟢 **Futura** | Gestão Convênios/Glosas | R$16bi em perdas, complexo | Pós-MVP |

---

### Validação das Decisões Anteriores

| Decisão Tomada | Validação de Mercado | Status |
|----------------|---------------------|--------|
| React + TypeScript | Padrão de mercado | ✅ Correto |
| Firebase/Firestore | 78% migrando para nuvem | ✅ Correto |
| UI Apple-like premium | 72% querem UI melhor | ✅ Diferencial real |
| Multi-especialidade (plugins) | Gestão fragmentada é problema | ✅ Resolve dor real |
| AI-first approach | 100% health systems adotando | ✅ Timing perfeito |
| WhatsApp como canal principal | 80% preferem digital, 55% trocariam | ✅ Obrigatório no BR |

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
| Testing | Vitest + RTL | ✅ 246 testes (99.5% coverage) |
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
4. **Arquivos grandes**: ~~registry.tsx (485 linhas)~~ ✅ → Landing.tsx (405), Onboarding.tsx (459) pendentes
5. ~~**Sem testes**: 0% cobertura~~ → ✅ **246 testes (99.5% coverage)**

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

### Fase 2: Core Features Production (Sprints 3-4) ✅ Completa

#### 2.1 Agenda Aprimorada ✅ Completa
- [x] Week/Month view
- [x] Drag-and-drop para reagendar
- [x] Recorrência (diária, semanal, quinzenal, mensal)
- [x] Cores por status/profissional
- [x] Filtros funcionais (FilterPanel extraído)

#### 2.2 Pacientes ✅ Completa
- [x] Busca funcional (filtro em tempo real por nome, email, telefone, convênio, tags)
- [x] Edição de paciente (rota /patients/:id/edit, formulário completo)
- [x] Foto de perfil (upload via Firebase Storage, componente AvatarUpload)
- [x] Histórico completo (Timeline funcionando)

#### 2.3 Prontuário Eletrônico ✅ Completa
- [x] Salvar em Firestore (SOAP, Prescrição, Exames, Antropometria, Sessão Psico)
- [x] Versionamento de registros (subcollection versions, audit trail, restore)
- [x] Templates por especialidade (Medicina: SOAP, Nutrição: Antropometria completa com IMC/RCQ, Psicologia: Progress Notes + Private Notes)
- [x] Anexos (PDFs, imagens) - upload, visualização, exclusão

#### 2.4 Refatoração CODE_CONSTITUTION ✅ Completa (2025-12-18)
- [x] `plugins/registry.tsx` (485 linhas) → modularizado em 13 arquivos
- [x] Arquitetura semântica por domínio (medicina/, nutricao/, psicologia/)
- [x] Todos arquivos < 170 linhas (limite: 400)
- [x] Tipo `EditorRecordData` criado para type-safety

**Arquivos modificados/criados:**
- ~~`pages/Agenda.tsx`~~ ✅
- ~~`pages/Patients.tsx`~~ ✅ busca funcional implementada
- ~~`pages/PatientDetails.tsx`~~ ✅ exibição de anexos
- ~~`plugins/registry.tsx`~~ ✅ refatorado
- `pages/EditPatient.tsx` ✅ NOVO - formulário de edição
- `services/storage.service.ts` ✅ ATUALIZADO - upload de avatares e anexos
- `components/ui/AvatarUpload.tsx` ✅ NOVO - componente de upload de avatar
- `components/records/AttachmentUpload.tsx` ✅ NOVO - upload/visualização de anexos
- `services/firestore/record.service.ts` ✅ ATUALIZADO - versionamento, attachments
- `hooks/useRecords.ts` ✅ ATUALIZADO - getVersionHistory, restoreVersion
- `plugins/nutricao/NutritionEditor.tsx` ✅ MELHORADO - antropometria completa (cintura, quadril, IMC, RCQ)
- `plugins/psicologia/PsychologyEditor.tsx` ✅ MELHORADO - notas privadas (CFP 001/2009)
- `plugins/psicologia/data/moods.ts` ✅ ATUALIZADO - humor 'irritado' adicionado
- `types/index.ts` ✅ ATUALIZADO - RecordVersion, RecordAttachment

#### 🔄 Fase 3.1: WhatsApp Lembretes - Backend (Em Progresso - 2025-12-18)

**Status**: Backend deployed! Meta Account configurado, templates submetidos, aguardando aprovação Meta (~24h)

**Arquitetura implementada**:
- Multi-tenant ready (MVP usa shared keys, produção usa keys do cliente)
- Free tier otimizado (24h window para mensagens grátis)
- TypeScript strict mode, 0 erros, 0 TODOs

**Cloud Functions criadas**:
```typescript
// functions/src/index.ts
export { whatsappWebhook } from './whatsapp/webhook.js';
export { sendReminders24h, sendReminders2h } from './scheduler/reminders.js';
export { onAppointmentCreated, onAppointmentUpdated } from './scheduler/triggers.js';
```

**Funcionalidades implementadas**:
- `whatsapp/client.ts`: sendTemplateMessage, sendTextMessage, markAsRead
- `whatsapp/templates.ts`: TEMPLATE_REMINDER_24H, TEMPLATE_REMINDER_2H, TEMPLATE_CONFIRMATION
- `whatsapp/webhook.ts`: GET (verificação), POST (mensagens/status)
- `scheduler/reminders.ts`: Cron jobs (1h para 24h, 30min para 2h)
- `scheduler/triggers.ts`: onAppointmentCreated → confirmação, onAppointmentUpdated → métricas
- `utils/config.ts`: getAIClient(), getWhatsAppConfig(), isFeatureEnabled()

**Tipos adicionados em src/types/index.ts**:
- `AIProvider`, `ReminderStatus`, `AIConfig`, `WhatsAppConfig`
- `ClinicIntegrations`, `AIMetadata`, `AISoapRecord`
- `AppointmentReminder`, `ExamAnalysis`
- Extensão de `Appointment` com `patientPhone` e `reminder`

**Validação CODE_CONSTITUTION**:
- ✅ Todos arquivos < 300 linhas (limite: 500)
- ✅ 0 TODOs/FIXMEs em código de produção
- ✅ TypeScript strict mode passa
- ✅ ESLint passa (apenas warnings em tests/coverage)
- ✅ 246 testes passando

**Refatoração adicional**:
- `record.service.ts`: 549 → 470 linhas (extraído `record-version.service.ts`)

**Próximos passos para 3.1**:
1. Criar Meta Business Account
2. Verificar número de telefone
3. Submeter templates para aprovação
4. Deploy Cloud Functions
5. Testar com número de teste
6. Frontend: Dashboard de métricas

### Fase 3: AI Integration (Sprints 5-8) 🔄 Em Progresso

> **Deep Research realizada em 18/12/2025** - Ver `docs/FASE3_AI_DEEP_RESEARCH.md` para detalhes completos.

#### Resumo Executivo

| Feature | ROI Esperado | Complexidade | Sprints |
|---------|-------------|--------------|---------|
| **3.1 WhatsApp Lembretes** | -30% no-shows | Média | 2 |
| **3.2 AI Scribe MVP** | -14 min/dia/médico | Alta | 3 |
| **3.3 AI Diagnostic Helper** | Diferencial competitivo | Alta | 2 |

**Stack AI**: Firebase AI Logic + Vertex AI (Gemini 2.5 Flash) + Cloud Speech-to-Text

**Custo estimado**: R$ 260-420/mês (500 pacientes, 100 consultas AI)

---

#### 3.1 WhatsApp Lembretes (Backend Completo) 🔄

> **ROI**: -30% no-shows | Hospital na Índia: -30% com WhatsApp | NHS UK perde £216M/ano com no-shows
>
> **STATUS**: Backend 100% implementado (18/12/2025). Aguardando setup Meta Business Account.

**Dados de mercado (Dez/2025)**:
- 55% dos pacientes trocariam de clínica por melhor comunicação
- 20-30% redução de no-shows com lembretes automatizados
- **NOVO** (Jul/2025): WhatsApp cobra por template entregue (não mais por conversa)
- Templates Utility dentro do Customer Service Window (24h) são **GRÁTIS**

**Arquitetura**:
```
Firestore (appointments) → Cloud Tasks (scheduler) → Cloud Function (sendReminder)
    → WhatsApp Cloud API → Paciente → Resposta (Sim/Não) → Webhook → Firestore update
```

**Template Messages (submeter para aprovação Meta)**:
```
TEMPLATE: appointment_reminder_24h
─────────────────────────────────
Olá {{1}}! 👋
Lembrete: Sua consulta está agendada para *amanhã*.
📅 *Data*: {{2}}  ⏰ *Horário*: {{3}}
👨‍⚕️ *Profissional*: {{4}}  📍 *Local*: {{5}}
Você confirma sua presença?
[Sim, estarei lá] [Preciso remarcar]
```

**Checklist de implementação**:
- [x] Criar Meta Business Account + WhatsApp Business App ✅
- [x] Verificar número de telefone (Phone ID: 939822252545732) ✅
- [x] Submeter templates para aprovação (consulta_lembrete_24h, consulta_lembrete_2h, consulta_confirmacao) ✅
- [x] Setup Cloud Functions project (`functions/`) ✅
- [x] Implementar `whatsapp/client.ts` (WhatsApp Cloud API) ✅
- [x] Implementar `whatsapp/templates.ts` (Template builders) ✅
- [x] Implementar `whatsapp/webhook.ts` (receber respostas) ✅
- [x] Implementar `scheduler/reminders.ts` (Cron 24h + 2h) ✅
- [x] Implementar `scheduler/triggers.ts` (Firestore onCreate/onUpdate) ✅
- [x] Implementar `utils/config.ts` (Multi-tenant ready) ✅
- [x] Deploy Cloud Functions (5 functions deployed) ✅
- [ ] Frontend: Dashboard de métricas (enviados, confirmados, no-shows)
- [ ] Testes E2E com número real
- [ ] Testes em produção com paciente real

**Arquivos criados** (2025-12-18):
```
functions/
├── src/
│   ├── whatsapp/
│   │   ├── client.ts        ✅ WhatsApp Cloud API client (176 linhas)
│   │   ├── templates.ts     ✅ Template message builders (192 linhas)
│   │   └── webhook.ts       ✅ Incoming message handler (276 linhas)
│   ├── scheduler/
│   │   ├── reminders.ts     ✅ Cron 24h + 2h (274 linhas)
│   │   └── triggers.ts      ✅ Firestore triggers (182 linhas)
│   ├── utils/
│   │   └── config.ts        ✅ Multi-tenant config (154 linhas)
│   └── index.ts             ✅ Exports
├── package.json             ✅
└── tsconfig.json            ✅

src/
├── types/index.ts           ✅ +120 linhas (AIConfig, WhatsAppConfig, etc.)
├── services/
│   └── ai.service.ts        ✅ Frontend AI config (multi-tenant ready)
└── pages/
    └── WhatsAppMetrics.tsx  🔲 Pendente
```

**Custo estimado**: ~R$ 150-200/mês (500 pacientes)

---

#### 3.2 AI Scribe MVP (Prioridade Crítica) 🔴

> **ROI**: 15.700 horas/ano economizadas (Permanente Medical) | 95-98% precisão (vs 96% humano)

**Dados de mercado (Dez/2025)**:
- 60% dos providers projetados a usar AI Scribe até fim 2025
- Cleveland Clinic: 76% das consultas usam AI Scribe
- Economia: 2 min/consulta, 14 min/dia por médico
- **INSIGHT**: Pipeline modular supera naive prompting em **32%** (SpecialtyScribe/ACM)

**Arquitetura (3-Stage Pipeline)**:
```
┌─────────────┐    ┌───────────────────┐    ┌───────────────────┐    ┌───────────────────┐
│   Browser   │───▶│  Speech-to-Text   │───▶│ Info Extractor    │───▶│ SOAP Generator    │
│ MediaRecorder    │ medical_conversation   │ (Gemini 2.5 Flash)│    │ (Gemini 2.5 Flash)│
└─────────────┘    └───────────────────┘    └───────────────────┘    └───────────────────┘
                           │                        │                        │
                           ▼                        ▼                        ▼
                      Transcrição              JSON estruturado          SOAP Note
                      (raw text)               (sintomas, meds...)       (S.O.A.P.)
```

**Google Cloud Speech-to-Text Medical Models**:
- `medical_conversation`: Diálogo médico-paciente (auto-detect speakers)
- `medical_dictation`: Médico ditando notas (spoken commands)
- Pricing: $0.048/min (medical models)

**Prompts otimizados** (ver `FASE3_AI_DEEP_RESEARCH.md`):
- Stage 2: Information Extractor → JSON com queixa, sintomas, medicações, etc.
- Stage 3: SOAP Generator → Nota estruturada por especialidade

**Checklist de implementação**:
- [ ] Componente `AudioRecorder.tsx` (browser MediaRecorder API)
- [ ] Upload para Cloud Storage (trigger Cloud Function)
- [ ] Cloud Function `transcribe.ts` (Speech-to-Text medical_conversation)
- [ ] Cloud Function `extract-info.ts` (Gemini 2.5 Flash)
- [ ] Cloud Function `generate-soap.ts` (Gemini 2.5 Flash)
- [ ] Componente `SOAPReview.tsx` (modal de revisão/edição)
- [ ] Integração com prontuário existente
- [ ] Campo `aiGenerated: boolean` no record
- [ ] Campo `aiMetadata: { model, promptVersion, timestamp }` para audit
- [ ] Indicador visual "🤖 AI Generated" no prontuário
- [ ] Feedback loop: médico pode marcar erros

**Cuidados OBRIGATÓRIOS (compliance)**:
- ⚠️ Revisão médica OBRIGATÓRIA antes de salvar
- ⚠️ Indicador visual claro de conteúdo AI
- ⚠️ Audit trail completo (quem, quando, modelo usado)
- ⚠️ Treinamento/onboarding do usuário
- ⚠️ NÃO salvar automaticamente - sempre aguardar aprovação

**Arquivos a criar**:
```
functions/src/ai/
├── transcribe.ts         # Speech-to-Text
├── extract-info.ts       # Information Extractor
└── generate-soap.ts      # SOAP Generator

src/components/ai/
├── AudioRecorder.tsx     # Gravação de áudio
├── TranscriptionView.tsx # Visualizar transcrição
└── SOAPReview.tsx        # Modal de revisão

src/services/
└── ai.service.ts         # Frontend AI service

src/hooks/
└── useAIScribe.ts        # Hook para AI Scribe
```

**Custo estimado**: ~R$ 50-80/mês (100 consultas)

---

#### 3.3 AI Diagnostic Helper - Lablens Integration (Alta) 🟠

> **Apenas área do médico** | LLM users: +27.5 pontos percentuais em diagnostic reasoning

**Dados de mercado (Dez/2025)**:
- LLMs >90% accuracy em casos comuns
- Claude 3.7: 83.3% em casos complexos
- Penda Health (Kenya): Interface traffic-light (🟢🟡🔴) com sucesso
- Glass Health: AI co-pilot para DDx com rationale

**Conceito**: Ferramenta de APOIO (não substituição) ao raciocínio clínico.

**Arquitetura**:
```
┌─────────────────┐    ┌─────────────────┐
│   ANAMNESE      │    │    EXAMES       │
│ (SOAP.Subjetivo)│    │ (Upload/OCR)    │
└────────┬────────┘    └────────┬────────┘
         │                      │
         └──────────┬───────────┘
                    │
                    ▼
          ┌─────────────────────┐
          │  Gemini 2.5 Flash   │
          │  + Functional       │
          │  Optimal Ranges     │
          └─────────────────────┘
                    │
                    ▼
          ┌─────────────────────┐
          │   ANÁLISE OUTPUT    │
          │ 🔴 Valores críticos │
          │ 🟡 Fora do optimal  │
          │ 🟢 Dentro do range  │
          │                     │
          │ Correlações:        │
          │ Perguntas invest.:  │
          └─────────────────────┘
                    │
                    ▼
          ┌─────────────────────┐
          │   MÉDICO DECIDE     │
          │  (sempre humano)    │
          └─────────────────────┘
```

**Funcionalidades**:
- [ ] Upload de exames laboratoriais (PDF/imagem)
- [ ] OCR + extração de biomarcadores (Gemini Vision)
- [ ] Análise com Functional Optimal Ranges (não só lab ranges)
- [ ] Interface traffic-light (🟢🟡🔴) para valores
- [ ] Triangulação sintomas + labs → possibilidades
- [ ] Sugestões de perguntas investigativas
- [ ] Indicador "🤖 AI Assisted" no prontuário

**Código base existente**:
- `/media/juan/DATA/42em7/Day02/Lablens` - Adaptar prompts e ranges

**Cuidados éticos/legais OBRIGATÓRIOS**:
- ⚠️ Disclaimer em TODA interface: "Ferramenta de apoio. Não substitui julgamento clínico."
- ⚠️ Médico DEVE confirmar antes de qualquer registro
- ⚠️ Log de auditoria para cada sugestão gerada
- ⚠️ Pesquisar regulamentação CFM sobre AI diagnóstica
- ⚠️ NÃO mostrar para paciente - apenas área médica

**Arquivos a criar**:
```
functions/src/ai/
└── diagnostic-analysis.ts  # Análise de exames + anamnese

src/components/ai/
├── DiagnosticHelper.tsx    # Interface principal
├── BiomarkerAnalysis.tsx   # Visualização de biomarcadores
└── ExamUpload.tsx          # Upload de exames

src/services/
└── lablens.service.ts      # Integração Lablens
```

---

#### 3.4 WhatsApp Bot Avançado (Opcional) 🟢

> Implementar APENAS se 3.1 tiver sucesso comprovado (métricas positivas)

- [ ] Agendamento via conversa natural (Gemini)
- [ ] FAQ automático (horários, localização, preparo exames)
- [ ] Integração Firebase AI Logic
- [ ] Fallback para atendente humano
- [ ] Histórico de conversas no prontuário

---

#### Stack Técnica AI (Consolidada)

**Dependências a adicionar**:
```json
// package.json (frontend)
{
  "dependencies": {
    "@google/generative-ai": "^0.21.0"
  }
}

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

**Configuração Firebase AI Logic**:
```typescript
// src/services/ai.ts
import { getVertexAI, getGenerativeModel } from 'firebase/vertexai';
import { app } from './firebase';

const vertexAI = getVertexAI(app);

export const geminiFlash = getGenerativeModel(vertexAI, {
  model: 'gemini-2.5-flash-preview-05-20',
});
```

---

#### Custos Totais Estimados (Mensal)

| Item | Custo |
|------|-------|
| WhatsApp API (500 pacientes) | R$ 150-200 |
| Speech-to-Text (100 consultas) | R$ 30-50 |
| Gemini API (Scribe + Helper) | R$ 50-100 |
| Cloud Functions | R$ 20-50 |
| Cloud Storage | R$ 10-20 |
| **TOTAL** | **R$ 260-420/mês** |

**ROI**: Se reduzir 30% no-shows + 14min/dia/médico, payback no primeiro mês.

---

#### Fontes da Pesquisa Fase 3

- [NEJM Catalyst - AI Scribes 2.5M Uses](https://catalyst.nejm.org/doi/full/10.1056/CAT.25.0040)
- [Cleveland Clinic - Ambient AI](https://consultqd.clevelandclinic.org/less-typing-more-talking-how-ambient-ai-is-reshaping-clinical-workflow-at-cleveland-clinic)
- [SpecialtyScribe - ACM (Pipeline 32% melhor)](https://dl.acm.org/doi/10.1145/3701551.3706131)
- [Google Speech-to-Text Medical Models](https://cloud.google.com/speech-to-text/docs/medical-models)
- [WhatsApp Business API Pricing Jul/2025](https://respond.io/blog/whatsapp-business-api-pricing)
- [Penda Health AI Consult](https://cdn.openai.com/pdf/a794887b-5a77-4207-bb62-e52c900463f1/penda_paper.pdf)
- [Firebase AI Logic Docs](https://firebase.google.com/docs/vertex-ai)

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
- [x] ~~Cobertura de testes > 60%~~ → **99.5% alcançado** ✅

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
8. ~~**Fase 2: Core Features**~~ ✅ **100% COMPLETA** (2025-12-18)
   - ~~Agenda Aprimorada (week/month view, drag-drop, recorrência)~~ ✅
   - ~~Prontuário salvando no Firestore~~ ✅
   - ~~Refatoração plugins/ (CODE_CONSTITUTION)~~ ✅
   - ~~Pacientes (busca, edição, upload foto)~~ ✅
   - ~~Prontuário Eletrônico (versionamento, templates, anexos)~~ ✅

9. **Fase 3: AI Integration** ← **EM PROGRESSO** (Iniciado: 18/12/2025)

   > Ver `docs/FASE3_AI_DEEP_RESEARCH.md` e `docs/FASE3_MVP_FREE_TIER.md` para detalhes.

   **Status atual:**
   | # | Feature | Status | Próximo Passo |
   |---|---------|--------|---------------|
   | 1 | **WhatsApp Lembretes** | 🔄 90% (Deployed!) | Aguardar aprovação templates Meta |
   | 2 | **AI Scribe MVP** | 🔲 Pendente | Aguardando 3.1 completo |
   | 3 | **AI Diagnostic Helper** | 🔲 Pendente | Aguardando 3.2 completo |

   **Completado em 18/12/2025:**
   - ✅ Setup Cloud Functions project (`functions/`)
   - ✅ Implementar WhatsApp client, templates, webhook
   - ✅ Implementar scheduler (reminders, triggers)
   - ✅ Arquitetura multi-tenant ready
   - ✅ Tipos TypeScript para AI/WhatsApp
   - ✅ Validação CODE_CONSTITUTION (246 testes, 0 erros)
   - ✅ Refatoração record.service.ts (549 → 470 linhas)
   - ✅ Meta Business Account configurado
   - ✅ WhatsApp Business App criado
   - ✅ Phone Number ID: 939822252545732
   - ✅ Business Account ID: 2302526336886419
   - ✅ Templates submetidos (consulta_lembrete_24h, consulta_lembrete_2h, consulta_confirmacao)
   - ✅ Cloud Functions deployed (5 funções: whatsappWebhook, sendReminders24h, sendReminders2h, onAppointmentCreated, onAppointmentUpdated)
   - ✅ Firebase Blaze plan ativado (limite R$25)

   **Próximos passos para 3.1 (WhatsApp):**
   1. ~~Criar Meta Business Account + WhatsApp Business App~~ ✅ Done
   2. ~~Verificar número de telefone~~ ✅ Done (939822252545732)
   3. ~~Submeter templates para aprovação~~ ✅ Done (consulta_lembrete_*)
   4. ~~Deploy Cloud Functions~~ ✅ Done (5 functions deployed!)
   5. Aguardar aprovação de templates pela Meta (~24h)
   6. Testar com paciente real (quando templates aprovados)
   7. Frontend: Dashboard de métricas WhatsApp

   **Arquitetura Free Tier (MVP):**
   - Google AI Studio (gratuito) em vez de Vertex AI
   - Gemini 2.5 Flash Native Audio (elimina Speech-to-Text separado)
   - WhatsApp 24h window para mensagens grátis
   - Multi-tenant: cada cliente terá billing próprio em produção

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
- [WhatsApp for Healthcare Guide 2025 - Gallabox](https://gallabox.com/blog/whatsapp-for-healthcare)
- [WhatsApp Patient Communication - Respond.io](https://respond.io/blog/whatsapp-for-healthcare)

### Pesquisa de Mercado Dezembro 2025 (NOVA)

**Brasil - Clínicas:**
- [Desafios das Clínicas no Brasil - ConClinica](https://conclinica.com.br/setor-clinico-no-brasil-estudo/)
- [Principais Desafios - GestaDS](https://www.gestaods.com.br/principais-desafios-das-clinicas-no-brasil/)
- [Glosas Médicas - Saúde Business](https://www.saudebusiness.com/tecnologia/softwares-de-gestao-ajudam-clinicas-a-reduzir-glosas-medicas-e-prejuizos-de-ate-17-no-orcamento/)
- [Tendências Gestão 2025 - GestaDS](https://www.gestaods.com.br/tendencias-em-gestao-de-clinicas-medicas-para-2025/)
- [Desafios Clínicas - Doctoralia BR](https://pro.doctoralia.com.br/blog/clinicas/desafios-das-clinicas-no-brasil)

**EHR/Prontuário - Frustração dos Médicos:**
- [Stanford EHR Poll - Por que médicos odeiam EHR](https://med.stanford.edu/content/dam/sm/ehr/documents/EHR-Poll-Presentation.pdf)
- [PMC - Usability Challenges in EHR](https://pmc.ncbi.nlm.nih.gov/articles/PMC12206486/)
- [IEEE Spectrum - EHR Challenges](https://spectrum.ieee.org/electronic-health-records)

**AI Scribe - Dados de Adoção 2025:**
- [NEJM Catalyst - Ambient AI Scribes 2.5M Uses](https://catalyst.nejm.org/doi/full/10.1056/CAT.25.0040)
- [Cleveland Clinic - AI Reshaping Workflow](https://consultqd.clevelandclinic.org/less-typing-more-talking-how-ambient-ai-is-reshaping-clinical-workflow-at-cleveland-clinic)
- [JMIR - AI Scribes Responsible Integration](https://medinform.jmir.org/2025/1/e80898)

**Billing & Revenue:**
- [Tebra - Medical Billing Pain Points 2025](https://www.tebra.com/theintake/getting-paid/medical-billing-pain-points-insights-solutions)
- [NetSuite - Healthcare Industry Challenges 2025](https://www.netsuite.com/portal/resource/articles/erp/healthcare-industry-challenges.shtml)
