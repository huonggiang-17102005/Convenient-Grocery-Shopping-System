import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as familyRepo from '../../repo/family.repo.js';
import { getMembers, getWasteStatistics } from '../family.service.js';
import * as inventoryLogRepo from '../../repo/inventoryLog.repo.js';

// 1. Giả lập (Mock) các tầng phụ thuộc
vi.mock('../../repo/family.repo.js', () => ({
  getFamilyMembers: vi.fn(),
  removeUserFromFamily: vi.fn(),
  transferHomemakerRole: vi.fn(),
}));

vi.mock('../../repo/user.repo.js', () => ({
  findById: vi.fn(),
}));

vi.mock('../../repo/inventoryLog.repo.js', () => ({
  getLogsByFamilyAndMonth: vi.fn(),
}));

vi.mock('../notification.service.js', () => ({
  createNotification: vi.fn(),
}));

vi.mock('../../config/db.config.js', () => ({
  default: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      update: vi.fn().mockReturnThis(),
    })),
  },
}));

describe('Family Service - Chức năng quản lý Gia đình', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Nên trả về danh sách thành viên nếu familyId hợp lệ', async () => {
    // BƯỚC 1: CHUẨN BỊ
    const mockMembers = [
      { id: '1', name: 'Nguyen Van A', role: 'Homemaker' },
      { id: '2', name: 'Nguyen Van B', role: 'Member' }
    ];
    (familyRepo.getFamilyMembers as any).mockResolvedValue(mockMembers);

    // BƯỚC 2: GỌI HÀM
    const result = await getMembers('family_123');

    // BƯỚC 3: KIỂM TRA
    expect(result).toEqual(mockMembers);
    expect(familyRepo.getFamilyMembers).toHaveBeenCalledWith('family_123');
  });

  it('Nên báo lỗi nếu không truyền familyId vào hàm getMembers', async () => {
    // Gọi hàm với chuỗi rỗng và kiểm tra lỗi
    await expect(getMembers('')).rejects.toThrow('Thiếu family_id');
  });

  describe('getWasteStatistics', () => {
    it('Nên tính thống kê lãng phí đúng, loại bỏ Gia vị và tính trung bình cho Khác', async () => {
      const mockLogs = [
        // Gia vị - should be ignored
        { category: 'Gia vị', action_type: 'add', amount: 10, unit: 'any' },
        { category: 'Gia vị', action_type: 'waste', amount: 5, unit: 'any' },
        // Thịt cá
        { category: 'Thịt cá', action_type: 'add', amount: 100, unit: 'g' },
        { category: 'Thịt cá', action_type: 'consume', amount: 60, unit: 'g' },
        { category: 'Thịt cá', action_type: 'waste', amount: 40, unit: 'g' },
        // Khác - g unit
        { category: 'Khác', action_type: 'add', amount: 200, unit: 'g' },
        { category: 'Khác', action_type: 'consume', amount: 150, unit: 'g' },
        { category: 'Khác', action_type: 'waste', amount: 50, unit: 'g' }, // 50/200 = 25% waste, 75% consume
        // Khác - ml unit
        { category: 'Khác', action_type: 'add', amount: 100, unit: 'ml' },
        { category: 'Khác', action_type: 'consume', amount: 50, unit: 'ml' },
        { category: 'Khác', action_type: 'waste', amount: 50, unit: 'ml' }, // 50/100 = 50% waste, 50% consume
      ];
      (inventoryLogRepo.getLogsByFamilyAndMonth as any).mockResolvedValue(mockLogs);

      const stats = await getWasteStatistics('family_123', 6, 2026);

      // Gia vị should not be in stats
      const giaViStat = stats.find(s => s.name === 'Gia vị');
      expect(giaViStat).toBeUndefined();

      // Thịt cá stats
      const thitCaStat = stats.find(s => s.name === 'Thịt cá');
      expect(thitCaStat).toBeDefined();
      expect(thitCaStat!.total).toBe(100);
      expect(thitCaStat!.consumed).toBe(60);
      expect(thitCaStat!.wasted).toBe(40);
      expect(thitCaStat!.consumedPercent).toBe(60);
      expect(thitCaStat!.wastedPercent).toBe(40);

      // Khác stats
      const khacStat = stats.find(s => s.name === 'Khác');
      expect(khacStat).toBeDefined();
      expect(khacStat!.isMultipleUnits).toBe(true);
      // average of 25% and 50% wasted is 37.5%
      expect(khacStat!.wastedPercent).toBe(37.5);
      // average of 75% and 50% consumed is 62.5%
      expect(khacStat!.consumedPercent).toBe(62.5);
      expect(khacStat!.unitsData).toEqual([
        { unit: 'g', total: 200, consumed: 150, wasted: 50, consumedPercent: 75, wastedPercent: 25 },
        { unit: 'ml', total: 100, consumed: 50, wasted: 50, consumedPercent: 50, wastedPercent: 50 }
      ]);
    });
  });
});
