/**
 * useLabAnalysis Hook Tests - Clinical reasoning lab analysis.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useLabAnalysis } from '../../hooks/useLabAnalysis';
import { clinicalReasoningService } from '../../services/clinical-reasoning.service';
import type { LabAnalysisResult, PatientContext } from '../../types';

// Mock dependencies
vi.mock('../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => ({
    clinicId: 'clinic-123',
    userProfile: { id: 'user-123', displayName: 'Dr. João' },
  })),
}));

vi.mock('../../services/clinical-reasoning.service', () => ({
  clinicalReasoningService: {
    uploadAndAnalyze: vi.fn(),
    analyzeManual: vi.fn(),
    subscribeToSession: vi.fn(),
    markReviewed: vi.fn(),
  },
}));

import { useClinicContext } from '../../contexts/ClinicContext';

const mockResult: LabAnalysisResult = {
  biomarkers: [
    {
      name: 'Hemoglobina',
      value: 12.5,
      unit: 'g/dL',
      referenceRange: { min: 12, max: 16 },
      status: 'normal',
    },
  ],
  correlations: [],
  summary: {
    overview: 'Exames dentro da normalidade',
    keyFindings: ['Hemograma normal'],
    recommendations: ['Manter acompanhamento'],
  },
  confidence: 0.95,
  aiModel: 'gemini-2.0',
  processedAt: new Date().toISOString(),
};

const mockPatientContext: PatientContext = {
  age: 45,
  gender: 'feminino',
  conditions: ['hipertensão'],
  medications: ['losartana'],
};

describe('useLabAnalysis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    vi.mocked(useClinicContext).mockReturnValue({
      clinicId: 'clinic-123',
      userProfile: { id: 'user-123', displayName: 'Dr. João' },
    } as unknown as ReturnType<typeof useClinicContext>);

    vi.mocked(clinicalReasoningService.subscribeToSession).mockReturnValue(
      vi.fn()
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('should start with idle status', () => {
      const { result } = renderHook(() =>
        useLabAnalysis({ patientId: 'patient-123' })
      );

      expect(result.current.status).toBe('idle');
      expect(result.current.isUploading).toBe(false);
      expect(result.current.isProcessing).toBe(false);
      expect(result.current.result).toBe(null);
      expect(result.current.error).toBe(null);
    });
  });

  describe('uploadAndAnalyze', () => {
    it('should upload file and start analysis', async () => {
      vi.mocked(clinicalReasoningService.uploadAndAnalyze).mockResolvedValue(
        'session-123'
      );

      const { result } = renderHook(() =>
        useLabAnalysis({ patientId: 'patient-123' })
      );

      const file = new File(['test'], 'lab-results.pdf', {
        type: 'application/pdf',
      });

      await act(async () => {
        await result.current.uploadAndAnalyze(file, mockPatientContext);
      });

      expect(clinicalReasoningService.uploadAndAnalyze).toHaveBeenCalledWith(
        'clinic-123',
        'patient-123',
        'user-123',
        file,
        mockPatientContext
      );
      expect(result.current.status).toBe('extracting');
    });

    it('should handle upload error', async () => {
      const onError = vi.fn();
      vi.mocked(clinicalReasoningService.uploadAndAnalyze).mockRejectedValue(
        new Error('Upload failed')
      );

      const { result } = renderHook(() =>
        useLabAnalysis({ patientId: 'patient-123', onError })
      );

      const file = new File(['test'], 'lab-results.pdf', {
        type: 'application/pdf',
      });

      await act(async () => {
        await result.current.uploadAndAnalyze(file, mockPatientContext);
      });

      expect(result.current.status).toBe('error');
      expect(result.current.error).toBe('Upload failed');
      expect(onError).toHaveBeenCalled();
    });

    it('should handle not authenticated error', async () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinicId: null,
        userProfile: null,
      } as unknown as ReturnType<typeof useClinicContext>);

      const { result } = renderHook(() =>
        useLabAnalysis({ patientId: 'patient-123' })
      );

      const file = new File(['test'], 'lab-results.pdf', {
        type: 'application/pdf',
      });

      await act(async () => {
        await result.current.uploadAndAnalyze(file, mockPatientContext);
      });

      expect(result.current.status).toBe('error');
      expect(result.current.error).toBe('Not authenticated');
    });
  });

  describe('analyzeManual', () => {
    it('should analyze manual lab results', async () => {
      vi.mocked(clinicalReasoningService.analyzeManual).mockResolvedValue(
        'session-123'
      );

      const { result } = renderHook(() =>
        useLabAnalysis({ patientId: 'patient-123' })
      );

      const labResults = [
        { name: 'Hemoglobina', value: '12.5', unit: 'g/dL' },
      ];

      await act(async () => {
        await result.current.analyzeManual(labResults, mockPatientContext);
      });

      expect(clinicalReasoningService.analyzeManual).toHaveBeenCalledWith(
        'clinic-123',
        expect.objectContaining({
          patientId: 'patient-123',
          labResults,
          source: 'manual',
        }),
        'user-123'
      );
      expect(result.current.status).toBe('processing');
    });

    it('should handle manual analysis error', async () => {
      vi.mocked(clinicalReasoningService.analyzeManual).mockRejectedValue(
        new Error('Analysis failed')
      );

      const { result } = renderHook(() =>
        useLabAnalysis({ patientId: 'patient-123' })
      );

      await act(async () => {
        await result.current.analyzeManual([], mockPatientContext);
      });

      expect(result.current.status).toBe('error');
      expect(result.current.error).toBe('Analysis failed');
    });
  });

  describe('session subscription', () => {
    it('should subscribe to session updates', async () => {
      vi.useRealTimers(); // Use real timers for this test

      vi.mocked(clinicalReasoningService.uploadAndAnalyze).mockResolvedValue(
        'session-123'
      );

      vi.mocked(clinicalReasoningService.subscribeToSession).mockImplementation(
        (_clinicId, _sessionId, callback) => {
          // Call callback immediately for testing
          Promise.resolve().then(() => {
            callback({
              id: 'session-123',
              status: 'ready',
              result: mockResult,
            });
          });
          return vi.fn();
        }
      );

      const onComplete = vi.fn();
      const { result } = renderHook(() =>
        useLabAnalysis({ patientId: 'patient-123', onComplete })
      );

      const file = new File(['test'], 'lab-results.pdf');

      await act(async () => {
        await result.current.uploadAndAnalyze(file, mockPatientContext);
      });

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalledWith(mockResult);
      }, { timeout: 3000 });
    });

    it('should handle session error', async () => {
      vi.useRealTimers(); // Use real timers for this test

      vi.mocked(clinicalReasoningService.uploadAndAnalyze).mockResolvedValue(
        'session-123'
      );

      vi.mocked(clinicalReasoningService.subscribeToSession).mockImplementation(
        (_clinicId, _sessionId, callback) => {
          // Call callback immediately for testing
          Promise.resolve().then(() => {
            callback({
              id: 'session-123',
              status: 'error',
              error: 'AI processing failed',
            });
          });
          return vi.fn();
        }
      );

      const onError = vi.fn();
      const { result } = renderHook(() =>
        useLabAnalysis({ patientId: 'patient-123', onError })
      );

      const file = new File(['test'], 'lab-results.pdf');

      await act(async () => {
        await result.current.uploadAndAnalyze(file, mockPatientContext);
      });

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      }, { timeout: 3000 });
    });
  });

  describe('reset', () => {
    it('should reset to idle state', async () => {
      vi.mocked(clinicalReasoningService.uploadAndAnalyze).mockResolvedValue(
        'session-123'
      );

      const { result } = renderHook(() =>
        useLabAnalysis({ patientId: 'patient-123' })
      );

      const file = new File(['test'], 'lab-results.pdf');

      await act(async () => {
        await result.current.uploadAndAnalyze(file, mockPatientContext);
      });

      expect(result.current.status).not.toBe('idle');

      act(() => {
        result.current.reset();
      });

      expect(result.current.status).toBe('idle');
      expect(result.current.result).toBe(null);
      expect(result.current.error).toBe(null);
    });
  });

  describe('markReviewed', () => {
    it('should mark analysis as reviewed', async () => {
      vi.mocked(clinicalReasoningService.uploadAndAnalyze).mockResolvedValue(
        'session-123'
      );
      vi.mocked(clinicalReasoningService.markReviewed).mockResolvedValue(
        undefined
      );

      const { result } = renderHook(() =>
        useLabAnalysis({ patientId: 'patient-123' })
      );

      const file = new File(['test'], 'lab-results.pdf');

      await act(async () => {
        await result.current.uploadAndAnalyze(file, mockPatientContext);
      });

      await act(async () => {
        await result.current.markReviewed('helpful');
      });

      expect(clinicalReasoningService.markReviewed).toHaveBeenCalledWith(
        'clinic-123',
        'session-123',
        'helpful'
      );
    });
  });

  describe('derived states', () => {
    it('should set isUploading when status is uploading', async () => {
      vi.mocked(clinicalReasoningService.uploadAndAnalyze).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { result } = renderHook(() =>
        useLabAnalysis({ patientId: 'patient-123' })
      );

      act(() => {
        result.current.uploadAndAnalyze(
          new File(['test'], 'test.pdf'),
          mockPatientContext
        );
      });

      expect(result.current.isUploading).toBe(true);
      expect(result.current.isProcessing).toBe(false);
    });

    it('should set isProcessing when status is processing or extracting', async () => {
      vi.mocked(clinicalReasoningService.uploadAndAnalyze).mockResolvedValue(
        'session-123'
      );

      const { result } = renderHook(() =>
        useLabAnalysis({ patientId: 'patient-123' })
      );

      await act(async () => {
        await result.current.uploadAndAnalyze(
          new File(['test'], 'test.pdf'),
          mockPatientContext
        );
      });

      expect(result.current.isProcessing).toBe(true);
    });
  });
});
