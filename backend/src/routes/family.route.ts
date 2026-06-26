import express from 'express';
import { 
  createFamily, joinFamily, getFamilyInfo, updateFamilyInfo,
  getMembers, leaveFamily, removeMember, transferHomemaker, getWasteStats, updateWarningDays
} from '../controllers/family.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Sử dụng as any để tránh TS báo đỏ do khác biệt giữa AuthRequest và Request của Express
router.post('/create', authenticateToken as any, createFamily as any);
router.post('/join', authenticateToken as any, joinFamily as any);
router.get('/info', authenticateToken as any, getFamilyInfo as any);
router.put('/info', authenticateToken as any, updateFamilyInfo as any);

router.get('/members', authenticateToken as any, getMembers as any);
router.delete('/leave', authenticateToken as any, leaveFamily as any);
router.delete('/members/:userId', authenticateToken as any, removeMember as any);
router.put('/transfer-homemaker', authenticateToken as any, transferHomemaker as any);
router.get('/waste-stats', authenticateToken as any, getWasteStats as any);
router.put('/warning-days', authenticateToken as any, updateWarningDays as any);

export default router;
