import type { Request, Response } from 'express';
import * as notificationService from '../services/notification.service.js';

export const getNotifications = async (req: Request, res: Response) => {
  const familyId = (req as any).user?.family_id as string;
  const userId = (req as any).user?.id as string;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;
  const category = req.query.category as string | undefined;

  const notifications = await notificationService.getFamilyNotifications(familyId, userId, limit, offset, category);

  return res.status(200).json({
    success: true,
    data: notifications
  });
};
