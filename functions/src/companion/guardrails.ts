/**
 * Safety Guardrails
 * =================
 *
 * Pre-AI and post-AI safety checks for the health companion.
 * Implements multi-layer protection per FDA AI guidance 2025.
 *
 * @module companion/guardrails
 */

import type { GuardrailsCheckResult, SanitizedResponse, HandoffReason } from './types.js'
import { AI_DISCLAIMER, SAMU_NUMBER } from './types.js'

// ============================================================================
// EMERGENCY KEYWORDS
// ============================================================================

/**
 * Emergency keywords that trigger immediate handoff.
 * Based on medical triage protocols and SAMU guidelines.
 */
const EMERGENCY_KEYWORDS: string[] = [
  // Cardiovascular
  'dor no peito',
  'dor no coração',
  'infarto',
  'ataque cardíaco',
  'pressão no peito',

  // Neurological
  'avc',
  'derrame',
  'convulsão',
  'convulsionando',
  'desmaio',
  'desmaiou',
  'perdi a consciência',
  'perdeu a consciência',
  'não está acordando',

  // Respiratory
  'não consigo respirar',
  'falta de ar',
  'sufocando',
  'engasgou',
  'engasgando',
  'lábios roxos',
  'está azul',

  // Mental Health
  'quero morrer',
  'vou me matar',
  'suicídio',
  'suicida',
  'não quero mais viver',
  'pensamentos suicidas',
  'automutilação',
  'me cortei',
  'me cortar',

  // Trauma/Bleeding
  'hemorragia',
  'sangramento intenso',
  'muito sangue',
  'não para de sangrar',
  'acidente grave',
  'acidente de carro',
  'atropelamento',

  // Allergic
  'anafilaxia',
  'garganta fechando',
  'inchaço na garganta',
  'reação alérgica grave',

  // Pediatric Emergency
  'bebê não respira',
  'bebê roxo',
  'criança inconsciente',
  'febre muito alta bebê',
]

/**
 * Keywords indicating patient wants human assistance.
 */
const HUMAN_REQUEST_KEYWORDS: string[] = [
  'falar com humano',
  'falar com pessoa',
  'falar com atendente',
  'atendente humano',
  'quero falar com alguém',
  'atendimento humano',
  'pessoa real',
  'não quero falar com robô',
  'não quero ia',
  'preciso de ajuda real',
  'ligar para clínica',
  'ligar para vocês',
]

/**
 * Keywords indicating frustration.
 */
const FRUSTRATION_KEYWORDS: string[] = [
  'você não entende',
  'não está me ajudando',
  'isso não ajuda',
  'vocês são inúteis',
  'que droga',
  'que merda',
  'isso é ridículo',
  'não funciona',
  'estou cansado disso',
  'já disse isso',
  'já respondi isso',
  'pela terceira vez',
  'repeti várias vezes',
]

/**
 * Patterns that should NOT appear in AI responses (diagnosis patterns).
 */
const DIAGNOSTIC_PATTERNS: RegExp[] = [
  /você tem\s+(\w+)/gi,
  /você está com\s+(\w+)/gi,
  /isso é\s+(uma?\s+)?(\w+)/gi,
  /seu diagnóstico/gi,
  /diagnosticado com/gi,
  /você sofre de/gi,
  /você possui\s+(\w+)/gi,
]

/**
 * Medication recommendation patterns to block.
 */
const MEDICATION_PATTERNS: RegExp[] = [
  /tome\s+(\w+)/gi,
  /tomar\s+(\d+)\s*(mg|ml|comprimidos?)/gi,
  /recomendo\s+(que\s+)?(você\s+)?tomar?\s+/gi,
  /use\s+(\w+)\s*(mg|ml)?/gi,
  /aplique\s+(\w+)/gi,
]

// ============================================================================
// PRE-AI CHECKS
// ============================================================================

/**
 * Check message for emergency keywords and handoff triggers.
 * This runs BEFORE AI processing.
 */
