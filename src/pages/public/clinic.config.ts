/**
 * Clinic Profile Configuration
 *
 * Mock data and type definitions for public clinic pages.
 * Will be replaced with Firestore fetch in production.
 */

import type { SpecialtyType } from '@/types';

// ============================================================================
// Types
// ============================================================================

export interface PublicClinic {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo?: string;
  coverImage?: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  phone: string;
  email: string;
  website?: string;
  specialties: SpecialtyType[];
  services: string[];
  workingHours: { day: string; hours: string }[];
  rating?: number;
  reviewCount?: number;
  foundedYear?: number;
}

export interface ClinicProfessional {
  id: string;
  name: string;
  specialty: SpecialtyType;
  avatar?: string;
  bio?: string;
  credentials?: string[];
}

// ============================================================================
// Mock Data
// ============================================================================

export const MOCK_CLINIC: PublicClinic = {
  id: 'genesis-main',
  name: 'Clínica Genesis',
  slug: 'clinica-genesis',
  description:
    'A Clínica Genesis oferece atendimento integrado em saúde, unindo medicina, nutrição e psicologia para cuidar de você de forma completa. Nossa equipe de profissionais qualificados está comprometida com seu bem-estar.',
  address: {
    street: 'Av. Paulista',
    number: '1000',
    complement: 'Sala 1501',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01310-100',
  },
  phone: '(11) 3000-0000',
  email: 'contato@clinicagenesis.com.br',
  website: 'https://clinicagenesis.com.br',
  specialties: ['medicina', 'nutricao', 'psicologia'],
  services: [
    'Consultas médicas',
    'Avaliação nutricional',
    'Psicoterapia',
    'Check-up completo',
    'Acompanhamento multidisciplinar',
    'Teleconsulta',
    'Exames laboratoriais',
    'Planos de tratamento personalizados',
  ],
  workingHours: [
    { day: 'Segunda a Sexta', hours: '08:00 - 20:00' },
    { day: 'Sábado', hours: '08:00 - 14:00' },
    { day: 'Domingo', hours: 'Fechado' },
  ],
  rating: 4.9,
  reviewCount: 247,
  foundedYear: 2018,
};

export const MOCK_PROFESSIONALS: ClinicProfessional[] = [
  {
    id: 'doc-1',
    name: 'Dra. Ana Carolina Santos',
    specialty: 'medicina',
    bio: 'Especialista em Clínica Médica com foco em medicina preventiva e qualidade de vida.',
    credentials: ['CRM-SP 123456', 'Residência em Clínica Médica - USP'],
  },
  {
    id: 'doc-2',
    name: 'Dr. Roberto Oliveira',
    specialty: 'medicina',
    bio: 'Cardiologista com mais de 15 anos de experiência em prevenção cardiovascular.',
    credentials: ['CRM-SP 654321', 'Título de Especialista em Cardiologia - SBC'],
  },
  {
    id: 'nut-1',
    name: 'Dra. Mariana Costa',
    specialty: 'nutricao',
    bio: 'Nutricionista funcional especializada em emagrecimento saudável e nutrição esportiva.',
    credentials: ['CRN-3 12345', 'Pós-graduação em Nutrição Funcional'],
  },
  {
    id: 'psi-1',
    name: 'Dr. Fernando Mendes',
    specialty: 'psicologia',
    bio: 'Psicólogo clínico com abordagem cognitivo-comportamental, especialista em ansiedade e depressão.',
    credentials: ['CRP-06 98765', 'Especialista em TCC - CFP'],
  },
];
