import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import * as shoppingListController from '../controllers/shopping-list.controller.js';

const router = Router();

// --- Shopping Lists ---
router.get('/family/:familyId', authenticateToken as any, shoppingListController.getListsByFamilyId as any);

// GET /api/shopping-lists/:id — Lấy chi tiết 1 list kèm items
router.get('/:id', authenticateToken as any, shoppingListController.getListById as any);

// POST /api/shopping-lists — Tạo mới shopping list
router.post('/', authenticateToken as any, shoppingListController.createList as any);

// PUT /api/shopping-lists/:id — Cập nhật thông tin list (title, status, target_date)
router.put('/:id', authenticateToken as any, shoppingListController.updateList as any);

// DELETE /api/shopping-lists/:id — Xóa list (cascade xóa items)
router.delete('/:id', authenticateToken as any, shoppingListController.deleteList as any);

// --- Shopping List Items ---
router.post('/:id/items', authenticateToken as any, shoppingListController.createItem as any);

// PUT /api/shopping-lists/:id/items/:itemId — Cập nhật item
router.put('/:id/items/:itemId', authenticateToken as any, shoppingListController.updateItem as any);

// PATCH /api/shopping-lists/:id/items/:itemId/toggle — Toggle is_bought
router.patch('/:id/items/:itemId/toggle', authenticateToken as any, shoppingListController.toggleItemBought as any);

// DELETE /api/shopping-lists/:id/items/:itemId — Xóa item
router.delete('/:id/items/:itemId', authenticateToken as any, shoppingListController.deleteItem as any);

// --- Fridge Sync ---
router.post('/:id/items/:itemId/add-to-fridge', authenticateToken as any, shoppingListController.addItemToFridge as any);

export default router;

