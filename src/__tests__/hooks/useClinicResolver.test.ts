/**
 * useClinicResolver Hook Tests
 *
 * Tests for the clinic resolver hook used in patient portal.
 *
 * @module __tests__/hooks/useClinicResolver
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useClinicResolver } from '../../hooks/useClinicResolver'
import { clinicService } from '../../services/firestore/clinic.service'

vi.mock('../../services/firestore/clinic.service', () => ({
  clinicService: {
    getBySubdomain: vi.fn(),
    getById: vi.fn(),
  },
}))

describe('useClinicResolver', () => {
  const mockClinic = {
    id: 'clinic-123',
    name: 'Test Clinic',
    slug: 'test-clinic',
    subdomain: 'test-clinic',
    ownerId: 'owner-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const originalLocation = window.location

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset location
    Object.defineProperty(window, 'location', {
      value: {
        hostname: 'localhost',
        search: '',
      },
      writable: true,
    })
  })

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    })
  })

  describe('initial state', () => {
    it('should have null clinic initially', () => {
      const { result } = renderHook(() => useClinicResolver())

      expect(result.current.clinic).toBeNull()
      expect(result.current.clinicId).toBeNull()
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.method).toBeNull()
    })
  })

  describe('subdomain resolution', () => {
    it('should resolve clinic from subdomain', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          hostname: 'clinica-abc.clinicagenesis.com.br',
          search: '',
        },
        writable: true,
      })

      vi.mocked(clinicService.getBySubdomain).mockResolvedValue(mockClinic)

      const { result } = renderHook(() => useClinicResolver())

      await act(async () => {
        await result.current.resolveClinic()
      })

      expect(clinicService.getBySubdomain).toHaveBeenCalledWith('clinica-abc')
      expect(result.current.clinic).toEqual(mockClinic)
      expect(result.current.clinicId).toBe('clinic-123')
      expect(result.current.method).toBe('subdomain')
      expect(result.current.loading).toBe(false)
    })

    it('should skip common subdomains like www', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          hostname: 'www.clinicagenesis.com.br',
          search: '?clinic=clinic-123',
        },
        writable: true,
      })

      vi.mocked(clinicService.getById).mockResolvedValue(mockClinic)

      const { result } = renderHook(() => useClinicResolver())

      await act(async () => {
        await result.current.resolveClinic()
      })

      // Should fall back to query param
      expect(clinicService.getBySubdomain).not.toHaveBeenCalled()
      expect(clinicService.getById).toHaveBeenCalledWith('clinic-123')
    })

    it('should skip localhost', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          hostname: 'localhost',
          search: '',
        },
        writable: true,
      })

      const { result } = renderHook(() => useClinicResolver())

      await act(async () => {
        await result.current.resolveClinic()
      })

      expect(clinicService.getBySubdomain).not.toHaveBeenCalled()
      expect(result.current.clinic).toBeNull()
    })

    it('should skip IP addresses', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          hostname: '192.168.1.1',
          search: '',
        },
        writable: true,
      })

      const { result } = renderHook(() => useClinicResolver())

      await act(async () => {
        await result.current.resolveClinic()
      })

      expect(clinicService.getBySubdomain).not.toHaveBeenCalled()
    })

    it('should skip admin subdomain', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          hostname: 'admin.clinicagenesis.com.br',
          search: '',
        },
        writable: true,
      })

      const { result } = renderHook(() => useClinicResolver())

      await act(async () => {
        await result.current.resolveClinic()
      })

      expect(clinicService.getBySubdomain).not.toHaveBeenCalled()
    })
  })

  describe('query param resolution', () => {
    it('should resolve clinic from query param', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          hostname: 'localhost',
          search: '?clinic=clinic-123',
        },
        writable: true,
      })

      vi.mocked(clinicService.getById).mockResolvedValue(mockClinic)

      const { result } = renderHook(() => useClinicResolver())

      await act(async () => {
        await result.current.resolveClinic()
      })

      expect(clinicService.getById).toHaveBeenCalledWith('clinic-123')
      expect(result.current.clinic).toEqual(mockClinic)
      expect(result.current.method).toBe('query')
    })

    it('should try subdomain first, then query param', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          hostname: 'clinica-abc.clinicagenesis.com.br',
          search: '?clinic=clinic-456',
        },
        writable: true,
      })

      vi.mocked(clinicService.getBySubdomain).mockResolvedValue(null)
      vi.mocked(clinicService.getById).mockResolvedValue(mockClinic)

      const { result } = renderHook(() => useClinicResolver())

      await act(async () => {
        await result.current.resolveClinic()
      })

      expect(clinicService.getBySubdomain).toHaveBeenCalledWith('clinica-abc')
      expect(clinicService.getById).toHaveBeenCalledWith('clinic-456')
      expect(result.current.method).toBe('query')
    })
  })

  describe('manual resolution', () => {
    it('should set clinic manually', async () => {
      vi.mocked(clinicService.getById).mockResolvedValue(mockClinic)

      const { result } = renderHook(() => useClinicResolver())

      await act(async () => {
        await result.current.setClinicManually('clinic-123')
      })

      expect(result.current.clinic).toEqual(mockClinic)
      expect(result.current.method).toBe('manual')
    })

    it('should set error if clinic not found', async () => {
      vi.mocked(clinicService.getById).mockResolvedValue(null)

      const { result } = renderHook(() => useClinicResolver())

      await act(async () => {
        await result.current.setClinicManually('invalid-id')
      })

      expect(result.current.clinic).toBeNull()
      expect(result.current.error).toBe('Clínica não encontrada')
    })

    it('should handle errors in manual resolution', async () => {
      vi.mocked(clinicService.getById).mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useClinicResolver())

      await act(async () => {
        await result.current.setClinicManually('clinic-123')
      })

      expect(result.current.clinic).toBeNull()
      expect(result.current.error).toBe('Network error')
    })
  })

  describe('error handling', () => {
    it('should handle errors in resolve', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          hostname: 'clinica-abc.clinicagenesis.com.br',
          search: '',
        },
        writable: true,
      })

      vi.mocked(clinicService.getBySubdomain).mockRejectedValue(new Error('Database error'))

      const { result } = renderHook(() => useClinicResolver())

      await act(async () => {
        await result.current.resolveClinic()
      })

      expect(result.current.error).toBe('Database error')
      expect(result.current.clinic).toBeNull()
    })

    it('should clear error', async () => {
      vi.mocked(clinicService.getById).mockRejectedValue(new Error('Some error'))

      const { result } = renderHook(() => useClinicResolver())

      await act(async () => {
        await result.current.setClinicManually('clinic-123')
      })

      expect(result.current.error).toBe('Some error')

      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('loading state', () => {
    it('should set loading during resolution', async () => {
      let resolvePromise: (value: typeof mockClinic | null) => void
      const promise = new Promise<typeof mockClinic | null>(resolve => {
        resolvePromise = resolve
      })

      vi.mocked(clinicService.getById).mockReturnValue(promise)

      Object.defineProperty(window, 'location', {
        value: {
          hostname: 'localhost',
          search: '?clinic=clinic-123',
        },
        writable: true,
      })

      const { result } = renderHook(() => useClinicResolver())

      let resolveResult: Promise<unknown>

      act(() => {
        resolveResult = result.current.resolveClinic()
      })

      expect(result.current.loading).toBe(true)

      await act(async () => {
        resolvePromise!(mockClinic)
        await resolveResult
      })

      expect(result.current.loading).toBe(false)
    })
  })

  describe('no resolution', () => {
    it('should return null when no clinic found', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          hostname: 'localhost',
          search: '',
        },
        writable: true,
      })

      const { result } = renderHook(() => useClinicResolver())

      let resolved: unknown

      await act(async () => {
        resolved = await result.current.resolveClinic()
      })

      expect(resolved).toBeNull()
      expect(result.current.clinic).toBeNull()
      expect(result.current.method).toBeNull()
      expect(result.current.error).toBeNull()
    })
  })
})
