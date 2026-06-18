import { Router } from 'express';
import * as categoryController from '../controllers/category.controller.js';

const router = Router();

// Lấy danh sách danh mục thực phẩm và đơn vị tương ứng
// GET /api/categories
router.get('/', categoryController.getAllCategories);

export default router;
