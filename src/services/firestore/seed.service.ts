/**
 * Seed Service
 *
 * Creates demo data for new clinics to help users get started.
 * All seed data is marked with 'Demo' tag for easy identification and removal.
 */

import { patientService } from './patient.service';
import { appointmentService } from './appointment.service';
import { recordService } from './record.service';
import {
  Status,
  RecordType,
  type CreatePatientInput,
  type CreateAppointmentInput,
  type CreateSoapRecordInput,
  type CreateAnthropometryRecordInput,
  type CreatePsychoSessionRecordInput,
} from '@/types';

/**
 * Get today's date in YYYY-MM-DD format.
 */
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get tomorrow's date in YYYY-MM-DD format.
 */
function getTomorrowDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

/**
 * Demo patients data.
 */
const SEED_PATIENTS: CreatePatientInput[] = [
  {
    name: 'Maria Silva (Demo)',
    birthDate: '1985-03-15',
    phone: '(11) 99999-0001',
    email: 'maria.demo@example.com',
    gender: 'Feminino',
    tags: ['Demo', 'Cardiologia'],
    insurance: 'Unimed',
    insuranceNumber: 'UNI-123456',
    address: 'Rua das Flores, 123 - São Paulo, SP',
  },
  {
    name: 'Carlos Mendes (Demo)',
    birthDate: '1978-07-22',
    phone: '(11) 99999-0002',
    email: 'carlos.demo@example.com',
    gender: 'Masculino',
    tags: ['Demo', 'Nutrição'],
    insurance: 'SulAmérica',
    insuranceNumber: 'SUL-789012',
    address: 'Av. Paulista, 1000 - São Paulo, SP',
  },
  {
    name: 'Ana Costa (Demo)',
    birthDate: '1990-11-08',
    phone: '(11) 99999-0003',
    email: 'ana.demo@example.com',
    gender: 'Feminino',
    tags: ['Demo', 'Psicologia'],
    insurance: 'Bradesco Saúde',
    address: 'Rua Augusta, 500 - São Paulo, SP',
  },
];

/**
 * Seeds demo data for a new clinic.
 *
 * @param clinicId - The clinic ID to seed data for
 * @param professionalName - The name of the professional (for records)
 * @returns Object with IDs of created entities
 */
