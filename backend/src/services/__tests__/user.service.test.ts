import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as userRepo from '../../repo/user.repo.js';
import { getMe } from '../user.service.js';
vi.mock('../../repo/user.repo.js', () => ({
  findById: vi.fn(),
  findByEmail: vi.fn(),
  updateProfile: vi.fn(),
  updateAvatar: vi.fn(),
  updatePassword: vi.fn(),
}));

describe('User Service - Chức năng lấy thông tin cá nhân', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Nên trả về thông tin user nếu tìm thấy ID trong Database', async () => {
    // BƯỚC 1: CHUẨN BỊ (Arrange) - Giả lập kết quả trả về từ Database
    const mockUser = { id: '123', email: 'test@gmail.com', name: 'Nguyen Van A' };
    (userRepo.findById as any).mockResolvedValue(mockUser);

    // BƯỚC 2: GỌI HÀM (Act) - Chạy hàm thực tế trong code của bạn
    const result = await getMe('123');

    // BƯỚC 3: KIỂM TRA (Assert) - So sánh kết quả thực tế với kỳ vọng
    expect(result).toEqual(mockUser); // Kiểm tra dữ liệu đúng không
    expect(userRepo.findById).toHaveBeenCalledWith('123'); // Kiểm tra hàm trong Repo có được gọi đúng ID không
  });

  it('Nên báo lỗi nếu Database không tìm thấy user', async () => {
    // BƯỚC 1: CHUẨN BỊ (Trả về null giả lập không thấy)
    (userRepo.findById as any).mockResolvedValue(null);

    // BƯỚC 2 & 3: GỌI HÀM VÀ KIỂM TRA LỖI (Hàm phải ném ra lỗi)
    await expect(getMe('123')).rejects.toThrow('Không tìm thấy người dùng');
  });

});
