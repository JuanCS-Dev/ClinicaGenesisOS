/**
 * Clinical Reasoning Components
 * ==============================
 *
 * Components for the Clinical Reasoning Engine integration.
 */

export { BiomarkerCard } from './BiomarkerCard';
export { CorrelationCard } from './CorrelationCard';
export { AnalysisSummary } from './AnalysisSummary';
export { LabUploadPanel } from './LabUploadPanel';
export { ClinicalReasoningPanel } from './ClinicalReasoningPanel';
export { ReferenceCard } from './ReferenceCard';
export { ReferencesPanel } from './ReferencesPanel';
export { ConsensusBadge, ModelComparison } from './ConsensusBadge';
export { HistoryView } from './HistoryView';
export { DiagnosisView } from './DiagnosisView';
export { SuggestionsView } from './SuggestionsView';
export { ResultsView } from './ResultsView';

// Explainability components (Fase 13)
export { ExplanationPanel } from './ExplanationPanel';
export type { DiagnosisExplanation, ExplanationReason } from './ExplanationPanel';
export { EvidenceLinks } from './EvidenceLinks';
export type { ScientificReference, ReferenceSource } from './EvidenceLinks';
export { ConfidenceGauge, ConfidenceBar } from './ConfidenceGauge';
