---
version: 1.0.0
last_updated: 2025-12-22
author: Genesis Team
status: published
---

# 🔐 Genesis - Security & Compliance

> **Documentação de segurança e conformidade regulatória**

---

## 📑 Índice

1. [Segurança Técnica](#1-segurança-técnica)
2. [LGPD (Brasil)](#2-lgpd-lei-geral-de-proteção-de-dados)
3. [CFM (Conselho Federal de Medicina)](#3-cfm-conselho-federal-de-medicina)
4. [HIPAA Readiness (EUA)](#4-hipaa-readiness)
5. [Auditoria e Logs](#5-auditoria-e-logs)
6. [Incident Response](#6-incident-response)
7. [Certificações](#7-certificações)

---

## 1. Segurança Técnica

### 1.1 Arquitetura de Segurança

```
┌─────────────────────────────────────────────────┐
│              User (Browser/App)                  │
└──────────────────┬──────────────────────────────┘
                   │ HTTPS/TLS 1.3
┌──────────────────▼──────────────────────────────┐
│            Firebase Hosting (CDN)                │
│       - DDoS Protection                          │
│       - WAF (Web Application Firewall)           │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│         Firebase Authentication                  │
│       - OAuth 2.0                                │
│       - JWT Tokens (1h expiration)               │
│       - MFA Ready                                │
└──────────────────┬──────────────────────────────┘
                   │
     ┌─────────────┼─────────────┐
     │             │             │
┌────▼────┐  ┌────▼────┐  ┌────▼────┐
│Firestore│  │Functions│  │ Storage │
│Security │  │IAM      │  │Rules    │
│Rules    │  │Roles    │  │         │
└─────────┘  └─────────┘  └─────────┘
```

### 1.2 Camadas de Segurança

#### Transport Layer
| Aspecto | Implementação |
|---------|---------------|
| Protocolo | HTTPS Only (HTTP → HTTPS redirect) |
| TLS | 1.3 (minimum 1.2) |
| Certificado | Let's Encrypt (auto-renewal) |
| HSTS | Enabled (max-age=31536000) |

#### Application Layer
| Aspecto | Implementação |
|---------|---------------|
| CSP | Content-Security-Policy strict |
| XSS Protection | Sanitização automática (DOMPurify) |
| CSRF Protection | Firebase tokens |
| Clickjacking | X-Frame-Options: DENY |

#### Data Layer
| Aspecto | Implementação |
|---------|---------------|
| Encryption at Rest | AES-256 (Firebase padrão) |
| Encryption in Transit | TLS 1.3 |
| Key Management | Google KMS |
| Backups | Encrypted + Geo-redundant |

### 1.3 Autenticação

#### Firebase Authentication

```typescript
// Configuração de segurança
const authConfig = {
  // Tokens expiram em 1 hora
  tokenExpiration: 3600,
  
  // Refresh tokens expiram em 30 dias
  refreshTokenExpiration: 2592000,
  
  // Força logout após 30 dias de inatividade
  maxInactivity: 2592000,
  
  // Política de senha
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },
};
```

#### Multi-Factor Authentication (MFA)

**Métodos suportados**:
1. **TOTP** (Time-based One-Time Password)
   - Google Authenticator
   - Authy
   - Microsoft Authenticator

2. **SMS** (menos seguro, não recomendado)

**Ativação**:
```typescript
// Admin pode forçar MFA para todos
await updateClinicSettings({
  enforceMFA: true,
  mfaMethods: ['totp'],
});
```

### 1.4 Autorização (RBAC)

#### Roles e Permissões

```typescript
enum Role {
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  RECEPTIONIST = 'receptionist',
  FINANCIAL = 'financial',
}

const PERMISSIONS_MATRIX = {
  admin: ['*'], // Todos os acessos
  
  doctor: [
    'patients:read',
    'patients:write',
    'appointments:read',
    'appointments:write',
    'prescriptions:write',
    'medical_records:read',
    'medical_records:write',
    'ai:use',
  ],
  
  receptionist: [
    'patients:read',
    'patients:write',
    'appointments:read',
    'appointments:write',
  ],
  
  financial: [
    'transactions:read',
    'transactions:write',
    'reports:read',
    'tiss:read',
    'tiss:write',
  ],
};
```

#### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper: Check authentication
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper: Check clinic membership
    function isClinicMember(clinicId) {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.clinicId == clinicId;
    }
    
    // Helper: Check role
    function hasRole(role) {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == role;
    }
    
    // Patients: Only clinic members
    match /patients/{patientId} {
      allow read: if isClinicMember(resource.data.clinicId);
      allow write: if isClinicMember(request.resource.data.clinicId) &&
                      hasRole('admin') || hasRole('doctor') || hasRole('receptionist');
      allow delete: if hasRole('admin'); // LGPD compliance
    }
    
    // Medical Records: Only doctors and admins
    match /medical_records/{recordId} {
      allow read: if isClinicMember(resource.data.clinicId) &&
                     (hasRole('admin') || hasRole('doctor'));
      allow write: if isClinicMember(request.resource.data.clinicId) &&
                      (hasRole('admin') || hasRole('doctor'));
    }
    
    // Transactions: Financial role required
    match /transactions/{transactionId} {
      allow read: if isClinicMember(resource.data.clinicId);
      allow write: if isClinicMember(request.resource.data.clinicId) &&
                      (hasRole('admin') || hasRole('financial'));
    }
  }
}
```

### 1.5 Dados Sensíveis

#### Classificação de Dados

| Nível | Tipo | Exemplos | Tratamento |
|-------|------|----------|------------|
| **Público** | Não sensível | Nome da clínica | Cache permitido |
| **Interno** | Baixa sensibilidade | Nome de paciente | Firestore padrão |
| **Confidencial** | Média sensibilidade | Histórico médico | Audit log |
| **Crítico** | Alta sensibilidade | CPF, RG, Exames | Criptografia adicional (opcional) |

#### PII (Personally Identifiable Information)

Dados PII no Genesis:
- Nome completo
- CPF
- RG
- Data de nascimento
- Endereço
- Telefone
- Email
- Histórico médico
- Exames
- Prescrições

**Tratamento**:
- Firestore: Criptografia at rest (AES-256)
- Transit: TLS 1.3
- Logs: Sem PII (apenas IDs)
- Backups: Encrypted

---

## 2. LGPD (Lei Geral de Proteção de Dados)

### 2.1 Conformidade

✅ Genesis está **100% conforme** com a LGPD (Lei 13.709/2018)

#### Princípios LGPD

| Princípio | Implementação no Genesis |
|-----------|--------------------------|
| **Finalidade** | Dados coletados apenas para gestão clínica |
| **Adequação** | Uso compatível com finalidade declarada |
| **Necessidade** | Apenas dados essenciais |
| **Livre acesso** | Paciente pode visualizar seus dados |
| **Qualidade** | Dados atualizados e precisos |
| **Transparência** | Banner de consentimento claro |
| **Segurança** | Medidas técnicas (criptografia, firewall) |
| **Prevenção** | Auditoria contínua |
| **Não discriminação** | Sem uso discriminatório |
| **Responsabilização** | Logs de auditoria |

### 2.2 Consentimento

#### Banner de Consentimento

Aparece no primeiro acesso do paciente:

```
┌─────────────────────────────────────────────────┐
│  🍪 Consentimento de Dados                      │
├─────────────────────────────────────────────────┤
│  Coletamos seus dados pessoais e de saúde para │
│  prestação de serviços médicos. Você pode:     │
│                                                 │
│  ✓ Visualizar seus dados                       │
│  ✓ Solicitar correção                          │
│  ✓ Exportar seus dados                         │
│  ✓ Solicitar exclusão (direito ao esquecimento)│
│                                                 │
│  [ Ver Política de Privacidade ]               │
│                                                 │
│  [ Aceitar ]  [ Recusar ]                      │
└─────────────────────────────────────────────────┘
```

#### Registro de Consentimento

```typescript
interface Consent {
  patientId: string;
  acceptedAt: Timestamp;
  ipAddress: string;
  userAgent: string;
  consentVersion: string; // v1.0
  purposes: string[]; // ['medical_care', 'communications']
}
```

### 2.3 Direitos do Titular

#### Confirmação e Acesso (Art. 18, I e II)

Paciente pode visualizar todos os seus dados:

1. Login no portal do paciente
2. **Meus Dados > Visualizar**
3. Vê: Dados cadastrais, histórico, exames, prescrições

#### Correção (Art. 18, III)

Paciente pode solicitar correção:

1. **Meus Dados > Solicitar Correção**
2. Indica o campo incorreto
3. Clínica recebe notificação e corrige

#### Portabilidade (Art. 18, V)

Paciente pode exportar seus dados:

1. **Meus Dados > Exportar**
2. Gera arquivo JSON com todos os dados
3. Download imediato

```json
{
  "patient": {
    "name": "Maria Silva",
    "cpf": "123.456.789-00",
    ...
  },
  "appointments": [...],
  "prescriptions": [...],
  "lab_results": [...],
  "documents": [...]
}
```

#### Exclusão (Art. 18, VI - Direito ao Esquecimento)

Paciente pode solicitar exclusão completa:

1. **Meus Dados > Excluir Conta**
2. Confirmação com senha
3. Sistema:
   - Deleta paciente
   - Deleta agendamentos
   - Deleta prontuários
   - Deleta prescrições
   - Deleta documentos (Storage)
   - Registra auditoria (sem PII)

⚠️ **Exceções** (Art. 16):
- Dados podem ser retidos se:
  - Obrigação legal (guarda de prontuário: 20 anos CFM)
  - Processo judicial em andamento

### 2.4 Auditoria LGPD

#### Log de Acessos

Toda visualização de dados sensíveis é registrada:

```typescript
interface AuditLog {
  timestamp: Timestamp;
  userId: string;
  action: 'view' | 'edit' | 'delete' | 'export';
  resource: 'patient' | 'medical_record' | 'prescription';
  resourceId: string;
  ipAddress: string;
  userAgent: string;
}
```

**Consulta**:
1. **Configurações > LGPD > Auditoria**
2. Filtros: Período, usuário, ação
3. Exportar relatório

#### Data Protection Officer (DPO)

Clínicas devem designar um DPO:

1. **Configurações > LGPD > DPO**
2. Cadastrar:
   - Nome
   - Email
   - Telefone

DPO recebe:
- Solicitações de exclusão
- Incidentes de segurança
- Relatórios mensais

### 2.5 Política de Privacidade

Genesis fornece template de Política de Privacidade:

- **Configurações > LGPD > Política de Privacidade**
- Customize com dados da sua clínica
- Publique em: `https://genesis.health/clinica/[sua-clinica]/privacy`

---

## 3. CFM (Conselho Federal de Medicina)

### 3.1 Prontuário Eletrônico

#### Resolução CFM 1.821/2007

✅ **Genesis está conforme**:

| Requisito | Implementação |
|-----------|---------------|
| **Formato digital** | ✅ 100% digital |
| **Segurança** | ✅ Criptografia + Backup |
| **Autenticidade** | ✅ Firebase Auth (rastreável) |
| **Confidencialidade** | ✅ RBAC |
| **Integridade** | ✅ Versionamento |
| **Disponibilidade** | ✅ 99.9% uptime |
| **Guarda de 20 anos** | ✅ Retenção ilimitada |
| **Assinatura digital** | ⚠️ Opcional (e-CPF) |

**Sobre Assinatura Digital**:
- Não é obrigatória para prontuário eletrônico
- Obrigatória apenas para prescrições de controle especial
- Genesis suporta e-CPF via Memed SDK

### 3.2 Telemedicina

#### Resolução CFM 2.227/2018

✅ **Genesis está conforme**:

| Requisito | Implementação |
|-----------|---------------|
| **Consentimento** | ✅ Paciente aceita antes da videochamada |
| **Segurança** | ✅ Jitsi E2E encryption |
| **Registro** | ✅ Prontuário gerado após consulta |
| **Identificação** | ✅ CPF validado |
| **Restrições** | ⚠️ Clínica deve seguir diretrizes |

**Restrições**:
- Primeira consulta pode ser online (mudança 2022)
- Prescrição de psicotrópicos: consulta presencial obrigatória

### 3.3 Prescrição Digital

#### Resolução CFM 2.299/2021

✅ **Genesis está conforme** via Memed:

| Requisito | Implementação |
|-----------|---------------|
| **Assinatura digital** | ✅ e-CPF via Memed |
| **Padrão ICP-Brasil** | ✅ Certificado A1 ou A3 |
| **Identificação do médico** | ✅ CRM + Estado |
| **Receita Azul** | ✅ Psicotrópicos (Portaria 344) |
| **Validade** | ✅ Conforme legislação |

---

## 4. HIPAA Readiness

### 4.1 Overview

Genesis está **HIPAA-ready** (mas não certificado formalmente).

Para clínicas nos EUA, é necessário:
1. Assinar BAA (Business Associate Agreement) com Genesis
2. Configurar data residency (US)
3. Habilitar audit logs avançados

### 4.2 HIPAA Requirements

| Safeguard | Genesis | Ação Necessária |
|-----------|---------|-----------------|
| **Administrative** | ✅ RBAC, Audit | Assinar BAA |
| **Physical** | ✅ Firebase (Google SOC 2) | - |
| **Technical** | ✅ Encryption, Access Control | Habilitar US region |

### 4.3 Data Residency

Para conformidade HIPAA:

1. **Configurações > Compliance > Data Residency**
2. Selecione **"United States"**
3. Migração automática para Firebase US

**Impacto**:
- Latência pode aumentar levemente
- Custo +10%

---

## 5. Auditoria e Logs

### 5.1 Logs Automatizados

Genesis registra automaticamente:

| Evento | Log | Retenção |
|--------|-----|----------|
| Login | ✅ | 1 ano |
| Logout | ✅ | 1 ano |
| Visualizar paciente | ✅ | 5 anos |
| Editar prontuário | ✅ | 20 anos |
| Prescrição gerada | ✅ | 20 anos |
| Pagamento registrado | ✅ | 7 anos |
| Exclusão de dados (LGPD) | ✅ | Permanente |

### 5.2 Consulta de Logs

1. **Configurações > Auditoria > Logs**
2. Filtros:
   - Período
   - Usuário
   - Ação
   - Recurso

3. Exportar (CSV, JSON)

### 5.3 Relatório de Auditoria

Gere relatórios para auditorias externas:

1. **Configurações > Auditoria > Relatório**
2. Selecione período
3. Inclui:
   - Acessos por usuário
   - Modificações de dados
   - Solicitações LGPD
   - Incidentes de segurança

---

## 6. Incident Response

### 6.1 Plano de Resposta a Incidentes

#### Etapas

1. **Detecção**
   - Monitoramento automático
   - Alertas em tempo real

2. **Contenção**
   - Isolar sistema afetado
   - Desativar usuários comprometidos

3. **Erradicação**
   - Corrigir vulnerabilidade
   - Aplicar patches

4. **Recuperação**
   - Restaurar de backup
   - Validar integridade

5. **Lições Aprendidas**
   - Post-mortem interno
   - Atualizar documentação

#### Notificação

**LGPD (Art. 48)**:
- Incidente com risco aos titulares → Notificar ANPD em 2 dias úteis
- Notificar pacientes afetados

**Genesis**: Email automático para DPO + Admins

### 6.2 Tipos de Incidentes

| Tipo | Severidade | SLA Resposta |
|------|------------|--------------|
| **Acesso não autorizado** | 🔴 Crítico | < 1h |
| **Vazamento de dados** | 🔴 Crítico | < 1h |
| **Ransomware** | 🔴 Crítico | < 1h |
| **Falha de autenticação** | 🟡 Alto | < 4h |
| **Bug de permissão** | 🟡 Alto | < 4h |
| **Downtime** | 🟢 Médio | < 24h |

---

## 7. Certificações

### 7.1 Infraestrutura (Firebase/Google Cloud)

Firebase (infraestrutura do Genesis) possui:

✅ **SOC 2 Type II**
✅ **SOC 3**
✅ **ISO 27001**
✅ **ISO 27017** (Cloud)
✅ **ISO 27018** (Privacy)
✅ **HIPAA** (com BAA)
✅ **FedRAMP** (US Gov)

**Documentação**: [firebase.google.com/support/privacy](https://firebase.google.com/support/privacy)

### 7.2 Genesis (Aplicação)

🟡 **Em processo**:
- SOC 2 Type II (previsto Q2 2026)
- ISO 27001 (previsto Q3 2026)

📄 **Disponível**:
- Security Whitepaper
- Penetration Test Report (anual)

---

## 8. Melhores Práticas

### 8.1 Para Clínicas

✅ **Essenciais**:
- Forçar MFA para todos os usuários
- Revisar logs mensalmente
- Fazer backup manual trimestral
- Designar DPO
- Treinar equipe em LGPD

⚠️ **Recomendado**:
- Política de senha forte
- Renovar senhas a cada 90 dias
- Whitelist de IPs (se aplicável)
- Testes de phishing com equipe

### 8.2 Para Desenvolvedores (Integradores)

Se você está integrando com Genesis via API:

✅ **Essenciais**:
- Usar HTTPS
- Validar tokens JWT
- Rate limiting
- Log de requisições
- Criptografar dados sensíveis

---

<p align="center">
  <strong>🔐 Segurança e Compliance são prioridade no Genesis</strong><br>
  <em>Seus dados protegidos. Sempre.</em>
</p>

