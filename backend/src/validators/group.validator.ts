import { z } from 'zod';

export const createGroupSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Group name must be at least 2 characters').max(100),
    description: z.string().max(500).optional(),
    currency: z.string().length(3).optional().default('USD'),
  }),
});

export const joinGroupSchema = z.object({
  body: z.object({
    inviteCode: z.string().min(6, 'Invite code must be at least 6 characters'),
  }),
});

export const addSharedExpenseSchema = z.object({
  body: z.object({
    amount: z.number().positive('Expense amount must be positive'),
    description: z.string().min(1, 'Description is required').max(255),
    date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
    category: z.string().default('General'),
    splitType: z.enum(['EQUAL', 'EXACT', 'PERCENTAGE', 'SHARES']).default('EQUAL'),
    notes: z.string().max(1000).optional().nullable(),
    paidById: z.string().uuid().optional(), // if not provided, defaults to authenticated user
    splits: z.array(
      z.object({
        userId: z.string().uuid(),
        amountOwed: z.number().min(0).optional(),
        percentage: z.number().min(0).max(100).optional(),
        shares: z.number().min(0).optional(),
      })
    ).min(1, 'At least one participant must be included in splits'),
  }),
});

export const recordSettlementSchema = z.object({
  body: z.object({
    payeeId: z.string().uuid('Invalid payee user ID'),
    amount: z.number().positive('Settlement amount must be positive'),
    date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
    notes: z.string().max(500).optional(),
  }),
});
