import { Router } from 'express';
import { GroupController } from '../controllers/group.controller';
import { authenticateJwt } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import {
  createGroupSchema,
  joinGroupSchema,
  addSharedExpenseSchema,
  recordSettlementSchema,
} from '../validators/group.validator';

const router = Router();

router.use(authenticateJwt);

router.get('/', GroupController.getUserGroups);
router.post('/', validateRequest(createGroupSchema), GroupController.createGroup);
router.post('/join', validateRequest(joinGroupSchema), GroupController.joinGroup);
router.get('/:id', GroupController.getGroupById);
router.get('/:id/balances', GroupController.getGroupBalances);
router.post('/:id/expenses', validateRequest(addSharedExpenseSchema), GroupController.addSharedExpense);
router.post('/:id/settle', validateRequest(recordSettlementSchema), GroupController.recordSettlement);

export default router;
