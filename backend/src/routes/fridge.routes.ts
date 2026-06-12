import { Router } from 'express';
import * as fridgeController from '../controllers/fridge.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

// GET /api/fridge/family/:familyId — Lấy danh sách đồ trong tủ lạnh của một gia đình
router.get('/family/:familyId', fridgeController.getByFamilyId);

// POST /api/fridge — Thêm thực phẩm vào tủ lạnh (upsert: cộng số lượng nếu đã tồn tại)
router.post('/', authenticateToken as any, fridgeController.addFridgeItem as any);

export default router;

