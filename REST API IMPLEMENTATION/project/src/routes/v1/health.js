import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

router.get('/ready', async (req, res) => {
  res.json({ ready: true });
});

export default router;
