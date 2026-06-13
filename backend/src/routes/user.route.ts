import express from 'express';
import { updateRole, getMe } from '../controllers/user.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Lấy thông tin user hiện tại (dùng token)
router.get('/me', authenticateToken, getMe);

// Route cập nhật vai trò, yêu cầu phải có Token hợp lệ
router.put('/role', authenticateToken, updateRole);

export default router;
