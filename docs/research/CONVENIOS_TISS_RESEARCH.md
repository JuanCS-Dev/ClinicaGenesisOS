# PESQUISA PROFUNDA: Convênios de Saúde e Padrão TISS
## Clínica Genesis OS - Fase 8 do Plano Prosperidade

**Data da Pesquisa:** 22/12/2024
**Status:** ✅ PESQUISA CONCLUÍDA
**Autor:** Claude Code (Pesquisa Automatizada)

---

## SUMÁRIO EXECUTIVO

Esta pesquisa documenta os requisitos técnicos, legais e operacionais para implementação de faturamento eletrônico de convênios de saúde no Brasil. O padrão TISS (Troca de Informações na Saúde Suplementar) é **obrigatório** para todas as trocas de dados entre operadoras e prestadores.

### Conclusões Principais

1. **Viabilidade Técnica:** ✅ ALTA - O padrão TISS é bem documentado e baseado em XML/XSD
2. **Complexidade:** 🟡 MÉDIA-ALTA - Cada operadora tem particularidades
3. **Certificação Digital:** ⚠️ OBRIGATÓRIA - e-CPF ou e-CNPJ ICP-Brasil
4. **Prazo para Implementação:** 3-6 meses (MVP com 1-2 operadoras)
5. **Risco de Glosas:** 20-30% das contas hospitalares sofrem glosas

---

## 1. LEGISLAÇÃO E REGULAMENTAÇÃO ANS

### 1.1 Resolução Normativa nº 501/2022

A RN 501 estabelece o **Padrão TISS obrigatório** para troca de informações na saúde suplementar.

**Obrigatoriedades:**
- Envio mensal de dados para ANS (desde junho/2014)
- Uso exclusivo do Padrão TISS para troca de dados operadora ↔ prestador
- Disponibilização gratuita de informações ao beneficiário

**Penalidades (RN 489/2022):**
| Infração | Multa |
|----------|-------|
| Mínima | R$ 5.000,00 |
| Máxima | R$ 1.000.000,00 |

**Multiplicadores por porte:**
- 1.001 a 20.000 beneficiários: 0,4x
- 20.001 a 100.000: 0,6x
- 100.001 a 200.000: 0,8x

