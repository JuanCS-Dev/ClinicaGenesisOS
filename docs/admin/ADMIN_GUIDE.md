---
version: 1.0.0
last_updated: 2025-12-22
author: Genesis Team
status: published
---

# ⚙️ Genesis - Guia do Administrador

> **Manual completo para administração de clínicas no Genesis**

---

## 📑 Índice

1. [Primeiros Passos](#1-primeiros-passos)
2. [Gestão de Usuários](#2-gestão-de-usuários)
3. [Configurações da Clínica](#3-configurações-da-clínica)
4. [Especialidades e Serviços](#4-especialidades-e-serviços)
5. [Integrações](#5-integrações)
6. [Relatórios Gerenciais](#6-relatórios-gerenciais)
7. [Backup e Recuperação](#7-backup-e-recuperação)
8. [Segurança](#8-segurança)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Primeiros Passos

### 1.1 Acessando o Painel Admin

1. Faça login no Genesis
2. Vá em **Configurações** (⚙️ ícone no menu)
3. Apenas usuários com role `admin` veem todas as opções

### 1.2 Overview do Painel

```
┌─────────────────────────────────────────────────┐
│  ⚙️ Configurações                               │
├─────────────────────────────────────────────────┤
│  👥 Usuários                                    │
│  🏥 Clínica                                     │
│  📋 Especialidades                              │
│  🔗 Integrações                                 │
│  💳 Pagamentos                                  │
│  🔐 Segurança                                   │
│  📊 Relatórios                                  │
│  🔄 Backup                                      │
└─────────────────────────────────────────────────┘
```

---

## 2. Gestão de Usuários

### 2.1 Roles e Permissões

| Role | Permissões |
|------|------------|
| **Admin** | Acesso total (usuários, config, relatórios) |
| **Doctor** | Pacientes, agenda, prontuário, IA, prescrição |
| **Receptionist** | Pacientes, agenda (sem prontuário) |
| **Financial** | Financeiro, relatórios, TISS |

### 2.2 Adicionando um Usuário

1. Vá em **Configurações > Usuários**
2. Clique em **"+ Adicionar Usuário"**

3. Preencha:
```
Nome:         [Dr. João Silva           ]
Email:        [joao@clinica.com.br      ]
Role:         [Doctor                ▼  ]
Especialidade:[Cardiologia            ▼  ]
CRM:          [12345                    ]
Estado:       [SP                     ▼  ]
```

4. Clique em **"Convidar"**

O usuário receberá um email para definir senha.

### 2.3 Editando Permissões

1. Clique no usuário na lista
2. Altere o **Role** conforme necessário
3. Salve

### 2.4 Desativando um Usuário

⚠️ **Não exclua usuários** que já realizaram atendimentos (para manter histórico).

**Opção recomendada: Desativar**

1. Clique no usuário
2. Toggle **"Ativo"** para OFF
3. O usuário não consegue mais fazer login
4. Histórico é preservado

### 2.5 Auditoria de Acessos

Veja quem acessou o sistema:

1. **Configurações > Segurança > Logs de Acesso**
2. Filtros:
   - Usuário
   - Data
   - Ação (login, visualizar paciente, editar, etc.)

---

## 3. Configurações da Clínica

### 3.1 Informações Básicas

```
┌─────────────────────────────────────────────────┐
│  🏥 Dados da Clínica                            │
├─────────────────────────────────────────────────┤
│  Nome:            [Clínica Genesis            ] │
│  CNPJ:            [12.345.678/0001-00         ] │
│  Telefone:        [(11) 3333-3333             ] │
│  Email:           [contato@clinica.com.br     ] │
│                                                 │
│  Endereço:        [Rua Exemplo, 123           ] │
│  Bairro:          [Centro                     ] │
│  Cidade:          [São Paulo                  ] │
│  Estado:          [SP                       ▼ ] │
│  CEP:             [01234-000                  ] │
└─────────────────────────────────────────────────┘
```

### 3.2 Logo e Identidade Visual

1. **Configurações > Clínica > Logo**
2. Faça upload da logo (PNG ou SVG)
3. Recomendado: 512x512px, fundo transparente
4. A logo aparece em:
   - Sidebar
   - Prescrições
   - Relatórios
   - Emails

### 3.3 Horário de Funcionamento

Configure os horários de cada dia:

```
Segunda:   08:00 - 18:00  [✓ Ativo]
Terça:     08:00 - 18:00  [✓ Ativo]
Quarta:    08:00 - 18:00  [✓ Ativo]
Quinta:    08:00 - 18:00  [✓ Ativo]
Sexta:     08:00 - 17:00  [✓ Ativo]
Sábado:    08:00 - 12:00  [✓ Ativo]
Domingo:   Fechado        [  Ativo]
```

Isso afeta:
- Disponibilidade na agenda
- Bloqueio automático de horários fora do expediente

### 3.4 Feriados

1. **Configurações > Clínica > Feriados**
2. Importe feriados nacionais (automático)
3. Adicione feriados locais/municipais
4. Agenda bloqueia automaticamente esses dias

---

## 4. Especialidades e Serviços

### 4.1 Especialidades Oferecidas

Marque as especialidades da sua clínica:

- [ ] Medicina Geral
- [ ] Cardiologia
- [ ] Dermatologia
- [ ] Ginecologia
- [ ] Pediatria
- [ ] Psicologia
- [ ] Nutrição
- [ ] Fisioterapia
- [ ] Odontologia
- [ ] Estética

Isso afeta:
- Filtros de busca
- Templates de prontuário
- Plugins disponíveis

### 4.2 Tabela de Procedimentos

Configure valores e códigos TISS:

| Procedimento | Cód. TISS | Duração | Valor Particular | Valor Convênio |
|--------------|-----------|---------|------------------|----------------|
| Consulta | 10101012 | 30min | R$ 300 | R$ 180 |
| Retorno | 10101020 | 20min | R$ 150 | R$ 90 |
| ECG | 20104022 | 15min | R$ 80 | R$ 50 |

**Como adicionar**:

1. **Configurações > Serviços > + Novo Procedimento**
2. Preencha nome, código TISS, duração, valores
3. Salve

---

## 5. Integrações

### 5.1 PIX

#### Configuração:

1. **Configurações > Integrações > PIX**
2. Preencha:
```
Chave PIX:       [sua-chave@email.com     ]
Nome Favorecido: [Clínica Genesis LTDA    ]
Instituição:     [Banco do Brasil      ▼  ]
```

3. Clique em **"Testar"** para gerar QR Code de teste
4. Salve

**Como funciona**:
- Ao registrar pagamento via PIX, o sistema gera QR Code automaticamente
- Paciente escaneia e paga
- Não há intermediação (0% fee)

### 5.2 Stripe (Boleto e Cartão)

#### Setup:

1. Crie conta no [Stripe](https://stripe.com/br)
2. Obtenha:
   - Publishable Key
   - Secret Key
   - Webhook Secret

3. **Configurações > Integrações > Stripe**

```
Publishable Key: [pk_live_xxxxxxxxxxxxxxxx    ]
Secret Key:      [sk_live_xxxxxxxxxxxxxxxx    ]
Webhook Secret:  [whsec_xxxxxxxxxxxxxxxxxx    ]
```

4. Configure webhook no Stripe para:
```
URL: https://genesis.health/api/stripe/webhook
Events: payment_intent.succeeded, payment_intent.failed
```

5. Salve

### 5.3 Memed (Prescrição Digital)

#### Setup:

1. Crie conta no [Memed](https://memed.com.br)
2. Obtenha API Key (plano profissional)

3. **Configurações > Integrações > Memed**

```
API Key: [your-memed-api-key            ]
```

4. Cada médico deve:
   - Conectar e-CPF (certificado digital)
   - Fazer login no Memed via Genesis

### 5.4 Jitsi Meet (Telemedicina)

**Opção 1: Usar servidor público (padrão)**
- Usa meet.jit.si (gratuito)
- Limite: 50 participantes por sala
- Sem customização

**Opção 2: Self-hosted (avançado)**
1. Configure servidor Jitsi próprio
2. **Configurações > Integrações > Jitsi**

```
Domain:     [meet.clinica.com.br         ]
JWT Secret: [your-jwt-secret             ]
```

3. Todas as videochamadas usarão seu servidor

---

## 6. Relatórios Gerenciais

### 6.1 Dashboard Executivo

Acesse **Relatórios > Dashboard**

**KPIs Principais**:
- Total de atendimentos (dia/semana/mês)
- Receita total
- Ticket médio
- Taxa de ocupação
- Taxa de no-show (faltas)
- Novos pacientes

**Gráficos**:
- Evolução de atendimentos (linha)
- Receita por especialidade (pizza)
- Horários mais ocupados (heatmap)

### 6.2 Relatório Financeiro

**Configurações > Relatórios > Financeiro**

**Filtros**:
- Período
- Categoria
- Método de pagamento
- Profissional

**Visualizações**:
- Receitas vs Despesas
- Fluxo de caixa
- Margem de contribuição por serviço
- Inadimplência

**Exportar**: Excel, PDF, CSV

### 6.3 Relatório de Produtividade

Por profissional:
- Atendimentos realizados
- Horas trabalhadas
- Receita gerada
- Tempo médio por consulta
- Taxa de retorno

### 6.4 Relatório TISS

**Configurações > Relatórios > TISS**

- Guias enviadas por período
- Taxa de glosa (por convênio)
- Faturamento por convênio
- Pendências

### 6.5 Relatório LGPD

**Configurações > Relatórios > LGPD**

- Consentimentos coletados
- Exportações de dados solicitadas
- Exclusões (direito ao esquecimento)
- Auditoria de acessos a dados sensíveis

---

## 7. Backup e Recuperação

### 7.1 Backup Automático

✅ **Firebase faz backup automático**:
- Backup diário incremental
- Retenção: 30 dias
- Redundância geográfica

**Você não precisa fazer nada!**

### 7.2 Exportação Manual

Para ter cópia local:

1. **Configurações > Backup > Exportar Dados**
2. Selecione o que exportar:
   - [ ] Pacientes
   - [ ] Agendamentos
   - [ ] Prontuários
   - [ ] Transações
   - [ ] Usuários

3. Clique em **"Exportar"**
4. Download de arquivo ZIP com JSONs

**Frequência recomendada**: Mensal

### 7.3 Recuperação de Dados

Em caso de exclusão acidental:

1. **Configurações > Backup > Recuperar**
2. Selecione o período
3. Escolha os registros a recuperar
4. Confirme

**Importante**: Recuperação disponível por até 30 dias após exclusão.

---

## 8. Segurança

### 8.1 Autenticação de Dois Fatores (2FA)

**Forçar 2FA para todos os usuários**:

1. **Configurações > Segurança > 2FA**
2. Toggle **"Obrigatório"** para ON
3. Usuários serão solicitados a configurar 2FA no próximo login

**Métodos suportados**:
- Authenticator app (Google Authenticator, Authy)
- SMS (menos seguro)

### 8.2 Política de Senhas

Configure requisitos mínimos:

```
Comprimento mínimo:      [8        ] caracteres
Requer maiúsculas:       [✓]
Requer minúsculas:       [✓]
Requer números:          [✓]
Requer caracteres especiais: [✓]
Expiração:               [90       ] dias (0 = nunca)
```

### 8.3 Sessões Ativas

Monitore sessões ativas:

1. **Configurações > Segurança > Sessões**
2. Veja:
   - Usuário
   - Dispositivo
   - IP
   - Última atividade

3. Pode **forçar logout** de sessões suspeitas

### 8.4 Whitelist de IPs (Opcional)

Para clínicas que querem restringir acesso a IPs específicos:

1. **Configurações > Segurança > Whitelist**
2. Adicione IPs permitidos:
```
Escritório: 200.123.45.67
VPN:        200.123.45.68
```

3. Ative **"Apenas IPs da whitelist"**

⚠️ **Cuidado**: Isso bloqueia acesso de outros locais (telemedicina, home office).

---

## 9. Troubleshooting

### 9.1 Problemas Comuns

#### Usuário não recebe email de convite

**Causas**:
- Email incorreto
- Bloqueio por spam

**Soluções**:
1. Verifique o email
2. Peça para checar pasta de spam
3. Adicione `noreply@genesis.health` aos contatos
4. Reenvie o convite

#### Pagamento PIX não confirma automaticamente

**Causas**:
- Chave PIX manual (não automatizada)
- Webhook não configurado

**Solução**:
- Use chaves PIX de bancos com API (Mercado Pago, Stripe)
- Ou confirme manualmente em **Financeiro > Transações**

#### AI Scribe não funciona

**Causas**:
- Microfone não autorizado
- Cota de API excedida

**Soluções**:
1. Verifique permissões do navegador
2. Teste em Chrome/Edge (melhor suporte)
3. Verifique **Configurações > Integrações > OpenAI** (cota)

#### Telemedicina com áudio/vídeo ruim

**Causas**:
- Internet lenta
- Muitos participantes

**Soluções**:
1. Teste velocidade: speedtest.net (mínimo 5 Mbps)
2. Feche outros apps
3. Use cabo de rede (não WiFi)
4. Reduza qualidade de vídeo (configurações do Jitsi)

### 9.2 Logs do Sistema

Para diagnóstico avançado:

1. **Configurações > Sistema > Logs**
2. Filtre por:
   - Nível (Error, Warning, Info)
   - Período
   - Módulo

3. Exporte para enviar ao suporte

### 9.3 Status da Plataforma

Verifique se há instabilidades:

- **Status Page**: [status.genesis.health](https://status.genesis.health)
- Uptime: 99.9%
- Incidentes: Histórico público

### 9.4 Contato com Suporte

| Canal | Resposta | Horário |
|-------|----------|---------|
| 💬 Chat (in-app) | < 5 min | 24/7 |
| 📧 Email (suporte@genesis.health) | < 2h | Seg-Sex 8h-18h |
| 📞 Telefone | Imediato | Emergências |

**Para suporte prioritário**:
- Planos Enterprise: Telefone dedicado + Account Manager

---

## 10. Melhores Práticas

### 10.1 Onboarding de Equipe

1. **Dia 1**: Admin configura clínica
2. **Dia 2**: Adiciona usuários e faz tour
3. **Dia 3-7**: Uso em modo "sandbox" (pacientes de teste)
4. **Dia 8**: Go-live com pacientes reais

### 10.2 Manutenção Regular

**Semanal**:
- Revisar logs de erro
- Checar sessões ativas

**Mensal**:
- Exportar backup manual
- Revisar relatórios financeiros
- Atualizar tabela de procedimentos (se houver mudanças)

**Trimestral**:
- Revisar permissões de usuários
- Auditar acessos (LGPD)
- Renovar integrações (certificados digitais)

### 10.3 Treinamento Contínuo

- **Genesis Academy**: Cursos online gratuitos
- **Webinars**: Novidades mensais
- **Documentação**: Sempre atualizada

---

<p align="center">
  <strong>⚙️ Genesis - Administração Simples e Poderosa</strong>
</p>

