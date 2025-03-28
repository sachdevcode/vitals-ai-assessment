import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Protected route - requires API key
router.post('/sync', authMiddleware, userController.syncUsers);

// Public routes - no auth required
router.get('/', userController.getAllUsers);

export default router; 