/**
 * Companion Prompts Index
 * =======================
 *
 * Central export for all companion prompts.
 *
 * @module companion/prompts
 */

export {
  PROMPT_VERSION as COMPANION_PROMPT_VERSION,
  COMPANION_SYSTEM_PROMPT,
  generateCompanionUserPrompt,
} from './companion-system.js'

export { TRIAGE_PROMPT_VERSION, TRIAGE_SYSTEM_PROMPT, generateTriageUserPrompt } from './triage.js'

/**
 * Combined prompt versions for audit trail.
 */
export const COMPANION_PROMPT_VERSIONS = {
  companion: 'v1.0.0',
  triage: 'v1.0.0',
  combined: 'v1.0.0',
}

/**
 * Get combined prompt version string for logging.
 */
export function getCombinedPromptVersion(): string {
  return `companion:${COMPANION_PROMPT_VERSIONS.companion}|triage:${COMPANION_PROMPT_VERSIONS.triage}`
}
