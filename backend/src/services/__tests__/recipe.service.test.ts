import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as recipeRepo from '../../repo/recipe.repo.js';
import { 
  getCommunityRecipes, 
  createRecipe, 
  updateRecipe, 
  deleteRecipe, 
  addToShoppingList 
} from '../recipe.service.js';
import { ForbiddenError } from '../../errors/CommonError.js';

// Định nghĩa mock chain thông qua vi.hoisted để Vitest hoist lên trước vi.mock
const { mockQueryChain } = vi.hoisted(() => {
  return {
    mockQueryChain: {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      then: vi.fn().mockImplementation((onFulfilled) => {
        return Promise.resolve({ data: [], error: null }).then(onFulfilled);
      })
    }
  };
});

// Mock Supabase Database Client
vi.mock('../../config/db.config.js', () => ({
  default: {
    from: vi.fn().mockReturnValue(mockQueryChain),
  },
  testDBConnection: vi.fn(),
}));

// Setup mock cho recipe repo
vi.mock('../../repo/recipe.repo.js', () => ({
  getCommunityRecipes: vi.fn(),
  getRecipeById: vi.fn(),
  getUserFavoriteRecipes: vi.fn(),
  addFavoriteRecipe: vi.fn(),
  removeFavoriteRecipe: vi.fn(),
  createRecipe: vi.fn(),
  updateRecipe: vi.fn(),
  deleteRecipe: vi.fn(),
  getFridgeItems: vi.fn(),
  getOrCreateShoppingList: vi.fn(),
}));

describe('Recipe Service - Chức năng Công thức nấu ăn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryChain.then.mockImplementation((onFulfilled) => {
      return Promise.resolve({ data: [], error: null }).then(onFulfilled);
    });
  });

  describe('getCommunityRecipes', () => {
    it('Nên lấy danh sách công thức cộng đồng thành công', async () => {
      const mockRecipes = [{ id: '1', title: 'Sườn xào chua ngọt', author: {} }];
      (recipeRepo.getCommunityRecipes as any).mockResolvedValue(mockRecipes);
      (recipeRepo.getUserFavoriteRecipes as any).mockResolvedValue([]);

      const result = await getCommunityRecipes('user1') as any[];
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
      expect(recipeRepo.getCommunityRecipes).toHaveBeenCalled();
    });
  });

  describe('createRecipe', () => {
    it('Nên gọi repository để tạo công thức mới', async () => {
      const recipeData = { name: 'Canh bí đỏ', cookingTimeMinutes: 20 };
      const expectedRecipe = { id: 'recipe_new', author_id: 'user_a', name: 'Canh bí đỏ' };
      (recipeRepo.createRecipe as any).mockResolvedValue(expectedRecipe);

      const result = await createRecipe('user_a', recipeData);
      expect(result).toEqual(expectedRecipe);
      expect(recipeRepo.createRecipe).toHaveBeenCalledWith(expect.objectContaining({
        author_id: 'user_a',
        name: 'Canh bí đỏ',
      }));
    });
  });

  describe('updateRecipe', () => {
    it('Nên cập nhật công thức thành công nếu người dùng là tác giả', async () => {
      const existingRecipe = { id: 'rec_1', author_id: 'user_a', name: 'Canh cua' };
      const updateData = { name: 'Canh cua đồng' };
      (recipeRepo.getRecipeById as any).mockResolvedValue(existingRecipe);
      (recipeRepo.updateRecipe as any).mockResolvedValue({ ...existingRecipe, ...updateData });

      const result = await updateRecipe('rec_1', 'user_a', updateData);
      expect(result.name).toBe('Canh cua đồng');
      expect(recipeRepo.updateRecipe).toHaveBeenCalled();
    });

    it('Nên ném lỗi ForbiddenError nếu người sửa không phải là tác giả', async () => {
      const existingRecipe = { id: 'rec_1', author_id: 'user_a', name: 'Canh cua' };
      (recipeRepo.getRecipeById as any).mockResolvedValue(existingRecipe);

      await expect(updateRecipe('rec_1', 'user_b', { name: 'Phá hoại' }))
        .rejects.toThrow(ForbiddenError);
      expect(recipeRepo.updateRecipe).not.toHaveBeenCalled();
    });
  });

  describe('deleteRecipe', () => {
    it('Nên xóa công thức thành công nếu người dùng là tác giả', async () => {
      const existingRecipe = { id: 'rec_1', author_id: 'user_a', name: 'Canh cua' };
      (recipeRepo.getRecipeById as any).mockResolvedValue(existingRecipe);

      await deleteRecipe('rec_1', 'user_a');
      expect(recipeRepo.deleteRecipe).toHaveBeenCalledWith('rec_1');
    });

    it('Nên ném lỗi ForbiddenError nếu người xóa không phải là tác giả', async () => {
      const existingRecipe = { id: 'rec_1', author_id: 'user_a', name: 'Canh cua' };
      (recipeRepo.getRecipeById as any).mockResolvedValue(existingRecipe);

      await expect(deleteRecipe('rec_1', 'user_b'))
        .rejects.toThrow(ForbiddenError);
      expect(recipeRepo.deleteRecipe).not.toHaveBeenCalled();
    });
  });

  describe('addToShoppingList', () => {
    it('Nên tự động tính toán nguyên liệu thiếu trong tủ và lưu vào shopping list', async () => {
      // 1. Giả lập một công thức nấu ăn cần: 500g Thịt heo và 1 gói Gia vị lẩu
      const mockRecipe = {
        id: 'rec_1',
        name: 'Lẩu thái',
        ingredients: [
          { name: 'Thịt heo', category: 'Thịt cá', quantity: 500, unit: 'g' },
          { name: 'Gia vị lẩu', category: 'Gia vị', quantity: 1, unit: 'gói' }
        ]
      };
      
      // 2. Giả lập tủ lạnh hiện tại: có 200g Thịt heo (thiếu 300g) và không có Gia vị lẩu (thiếu 1)
      const mockFridgeItems = [
        { name: 'Thịt heo', category: 'Thịt cá', quantity: 200, unit: 'g' }
      ];

      (recipeRepo.getRecipeById as any).mockResolvedValue(mockRecipe);
      (recipeRepo.getFridgeItems as any).mockResolvedValue(mockFridgeItems);
      (recipeRepo.getOrCreateShoppingList as any).mockResolvedValue({ id: 'list_123' });

      // Giả lập database shopping_list_items hiện tại chưa có nguyên liệu nào trùng
      mockQueryChain.then.mockImplementationOnce((onFulfilled) => {
        return Promise.resolve({ data: [], error: null }).then(onFulfilled); // fetchExistingItems
      });

      const result = await addToShoppingList('rec_1', 'family_1', 'user_1');
      
      expect(result.message).toContain('Đã thêm 2 nguyên liệu vào danh sách mua sắm.');
      expect(result.missingItems).toHaveLength(2);
      
      const missingItems = result.missingItems!;
      
      // Kiểm tra lượng thiếu tính toán đúng: 500 - 200 = 300g Thịt heo
      const missingPork = missingItems.find((i: any) => i.name === 'Thịt heo');
      expect(missingPork.quantity).toBe(300);

      // Kiểm tra loại gia vị thiếu 1 gói
      const missingSpice = missingItems.find((i: any) => i.name === 'Gia vị lẩu');
      expect(missingSpice.quantity).toBe(0); // gia vị: quantity trong shopping_list khởi tạo là 0 do ko trừ hao định lượng
    });
  });
});
