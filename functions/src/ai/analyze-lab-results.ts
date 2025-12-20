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
} from './types.js';
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
      console.error('No data in event');
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

      // Step 6: Layer 3 - Multimodal Fusion
      const { differentialDiagnosis, investigativeQuestions, suggestedTests } =
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
          model: GEMINI_MODEL,
          promptVersion: getCombinedPromptVersion(),
          inputTokens: 0,
          outputTokens: 0,
        },
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

      console.warn(`Lab analysis ${sessionId} completed in ${processingTimeMs}ms`);
    } catch (error) {
      console.error(`Error analyzing lab results ${sessionId}:`, error);

      await sessionRef.update({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date().toISOString(),
      });
    }
  }
);
