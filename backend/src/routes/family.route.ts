import { Router } from 'express';
import { createFamily } from '../controllers/family.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/create', authenticateToken, createFamily);

export default router;
