import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// GET /api/consultations - Fetch doctor's consultations
router.get('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const consultations = await prisma.consultation.findMany({
      include: {
        patient: {
          select: { id: true, name: true, roomNumber: true, ward: true, bloodType: true },
        },
        doctor: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });

    return res.json(consultations);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/consultations - Schedule new consultation
router.post('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { patientId, scheduledAt, notes } = req.body;

    if (!patientId || !scheduledAt) {
      return res.status(400).json({ error: 'Patient ID and scheduled date are required' });
    }

    const consultation = await prisma.consultation.create({
      data: {
        patientId,
        doctorId: req.user?.id || '',
        scheduledAt: new Date(scheduledAt),
        notes,
        status: 'SCHEDULED',
      },
    });

    return res.status(201).json(consultation);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PATCH /api/consultations/:id - Update consultation notes, prescription, or status
router.patch('/:id', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes, prescription } = req.body;

    const updated = await prisma.consultation.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(prescription !== undefined && { prescription }),
      },
    });

    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
