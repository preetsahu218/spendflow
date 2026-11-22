import { z } from 'zod';

export const createBudgetSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid('Invalid category ID'),
    month: z.number().int().min(1).max(12),
    year: z.number().int().min(2020).max(2100),
    amountLimit: z.number().positive('Budget limit must be greater than zero'),
    alertThreshold: z.number().min(1).max(100).optional().default(80.0),
  }),
});

export const updateBudgetSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid budget ID'),
  }),
  body: z.object({
    amountLimit: z.number().positive().optional(),
    alertThreshold: z.number().min(1).max(100).optional(),
  }),
});
