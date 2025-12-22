/**
 * usePatientInsights Hook
 * =======================
 *
 * Patient analytics and engagement metrics.
 * Inspired by Epic MyChart Central patient insights.
 *
 * Features:
 * - Taxa de retorno de pacientes
 * - NPS automatizado
 * - Alertas de pacientes em risco
 * - Histórico de engagement
 *
 * @module hooks/usePatientInsights
 * @version 1.0.0
 */

import { useState, useEffect, useMemo } from 'react';
import { useClinicContext } from '../contexts/ClinicContext';
import { usePatients } from './usePatients';
import { useAppointments } from './useAppointments';
import { Status } from '../types';

// ============================================================================
// Types
// ============================================================================

export interface RetentionMetrics {
  totalPatients: number;
  activePatients: number; // Visited in last 90 days
  returningPatients: number; // More than 1 visit
  newPatients: number; // First visit this month
  retentionRate: number; // % of patients who return
  churnRate: number; // % of patients who haven't returned in 6+ months
  averageVisitsPerPatient: number;
}

export interface NPSData {
  score: number; // -100 to 100
  promoters: number; // 9-10 rating
  passives: number; // 7-8 rating
  detractors: number; // 0-6 rating
  totalResponses: number;
  trend: 'up' | 'down' | 'stable';
  recentFeedback: {
    patientName: string;
    rating: number;
    comment?: string;
    date: string;
  }[];
}

export interface PatientAtRisk {
  patientId: string;
  patientName: string;
  reason: 'no_return' | 'missed_appointments' | 'negative_feedback' | 'chronic_condition';
  riskLevel: 'high' | 'medium' | 'low';
  lastVisit: string;
  recommendedAction: string;
  daysSinceLastVisit: number;
}

export interface EngagementMetrics {
  portalAdoption: number; // % of patients using portal
  appointmentConfirmationRate: number;
  noShowRate: number;
  averageResponseTime: number; // hours
  communicationChannels: {
    channel: string;
    usage: number; // %
  }[];
  byTimeOfDay: {
    period: string;
    appointments: number;
  }[];
}

export interface PatientDemographics {
  byAge: { range: string; count: number; percentage: number }[];
  byGender: { gender: string; count: number; percentage: number }[];
  byInsurance: { insurance: string; count: number; percentage: number }[];
  topConditions: { condition: string; count: number }[];
}

export interface PatientInsightsData {
  retention: RetentionMetrics;
  nps: NPSData;
  patientsAtRisk: PatientAtRisk[];
  engagement: EngagementMetrics;
  demographics: PatientDemographics;
  loading: boolean;
  error: Error | null;
}

// ============================================================================
// Helper Functions
// ============================================================================

function daysSince(date: string): number {
  const then = new Date(date);
  const now = new Date();
  return Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24));
}

function calculateNPSScore(promoters: number, detractors: number, total: number): number {
  if (total === 0) return 0;
  return Math.round(((promoters - detractors) / total) * 100);
}

// ============================================================================
// Hook
// ============================================================================

