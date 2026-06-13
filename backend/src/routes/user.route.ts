import express from 'express';
import { getMe, updateRole, updateProfile, updateAvatar, updatePassword } from '../controllers/user.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Lấy thông tin user hiện tại
router.get('/me', authenticateToken as any, getMe as any);

// Cập nhật vai trò
router.put('/role', authenticateToken as any, updateRole as any);

// Cập nhật Profile
router.put('/profile', authenticateToken as any, updateProfile as any);
router.put('/avatar', authenticateToken as any, updateAvatar as any);
router.put('/password', authenticateToken as any, updatePassword as any);

export default router;
