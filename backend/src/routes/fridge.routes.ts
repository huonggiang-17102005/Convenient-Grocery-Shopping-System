import { Router } from 'express';
import * as fridgeController from '../controllers/fridge.controller.js';

const router = Router();

// Lấy danh sách đồ trong tủ lạnh của một gia đình
// GET /api/fridge/family/:familyId
router.get('/family/:familyId', fridgeController.getByFamilyId);

// Lấy danh sách đồ sắp hoặc đã hết hạn
// GET /api/fridge/family/:familyId/expiring
router.get('/family/:familyId/expiring', fridgeController.getExpiring);

// Thêm nguyên liệu mới vào tủ lạnh
// POST /api/fridge
router.post('/', fridgeController.addItem);

// Cập nhật nguyên liệu (số lượng/thông tin)
// PUT /api/fridge/:id
router.put('/:id', fridgeController.updateItem);

// Vứt nguyên liệu vào thùng rác
// DELETE /api/fridge/:id/waste
router.delete('/:id/waste', fridgeController.wasteItem);

// Trừ nguyên liệu từ tủ lạnh
// POST /api/fridge/deduct
router.post('/deduct', fridgeController.deduct);

export default router;
