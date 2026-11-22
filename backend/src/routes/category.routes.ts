import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authenticateJwt } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJwt);

router.get('/', CategoryController.getCategories);
router.post('/', CategoryController.createCategory);
router.delete('/:id', CategoryController.deleteCategory);

export default router;
