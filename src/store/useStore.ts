import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Patient, Appointment, MedicalRecord, Status, SpecialtyType, RecordType } from '../types';

// Simple ID generator
const generateId = () => Math.random().toString(36).substring(2, 9);

interface AppState {
  // Data
  patients: Patient[];
  appointments: Appointment[];
  records: MedicalRecord[];
  currentUser: { name: string; role: string; specialty: SpecialtyType };

  // Actions
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt' | 'age'>) => void;
  updatePatient: (id: string, data: Partial<Patient>) => void;
  addAppointment: (apt: Omit<Appointment, 'id'>) => void;
  updateAppointmentStatus: (id: string, status: Status) => void;
  addRecord: (record: Omit<MedicalRecord, 'id' | 'date' | 'professional'>) => void;
  setSpecialty: (specialty: SpecialtyType) => void;
  
  // Computed (Getters)
  getPatientRecords: (patientId: string) => MedicalRecord[];
  getPatientAppointments: (patientId: string) => Appointment[];
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // --- INITIAL STATE (Seeded for demo) ---
      currentUser: {
        name: 'Dr. André',
        role: 'Especialista',
        specialty: 'medicina'
      },
      patients: [
        {
            id: 'p1',
            name: 'Maria Silva',
            birthDate: '1990-05-15',
            age: 35,
            phone: '(11) 99999-8888',
            email: 'maria.silva@email.com',
            avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
            gender: 'Feminino',
            tags: ['VIP', 'Cardio'],
            insurance: 'Unimed Black',
            createdAt: new Date().toISOString()
        },
        {
            id: 'p2',
            name: 'Carlos Mendes',
            birthDate: '1985-02-20',
            age: 40,
            phone: '(11) 98888-7777',
            email: 'carlos.m@email.com',
            avatar: 'https://i.pravatar.cc/150?u=a04258114e29026704d',
            gender: 'Masculino',
            tags: ['Particular', 'Cirurgia'],
            insurance: 'Particular',
            createdAt: new Date().toISOString()
        }
      ],
      appointments: [
          {
            id: 'a1',
            patientId: 'p1',
            patientName: 'Maria Silva',
            date: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(),
            durationMin: 60,
            procedure: 'Consulta Inicial',
            status: Status.CONFIRMED,
            professional: 'Dr. André',
            specialty: 'medicina'
          },
          {
            id: 'a2',
            patientId: 'p2',
            patientName: 'Carlos Mendes',
            date: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(),
            durationMin: 45,
            procedure: 'Retorno Pós-Op',
            status: Status.PENDING,
            professional: 'Dr. André',
            specialty: 'medicina'
          },
          {
            id: 'a3',
            patientId: 'p1',
            patientName: 'Maria Silva',
            date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(), // Tomorrow
            durationMin: 30,
            procedure: 'Exames',
            status: Status.CONFIRMED,
            professional: 'Dr. André',
            specialty: 'medicina'
          }
      ],
      records: [
          {
              id: 'r1',
              patientId: 'p1',
              date: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(),
              professional: 'Dr. André',
              type: RecordType.SOAP,
              specialty: 'medicina',
              subjective: 'Paciente relata cansaço moderado.',
              objective: 'PA 120/80, FC 72bpm.',
              assessment: 'Estresse ocupacional.',
              plan: 'Solicitado hemograma e repouso.'
          } as MedicalRecord
      ],

      // --- ACTIONS ---

      setSpecialty: (specialty) => {
        set((state) => ({
            currentUser: { ...state.currentUser, specialty }
        }));
      },

      addPatient: (data) => {
        const newPatient: Patient = {
            ...data,
            id: generateId(),
            createdAt: new Date().toISOString(),
            age: new Date().getFullYear() - new Date(data.birthDate).getFullYear()
        };
        set((state) => ({ patients: [...state.patients, newPatient] }));
      },

      updatePatient: (id, data) => {
        set((state) => ({
            patients: state.patients.map(p => p.id === id ? { ...p, ...data } : p)
        }));
      },

      addAppointment: (data) => {
        const newApt: Appointment = {
            ...data,
            id: generateId(),
        };
        set((state) => ({ appointments: [...state.appointments, newApt] }));
      },

      updateAppointmentStatus: (id, status) => {
        set((state) => ({
            appointments: state.appointments.map(a => a.id === id ? { ...a, status } : a)
        }));
      },

      addRecord: (data) => {
        const newRecord: MedicalRecord = {
            ...data,
            id: generateId(),
            date: new Date().toISOString(),
            professional: get().currentUser.name,
            type: data.type
        } as MedicalRecord;

        set((state) => ({ records: [newRecord, ...state.records] }));
      },

      // --- GETTERS ---
      getPatientRecords: (patientId) => {
          return get().records.filter(r => r.patientId === patientId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },

      getPatientAppointments: (patientId) => {
          return get().appointments.filter(a => a.patientId === patientId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }

    }),
    {
      name: 'genesis-storage-v1', // Updated key to ensure clean slate for new users
      storage: createJSONStorage(() => localStorage),
    }
  )
);