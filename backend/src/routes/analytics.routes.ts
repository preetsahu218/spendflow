import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticateJwt } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJwt);

router.get('/dashboard', AnalyticsController.getDashboard);
router.get('/cashflow', AnalyticsController.getCashFlow);
router.get('/categories', AnalyticsController.getCategoryBreakdown);

export default router;
