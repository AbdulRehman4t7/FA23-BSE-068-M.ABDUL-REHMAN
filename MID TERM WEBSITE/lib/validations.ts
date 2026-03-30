import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  full_name: z.string().min(3, "Full name is required"),
});

export const adSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  category_slug: z.string(),
  city_slug: z.string(),
  price: z.number().positive(),
  package_id: z.string(),
  contact_phone: z.string().regex(/^03\d{9}$/, "Invalid Pakistani phone number"),
});

export const paymentSchema = z.object({
  ad_id: z.string().uuid(),
  amount: z.number().positive(),
  payment_method: z.string(),
  transaction_id: z.string().min(5),
});

export const reviewSchema = z.object({
  ad_id: z.string().uuid(),
  action: z.enum(["approve", "reject"]),
  rejection_reason: z.string().optional(),
});
