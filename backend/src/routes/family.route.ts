import express from 'express';
import { createFamily, joinFamily, getFamilyInfo } from '../controllers/family.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Sử dụng as any để tránh TS báo đỏ do khác biệt giữa AuthRequest và Request của Express
router.post('/create', authenticateToken as any, createFamily as any);
router.post('/join', authenticateToken as any, joinFamily as any);
router.get('/info', authenticateToken as any, getFamilyInfo as any);

export default router;
