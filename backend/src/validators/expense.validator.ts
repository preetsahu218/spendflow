import { z } from 'zod';

export const createExpenseSchema = z.object({
  body: z.object({
    amount: z.number().positive('Amount must be positive'),
    type: z.enum(['EXPENSE', 'INCOME']).default('EXPENSE'),
    categoryId: z.string().uuid('Invalid category ID'),
    description: z.string().min(1, 'Description is required').max(255),
    date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
    paymentMethod: z.enum(['CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'OTHER']).default('CARD'),
    isRecurring: z.boolean().optional().default(false),
    recurrenceInterval: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).optional().nullable(),
    notes: z.string().max(1000).optional().nullable(),
    receiptUrl: z.string().url().optional().nullable(),
  }),
});

export const updateExpenseSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid expense ID'),
  }),
  body: z.object({
    amount: z.number().positive().optional(),
    type: z.enum(['EXPENSE', 'INCOME']).optional(),
    categoryId: z.string().uuid().optional(),
    description: z.string().min(1).max(255).optional(),
    date: z.string().optional(),
    paymentMethod: z.enum(['CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'OTHER']).optional(),
    isRecurring: z.boolean().optional(),
    recurrenceInterval: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).optional().nullable(),
    notes: z.string().max(1000).optional().nullable(),
    receiptUrl: z.string().url().optional().nullable(),
  }),
});

export const expenseQuerySchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    categoryId: z.string().optional(),
    type: z.enum(['EXPENSE', 'INCOME']).optional(),
    search: z.string().optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default('20'),
    sortBy: z.enum(['date', 'amount', 'createdAt']).optional().default('date'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});