export async function seedClinicData(
  clinicId: string,
  professionalName: string
): Promise<{
  patientIds: string[];
  appointmentIds: string[];
  recordIds: string[];
}> {
  const patientIds: string[] = [];
  const appointmentIds: string[] = [];
  const recordIds: string[] = [];

  // Create patients
  for (const patientData of SEED_PATIENTS) {
    const patientId = await patientService.create(clinicId, patientData);
    patientIds.push(patientId);
  }

  const [mariaId, carlosId, anaId] = patientIds;
  const today = getTodayDate();
  const tomorrow = getTomorrowDate();

  // Create appointments for today and tomorrow
  const appointments: Array<
    Omit<CreateAppointmentInput, 'patientId'> & { patientIdRef: string }
  > = [
    {
      patientIdRef: mariaId,
      patientName: 'Maria Silva (Demo)',
      date: `${today}T09:00:00`,
      durationMin: 30,
      procedure: 'Consulta de Rotina',
      status: Status.CONFIRMED,
      professional: professionalName,
      specialty: 'medicina',
      notes: 'Retorno para avaliação cardiológica',
    },
    {
      patientIdRef: carlosId,
      patientName: 'Carlos Mendes (Demo)',
      date: `${today}T10:30:00`,
      durationMin: 45,
      procedure: 'Avaliação Nutricional',
      status: Status.PENDING,
      professional: professionalName,
      specialty: 'nutricao',
      notes: 'Primeira consulta - reeducação alimentar',
    },
    {
      patientIdRef: anaId,
      patientName: 'Ana Costa (Demo)',
      date: `${today}T14:00:00`,
      durationMin: 50,
      procedure: 'Sessão de Psicoterapia',
      status: Status.CONFIRMED,
      professional: professionalName,
      specialty: 'psicologia',
    },
    {
      patientIdRef: mariaId,
      patientName: 'Maria Silva (Demo)',
      date: `${tomorrow}T11:00:00`,
      durationMin: 30,
      procedure: 'Retorno',
      status: Status.PENDING,
      professional: professionalName,
      specialty: 'medicina',
    },
  ];

  for (const apt of appointments) {
    const { patientIdRef, ...aptData } = apt;
    const appointmentId = await appointmentService.create(clinicId, {
      ...aptData,
      patientId: patientIdRef,
    });
    appointmentIds.push(appointmentId);
  }

  // Create medical records (historical)
  // SOAP record for Maria (15 days ago)
  const soapRecordData: CreateSoapRecordInput = {
    patientId: mariaId,
    type: RecordType.SOAP,
    specialty: 'medicina',
    subjective:
      'Paciente relata dores no peito ocasionais, especialmente após esforço físico. Nega falta de ar em repouso.',
    objective:
      'PA: 130/85 mmHg, FC: 78 bpm, FR: 16 irpm. Ausculta cardíaca: RCR em 2T, sem sopros. Ausculta pulmonar: MV+ bilateral, sem RA.',
    assessment:
      'Hipertensão arterial sistêmica em controle regular. Possível angina de esforço a investigar.',
    plan: '1. Solicitar ECG e teste ergométrico\n2. Manter medicação atual\n3. Orientar dieta hipossódica\n4. Retorno em 30 dias com exames',
  };
  const soapRecordId = await recordService.create(clinicId, soapRecordData, professionalName);
  recordIds.push(soapRecordId);

  // Anthropometry record for Carlos (7 days ago)
  const anthropometryRecordData: CreateAnthropometryRecordInput = {
    patientId: carlosId,
    type: RecordType.ANTHROPOMETRY,
    specialty: 'nutricao',
    weight: 92.5,
    height: 175,
    imc: 30.2,
    waist: 102,
    hip: 108,
  };
  const anthropometryRecordId = await recordService.create(
    clinicId,
    anthropometryRecordData,
    professionalName
  );
  recordIds.push(anthropometryRecordId);

  // Psychology session for Ana (3 days ago)
  const psychoRecordData: CreatePsychoSessionRecordInput = {
    patientId: anaId,
    type: RecordType.PSYCHO_SESSION,
    specialty: 'psicologia',
    mood: 'anxious',
    summary:
      'Paciente apresentou quadro de ansiedade relacionado ao trabalho. Relatou dificuldades em manter foco e irritabilidade com colegas.',
    privateNotes:
      'Investigar possível síndrome de burnout. Considerar técnicas de relaxamento e mindfulness.',
  };
  const psychoRecordId = await recordService.create(clinicId, psychoRecordData, professionalName);
  recordIds.push(psychoRecordId);

  return {
    patientIds,
    appointmentIds,
    recordIds,
  };
}

/**
 * Removes all demo data from a clinic.
 *
 * @param clinicId - The clinic ID to remove demo data from
 */
export async function removeDemoData(clinicId: string): Promise<void> {
  // Get all patients with Demo tag
  const patients = await patientService.getAll(clinicId);
  const demoPatients = patients.filter((p) => p.tags.includes('Demo'));

  // Delete each demo patient (and their related data)
  for (const patient of demoPatients) {
    // Delete related records
    const records = await recordService.getByPatient(clinicId, patient.id);
    for (const record of records) {
      await recordService.delete(clinicId, record.id);
    }

    // Delete related appointments
    const appointments = await appointmentService.getByPatient(clinicId, patient.id);
    for (const apt of appointments) {
      await appointmentService.delete(clinicId, apt.id);
    }

    // Delete patient
    await patientService.delete(clinicId, patient.id);
  }
}
