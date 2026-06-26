import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mealPlannerService } from '../mealPlanner.service.js';

// Mock DB Config

// Create a helper to generate mock query chain
const createMockChain = () => {
  const chain = {
    select: vi.fn(),
    eq: vi.fn(),
    gte: vi.fn(),
    lte: vi.fn(),
    maybeSingle: vi.fn(),
    single: vi.fn(),
    update: vi.fn(),
  };
  chain.select.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.gte.mockReturnValue(chain);
  chain.lte.mockReturnValue(chain);
  chain.maybeSingle.mockReturnValue(Promise.resolve({ data: null, error: null }));
  chain.single.mockReturnValue(Promise.resolve({ data: null, error: null }));
  chain.update.mockReturnValue(chain);
  return chain;
};

const mockChain = createMockChain();

vi.mock('../../config/db.config.js', () => ({
  default: {
    from: vi.fn().mockImplementation(() => mockChain),
  },
}));

import supabase from '../../config/db.config.js';

describe('Meal Planner Service - Lên thực đơn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockChain.select.mockReturnValue(mockChain);
    mockChain.eq.mockReturnValue(mockChain);
    mockChain.gte.mockReturnValue(mockChain);
    mockChain.lte.mockReturnValue(mockChain);
    mockChain.maybeSingle.mockReturnValue(Promise.resolve({ data: null, error: null }));
    mockChain.single.mockReturnValue(Promise.resolve({ data: null, error: null }));
    mockChain.update.mockReturnValue(mockChain);
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

    mockChain.lte.mockResolvedValue({ data: mockDbData, error: null });

    const result = await mealPlannerService.getMealPlan('family_123', '2023-10-10', '2023-10-10');
    
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('item1');
    expect(result[0].recipes.title).toBe('Thịt kho');
  });

  it('Nên đánh dấu đã nấu hôm nay thành công', async () => {
    mockChain.maybeSingle.mockResolvedValue({ data: { id: 'plan_123' }, error: null });
    mockChain.eq
      .mockReturnValueOnce(mockChain) // plan_1st: eq('family_id', familyId)
      .mockReturnValueOnce(mockChain) // plan_2nd: eq('date', date)
      .mockReturnValueOnce(mockChain) // update_1st: eq('meal_plan_id', plan.id)
      .mockResolvedValueOnce({ error: null }); // update_2nd: eq('is_cooked', false)

    const result = await mealPlannerService.markCooked('family_123', '2023-10-10');
    expect(result).toEqual({ success: true });
  });

  it('Nên đánh dấu đã gom đồ hôm nay thành công', async () => {
    mockChain.maybeSingle.mockResolvedValue({ data: { id: 'plan_123' }, error: null });
    mockChain.eq
      .mockReturnValueOnce(mockChain) // plan_1st
      .mockReturnValueOnce(mockChain) // plan_2nd
      .mockReturnValueOnce(mockChain) // update_1st
      .mockReturnValueOnce(mockChain) // update_2nd
      .mockResolvedValueOnce({ error: null }); // update_3rd

    const result = await mealPlannerService.markShopped('family_123', '2023-10-10');
    expect(result).toEqual({ success: true });
  });

  it('Nên đánh dấu gom đồ cho 1 món ăn thành công', async () => {
    mockChain.single.mockResolvedValueOnce({ data: { id: 'item_123', meal_plans: { family_id: 'family_123' } }, error: null });
    mockChain.eq
      .mockReturnValueOnce(mockChain) // select_1st
      .mockResolvedValueOnce({ error: null }); // update_1st

    const result = await mealPlannerService.markSingleItemShopped('family_123', 'item_123');
    expect(result).toEqual({ success: true });
  });
});
