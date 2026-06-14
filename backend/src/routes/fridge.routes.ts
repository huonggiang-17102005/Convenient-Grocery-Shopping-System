import { Router } from 'express';
import * as fridgeController from '../controllers/fridge.controller.js';

const router = Router();

// Lấy danh sách đồ trong tủ lạnh của một gia đình
// GET /api/fridge/family/:familyId
router.get('/family/:familyId', fridgeController.getByFamilyId);

// Trừ nguyên liệu từ tủ lạnh
// POST /api/fridge/deduct
router.post('/deduct', fridgeController.deduct);

export default router;
