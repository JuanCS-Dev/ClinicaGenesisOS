# Clínica Genesis OS

Sistema de Gestão para Clínicas Multi-Especialidade desenvolvido em React + Firebase.

[![Build](https://img.shields.io/badge/build-passing-brightgreen)]()
[![Tests](https://img.shields.io/badge/tests-2636%20passing-brightgreen)]()
[![Coverage](https://img.shields.io/badge/coverage-90%25-brightgreen)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)]()
[![React](https://img.shields.io/badge/React-19.2-61dafb)]()

---

## Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|------------|--------|
| Frontend | React + TypeScript | 19.2.3 / 5.8.2 |
| Styling | Tailwind CSS | 4.1.18 |
| Build | Vite | 6.2.0 |
| Backend | Firebase (Firestore, Auth, Functions, Storage) | 12.7.0 |
| AI | Google Vertex AI (Gemini 2.5 Flash) | - |
| Telemedicina | Jitsi Meet SDK | 1.4.4 |
| Pagamentos | Stripe (PIX, Boleto) | - |
| Testes | Vitest + Testing Library | 4.0.16 |

---

## Módulos Implementados

### Gestão de Pacientes
- CRUD completo com perfil detalhado
- Busca por nome, email, telefone, convênio, tags
- Virtual scrolling para performance (500+ pacientes a 60 FPS)
- Timeline de atendimentos e histórico médico
- Upload de documentos e anexos

### Agenda
- Visualização dia/semana/mês
- Drag & drop para reagendamento
- Agendamentos recorrentes com regras customizáveis
- Filtros por status e especialidade
- Status tracking: pendente, confirmado, chegou, em atendimento, finalizado

### Prontuário Eletrônico (SOAP)
- Notas SOAP com versionamento
- Templates por especialidade (medicina, nutrição, psicologia)
- Geração automática via AI Scribe (áudio → SOAP)
- Anexos de documentos, imagens e PDFs
- Histórico completo de alterações

### Prescrições
- Criação de prescrições digitais
- Busca de medicamentos no banco de dados
- Validação e controle de validade
- Download em PDF para pacientes
- QR Code para validação
- Histórico de prescrições

### Análise Laboratorial com IA
- Upload de resultados (PDF/imagem)
- Pipeline de raciocínio clínico em 4 camadas:
  1. Triagem de urgência
  2. Investigação por especialidade
  3. Fusão multimodal de dados
  4. Explicabilidade com validação
- Análise de 12+ categorias de biomarcadores
- Detecção de padrões e correlações
- Busca de literatura médica (PubMed, EuropePMC)
- Diagnóstico diferencial com recomendações

### AI Scribe
- Gravação de áudio da consulta
- Transcrição automática via Gemini
- Geração de nota SOAP estruturada
- Sugestões de CID-10
- Métricas de uso

### Telemedicina
- Videoconsultas via Jitsi Meet
- Sala de espera virtual
- Gravação de sessões
- Chat durante consulta
- Notas da sessão
- Integração com agendamentos

### Faturamento TISS
- Guias de Consulta e SADT (v4.02.00)
- Geração de XML conforme padrão ANS
- Certificado digital (PKI/ICP-Brasil)
- Criação e envio de lotes
- Gestão de glosas (negativas)
- Recursos e contestações
- Relatórios e estatísticas
- Cadastro de operadoras

### Financeiro
- Registro de transações (receitas/despesas)
- Resumo mensal com KPIs
- Gráficos de tendência
- Export para PDF e Excel
- Análise de ocupação

### Pagamentos
- PIX via Stripe
- PIX direto (QR Code EMV)
- Boleto bancário
- Status em tempo real via webhooks
- Geração de recibos
- Reembolsos

### Portal do Paciente
- Dashboard com próximas consultas
- Visualização e reagendamento de consultas
- Acesso a prescrições e download
- Resultados de exames
- Histórico médico
- Teleconsultas
- Mensagens com equipe de saúde
- Pagamentos via PIX

### WhatsApp Business
- Lembretes de consulta (24h e 2h antes)
- Mensagens de follow-up pós-consulta
- Pesquisas NPS automatizadas
- Dashboard de métricas (enviados, entregues, lidos, confirmados)

### Relatórios e Analytics
- Dashboard de KPIs em tempo real
- Análise financeira (wellness)
- Insights de pacientes (retenção, NPS, engajamento)
- Relatórios por especialidade
- Export PDF/Excel

### Compliance LGPD
- Gestão de consentimentos
- Exportação de dados do titular
- Exclusão de dados
- Log de auditoria
- Fluxos de compliance

### Configurações
- Perfil do usuário
- Dados da clínica
- Convênios e operadoras
- Notificações
- Integração WhatsApp Business API
- Workflows automatizados
- Configuração PIX
- Preferências LGPD

---

## Estrutura do Projeto

```
ClinicaGenesisOS/
├── docs/                           # Documentação
│   ├── CODE_CONSTITUTION.md        # Padrões de código
│   └── PLANO_ENTERPRISE_WORLD_CLASS.md
├── functions/                      # Cloud Functions
│   └── src/
│       ├── ai/                     # Gemini integration
│       ├── stripe/                 # Pagamentos
│       ├── tiss/                   # Faturamento TISS
│       ├── whatsapp/               # WhatsApp Business
│       └── workflows/              # Automações
├── src/
│   ├── __tests__/                  # 153 arquivos de teste
│   ├── components/                 # 145 componentes React
│   │   ├── ai/                     # AI Scribe, Clinical Reasoning
│   │   ├── agenda/                 # Calendário e agendamentos
│   │   ├── billing/                # Faturamento TISS
│   │   ├── payments/               # PIX, Boleto
│   │   ├── telemedicine/           # Jitsi integration
│   │   └── ui/                     # Componentes base
│   ├── contexts/                   # 7 React Contexts
│   ├── design-system/              # Design System próprio
│   ├── hooks/                      # 40+ custom hooks
│   ├── pages/                      # 30+ páginas
│   │   ├── patient-portal/         # 8 páginas do portal
│   │   ├── public/                 # Páginas públicas
│   │   └── landing/                # Landing pages
│   ├── plugins/                    # Especialidades médicas
│   ├── services/                   # 70+ service modules
│   │   ├── firestore/              # CRUD Firestore
│   │   └── tiss/                   # Geração XML TISS
│   └── types/                      # TypeScript types
└── public/                         # Assets estáticos + PWA
```

---

## Páginas da Aplicação

### Área Administrativa (17 páginas)
| Página | Funcionalidade |
|--------|----------------|
| Dashboard | KPIs, métricas, tarefas prioritárias |
| Agenda | Calendário com drag & drop |
| Pacientes | Lista com busca e filtros |
| Detalhes do Paciente | Perfil, timeline, prontuário |
| Financeiro | Transações, resumos, gráficos |
| Faturamento | Guias TISS, lotes, glosas |
| Relatórios | Analytics e exportação |
| Analytics | Financial wellness + patient insights |
| Configurações | Multi-tab de configurações |
| WhatsApp Metrics | Dashboard de lembretes |
| Ajuda | Central de documentação |
| Onboarding | Setup inicial da clínica |

### Portal do Paciente (8 páginas)
| Página | Funcionalidade |
|--------|----------------|
| Dashboard | Próximas consultas, ações rápidas |
| Consultas | Visualizar/reagendar |
| Prescrições | Download de receitas |
| Exames | Resultados laboratoriais |
| Mensagens | Chat com equipe |
| Pagamentos | Status e PIX |
| Teleconsultas | Videochamadas |
| Histórico | Prontuário completo |

### Páginas Públicas
- Perfil da clínica
- Agendamento online
- Landing page
- Manifesto
- Tecnologia

---

## Integrações Externas

### Google Vertex AI (Gemini)
- **Modelo**: Gemini 2.5 Flash
- **Uso**: AI Scribe, análise laboratorial, raciocínio clínico
- **Recursos**: Transcrição de áudio, geração de SOAP, diagnóstico diferencial

### Stripe
- PIX payment intents
- Boleto generation
- Webhooks para status em tempo real
- Refunds e cancelamentos

### Jitsi Meet
- Videoconsultas E2E encrypted
- Sala de espera
- Gravação de sessões
- Chat integrado

### WhatsApp Cloud API
- Lembretes automatizados
- Follow-up pós-consulta
- Pesquisas NPS
- Chatbot de saúde (Companion)

### PubMed / EuropePMC
- Busca de literatura médica
- Evidências para diagnósticos
- Cache de resultados

### TISS/ANS
- Geração de XML v4.02.00
- Assinatura digital (PKI)
- Envio para operadoras
- Parse de demonstrativos

---

## Coleções Firestore

```
clinics/
├── appointments/      # Agendamentos
├── patients/          # Pacientes
├── records/           # Prontuários
├── prescriptions/     # Prescrições
├── lab-results/       # Resultados de exames
├── messages/          # Mensagens
├── tasks/             # Tarefas
├── transactions/      # Transações financeiras
├── guias/             # Guias TISS
├── glosas/            # Glosas
├── operadoras/        # Operadoras de saúde
├── payments/          # Pagamentos
├── telemedicine/      # Sessões de telemedicina
└── lgpd/              # Consentimentos LGPD

users/                 # Perfis de usuários
```

---

## Cloud Functions (50+)

### AI
- `processAudioScribe` - Áudio → Transcrição + SOAP
- `analyzeLabResults` - Pipeline de raciocínio clínico

### Pagamentos
- `createPixPayment`, `cancelPixPayment`, `refundPixPayment`
- `createBoletoPayment`, `cancelBoletoPayment`, `refundBoletoPayment`
- `stripeWebhook`

### TISS
- `validateCertificate`, `storeCertificate`, `deleteCertificate`
- `createLote`, `deleteLote`, `signXml`, `sendLote`
- `receiveResponse`, `checkLoteStatus`, `parseDemonstrativoXml`
- `createRecurso`, `sendRecurso`, `getRecursoStatus`

### WhatsApp
- `sendReminders24h`, `sendReminders2h`
- `whatsappWebhook`
- `sendFollowUpMessages`
- `sendNPSSurveys`, `npsResponseWebhook`

### Workflows
- `sendPatientReturnReminders`
- `labsResultWebhook`
- `cleanupExpiredSessions`

---

## Design System

### Tokens de Cor
```
genesis-primary     #0F766E (Teal)
genesis-dark        #1E293B
genesis-muted       #64748B
genesis-subtle      #94A3B8
genesis-surface     #FFFFFF (light) / #1E293B (dark)
genesis-soft        #F8FAFC (light) / #334155 (dark)
genesis-hover       #F1F5F9 (light) / #475569 (dark)
genesis-border-subtle  #E2E8F0 (light) / #475569 (dark)
```

### Componentes Base
- Button, Input, Modal, Card
- Badge, Avatar, Progress
- Skeleton, EmptyState
- ThemeToggle (dark mode)

### Acessibilidade
- WCAG 2.1 AA compliant
- Skip links
- Focus indicators
- Contrast ratio 4.5:1+

---

## Quick Start

### Pré-requisitos
- Node.js >= 20
- npm >= 9
- Projeto Firebase configurado

### Instalação

```bash
git clone https://github.com/seu-usuario/ClinicaGenesisOS.git
cd ClinicaGenesisOS
npm install
```

### Configuração

```bash
cp .env.example .env.local
# Editar .env.local com credenciais Firebase
```

### Scripts

```bash
npm run dev              # Servidor de desenvolvimento
npm run build            # Build de produção
npm run preview          # Preview do build

npm run lint             # Verificar lint
npm run lint:fix         # Corrigir lint
npm run typecheck        # Verificar tipos

npm test                 # Rodar testes (2636 testes)
npm run test:coverage    # Testes com cobertura
npm run test:ui          # Interface de testes

npm run firebase:emulators    # Emuladores locais
npm run firebase:deploy       # Deploy para Firebase
```

---

## Métricas de Qualidade

| Métrica | Valor |
|---------|-------|
| Testes | 2636 passando |
| Cobertura | 90%+ |
| Arquivos de teste | 153 |
| Lint errors | 0 |
| Type errors | 0 |
| Componentes | 145 |
| Custom hooks | 40+ |
| Cloud Functions | 50+ |

---

## PWA

- Service Worker com Workbox
- Cache offline para Firestore
- Instalável em mobile/desktop
- Atalhos: Agenda, Pacientes
- Auto-update com prompt

---

## Segurança

### Headers HTTP
- Content-Security-Policy
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection
- Referrer-Policy: strict-origin-when-cross-origin

### Autenticação
- Firebase Auth (email/senha, Google OAuth)
- Custom claims para RBAC
- Proteção de rotas

### Dados
- Firestore Security Rules
- Multi-tenant isolation
- Criptografia de certificados

---

## Documentação

| Documento | Descrição |
|-----------|-----------|
| [CODE_CONSTITUTION.md](docs/CODE_CONSTITUTION.md) | Padrões de código |
| [PLANO_ENTERPRISE_WORLD_CLASS.md](docs/PLANO_ENTERPRISE_WORLD_CLASS.md) | Roadmap enterprise |

---

## Arquitetura Multi-Tenant

- Isolamento completo por clínica
- Coleções aninhadas em `clinics/{clinicId}/`
- Custom claims Firebase para controle de acesso
- Suporte a múltiplas especialidades por clínica

---

## Especialidades Suportadas

- Medicina Geral
- Nutrição
- Psicologia
- Odontologia
- Fisioterapia
- Estética

---

## Licença

Proprietário - Todos os direitos reservados.

---

## Autor

**Juan Carlos de Souza**

GitHub: [@JuanCS-Dev](https://github.com/JuanCS-Dev)
