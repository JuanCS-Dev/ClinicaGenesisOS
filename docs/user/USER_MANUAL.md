---
version: 1.0.0
last_updated: 2025-12-22
author: Genesis Team
status: published
---

# 📖 Genesis - Manual do Usuário

> **Guia completo para médicos, recepcionistas e profissionais de saúde**

---

## 📑 Índice

1. [Primeiros Passos](#1-primeiros-passos)
2. [Agenda](#2-agenda)
3. [Pacientes](#3-pacientes)
4. [Atendimento](#4-atendimento)
5. [Inteligência Artificial](#5-inteligência-artificial)
6. [Telemedicina](#6-telemedicina)
7. [Prescrição Digital](#7-prescrição-digital)
8. [Financeiro](#8-financeiro)
9. [Relatórios](#9-relatórios)
10. [Configurações](#10-configurações)

---

## 1. Primeiros Passos

### 1.1 Acessando o Sistema

1. Acesse [genesis.health](https://genesis.health)
2. Faça login com seu email e senha
3. Se é seu primeiro acesso, você receberá um email de boas-vindas

### 1.2 Interface Principal

```
┌─────────────────────────────────────────────────────────┐
│  🏥 Genesis                            🔍 🔔 👤         │ Header
├─────────────────────────────────────────────────────────┤
│ 📅 Agenda    │                                          │
│ 👥 Pacientes │         Conteúdo Principal               │
│ 📋 Prontuário│                                          │
│ 💰 Financeiro│                                          │
│ 📊 Dashboard │                                          │
│              │                                          │
│   Sidebar    │                                          │
└─────────────────────────────────────────────────────────┘
```

### 1.3 Atalhos de Teclado

| Atalho | Ação |
|--------|------|
| `Cmd/Ctrl + K` | Abrir busca rápida |
| `Cmd/Ctrl + N` | Novo paciente |
| `Cmd/Ctrl + A` | Nova consulta |
| `Cmd/Ctrl + P` | Nova prescrição |
| `Esc` | Fechar modal |

---

## 2. Agenda

### 2.1 Visualizações

#### Visualização por Dia
- Mostra todos os agendamentos de um dia específico
- Clique nas setas ou use o calendário para navegar

#### Visualização por Semana
- Mostra 7 dias em colunas
- Ideal para planejar a semana

#### Visualização por Mês
- Visão geral do mês
- Útil para identificar disponibilidade

### 2.2 Criando um Agendamento

1. Clique em **"+ Nova Consulta"**
2. Preencha os dados:
   - **Paciente**: Busque por nome ou CPF
   - **Data e Hora**: Selecione o horário
   - **Duração**: Padrão 30 minutos
   - **Tipo**: Consulta, Retorno, Exame, etc.
   - **Observações**: Notas opcionais

3. Clique em **"Agendar"**

### 2.3 Reagendando

**Método 1: Arrastar e Soltar**
- Arraste o card da consulta para o novo horário

**Método 2: Editar**
1. Clique na consulta
2. Clique em "Editar"
3. Altere data/hora
4. Salve

### 2.4 Status de Agendamento

| Status | Cor | Significado |
|--------|-----|-------------|
| **Agendado** | 🔵 Azul | Consulta confirmada |
| **Confirmado** | 🟢 Verde | Paciente confirmou presença |
| **Em Atendimento** | 🟡 Amarelo | Consulta em andamento |
| **Concluído** | ✅ Verde | Atendimento finalizado |
| **Cancelado** | 🔴 Vermelho | Consulta cancelada |
| **Faltou** | ⚪ Cinza | Paciente não compareceu |

### 2.5 Bloqueios de Agenda

Para bloquear horários (férias, almoço, etc.):

1. Vá em **Configurações > Agenda**
2. Clique em **"+ Novo Bloqueio"**
3. Defina período e motivo
4. Salve

---

## 3. Pacientes

### 3.1 Cadastrando um Paciente

1. Clique em **"+ Novo Paciente"**
2. Preencha os dados obrigatórios:
   - Nome completo
   - CPF
   - Data de nascimento
   - Telefone
   - Email (opcional)

3. Dados adicionais:
   - Endereço
   - Convênio (se houver)
   - Contato de emergência
   - Alergias
   - Comorbidades

4. Clique em **"Salvar"**

### 3.2 Buscando Pacientes

**Busca Rápida** (`Cmd/Ctrl + K`):
- Digite nome, CPF ou telefone
- Selecione o paciente na lista

**Busca Avançada**:
- Filtros por idade, convênio, tags
- Ordenação por nome, última consulta, etc.

### 3.3 Ficha do Paciente

#### Aba: Informações Gerais
- Dados cadastrais
- Foto de perfil
- Documentos anexados

#### Aba: Timeline
Histórico cronológico com:
- 📅 Consultas
- 📋 Prontuários
- 💊 Prescrições
- 📊 Exames
- 💰 Pagamentos

#### Aba: Documentos
- Upload de exames (PDF, imagens)
- Receitas geradas
- Atestados
- Organização por pastas

#### Aba: Financeiro
- Histórico de pagamentos
- Faturas pendentes
- Relatório de gastos

### 3.4 Editando Dados

1. Abra a ficha do paciente
2. Clique em **"Editar"** (ícone de lápis)
3. Altere os campos necessários
4. Clique em **"Salvar"**

### 3.5 Excluindo Paciente (LGPD)

⚠️ **Atenção**: Esta ação é irreversível!

1. Abra a ficha do paciente
2. Clique em **"⋯" > "Excluir Paciente"**
3. Confirme digitando o nome do paciente
4. Todos os dados relacionados serão excluídos

---

## 4. Atendimento

### 4.1 Iniciando um Atendimento

1. Na **Agenda**, clique na consulta
2. Clique em **"Iniciar Atendimento"**
3. O sistema abre o **Prontuário**

### 4.2 Prontuário SOAP

#### S - Subjetivo
Queixa principal e história:
- "Paciente relata dor de cabeça há 3 dias..."
- Pode usar **AI Scribe** para transcrever automaticamente

#### O - Objetivo
Exame físico e sinais vitais:
- Pressão arterial: 120/80 mmHg
- Temperatura: 36.5°C
- Campos para medições rápidas

#### A - Avaliação
Hipóteses diagnósticas:
- Use **Diagnóstico Assistido por IA** para sugestões
- CID-10 integrado

#### P - Plano
Conduta e tratamento:
- Prescrições (integra com Memed)
- Exames solicitados
- Retorno agendado

### 4.3 Salvando o Prontuário

**Auto-save**: O sistema salva automaticamente a cada 30 segundos

**Salvar Manual**: Clique em **"Salvar"** ou `Cmd/Ctrl + S`

**Finalizar Atendimento**: Clique em **"Finalizar"** quando concluir

### 4.4 Templates de Prontuário

Economize tempo com templates por especialidade:

1. Clique em **"Templates"**
2. Selecione o modelo (ex: "Consulta Pediátrica")
3. O prontuário é preenchido com campos padrão
4. Personalize conforme necessário

### 4.5 Anexando Exames

Durante o atendimento:

1. Clique em **"📎 Anexar"**
2. Faça upload do arquivo (PDF, JPG, PNG)
3. Adicione uma descrição
4. O arquivo fica disponível na Timeline do paciente

---

## 5. Inteligência Artificial

### 5.1 AI Scribe (Transcrição Automática)

#### O que é?
Transcreve consultas em tempo real e gera o SOAP automaticamente.

#### Como usar?

1. No prontuário, clique em **"🎙 AI Scribe"**
2. Permita acesso ao microfone
3. Clique em **"Iniciar Gravação"**
4. Conduza a consulta normalmente
5. Clique em **"Parar Gravação"**
6. O sistema gera o SOAP em ~10 segundos

#### Dicas
- Fale claramente
- Evite ruídos de fundo
- Revise sempre o texto gerado

### 5.2 Diagnóstico Assistido por IA

#### O que é?
Sugere diagnósticos diferenciais baseado nos sintomas.

#### Como usar?

1. No campo **"Avaliação"**, clique em **"🧠 Sugerir Diagnósticos"**
2. O sistema analisa:
   - Sintomas descritos
   - Exame físico
   - Histórico do paciente

3. Recebe uma lista ranqueada de diagnósticos:
   ```
   1. Enxaqueca sem aura (85% confiança)
      📖 Por quê? Cefaleia unilateral + fotofobia + náusea
      📚 Referências: [Link para estudo]
   
   2. Cefaleia tensional (60% confiança)
      📖 Por quê? Dor bilateral + estresse relatado
      📚 Referências: [Link para estudo]
   ```

4. Selecione o diagnóstico apropriado ou ignore

#### Importante
⚠️ A IA é uma **ferramenta de apoio**, não substitui o julgamento clínico!

### 5.3 Análise de Exames

#### O que é?
Interpreta resultados de exames laboratoriais automaticamente.

#### Como usar?

1. Faça upload do exame (PDF ou imagem)
2. Clique em **"🔬 Analisar com IA"**
3. O sistema:
   - Extrai valores
   - Identifica alterações
   - Explica o significado
   - Sugere próximos passos

#### Exemplo de análise:

```
Hemograma Completo

✅ Hemoglobina: 14.2 g/dL (Normal)
⚠️ Leucócitos: 12.500/mm³ (Levemente elevado)
   → Pode indicar infecção ou estresse
   → Sugestão: Investigar fonte infecciosa

✅ Plaquetas: 250.000/mm³ (Normal)
```

---

## 6. Telemedicina

### 6.1 Iniciando uma Consulta Online

1. Na **Agenda**, clique na consulta de telemedicina
2. Clique em **"🎥 Iniciar Videochamada"**
3. Permita acesso à câmera e microfone
4. Compartilhe o link com o paciente (via WhatsApp/Email)
5. Aguarde o paciente entrar

### 6.2 Ferramentas da Videochamada

| Ferramenta | Função |
|------------|--------|
| 🎤 Microfone | Ligar/Desligar áudio |
| 🎥 Câmera | Ligar/Desligar vídeo |
| 🖥 Compartilhar Tela | Mostrar imagens, exames |
| 💬 Chat | Mensagens de texto |
| 🔴 Gravar | Gravar consulta (com consentimento) |

### 6.3 Gravando a Consulta

⚠️ **Importante**: Solicite consentimento do paciente!

1. Durante a videochamada, clique em **"🔴 Gravar"**
2. O paciente receberá uma notificação
3. Após aceitar, a gravação inicia
4. Clique em **"⏹ Parar"** para finalizar
5. O vídeo é salvo automaticamente no prontuário

### 6.4 Finalizando a Consulta

1. Clique em **"Encerrar Chamada"**
2. Preencha o prontuário (ou use AI Scribe)
3. Envie prescrição/atestado se necessário

---

## 7. Prescrição Digital

### 7.1 Criando uma Prescrição

1. No prontuário, clique em **"💊 Nova Prescrição"**
2. Busque o medicamento por nome
3. Preencha:
   - Dosagem
   - Via de administração
   - Frequência
   - Duração do tratamento

4. Adicione quantos medicamentos precisar
5. Clique em **"Gerar Prescrição"**

### 7.2 Assinatura Digital

**Com Certificado Digital (e-CPF)**:
1. Conecte seu token/smartcard
2. Assine digitalmente
3. A receita tem validade jurídica

**Sem Certificado Digital**:
- A prescrição é gerada em PDF
- Imprima e assine manualmente

### 7.3 Tipos de Receituário

| Tipo | Uso | Cor |
|------|-----|-----|
| **Simples** | Medicamentos comuns | Branca |
| **Controle Especial** | Antibióticos, ansiolíticos | Branca (2 vias) |
| **Receita Azul** | Psicotrópicos (Portaria 344) | Azul |

### 7.4 Enviando para o Paciente

1. Após gerar, clique em **"Enviar"**
2. Escolha o método:
   - 📧 Email
   - 📱 WhatsApp
   - 📄 Imprimir

3. O paciente recebe um código para validação na farmácia

---

## 8. Financeiro

### 8.1 Registrando um Pagamento

**Método 1: Diretamente da Consulta**
1. Na agenda, clique na consulta
2. Clique em **"💰 Registrar Pagamento"**
3. Preencha valor e método
4. Salve

**Método 2: Menu Financeiro**
1. Vá em **Financeiro > Transações**
2. Clique em **"+ Nova Transação"**
3. Selecione:
   - Tipo (Receita/Despesa)
   - Categoria
   - Valor
   - Método de pagamento
   - Paciente (se receita)

4. Salve

### 8.2 Métodos de Pagamento

| Método | Processamento | Fee |
|--------|---------------|-----|
| **PIX** | Instantâneo | 0% |
| **Boleto** | 1-3 dias úteis | 1.5% |
| **Cartão Crédito** | Instantâneo | 2.5% |
| **Dinheiro** | Manual | 0% |

### 8.3 Pagamento PIX Integrado

1. Registre o pagamento como "PIX"
2. Clique em **"Gerar QR Code"**
3. O paciente escaneia e paga na hora
4. O sistema confirma automaticamente

### 8.4 Faturamento TISS (Convênios)

1. Vá em **Financeiro > TISS**
2. Selecione o período
3. Marque as consultas a faturar
4. Clique em **"Gerar Lote TISS"**
5. O sistema gera o XML no padrão ANS
6. Faça upload no portal do convênio

### 8.5 Glosas

Quando o convênio recusar um procedimento:

1. Vá em **Financeiro > Glosas**
2. Clique na glosa
3. Veja o motivo
4. Faça o recurso ou aceite

---

## 9. Relatórios

### 9.1 Dashboard

Acesse **📊 Dashboard** para ver:

- Total de atendimentos (hoje, semana, mês)
- Receita total
- Taxa de ocupação da agenda
- Gráficos de evolução

### 9.2 Relatórios Disponíveis

| Relatório | Descrição |
|-----------|-----------|
| **Atendimentos** | Por período, profissional, especialidade |
| **Financeiro** | Receitas, despesas, categorias |
| **Pacientes** | Novos, recorrentes, inativos |
| **TISS** | Guias enviadas, glosas, faturamento |

### 9.3 Exportando Dados

1. Abra o relatório desejado
2. Clique em **"Exportar"**
3. Escolha o formato:
   - 📄 PDF (para impressão)
   - 📊 Excel (para análise)
   - 📋 CSV (para integração)

---

## 10. Configurações

### 10.1 Perfil Pessoal

1. Clique no seu **avatar** (canto superior direito)
2. Selecione **"Perfil"**
3. Edite:
   - Foto
   - Nome de exibição
   - Especialidade
   - Conselho profissional (CRM, CRO, etc.)
   - Assinatura para receitas

### 10.2 Configurações da Clínica

**Somente Administradores**

1. Vá em **Configurações > Clínica**
2. Configure:
   - Nome e logo
   - Endereço e telefone
   - Horário de funcionamento
   - Especialidades oferecidas

### 10.3 Configurações de Agenda

1. **Duração padrão de consultas**: 30 min
2. **Intervalo entre consultas**: 0-15 min
3. **Antecedência mínima para agendamento**: 2 horas
4. **Confirmação automática**: Ativar/Desativar

### 10.4 Notificações

Configure quais notificações deseja receber:

- ✉️ Email
- 📱 Push (no navegador)
- 🔔 No sistema

Tipos:
- Nova consulta agendada
- Consulta próxima (1 hora antes)
- Pagamento recebido
- Glosa de convênio

### 10.5 Tema

Escolha entre:
- ☀️ Modo Claro
- 🌙 Modo Escuro
- 🔄 Automático (baseado no sistema)

---

## 🆘 Suporte

### Dúvidas?

- 📧 Email: suporte@genesis.health
- 💬 Chat: Clique no ícone 💬 (canto inferior direito)
- 📞 Telefone: (11) 9999-9999

### Recursos Adicionais

- [FAQ (Perguntas Frequentes)](./FAQ.md)
- [Vídeos Tutoriais](https://youtube.com/genesis)
- [Base de Conhecimento](https://help.genesis.health)

---

<p align="center">
  <strong>🏥 Genesis - Seu parceiro em gestão de saúde</strong>
</p>

