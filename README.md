# ClinicaGenesisOS

Sistema de gestao para clinicas e consultorios multi-especialidade.

## Stack Tecnologica

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **State**: Zustand
- **Routing**: React Router v7
- **Charts**: Recharts
- **Build**: Vite 6
- **Testing**: Vitest + Testing Library
- **Linting**: ESLint + Prettier

## Pre-requisitos

- Node.js >= 18
- npm >= 9

## Instalacao

```bash
# Clone o repositorio
git clone https://github.com/seu-usuario/ClinicaGenesisOS.git
cd ClinicaGenesisOS

# Instale as dependencias
npm install
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

## Estrutura do Projeto

```
ClinicaGenesisOS/
├── __tests__/          # Testes
├── components/         # Componentes React
│   ├── layout/         # Sidebar, Header
│   ├── patient/        # Timeline, etc
│   └── plugins/        # Plugins de especialidades
├── docs/               # Documentacao
├── pages/              # Paginas da aplicacao
├── plugins/            # Sistema de plugins
├── store/              # Zustand store
├── App.tsx             # Router principal
├── constants.ts        # Dados mock
├── index.css           # Estilos Tailwind
├── index.html          # HTML entry
├── index.tsx           # React entry
└── types.ts            # TypeScript types
```

## Especialidades Suportadas

- Medicina Geral
- Nutricao
- Psicologia

## Roadmap

Consulte [docs/PLANO_MVP.md](docs/PLANO_MVP.md) para o plano completo de desenvolvimento.

## Licenca

Proprietario - Todos os direitos reservados.
