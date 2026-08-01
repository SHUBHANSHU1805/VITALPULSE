import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import patientRoutes from './routes/patient.routes';
import vitalsRoutes from './routes/vitals.routes';
import alertRoutes from './routes/alert.routes';
import consultationRoutes from './routes/consultation.routes';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/vitals', vitalsRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/consultations', consultationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'VitalPulse Backend API',
    timestamp: new Date().toISOString(),
  });
});

export default app;
