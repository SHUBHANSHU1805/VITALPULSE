import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { Patient, Alert, Consultation, VitalRecord } from '../types';

const API_BASE_URL = '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT Bearer token to all requests automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vitalpulse_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Socket.io singleton connection
let socketInstance: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socketInstance) {
    socketInstance = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
  }
  return socketInstance;
};

// API Methods
export const PatientService = {
  getAllPatients: async (params?: { search?: string; ward?: string; minRiskScore?: number }) => {
    const res = await api.get<Patient[]>('/patients', { params });
    return res.data;
  },
  getPatientById: async (id: string) => {
    const res = await api.get<Patient>(`/patients/${id}`);
    return res.data;
  },
  createPatient: async (data: Partial<Patient>) => {
    const res = await api.post<Patient>('/patients', data);
    return res.data;
  },
};

export const VitalsService = {
  getVitalsHistory: async (patientId: string, limit = 50) => {
    const res = await api.get<VitalRecord[]>(`/vitals/${patientId}?limit=${limit}`);
    return res.data;
  },
  addVitalRecord: async (patientId: string, vitals: Partial<VitalRecord>) => {
    const res = await api.post<VitalRecord>(`/vitals/${patientId}`, vitals);
    return res.data;
  },
};

export const AlertService = {
  getAlerts: async (params?: { resolved?: boolean; severity?: string }) => {
    const res = await api.get<Alert[]>('/alerts', { params });
    return res.data;
  },
  resolveAlert: async (id: string) => {
    const res = await api.patch<Alert>(`/alerts/${id}/resolve`);
    return res.data;
  },
};

export const ConsultationService = {
  getConsultations: async () => {
    const res = await api.get<Consultation[]>('/consultations');
    return res.data;
  },
  scheduleConsultation: async (data: { patientId: string; scheduledAt: string; notes?: string }) => {
    const res = await api.post<Consultation>('/consultations', data);
    return res.data;
  },
  updateConsultation: async (id: string, updates: Partial<Consultation>) => {
    const res = await api.patch<Consultation>(`/consultations/${id}`, updates);
    return res.data;
  },
};
