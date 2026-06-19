import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as categoryRepo from '../../repo/category.repo.js';
import { getGroupedCategories } from '../category.service.js';

vi.mock('../../repo/category.repo.js', () => ({
  fetchAllCategoryUnits: vi.fn(),
}));

describe('Category Service - Chức năng Danh mục', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Nên trả về danh sách danh mục và đơn vị thành công', async () => {
    const mockCategories = [{ category: 'Thịt cá', unit: 'kg', default_storage_tip: 'Tủ đông' }];
    (categoryRepo.fetchAllCategoryUnits as any).mockResolvedValue(mockCategories);

    const result = await getGroupedCategories() as any[];

    expect(result).toHaveLength(1);
    expect(result[0].category).toBe('Thịt cá');
    expect(categoryRepo.fetchAllCategoryUnits).toHaveBeenCalled();
  });
});
