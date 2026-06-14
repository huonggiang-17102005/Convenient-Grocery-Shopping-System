import { Router } from 'express';
import * as fridgeController from '../controllers/fridge.controller.js';

const router = Router();

// Lấy danh sách đồ trong tủ lạnh của một gia đình
// GET /api/fridge/family/:familyId
router.get('/family/:familyId', fridgeController.getByFamilyId);

export default router;