**Fonte:** [RN 501/2022 - BVS Saúde](https://bvsms.saude.gov.br/bvs/saudelegis/ans/2022/res0501_01_04_2022.html)

### 1.2 Versão Atual do Padrão TISS

| Versão | Status | Observações |
|--------|--------|-------------|
| **4.01.00** | ✅ VIGENTE | Consolidada desde julho/2021 |
| **Maio/2025** | 📅 Próxima | Atualizações em TUSS e tabelas |
| **Setembro/2025** | 📅 Futura | Ajustes terminológicos |

**Prazo limite para adequação:** 31/12/2024 (versão 4.01)

**Fonte:** [Portal ANS - Padrão TISS](https://www.gov.br/ans/pt-br/assuntos/prestadores/padrao-para-troca-de-informacao-de-saude-suplementar-2013-tiss)

### 1.3 Componentes do Padrão TISS

```
┌─────────────────────────────────────────────────────────────┐
│                    PADRÃO TISS - 5 COMPONENTES              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. ORGANIZACIONAL                                          │
│     └─ Regras operacionais, prazos, responsabilidades       │
│                                                             │
│  2. CONTEÚDO E ESTRUTURA                                    │
│     └─ Arquitetura de dados (mensagens XML)                 │
│     └─ Schemas XSD para validação                           │
│                                                             │
│  3. REPRESENTAÇÃO DE CONCEITOS (TUSS)                       │
│     └─ Terminologia unificada de procedimentos              │
│     └─ Códigos padronizados (baseado CBHPM)                 │
│                                                             │
│  4. SEGURANÇA E PRIVACIDADE                                 │
│     └─ Certificação digital ICP-Brasil                      │
│     └─ Hash MD5 para integridade                            │
│                                                             │
│  5. COMUNICAÇÃO                                             │
│     └─ Linguagem XML (Extensible Markup Language)           │
│     └─ WebServices SOAP/REST                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. TERMINOLOGIA TUSS

### 2.1 O que é TUSS?

A **Terminologia Unificada da Saúde Suplementar** padroniza códigos e nomenclaturas de procedimentos. Baseada na CBHPM (Classificação Brasileira Hierarquizada de Procedimentos Médicos).

**Obrigatoriedade:** Uso obrigatório para operadoras reguladas pela ANS.

**Penalidade por não uso (RN 124):**
> "Multa de R$ 35.000,00 por deixar de cumprir as normas relativas ao padrão obrigatório TISS"

### 2.2 Atualização Janeiro/2025

- Novas inclusões e inativações de códigos
- Atualização da Tabela DE-PARA SIP TUSS
- Sincronização mensal obrigatória

**Download oficial:** `https://www.ans.gov.br/arquivos/extras/tiss/Padrao_TISS_Representacao_de_Conceitos_em_Saude_202501.zip`

**Fonte:** [ANS - TUSS](https://dados.gov.br/dados/conjuntos-dados/terminologia-unificada-da-saude-suplementar-tuss)

---

## 3. CERTIFICAÇÃO DIGITAL ICP-BRASIL

### 3.1 Obrigatoriedade

O Certificado Digital é **OBRIGATÓRIO** para:
- Assinar digitalmente lotes de guias TISS
- Validar autoria e integridade de documentos
- Faturar convênios eletronicamente

**Base Legal:**
- Medida Provisória nº 2.200-2/2001
- Resolução CFM nº 1.821/2007 (prontuário eletrônico)

### 3.2 Tipos de Certificado

| Tipo | Uso | Armazenamento |
|------|-----|---------------|
| **e-CPF A1** | Pessoa física | Software (arquivo) |
| **e-CPF A3** | Pessoa física | Token/Cartão |
| **e-CNPJ A1** | Pessoa jurídica | Software (arquivo) |
| **e-CNPJ A3** | Pessoa jurídica | Token/Cartão |

**Recomendação para clínicas:** e-CNPJ A1 (facilita integração com sistemas)

### 3.3 Requisitos Técnicos

- **Assinatura XML:** XMLDSig (padrão W3C)
- **Validação:** Cadeia ICP-Brasil
- **Validade:** 1-3 anos (renovação obrigatória)
- **Autoridades Certificadoras:** Serasa, Certisign, Valid, etc.

**Fonte:** [ITI - Certificado Digital](https://www.gov.br/iti/pt-br/assuntos/certificado-digital)

---

## 4. CNES - CADASTRO OBRIGATÓRIO

### 4.1 Obrigatoriedade

O **Cadastro Nacional de Estabelecimentos de Saúde** é obrigatório para:
- Todos os estabelecimentos de saúde (públicos e privados)
- Prestadores que desejam faturar convênios
- Recebimento de valores de planos de saúde

**Base Legal:** Artigos 358 a 362 da legislação sanitária

### 4.2 Uso no Padrão TISS

A ANS utiliza o número CNES para:
- Identificar prestadores na rede das operadoras
- Analisar instalações e serviços oferecidos
- Validar credenciamento

### 4.3 Manutenção

- **Atualização obrigatória:** A cada 6 meses
- **Portal:** https://cnes.datasus.gov.br/

**Fonte:** [ANS - CNES](https://www.ans.gov.br/portal/site/perfil_prestadores/cnes.asp)

---

## 5. OPERADORAS PESQUISADAS

### 5.1 UNIMED (Prioridade Máxima)

**Perfil:**
- Maior rede de cooperativas médicas do Brasil
- ~18 milhões de beneficiários
- Estrutura federada (cada UNIMED local tem autonomia)

**Integração Técnica:**

| Canal | Tecnologia | Observações |
|-------|------------|-------------|
| Portal TISS | Web | Upload XML ou digitação manual |
| WebService | SOAP/XML | WSD-TISS (software autorizador) |
| APIs | REST/JSON | Apps Unimed Cliente/Cooperado |

**Sistemas de Gestão Integrados:** SGU, INFOMED, CARDIO, HRP, SOLUS

**Documentação:**
- Swagger disponível para APIs
- Manual do Autorizador Web
- Portal de cada UNIMED regional

**Particularidades:**
- Cada UNIMED local pode ter requisitos diferentes
- Intercâmbio entre UNIMEDs requer configuração específica
- Novo ambiente de gestão de APIs em desenvolvimento

**Portais:**
- [UNIMED Campinas WebService](https://wws2.unimedcampinas.com.br/wstiss/)
- [Manual Autorizador Web](https://unimedcentrorondonia.coop.br/portaltiss/Manual%20do%20Autorizador%20Web.pdf)

### 5.2 GEAP (Autogestão Federal)

**Perfil:**
- Maior autogestão de servidores públicos federais
- 17+ mil prestadores credenciados
- Sistema TMS para regulação e faturamento

**Integração Técnica:**

| Canal | Tecnologia | Observações |
|-------|------------|-------------|
| Portal TMS | Web | True Auditoria |
| Autorizador | Web | Login com CPF |

**Inovações Recentes:**
- Projeto AFR (Automação do Faturamento e Relacionamento)
- Inteligência Artificial para autorização de procedimentos
- Biometria (reconhecimento facial/digital)
- CRM integrado para relacionamento

**Documentação:**
- [Manual TMS](https://www.geap.org.br/wp-content/uploads/Manual-do-Prestador-TMS_V3_15_08_2024_com_recurso_glosa.pdf)
- [Portal do Prestador](https://www2.geap.com.br/auth/prestadorVue.asp)
- [Credenciamento](https://wwwapp.geap.com.br/prestador/sejaprestador/Inscricao/Index)

### 5.3 CASSI (Banco do Brasil)

**Perfil:**
- Maior autogestão em saúde do país
- 81 anos de existência
- Funcionários e aposentados BB + familiares

**Integração Técnica:**
- Projeto AFR implementado (autorização em tempo real)
- Biometria e dupla autenticação
- CRM integrado

**Contato:**
- Central: 0800 729 0080
- Portal: https://www.cassi.com.br/credenciado-cassi/

### 5.4 Postal Saúde (Correios)

**Perfil:**
- Caixa de Assistência dos Empregados dos Correios

**Integração Técnica:**

| Canal | Tecnologia | Observações |
|-------|------------|-------------|
| Benner CONECTA | Portal | Upload XML, digitação, webservice |
| Autorizador Web | Web | Elegibilidade e autorização |

**Versão TISS Recomendada:** 3.02.01 (com TUSS obrigatório)

**Portais:**
- [Central do Credenciado](https://apps.postalsaude.com.br/credenciado)
- [Portal TISS](https://apps.postalsaude.com.br/credenciado/portal-tiss)

### 5.5 Amil (UnitedHealth Group)

**Perfil:**
- Uma das maiores operadoras privadas
- Crescimento de 101 mil novos beneficiários (março/2024)

**Integração Técnica:**

| Canal | Tecnologia | Observações |
|-------|------------|-------------|
| Portal SIS AMIL | Web | Guias, faturamento, demonstrativos |
| WebService | SOAP | Envio XML |
| Upload | Web | Arquivos XML |

**Versão TISS:** 4.01 (obrigatória desde 31/12/2024)

**Documentação:**
- [Manual Faturamento Eletrônico](https://credenciado.amil.com.br/gerdoc/1573156786263manual_faturamento_eletronico_amil_v3_(1).pdf)
- [Portal Credenciado](https://credenciado.amil.com.br/)

### 5.6 Bradesco Saúde

**Perfil:**
- Líder do setor desde 1984
- Ampla rede credenciada nacional

**Integração Técnica:**

| Canal | Tecnologia | Observações |
|-------|------------|-------------|
| Portal Referenciado | Web | Login com usuário Master |
| Upload XML | Web | Lotes de até 100 atendimentos |
| Digitação | Web | Manual de guias |

**Documentação:**
- [Portal do Prestador](https://wwws.bradescosaude.com.br/PCBS-GerenciadorPortal/td/loginReferenciado.do)
- [Seja um Referenciado](https://www.bradescoseguros.com.br/clientes/produtos/plano-saude/servicos/seja-um-referenciado)
- Cartilha "Resumo do Manual de Preenchimento das Guias TISS"

### 5.7 SulAmérica Saúde

**Perfil:**
- 120+ anos de experiência
- Telemedicina e programas preventivos

**Integração Técnica:**

| Canal | Tecnologia | Observações |
|-------|------------|-------------|
| Portal Digitação | Web | SulAmérica Saúde Online |
| Upload XML | Web | Arquivo eletrônico |
| WebService | SOAP | Credenciais via tiss@sulamerica.com.br |

**Recurso de Glosa:** RGE (Recurso de Glosa Eletrônico) via Orizon

**Prazos de Faturamento:**
- Clínicas/Laboratórios: 90 dias da data do atendimento
- Hospitais: 90 dias da data da alta

**Documentação:**
- [Manual Referenciado TISS](https://saude.sulamericaseguros.com.br/prestador/informativos/manual_referenciado_TISS_2021.pdf)
- [Manual Faturamento](https://www.sulamericasaudeonline.com.br/est_saudeonline/prestador/tiss/manual/Manual%20Referenciado%20Saude%20Online.pdf)
- [Portal Prestador](https://saude.sulamericaseguros.com.br/prestador/login/)

---

## 6. WEBSERVICES TISS - ESPECIFICAÇÃO TÉCNICA

### 6.1 Mensagens Disponíveis

```
┌─────────────────────────────────────────────────────────────┐
│              WEBSERVICES TISS - OPERAÇÕES                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ELEGIBILIDADE                                              │
│  ├─ VerificaElegibilidade    → Confirma direitos do benefic.│
│  └─ ConfirmacaoElegibilidade ← Resposta da operadora        │
│                                                             │
│  AUTORIZAÇÃO                                                │
│  ├─ SolicitacaoProcedimento  → Pede autorização SP/SADT     │
│  ├─ SolicitacaoStatusAutorizacao → Consulta status          │
│  └─ AutorizacaoProcedimentos ← Resposta com detalhes        │
│                                                             │
│  FATURAMENTO                                                │
│  ├─ EnvioLoteGuias           → Lote de guias para cobrança  │
│  ├─ RecebimentoLote          ← Confirmação de recebimento   │
│  └─ DemonstrativoAnalise     ← Resultado da análise         │
│                                                             │
│  OPERACIONAIS                                               │
│  ├─ CancelaGuia              → Cancela guia(s)              │
│  └─ ComunicacaoBeneficiario  → Informa internação/alta      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Estrutura XML

**Padrão de Nomenclatura:**
```
[NumeroLote_20posições][HashMD5].xml
```

**Schema XSD:**
- Disponível no portal ANS
- Versionado por atualização
- Validação obrigatória antes do envio

### 6.3 Requisitos do Prestador

1. **Certificado Digital** (e-CPF ou e-CNPJ ICP-Brasil)
2. **Software/Sistema** que consuma WSDL
3. **Schemas XSD** da versão vigente
4. **CNES** cadastrado e atualizado

---

## 7. GUIAS TISS - TIPOS E CAMPOS

### 7.1 Tipos de Guias

| Guia | Uso | Código |
|------|-----|--------|
| **Consulta** | Consultas médicas | - |
| **SP/SADT** | Exames, terapias, pequenas cirurgias | - |
| **Honorários Individuais** | Honorários médicos | - |
| **Resumo de Internação** | Internações hospitalares | - |
| **Outras Despesas** | Materiais, medicamentos | - |
| **Odontológica** | Procedimentos odontológicos | - |

### 7.2 Guia SP/SADT - Campos Obrigatórios

```
SEÇÃO                          | CAMPOS OBRIGATÓRIOS
───────────────────────────────┼─────────────────────
Dados da Autorização           | 2 campos
Dados do Beneficiário          | 2 campos
Dados do Solicitante           | 4 campos
Procedimentos Solicitados      | 1 campo
Dados do Contratado Executante | 3 campos
Dados do Atendimento           | 1 campo
Valores Monetários             | 1 campo
```

### 7.3 Novos Campos (TISS 4.00.01+)

- Nome Social
- Cobertura Especial
- Regime de Atendimento
- Saúde Ocupacional (tabela 77)
- Unidade de Medidas
- Código de Despesa

---

## 8. GLOSAS - PREVENÇÃO E TRATAMENTO

### 8.1 Estatísticas

> **20-30%** das contas hospitalares sofrem glosas (Instituto de Estudos de Saúde Suplementar)

### 8.2 Tipos de Glosas

| Tipo | Descrição | Correção |
|------|-----------|----------|
| **Administrativa** | Preenchimento incorreto, erros de digitação | Simples |
| **Técnica** | Valores incorretos, procedimentos não autorizados | Complexa |
| **Linear** | Aplicada a todos os itens de uma conta | Requer recurso |

### 8.3 Glosas Mais Frequentes

| Código | Descrição | Como Evitar |
|--------|-----------|-------------|
| **1818** | Procedimento sem autorização prévia | Solicitar autorização antes |
| **1414** | Senha expirada | Verificar validade |
| **1714** | Valor superior à tabela | Usar tabela correta |

### 8.4 Estratégias de Prevenção

1. **Validar guias TISS antes do envio** (schema XSD)
2. **Conferir datas** (execução após autorização)
3. **Usar sistema digital** com validação automática
4. **Configurar regras por operadora**
5. **Automatizar faturamento TISS**
6. **Sincronizar tabela TUSS** mensalmente

### 8.5 Recurso de Glosa

- Prazo: geralmente 30-60 dias
- Canal: portal da operadora ou RGE (Recurso de Glosa Eletrônico)
- Documentação: comprovantes, justificativas técnicas

---

## 9. ARQUITETURA PROPOSTA PARA GENESIS OS

### 9.1 Visão Geral

```
┌─────────────────────────────────────────────────────────────┐
│                    GENESIS OS - MÓDULO TISS                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐    ┌──────────────────┐              │
│  │  FRONTEND        │    │  CLOUD FUNCTIONS │              │
│  │  ──────────────  │    │  ──────────────  │              │
│  │  • Guias TISS    │    │  • TISSProcessor │              │
│  │  • Faturamento   │───▶│  • XMLGenerator  │              │
│  │  • Glosas        │    │  • Validador XSD │              │
│  │  • Demonstrativos│    │  • Assinador     │              │
│  └──────────────────┘    └────────┬─────────┘              │
│                                   │                         │
│                                   ▼                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    FIRESTORE                          │  │
│  │  ─────────────────────────────────────────────────   │  │
│  │  • guias/{guiaId}         → Dados da guia            │  │
│  │  • lotes/{loteId}         → Lotes enviados           │  │
│  │  • demonstrativos/{id}    → Retornos das operadoras  │  │
│  │  • glosas/{glosaId}       → Glosas e recursos        │  │
│  │  • convenios/{convenioId} → Config. por operadora    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              INTEGRAÇÕES EXTERNAS                     │  │
│  │  ─────────────────────────────────────────────────   │  │
│  │  • WebService TISS (SOAP)  → Cada operadora          │  │
│  │  • Portal Upload (HTTP)    → Fallback                │  │
│  │  • ICP-Brasil (Assinatura) → Certificado digital     │  │
│  │  • TUSS (Tabelas)          → Sincronização mensal    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 9.2 Componentes Necessários

#### Frontend (React/TypeScript)

```
src/plugins/convenios/
├── components/
│   ├── GuiaConsulta.tsx        # Formulário guia consulta
│   ├── GuiaSPSADT.tsx          # Formulário guia SP/SADT
│   ├── GuiaHonorarios.tsx      # Formulário honorários
│   ├── LoteGuias.tsx           # Agrupamento em lotes
│   ├── FaturamentoList.tsx     # Lista de faturamentos
│   ├── GlosasList.tsx          # Lista de glosas
│   ├── RecursoGlosa.tsx        # Formulário de recurso
│   └── DemonstrativoView.tsx   # Visualização de demonstrativos
├── hooks/
│   ├── useTUSS.ts              # Busca códigos TUSS
│   ├── useGuia.ts              # CRUD de guias
│   ├── useLote.ts              # Gerenciamento de lotes
│   ├── useElegibilidade.ts     # Verificação elegibilidade
│   └── useOperadora.ts         # Config por operadora
├── services/
│   ├── tiss.service.ts         # Chamadas API TISS
│   └── validador.service.ts    # Validação frontend
└── types/
    └── tiss.types.ts           # Tipos TypeScript TISS
```

#### Backend (Cloud Functions)

```
functions/src/tiss/
├── xml/
│   ├── generator.ts            # Gera XML TISS
│   ├── parser.ts               # Parse respostas XML
│   └── schemas/                # XSD schemas (versionados)
├── signature/
│   ├── signer.ts               # Assinatura digital
│   └── validator.ts            # Valida assinaturas
├── webservice/
│   ├── client.ts               # Cliente SOAP genérico
│   ├── elegibilidade.ts        # VerificaElegibilidade
│   ├── autorizacao.ts          # SolicitacaoProcedimento
│   ├── faturamento.ts          # EnvioLoteGuias
│   └── operadoras/
│       ├── unimed.ts           # Config UNIMED
│       ├── amil.ts             # Config Amil
│       ├── bradesco.ts         # Config Bradesco
│       ├── sulamerica.ts       # Config SulAmérica
│       ├── geap.ts             # Config GEAP
│       └── cassi.ts            # Config CASSI
├── sync/
│   ├── tuss.ts                 # Sincroniza tabela TUSS
│   └── schemas.ts              # Atualiza schemas XSD
├── triggers/
│   ├── onGuiaCreated.ts        # Valida guia criada
│   ├── onLoteEnviado.ts        # Processa envio
│   └── onRespostaRecebida.ts   # Processa resposta
└── scheduler/
    ├── syncTUSS.ts             # Atualização mensal TUSS
    └── checkPendentes.ts       # Verifica lotes pendentes
```

### 9.3 Fluxo de Faturamento

```
┌─────────────────────────────────────────────────────────────┐
│               FLUXO DE FATURAMENTO TISS                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. ATENDIMENTO                                             │
│     └─ Médico atende paciente                               │
│     └─ Sistema cria registro do atendimento                 │
│                                                             │
│  2. ELEGIBILIDADE (opcional)                                │
│     └─ Verifica se beneficiário está ativo                  │
│     └─ Confirma cobertura do procedimento                   │
│                                                             │
│  3. AUTORIZAÇÃO (se necessário)                             │
│     └─ Solicita autorização prévia via WebService           │
│     └─ Aguarda resposta (senha)                             │
│                                                             │
│  4. GERAÇÃO DA GUIA                                         │
│     └─ Preenche campos obrigatórios                         │
│     └─ Valida contra schema XSD                             │
│     └─ Calcula hash MD5                                     │
│                                                             │
│  5. AGRUPAMENTO EM LOTE                                     │
│     └─ Agrupa até 100 guias por lote                        │
│     └─ Gera XML do lote                                     │
│     └─ Assina digitalmente (ICP-Brasil)                     │
│                                                             │
│  6. ENVIO                                                   │
│     └─ WebService: SOAP request                             │
│     └─ Portal: Upload XML                                   │
│     └─ Registra protocolo de envio                          │
│                                                             │
│  7. ACOMPANHAMENTO                                          │
│     └─ Consulta status do lote                              │
│     └─ Recebe demonstrativo de análise                      │
│     └─ Identifica glosas                                    │
│                                                             │
│  8. RECURSO DE GLOSA (se necessário)                        │
│     └─ Analisa motivo da glosa                              │
│     └─ Prepara documentação                                 │
│     └─ Envia recurso eletrônico                             │
│                                                             │
│  9. RECEBIMENTO                                             │
│     └─ Confirma pagamento                                   │
│     └─ Concilia com financeiro                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 9.4 Modelo de Dados (Firestore)

```typescript
// convenios/{convenioId}
interface Convenio {
  id: string;
  nome: string;                    // "UNIMED Campinas"
  registroANS: string;             // Código ANS
  tipo: 'cooperativa' | 'seguradora' | 'autogestao' | 'medicina_grupo';

  // Configuração técnica
  webservice: {
    url: string;                   // URL do WebService
    versaoTISS: string;            // "4.01.00"
    timeout: number;               // ms
  };

  // Credenciais (criptografadas)
  credenciais: {
    usuario: string;
    token: string;                 // Encrypted
  };

  // Tabelas de valores
  tabelas: {
    procedimentos: string;         // "TUSS" | "CBHPM" | "propria"
    materiais: string;             // "SIMPRO" | "BRASINDICE"
  };

  // Prazos
  prazos: {
    faturamento: number;           // dias
    recursoGlosa: number;          // dias
  };

  ativo: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// guias/{guiaId}
interface GuiaTISS {
  id: string;
  tipo: 'consulta' | 'spsadt' | 'honorarios' | 'internacao' | 'odonto';

  // Referências
  convenioId: string;
  pacienteId: string;
  profissionalId: string;
  atendimentoId: string;

  // Dados TISS
  numeroGuia: string;              // Gerado pelo sistema
  numeroCarteira: string;          // Carteirinha do beneficiário
  autorizacao?: {
    numero: string;
    dataValidade: Timestamp;
  };

  // Procedimentos
  procedimentos: Array<{
    codigo: string;                // Código TUSS
    descricao: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
  }>;

  // Valores
  valorTotal: number;

  // Status
  status: 'rascunho' | 'validada' | 'enviada' | 'processada' | 'paga' | 'glosada';

  // Validação
  validacao: {
    valida: boolean;
    erros: string[];
    validadaEm: Timestamp;
  };

  // XML gerado
  xml?: string;                    // Base64
  hashMD5?: string;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// lotes/{loteId}
interface LoteTISS {
  id: string;
  convenioId: string;

  // Identificação
  numeroLote: string;              // 20 caracteres
  hashLote: string;                // MD5

  // Guias incluídas
  guias: string[];                 // Array de guiaIds
  quantidadeGuias: number;
  valorTotal: number;

  // Status
  status: 'pendente' | 'enviado' | 'processando' | 'finalizado' | 'erro';

  // Envio
  envio?: {
    dataEnvio: Timestamp;
    protocolo: string;
    xml: string;                   // Base64
    assinatura: string;            // Base64
  };

  // Resposta
  resposta?: {
    dataResposta: Timestamp;
    xml: string;
    status: 'aceito' | 'rejeitado' | 'parcial';
    mensagem: string;
  };

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// glosas/{glosaId}
interface Glosa {
  id: string;
  guiaId: string;
  loteId: string;
  convenioId: string;

  // Detalhes
  codigoGlosa: string;             // Ex: "1818"
  descricao: string;
  valorGlosado: number;
  procedimentoAfetado: string;     // Código TUSS

  // Recurso
  recurso?: {
    dataRecurso: Timestamp;
    justificativa: string;
    documentos: string[];          // URLs Storage
    status: 'enviado' | 'em_analise' | 'deferido' | 'indeferido';
    resposta?: string;
  };

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## 10. ROADMAP DE IMPLEMENTAÇÃO

### 10.1 MVP (3 meses)

**Operadoras:** UNIMED local + 1 autogestão (GEAP ou CASSI)

| Semana | Entrega |
|--------|---------|
| 1-2 | Modelo de dados Firestore + tipos TypeScript |
| 3-4 | Gerador XML TISS (guia consulta + SP/SADT) |
| 5-6 | Validador XSD + integração certificado digital |
| 7-8 | WebService client (elegibilidade + envio lote) |
| 9-10 | Frontend: formulários de guias |
| 11-12 | Testes + homologação com operadora |

### 10.2 Fase 2 (3 meses)

**Operadoras:** + Amil, Bradesco, SulAmérica

| Semana | Entrega |
|--------|---------|
| 1-4 | Adaptar WebService para cada operadora |
| 5-8 | Sistema de glosas + recurso eletrônico |
| 9-10 | Dashboard de faturamento |
| 11-12 | Sincronização TUSS automática |

### 10.3 Fase 3 (2 meses)

**Melhorias:**

- Autorização prévia online
- Relatórios de produtividade
- Alertas de prazos
- Integração n8n para automações

---

## 11. RISCOS E MITIGAÇÕES

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Mudança de versão TISS | Alta | Médio | Monitorar ANS, manter schemas atualizados |
| Diferenças entre operadoras | Alta | Alto | Configuração modular por operadora |
| Certificado digital expirado | Média | Alto | Alertas de renovação |
| Glosas frequentes | Alta | Médio | Validação rigorosa antes do envio |
| Timeout WebService | Média | Baixo | Retry automático + fallback portal |
| Mudança de API operadora | Média | Alto | Abstrair integrações, testes de regressão |

---

## 12. FONTES E REFERÊNCIAS

### Legislação e ANS

- [Portal ANS - TISS](https://www.gov.br/ans/pt-br/assuntos/prestadores/padrao-para-troca-de-informacao-de-saude-suplementar-2013-tiss)
- [RN 501/2022](https://bvsms.saude.gov.br/bvs/saudelegis/ans/2022/res0501_01_04_2022.html)
- [RN 489/2022 - Penalidades](https://www.legisweb.com.br/legislacao/?id=429817)
- [TUSS - Dados.gov.br](https://dados.gov.br/dados/conjuntos-dados/terminologia-unificada-da-saude-suplementar-tuss)

### Certificação Digital

- [ITI - Certificado Digital](https://www.gov.br/iti/pt-br/assuntos/certificado-digital)
- [Serasa - ICP-Brasil](https://www.serasaexperian.com.br/conteudos/icp-brasil-e-o-certificado-digital/)

### Operadoras

- [UNIMED Brasil](https://www.unimed.coop.br/)
- [GEAP](https://www.geap.org.br/)
- [CASSI](https://www.cassi.com.br/)
- [Postal Saúde](https://www.postalsaude.com.br/)
- [Amil Credenciado](https://credenciado.amil.com.br/)
- [Bradesco Prestador](https://wwws.bradescosaude.com.br/PCBS-GerenciadorPortal/td/loginReferenciado.do)
- [SulAmérica Prestador](https://saude.sulamericaseguros.com.br/prestador/login/)

### Ferramentas

- [Validador TISS](https://www.validadortiss.com.br/)
- [CNES - DATASUS](https://cnes.datasus.gov.br/)

---

## 13. CONCLUSÃO

A implementação do módulo de convênios TISS no Genesis OS é **tecnicamente viável** e **altamente valiosa** para clínicas que atendem planos de saúde.

**Próximos Passos:**
1. ✅ Pesquisa concluída (este documento)
2. ⏳ Definir operadora(s) para MVP
3. ⏳ Obter credenciais de homologação
4. ⏳ Adquirir certificado digital de teste
5. ⏳ Iniciar desenvolvimento do modelo de dados

**Recomendação:** Começar com UNIMED local (maior volume) + GEAP (processo mais padronizado) como operadoras piloto.

---

*Documento gerado automaticamente por Claude Code*
*Última atualização: 22/12/2024*
