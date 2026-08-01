import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: process.env.PORT || '5000',
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
  JWT_SECRET: process.env.JWT_SECRET || 'vitalpulse_super_secret_jwt_key_2026',
  ML_SERVICE_URL: process.env.ML_SERVICE_URL || 'http://localhost:8000',
};
