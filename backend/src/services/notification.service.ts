import * as notificationRepo from '../repo/notification.repo.js';
import { BadRequestError } from '../errors/CommonError.js';

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

  return newNotification;
};

export const getFamilyNotifications = async (familyId: string, userId: string, limit: number = 20, offset: number = 0) => {
  if (!familyId) throw new BadRequestError('Thiếu thông tin gia đình (familyId)');
  if (!userId) throw new BadRequestError('Thiếu ID người dùng');
  
  const notifications = await notificationRepo.fetchNotifications(familyId, userId, limit, offset);
  return notifications;
};
