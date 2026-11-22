import { Router } from 'express';
import { ExpenseController } from '../controllers/expense.controller';
import { authenticateJwt } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import {
  createExpenseSchema,
  updateExpenseSchema,
  expenseQuerySchema,
} from '../validators/expense.validator';

const router = Router();

router.use(authenticateJwt);

router.get('/', validateRequest(expenseQuerySchema), ExpenseController.getExpenses);
router.get('/export/csv', ExpenseController.exportCsv);
router.get('/:id', ExpenseController.getExpenseById);
router.post('/', validateRequest(createExpenseSchema), ExpenseController.createExpense);
router.put('/:id', validateRequest(updateExpenseSchema), ExpenseController.updateExpense);
router.delete('/:id', ExpenseController.deleteExpense);

export default router;
