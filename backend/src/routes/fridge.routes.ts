import { Router } from 'express';
import * as fridgeController from '../controllers/fridge.controller.js';

const router = Router();

// Lấy danh sách đồ trong tủ lạnh của một gia đình
router.get('/family/:familyId', fridgeController.getByFamilyId);

// Lấy danh sách đồ sắp hoặc đã hết hạn
router.get('/family/:familyId/expiring', fridgeController.getExpiring);

// Thêm nguyên liệu mới vào tủ lạnh
router.post('/', fridgeController.addItem);

// Cập nhật nguyên liệu (số lượng/thông tin)
router.put('/:id', fridgeController.updateItem);

// Vứt nguyên liệu vào thùng rác
router.delete('/:id/waste', fridgeController.wasteItem);

// Trừ nguyên liệu từ tủ lạnh
router.post('/deduct', fridgeController.deduct);

// Gọi bởi Vercel Cronjob (GET để tương thích Vercel)
router.get('/cron/check-expired', fridgeController.runCron);

export default router;
