import 'dotenv/config';
import http from 'http';
import app from './app.js';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`REST API running at http://localhost:${PORT}/api/v1/health`);
});
