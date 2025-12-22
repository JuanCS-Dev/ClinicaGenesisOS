/**
 * LGPD Types Tests
 * ================
 *
 * Unit tests for LGPD type utilities and constants.
 * Fase 11: LGPD Compliance
 */

import { describe, it, expect } from 'vitest';
import {
  isSensitiveCategory,
  requiresExplicitConsent,
  getLegalBasis,
  PURPOSE_LABELS,
  DATA_CATEGORY_LABELS,
  RIGHT_LABELS,
  AUDIT_ACTION_LABELS,
  type DataCategory,
  type ProcessingPurpose,
} from '../../types/lgpd';

describe('LGPD Types', () => {
  describe('isSensitiveCategory', () => {
    it('returns true for health data', () => {
      expect(isSensitiveCategory('health')).toBe(true);
    });

    it('returns true for biometric data', () => {
      expect(isSensitiveCategory('biometric')).toBe(true);
    });

    it('returns true for genetic data', () => {
      expect(isSensitiveCategory('genetic')).toBe(true);
    });

    it('returns false for identification data', () => {
      expect(isSensitiveCategory('identification')).toBe(false);
    });

    it('returns false for contact data', () => {
      expect(isSensitiveCategory('contact')).toBe(false);
    });

    it('returns false for financial data', () => {
      expect(isSensitiveCategory('financial')).toBe(false);
    });

    it('returns false for location data', () => {
      expect(isSensitiveCategory('location')).toBe(false);
    });

    it('returns false for behavioral data', () => {
      expect(isSensitiveCategory('behavioral')).toBe(false);
    });
  });

  describe('requiresExplicitConsent', () => {
    it('returns true for consent_based purpose', () => {
      expect(requiresExplicitConsent('consent_based')).toBe(true);
    });

    it('returns true for marketing purpose', () => {
      expect(requiresExplicitConsent('marketing')).toBe(true);
    });

    it('returns true for research purpose', () => {
      expect(requiresExplicitConsent('research')).toBe(true);
    });

    it('returns false for healthcare_provision', () => {
      expect(requiresExplicitConsent('healthcare_provision')).toBe(false);
    });

    it('returns false for legal_obligation', () => {
      expect(requiresExplicitConsent('legal_obligation')).toBe(false);
    });

    it('returns false for vital_interests', () => {
      expect(requiresExplicitConsent('vital_interests')).toBe(false);
    });

    it('returns false for legitimate_interest', () => {
      expect(requiresExplicitConsent('legitimate_interest')).toBe(false);
    });

    it('returns false for analytics', () => {
      expect(requiresExplicitConsent('analytics')).toBe(false);
    });
  });

  describe('getLegalBasis', () => {
    it('returns correct basis for healthcare_provision', () => {
      const basis = getLegalBasis('healthcare_provision');
      expect(basis).toContain('Art. 7');
      expect(basis).toContain('contrato');
    });

    it('returns correct basis for legal_obligation', () => {
      const basis = getLegalBasis('legal_obligation');
      expect(basis).toContain('Art. 7');
      expect(basis).toContain('obrigação legal');
    });

    it('returns correct basis for vital_interests', () => {
      const basis = getLegalBasis('vital_interests');
      expect(basis).toContain('Art. 7');
      expect(basis).toContain('vida');
    });

    it('returns correct basis for consent_based', () => {
      const basis = getLegalBasis('consent_based');
      expect(basis).toContain('Art. 7');
      expect(basis).toContain('Consentimento');
    });

    it('returns correct basis for marketing', () => {
      const basis = getLegalBasis('marketing');
      expect(basis).toContain('Art. 7');
      expect(basis).toContain('Consentimento');
    });

    it('returns correct basis for analytics', () => {
      const basis = getLegalBasis('analytics');
      expect(basis).toContain('Art. 7');
      expect(basis).toContain('legítimo');
    });

    it('returns correct basis for research', () => {
      const basis = getLegalBasis('research');
      expect(basis).toContain('Art. 7');
      expect(basis).toContain('Pesquisa');
    });
  });

  describe('PURPOSE_LABELS', () => {
    it('has label for healthcare_provision', () => {
      expect(PURPOSE_LABELS.healthcare_provision).toBe('Prestação de Serviços de Saúde');
    });

    it('has label for legal_obligation', () => {
      expect(PURPOSE_LABELS.legal_obligation).toBe('Cumprimento de Obrigação Legal');
    });

    it('has label for marketing', () => {
      expect(PURPOSE_LABELS.marketing).toBe('Marketing e Comunicações');
    });

    it('has all purposes defined', () => {
      const purposes: ProcessingPurpose[] = [
        'healthcare_provision',
        'legal_obligation',
        'vital_interests',
        'legitimate_interest',
        'consent_based',
        'marketing',
        'analytics',
        'research',
      ];

      purposes.forEach((purpose) => {
        expect(PURPOSE_LABELS[purpose]).toBeDefined();
        expect(typeof PURPOSE_LABELS[purpose]).toBe('string');
      });
    });
  });

  describe('DATA_CATEGORY_LABELS', () => {
    it('has label for health', () => {
      expect(DATA_CATEGORY_LABELS.health).toBe('Dados de Saúde');
    });

    it('has label for identification', () => {
      expect(DATA_CATEGORY_LABELS.identification).toBe('Dados de Identificação');
    });

    it('has all categories defined', () => {
      const categories: DataCategory[] = [
        'identification',
        'contact',
        'health',
        'financial',
        'biometric',
        'genetic',
        'location',
        'behavioral',
      ];

      categories.forEach((category) => {
        expect(DATA_CATEGORY_LABELS[category]).toBeDefined();
        expect(typeof DATA_CATEGORY_LABELS[category]).toBe('string');
      });
    });
  });

  describe('RIGHT_LABELS', () => {
    it('has label for access', () => {
      expect(RIGHT_LABELS.access).toBe('Acesso aos Dados');
    });

    it('has label for deletion', () => {
      expect(RIGHT_LABELS.deletion).toBe('Exclusão de Dados');
    });

    it('has label for portability', () => {
      expect(RIGHT_LABELS.portability).toBe('Portabilidade');
    });
  });

  describe('AUDIT_ACTION_LABELS', () => {
    it('has label for view', () => {
      expect(AUDIT_ACTION_LABELS.view).toBe('Visualização');
    });

    it('has label for create', () => {
      expect(AUDIT_ACTION_LABELS.create).toBe('Criação');
    });

    it('has label for data_breach', () => {
      expect(AUDIT_ACTION_LABELS.data_breach).toBe('Incidente de Segurança');
    });
  });
});

