/**
 * Kidney Function Correlation Patterns
 * =====================================
 *
 * Patterns for CKD staging, AKI, and electrolyte disturbances.
 */

import { ClinicalCorrelation, ExtractedBiomarker } from '../types.js';

/**
 * Classify CKD stage based on GFR.
 */
export function classifyCKDStage(gfr: number): {
  stage: string;
  description: string;
  severity: 'normal' | 'mild' | 'moderate' | 'severe' | 'critical';
} {
  if (gfr >= 90) {
    return { stage: 'G1', description: 'Normal ou alta', severity: 'normal' };
  } else if (gfr >= 60) {
    return { stage: 'G2', description: 'Levemente reduzida', severity: 'mild' };
  } else if (gfr >= 45) {
    return { stage: 'G3a', description: 'Leve a moderadamente reduzida', severity: 'moderate' };
  } else if (gfr >= 30) {
    return { stage: 'G3b', description: 'Moderada a gravemente reduzida', severity: 'moderate' };
  } else if (gfr >= 15) {
    return { stage: 'G4', description: 'Gravemente reduzida', severity: 'severe' };
  } else {
    return { stage: 'G5', description: 'Falência renal', severity: 'critical' };
  }
}

/**
 * Check for chronic kidney disease pattern.
 */
export function checkCKD(
  markers: ExtractedBiomarker[]
): ClinicalCorrelation | null {
  const gfr = markers.find(m => m.id === 'gfr')?.value;
  const creatinine = markers.find(m => m.id === 'creatinine')?.value;
  const urea = markers.find(m => m.id === 'urea')?.value;
  const microalbumin = markers.find(m => m.id === 'microalbumin')?.value;

  const findings: string[] = [];
  const involvedMarkers: string[] = [];

  if (gfr !== undefined && gfr < 60) {
    const ckdStage = classifyCKDStage(gfr);
    findings.push(`TFG ${gfr} mL/min - Estágio ${ckdStage.stage} (${ckdStage.description})`);
    involvedMarkers.push('gfr');
  }
  if (creatinine !== undefined && creatinine > 1.2) {
    findings.push(`Creatinina elevada (${creatinine} mg/dL)`);
    involvedMarkers.push('creatinine');
  }
  if (urea !== undefined && urea > 45) {
    findings.push(`Ureia elevada (${urea} mg/dL)`);
    involvedMarkers.push('urea');
  }
  if (microalbumin !== undefined && microalbumin > 30) {
    findings.push(`Microalbuminúria (${microalbumin} mg/L)`);
    involvedMarkers.push('microalbumin');
  }

  if (involvedMarkers.length === 0) return null;

  // Determine severity
  let severity: 'medium' | 'high' = 'medium';
  if (gfr !== undefined && gfr < 30) severity = 'high';
  if (microalbumin !== undefined && microalbumin > 300) severity = 'high';

  return {
    type: 'kidney_dysfunction',
    markers: involvedMarkers,
    pattern: gfr !== undefined && gfr < 60
      ? `Doença Renal Crônica - ${classifyCKDStage(gfr).stage}`
      : 'Alteração de Função Renal',
    clinicalImplication: findings.join('. ') +
      ' Investigar etiologia (HAS, DM, glomerulopatia). Avaliar necessidade de encaminhamento à nefrologia.',
    confidence: severity,
    evidence: involvedMarkers.map(m => ({
      source: 'lab' as const,
      reference: m,
      value: markers.find(mk => mk.id === m)?.value?.toString(),
    })),
  };
}

/**
 * Check for acute kidney injury pattern.
 */
