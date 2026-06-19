import * as notificationRepo from '../repo/notification.repo.js';
import { BadRequestError } from '../errors/CommonError.js';

export const createNotification = async (
  familyId: string,
  type: string,
  title: string,
  message: string,
  metadata: any = {}
) => {
  if (!familyId) throw new BadRequestError('Thiếu thông tin gia đình (familyId)');
  if (!type || !title || !message) throw new BadRequestError('Thiếu nội dung thông báo');

  const newNotification = await notificationRepo.insertNotification({
    family_id: familyId,
    type,
    title,
    message,
    metadata
  });

  return newNotification;
};

export const getFamilyNotifications = async (familyId: string, limit: number = 20, offset: number = 0) => {
  if (!familyId) throw new BadRequestError('Thiếu thông tin gia đình (familyId)');
  
  const notifications = await notificationRepo.fetchNotifications(familyId, limit, offset);
  return notifications;
};
