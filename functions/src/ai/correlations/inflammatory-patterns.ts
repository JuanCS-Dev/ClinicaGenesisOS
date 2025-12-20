/**
 * Inflammatory Correlation Patterns
 * ==================================
 *
 * Patterns for acute infection, chronic inflammation, and autoimmune markers.
 */

import { ClinicalCorrelation, ExtractedBiomarker } from '../types.js';

/**
 * Check for acute infection/inflammation pattern.
 */
export function checkAcuteInflammation(
  markers: ExtractedBiomarker[]
): ClinicalCorrelation | null {
  const wbc = markers.find(m => m.id === 'wbc')?.value;
  const neutrophils = markers.find(m => m.id === 'neutrophils')?.value;
  const crp = markers.find(m => m.id === 'crp')?.value;
  const esr = markers.find(m => m.id === 'esr')?.value;

  const findings: string[] = [];
  const involvedMarkers: string[] = [];

  if (wbc !== undefined && wbc > 11000) {
    findings.push(`Leucocitose (${wbc.toLocaleString()} /mm³)`);
    involvedMarkers.push('wbc');
  }
  if (neutrophils !== undefined && neutrophils > 70) {
    findings.push(`Neutrofilia (${neutrophils}%)`);
    involvedMarkers.push('neutrophils');
  }
  if (crp !== undefined && crp > 10) {
    findings.push(`PCR muito elevado (${crp} mg/L)`);
    involvedMarkers.push('crp');
  }
  if (esr !== undefined && esr > 30) {
    findings.push(`VHS elevado (${esr} mm/h)`);
    involvedMarkers.push('esr');
  }

  // Need at least 2 markers for pattern
  if (involvedMarkers.length < 2) return null;

  // Assess severity
  let severity = 'Leve a Moderada';
  if ((crp !== undefined && crp > 50) || (wbc !== undefined && wbc > 20000)) {
    severity = 'Significativa';
  }
  if ((crp !== undefined && crp > 100) || (wbc !== undefined && wbc > 30000)) {
    severity = 'Grave - Considerar Sepse';
  }

  return {
    type: 'infection_pattern',
    markers: involvedMarkers,
    pattern: `Resposta Inflamatória Aguda ${severity}`,
    clinicalImplication: findings.join('. ') +
      ' Investigar foco infeccioso. Avaliar necessidade de culturas e antibioticoterapia.',
    confidence: involvedMarkers.length >= 3 ? 'high' : 'medium',
    evidence: involvedMarkers.map(m => ({
      source: 'lab' as const,
      reference: m,
      value: markers.find(mk => mk.id === m)?.value?.toString(),
    })),
  };
}

/**
 * Check for chronic low-grade inflammation pattern.
 */
export function checkChronicInflammation(
  markers: ExtractedBiomarker[]
): ClinicalCorrelation | null {
  const crpHs = markers.find(m => m.id === 'crp_high_sensitivity')?.value;
  const ferritin = markers.find(m => m.id === 'ferritin')?.value;
  const fibrinogen = markers.find(m => m.id === 'fibrinogen')?.value;
  const esr = markers.find(m => m.id === 'esr')?.value;

  const findings: string[] = [];
  const involvedMarkers: string[] = [];

  // Low-grade inflammation markers (elevated but not extremely)
  if (crpHs !== undefined && crpHs > 1 && crpHs <= 10) {
    findings.push(`PCR-us elevado (${crpHs} mg/L)`);
    involvedMarkers.push('crp_high_sensitivity');
  }
  if (ferritin !== undefined && ferritin > 200) {
    findings.push(`Ferritina elevada (${ferritin} ng/mL)`);
    involvedMarkers.push('ferritin');
  }
  if (fibrinogen !== undefined && fibrinogen > 400) {
    findings.push(`Fibrinogênio elevado (${fibrinogen} mg/dL)`);
    involvedMarkers.push('fibrinogen');
  }
  if (esr !== undefined && esr > 15 && esr <= 40) {
    findings.push(`VHS moderadamente elevado (${esr} mm/h)`);
    involvedMarkers.push('esr');
  }

  if (involvedMarkers.length < 2) return null;

  return {
    type: 'chronic_inflammation',
    markers: involvedMarkers,
    pattern: 'Inflamação Crônica de Baixo Grau',
    clinicalImplication: findings.join('. ') +
      ' Associada a obesidade, síndrome metabólica, risco cardiovascular aumentado. Considerar modificações de estilo de vida.',
    confidence: involvedMarkers.length >= 3 ? 'high' : 'medium',
    evidence: involvedMarkers.map(m => ({
      source: 'lab' as const,
      reference: m,
      value: markers.find(mk => mk.id === m)?.value?.toString(),
    })),
  };
}

