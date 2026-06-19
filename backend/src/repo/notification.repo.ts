import supabase from '../config/db.config.js';
import { InternalServerError } from '../errors/CommonError.js';
import type { Notification } from '../models/Notification.js';

export const insertNotification = async (notificationData: Omit<Notification, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('notifications')
    .insert([notificationData])
    .select()
    .single();

  if (error) {
    console.error('Error inserting notification:', error);
    throw new InternalServerError('Lỗi truy vấn DB khi tạo thông báo');
  }

  return data;
};

export const fetchNotifications = async (familyId: string, userId: string, limit: number = 20, offset: number = 0) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('family_id', familyId)
    .or(`user_id.is.null,user_id.eq.${userId}`)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching notifications:', error);
    throw new InternalServerError('Lỗi truy vấn DB khi lấy danh sách thông báo');
  }

  return data as Notification[];
};
