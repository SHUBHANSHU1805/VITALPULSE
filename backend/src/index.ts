import http from 'http';
import app from './app';
import { env } from './config/env';
import { initSocketService } from './services/socket.service';

const server = http.createServer(app);

// Initialize Socket.io real-time engine
initSocketService(server);

const PORT = env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 VitalPulse Backend API Server listening on port ${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});
