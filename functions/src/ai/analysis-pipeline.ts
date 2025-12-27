/**
 * Clinical Reasoning Pipeline Layers
 * ===================================
 *
 * Implements the 4-layer clinical reasoning pipeline:
 * Layer 1: Triage (urgency classification)
 * Layer 2: Specialty Investigation (focused analysis)
 * Layer 3: Multimodal Fusion (integrate all data) + Multi-LLM Consensus
 * Layer 4: Explainability (validation + XAI)
 *
 * Updated in Fase 3.3.8 to support Multi-LLM Consensus (Gemini + GPT-4o-mini)
 */

import { logger } from 'firebase-functions';
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
  ConsensusDiagnosis,
  ConsensusMetrics,
} from './types.js';
import {
  callAzureOpenAI,
  parseAzureResponse,
  isAzureOpenAIConfigured,
} from './azure-openai-client.js';
import {
  aggregateDiagnoses,
  toDiagnosisInput,
  fallbackToSingleModel,
  type ModelDiagnosisInput,
} from './multi-llm-aggregator.js';
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
 * GPT-4o-mini Challenger prompt for multi-LLM consensus.
 */
const GPT_CHALLENGER_SYSTEM_PROMPT = `Você é um médico especialista revisando uma análise de exames laboratoriais.

Sua tarefa é gerar um diagnóstico diferencial independente, baseado nos dados clínicos.
Seja crítico e considere diagnósticos que podem ter sido negligenciados.

IMPORTANTE:
- Retorne EXATAMENTE 5 diagnósticos
- Use terminologia médica em português
- Inclua ICD-10 quando possível
- Base suas conclusões nas evidências apresentadas`;

/**
 * Run Layer 3: Multimodal Fusion with Multi-LLM Consensus.
 *
 * Fase 3.3.8: Calls both Gemini and GPT-4o-mini in parallel,
 * then aggregates results using 1/r weighted method.
 */
export async function runFusionLayer(
  client: Awaited<ReturnType<typeof getVertexAIClient>>,
  markers: ExtractedBiomarker[],
  patientContext: PatientContext,
  triageResult: TriageResult,
  correlations: ClinicalCorrelation[],
  specialtyAnalysis: unknown
): Promise<{
  differentialDiagnosis: ConsensusDiagnosis[];
  investigativeQuestions: InvestigativeQuestion[];
  suggestedTests: SuggestedTest[];
  consensusMetrics?: ConsensusMetrics;
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

  // Prepare GPT-4o challenger prompt
  const gptUserPrompt = `DADOS DO PACIENTE:
${formatPatientContext(patientContext)}

EXAMES LABORATORIAIS:
${formatMarkersForPrompt(markers)}

TRIAGEM:
- Urgência: ${triageResult.urgency}
- Red Flags: ${triageResult.redFlags.map(r => r.description).join(', ') || 'Nenhum'}

CORRELAÇÕES IDENTIFICADAS:
${correlations.map(c => c.pattern).join('\n') || 'Nenhuma'}

TAREFA: Gere um diagnóstico diferencial com 5 hipóteses, ordenadas por probabilidade.

FORMATO DE SAÍDA (JSON):
{
  "differentialDiagnosis": [
    {
      "name": "Nome do diagnóstico",
      "icd10": "X00.0",
      "confidence": 85,
      "supportingEvidence": ["evidência 1", "evidência 2"],
      "contradictingEvidence": ["se houver"],
      "suggestedTests": ["exame adicional"]
    }
  ]
}`;

  // Call both models in parallel
  const startTime = Date.now();
  const [geminiResult, gptResult] = await Promise.allSettled([
    // Gemini 2.5 Flash (primary)
    client.models.generateContent({
      model: GEMINI_MODEL,
      config: {
        systemInstruction: FUSION_SYSTEM_PROMPT,
        temperature: 0.2,
      },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    }),
    // GPT-4o-mini (challenger) - only if configured
    isAzureOpenAIConfigured()
      ? callAzureOpenAI(GPT_CHALLENGER_SYSTEM_PROMPT, gptUserPrompt, {
          temperature: 0.2,
          responseFormat: 'json',
        })
      : Promise.resolve(null),
  ]);

  const geminiTimeMs = Date.now() - startTime;

  // Parse Gemini response
  let geminiDiagnoses: DifferentialDiagnosis[] = [];
  let investigativeQuestions: InvestigativeQuestion[] = [];
  let suggestedTests: SuggestedTest[] = [];

  if (geminiResult.status === 'fulfilled' && geminiResult.value) {
    const text = geminiResult.value.text || '';
    const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    try {
      const parsed = JSON.parse(jsonStr);
      geminiDiagnoses = (parsed.differentialDiagnosis || []).map((d: {
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
      }));
      investigativeQuestions = parsed.investigativeQuestions || [];
      suggestedTests = (parsed.additionalTests || []).map((t: {
        test: string;
        rationale: string;
        urgency: string;
        investigates: string;
      }) => ({
        name: t.test,
        rationale: t.rationale,
        urgency: t.urgency,
        investigates: t.investigates,
      }));
    } catch (parseError) {
      logger.error('[FusionLayer] Failed to parse Gemini response:', { parseError });
    }
  }

  // Parse GPT-4o response
  let gptDiagnoses: ModelDiagnosisInput[] = [];
  let gptTimeMs = 0;

  if (gptResult.status === 'fulfilled' && gptResult.value) {
    gptTimeMs = Date.now() - startTime - geminiTimeMs;
    const parsed = parseAzureResponse<{
      differentialDiagnosis: Array<{
        name: string;
        icd10?: string;
        confidence: number;
        supportingEvidence: string[];
        contradictingEvidence?: string[];
        suggestedTests?: string[];
      }>;
    }>(gptResult.value);

    if (parsed?.differentialDiagnosis) {
      gptDiagnoses = parsed.differentialDiagnosis.map((d, idx) => ({
        name: d.name,
        rank: idx + 1,
        confidence: d.confidence,
        icd10: d.icd10,
        supportingEvidence: d.supportingEvidence || [],
        contradictingEvidence: d.contradictingEvidence,
        suggestedTests: d.suggestedTests,
      }));
    }
  }

  // Aggregate diagnoses using 1/r weighted method
  let consensusDiagnoses: ConsensusDiagnosis[];
  let consensusMetrics: ConsensusMetrics;

  if (gptDiagnoses.length > 0) {
    // Multi-LLM consensus
    const geminiInputs = toDiagnosisInput(geminiDiagnoses);
    const result = aggregateDiagnoses(geminiInputs, gptDiagnoses);
    consensusDiagnoses = result.diagnoses;
    consensusMetrics = {
      ...result.metrics,
      modelTimings: {
        gemini: geminiTimeMs,
        gpt4o: gptTimeMs,
      },
    };

    logger.info(
      `[FusionLayer] Multi-LLM consensus: ${consensusMetrics.strongConsensusRate}% strong, ` +
      `${consensusMetrics.divergentCount} divergent`
    );
  } else {
    // Fallback to single model
    const result = fallbackToSingleModel(geminiDiagnoses);
    consensusDiagnoses = result.diagnoses;
    consensusMetrics = {
      ...result.metrics,
      modelTimings: { gemini: geminiTimeMs },
    };

    logger.warn('[FusionLayer] Single model fallback (GPT-4o unavailable)');
  }

  return {
    differentialDiagnosis: consensusDiagnoses,
    investigativeQuestions,
    suggestedTests,
    consensusMetrics,
  };
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
