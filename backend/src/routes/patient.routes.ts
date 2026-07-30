import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// GET /api/patients - Get all patients with search & filtering
router.get('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, ward, minRiskScore, maxRiskScore } = req.query;

    const whereClause: any = {};

    if (search) {
      const q = String(search);
      whereClause.OR = [
        { name: { contains: q } },
        { roomNumber: { contains: q } },
        { ward: { contains: q } },
      ];
    }

    if (ward && ward !== 'ALL') {
      whereClause.ward = String(ward);
    }

    const patients = await prisma.patient.findMany({
      where: whereClause,
      include: {
        vitals: {
          orderBy: { recordedAt: 'desc' },
          take: 1,
        },
        alerts: {
          where: { resolved: false },
          orderBy: { triggeredAt: 'desc' },
        },
        riskScores: {
          orderBy: { computedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { name: 'asc' },
    });

    // Format & filter by risk score if provided
    let result = patients.map((p) => {
      const latestVital = p.vitals[0] || null;
      const latestRisk = p.riskScores[0] || null;
      return {
        id: p.id,
        name: p.name,
        age: p.age,
        gender: p.gender,
        bloodType: p.bloodType,
        roomNumber: p.roomNumber,
        ward: p.ward,
        latestVital,
        activeAlertCount: p.alerts.length,
        riskScore: latestRisk ? latestRisk.score : 20,
        riskLevel: latestRisk ? latestRisk.level : 'LOW',
        topFactors: latestRisk ? JSON.parse(latestRisk.topFactors || '[]') : [],
      };
    });

    if (minRiskScore) {
      const min = Number(minRiskScore);
      result = result.filter((p) => p.riskScore >= min);
    }

    if (maxRiskScore) {
      const max = Number(maxRiskScore);
      result = result.filter((p) => p.riskScore <= max);
    }

    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/patients/:id - Get patient detailed profile
router.get('/:id', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        vitals: {
          orderBy: { recordedAt: 'desc' },
          take: 50,
        },
        medicalHistories: {
          orderBy: { diagnosedDate: 'desc' },
        },
        reports: {
          orderBy: { uploadedAt: 'desc' },
        },
        alerts: {
          orderBy: { triggeredAt: 'desc' },
          take: 20,
        },
        riskScores: {
          orderBy: { computedAt: 'desc' },
          take: 10,
        },
        consultations: {
          orderBy: { scheduledAt: 'desc' },
        },
      },
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const latestRisk = patient.riskScores[0] || null;

    // Parse nested stringified JSON fields safely
    const formattedHistory = patient.medicalHistories.map((h) => ({
      ...h,
      medications: JSON.parse(h.medications || '[]'),
    }));

    return res.json({
      ...patient,
      medicalHistories: formattedHistory,
      currentRiskScore: latestRisk ? latestRisk.score : 15,
      currentRiskLevel: latestRisk ? latestRisk.level : 'LOW',
      currentRiskFactors: latestRisk ? JSON.parse(latestRisk.topFactors || '[]') : [],
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/patients - Register new patient
router.post('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, age, gender, bloodType, phone, roomNumber, ward } = req.body;

    if (!name || !age || !gender) {
      return res.status(400).json({ error: 'Missing patient basic details' });
    }

    const patient = await prisma.patient.create({
      data: {
        name,
        age: Number(age),
        gender,
        bloodType,
        phone,
        roomNumber: roomNumber || 'ICU-101',
        ward: ward || 'ICU',
        assignedDoctorId: req.user?.id,
      },
    });

    // Create initial baseline vitals
    await prisma.vitalRecord.create({
      data: {
        patientId: patient.id,
        heartRate: 72,
        bpSystolic: 120,
        bpDiastolic: 80,
        spo2: 98,
        temperature: 36.8,
        source: 'MANUAL',
      },
    });

    return res.status(201).json(patient);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
