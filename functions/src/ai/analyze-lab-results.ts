/**
 * Lab Results Analysis Cloud Function
 * ====================================
 *
 * Orchestrates the 4-layer clinical reasoning pipeline:
 * Layer 1: Triage (urgency classification)
 * Layer 2: Specialty Investigation (focused analysis)
 * Layer 3: Multimodal Fusion (integrate all data)
 * Layer 4: Explainability (validation + XAI)
 *
 * Trigger: Firestore onCreate on /clinics/{clinicId}/labAnalysisSessions/{sessionId}
 */

import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getVertexAIClient, isFeatureEnabled } from '../utils/config.js';
import { detectAllPatterns, PatternContext } from './correlations/index.js';
import {
  DISCLAIMERS,
  getCombinedPromptVersion,
} from './prompts/index.js';
import {
  LabAnalysisInput,
  LabAnalysisResult,
  DifferentialDiagnosis,
  DiagnosisLiterature,
} from './types.js';
import { searchByICD10, type Article } from '../literature/simple-search.js';
import {
  processLabResults,
  detectRelevantSpecialty,
  formatMarkersForPrompt,
} from './analysis-utils.js';
import {
  runTriageLayer,
  runSpecialtyLayer,
  runFusionLayer,
  runExplainabilityLayer,
} from './analysis-pipeline.js';

const GEMINI_MODEL = 'gemini-2.5-flash';

/** Minimum confidence threshold for literature backing (skip basic diagnoses) */
const LITERATURE_CONFIDENCE_THRESHOLD = 95;

/**
 * Cloud Function: Analyze Lab Results
 *
 * Triggered when a new lab analysis session is created.
 * Orchestrates the 4-layer clinical reasoning pipeline.
 */