export function checkAKI(
  markers: ExtractedBiomarker[],
  baselineCreatinine?: number
): ClinicalCorrelation | null {
  const creatinine = markers.find(m => m.id === 'creatinine')?.value;
  const potassium = markers.find(m => m.id === 'potassium')?.value;

  if (creatinine === undefined) return null;

  const findings: string[] = [];
  const involvedMarkers: string[] = [];

  // Check for significant creatinine elevation
  if (creatinine > 2.0) {
    findings.push(`Creatinina significativamente elevada (${creatinine} mg/dL)`);
    involvedMarkers.push('creatinine');
  }

  // If baseline available, check for rapid increase
  if (baselineCreatinine !== undefined && creatinine >= baselineCreatinine * 1.5) {
    findings.push(`Aumento ≥1.5x do basal (${baselineCreatinine} → ${creatinine} mg/dL)`);
    involvedMarkers.push('creatinine');
  }

  // Associated hyperkaliemia is concerning
  if (potassium !== undefined && potassium > 5.5) {
    findings.push(`Hipercalemia associada (${potassium} mEq/L)`);
    involvedMarkers.push('potassium');
  }

  if (creatinine > 3.0 || (potassium !== undefined && potassium > 6.0)) {
    return {
      type: 'kidney_dysfunction',
      markers: involvedMarkers,
      pattern: 'Possível Injúria Renal Aguda',
      clinicalImplication: findings.join('. ') +
        ' ATENÇÃO: Avaliar urgentemente causa (pré-renal, renal, pós-renal), hidratação, débito urinário. Considerar avaliação nefrológica.',
      confidence: 'high',
      evidence: involvedMarkers.map(m => ({
        source: 'lab' as const,
        reference: m,
        value: markers.find(mk => mk.id === m)?.value?.toString(),
      })),
    };
  }

  return null;
}

/**
 * Check for electrolyte disturbances related to kidney.
 */
export function checkRenalElectrolyteDisturbance(
  markers: ExtractedBiomarker[]
): ClinicalCorrelation | null {
  const potassium = markers.find(m => m.id === 'potassium')?.value;
  const phosphorus = markers.find(m => m.id === 'phosphorus')?.value;
  const calcium = markers.find(m => m.id === 'calcium')?.value;
  const gfr = markers.find(m => m.id === 'gfr')?.value;

  const findings: string[] = [];
  const involvedMarkers: string[] = [];

  if (potassium !== undefined && potassium > 5.0) {
    findings.push(`Hipercalemia (${potassium} mEq/L)`);
    involvedMarkers.push('potassium');
  }
  if (phosphorus !== undefined && phosphorus > 4.5) {
    findings.push(`Hiperfosfatemia (${phosphorus} mg/dL)`);
    involvedMarkers.push('phosphorus');
  }
  if (calcium !== undefined && calcium < 8.5) {
    findings.push(`Hipocalcemia (${calcium} mg/dL)`);
    involvedMarkers.push('calcium');
  }

  // Only report if GFR is reduced (renal cause likely)
  if (involvedMarkers.length >= 2 && gfr !== undefined && gfr < 60) {
    involvedMarkers.push('gfr');
    return {
      type: 'kidney_dysfunction',
      markers: involvedMarkers,
      pattern: 'Distúrbio Eletrolítico Secundário a DRC',
      clinicalImplication: findings.join('. ') +
        ' Padrão compatível com DRC estágio 3+. Avaliar doença mineral óssea (PTH, vit D).',
      confidence: 'medium',
      evidence: involvedMarkers.map(m => ({
        source: 'lab' as const,
        reference: m,
        value: markers.find(mk => mk.id === m)?.value?.toString(),
      })),
    };
  }

  return null;
}

/**
 * Run all kidney pattern checks.
 */
export function checkKidneyPatterns(
  markers: ExtractedBiomarker[],
  context?: { baselineCreatinine?: number }
): ClinicalCorrelation[] {
  const correlations: ClinicalCorrelation[] = [];

  const ckd = checkCKD(markers);
  if (ckd) correlations.push(ckd);

  const aki = checkAKI(markers, context?.baselineCreatinine);
  if (aki) correlations.push(aki);

  const electrolyte = checkRenalElectrolyteDisturbance(markers);
  if (electrolyte) correlations.push(electrolyte);

  return correlations;
}
