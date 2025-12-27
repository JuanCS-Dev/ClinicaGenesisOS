/**
 * Onboarding Test Setup
 *
 * Common mocks and utilities for onboarding tests.
 * NOTE: vi.mock() calls are hoisted, so they must be at module level.
 * Using vi.hoisted() to ensure mocks are available at hoist time.
 */

import { vi } from 'vitest';
import React from 'react';

// Use vi.hoisted to ensure these are available at mock hoist time
const hoistedMocks = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockCreateClinic: vi.fn(),
}));

export const mockNavigate = hoistedMocks.mockNavigate;
export const mockCreateClinic = hoistedMocks.mockCreateClinic;

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: { uid: 'user-123', email: 'admin@clinica.com' },
    userProfile: null,
  })),
}));

vi.mock('../../../contexts/ClinicContext', () => ({
  useClinicContext: vi.fn(() => ({
    clinicId: null,
    createClinic: mockCreateClinic,
  })),
}));

// Mock onboarding step components
vi.mock('../../../components/onboarding/StepIndicator', () => ({
  StepIndicator: ({
    number,
    title,
    isActive,
    isCompleted,
  }: {
    number: number;
    title: string;
    isActive: boolean;
    isCompleted: boolean;
  }) => (
    <div data-testid={`step-${number}`} data-active={isActive} data-completed={isCompleted}>
      {title}
    </div>
  ),
}));

vi.mock('../../../components/onboarding/StepClinicInfo', () => ({
  StepClinicInfo: ({
    clinicName,
    setClinicName,
    phone,
    setPhone,
    address,
    setAddress,
  }: {
    clinicName: string;
    setClinicName: (v: string) => void;
    phone: string;
    setPhone: (v: string) => void;
    address: string;
    setAddress: (v: string) => void;
  }) => (
    <div data-testid="step-clinic-info">
      <input
        data-testid="clinic-name-input"
        placeholder="Nome da clínica"
        value={clinicName}
        onChange={(e) => setClinicName(e.target.value)}
      />
      <input
        data-testid="phone-input"
        placeholder="Telefone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <input
        data-testid="address-input"
        placeholder="Endereço"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
    </div>
  ),
}));

vi.mock('../../../components/onboarding/StepSpecialties', () => ({
  StepSpecialties: ({
    selectedSpecialties,
    toggleSpecialty,
  }: {
    selectedSpecialties: string[];
    toggleSpecialty: (s: string) => void;
  }) => (
    <div data-testid="step-specialties">
      <span data-testid="selected-count">{selectedSpecialties.length} selected</span>
      <button data-testid="toggle-dermatologia" onClick={() => toggleSpecialty('dermatologia')}>
        Toggle Dermatologia
      </button>
      <button data-testid="toggle-medicina" onClick={() => toggleSpecialty('medicina')}>
        Toggle Medicina
      </button>
    </div>
  ),
}));

vi.mock('../../../components/onboarding/StepSettings', () => ({
  StepSettings: ({
    workStart,
    setWorkStart,
    workEnd,
    setWorkEnd,
    appointmentDuration,
    setAppointmentDuration,
    seedData,
    setSeedData,
  }: {
    workStart: string;
    setWorkStart: (v: string) => void;
    workEnd: string;
    setWorkEnd: (v: string) => void;
    appointmentDuration: number;
    setAppointmentDuration: (v: number) => void;
    seedData: boolean;
    setSeedData: (v: boolean) => void;
  }) => (
    <div data-testid="step-settings">
      <input
        data-testid="work-start-input"
        value={workStart}
        onChange={(e) => setWorkStart(e.target.value)}
      />
      <input
        data-testid="work-end-input"
        value={workEnd}
        onChange={(e) => setWorkEnd(e.target.value)}
      />
      <input
        data-testid="duration-input"
        type="number"
        value={appointmentDuration}
        onChange={(e) => setAppointmentDuration(Number(e.target.value))}
      />
      <input
        data-testid="seed-data-checkbox"
        type="checkbox"
        checked={seedData}
        onChange={(e) => setSeedData(e.target.checked)}
      />
    </div>
  ),
}));

export function resetOnboardingMocks() {
  vi.clearAllMocks();
  mockNavigate.mockReset();
  mockCreateClinic.mockReset();
  mockCreateClinic.mockResolvedValue({ id: 'clinic-123' });
}
