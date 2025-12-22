---
version: 1.0.0
last_updated: 2025-12-22
author: Genesis Team
status: published
---

# ❓ Genesis - Perguntas Frequentes (FAQ)

> **Respostas rápidas para as dúvidas mais comuns**

---

## 📑 Índice

- [Conta e Acesso](#conta-e-acesso)
- [Agenda](#agenda)
- [Pacientes](#pacientes)
- [Prontuário](#prontuário)
- [Inteligência Artificial](#inteligência-artificial)
- [Telemedicina](#telemedicina)
- [Prescrição](#prescrição)
- [Financeiro](#financeiro)
- [Segurança](#segurança)
- [Técnicas](#técnicas)

---

## Conta e Acesso

### Como faço para recuperar minha senha?

1. Na tela de login, clique em **"Esqueci minha senha"**
2. Digite seu email
3. Você receberá um link para redefinir a senha
4. O link expira em 1 hora

### Posso usar o Genesis no celular?

✅ **Sim!** Genesis é um PWA (Progressive Web App):
- Acesse pelo navegador mobile
- Clique em **"Adicionar à tela inicial"**
- Use como um app nativo

**App nativo** (iOS/Android) está previsto para Q1 2026.

### Como ativo a autenticação de dois fatores (2FA)?

1. Vá em **Perfil > Segurança**
2. Clique em **"Ativar 2FA"**
3. Escaneie o QR Code com Google Authenticator
4. Digite o código de 6 dígitos
5. Salve os códigos de backup

### Posso usar o Genesis offline?

⚠️ **Parcialmente**:
- **Visualização**: Dados recentes ficam em cache
- **Criação/Edição**: Requer conexão

**Offline completo** está no roadmap para o app mobile.

---

## Agenda

### Como faço para bloquear um horário?

1. Na agenda, clique no horário desejado
2. Selecione **"Bloquear Horário"**
3. Defina motivo (Almoço, Reunião, etc.)
4. Salve

Ou vá em **Configurações > Agenda > Bloqueios** para bloqueios recorrentes.

### Como configurar consultas recorrentes?

1. Ao criar o agendamento, clique em **"Recorrência"**
2. Escolha:
   - Diária
   - Semanal (selecione dias)
   - Mensal
3. Defina data de término
4. Salve

### Como confirmo presença de um paciente?

1. Clique na consulta na agenda
2. Clique em **"Marcar como Confirmado"**

Ou:
- Envie WhatsApp de confirmação (em breve)
- Paciente confirma pelo link

### O que significa cada cor na agenda?

| Cor | Status |
|-----|--------|
| 🔵 Azul | Agendado |
| 🟢 Verde | Confirmado |
| 🟡 Amarelo | Em Atendimento |
| ✅ Verde Escuro | Concluído |
| 🔴 Vermelho | Cancelado |
| ⚪ Cinza | Faltou |

---

## Pacientes

### Como importo minha lista de pacientes?

**Método 1: Upload CSV/Excel**
1. Vá em **Pacientes > Importar**
2. Faça upload do arquivo
3. Mapeie as colunas
4. Importe

**Método 2: Manual**
- Cadastre um por um

### Como faço backup dos dados dos pacientes?

1. **Configurações > Backup > Exportar**
2. Selecione "Pacientes"
3. Download do arquivo JSON

**Recomendação**: Exportação mensal.

### Posso excluir um paciente?

✅ **Sim**, mas:
- Ação é **irreversível**
- Dados relacionados (consultas, prontuários) também são excluídos
- Importante para **LGPD** (direito ao esquecimento)

**Como**:
1. Abra a ficha do paciente
2. **⋯ > Excluir Paciente**
3. Confirme digitando o nome

### Como adiciono documentos (exames) a um paciente?

1. Abra a ficha do paciente
2. Aba **"Documentos"**
3. Clique em **"+ Upload"**
4. Selecione o arquivo (PDF, JPG, PNG)
5. Adicione descrição
6. Salve

**Formatos aceitos**: PDF, JPG, PNG (até 10 MB)

---

## Prontuário

### O prontuário é salvo automaticamente?

✅ **Sim!** Auto-save a cada 30 segundos.

Mas você também pode salvar manualmente:
- Clique em **"Salvar"**
- Ou `Cmd/Ctrl + S`

### Como uso templates de prontuário?

1. No prontuário, clique em **"Templates"**
2. Selecione o modelo da sua especialidade
3. Campos são preenchidos automaticamente
4. Personalize conforme necessário

**Criar template próprio**:
1. **Configurações > Templates > + Novo**
2. Defina campos
3. Salve

### Posso editar um prontuário já finalizado?

✅ **Sim**, mas:
- Sistema registra histórico de alterações
- Alterações são auditáveis (LGPD)

**Como**:
1. Abra o prontuário
2. Clique em **"Editar"**
3. Altere
4. Salve

### Como assino digitalmente um prontuário?

**Assinatura digital (e-CPF)** ainda não é obrigatória para prontuários no Brasil.

Para prescrições:
- Integração com Memed (certificado ICP-Brasil)

---

## Inteligência Artificial

### O AI Scribe funciona com sotaque?

✅ **Sim!** Whisper (modelo de IA) é treinado em português brasileiro, incluindo variações regionais.

**Dicas para melhor resultado**:
- Fale claramente
- Evite ruídos de fundo
- Microfone de qualidade

### As sugestões de diagnóstico são confiáveis?

⚠️ **A IA é uma ferramenta de apoio**, não substitui o julgamento clínico!

**Como funciona**:
- Multi-LLM (GPT-4 + Gemini + Claude)
- Consenso entre modelos
- Baseado em literatura científica
- Explica o "porquê"

**Sempre revise** as sugestões.

### A IA está "aprendendo" com meus pacientes?

❌ **NÃO!** Seus dados **não** são usados para treinar modelos de IA.

**Garantias**:
- APIs da OpenAI/Google: Zero data retention (configurado)
- Dados ficam apenas no seu Firestore
- LGPD compliant

### Quanto custa usar a IA?

**Incluído no plano**, mas com limites:

| Feature | Limite |
|---------|--------|
| AI Scribe | 120 minutos/dia |
| Diagnóstico | 100 requisições/dia |
| Análise de Exames | 50 requisições/dia |

**Planos Enterprise**: Limites maiores.

---

## Telemedicina

### Preciso instalar algum programa?

❌ **NÃO!** Funciona 100% no navegador.

**Requisitos**:
- Chrome, Edge, Firefox, Safari (atualizados)
- Câmera + Microfone
- Internet: 5 Mbps (recomendado)

### O paciente precisa ter conta?

❌ **NÃO!**
- Você envia um link
- Paciente clica e entra direto
- Sem cadastro necessário

### A videochamada é segura?

✅ **SIM!** Jitsi Meet usa:
- **E2E Encryption** (criptografia ponta a ponta)
- Sem gravação sem consentimento
- HTTPS/TLS 1.3

### Como gravo uma consulta?

1. Durante a videochamada, clique em **"🔴 Gravar"**
2. Paciente recebe notificação e deve **aceitar**
3. Após aceitar, gravação inicia
4. Clique em **"⏹ Parar"** para finalizar
5. Vídeo é salvo no prontuário

⚠️ **Importante**: Solicite consentimento do paciente antes!

---

## Prescrição

### Preciso ter certificado digital (e-CPF)?

**Depende**:

| Tipo de Receita | Certificado Digital |
|-----------------|---------------------|
| Simples | ❌ Não obrigatório |
| Antibióticos | ❌ Não obrigatório |
| Controle Especial | ✅ Obrigatório |
| Receita Azul (psicotrópicos) | ✅ Obrigatório |

**Sem e-CPF**: Prescrição é gerada em PDF, você imprime e assina manualmente.

### Como envio a receita para o paciente?

Após gerar a prescrição:
1. Clique em **"Enviar"**
2. Escolha:
   - 📧 **Email**
   - 📱 **WhatsApp**
   - 📄 **Imprimir**

Paciente recebe PDF + código de validação para farmácia.

### A farmácia aceita receita digital?

✅ **Sim**, desde que tenha:
- Código de validação
- Assinatura digital (para controlados)

**Integração Memed**: Aceito em 95% das farmácias no Brasil.

### Como prescrevo medicamentos manipulados?

No campo de medicamento:
1. Digite o nome da substância
2. Clique em **"Medicamento Manipulado"**
3. Descreva a fórmula completa
4. Gere a prescrição

---

## Financeiro

### Como registro um pagamento em dinheiro?

1. Na consulta, clique em **"💰 Registrar Pagamento"**
2. Método: **"Dinheiro"**
3. Digite valor
4. Status: **"Pago"**
5. Salve

### O PIX é automático?

✅ **SIM!** Se você configurou sua chave PIX:
1. Sistema gera QR Code
2. Paciente escaneia e paga
3. Confirmação é **automática** (via webhook)

**Se PIX é manual**:
- Você confirma manualmente em **Financeiro > Transações**

### Como gero uma nota fiscal?

Genesis **não** gera nota fiscal diretamente.

**Integrações disponíveis** (roadmap):
- NFe.io
- Enotas
- Bling

**Atualmente**: Exporte dados e use seu sistema de NF.

### Como faço o faturamento TISS?

1. **Financeiro > TISS**
2. Selecione período
3. Marque consultas a faturar
4. Clique em **"Gerar Lote TISS"**
5. Download do XML
6. Faça upload no portal do convênio

---

## Segurança

### Meus dados são criptografados?

✅ **SIM!**
- **Em trânsito**: HTTPS/TLS 1.3
- **Em repouso**: AES-256 (Firebase padrão)

### Onde os dados são armazenados?

**Firebase (Google Cloud)**:
- Servidores no **Brasil** (southamerica-east1)
- Redundância geográfica
- Backup automático diário

### Genesis é conforme com a LGPD?

✅ **100% conforme!**
- Consentimento
- Auditoria
- Portabilidade (exportação)
- Direito ao esquecimento (exclusão)
- DPO Interface

Veja: [SECURITY_COMPLIANCE.md](../admin/SECURITY_COMPLIANCE.md)

### O que acontece se eu esquecer de fazer logout?

**Segurança automática**:
- Sessão expira em **1 hora** de inatividade
- Token JWT expira em **1 hora**
- Refresh token expira em **30 dias**

**Recomendação**: Sempre faça logout em computadores compartilhados.

---

## Técnicas

### Em qual navegador o Genesis funciona melhor?

| Navegador | Suporte | Notas |
|-----------|---------|-------|
| **Chrome** | ✅ Completo | Recomendado |
| **Edge** | ✅ Completo | Recomendado |
| **Firefox** | ✅ Completo | - |
| **Safari** | ⚠️ Parcial | Algumas limitações no iOS |
| **IE 11** | ❌ Não suportado | - |

### Qual a velocidade de internet mínima?

| Uso | Mínimo | Recomendado |
|-----|--------|-------------|
| Navegação | 1 Mbps | 5 Mbps |
| Telemedicina (áudio) | 2 Mbps | 5 Mbps |
| Telemedicina (vídeo) | 5 Mbps | 10 Mbps |
| Upload de exames | 2 Mbps | 5 Mbps |

**Teste sua velocidade**: [speedtest.net](https://speedtest.net)

### O Genesis funciona em tablets?

✅ **SIM!**
- iPad (Safari, Chrome)
- Android Tablets (Chrome)

**Layout**: Responsivo, otimizado para touch.

### Posso instalar o Genesis como app?

✅ **SIM!** Genesis é um PWA:

**Desktop (Chrome/Edge)**:
1. Acesse Genesis
2. Barra de endereço: **ícone ⊕**
3. Clique em "Instalar"

**Mobile**:
1. Acesse Genesis
2. Menu do navegador
3. **"Adicionar à tela inicial"**

### Como reporto um bug?

1. **Chat in-app** (💬 ícone)
2. Ou: suporte@genesis.health
3. Inclua:
   - Navegador e versão
   - Passos para reproduzir
   - Screenshot (se aplicável)

---

## 🆘 Ainda tem dúvidas?

### Recursos Disponíveis:

| Recurso | Descrição |
|---------|-----------|
| 📖 [Manual do Usuário](./USER_MANUAL.md) | Guia completo |
| 🚀 [Guia de Início Rápido](./QUICK_START.md) | Comece em 5 min |
| 💬 **Chat Suporte** | Clique no ícone 💬 (in-app) |
| 📧 **Email** | suporte@genesis.health |
| 📞 **Telefone** | (11) 9999-9999 |

### Horário de Atendimento:
- **Chat**: 24/7 (resposta em < 5 min)
- **Email**: Seg-Sex 8h-18h (resposta em < 2h)
- **Telefone**: Seg-Sex 8h-18h

---

<p align="center">
  <strong>❓ Não encontrou sua resposta?</strong><br>
  <em>Fale conosco! Estamos aqui para ajudar.</em>
</p>

