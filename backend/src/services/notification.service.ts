import * as notificationRepo from '../repo/notification.repo.js';
import { BadRequestError } from '../errors/CommonError.js';
import * as sseService from './sse.service.js';

export const createNotification = async (
  familyId: string,
  type: string,
  title: string,
  message: string,
  metadata: any = {},
  userId?: string
) => {
  if (!familyId) throw new BadRequestError('Thiếu thông tin gia đình (familyId)');
  if (!type || !title || !message) throw new BadRequestError('Thiếu nội dung thông báo');

  const newNotification = await notificationRepo.insertNotification({
    family_id: familyId,
    ...(userId ? { user_id: userId } : {}),
    type,
    title,
    message,
    metadata
  });

  // Gửi sự kiện qua SSE
  if (userId) {
    sseService.broadcastToUser(familyId, userId, 'NEW_NOTIFICATION', newNotification);
  } else {
    sseService.broadcastToFamily(familyId, 'NEW_NOTIFICATION', newNotification);
  }

  return newNotification;
};

export const getFamilyNotifications = async (familyId: string, userId: string, limit: number = 20, offset: number = 0, category?: string) => {
  if (!familyId) throw new BadRequestError('Thiếu thông tin gia đình (familyId)');
  if (!userId) throw new BadRequestError('Thiếu ID người dùng');
  
  const notifications = await notificationRepo.fetchNotifications(familyId, userId, limit, offset, category);
  const unreadCount = await notificationRepo.getUnreadCount(familyId, userId);
  
  return { ...notifications, unreadCount };
};

export const markAsRead = async (notificationId: string, userId: string) => {
  if (!notificationId) throw new BadRequestError('Thiếu ID thông báo');
  if (!userId) throw new BadRequestError('Thiếu ID người dùng');

  await notificationRepo.markAsRead(notificationId, userId);
  return true;
};

export const markAllAsRead = async (familyId: string, userId: string) => {
  if (!familyId) throw new BadRequestError('Thiếu thông tin gia đình');
  if (!userId) throw new BadRequestError('Thiếu ID người dùng');

  await notificationRepo.markAllAsRead(familyId, userId);
  return true;
};