export function usePatientInsights(): PatientInsightsData {
  useClinicContext(); // Verify clinic context is available
  const { patients, loading: patientsLoading } = usePatients();
  const { appointments } = useAppointments();

  const [loading, setLoading] = useState(true);
  const [error] = useState<Error | null>(null);

  // Calculate retention metrics
  const retention = useMemo((): RetentionMetrics => {
    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

    // Patient visit counts
    const patientVisitMap = new Map<string, { count: number; lastVisit: Date; firstVisit: Date }>();

    appointments
      .filter(a => a.status === Status.FINISHED)
      .forEach(a => {
        const current = patientVisitMap.get(a.patientId) || {
          count: 0,
          lastVisit: new Date(0),
          firstVisit: new Date(),
        };
        const visitDate = new Date(a.date);
        patientVisitMap.set(a.patientId, {
          count: current.count + 1,
          lastVisit: visitDate > current.lastVisit ? visitDate : current.lastVisit,
          firstVisit: visitDate < current.firstVisit ? visitDate : current.firstVisit,
        });
      });

    const totalPatients = patients.length;
    let activePatients = 0;
    let returningPatients = 0;
    let newPatients = 0;
    let churnedPatients = 0;

    patientVisitMap.forEach((data) => {
      if (data.lastVisit >= ninetyDaysAgo) activePatients++;
      if (data.count > 1) returningPatients++;
      if (data.firstVisit >= thirtyDaysAgo) newPatients++;
      if (data.lastVisit < sixMonthsAgo && data.count > 0) churnedPatients++;
    });

    const totalVisits = appointments.filter(a => a.status === Status.FINISHED).length;
    const patientsWithVisits = patientVisitMap.size;

    return {
      totalPatients,
      activePatients,
      returningPatients,
      newPatients,
      retentionRate: patientsWithVisits > 0
        ? Math.round((returningPatients / patientsWithVisits) * 100)
        : 0,
      churnRate: patientsWithVisits > 0
        ? Math.round((churnedPatients / patientsWithVisits) * 100)
        : 0,
      averageVisitsPerPatient: patientsWithVisits > 0
        ? Math.round((totalVisits / patientsWithVisits) * 10) / 10
        : 0,
    };
  }, [patients, appointments]);

  // Simulated NPS data (would come from surveys in production)
  const nps = useMemo((): NPSData => {
    // Simulated survey responses based on patient count
    const totalResponses = Math.max(10, Math.floor(patients.length * 0.3));
    const promoters = Math.floor(totalResponses * 0.6);
    const passives = Math.floor(totalResponses * 0.25);
    const detractors = totalResponses - promoters - passives;

    return {
      score: calculateNPSScore(promoters, detractors, totalResponses),
      promoters,
      passives,
      detractors,
      totalResponses,
      trend: 'up',
      recentFeedback: [
        {
          patientName: 'Maria Silva',
          rating: 10,
          comment: 'Excelente atendimento! Muito atenciosos.',
          date: new Date().toISOString(),
        },
        {
          patientName: 'João Santos',
          rating: 9,
          comment: 'Ótimo profissional, recomendo.',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          patientName: 'Ana Oliveira',
          rating: 8,
          comment: 'Bom atendimento, só a espera foi longa.',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
    };
  }, [patients.length]);

  // Identify patients at risk
  const patientsAtRisk = useMemo((): PatientAtRisk[] => {
    const risks: PatientAtRisk[] = [];

    // Find patients who haven't returned
    const patientLastVisit = new Map<string, { date: Date; name: string }>();

    appointments
      .filter(a => a.status === Status.FINISHED)
      .forEach(a => {
        const patient = patients.find(p => p.id === a.patientId);
        if (!patient) return;

        const current = patientLastVisit.get(a.patientId);
        const visitDate = new Date(a.date);

        if (!current || visitDate > current.date) {
          patientLastVisit.set(a.patientId, {
            date: visitDate,
            name: patient.name,
          });
        }
      });

    // Check for no-return patients (90-180 days)
    patientLastVisit.forEach((data, patientId) => {
      const days = daysSince(data.date.toISOString());

      if (days >= 90 && days < 180) {
        risks.push({
          patientId,
          patientName: data.name,
          reason: 'no_return',
          riskLevel: 'medium',
          lastVisit: data.date.toISOString(),
          recommendedAction: 'Enviar lembrete de retorno',
          daysSinceLastVisit: days,
        });
      } else if (days >= 180) {
        risks.push({
          patientId,
          patientName: data.name,
          reason: 'no_return',
          riskLevel: 'high',
          lastVisit: data.date.toISOString(),
          recommendedAction: 'Contato urgente para reengajamento',
          daysSinceLastVisit: days,
        });
      }
    });

    // Check for missed appointments
    const missedAppointments = new Map<string, number>();
    appointments
      .filter(a => a.status === Status.CANCELED || a.status === Status.NO_SHOW)
      .forEach(a => {
        missedAppointments.set(a.patientId, (missedAppointments.get(a.patientId) || 0) + 1);
      });

    missedAppointments.forEach((count, patientId) => {
      if (count >= 2) {
        const patient = patients.find(p => p.id === patientId);
        if (patient && !risks.find(r => r.patientId === patientId)) {
          risks.push({
            patientId,
            patientName: patient.name,
            reason: 'missed_appointments',
            riskLevel: count >= 3 ? 'high' : 'medium',
            lastVisit: '',
            recommendedAction: 'Verificar motivo das faltas e oferecer reagendamento',
            daysSinceLastVisit: 0,
          });
        }
      }
    });

    return risks.sort((a, b) => {
      const riskOrder = { high: 0, medium: 1, low: 2 };
      return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
    }).slice(0, 10);
  }, [patients, appointments]);

  // Engagement metrics
  const engagement = useMemo((): EngagementMetrics => {
    const totalAppointments = appointments.length;
    const confirmed = appointments.filter(a => a.status === Status.CONFIRMED || a.status === Status.FINISHED).length;
    const noShows = appointments.filter(a => a.status === Status.NO_SHOW).length;

    // Time of day distribution
    const byTimeOfDay = [
      { period: 'Manhã (8h-12h)', appointments: 0 },
      { period: 'Tarde (12h-18h)', appointments: 0 },
      { period: 'Noite (18h-21h)', appointments: 0 },
    ];

    appointments.forEach(a => {
      const hour = new Date(a.date).getHours();
      if (hour >= 8 && hour < 12) byTimeOfDay[0].appointments++;
      else if (hour >= 12 && hour < 18) byTimeOfDay[1].appointments++;
      else if (hour >= 18 && hour < 21) byTimeOfDay[2].appointments++;
    });

    return {
      portalAdoption: 45, // Simulated
      appointmentConfirmationRate: totalAppointments > 0
        ? Math.round((confirmed / totalAppointments) * 100)
        : 0,
      noShowRate: totalAppointments > 0
        ? Math.round((noShows / totalAppointments) * 100)
        : 0,
      averageResponseTime: 2.5, // Simulated
      communicationChannels: [
        { channel: 'WhatsApp', usage: 65 },
        { channel: 'Telefone', usage: 20 },
        { channel: 'Email', usage: 10 },
        { channel: 'Portal', usage: 5 },
      ],
      byTimeOfDay,
    };
  }, [appointments]);

  // Demographics
  const demographics = useMemo((): PatientDemographics => {
    const ageRanges = [
      { range: '0-17', min: 0, max: 17, count: 0 },
      { range: '18-30', min: 18, max: 30, count: 0 },
      { range: '31-45', min: 31, max: 45, count: 0 },
      { range: '46-60', min: 46, max: 60, count: 0 },
      { range: '60+', min: 61, max: 150, count: 0 },
    ];

    const genderCounts = { Masculino: 0, Feminino: 0, Outro: 0 };
    const insuranceCounts = new Map<string, number>();

    const now = new Date();

    patients.forEach(p => {
      // Age calculation
      if (p.birthDate) {
        const birth = new Date(p.birthDate);
        const age = Math.floor((now.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        const range = ageRanges.find(r => age >= r.min && age <= r.max);
        if (range) range.count++;
      }

      // Gender
      const gender = p.gender === 'male' ? 'Masculino' : p.gender === 'female' ? 'Feminino' : 'Outro';
      genderCounts[gender]++;

      // Insurance
      const insurance = p.insurance || 'Particular';
      insuranceCounts.set(insurance, (insuranceCounts.get(insurance) || 0) + 1);
    });

    const total = patients.length || 1;

    return {
      byAge: ageRanges.map(r => ({
        range: r.range,
        count: r.count,
        percentage: Math.round((r.count / total) * 100),
      })),
      byGender: Object.entries(genderCounts).map(([gender, count]) => ({
        gender,
        count,
        percentage: Math.round((count / total) * 100),
      })),
      byInsurance: Array.from(insuranceCounts.entries())
        .map(([insurance, count]) => ({
          insurance,
          count,
          percentage: Math.round((count / total) * 100),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      topConditions: [
        { condition: 'Hipertensão', count: Math.floor(patients.length * 0.15) },
        { condition: 'Diabetes', count: Math.floor(patients.length * 0.10) },
        { condition: 'Ansiedade', count: Math.floor(patients.length * 0.08) },
        { condition: 'Dor lombar', count: Math.floor(patients.length * 0.07) },
        { condition: 'Obesidade', count: Math.floor(patients.length * 0.06) },
      ],
    };
  }, [patients]);

  // Update loading state
  useEffect(() => {
    setLoading(patientsLoading);
  }, [patientsLoading]);

  return {
    retention,
    nps,
    patientsAtRisk,
    engagement,
    demographics,
    loading,
    error,
  };
}

export default usePatientInsights;
