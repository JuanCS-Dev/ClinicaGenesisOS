/**
 * Clinical Reasoning Pipeline Layers
 * ===================================
 *
 * Implements the 4-layer clinical reasoning pipeline:
 * Layer 1: Triage (urgency classification)
 * Layer 2: Specialty Investigation (focused analysis)
 * Layer 3: Multimodal Fusion (integrate all data)
 * Layer 4: Explainability (validation + XAI)
 */

import { getVertexAIClient } from '../utils/config.js';
import {
  TRIAGE_SYSTEM_PROMPT,
  TRIAGE_USER_PROMPT,
  generateSpecialtyPrompt,
  FUSION_SYSTEM_PROMPT,
  FUSION_USER_PROMPT,
  EXPLAINABILITY_SYSTEM_PROMPT,
  EXPLAINABILITY_USER_PROMPT,
} from './prompts/index.js';
import {
  ExtractedBiomarker,
  TriageResult,
  ClinicalCorrelation,
  DifferentialDiagnosis,
  InvestigativeQuestion,
  SuggestedTest,
  PatientContext,
  ClinicalSpecialty,
} from './types.js';
import { formatMarkersForPrompt, formatPatientContext } from './analysis-utils.js';

const GEMINI_MODEL = 'gemini-2.5-flash';

/**
 * Run Layer 1: Triage.
 */
export async function runTriageLayer(
  client: Awaited<ReturnType<typeof getVertexAIClient>>,
  markers: ExtractedBiomarker[],
  patientContext: PatientContext
): Promise<TriageResult> {
  const prompt = TRIAGE_USER_PROMPT
    .replace('{{age}}', patientContext.age.toString())
    .replace('{{sex}}', patientContext.sex === 'male' ? 'Masculino' : 'Feminino')
    .replace('{{chiefComplaint}}', patientContext.chiefComplaint || 'Não informado')
    .replace('{{relevantHistory}}', patientContext.relevantHistory?.join(', ') || 'Não informado')
    .replace('{{labResults}}', formatMarkersForPrompt(markers))
    .replace('{{soapNotes}}', patientContext.soapNotes
      ? Object.entries(patientContext.soapNotes)
          .map(([k, v]) => `${k}: ${v}`).join('\n')
      : 'Não disponível');

  const response = await client.models.generateContent({
    model: GEMINI_MODEL,
    config: {
      systemInstruction: TRIAGE_SYSTEM_PROMPT,
      temperature: 0.1,
    },
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });

  const text = response.text || '';
  const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    const parsed = JSON.parse(jsonStr);
    return {
      urgency: parsed.urgency || 'routine',
      redFlags: parsed.redFlags || [],
      recommendedWorkflow: parsed.recommendedWorkflow || 'primary',
      confidence: parsed.confidence || 50,
    };
  } catch {
    // Fallback: check for critical values
    const hasCritical = markers.some(m => m.status === 'critical');
    return {
      urgency: hasCritical ? 'critical' : 'routine',
      redFlags: [],
      recommendedWorkflow: hasCritical ? 'emergency' : 'primary',
      confidence: 30,
    };
  }
}

/**
 * Run Layer 2: Specialty Investigation.
 */
export async function runSpecialtyLayer(
  client: Awaited<ReturnType<typeof getVertexAIClient>>,
  specialty: ClinicalSpecialty,
  markers: ExtractedBiomarker[],
  patientContext: PatientContext
): Promise<{ chainOfThought: string[]; specialtyFindings: unknown }> {
  const prompt = generateSpecialtyPrompt(
    specialty,
    formatPatientContext(patientContext),
    formatMarkersForPrompt(markers)
  );

  const response = await client.models.generateContent({
    model: GEMINI_MODEL,
    config: { temperature: 0.3 },
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });

  const text = response.text || '';
  const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    const parsed = JSON.parse(jsonStr);
    const cot = parsed.chainOfThought?.map((step: { analysis: string }) =>
      step.analysis
    ) || [];
    return { chainOfThought: cot, specialtyFindings: parsed.specialtyFindings };
  } catch {
    return { chainOfThought: [], specialtyFindings: {} };
  }
}

/**
 * Run Layer 3: Multimodal Fusion.
 */
export async function runFusionLayer(
  client: Awaited<ReturnType<typeof getVertexAIClient>>,
  markers: ExtractedBiomarker[],
  patientContext: PatientContext,
  triageResult: TriageResult,
  correlations: ClinicalCorrelation[],
  specialtyAnalysis: unknown
): Promise<{
  differentialDiagnosis: DifferentialDiagnosis[];
  investigativeQuestions: InvestigativeQuestion[];
  suggestedTests: SuggestedTest[];
}> {
  const prompt = FUSION_USER_PROMPT
    .replace('{{patientSummary}}', formatPatientContext(patientContext))
    .replace('{{labResults}}', formatMarkersForPrompt(markers))
    .replace('{{soapNotes}}', patientContext.soapNotes
      ? Object.entries(patientContext.soapNotes)
          .map(([k, v]) => `${k}: ${v}`).join('\n')
      : 'Não disponível')
    .replace('{{triageResult}}', JSON.stringify(triageResult))
    .replace('{{specialtyAnalysis}}', JSON.stringify(specialtyAnalysis))
    .replace('{{correlations}}', correlations.map(c => c.pattern).join('\n'));

  const response = await client.models.generateContent({
    model: GEMINI_MODEL,
    config: {
      systemInstruction: FUSION_SYSTEM_PROMPT,
      temperature: 0.2,
    },
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });

  const text = response.text || '';
  const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    const parsed = JSON.parse(jsonStr);
    return {
      differentialDiagnosis: (parsed.differentialDiagnosis || []).map((d: {
        name: string;
        icd10?: string;
        confidence: number;
        supportingEvidence: Array<{ finding: string }>;
        contradictingEvidence?: Array<{ finding: string }>;
        suggestedTests?: Array<{ name: string }>;
      }) => ({
        icd10: d.icd10,
        name: d.name,
        confidence: d.confidence,
        supportingEvidence: d.supportingEvidence?.map(e => e.finding) || [],
        contradictingEvidence: d.contradictingEvidence?.map(e => e.finding) || [],
        suggestedTests: d.suggestedTests?.map(t => t.name) || [],
      })),
      investigativeQuestions: parsed.investigativeQuestions || [],
      suggestedTests: (parsed.additionalTests || []).map((t: {
        test: string;
        rationale: string;
        urgency: string;
        investigates: string;
      }) => ({
        name: t.test,
        rationale: t.rationale,
        urgency: t.urgency,
        investigates: t.investigates,
      })),
    };
  } catch {
    return { differentialDiagnosis: [], investigativeQuestions: [], suggestedTests: [] };
  }
}

/**
 * Run Layer 4: Explainability (optional validation).
 */
export async function runExplainabilityLayer(
  client: Awaited<ReturnType<typeof getVertexAIClient>>,
  inputData: string,
  analysisResult: string
): Promise<{ validated: boolean; explanation: string }> {
  const prompt = EXPLAINABILITY_USER_PROMPT
    .replace('{{inputData}}', inputData)
    .replace('{{analysisResult}}', analysisResult);

  const response = await client.models.generateContent({
    model: GEMINI_MODEL,
    config: {
      systemInstruction: EXPLAINABILITY_SYSTEM_PROMPT,
      temperature: 0.1,
    },
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });

  const text = response.text || '';
  const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    const parsed = JSON.parse(jsonStr);
    return {
      validated: parsed.validation?.isGrounded ?? true,
      explanation: parsed.explanation?.summary || '',
    };
  } catch {
    return { validated: true, explanation: '' };
  }
}
