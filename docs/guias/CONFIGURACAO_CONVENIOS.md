# Configuração de Convênios no Genesis OS

Este guia explica como configurar os planos de saúde (convênios) na sua clínica para começar a faturar usando o padrão TISS.

## Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Configurando os Dados da Clínica](#configurando-os-dados-da-clínica)
3. [Cadastrando Convênios](#cadastrando-convênios)
4. [Criando Guias TISS](#criando-guias-tiss)
5. [Gerenciando Glosas](#gerenciando-glosas)
6. [FAQ](#faq)

---

## Pré-requisitos

Antes de configurar os convênios, sua clínica precisa ter:

### Obrigatórios

- **CNPJ ativo** - Cadastro Nacional de Pessoa Jurídica
- **CNES** - Cadastro Nacional de Estabelecimentos de Saúde
- **Credenciamento** - Contrato firmado com cada operadora

### Recomendados

- **Certificado Digital (e-CNPJ ou e-CPF)** - Para assinatura digital e envio via WebService
- **Profissionais cadastrados** - CRM/CRO/CRP/CRN atualizado

---

## Configurando os Dados da Clínica

### Passo 1: Acessar Configurações

1. No menu lateral, clique em **Configurações**
2. Selecione a aba **Convênios**

### Passo 2: Verificar Dados do Estabelecimento

Na seção "Dados do Estabelecimento", verifique:

- **CNES**: Código de 7 dígitos fornecido pelo DATASUS
- **CNPJ**: 14 dígitos, sem pontuação

> **Importante**: Se estes dados não estiverem configurados, entre em contato com o suporte para atualização.

---

## Cadastrando Convênios

### Passo 1: Adicionar Novo Convênio

1. Na aba **Convênios**, clique em **Adicionar Convênio**
2. Preencha os dados básicos

### Passo 2: Dados Básicos

| Campo | Descrição | Onde Encontrar |
|-------|-----------|----------------|
| **Registro ANS** | 6 dígitos da operadora | Contrato ou site da ANS |
| **Código do Prestador** | Seu código nesta operadora | Contrato com a operadora |
| **Nome Fantasia** | Nome comercial | Ex: UNIMED, Bradesco Saúde |
| **Tabela de Preços** | Tipo de tabela utilizada | Contrato (geralmente TUSS) |

### Passo 3: Configurações

- **Prazo de Envio**: Dias para enviar guias após atendimento
- **Exige Autorização**: Se procedimentos precisam de senha prévia
- **Permite Lote**: Se aceita múltiplas guias em um envio
- **Prazo para Recurso**: Dias para contestar glosas

### Passo 4: Contato

Opcional, mas recomendado para agilizar processos:

- E-mail de faturamento
- Telefone
- URL do portal

---

## Criando Guias TISS

### Acessando o Faturamento

1. No menu lateral, clique em **Faturamento**
2. Selecione **Nova Guia**

### Tipos de Guia

| Tipo | Uso |
|------|-----|
| **Guia de Consulta** | Consultas médicas regulares |
| **Guia SP/SADT** | Exames, procedimentos, terapias |

### Preenchendo a Guia de Consulta

1. **Operadora**: Selecione o convênio do paciente
2. **Beneficiário**: Dados da carteira do plano
3. **Tipo de Consulta**: Primeira, retorno, pré-natal ou encaminhamento
4. **Procedimento**: Busque o código TUSS
5. **Valor**: Conforme tabela contratada

### Após Criar a Guia

A guia fica no status **Rascunho** até ser enviada à operadora.

---

## Gerenciando Glosas

### O que são Glosas?

Glosas são recusas totais ou parciais do pagamento pela operadora. Motivos comuns:

- Guia preenchida incorretamente
- Procedimento sem autorização
- Beneficiário sem cobertura
- Prazo de envio excedido

### Visualizando Glosas

1. Em **Faturamento**, selecione a aba **Glosas**
2. Veja todas as guias com pendências

### Recursos de Glosa

Para contestar uma glosa:

1. Clique na guia glosada
2. Verifique o motivo da glosa
3. Prepare documentação comprobatória
4. Envie o recurso dentro do prazo

---

## FAQ

### Como obtenho o CNES da minha clínica?

O CNES é obtido através do cadastro no DATASUS. Acesse:
https://cnes.datasus.gov.br

### Posso usar o mesmo sistema para várias operadoras?

Sim! O Genesis OS suporta múltiplas operadoras simultaneamente. Cada convênio tem suas próprias configurações.

### Preciso de certificado digital?

O certificado digital é necessário para:
- Assinatura digital de guias
- Envio via WebService
- Algumas operadoras exigem para qualquer envio

Operadoras que aceitam envio por portal ou e-mail podem não exigir certificado.

### Como sei qual tabela de preços usar?

Consulte seu contrato com a operadora. Os tipos mais comuns são:
- **TUSS (22)**: Tabela unificada, mais utilizada
- **Tabela própria da operadora (19)**: Quando há tabela específica negociada

### Qual o prazo para enviar as guias?

Varia por operadora, mas geralmente:
- **UNIMED**: 30 dias
- **Bradesco/SulAmérica**: 30 dias
- **Amil**: 60 dias

Verifique seu contrato para prazos específicos.

---

## Suporte

Dúvidas ou problemas? Entre em contato:

- **E-mail**: suporte@genesis-os.com.br
- **WhatsApp**: (11) 99999-9999
- **Central de Ajuda**: Acesse pelo menu do sistema

---

*Última atualização: Dezembro 2025*
