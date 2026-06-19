import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AppNotification } from '../types/notification';
import { useAuth } from './AuthContext';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface NotificationContextProps {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  hasMore: boolean;
  refreshNotifications: () => Promise<void>;
  loadMoreNotifications: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { family, user } = useAuth();
  
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const cached = localStorage.getItem('cached_notifications');
    return cached ? JSON.parse(cached) : [];
  });
  
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    const cachedIds = localStorage.getItem('read_notification_ids');
    return cachedIds ? new Set(JSON.parse(cachedIds)) : new Set();
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;

  // Optimistic Cache sync
  useEffect(() => {
    localStorage.setItem('cached_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('read_notification_ids', JSON.stringify(Array.from(readIds)));
  }, [readIds]);

  const fetchApi = async (offset: number) => {
    const token = localStorage.getItem('token');
    if (!token) return [];
    try {
      const res = await fetch(`http://localhost:5000/api/notifications?limit=${limit}&offset=${offset}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      console.error('Lỗi khi fetch notifications', err);
      return [];
    }
  };

  const refreshNotifications = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchApi(0);
    setNotifications(data);
    setHasMore(data.length === limit);
    setIsLoading(false);
  }, []);

  const loadMoreNotifications = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    const data = await fetchApi(notifications.length);
    if (data.length > 0) {
      // remove duplicates by ID just in case
      setNotifications(prev => {
        const newArr = [...prev];
        data.forEach((item: AppNotification) => {
          if (!newArr.some(n => n.id === item.id)) {
            newArr.push(item);
          }
        });
        return newArr;
      });
      setHasMore(data.length === limit);
    } else {
      setHasMore(false);
    }
    setIsLoading(false);
  }, [isLoading, hasMore, notifications.length]);

  // Initial fetch
  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  // Supabase Realtime Listener
  useEffect(() => {
    if (!family?.id || !supabaseUrl || !supabaseKey) return;

    const channel = supabase
      .channel(`public:notifications:family_id=eq.${family.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `family_id=eq.${family.id}`
        },
        (payload) => {
          console.log('🔔 [Supabase Realtime] Nhận được thông báo mới:', payload);
          const newNoti = payload.new as any;
          // Bỏ qua nếu thông báo là TƯ NHÂN và không phải của người đang đăng nhập
          if (newNoti.user_id && user && newNoti.user_id !== user.id) {
            return;
          }
          // Gọi refresh để lấy dữ liệu mới nhất (với offset = 0)
          refreshNotifications();
        }
      )
      .subscribe((status, err) => {
        console.log('📡 [Supabase Realtime Notifications] Status:', status, err || '');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [family?.id, refreshNotifications, user?.id]);

  const markAsRead = useCallback((id: string) => {
    setReadIds(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setReadIds(prev => {
      const next = new Set(prev);
      notifications.forEach(n => next.add(n.id));
      return next;
    });
  }, [notifications]);

  // Combine read state with API data
  const finalNotifications = notifications.map(n => ({
    ...n,
    is_read: readIds.has(n.id)
  }));

  const unreadCount = finalNotifications.filter(n => !n.is_read).length;

  return (
    <NotificationContext.Provider value={{
      notifications: finalNotifications,
      unreadCount,
      isLoading,
      hasMore,
      refreshNotifications,
      loadMoreNotifications,
      markAsRead,
      markAllAsRead
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};
