import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize with project ID - uses ADC
initializeApp({ projectId: 'clinica-genesis-os-e689e' });
const db = getFirestore();

const testData = {
  clinicId: 'test-e2e-clinic',
  patientId: 'test-patient-001',
  physicianId: 'test-physician',
  patientContext: {
    age: 45,
    sex: 'male',
    chiefComplaint: 'Fadiga e sede excessiva',
    relevantHistory: ['Obesidade', 'Hipertensão'],
    currentMedications: ['Losartana 50mg']
  },
  labResults: [
    { name: 'Glicose', value: '142', unit: 'mg/dL' },
    { name: 'HbA1c', value: '7.2', unit: '%' },
    { name: 'Colesterol Total', value: '245', unit: 'mg/dL' },
    { name: 'LDL', value: '165', unit: 'mg/dL' },
    { name: 'HDL', value: '38', unit: 'mg/dL' },
    { name: 'Triglicerídeos', value: '210', unit: 'mg/dL' },
    { name: 'TSH', value: '4.8', unit: 'mUI/L' }
  ],
  source: 'manual',
  status: 'pending',
  createdAt: new Date().toISOString()
};

const docRef = await db
  .collection('clinics')
  .doc('test-e2e-clinic')
  .collection('labAnalysisSessions')
  .add(testData);

console.log('✅ Test session created:', docRef.id);
console.log('⏳ Function triggered, check logs in 10-20s...');
