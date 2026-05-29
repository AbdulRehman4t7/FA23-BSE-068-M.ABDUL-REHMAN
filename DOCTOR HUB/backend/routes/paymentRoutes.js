import express from 'express';
import {
  createPayment,
  getPendingPayments,
  verifyPayment,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';
import { upload } from '../config/multer.js';

const router = express.Router();

router.use(protect);

router.post('/', requireRole('patient'), upload.single('screenshot'), createPayment);
router.get('/pending', requireRole('assistant'), getPendingPayments);
router.patch('/:id/verify', requireRole('assistant'), verifyPayment);

export default router;
