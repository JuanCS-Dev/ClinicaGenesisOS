import { Patient, Appointment, Status, TimelineEvent, TimelineEventType, AnthropometryData } from './types';
import { addDays, subDays, setHours, setMinutes } from 'date-fns';

export const MOCK_PATIENTS: Patient[] = [
  {
    id: '1',
    name: 'Maria Silva',
    birthDate: '1990-05-15',
    age: 34,
    phone: '(11) 99999-8888',
    email: 'maria.silva@email.com',
    avatar: 'https://picsum.photos/200/200?random=1',
    nextAppointment: '18/12/2025',
    tags: ['VIP', 'Nutrição'],
    insurance: 'Unimed',
    gender: 'Feminino',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'João Santos',
    birthDate: '1982-08-20',
    age: 42,
    phone: '(11) 98888-7777',
    email: 'joao.santos@email.com',
    avatar: 'https://picsum.photos/200/200?random=2',
    tags: ['Retorno'],
    insurance: 'Particular',
    gender: 'Masculino',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Ana Costa',
    birthDate: '1996-02-10',
    age: 28,
    phone: '(11) 97777-6666',
    email: 'ana.costa@email.com',
    avatar: 'https://picsum.photos/200/200?random=3',
    nextAppointment: 'Hoje 14:00',
    tags: ['Primeira Vez'],
    insurance: 'SulAmérica',
    gender: 'Feminino',
    createdAt: new Date().toISOString()
  }
];

const today = new Date();

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: '101',
    patientId: '1',
    patientName: 'Maria Silva',
    date: setMinutes(setHours(today, 9), 0).toISOString(),
    durationMin: 60,
    procedure: 'Consulta Nutricional',
    status: Status.FINISHED,
    professional: 'Dr. André',
    specialty: 'nutricao'
  },
  {
    id: '102',
    patientId: '2',
    patientName: 'João Santos',
    date: setMinutes(setHours(today, 10), 30).toISOString(),
    durationMin: 30,
    procedure: 'Retorno',
    status: Status.IN_PROGRESS,
    professional: 'Dr. André',
    specialty: 'medicina'
  },
  {
    id: '103',
    patientId: '3',
    patientName: 'Ana Costa',
    date: setMinutes(setHours(today, 14), 0).toISOString(),
    durationMin: 60,
    procedure: 'Avaliação Inicial',
    status: Status.CONFIRMED,
    professional: 'Dra. Julia',
    specialty: 'medicina'
  },
   {
    id: '104',
    patientId: '1',
    patientName: 'Pedro Alves',
    date: setMinutes(setHours(today, 15), 30).toISOString(),
    durationMin: 45,
    procedure: 'Fisioterapia',
    status: Status.PENDING,
    professional: 'Dra. Julia',
    specialty: 'medicina'
  }
];

export const MOCK_TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 't1',
    date: subDays(today, 2),
    type: TimelineEventType.PRESCRIPTION,
    title: 'Prescrição Nutricional',
    description: 'Plano alimentar fase 1 - Adaptação metabólica.'
  },
  {
    id: 't2',
    date: subDays(today, 15),
    type: TimelineEventType.CONSULTATION,
    title: 'Consulta de Rotina',
    description: 'Paciente relata melhora na disposição. Queixa de inchaço reduzida.'
  },
  {
    id: 't3',
    date: subDays(today, 15),
    type: TimelineEventType.PHOTO,
    title: 'Foto de Evolução',
    description: 'Registro lateral e frontal.',
    details: 'https://picsum.photos/300/200?random=10'
  },
  {
    id: 't4',
    date: subDays(today, 45),
    type: TimelineEventType.EXAM,
    title: 'Exames de Sangue',
    description: 'Hemograma completo, Perfil Lipídico. Colesterol total levemente alterado.'
  },
  {
    id: 't5',
    date: subDays(today, 45),
    type: TimelineEventType.PAYMENT,
    title: 'Pagamento Recebido',
    description: 'R$ 350,00 via PIX.'
  }
];

export const MOCK_ANTHRO_DATA: AnthropometryData[] = [
  { date: '10/09', weight: 82, height: 1.65, imc: 30.1, waist: 98, hip: 110, bodyFat: 32 },
  { date: '10/10', weight: 79, height: 1.65, imc: 29.0, waist: 95, hip: 108, bodyFat: 30 },
  { date: '10/11', weight: 76, height: 1.65, imc: 27.9, waist: 91, hip: 105, bodyFat: 28 },
  { date: '10/12', weight: 74, height: 1.65, imc: 27.1, waist: 88, hip: 103, bodyFat: 26 },
];