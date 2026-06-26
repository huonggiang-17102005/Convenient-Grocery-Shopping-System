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

export const getUnreadCount = async (familyId: string, userId: string) => {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('family_id', familyId)
    .not('read_by', 'cs', [userId]);

  if (error) {
    console.error('Error getting unread count:', error);
    throw new InternalServerError('Lỗi truy vấn DB khi lấy số lượng chưa đọc');
  }

  return count || 0;
};

export const markAsRead = async (notificationId: string, userId: string) => {
  // Lấy mảng hiện tại
  const { data: current, error: fetchErr } = await supabase
    .from('notifications')
    .select('read_by')
    .eq('id', notificationId)
    .single();
    
  if (fetchErr) throw new InternalServerError('Lỗi truy vấn DB');

  const currentReadBy = current?.read_by || [];
  if (currentReadBy.includes(userId)) return; // Đã đọc rồi

  const newReadBy = [...currentReadBy, userId];

  const { error } = await supabase
    .from('notifications')
    .update({ read_by: newReadBy })
    .eq('id', notificationId);

  if (error) {
    console.error('Error marking as read:', error);
    throw new InternalServerError('Lỗi DB');
  }
};

export const markAllAsRead = async (familyId: string, userId: string) => {
  // 1. Lấy tất cả thông báo của gia đình mà user chưa đọc
  const { data: unreadNotifs, error: fetchErr } = await supabase
    .from('notifications')
    .select('id, read_by')
    .eq('family_id', familyId)
    .not('read_by', 'cs', [userId]);

  if (fetchErr) throw new InternalServerError('Lỗi truy vấn DB');
  if (!unreadNotifs || unreadNotifs.length === 0) return;

  // 2. Cập nhật mảng read_by cho từng thông báo
  const updates = unreadNotifs.map(n => ({
    id: n.id,
    read_by: [...(n.read_by || []), userId]
  }));

  // Upsert để update hàng loạt
  const { error } = await supabase
    .from('notifications')
    .upsert(updates);

  if (error) {
    console.error('Error marking all as read:', error);
    throw new InternalServerError('Lỗi DB');
  }
};

