/**
 * Metabolic Correlation Patterns
 * ==============================
 *
 * Patterns for metabolic syndrome, diabetes, insulin resistance.
 */

import { ClinicalCorrelation, ExtractedBiomarker } from '../types.js';

/**
 * Check for metabolic syndrome pattern (ATP III / IDF criteria).
 */
export function checkMetabolicSyndrome(
  markers: ExtractedBiomarker[],
  waistCircumference?: number,
  bloodPressure?: { systolic: number; diastolic: number }
): ClinicalCorrelation | null {
  const criteriaMap = {
    waist: waistCircumference !== undefined && waistCircumference > 102, // male threshold
    triglycerides: markers.find(m => m.id === 'triglycerides')?.value ?? 0 >= 150,
    hdlLow: (markers.find(m => m.id === 'hdl')?.value ?? 999) < 40,
    hypertension: bloodPressure !== undefined &&
      (bloodPressure.systolic >= 130 || bloodPressure.diastolic >= 85),
    hyperglycemia: (markers.find(m => m.id === 'glucose_fasting')?.value ?? 0) >= 100,
  };

  const criteriaMet = Object.values(criteriaMap).filter(Boolean).length;

  if (criteriaMet >= 3) {
    const involvedMarkers: string[] = [];
    if (criteriaMap.triglycerides) involvedMarkers.push('triglycerides');
    if (criteriaMap.hdlLow) involvedMarkers.push('hdl');
    if (criteriaMap.hyperglycemia) involvedMarkers.push('glucose_fasting');

    return {
      type: 'metabolic_syndrome',
      markers: involvedMarkers,
      pattern: 'Padrão compatível com Síndrome Metabólica',
      clinicalImplication: `${criteriaMet}/5 critérios ATP III presentes. Risco cardiovascular aumentado.`,
      confidence: criteriaMet >= 4 ? 'high' : 'medium',
      criteriaMet: `${criteriaMet}/5 critérios ATP III`,
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
 * Check for insulin resistance pattern.
 */
export function checkInsulinResistance(markers: ExtractedBiomarker[]): ClinicalCorrelation | null {
  const homaIr = markers.find(m => m.id === 'homa_ir')?.value;
  const glucose = markers.find(m => m.id === 'glucose_fasting')?.value;
  const insulin = markers.find(m => m.id === 'insulin_fasting')?.value;
  const triglycerides = markers.find(m => m.id === 'triglycerides')?.value;
  const hdl = markers.find(m => m.id === 'hdl')?.value;

  const signs: string[] = [];
  const involvedMarkers: string[] = [];

  if (homaIr !== undefined && homaIr > 2.5) {
    signs.push(`HOMA-IR elevado (${homaIr.toFixed(2)})`);
    involvedMarkers.push('homa_ir');
  }
  if (insulin !== undefined && insulin > 12) {
    signs.push(`Hiperinsulinemia (${insulin} uUI/mL)`);
    involvedMarkers.push('insulin_fasting');
  }
  if (triglycerides !== undefined && hdl !== undefined && triglycerides / hdl > 3) {
    signs.push(`Razão TG/HDL elevada (${(triglycerides / hdl).toFixed(1)})`);
    involvedMarkers.push('triglycerides', 'hdl');
  }
  if (glucose !== undefined && glucose >= 100 && glucose < 126) {
    signs.push('Glicemia de jejum alterada');
    involvedMarkers.push('glucose_fasting');
  }

  if (signs.length >= 2) {
    return {
      type: 'insulin_resistance',
      markers: [...new Set(involvedMarkers)],
      pattern: 'Padrão sugestivo de Resistência Insulínica',
      clinicalImplication: signs.join('. ') + '. Risco aumentado de progressão para DM2.',
      confidence: signs.length >= 3 ? 'high' : 'medium',
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
 * Check for type 2 diabetes pattern.
 */
export function checkDiabetesType2(markers: ExtractedBiomarker[]): ClinicalCorrelation | null {
  const glucose = markers.find(m => m.id === 'glucose_fasting')?.value;
  const hba1c = markers.find(m => m.id === 'hba1c')?.value;

  const diabeticCriteria: string[] = [];
  const involvedMarkers: string[] = [];

  if (glucose !== undefined && glucose >= 126) {
    diabeticCriteria.push(`Glicemia jejum ≥126 mg/dL (${glucose})`);
    involvedMarkers.push('glucose_fasting');
  }
  if (hba1c !== undefined && hba1c >= 6.5) {
    diabeticCriteria.push(`HbA1c ≥6.5% (${hba1c}%)`);
    involvedMarkers.push('hba1c');
  }

  if (diabeticCriteria.length >= 1) {
    const prediabetes = glucose !== undefined && glucose >= 100 && glucose < 126 &&
      hba1c !== undefined && hba1c >= 5.7 && hba1c < 6.5;

    return {
      type: 'diabetes_type2',
      markers: involvedMarkers,
      pattern: prediabetes ? 'Padrão sugestivo de Pré-diabetes' : 'Padrão sugestivo de Diabetes Mellitus tipo 2',
      clinicalImplication: diabeticCriteria.join('. ') +
        '. Recomenda-se confirmação com segundo exame em data diferente.',
      confidence: diabeticCriteria.length >= 2 ? 'high' : 'medium',
      criteriaMet: `${diabeticCriteria.length} critério(s) SBD`,
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
 * Check for cardiovascular risk pattern.
 */
export function checkCardiovascularRisk(markers: ExtractedBiomarker[]): ClinicalCorrelation | null {
  const ldl = markers.find(m => m.id === 'ldl')?.value;
  const apoB = markers.find(m => m.id === 'apolipoprotein_b')?.value;
  const lpA = markers.find(m => m.id === 'lp_a')?.value;
  const crpHs = markers.find(m => m.id === 'crp_high_sensitivity')?.value;
  const homocysteine = markers.find(m => m.id === 'homocysteine')?.value;

  const riskFactors: string[] = [];
  const involvedMarkers: string[] = [];

  if (ldl !== undefined && ldl > 130) {
    riskFactors.push(`LDL elevado (${ldl} mg/dL)`);
    involvedMarkers.push('ldl');
  }
  if (apoB !== undefined && apoB > 100) {
    riskFactors.push(`ApoB elevado (${apoB} mg/dL)`);
    involvedMarkers.push('apolipoprotein_b');
  }
  if (lpA !== undefined && lpA > 50) {
    riskFactors.push(`Lp(a) elevado (${lpA} nmol/L) - fator genético`);
    involvedMarkers.push('lp_a');
  }
  if (crpHs !== undefined && crpHs > 2) {
    riskFactors.push(`PCR-us elevado (${crpHs} mg/L) - inflamação residual`);
    involvedMarkers.push('crp_high_sensitivity');
  }
  if (homocysteine !== undefined && homocysteine > 15) {
    riskFactors.push(`Homocisteína elevada (${homocysteine} umol/L)`);
    involvedMarkers.push('homocysteine');
  }

  if (riskFactors.length >= 2) {
    return {
      type: 'cardiovascular_risk',
      markers: involvedMarkers,
      pattern: 'Múltiplos fatores de risco cardiovascular',
      clinicalImplication: riskFactors.join('. ') + '. Considerar estratificação de risco cardiovascular.',
      confidence: riskFactors.length >= 3 ? 'high' : 'medium',
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
 * Run all metabolic pattern checks.
 */
export function checkMetabolicPatterns(
  markers: ExtractedBiomarker[],
  context?: {
    waistCircumference?: number;
    bloodPressure?: { systolic: number; diastolic: number };
  }
): ClinicalCorrelation[] {
  const correlations: ClinicalCorrelation[] = [];

  const metSyndrome = checkMetabolicSyndrome(
    markers,
    context?.waistCircumference,
    context?.bloodPressure
  );
  if (metSyndrome) correlations.push(metSyndrome);

  const insulinRes = checkInsulinResistance(markers);
  if (insulinRes) correlations.push(insulinRes);

  const diabetes = checkDiabetesType2(markers);
  if (diabetes) correlations.push(diabetes);

  const cvRisk = checkCardiovascularRisk(markers);
  if (cvRisk) correlations.push(cvRisk);

  return correlations;
}
