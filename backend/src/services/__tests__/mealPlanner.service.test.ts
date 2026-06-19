import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mealPlannerService } from '../mealPlanner.service.js';

// Mock DB Config
vi.mock('../../config/db.config.js', () => ({
  default: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
  },
}));

import supabase from '../../config/db.config.js';

describe('Meal Planner Service - Lên thực đơn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Nên lấy danh sách thực đơn theo ngày thành công', async () => {
    const mockDbData = [
      {
        date: '2023-10-10',
        people_count: 4,
        meal_plan_items: [
          {
            id: 'item1',
            meal_type: 'Bữa trưa',
            recipes: { id: 'recipe1', title: 'Thịt kho' }
          }
        ]
      }
    ];

    // Mock hàm lte (chuỗi gọi hàm cuối cùng) để trả về data
    (supabase.from as any)().select().eq().gte().lte.mockResolvedValue({ data: mockDbData, error: null });

    const result = await mealPlannerService.getMealPlan('family_123', '2023-10-10', '2023-10-10');
    
    // Đảm bảo hàm trả về format đã được làm phẳng (flatten) cho frontend
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('item1');
    expect(result[0].recipes.title).toBe('Thịt kho');
  });
});
