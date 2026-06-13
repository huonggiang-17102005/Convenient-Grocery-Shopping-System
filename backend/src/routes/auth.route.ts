import express from 'express';
import { register, login } from '../controllers/auth.controller.js';
import { getMe, updateRole } from '../controllers/user.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken as any, getMe as any);
router.put('/role', authenticateToken as any, updateRole as any);

export default router;
