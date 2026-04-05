import { z } from 'zod';

export const createAdSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  price: z.number().positive().optional(),
  category_id: z.string().min(1, 'Category is required'),
  city_id: z.string().min(1, 'City is required'),
  package_id: z.string().min(1, 'Package is required'),
  mediaUrls: z.array(z.string().min(1, 'Invalid media URL')).optional(),
});

export const updateAdStatusSchema = z.object({
  status: z.enum(['SUBMITTED']),
  note: z.string().max(500).optional(),
});