/**
 * Check for possible autoimmune pattern.
 */
export function checkAutoimmuneSuggestion(
  markers: ExtractedBiomarker[]
): ClinicalCorrelation | null {
  const crp = markers.find(m => m.id === 'crp')?.value ||
              markers.find(m => m.id === 'crp_high_sensitivity')?.value;
  const esr = markers.find(m => m.id === 'esr')?.value;
  const lymphocytes = markers.find(m => m.id === 'lymphocytes')?.value;

  const findings: string[] = [];
  const involvedMarkers: string[] = [];

  // Pattern: elevated ESR with normal/low CRP can suggest autoimmune
  if (esr !== undefined && esr > 40) {
    findings.push(`VHS muito elevado (${esr} mm/h)`);
    involvedMarkers.push('esr');
  }

  // ESR >> CRP discrepancy
  if (esr !== undefined && crp !== undefined && esr > 50 && crp < 10) {
    findings.push('Dissociação VHS/PCR (VHS >> PCR)');
  }

  // Lymphopenia can be seen in some autoimmune conditions
  if (lymphocytes !== undefined && lymphocytes < 20) {
    findings.push(`Linfopenia (${lymphocytes}%)`);
    involvedMarkers.push('lymphocytes');
  }

  if (involvedMarkers.length < 2) return null;

  return {
    type: 'autoimmune_pattern',
    markers: involvedMarkers,
    pattern: 'Padrão Sugestivo de Processo Autoimune',
    clinicalImplication: findings.join('. ') +
      ' Considerar investigação reumatológica (FAN, anti-DNA, complemento) se clinicamente indicado.',
    confidence: 'low', // Autoimmune diagnosis requires more specific markers
    evidence: involvedMarkers.map(m => ({
      source: 'lab' as const,
      reference: m,
        value: markers.find(mk => mk.id === m)?.value?.toString(),
    })),
  };
}

/**
 * Check for eosinophilia pattern.
 */
export function checkEosinophilia(
  markers: ExtractedBiomarker[]
): ClinicalCorrelation | null {
  const eosinophils = markers.find(m => m.id === 'eosinophils')?.value;
  const wbc = markers.find(m => m.id === 'wbc')?.value;

  if (eosinophils === undefined || eosinophils <= 5) return null;

  const findings: string[] = [];
  const involvedMarkers: string[] = ['eosinophils'];

  findings.push(`Eosinofilia (${eosinophils}%)`);

  // Calculate absolute count if WBC available
  if (wbc !== undefined) {
    const absEos = Math.round((eosinophils / 100) * wbc);
    findings.push(`Contagem absoluta: ${absEos.toLocaleString()} /mm³`);
    involvedMarkers.push('wbc');
  }

  let severity = 'Leve';
  if (eosinophils > 10) severity = 'Moderada';
  if (eosinophils > 20) severity = 'Acentuada';

  return {
    type: 'custom',
    markers: involvedMarkers,
    pattern: `Eosinofilia ${severity}`,
    clinicalImplication: findings.join('. ') +
      ' Considerar: parasitose, alergia/atopia, asma, dermatite, reação medicamentosa, doença eosinofílica.',
    confidence: eosinophils > 10 ? 'high' : 'medium',
    evidence: involvedMarkers.map(m => ({
      source: 'lab' as const,
      reference: m,
      value: markers.find(mk => mk.id === m)?.value?.toString(),
    })),
  };
}

/**
 * Run all inflammatory pattern checks.
 */
export function checkInflammatoryPatterns(
  markers: ExtractedBiomarker[]
): ClinicalCorrelation[] {
  const correlations: ClinicalCorrelation[] = [];

  const acute = checkAcuteInflammation(markers);
  if (acute) correlations.push(acute);

  const chronic = checkChronicInflammation(markers);
  if (chronic) correlations.push(chronic);

  const autoimmune = checkAutoimmuneSuggestion(markers);
  if (autoimmune) correlations.push(autoimmune);

  const eosinophilia = checkEosinophilia(markers);
  if (eosinophilia) correlations.push(eosinophilia);

  return correlations;
}
