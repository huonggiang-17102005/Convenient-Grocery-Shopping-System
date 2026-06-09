import express from 'express';
import { updateRole } from '../controllers/user.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Route cập nhật vai trò, yêu cầu phải có Token hợp lệ
router.put('/role', authenticateToken, updateRole);

export default router;
