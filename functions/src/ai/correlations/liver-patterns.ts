/**
 * Liver Function Correlation Patterns
 * ====================================
 *
 * Patterns for hepatocellular injury, cholestatic pattern, and liver dysfunction.
 */

import { ClinicalCorrelation, ExtractedBiomarker } from '../types.js';

/**
 * Determine injury pattern based on enzyme ratio.
 */
export function determineInjuryPattern(
  alt: number,
  ast: number,
  alkPhos: number,
  ggt: number
): 'hepatocellular' | 'cholestatic' | 'mixed' {
  // R ratio: (ALT/ULN) / (ALP/ULN)
  // Using simplified ULN: ALT=40, ALP=120
  const rRatio = (alt / 40) / (alkPhos / 120);

  // De Ritis ratio (AST/ALT) > 2 suggests alcoholic liver disease
  const deRitisRatio = ast / alt;
  const suggestsAlcoholic = deRitisRatio > 2;

  // GGT helps distinguish hepatic from bone ALP elevation
  // High GGT + High ALP = likely hepatic origin
  const isHepaticALP = ggt > 60 && alkPhos > 120;

  // Alcoholic liver disease often presents as hepatocellular
  if (rRatio > 5 || suggestsAlcoholic) return 'hepatocellular';
  if (rRatio < 2 || isHepaticALP) return 'cholestatic';
  return 'mixed';
}

/**
 * Check for hepatocellular injury pattern.
 */
export function checkHepatocellularInjury(
  markers: ExtractedBiomarker[]
): ClinicalCorrelation | null {
  const alt = markers.find(m => m.id === 'alt')?.value;
  const ast = markers.find(m => m.id === 'ast')?.value;

  if (alt === undefined || ast === undefined) return null;

  const findings: string[] = [];
  const involvedMarkers: string[] = [];

  // Check for elevation
  if (alt > 40) {
    findings.push(`ALT elevado (${alt} U/L)`);
    involvedMarkers.push('alt');
  }
  if (ast > 40) {
    findings.push(`AST elevado (${ast} U/L)`);
    involvedMarkers.push('ast');
  }

  if (involvedMarkers.length === 0) return null;

  // Calculate AST/ALT ratio (De Ritis ratio)
  const deRitisRatio = ast / alt;

  // Severity assessment
  const maxElevation = Math.max(alt / 40, ast / 40);
  let severity = 'leve';
  if (maxElevation > 10) severity = 'grave';
  else if (maxElevation > 3) severity = 'moderada';

  // Pattern interpretation
  let interpretation = '';
  if (deRitisRatio > 2) {
    interpretation = 'Razão AST/ALT > 2 sugere doença hepática alcoólica.';
  } else if (deRitisRatio < 1) {
    interpretation = 'Razão AST/ALT < 1 sugere NASH/esteatose, hepatite viral.';
  }

  return {
    type: 'liver_dysfunction',
    markers: involvedMarkers,
    pattern: `Lesão Hepatocelular ${severity.charAt(0).toUpperCase() + severity.slice(1)}`,
    clinicalImplication: findings.join('. ') +
      ` Razão AST/ALT: ${deRitisRatio.toFixed(2)}. ${interpretation}` +
      (maxElevation > 10 ? ' Investigar hepatite aguda, isquemia, toxicidade.' : ''),
    confidence: maxElevation > 3 ? 'high' : 'medium',
    evidence: involvedMarkers.map(m => ({
      source: 'lab' as const,
      reference: m,
      value: markers.find(mk => mk.id === m)?.value?.toString(),
    })),
  };
}

/**
 * Check for cholestatic pattern.
 */
export function checkCholestaticPattern(
  markers: ExtractedBiomarker[]
): ClinicalCorrelation | null {
  const alkPhos = markers.find(m => m.id === 'alkaline_phosphatase')?.value;
  const ggt = markers.find(m => m.id === 'ggt')?.value;
  const bilirubinDirect = markers.find(m => m.id === 'bilirubin_direct')?.value;

  const findings: string[] = [];
  const involvedMarkers: string[] = [];

  if (alkPhos !== undefined && alkPhos > 129) {
    findings.push(`Fosfatase alcalina elevada (${alkPhos} U/L)`);
    involvedMarkers.push('alkaline_phosphatase');
  }
  if (ggt !== undefined && ggt > 60) {
    findings.push(`GGT elevada (${ggt} U/L)`);
    involvedMarkers.push('ggt');
  }
  if (bilirubinDirect !== undefined && bilirubinDirect > 0.3) {
    findings.push(`Bilirrubina direta elevada (${bilirubinDirect} mg/dL)`);
    involvedMarkers.push('bilirubin_direct');
  }

  // Need at least FA + GGT elevated for cholestatic pattern
  if (!involvedMarkers.includes('alkaline_phosphatase') ||
      !involvedMarkers.includes('ggt')) {
    return null;
  }

  // GGT confirms hepatic origin of elevated ALP
  return {
    type: 'liver_dysfunction',
    markers: involvedMarkers,
    pattern: 'Padrão Colestático',
    clinicalImplication: findings.join('. ') +
      ' GGT elevada confirma origem hepática. Investigar obstrução biliar, colangite, medicamentos, infiltração hepática.',
    confidence: involvedMarkers.includes('bilirubin_direct') ? 'high' : 'medium',
    evidence: involvedMarkers.map(m => ({
      source: 'lab' as const,
      reference: m,
      value: markers.find(mk => mk.id === m)?.value?.toString(),
    })),
  };
}

/**
 * Check for impaired synthetic function.
 */
export function checkLiverSyntheticFunction(
  markers: ExtractedBiomarker[]
): ClinicalCorrelation | null {
  const albumin = markers.find(m => m.id === 'albumin')?.value;
  const bilirubinTotal = markers.find(m => m.id === 'bilirubin_total')?.value;

  const findings: string[] = [];
  const involvedMarkers: string[] = [];

  if (albumin !== undefined && albumin < 3.5) {
    findings.push(`Albumina baixa (${albumin} g/dL)`);
    involvedMarkers.push('albumin');
  }
  if (bilirubinTotal !== undefined && bilirubinTotal > 2.0) {
    findings.push(`Hiperbilirrubinemia (${bilirubinTotal} mg/dL)`);
    involvedMarkers.push('bilirubin_total');
  }

  if (involvedMarkers.length === 0) return null;

  return {
    type: 'liver_dysfunction',
    markers: involvedMarkers,
    pattern: 'Comprometimento da Função Sintética Hepática',
    clinicalImplication: findings.join('. ') +
      ' Sugere hepatopatia crônica avançada. Considerar escore Child-Pugh, MELD.',
    confidence: involvedMarkers.length >= 2 ? 'high' : 'medium',
    evidence: involvedMarkers.map(m => ({
      source: 'lab' as const,
      reference: m,
      value: markers.find(mk => mk.id === m)?.value?.toString(),
    })),
  };
}

/**
 * Run all liver pattern checks.
 */
export function checkLiverPatterns(
  markers: ExtractedBiomarker[]
): ClinicalCorrelation[] {
  const correlations: ClinicalCorrelation[] = [];

  const hepatocellular = checkHepatocellularInjury(markers);
  if (hepatocellular) correlations.push(hepatocellular);

  const cholestatic = checkCholestaticPattern(markers);
  if (cholestatic) correlations.push(cholestatic);

  const synthetic = checkLiverSyntheticFunction(markers);
  if (synthetic) correlations.push(synthetic);

  return correlations;
}
