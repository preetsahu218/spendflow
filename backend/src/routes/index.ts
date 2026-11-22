import { Router } from 'express';
import authRoutes from './auth.routes';
import expenseRoutes from './expense.routes';
import categoryRoutes from './category.routes';
import budgetRoutes from './budget.routes';
import groupRoutes from './group.routes';
import analyticsRoutes from './analytics.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/expenses', expenseRoutes);
router.use('/categories', categoryRoutes);
router.use('/budgets', budgetRoutes);
router.use('/groups', groupRoutes);
router.use('/analytics', analyticsRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;
