# ClinicaGenesisOS

Sistema de gestao para clinicas e consultorios multi-especialidade.

## Stack Tecnologica

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Backend**: Firebase (Firestore + Auth + Storage)
- **AI**: Vertex AI (Gemini 2.5 Flash)
- **Routing**: React Router v7
- **Charts**: Recharts
- **Build**: Vite 6
- **Testing**: Vitest + Testing Library (91%+ coverage)
- **Linting**: ESLint + Prettier

## Pre-requisitos

- Node.js >= 18
- npm >= 9
- Firebase project configurado

## Instalacao

```bash
# Clone o repositorio
git clone https://github.com/seu-usuario/ClinicaGenesisOS.git
cd ClinicaGenesisOS

# Instale as dependencias
npm install

# Configure as variaveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais Firebase
```

## Scripts Disponiveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Build
npm run build        # Build para producao
npm run preview      # Preview do build

# Qualidade de Codigo
npm run lint         # Verifica erros de lint
npm run lint:fix     # Corrige erros de lint automaticamente
npm run format       # Formata codigo com Prettier
npm run format:check # Verifica formatacao
npm run typecheck    # Verifica tipos TypeScript

# Testes
npm test             # Roda testes em watch mode
npm run test:ui      # Roda testes com interface grafica
npm run test:coverage # Roda testes com cobertura
```

## Funcionalidades

- **Autenticacao**: Firebase Auth (email/senha + Google OAuth)
- **Multi-tenancy**: Isolamento de dados por clinica
- **Dashboard**: KPIs e metricas em tempo real
- **Agenda**: Visualizacao dia/semana/mes
- **Pacientes**: CRUD completo com timeline
- **Prontuario**: SOAP, prescricoes, exames
- **Financeiro**: Transacoes, categorias, graficos
- **Relatorios**: Export PDF/Excel
- **AI Scribe**: Transcricao de consultas (Gemini 2.5 Flash)
- **WhatsApp**: Dashboard de metricas

## Especialidades Suportadas

- Medicina Geral
- Nutricao
- Psicologia

## Estrutura do Projeto

```
src/
├── components/        # Componentes React
│   ├── layout/        # Sidebar, Header
│   ├── patient/       # Timeline, etc
│   ├── finance/       # Componentes financeiros
│   ├── ai/            # AI Scribe, Clinical Reasoning
│   └── ui/            # Componentes base
├── contexts/          # React Contexts
├── hooks/             # Custom hooks
├── pages/             # Paginas da aplicacao
├── plugins/           # Sistema de plugins (especialidades)
├── services/          # Firebase services
├── types/             # TypeScript types
└── __tests__/         # Testes unitarios
```

## Roadmap

Consulte [docs/PLANO_MVP.md](docs/PLANO_MVP.md) para o plano completo de desenvolvimento.

**Status atual**: Fase 5 (Polish) completa - MVP production-ready.

## Licenca

Proprietario - Todos os direitos reservados.
