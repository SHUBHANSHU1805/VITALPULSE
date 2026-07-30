import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// GET /api/alerts - Fetch all active and recent clinical alerts
router.get('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { resolved, severity } = req.query;

    const where: any = {};
    if (resolved !== undefined) {
      where.resolved = resolved === 'true';
    }
    if (severity) {
      where.severity = String(severity);
    }

    const alerts = await prisma.alert.findMany({
      where,
      include: {
        patient: {
          select: { id: true, name: true, roomNumber: true, ward: true },
        },
      },
      orderBy: { triggeredAt: 'desc' },
      take: 50,
    });

    return res.json(alerts);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PATCH /api/alerts/:id/resolve - Resolve a clinical alert
router.patch('/:id/resolve', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const updated = await prisma.alert.update({
      where: { id },
      data: { resolved: true },
    });

    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
