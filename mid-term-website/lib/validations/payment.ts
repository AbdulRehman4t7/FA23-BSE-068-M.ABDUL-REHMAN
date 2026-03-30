import { z } from 'zod';

export const submitPaymentSchema = z.object({
  ad_id: z.string().min(1, 'Invalid ad id'),
  amount: z.preprocess(
    (v) => (typeof v === 'string' ? Number(v) : v),
    z.number().positive('Amount must be greater than zero')
  ),
  method: z.string().min(1, 'Payment method is required'),
  transaction_ref: z.string().min(3, 'Transaction reference is too short'),
  sender_name: z.string().min(2, 'Sender name is required'),
  screenshot_url: z.string().min(1).url('Invalid screenshot URL').optional(),
});

export const updatePaymentStatusSchema = z.object({
  status: z.enum(['VERIFIED', 'REJECTED']),
  note: z.string().max(500).optional(),
});
