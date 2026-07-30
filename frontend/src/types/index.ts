export type Role = 'DOCTOR' | 'ADMIN' | 'PATIENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface VitalRecord {
  id: string;
  patientId: string;
  heartRate: number;
  bpSystolic: number;
  bpDiastolic: number;
  spo2: number;
  temperature: number;
  glucose?: number | null;
  recordedAt: string;
  source: 'MANUAL' | 'SIMULATED';
}

export interface MedicalHistory {
  id: string;
  patientId: string;
  condition: string;
  diagnosedDate: string;
  notes?: string;
  medications: string[];
}

export interface DiagnosticReport {
  id: string;
  patientId: string;
  title: string;
  fileUrl: string;
  fileType: string;
  summary?: string;
  uploadedAt: string;
}

export interface Alert {
  id: string;
  patientId: string;
  patientName?: string;
  roomNumber?: string;
  type: 'THRESHOLD' | 'ANOMALY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  triggeredAt: string;
  resolved: boolean;
  patient?: {
    id: string;
    name: string;
    roomNumber?: string;
    ward?: string;
  };
}

export interface RiskFactor {
  feature: string;
  contribution: number;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  bloodType?: string;
  roomNumber?: string;
  ward?: string;
  phone?: string;
  latestVital?: VitalRecord | null;
  activeAlertCount?: number;
  riskScore: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  topFactors?: RiskFactor[];
  vitals?: VitalRecord[];
  medicalHistories?: MedicalHistory[];
  reports?: DiagnosticReport[];
  alerts?: Alert[];
  consultations?: Consultation[];
}

export interface Consultation {
  id: string;
  patientId: string;
  doctorId: string;
  scheduledAt: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  prescription?: string;
  patient?: {
    id: string;
    name: string;
    roomNumber?: string;
    ward?: string;
    bloodType?: string;
  };
  doctor?: {
    id: string;
    name: string;
    email: string;
  };
}
