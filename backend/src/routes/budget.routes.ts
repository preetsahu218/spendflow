import { Router } from 'express';
import { BudgetController } from '../controllers/budget.controller';
import { authenticateJwt } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { createBudgetSchema, updateBudgetSchema } from '../validators/budget.validator';

const router = Router();

router.use(authenticateJwt);

router.get('/', BudgetController.getBudgets);
router.post('/', validateRequest(createBudgetSchema), BudgetController.createOrUpdateBudget);
router.delete('/:id', BudgetController.deleteBudget);

export default router;
