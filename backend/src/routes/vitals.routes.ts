import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// GET /api/vitals/:patientId - Fetch vitals history for a patient
router.get('/:patientId', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { patientId } = req.params;
    const limit = Number(req.query.limit) || 100;

    const records = await prisma.vitalRecord.findMany({
      where: { patientId },
      orderBy: { recordedAt: 'asc' },
      take: limit,
    });

    return res.json(records);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/vitals/:patientId - Record manual vitals entry
router.post('/:patientId', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { patientId } = req.params;
    const { heartRate, bpSystolic, bpDiastolic, spo2, temperature, glucose } = req.body;

    const record = await prisma.vitalRecord.create({
      data: {
        patientId,
        heartRate: Number(heartRate),
        bpSystolic: Number(bpSystolic),
        bpDiastolic: Number(bpDiastolic),
        spo2: Number(spo2),
        temperature: Number(temperature),
        glucose: glucose ? Number(glucose) : null,
        source: 'MANUAL',
      },
    });

    return res.status(201).json(record);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
