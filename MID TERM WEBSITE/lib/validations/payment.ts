import { z } from 'zod';

export const submitPaymentSchema = z.object({
  ad_id: z.string().uuid('Invalid ad id'),
  amount: z.number().positive('Amount must be greater than zero'),
  method: z.string().min(1, 'Payment method is required'),
  transaction_ref: z.string().min(5, 'Transaction reference is too short'),
  sender_name: z.string().min(2, 'Sender name is required'),
  screenshot_url: z.string().url('Invalid screenshot URL'),
});

export const updatePaymentStatusSchema = z.object({
  status: z.enum(['VERIFIED', 'REJECTED']),
  note: z.string().max(500).optional(),
});
