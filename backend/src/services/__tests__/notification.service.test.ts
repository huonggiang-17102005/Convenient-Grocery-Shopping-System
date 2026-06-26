import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as notificationRepo from '../../repo/notification.repo.js';
import { getFamilyNotifications, createNotification } from '../notification.service.js';

vi.mock('../../repo/notification.repo.js', () => ({
  insertNotification: vi.fn(),
  fetchNotifications: vi.fn(),
  getUnreadCount: vi.fn(),
}));

describe('Notification Service - Chức năng Thông báo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Nên lấy thông báo của gia đình thành công', async () => {
    const mockNotifs = { data: [{ id: '1', title: 'Thông báo', family_id: 'fam1', user_id: 'user1' }], count: 1 };
    (notificationRepo.fetchNotifications as any).mockResolvedValue(mockNotifs);
    (notificationRepo.getUnreadCount as any).mockResolvedValue(5);

    const result = await getFamilyNotifications('fam1', 'user1', 20, 0);
    expect(result).toEqual({ ...mockNotifs, unreadCount: 5 });
    expect(notificationRepo.fetchNotifications).toHaveBeenCalledWith('fam1', 'user1', 20, 0, undefined);
  });

  it('Nên báo lỗi nếu gọi lấy thông báo mà thiếu familyId', async () => {
    await expect(getFamilyNotifications('', 'user1')).rejects.toThrow('Thiếu thông tin gia đình (familyId)');
  });

  it('Nên tạo thông báo thành công', async () => {
    const mockNotif = { id: '1', title: 'Test' };
    (notificationRepo.insertNotification as any).mockResolvedValue(mockNotif);

    const result = await createNotification('fam1', 'TEST', 'Test', 'Test msg');
    expect(result).toEqual(mockNotif);
    expect(notificationRepo.insertNotification).toHaveBeenCalled();
  });
});
