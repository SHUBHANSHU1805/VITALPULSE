import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { getMLRiskScore } from './mlClient.service';

const prisma = new PrismaClient();

let io: SocketIOServer | null = null;
let simulationInterval: NodeJS.Timeout | null = null;

export const initSocketService = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[WebSocket] Clinician connected: ${socket.id}`);

    socket.on('subscribe_patient', (patientId: string) => {
      socket.join(`patient_${patientId}`);
      console.log(`[WebSocket] Socket ${socket.id} subscribed to patient_${patientId}`);
    });

    socket.on('unsubscribe_patient', (patientId: string) => {
      socket.leave(`patient_${patientId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[WebSocket] Clinician disconnected: ${socket.id}`);
    });
  });

  startVitalsSimulator();
};

const startVitalsSimulator = () => {
  if (simulationInterval) clearInterval(simulationInterval);

  simulationInterval = setInterval(async () => {
    try {
      const patients = await prisma.patient.findMany({
        take: 10,
      });

      for (const patient of patients) {
        // Fetch latest vital record to fluctuate from
        const latestVital = await prisma.vitalRecord.findFirst({
          where: { patientId: patient.id },
          orderBy: { recordedAt: 'desc' },
        });

        const baseHR = latestVital ? latestVital.heartRate : 75;
        const baseSpo2 = latestVital ? latestVital.spo2 : 98;
        const baseSys = latestVital ? latestVital.bpSystolic : 120;
        const baseDia = latestVital ? latestVital.bpDiastolic : 80;
        const baseTemp = latestVital ? latestVital.temperature : 36.8;

        // Apply realistic small random walk variation
        const heartRate = Math.round(Math.min(Math.max(baseHR + (Math.random() * 4 - 2), 50), 160) * 10) / 10;
        const spo2 = Math.round(Math.min(Math.max(baseSpo2 + (Math.random() * 1.5 - 0.7), 84), 100) * 10) / 10;
        const bpSystolic = Math.round(Math.min(Math.max(baseSys + (Math.random() * 4 - 2), 90), 190));
        const bpDiastolic = Math.round(Math.min(Math.max(baseDia + (Math.random() * 2 - 1), 60), 120));
        const temperature = Math.round(Math.min(Math.max(baseTemp + (Math.random() * 0.2 - 0.1), 35.5), 40.5) * 10) / 10;

        const newRecord = await prisma.vitalRecord.create({
          data: {
            patientId: patient.id,
            heartRate,
            bpSystolic,
            bpDiastolic,
            spo2,
            temperature,
            source: 'SIMULATED',
          },
        });

        // Broadcast to patient detail rooms and overall monitoring room
        if (io) {
          io.to(`patient_${patient.id}`).emit('vitals_update', newRecord);
          io.emit('patient_telemetry_ping', {
            patientId: patient.id,
            vitals: newRecord,
          });
        }

        // Anomaly & Threshold Alert Triggering Logic
        if (spo2 < 90 || heartRate > 125 || bpSystolic > 160) {
          let severity = 'HIGH';
          let msg = `Vitals Anomaly: Patient ${patient.name} - `;
          if (spo2 < 88) {
            severity = 'CRITICAL';
            msg += `Severe Hypoxia SpO2 (${spo2}%)`;
          } else if (heartRate > 130) {
            severity = 'CRITICAL';
            msg += `Acute Tachycardia (${heartRate} bpm)`;
          } else {
            msg += `Abnormal metrics (SpO2 ${spo2}%, HR ${heartRate} bpm, BP ${bpSystolic}/${bpDiastolic})`;
          }

          const alert = await prisma.alert.create({
            data: {
              patientId: patient.id,
              type: 'THRESHOLD',
              severity,
              message: msg,
            },
          });

          if (io) {
            io.emit('new_alert', {
              ...alert,
              patientName: patient.name,
              roomNumber: patient.roomNumber,
            });
          }
        }

        // Periodically update ML Risk Score
        const riskRes = await getMLRiskScore({
          patientId: patient.id,
          age: patient.age,
          heartRate,
          bpSystolic,
          bpDiastolic,
          spo2,
          temperature,
        });

        await prisma.riskScore.create({
          data: {
            patientId: patient.id,
            score: riskRes.score,
            level: riskRes.level,
            topFactors: JSON.stringify(riskRes.topFactors),
          },
        });
      }
    } catch (err) {
      console.error('[Vitals Simulator] Error updating vitals:', err);
    }
  }, 5000); // simulate update every 5s
};

export const getIO = () => io;
