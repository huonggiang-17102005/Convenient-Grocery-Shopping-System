import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as shoppingListRepo from '../../repo/shoppingList.repo.js';
import { getShoppingItems } from '../shoppingList.service.js';

// 1. Giả lập (Mock) các tầng phụ thuộc
vi.mock('../../repo/shoppingList.repo.js', () => ({
  getActiveListItems: vi.fn(),
  getOrCreateActiveList: vi.fn(),
  createItem: vi.fn(),
  getItemById: vi.fn(),
  getListById: vi.fn(),
  updateItem: vi.fn(),
  deleteItem: vi.fn(),
  getOverdueUnboughtItems: vi.fn(),
}));

vi.mock('../../repo/fridge.repo.js', () => ({
  getItemsByFamilyId: vi.fn(),
  updateItemQuantity: vi.fn(),
  addItem: vi.fn(),
}));

vi.mock('../notification.service.js', () => ({
  createNotification: vi.fn(),
}));

vi.mock('../../repo/user.repo.js', () => ({
  findById: vi.fn(),
}));

vi.mock('../../repo/family.repo.js', () => ({
  getFamilyMembers: vi.fn(),
}));

vi.mock('../../config/db.config.js', () => ({
  default: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
  },
}));

describe('Shopping List Service - Chức năng đi chợ', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Nên trả về danh sách đi chợ đã được format đúng chuẩn frontend', async () => {
    // BƯỚC 1: CHUẨN BỊ (Arrange)
    const mockDbItems = [
      {
        id: '1',
        name: 'Thịt heo',
        category: 'Thịt cá',
        quantity: '2', 
        unit: 'kg',
        is_bought: false,
        assignee_id: 'user1',
        deadline_date: '2023-12-01',
        deadline_time: '14:30:00',
        image_url: null,
        image_public_id: null,
      }
    ];
    (shoppingListRepo.getActiveListItems as any).mockResolvedValue(mockDbItems);

    // BƯỚC 2: GỌI HÀM (Act)
    const result = await getShoppingItems('family_123') as any[];

    // BƯỚC 3: KIỂM TRA (Assert)
    // Phải đảm bảo hàm đã map đúng tên field (is_bought -> isBought, ép kiểu quantity sang số)
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
    expect(result[0].quantity).toBe(2); // Đã biến thành số
    expect(result[0].isBought).toBe(false); // Đã map tên biến
    expect(result[0].deadlineTime).toBe('14:30'); // Đã cắt bớt giây
    expect(shoppingListRepo.getActiveListItems).toHaveBeenCalledWith('family_123');
  });

  it('Nên trả về mảng rỗng nếu chưa có đồ cần mua', async () => {
    (shoppingListRepo.getActiveListItems as any).mockResolvedValue([]);
    const result = await getShoppingItems('family_123');
    expect(result).toEqual([]);
  });
});
