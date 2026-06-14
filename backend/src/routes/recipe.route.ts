import { Router } from 'express';
import * as RecipeController from '../controllers/recipe.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Lấy danh sách công thức gia đình
router.get('/family', authenticateToken, RecipeController.getFamilyRecipes);

// Lấy danh sách công thức cộng đồng
router.get('/community', authenticateToken, RecipeController.getCommunityRecipes);

// Lấy danh sách công thức yêu thích
router.get('/favorites', authenticateToken, RecipeController.getFavoriteRecipes);

// Các thao tác CRUD cho công thức
router.post('/', authenticateToken, RecipeController.createRecipe);
router.put('/:id', authenticateToken, RecipeController.updateRecipe);
router.delete('/:id', authenticateToken, RecipeController.deleteRecipe);

// Chia sẻ công thức lên cộng đồng
router.post('/:id/share', authenticateToken, RecipeController.shareToCommunity);

// Toggle yêu thích công thức
router.post('/:id/favorite', authenticateToken, RecipeController.toggleFavorite);

// Toggle like công thức cộng đồng
router.post('/:id/like', authenticateToken, RecipeController.toggleLike);

// Gom đồ thiếu vào Shopping List
router.post('/:id/shopping-list', authenticateToken, RecipeController.addToShoppingList);

export default router;
