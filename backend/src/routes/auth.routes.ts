import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateJwt } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { registerSchema, loginSchema, updateProfileSchema } from '../validators/auth.validator';

const router = Router();

router.post('/register', validateRequest(registerSchema), AuthController.register);
router.post('/login', validateRequest(loginSchema), AuthController.login);
router.get('/me', authenticateJwt, AuthController.getProfile);
router.put('/me', authenticateJwt, validateRequest(updateProfileSchema), AuthController.updateProfile);

export default router;
