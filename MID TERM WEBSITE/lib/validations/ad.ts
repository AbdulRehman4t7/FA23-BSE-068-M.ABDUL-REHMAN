import { z } from 'zod';

export const createAdSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  category_id: z.string().uuid('Invalid category id'),
  city_id: z.string().uuid('Invalid city id'),
  package_id: z.string().uuid('Invalid package id'),
  mediaUrls: z.array(z.string().url('Invalid media URL')).optional(),
});

export const updateAdStatusSchema = z.object({
  status: z.enum(['SUBMITTED', 'PAYMENT_SUBMITTED', 'PAYMENT_PENDING', 'DRAFT']),
  note: z.string().max(500).optional(),
});