export function checkGuardrails(message: string): GuardrailsCheckResult {
  const lowerMessage = message.toLowerCase().trim()

  // Check for emergencies
  const matchedEmergencies = EMERGENCY_KEYWORDS.filter(keyword =>
    lowerMessage.includes(keyword.toLowerCase())
  )

  if (matchedEmergencies.length > 0) {
    return {
      passed: false,
      isEmergency: true,
      emergencyKeywords: matchedEmergencies,
      skipToHandoff: true,
      handoffReason: 'emergency',
    }
  }

  // Check for human request
  const wantsHuman = HUMAN_REQUEST_KEYWORDS.some(keyword =>
    lowerMessage.includes(keyword.toLowerCase())
  )

  if (wantsHuman) {
    return {
      passed: false,
      isEmergency: false,
      emergencyKeywords: [],
      skipToHandoff: true,
      handoffReason: 'patient_request',
    }
  }

  // Check for frustration
  const isFrustrated = FRUSTRATION_KEYWORDS.some(keyword =>
    lowerMessage.includes(keyword.toLowerCase())
  )

  if (isFrustrated) {
    return {
      passed: false,
      isEmergency: false,
      emergencyKeywords: [],
      skipToHandoff: true,
      handoffReason: 'frustration',
    }
  }

  // All checks passed
  return {
    passed: true,
    isEmergency: false,
    emergencyKeywords: [],
    skipToHandoff: false,
  }
}

// ============================================================================
// POST-AI SANITIZATION
// ============================================================================

/**
 * Sanitize AI response to remove diagnostic/prescription language.
 * This runs AFTER AI processing, before sending to patient.
 */
export function sanitizeResponse(response: string): SanitizedResponse {
  let sanitized = response
  const removedPatterns: string[] = []
  let wasModified = false

  // Remove diagnostic patterns
  for (const pattern of DIAGNOSTIC_PATTERNS) {
    const matches = sanitized.match(pattern)
    if (matches) {
      wasModified = true
      removedPatterns.push(...matches)
      sanitized = sanitized.replace(pattern, 'pode haver indicação de algo que')
    }
  }

  // Remove medication patterns
  for (const pattern of MEDICATION_PATTERNS) {
    const matches = sanitized.match(pattern)
    if (matches) {
      wasModified = true
      removedPatterns.push(...matches)
      sanitized = sanitized.replace(pattern, 'consulte seu médico sobre medicamentos')
    }
  }

  // Ensure disclaimer is present
  if (!sanitized.includes('Emergências: 192') && !sanitized.includes(SAMU_NUMBER)) {
    sanitized = sanitized.trim() + '\n\n' + AI_DISCLAIMER
    wasModified = true
  }

  return {
    text: sanitized,
    wasModified,
    removedPatterns,
  }
}

/**
 * Build emergency response message.
 */
export function buildEmergencyResponse(emergencyKeywords: string[]): string {
  return `⚠️ *ATENÇÃO - EMERGÊNCIA DETECTADA*

Identifiquei palavras que podem indicar uma emergência médica.

🚨 *LIGUE AGORA PARA O SAMU: 192*

O SAMU (Serviço de Atendimento Móvel de Urgência) pode enviar uma ambulância e orientá-lo imediatamente.

Se você está em perigo imediato:
• Ligue 192 (SAMU)
• Ligue 193 (Bombeiros)
• Vá ao pronto-socorro mais próximo

Um atendente humano da clínica será notificado sobre sua situação.

${AI_DISCLAIMER}`
}

/**
 * Build handoff response message.
 */
export function buildHandoffResponse(reason: HandoffReason): string {
  switch (reason) {
    case 'emergency':
      return buildEmergencyResponse([])

    case 'patient_request':
      return `Entendido! Vou transferir você para um atendente humano.

Um membro da nossa equipe entrará em contato em breve durante o horário de funcionamento.

Horário de atendimento: Segunda a Sexta, 8h às 18h

${AI_DISCLAIMER}`

    case 'frustration':
      return `Peço desculpas se não consegui ajudar adequadamente.

Vou transferir você para um atendente humano que poderá auxiliá-lo melhor.

Um membro da nossa equipe entrará em contato em breve.

${AI_DISCLAIMER}`

    case 'out_of_scope':
      return `Essa pergunta está fora do que posso ajudar como assistente de saúde.

Vou transferir para um atendente que poderá orientá-lo.

Um membro da nossa equipe entrará em contato em breve.

${AI_DISCLAIMER}`

    default:
      return `Vou transferir você para atendimento humano para melhor assistência.

Um membro da nossa equipe entrará em contato em breve.

${AI_DISCLAIMER}`
  }
}

// ============================================================================
// LOOP DETECTION
// ============================================================================

/**
 * Detect if conversation is in a loop (same question repeated).
 */
export function detectLoop(
  messages: Array<{ role: string; content: string }>,
  threshold: number = 3
): boolean {
  const patientMessages = messages
    .filter(m => m.role === 'patient')
    .map(m => m.content.toLowerCase().trim())

  if (patientMessages.length < threshold) {
    return false
  }

  // Check last N messages for similarity
  const recentMessages = patientMessages.slice(-threshold)

  // Simple similarity: check if messages are very similar
  const uniqueMessages = new Set(recentMessages)

  // If most messages are the same, it's a loop
  return uniqueMessages.size <= 1
}
