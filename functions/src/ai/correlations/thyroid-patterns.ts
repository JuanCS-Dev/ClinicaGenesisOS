/**
 * Thyroid Correlation Patterns
 * ============================
 *
 * Patterns for hypothyroidism, hyperthyroidism, and thyroid autoimmunity.
 */

import { ClinicalCorrelation, ExtractedBiomarker } from '../types.js';

/**
 * Check for hypothyroidism pattern.
 */
export function checkHypothyroidism(
  markers: ExtractedBiomarker[]
): ClinicalCorrelation | null {
  const tsh = markers.find(m => m.id === 'tsh')?.value;
  const t4Free = markers.find(m => m.id === 't4_free')?.value;
  const t3Free = markers.find(m => m.id === 't3_free')?.value;
  const antiTpo = markers.find(m => m.id === 'anti_tpo')?.value;

  const findings: string[] = [];
  const involvedMarkers: string[] = [];

  if (tsh !== undefined && tsh > 4.0) {
    findings.push(`TSH elevado (${tsh} mUI/L)`);
    involvedMarkers.push('tsh');
  }
  if (t4Free !== undefined && t4Free < 0.8) {
    findings.push(`T4 livre baixo (${t4Free} ng/dL)`);
    involvedMarkers.push('t4_free');
  }
  if (t3Free !== undefined && t3Free < 2.0) {
    findings.push(`T3 livre baixo (${t3Free} pg/mL)`);
    involvedMarkers.push('t3_free');
  }
  if (antiTpo !== undefined && antiTpo > 35) {
    findings.push(`Anti-TPO positivo (${antiTpo} UI/mL) - autoimune`);
    involvedMarkers.push('anti_tpo');
  }

  if (!involvedMarkers.includes('tsh') || tsh === undefined || tsh <= 4.0) {
    return null;
  }

  // Determine type: overt vs subclinical
  const isOvert = t4Free !== undefined && t4Free < 0.8;
  const isSubclinical = t4Free !== undefined && t4Free >= 0.8 && t4Free <= 1.8;

  if (isOvert || (isSubclinical && tsh > 4.0)) {
    return {
      type: 'hypothyroidism',
      markers: involvedMarkers,
      pattern: isOvert ? 'Hipotireoidismo Clínico (Manifesto)' : 'Hipotireoidismo Subclínico',
      clinicalImplication: findings.join('. ') +
        (involvedMarkers.includes('anti_tpo')
          ? ' Etiologia autoimune (Hashimoto) provável.'
          : ' Considerar dosagem de anticorpos tireoidianos.'),
      confidence: isOvert ? 'high' : 'medium',
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
 * Check for hyperthyroidism pattern.
 */
export function checkHyperthyroidism(
  markers: ExtractedBiomarker[]
): ClinicalCorrelation | null {
  const tsh = markers.find(m => m.id === 'tsh')?.value;
  const t4Free = markers.find(m => m.id === 't4_free')?.value;
  const t3Free = markers.find(m => m.id === 't3_free')?.value;

  const findings: string[] = [];
  const involvedMarkers: string[] = [];

  if (tsh !== undefined && tsh < 0.4) {
    findings.push(`TSH suprimido (${tsh} mUI/L)`);
    involvedMarkers.push('tsh');
  }
  if (t4Free !== undefined && t4Free > 1.8) {
    findings.push(`T4 livre elevado (${t4Free} ng/dL)`);
    involvedMarkers.push('t4_free');
  }
  if (t3Free !== undefined && t3Free > 4.4) {
    findings.push(`T3 livre elevado (${t3Free} pg/mL)`);
    involvedMarkers.push('t3_free');
  }

  if (!involvedMarkers.includes('tsh') || tsh === undefined || tsh >= 0.4) {
    return null;
  }

  const isOvert = (t4Free !== undefined && t4Free > 1.8) ||
                  (t3Free !== undefined && t3Free > 4.4);

  if (isOvert || tsh < 0.1) {
    return {
      type: 'hyperthyroidism',
      markers: involvedMarkers,
      pattern: isOvert ? 'Hipertireoidismo Clínico (Manifesto)' : 'Hipertireoidismo Subclínico',
      clinicalImplication: findings.join('. ') +
        ` Considerar TRAb para Graves, cintilografia/captação. ${tsh < 0.1 ? 'Atenção: risco de fibrilação atrial.' : ''}`,
      confidence: isOvert ? 'high' : 'medium',
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
 * Check for thyroid autoimmunity pattern.
 */
export function checkThyroidAutoimmunity(
  markers: ExtractedBiomarker[]
): ClinicalCorrelation | null {
  const antiTpo = markers.find(m => m.id === 'anti_tpo')?.value;
  const antiTg = markers.find(m => m.id === 'anti_tg')?.value;
  const tsh = markers.find(m => m.id === 'tsh')?.value;

  const findings: string[] = [];
  const involvedMarkers: string[] = [];

  if (antiTpo !== undefined && antiTpo > 35) {
    findings.push(`Anti-TPO positivo (${antiTpo} UI/mL)`);
    involvedMarkers.push('anti_tpo');
  }
  if (antiTg !== undefined && antiTg > 115) {
    findings.push(`Anti-Tireoglobulina positivo (${antiTg} UI/mL)`);
    involvedMarkers.push('anti_tg');
  }

  if (involvedMarkers.length === 0) {
    return null;
  }

  // Check if TSH is still normal
  const tshNormal = tsh !== undefined && tsh >= 0.4 && tsh <= 4.0;

  return {
    type: 'autoimmune_pattern',
    markers: involvedMarkers,
    pattern: 'Autoimunidade Tireoidiana',
    clinicalImplication: findings.join('. ') +
      (tshNormal
        ? ' Função tireoidiana atualmente normal. Monitorar TSH anualmente - risco de evolução para hipotireoidismo.'
        : ' Provável tireoidite de Hashimoto.'),
    confidence: involvedMarkers.length >= 2 ? 'high' : 'medium',
    evidence: involvedMarkers.map(m => ({
      source: 'lab' as const,
      reference: m,
      value: markers.find(mk => mk.id === m)?.value?.toString(),
    })),
  };
}

/**
 * Check for sick euthyroid syndrome (low T3 syndrome).
 */
export function checkLowT3Syndrome(
  markers: ExtractedBiomarker[]
): ClinicalCorrelation | null {
  const tsh = markers.find(m => m.id === 'tsh')?.value;
  const t4Free = markers.find(m => m.id === 't4_free')?.value;
  const t3Free = markers.find(m => m.id === 't3_free')?.value;
  const reverseT3 = markers.find(m => m.id === 'reverse_t3')?.value;

  const findings: string[] = [];
  const involvedMarkers: string[] = [];

  // TSH normal or low-normal
  const tshLowNormal = tsh !== undefined && tsh >= 0.4 && tsh <= 2.0;
  // T4 normal
  const t4Normal = t4Free !== undefined && t4Free >= 0.8 && t4Free <= 1.8;
  // T3 low
  const t3Low = t3Free !== undefined && t3Free < 2.5;
  // rT3 elevated (if available)
  const rT3High = reverseT3 !== undefined && reverseT3 > 20;

  if (t3Low) {
    findings.push(`T3 livre baixo (${t3Free} pg/mL)`);
    involvedMarkers.push('t3_free');
  }
  if (rT3High) {
    findings.push(`T3 reverso elevado (${reverseT3} ng/dL)`);
    involvedMarkers.push('reverse_t3');
  }
  if (tshLowNormal && tsh !== undefined) {
    findings.push(`TSH normal-baixo (${tsh} mUI/L)`);
    involvedMarkers.push('tsh');
  }

  if (t3Low && (tshLowNormal || t4Normal)) {
    return {
      type: 'custom',
      markers: involvedMarkers,
      pattern: 'Síndrome do T3 Baixo (Síndrome do Eutireoideo Doente)',
      clinicalImplication: findings.join('. ') +
        ' Padrão comum em doenças sistêmicas, estresse, jejum prolongado. Investigar causa de base.',
      confidence: rT3High ? 'high' : 'medium',
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
 * Run all thyroid pattern checks.
 */
export function checkThyroidPatterns(
  markers: ExtractedBiomarker[]
): ClinicalCorrelation[] {
  const correlations: ClinicalCorrelation[] = [];

  const hypo = checkHypothyroidism(markers);
  if (hypo) correlations.push(hypo);

  const hyper = checkHyperthyroidism(markers);
  if (hyper) correlations.push(hyper);

  const autoimmune = checkThyroidAutoimmunity(markers);
  if (autoimmune) correlations.push(autoimmune);

  const lowT3 = checkLowT3Syndrome(markers);
  if (lowT3) correlations.push(lowT3);

  return correlations;
}
