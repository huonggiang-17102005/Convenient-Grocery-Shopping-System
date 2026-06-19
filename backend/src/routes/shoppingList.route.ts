import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import * as shoppingListController from '../controllers/shoppingList.controller.js';

const router = Router();

// Lấy danh sách mua sắm hiện tại
router.get('/items', authenticateToken, shoppingListController.getShoppingItems);

// Tạo một mặt hàng mua sắm mới
router.post('/items', authenticateToken, shoppingListController.createShoppingItem);

// Cập nhật mặt hàng mua sắm (bao gồm cả phân công, đánh dấu đã mua, thay đổi số lượng, v.v.)
router.patch('/items/:id', authenticateToken, shoppingListController.updateShoppingItem);

// Xóa mặt hàng mua sắm
router.delete('/items/:id', authenticateToken, shoppingListController.deleteShoppingItem);

// Gọi bởi Vercel Cronjob (GET để tương thích Vercel)
router.get('/cron/check-tasks', shoppingListController.checkOverdueTasks);

export default router;
