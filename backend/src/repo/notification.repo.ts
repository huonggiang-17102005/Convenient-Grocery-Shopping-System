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

export const fetchNotifications = async (familyId: string, userId: string, limit: number = 20, offset: number = 0, category?: string) => {
  let query = supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('family_id', familyId)
    .or(`user_id.is.null,user_id.eq.${userId}`);

  if (category && category !== 'all') {
    let types: string[] = [];
    switch (category) {
      case 'family':
        types = ['FAMILY_JOIN', 'FAMILY_LEAVE', 'FAMILY_ROLE'];
        break;
      case 'fridge':
        types = ['ADD', 'CONSUME', 'UPDATE', 'WASTE', 'EXPIRE'];
        break;
      case 'shopping':
        types = ['TASK_ASSIGN', 'TASK_UNASSIGN', 'TASK_COMPLETE', 'TASK_DELETE', 'TASK_OVERDUE'];
        break;
      case 'recipe':
        types = ['LIKE'];
        break;
      case 'meal':
        types = ['MEAL_PLAN', 'MEAL_PLAN_ADD', 'MEAL_PLAN_REMOVE'];
        break;
    }
    if (types.length > 0) {
      query = query.in('type', types);
    }
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching notifications:', error);
    throw new InternalServerError('Lỗi truy vấn DB khi lấy danh sách thông báo');
  }

  return { data: data as Notification[], count: count || 0 };
};
