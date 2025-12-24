/**
 * Companion AI Service
 * ====================
 *
 * Handles AI interactions using Gemini 2.5 Flash via Vertex AI.
 * Implements conversation flow with state management.
 *
 * @module companion/ai-service
 */

import { getVertexAIClient } from '../utils/config.js'
import {
  COMPANION_SYSTEM_PROMPT,
  generateCompanionUserPrompt,
  COMPANION_PROMPT_VERSION,
  TRIAGE_SYSTEM_PROMPT,
  generateTriageUserPrompt,
} from './prompts/index.js'
import type {
  CompanionAIInput,
  CompanionAIOutput,
  ConversationMessage,
  PatientCompanionContext,
  SymptomTriageResult,
  ConversationState,
  HandoffReason,
  HandoffPriority,
} from './types.js'
import { MIN_CONFIDENCE_THRESHOLD } from './types.js'

const GEMINI_MODEL = 'gemini-2.5-flash'

/**
 * Parse AI response JSON safely.
 */
function parseAIResponse(text: string): Record<string, unknown> {
  // Remove markdown code blocks if present
  const jsonStr = text
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim()

  try {
    return JSON.parse(jsonStr)
  } catch {
    throw new Error(`Failed to parse AI response: ${text.slice(0, 200)}`)
  }
}

/**
 * Format conversation history for prompt.
 */
function formatConversationHistory(messages: ConversationMessage[]): string {
  if (messages.length === 0) {
    return '(Início da conversa)'
  }

  return messages
    .map(msg => {
      const role = msg.role === 'patient' ? 'Paciente' : 'Geni'
      return `${role}: ${msg.content}`
    })
    .join('\n')
}

/**
 * Build additional context string from patient data.
 */
function buildAdditionalContext(context: PatientCompanionContext): string {
  const parts: string[] = []

  if (context.allergies.length > 0) {
    parts.push(`Alergias: ${context.allergies.join(', ')}`)
  }

  if (context.currentMedications.length > 0) {
    parts.push(`Medicamentos: ${context.currentMedications.join(', ')}`)
  }

  if (context.chronicConditions.length > 0) {
    parts.push(`Condições crônicas: ${context.chronicConditions.join(', ')}`)
  }

  if (context.lastAppointment) {
    parts.push(
      `Última consulta: ${context.lastAppointment.specialty} em ${context.lastAppointment.date}`
    )
  }

  return parts.length > 0 ? parts.join('\n') : ''
}

/**
 * Generate companion response using Gemini.
 */
export async function generateCompanionResponse(
  input: CompanionAIInput
): Promise<CompanionAIOutput> {
  const startTime = Date.now()

  const client = await getVertexAIClient()

  const userPrompt = generateCompanionUserPrompt(
    input.context.name,
    input.context.age,
    input.context.sex,
    input.state,
    formatConversationHistory(input.conversationHistory),
    input.message,
    buildAdditionalContext(input.context)
  )

  const response = await client.models.generateContent({
    model: GEMINI_MODEL,
    config: {
      systemInstruction: COMPANION_SYSTEM_PROMPT,
      temperature: 0.3, // Lower temperature for more consistent responses
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: userPrompt }],
      },
    ],
  })

  const text = response.text
  if (!text) {
    throw new Error('Empty response from Gemini')
  }

  const parsed = parseAIResponse(text)
  const processingTimeMs = Date.now() - startTime

  // Extract values with defaults
  const confidence = (parsed.confidence as number) || 80
  const newState = (parsed.newState as ConversationState) || input.state
  const shouldHandoff = (parsed.shouldHandoff as boolean) || confidence < MIN_CONFIDENCE_THRESHOLD
  const handoffReason = parsed.handoffReason as HandoffReason | undefined

  // Build output
  const output: CompanionAIOutput = {
    response: (parsed.response as string) || 'Desculpe, não entendi. Pode reformular?',
    newState,
    shouldHandoff,
    confidence,
    metadata: {
      model: GEMINI_MODEL,
      promptVersion: COMPANION_PROMPT_VERSION,
      processingTimeMs,
    },
  }

  // Add handoff details if needed
  if (shouldHandoff && handoffReason) {
    output.handoffDetails = {
      reason: handoffReason,
      priority: getPriorityForReason(handoffReason),
      reasonDetails: getReasonDetails(handoffReason, input.message),
    }
  } else if (shouldHandoff) {
    output.handoffDetails = {
      reason: 'low_confidence',
      priority: 'low',
      reasonDetails: `Confiança baixa (${confidence}%) na resposta`,
    }
  }

  return output
}

/**
 * Perform symptom triage using Gemini.
 */
export async function performSymptomTriage(
  symptoms: string,
  context: PatientCompanionContext
): Promise<SymptomTriageResult> {
  const client = await getVertexAIClient()

  const userPrompt = generateTriageUserPrompt(
    symptoms,
    context.age,
    context.sex,
    context.chronicConditions,
    context.currentMedications
  )

  const response = await client.models.generateContent({
    model: GEMINI_MODEL,
    config: {
      systemInstruction: TRIAGE_SYSTEM_PROMPT,
      temperature: 0.1, // Very low temperature for consistent triage
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: userPrompt }],
      },
    ],
  })

  const text = response.text
  if (!text) {
    throw new Error('Empty triage response from Gemini')
  }

  const parsed = parseAIResponse(text)

  return {
    urgency: (parsed.urgency as SymptomTriageResult['urgency']) || 'routine',
    symptoms: (parsed.symptoms as string[]) || [],
    redFlags: (parsed.redFlags as string[]) || [],
    recommendations: (parsed.recommendations as string[]) || [],
    shouldSchedule: (parsed.shouldSchedule as boolean) ?? true,
    suggestedSpecialty: parsed.suggestedSpecialty as string | undefined,
    confidence: (parsed.confidence as number) || 70,
  }
}

/**
 * Get priority based on handoff reason.
 */
function getPriorityForReason(reason: HandoffReason): HandoffPriority {
  switch (reason) {
    case 'emergency':
      return 'high'
    case 'patient_request':
    case 'frustration':
      return 'medium'
    case 'low_confidence':
    case 'loop_detected':
    case 'out_of_scope':
    default:
      return 'low'
  }
}

/**
 * Get detailed reason message.
 */
function getReasonDetails(reason: HandoffReason, message: string): string {
  const truncatedMessage = message.slice(0, 100)

  switch (reason) {
    case 'emergency':
      return `Emergência detectada na mensagem: "${truncatedMessage}"`
    case 'patient_request':
      return 'Paciente solicitou atendimento humano'
    case 'frustration':
      return `Frustração detectada na mensagem: "${truncatedMessage}"`
    case 'low_confidence':
      return 'Confiança da IA abaixo do limite aceitável'
    case 'loop_detected':
      return 'Conversa em loop - mesmas perguntas repetidas'
    case 'out_of_scope':
      return `Pergunta fora do escopo de saúde: "${truncatedMessage}"`
    default:
      return 'Escalação para atendimento humano'
  }
}
