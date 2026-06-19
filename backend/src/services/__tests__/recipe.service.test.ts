import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as recipeRepo from '../../repo/recipe.repo.js';
import { getCommunityRecipes } from '../recipe.service.js';

vi.mock('../../repo/recipe.repo.js', () => ({
  getCommunityRecipes: vi.fn(),
  getRecipeById: vi.fn(),
  getUserFavoriteRecipes: vi.fn(),
  addFavoriteRecipe: vi.fn(),
  removeFavoriteRecipe: vi.fn(),
}));

describe('Recipe Service - Chức năng Công thức nấu ăn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
