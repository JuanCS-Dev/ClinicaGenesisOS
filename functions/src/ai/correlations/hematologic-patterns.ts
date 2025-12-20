/**
 * Hematologic Correlation Patterns
 * =================================
 *
 * Patterns for anemias and blood disorders.
 */

import { ClinicalCorrelation, ExtractedBiomarker } from '../types.js';

/**
 * Classify anemia type based on MCV.
 */
export function classifyAnemiaByMCV(
  mcv: number
): 'microcytic' | 'normocytic' | 'macrocytic' {
  if (mcv < 80) return 'microcytic';
  if (mcv > 100) return 'macrocytic';
  return 'normocytic';
}

/**
 * Check for iron deficiency anemia pattern.
 */
export function checkIronDeficiencyAnemia(
  markers: ExtractedBiomarker[]
): ClinicalCorrelation | null {
  const hemoglobin = markers.find(m => m.id === 'hemoglobin')?.value;
  const mcv = markers.find(m => m.id === 'mcv')?.value;
  const ferritin = markers.find(m => m.id === 'ferritin')?.value;
  const iron = markers.find(m => m.id === 'iron')?.value;
  const tibc = markers.find(m => m.id === 'tibc')?.value;
  const satTransferrin = markers.find(m => m.id === 'transferrin_saturation')?.value;

  const findings: string[] = [];
  const involvedMarkers: string[] = [];

  // Check for anemia first
  if (hemoglobin !== undefined && hemoglobin < 12) {
    findings.push(`Anemia (Hb ${hemoglobin} g/dL)`);
    involvedMarkers.push('hemoglobin');
  }

  // Check for microcytosis
  if (mcv !== undefined && mcv < 80) {
    findings.push(`Microcitose (VCM ${mcv} fL)`);
    involvedMarkers.push('mcv');
  }

  // Check iron markers
  if (ferritin !== undefined && ferritin < 30) {
    findings.push(`Ferritina baixa (${ferritin} ng/mL)`);
    involvedMarkers.push('ferritin');
  }
  if (iron !== undefined && iron < 60) {
    findings.push(`Ferro sérico baixo (${iron} ug/dL)`);
    involvedMarkers.push('iron');
  }
  if (satTransferrin !== undefined && satTransferrin < 20) {
    findings.push(`Saturação de transferrina baixa (${satTransferrin}%)`);
    involvedMarkers.push('transferrin_saturation');
  }
  if (tibc !== undefined && tibc > 370) {
    findings.push(`TIBC elevado (${tibc} ug/dL)`);
    involvedMarkers.push('tibc');
  }

  // Need anemia + at least 2 iron markers for pattern
  if (involvedMarkers.includes('hemoglobin') && findings.length >= 3) {
    return {
      type: 'iron_deficiency_anemia',
      markers: involvedMarkers,
      pattern: 'Padrão compatível com Anemia Ferropriva',
      clinicalImplication: findings.join('. ') +
        '. Investigar causa da deficiência (sangramento GI, menorragia, má absorção).',
      confidence: findings.length >= 4 ? 'high' : 'medium',
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
 * Check for B12 deficiency pattern.
 */
export function checkB12Deficiency(
  markers: ExtractedBiomarker[]
): ClinicalCorrelation | null {
  const hemoglobin = markers.find(m => m.id === 'hemoglobin')?.value;
  const mcv = markers.find(m => m.id === 'mcv')?.value;
  const b12 = markers.find(m => m.id === 'vitamin_b12')?.value;
  const homocysteine = markers.find(m => m.id === 'homocysteine')?.value;

  const findings: string[] = [];
  const involvedMarkers: string[] = [];

  if (b12 !== undefined && b12 < 300) {
    findings.push(`B12 baixa/limítrofe (${b12} pg/mL)`);
    involvedMarkers.push('vitamin_b12');
  }
  if (mcv !== undefined && mcv > 100) {
    findings.push(`Macrocitose (VCM ${mcv} fL)`);
    involvedMarkers.push('mcv');
  }
  if (homocysteine !== undefined && homocysteine > 12) {
    findings.push(`Homocisteína elevada (${homocysteine} umol/L)`);
    involvedMarkers.push('homocysteine');
  }
  if (hemoglobin !== undefined && hemoglobin < 12) {
    findings.push(`Anemia (Hb ${hemoglobin} g/dL)`);
    involvedMarkers.push('hemoglobin');
  }

  if (involvedMarkers.includes('vitamin_b12') && findings.length >= 2) {
    return {
      type: 'b12_deficiency',
      markers: involvedMarkers,
      pattern: 'Padrão sugestivo de Deficiência de B12',
      clinicalImplication: findings.join('. ') +
        '. Considerar dosagem de ácido metilmalônico. Avaliar causa (dieta, má absorção, anemia perniciosa).',
      confidence: findings.length >= 3 ? 'high' : 'medium',
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
 * Check for anemia of chronic disease pattern.
 */
export function checkAnemiaChronicDisease(
  markers: ExtractedBiomarker[]
): ClinicalCorrelation | null {
  const hemoglobin = markers.find(m => m.id === 'hemoglobin')?.value;
  const mcv = markers.find(m => m.id === 'mcv')?.value;
  const ferritin = markers.find(m => m.id === 'ferritin')?.value;
  const iron = markers.find(m => m.id === 'iron')?.value;
  const tibc = markers.find(m => m.id === 'tibc')?.value;
  const crp = markers.find(m => m.id === 'crp')?.value ||
              markers.find(m => m.id === 'crp_high_sensitivity')?.value;

  const findings: string[] = [];
  const involvedMarkers: string[] = [];

  if (hemoglobin !== undefined && hemoglobin < 12) {
    findings.push(`Anemia (Hb ${hemoglobin} g/dL)`);
    involvedMarkers.push('hemoglobin');
  }
  if (mcv !== undefined && mcv >= 80 && mcv <= 100) {
    findings.push('Anemia normocítica');
    involvedMarkers.push('mcv');
  }
  // Key: ferritin normal or elevated (unlike iron deficiency)
  if (ferritin !== undefined && ferritin >= 100) {
    findings.push(`Ferritina normal/elevada (${ferritin} ng/mL)`);
    involvedMarkers.push('ferritin');
  }
  if (iron !== undefined && iron < 60) {
    findings.push(`Ferro sérico baixo (${iron} ug/dL)`);
    involvedMarkers.push('iron');
  }
  if (tibc !== undefined && tibc < 280) {
    findings.push(`TIBC baixo/normal (${tibc} ug/dL)`);
    involvedMarkers.push('tibc');
  }
  if (crp !== undefined && crp > 5) {
    findings.push(`PCR elevado (${crp} mg/L) - inflamação`);
    involvedMarkers.push('crp');
  }

  // Need anemia + ferritin normal/high + low iron for pattern
  if (involvedMarkers.includes('hemoglobin') &&
      involvedMarkers.includes('ferritin') &&
      (involvedMarkers.includes('iron') || involvedMarkers.includes('crp'))) {
    return {
      type: 'chronic_inflammation',
      markers: involvedMarkers,
      pattern: 'Padrão sugestivo de Anemia de Doença Crônica',
      clinicalImplication: findings.join('. ') +
        '. Investigar doença de base (infecção crônica, neoplasia, doença autoimune).',
      confidence: findings.length >= 4 ? 'high' : 'medium',
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
 * Run all hematologic pattern checks.
 */
export function checkHematologicPatterns(
  markers: ExtractedBiomarker[]
): ClinicalCorrelation[] {
  const correlations: ClinicalCorrelation[] = [];

  const ironDef = checkIronDeficiencyAnemia(markers);
  if (ironDef) correlations.push(ironDef);

  const b12Def = checkB12Deficiency(markers);
  if (b12Def) correlations.push(b12Def);

  const acd = checkAnemiaChronicDisease(markers);
  if (acd) correlations.push(acd);

  return correlations;
}
