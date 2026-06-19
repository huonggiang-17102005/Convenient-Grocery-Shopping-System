import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fridgeRepo from '../../repo/fridge.repo.js';
import { getFamilyFridge } from '../fridge.service.js';

// 1. Giả lập (Mock) tầng Database Repo
vi.mock('../../repo/fridge.repo.js', () => ({
  getItemsByFamilyId: vi.fn(),
  deleteItem: vi.fn(),
  updateItemQuantity: vi.fn(),
  addItem: vi.fn(),
  getItemById: vi.fn(),
  updateItem: vi.fn(),
  getExpiredUnwastedItems: vi.fn(),
  markItemsAsWasted: vi.fn(),
}));

vi.mock('../../repo/inventoryLog.repo.js', () => ({
  insertLog: vi.fn(),
}));

vi.mock('../notification.service.js', () => ({
  createNotification: vi.fn(),
}));

describe('Fridge Service - Chức năng Tủ lạnh', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Nên lấy danh sách thực phẩm trong tủ lạnh thành công', async () => {
    // BƯỚC 1: CHUẨN BỊ
    const mockItems = [
      { id: '1', name: 'Thịt bò', quantity: 2, unit: 'g' },
      { id: '2', name: 'Rau muống', quantity: 1, unit: 'g' }
    ];
    (fridgeRepo.getItemsByFamilyId as any).mockResolvedValue(mockItems);

    // BƯỚC 2: GỌI HÀM
    const result = await getFamilyFridge('family_123');

    // BƯỚC 3: KIỂM TRA
    expect(result).toEqual(mockItems);
    expect(fridgeRepo.getItemsByFamilyId).toHaveBeenCalledWith('family_123');
  });

  it('Nên báo lỗi nếu thiếu familyId', async () => {
    await expect(getFamilyFridge('')).rejects.toThrow('Mã ID của gia đình (familyId) không được để trống.');
  });
});