export const analyzeLabResults = onDocumentCreated(
  {
    document: 'clinics/{clinicId}/labAnalysisSessions/{sessionId}',
    region: 'southamerica-east1',
    memory: '2GiB',
    timeoutSeconds: 180,
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      logger.error('No data in event');
      return;
    }

    const { clinicId, sessionId } = event.params;
    const sessionData = snapshot.data() as LabAnalysisInput;
    const db = getFirestore();
    const sessionRef = db
      .collection('clinics')
      .doc(clinicId)
      .collection('labAnalysisSessions')
      .doc(sessionId);

    const startTime = Date.now();

    try {
      // Check if feature is enabled
      const enabled = await isFeatureEnabled(clinicId, 'ai-diagnostic');
      if (!enabled) {
        await sessionRef.update({
          status: 'error',
          error: 'Clinical Reasoning not enabled for this clinic',
          completedAt: new Date().toISOString(),
        });
        return;
      }

      // Update status to processing
      await sessionRef.update({ status: 'processing' });

      // Get AI client
      const client = await getVertexAIClient();

      // Step 1: Process raw lab results
      const markers = processLabResults(sessionData.labResults);
      const summary = {
        critical: markers.filter(m => m.status === 'critical').length,
        attention: markers.filter(m => m.status === 'attention').length,
        normal: markers.filter(m => m.status === 'normal').length,
      };

      // Step 2: Run pattern detection (deterministic)
      const patternContext: PatternContext = {};
      const correlations = detectAllPatterns(markers, patternContext);

      // Step 3: Layer 1 - Triage
      const triage = await runTriageLayer(client, markers, sessionData.patientContext);

      // Step 4: Detect relevant specialty
      const specialty = detectRelevantSpecialty(markers);

      // Step 5: Layer 2 - Specialty Investigation
      const { chainOfThought, specialtyFindings } = await runSpecialtyLayer(
        client, specialty, markers, sessionData.patientContext
      );

      // Step 6: Layer 3 - Multimodal Fusion + Multi-LLM Consensus
      const { differentialDiagnosis, investigativeQuestions, suggestedTests, consensusMetrics } =
        await runFusionLayer(
          client, markers, sessionData.patientContext,
          triage, correlations, specialtyFindings
        );

      // Step 7: Layer 4 - Explainability (validation)
      const { validated } = await runExplainabilityLayer(
        client,
        formatMarkersForPrompt(markers),
        JSON.stringify({ differentialDiagnosis, correlations })
      );

      const processingTimeMs = Date.now() - startTime;

      // Build final result
      const result: LabAnalysisResult = {
        summary: { ...summary, overallRiskScore: triage.confidence },
        triage,
        markers,
        correlations,
        differentialDiagnosis,
        investigativeQuestions,
        suggestedTests,
        chainOfThought,
        disclaimer: DISCLAIMERS.full,
        metadata: {
          processingTimeMs,
          model: consensusMetrics?.modelsUsed.join(' + ') || GEMINI_MODEL,
          promptVersion: getCombinedPromptVersion(),
          inputTokens: 0,
          outputTokens: 0,
        },
        // Multi-LLM Consensus metrics (Fase 3.3.8)
        consensusMetrics,
      };

      // Update session with result
      await sessionRef.update({
        status: 'ready',
        result,
        validated,
        completedAt: new Date().toISOString(),
      });

      // Log for audit trail
      await db.collection('clinics').doc(clinicId)
        .collection('aiAnalysisLogs').add({
          type: 'lab_analysis',
          sessionId,
          patientId: sessionData.patientId,
          physicianId: sessionData.physicianId,
          timestamp: FieldValue.serverTimestamp(),
          processingTimeMs,
          model: GEMINI_MODEL,
          promptVersion: getCombinedPromptVersion(),
          markersCount: markers.length,
          correlationsCount: correlations.length,
          urgency: triage.urgency,
          validated,
        });

      logger.info(`Lab analysis ${sessionId} completed in ${processingTimeMs}ms`);

      // Step 8: Search for scientific literature backing (async, non-blocking)
      // Only for medium/high complexity diagnoses (confidence < 95%)
      fetchLiteratureBacking(
        sessionRef,
        differentialDiagnosis,
        specialty
      ).catch((err) => {
        logger.warn(`[LiteratureBacking] Non-fatal error: ${err.message}`);
      });
    } catch (error) {
      logger.error(`Error analyzing lab results ${sessionId}:`, { error });

      await sessionRef.update({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date().toISOString(),
      });
    }
  }
);

/**
 * Fetch scientific literature backing for diagnoses.
 * Simple: Europe PMC only, no overengineering.
 */
async function fetchLiteratureBacking(
  sessionRef: FirebaseFirestore.DocumentReference,
  diagnoses: DifferentialDiagnosis[],
  _specialty: string
): Promise<void> {
  // Only for non-obvious diagnoses (confidence < 95%)
  const needsBacking = diagnoses.filter(
    (d) => d.confidence < LITERATURE_CONFIDENCE_THRESHOLD && d.icd10
  );

  if (needsBacking.length === 0) return;

  // Searching literature for diagnoses that need backing

  const results: DiagnosisLiterature[] = [];

  for (const d of needsBacking) {
    const articles = await searchByICD10(d.icd10!);

    results.push({
      icd10: d.icd10!,
      diagnosisName: d.name,
      articles: articles.map((a: Article) => ({
        title: a.title,
        authors: a.authors,
        journal: a.journal,
        year: a.year,
        url: a.url,
        excerpt: null,
        relevance: Math.min(100, 50 + Math.log10(a.citations + 1) * 15),
      })),
      status: articles.length >= 2 ? 'ready' : 'not_available',
    });
  }

  const withArticles = results.filter((r) => r.status === 'ready');
  if (withArticles.length > 0) {
    await sessionRef.update({
      'result.scientificReferences': results,
      literatureBackingCompletedAt: new Date().toISOString(),
    });
    // Literature backing completed successfully
  }
}
