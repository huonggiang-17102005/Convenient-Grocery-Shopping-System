import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as familyRepo from '../../repo/family.repo.js';
import { getMembers } from '../family.service.js';

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
});
