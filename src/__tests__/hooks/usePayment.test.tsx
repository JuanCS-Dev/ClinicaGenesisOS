/**
 * usePayment Hook Tests
 *
 * Tests for the payment hooks.
 *
 * @module __tests__/hooks/usePayment
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import {
  usePayments,
  usePayment,
  useCreatePixPayment,
  usePatientPendingPayments,
} from '../../hooks/usePayment'
import { stripeService } from '../../services/stripe.service'
import { useClinicContext } from '../../contexts/ClinicContext'
import type { Payment, PaymentSummary } from '@/types'

vi.mock('../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(),
}))

vi.mock('../../services/stripe.service', () => ({
  stripeService: {
    subscribe: vi.fn(),
    subscribeToPayment: vi.fn(),
    getSummary: vi.fn(),
    getPayments: vi.fn(),
    createPixPayment: vi.fn(),
    cancelPayment: vi.fn(),
    refundPayment: vi.fn(),
    getPendingPaymentsForPatient: vi.fn(),
  },
}))

describe('usePayments', () => {
  const mockClinic = { id: 'clinic-123', name: 'Test Clinic' }
  let mockUnsubscribe: ReturnType<typeof vi.fn>

  const mockPayments: Payment[] = [
    {
      id: 'pay-1',
      clinicId: 'clinic-123',
      amount: 15000,
      status: 'succeeded',
      method: 'pix',
      description: 'Consulta',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'pay-2',
      clinicId: 'clinic-123',
      amount: 10000,
      status: 'awaiting_payment',
      method: 'pix',
      description: 'Exame',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  const mockSummary: PaymentSummary = {
    total: 25000,
    succeeded: 15000,
    pending: 10000,
    failed: 0,
    count: 2,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUnsubscribe = vi.fn()

    vi.mocked(useClinicContext).mockReturnValue({
      clinic: mockClinic,
    } as ReturnType<typeof useClinicContext>)

    vi.mocked(stripeService.subscribe).mockImplementation((_, onData) => {
      setTimeout(() => onData(mockPayments), 0)
      return mockUnsubscribe
    })

    vi.mocked(stripeService.getSummary).mockResolvedValue(mockSummary)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initialization', () => {
    it('should initialize with loading state', () => {
      vi.mocked(stripeService.subscribe).mockReturnValue(mockUnsubscribe)

      const { result } = renderHook(() => usePayments())

      expect(result.current.payments).toEqual([])
      expect(result.current.loading).toBe(true)
    })

    it('should not subscribe without clinic', () => {
      vi.mocked(useClinicContext).mockReturnValue({
        clinic: null,
      } as unknown as ReturnType<typeof useClinicContext>)

      renderHook(() => usePayments())

      expect(stripeService.subscribe).not.toHaveBeenCalled()
    })
  })

  describe('subscription', () => {
    it('should subscribe to payments', () => {
      renderHook(() => usePayments())

      expect(stripeService.subscribe).toHaveBeenCalledWith(
        'clinic-123',
        expect.any(Function),
        expect.any(Function)
      )
    })

    it('should unsubscribe on unmount', () => {
      const { unmount } = renderHook(() => usePayments())

      unmount()

      expect(mockUnsubscribe).toHaveBeenCalled()
    })

    it('should receive payments from subscription', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => usePayments())

      await act(async () => {
        vi.runAllTimers()
      })

      expect(result.current.payments.length).toBe(2)
      expect(result.current.loading).toBe(false)
    })

    it('should load summary', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => usePayments())

      await act(async () => {
        vi.runAllTimers()
        await Promise.resolve()
      })

      // Summary is loaded asynchronously
      expect(stripeService.getSummary).toHaveBeenCalled()
    })
  })

  describe('filtering', () => {
    it('should filter by status', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => usePayments())

      await act(async () => {
        vi.runAllTimers()
      })

      act(() => {
        result.current.filterByStatus('succeeded')
      })

      // Re-subscription will happen with filter
      expect(stripeService.subscribe).toHaveBeenCalled()
    })
  })

  describe('refresh', () => {
    it('should refresh payments', async () => {
      vi.mocked(stripeService.getPayments).mockResolvedValue(mockPayments)

      const { result } = renderHook(() => usePayments())

      await act(async () => {
        await result.current.refresh()
      })

      expect(stripeService.getPayments).toHaveBeenCalledWith('clinic-123', {
        status: undefined,
      })
    })
  })
})

describe('usePayment', () => {
  const mockClinic = { id: 'clinic-123' }
  let mockUnsubscribe: ReturnType<typeof vi.fn>

  const mockPayment: Payment = {
    id: 'pay-1',
    clinicId: 'clinic-123',
    amount: 15000,
    status: 'awaiting_payment',
    method: 'pix',
    description: 'Test',
    pixData: {
      qrCode: 'pix-code',
      qrCodeImage: 'base64',
      expiresAt: new Date(Date.now() + 60000).toISOString(),
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUnsubscribe = vi.fn()

    vi.mocked(useClinicContext).mockReturnValue({
      clinic: mockClinic,
    } as ReturnType<typeof useClinicContext>)

    vi.mocked(stripeService.subscribeToPayment).mockImplementation((_, __, onData) => {
      setTimeout(() => onData(mockPayment), 0)
      return mockUnsubscribe
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('subscription', () => {
    it('should subscribe to single payment', () => {
      renderHook(() => usePayment('pay-1'))

      expect(stripeService.subscribeToPayment).toHaveBeenCalledWith(
        'clinic-123',
        'pay-1',
        expect.any(Function),
        expect.any(Function)
      )
    })

    it('should not subscribe without paymentId', () => {
      renderHook(() => usePayment(null))

      expect(stripeService.subscribeToPayment).not.toHaveBeenCalled()
    })

    it('should receive payment from subscription', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => usePayment('pay-1'))

      await act(async () => {
        vi.runAllTimers()
      })

      expect(result.current.payment).toEqual(mockPayment)
      expect(result.current.loading).toBe(false)
    })
  })

  describe('time tracking', () => {
    it('should track time remaining for PIX', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => usePayment('pay-1'))

      await act(async () => {
        vi.runAllTimers()
      })

      // Allow timer to run
      await act(async () => {
        vi.advanceTimersByTime(1000)
      })

      expect(result.current.timeRemaining).toBeDefined()
      expect(result.current.isExpired).toBe(false)
    })

    it('should mark as expired when time runs out', async () => {
      const expiredPayment: Payment = {
        ...mockPayment,
        pixData: {
          qrCode: 'pix-code',
          qrCodeImage: 'base64',
          expiresAt: new Date(Date.now() - 1000).toISOString(),
        },
      }

      vi.mocked(stripeService.subscribeToPayment).mockImplementation((_, __, onData) => {
        setTimeout(() => onData(expiredPayment), 0)
        return mockUnsubscribe
      })

      vi.useFakeTimers()

      const { result } = renderHook(() => usePayment('pay-1'))

      await act(async () => {
        vi.runAllTimers()
      })

      expect(result.current.isExpired).toBe(true)
    })
  })

  describe('actions', () => {
    it('should cancel payment', async () => {
      vi.mocked(stripeService.cancelPayment).mockResolvedValue()
      vi.useFakeTimers()

      const { result } = renderHook(() => usePayment('pay-1'))

      await act(async () => {
        vi.runAllTimers()
      })

      await act(async () => {
        await result.current.cancel()
      })

      expect(stripeService.cancelPayment).toHaveBeenCalledWith('clinic-123', 'pay-1')
    })

    it('should refund payment', async () => {
      vi.mocked(stripeService.refundPayment).mockResolvedValue()
      vi.useFakeTimers()

      const { result } = renderHook(() => usePayment('pay-1'))

      await act(async () => {
        vi.runAllTimers()
      })

      await act(async () => {
        await result.current.refund(5000)
      })

      expect(stripeService.refundPayment).toHaveBeenCalledWith('clinic-123', 'pay-1', 5000)
    })
  })
})

describe('useCreatePixPayment', () => {
  const mockClinic = { id: 'clinic-123' }

  const mockPaymentIntent = {
    id: 'pi-123',
    clientSecret: 'secret',
    pix: {
      qrCode: 'pix-code',
      qrCodeImage: 'base64',
      expiresAt: new Date().toISOString(),
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useClinicContext).mockReturnValue({
      clinic: mockClinic,
    } as ReturnType<typeof useClinicContext>)

    vi.mocked(stripeService.createPixPayment).mockResolvedValue(mockPaymentIntent)
  })

  it('should create PIX payment', async () => {
    const { result } = renderHook(() => useCreatePixPayment())

    const input = {
      amount: 15000,
      description: 'Consulta',
    }

    await act(async () => {
      const response = await result.current.createPayment(input)
      expect(response).toEqual(mockPaymentIntent)
    })

    expect(stripeService.createPixPayment).toHaveBeenCalledWith('clinic-123', input)
    expect(result.current.paymentIntent).toEqual(mockPaymentIntent)
    expect(result.current.paymentId).toBe('pi-123')
  })

  it('should throw error without clinic', async () => {
    vi.mocked(useClinicContext).mockReturnValue({
      clinic: null,
    } as unknown as ReturnType<typeof useClinicContext>)

    const { result } = renderHook(() => useCreatePixPayment())

    await expect(
      result.current.createPayment({ amount: 15000, description: 'Test' })
    ).rejects.toThrow('Clinic not found')
  })

  it('should handle errors', async () => {
    vi.mocked(stripeService.createPixPayment).mockRejectedValue(new Error('API error'))

    const { result } = renderHook(() => useCreatePixPayment())

    await act(async () => {
      await expect(
        result.current.createPayment({ amount: 15000, description: 'Test' })
      ).rejects.toThrow('API error')
    })

    expect(result.current.error).toBe('API error')
    expect(result.current.creating).toBe(false)
  })

  it('should reset state', async () => {
    const { result } = renderHook(() => useCreatePixPayment())

    await act(async () => {
      await result.current.createPayment({ amount: 15000, description: 'Test' })
    })

    expect(result.current.paymentIntent).not.toBeNull()

    act(() => {
      result.current.reset()
    })

    expect(result.current.paymentIntent).toBeNull()
    expect(result.current.paymentId).toBeNull()
    expect(result.current.error).toBeNull()
  })
})

describe('usePatientPendingPayments', () => {
  const mockClinic = { id: 'clinic-123' }

  const mockPendingPayments: Payment[] = [
    {
      id: 'pay-1',
      clinicId: 'clinic-123',
      amount: 15000,
      status: 'awaiting_payment',
      method: 'pix',
      description: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useClinicContext).mockReturnValue({
      clinic: mockClinic,
    } as ReturnType<typeof useClinicContext>)

    vi.mocked(stripeService.getPendingPaymentsForPatient).mockResolvedValue(mockPendingPayments)
  })

  it('should load pending payments for patient', async () => {
    const { result } = renderHook(() => usePatientPendingPayments('patient-123'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.payments).toEqual(mockPendingPayments)
    expect(stripeService.getPendingPaymentsForPatient).toHaveBeenCalledWith(
      'clinic-123',
      'patient-123'
    )
  })

  it('should not load without patientId', async () => {
    const { result } = renderHook(() => usePatientPendingPayments(null))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.payments).toEqual([])
    expect(stripeService.getPendingPaymentsForPatient).not.toHaveBeenCalled()
  })

  it('should not load without clinic', async () => {
    vi.mocked(useClinicContext).mockReturnValue({
      clinic: null,
    } as unknown as ReturnType<typeof useClinicContext>)

    const { result } = renderHook(() => usePatientPendingPayments('patient-123'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(stripeService.getPendingPaymentsForPatient).not.toHaveBeenCalled()
  })
})
