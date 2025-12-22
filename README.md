# 🏥 ClinicaGenesisOS

> **Sistema de Gestão para Clínicas Multi-Especialidade**
> 
> Plataforma completa com diagnóstico assistido por IA, telemedicina, prescrição digital e faturamento TISS.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![Tests](https://img.shields.io/badge/tests-1028%20passing-brightgreen)]()
[![Coverage](https://img.shields.io/badge/coverage-91%25-brightgreen)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)]()
[![React](https://img.shields.io/badge/React-19-61dafb)]()

---

## ✨ Funcionalidades Principais

### 🩺 Clínicas
- **Multi-tenancy**: Isolamento completo de dados por clínica
- **Multi-especialidade**: Medicina, Nutrição, Psicologia, Odontologia, Fisioterapia, Estética
- **Dashboard**: KPIs e métricas em tempo real

### 🤖 Inteligência Artificial
- **AI Scribe**: Transcrição automática de consultas → SOAP notes
- **Diagnóstico Assistido**: Multi-LLM consensus (GPT-4, Gemini, Claude)
- **Análise de Exames**: Upload de PDF/imagem → interpretação automática
- **Clinical Reasoning Explainability**: Explicação do "porquê" de cada diagnóstico

### 📅 Gestão
- **Agenda**: Visualização dia/semana/mês com drag & drop
- **Pacientes**: CRUD completo com timeline de atendimentos
- **Prontuário Eletrônico**: SOAP, prescrições, exames, anexos
- **Financeiro**: Transações, categorias, gráficos, PIX/Boleto

### 🔗 Integrações
- **Telemedicina**: Jitsi Meet com E2E encryption
- **Prescrição Digital**: Memed-ready com assinatura ICP-Brasil
- **Faturamento TISS**: Guias de Consulta e SADT (v4.02.00)
- **Pagamentos**: Stripe (Boleto) + PIX direto
- **WhatsApp**: Dashboard de métricas

### 🔒 Compliance
- **LGPD**: Gestão de consentimento, logs de auditoria, exportação de dados
- **HIPAA**: Criptografia E2E, isolamento de dados

---

## 🛠 Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| **Frontend** | React 19 + TypeScript 5.7 |
| **Styling** | Tailwind CSS v4 + Design System próprio |
| **Backend** | Firebase (Firestore + Auth + Storage + Functions) |
| **AI** | Azure OpenAI (GPT-4o-mini) + Vertex AI (Gemini) |
| **Telemedicina** | Jitsi Meet SDK |
| **Pagamentos** | Stripe API |
| **Build** | Vite 6 + PWA |
| **Testing** | Vitest + Testing Library |
| **Linting** | ESLint + Prettier |

---

## 📁 Estrutura do Projeto

```
ClinicaGenesisOS/
├── docs/                          # 📚 Documentação
│   ├── CODE_CONSTITUTION.md       # Padrões de código
│   ├── PLANO_HEROICO_FASE6-14.md  # Roadmap completo
│   ├── AIRGAPS_AUDIT.md           # Auditoria de integração
│   └── ...
├── functions/                     # ☁️ Cloud Functions (Firebase)
│   └── src/
│       ├── ai/                    # Azure OpenAI integration
│       ├── stripe/                # PIX/Boleto webhooks
│       └── ...
├── src/
│   ├── __tests__/                 # 🧪 Testes unitários (51 arquivos)
│   │   ├── a11y/                  # Testes de acessibilidade
│   │   ├── components/            # Testes de componentes
│   │   ├── design-system/         # Testes do Design System
│   │   ├── hooks/                 # Testes de hooks
│   │   ├── services/              # Testes de serviços
│   │   └── types/                 # Testes de tipos
│   ├── components/                # 🧩 Componentes React
│   │   ├── ai/                    # AI Scribe, Clinical Reasoning
│   │   ├── layout/                # Header, Sidebar
│   │   ├── payments/              # PIX, Boleto
│   │   ├── telemedicine/          # Jitsi integration
│   │   └── ui/                    # Componentes base
│   ├── contexts/                  # ⚡ React Contexts
│   ├── design-system/             # 🎨 Design System Premium
│   │   ├── components/            # Button, Input, Modal, Card...
│   │   ├── ThemeContext.tsx       # Dark/Light mode
│   │   └── tokens.ts              # Design tokens
│   ├── hooks/                     # 🪝 Custom hooks
│   ├── pages/                     # 📄 Páginas da aplicação
│   ├── plugins/                   # 🔌 Sistema de plugins (especialidades)
│   ├── services/                  # 🔥 Firebase services
│   │   ├── firestore/             # CRUD operations
│   │   └── tiss/                  # XML generation
│   └── types/                     # 📝 TypeScript types
├── public/                        # 🖼 Assets estáticos
└── scripts/                       # 🔧 Scripts de build
```

---

## 🚀 Quick Start

### Pré-requisitos

- Node.js >= 18
- npm >= 9
- Firebase project configurado
- (Opcional) Stripe account para pagamentos

### Instalação

```bash
# Clone o repositório
git clone https://github.com/JuanCS-Dev/ClinicaGenesisOS.git
cd ClinicaGenesisOS

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais
```

### Scripts Disponíveis

```bash
# 🚀 Desenvolvimento
npm run dev              # Servidor de desenvolvimento

# 📦 Build
npm run build            # Build para produção
npm run preview          # Preview do build

# ✅ Qualidade de Código
npm run lint             # Verifica erros de lint
npm run lint:fix         # Corrige erros automaticamente
npm run typecheck        # Verifica tipos TypeScript

# 🧪 Testes
npm test                 # Roda testes (1028 testes)
npm run test:coverage    # Testes com cobertura
npm run test:ui          # Interface gráfica de testes
```

---

## 📊 Métricas de Qualidade

| Métrica | Valor |
|---------|-------|
| **Testes** | 1028 passando |
| **Cobertura** | 91%+ |
| **Lint Errors** | 0 |
| **Type Errors** | 0 |
| **Arquivos > 500 linhas** | 0 |
| **Acessibilidade** | WCAG 2.1 AA |

---

## 📚 Documentação

| Documento | Descrição |
|-----------|-----------|
| [CODE_CONSTITUTION.md](docs/CODE_CONSTITUTION.md) | Padrões de código (Google-inspired) |
| [PLANO_HEROICO_FASE6-14.md](docs/PLANO_HEROICO_FASE6-14.md) | Roadmap completo (Fases 6-16) |
| [PREMIUM_DESIGN_SYSTEM.md](docs/PREMIUM_DESIGN_SYSTEM.md) | Especificação do Design System |
| [AIRGAPS_AUDIT.md](docs/AIRGAPS_AUDIT.md) | Auditoria de integração |
| [PLANO_MVP.md](docs/PLANO_MVP.md) | Plano original do MVP |

---

## 🎨 Design System

O projeto inclui um Design System premium com:

- **Tokens**: Cores, tipografia, espaçamento, sombras, animações
- **Componentes Base**: Button, Input, Modal, Card, Badge, Avatar
- **Dark Mode**: Toggle com persistência em localStorage
- **Acessibilidade**: WCAG 2.1 AA, skip links, focus indicators
- **Density Modes**: Compact vs Comfortable

```tsx
import { Button, Input, Modal, Card, Badge, Avatar } from '@/design-system';

<Button variant="primary" loading>
  Salvar
</Button>
```

---

## 📈 Roadmap

### ✅ Completo (Dez 2025)

- [x] Fase 6: Telemedicina (Jitsi E2E)
- [x] Fase 7: Faturamento TISS 4.02.00
- [x] Fase 8: Prescrição Digital (Memed-ready)
- [x] Fase 9: PWA Mobile
- [x] Fase 10: PIX + Boleto (Stripe)
- [x] Fase 11: LGPD Compliance
- [x] Fase 12: AI Scribe Enhancement
- [x] Fase 13: Clinical Reasoning Explainability
- [x] Fase 14: UX Search (Command Palette)
- [x] Fase 15: Air Gap Resolution
- [x] Fase 16: Design System Premium

### 🔜 Próximos Passos

- [ ] React Native (Mobile App)
- [ ] Integração com hardware médico
- [ ] Marketplace de plugins

---

## 🤝 Contribuição

Este é um projeto proprietário. Para contribuir, entre em contato com o mantenedor.

---

## 📄 Licença

Proprietário - Todos os direitos reservados.

---

## 👨‍💻 Autor

**Juan Carlos de Souza**

- GitHub: [@JuanCS-Dev](https://github.com/JuanCS-Dev)

---

<p align="center">
  <strong>🏥 Genesis - A melhor aplicação médica do Brasil</strong>
</p>
