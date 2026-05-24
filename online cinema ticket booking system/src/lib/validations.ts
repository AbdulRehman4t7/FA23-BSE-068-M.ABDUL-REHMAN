import { z } from 'zod';
import { normalizePkMobile } from '@/lib/jazzcash-client';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Invalid email address'),
  phone: z.string().trim().min(10, 'Phone must be at least 10 digits').max(15),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const movieSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  genre: z.string().trim().min(1, 'Genre is required'),
  duration: z.coerce.number().int().min(1, 'Duration must be positive'),
  rating: z.string().trim().min(1, 'Rating is required'),
  description: z.string().trim().max(2000).optional(),
  poster_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

export type MovieFormData = z.infer<typeof movieSchema>;

export const showtimeSchema = z.object({
  movie_id: z.string().uuid('Select a movie'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  hall_number: z.coerce.number().int().min(1, 'Hall number must be positive'),
  price_per_seat: z.coerce.number().min(1, 'Price must be positive'),
});

export type ShowtimeFormData = z.infer<typeof showtimeSchema>;

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().trim().min(10, 'Phone must be at least 10 digits').max(15),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmNewPassword: z.string(),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: 'Passwords do not match',
  path: ['confirmNewPassword'],
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export const paymentSchema = z.object({
  cardNumber: z.string().min(16, 'Card number must be 16 digits').max(19),
  cardName: z.string().min(2, 'Name on card is required'),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, 'Invalid expiry date (MM/YY)'),
  cvv: z.string().min(3, 'CVV must be 3 digits').max(4),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;

export const jazzcashPaymentSchema = z
  .object({
    mobileNumber: z.string().trim().min(10, 'Mobile number is required'),
    cnicLast6: z
      .string()
      .trim()
      .regex(/^\d{6}$/, 'Enter last 6 digits of CNIC'),
  })
  .superRefine((data, ctx) => {
    const mob = normalizePkMobile(data.mobileNumber);
    if (!/^03\d{9}$/.test(mob)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Use JazzCash mobile format 03XXXXXXXXX',
        path: ['mobileNumber'],
      });
    }
  });

export type JazzCashPaymentFormData = z.infer<typeof jazzcashPaymentSchema>;
