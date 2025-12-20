/**
 * Clinical Reasoning Prompts Index
 * =================================
 *
 * Central export for all 4-layer pipeline prompts.
 */

// Layer 1: Triage
export {
  PROMPT_VERSION_TRIAGE,
  TRIAGE_SYSTEM_PROMPT,
  TRIAGE_USER_PROMPT,
  CRITICAL_THRESHOLDS,
} from './triage.js';

// Layer 2: Specialty Investigation
export {
  PROMPT_VERSION_SPECIALTY,
  SPECIALTY_TEMPLATES,
  generateSpecialtyPrompt,
} from './specialty-investigation.js';

// Layer 3: Multimodal Fusion
export {
  PROMPT_VERSION_FUSION,
  FUSION_SYSTEM_PROMPT,
  FUSION_USER_PROMPT,
  CLINICAL_GUIDELINES,
} from './multimodal-fusion.js';

// Layer 4: Explainability
export {
  PROMPT_VERSION_EXPLAINABILITY,
  EXPLAINABILITY_SYSTEM_PROMPT,
  EXPLAINABILITY_USER_PROMPT,
  AI_DISCLAIMER,
  DISCLAIMERS,
  CONFIDENCE_RULES,
} from './explainability.js';

/**
 * Combined prompt versions for audit trail.
 */
export const PROMPT_VERSIONS = {
  triage: 'v1.0.0',
  specialty: 'v1.0.0',
  fusion: 'v1.0.0',
  explainability: 'v1.0.0',
  combined: 'v1.0.0',
};

/**
 * Get combined prompt version string for logging.
 */
export function getCombinedPromptVersion(): string {
  return `triage:${PROMPT_VERSIONS.triage}|specialty:${PROMPT_VERSIONS.specialty}|fusion:${PROMPT_VERSIONS.fusion}|xai:${PROMPT_VERSIONS.explainability}`;
}
