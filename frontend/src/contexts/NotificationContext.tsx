import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AppNotification } from '../types/notification';
import { useAuth } from './AuthContext';

export type NotificationCategory = 'all' | 'family' | 'fridge' | 'shopping' | 'recipe' | 'meal' | 'expired';

export interface CategoryData {
  items: AppNotification[];
  hasMore: boolean;
  isLoading: boolean;
  offset: number;
}

interface NotificationContextProps {
  categories: Record<NotificationCategory, CategoryData>;
  activeCategory: NotificationCategory;
  setActiveCategory: (cat: NotificationCategory) => void;
  unreadCount: number;
  refreshNotifications: (cat?: NotificationCategory) => Promise<void>;
  loadMoreNotifications: (cat?: NotificationCategory) => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => Promise<void>;
  checkIsRead: (notif: AppNotification) => boolean;
  checkCategoryHasUnread: (cat: NotificationCategory) => boolean;
  handleSSENotification: (payload?: any) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

const initialCategoryState = (): Record<NotificationCategory, CategoryData> => ({
  all: { items: [], hasMore: true, isLoading: false, offset: 0 },
  family: { items: [], hasMore: true, isLoading: false, offset: 0 },
  fridge: { items: [], hasMore: true, isLoading: false, offset: 0 },
  shopping: { items: [], hasMore: true, isLoading: false, offset: 0 },
  recipe: { items: [], hasMore: true, isLoading: false, offset: 0 },
  meal: { items: [], hasMore: true, isLoading: false, offset: 0 },
  expired: { items: [], hasMore: true, isLoading: false, offset: 0 },
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Record<NotificationCategory, CategoryData>>(() => {
    const cached = localStorage.getItem('cached_notifications_all');
    const state = initialCategoryState();
    if (cached) {
      state.all.items = JSON.parse(cached);
    }
    return state;
  });

  const [activeCategory, setActiveCategory] = useState<NotificationCategory>('all');

  const [unreadCount, setUnreadCount] = useState<number>(0);

  const limit = 20;

  // Optimistic Cache sync cho tab 'all'
  useEffect(() => {
    localStorage.setItem('cached_notifications_all', JSON.stringify(categories.all.items));
  }, [categories.all.items]);

  const fetchApi = async (offset: number, cat: NotificationCategory) => {
    const token = localStorage.getItem('token');
    if (!token) return { data: [], totalCount: 0 };
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/notifications?limit=${limit}&offset=${offset}&category=${cat}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      return json.success ? { data: json.data, totalCount: json.totalCount || 0, unreadCount: json.unreadCount || 0 } : { data: [], totalCount: 0, unreadCount: 0 };
    } catch (err) {
      console.error('Lỗi khi fetch notifications', err);
      return { data: [], totalCount: 0, unreadCount: 0 };
    }
  };

  const updateCategoryState = useCallback((cat: NotificationCategory, updater: (prev: CategoryData) => CategoryData) => {
    setCategories(prev => ({
      ...prev,
      [cat]: updater(prev[cat])
    }));
  }, []);

  const refreshNotifications = useCallback(async (cat: NotificationCategory = activeCategory) => {
    updateCategoryState(cat, prev => ({ ...prev, isLoading: true }));
    const { data, unreadCount: fetchedUnreadCount } = await fetchApi(0, cat);
    if (cat === 'all') {
      setUnreadCount(fetchedUnreadCount);
    }
    updateCategoryState(cat, prev => ({
      ...prev,
      items: data,
      hasMore: data.length === limit,
      isLoading: false,
      offset: data.length
    }));
  }, [activeCategory, updateCategoryState]);

  const activeCategoryRef = React.useRef(activeCategory);
  useEffect(() => {
    activeCategoryRef.current = activeCategory;
  }, [activeCategory]);

  const getCategoryForType = (type: string): NotificationCategory => {
    const familyTypes = ['FAMILY_JOIN', 'FAMILY_LEAVE', 'FAMILY_ROLE'];
    const fridgeTypes = ['ADD', 'CONSUME', 'UPDATE', 'WASTE'];
    const expiredTypes = ['EXPIRE', 'EXPIRING_SOON'];
    const shoppingTypes = ['TASK_ASSIGN', 'TASK_UNASSIGN', 'TASK_COMPLETE', 'TASK_DELETE', 'TASK_OVERDUE'];
    const recipeTypes = ['LIKE'];
    const mealTypes = ['MEAL_PLAN', 'MEAL_PLAN_ADD', 'MEAL_PLAN_REMOVE'];

    if (familyTypes.includes(type)) return 'family';
    if (fridgeTypes.includes(type)) return 'fridge';
    if (expiredTypes.includes(type)) return 'expired';
    if (shoppingTypes.includes(type)) return 'shopping';
    if (recipeTypes.includes(type)) return 'recipe';
    if (mealTypes.includes(type)) return 'meal';
    return 'all';
  };

  const handleSSENotification = useCallback(async (payload?: any) => {
    const currentActive = activeCategoryRef.current;
    
    if (payload && payload.id) {
      const targetCat = getCategoryForType(payload.type);
      const newNotif = payload as AppNotification;
      
      const updater = (prev: CategoryData) => ({
        ...prev,
        items: [newNotif, ...prev.items],
        offset: prev.offset + 1
      });

      updateCategoryState('all', updater);
      setUnreadCount(prev => prev + 1);
      
      if (targetCat !== 'all') {
        updateCategoryState(targetCat, updater);
      }
    } else {
      // Fallback
      await refreshNotifications('all');
      if (currentActive !== 'all') {
        await refreshNotifications(currentActive);
      }
    }
  }, [updateCategoryState, refreshNotifications]);

  const loadMoreNotifications = useCallback(async (cat: NotificationCategory = activeCategory) => {
    const catData = categories[cat];
    if (catData.isLoading || !catData.hasMore) return;

    updateCategoryState(cat, prev => ({ ...prev, isLoading: true }));
    const { data } = await fetchApi(catData.offset, cat);

    if (data.length > 0) {
      updateCategoryState(cat, prev => {
        const newArr = [...prev.items];
        data.forEach((item: AppNotification) => {
          if (!newArr.some(n => n.id === item.id)) {
            newArr.push(item);
          }
        });
        return {
          ...prev,
          items: newArr,
          hasMore: data.length === limit,
          isLoading: false,
          offset: prev.offset + data.length
        };
      });
    } else {
      updateCategoryState(cat, prev => ({ ...prev, hasMore: false, isLoading: false }));
    }
  }, [activeCategory, categories, updateCategoryState]);

  // Initial fetch for 'all'
  useEffect(() => {
    refreshNotifications('all');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch khi đổi tab nếu chưa có data
  useEffect(() => {
    if (categories[activeCategory].items.length === 0 && categories[activeCategory].hasMore && !categories[activeCategory].isLoading) {
      refreshNotifications(activeCategory);
    }
  }, [activeCategory, categories, refreshNotifications]);


  const markAsRead = useCallback(async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      const cats: NotificationCategory[] = ['all', 'family', 'fridge', 'expired', 'shopping', 'recipe', 'meal'];
      cats.forEach(cat => {
        updateCategoryState(cat, prev => {
          const items = prev.items.map(n => 
            n.id === id ? { ...n, read_by: [...(n.read_by || []), user?.id || ''] } : n
          );
          return { ...prev, items };
        });
      });
    } catch (e) {
      console.error(e);
    }
  }, [user?.id, updateCategoryState]);

  const markAllAsRead = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      await fetch(`${API_URL}/notifications/mark-all-read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setUnreadCount(0);
      
      const cats: NotificationCategory[] = ['all', 'family', 'fridge', 'expired', 'shopping', 'recipe', 'meal'];
      cats.forEach(cat => {
        updateCategoryState(cat, prev => {
          const items = prev.items.map(n => ({ ...n, read_by: [...(n.read_by || []), user?.id || ''] }));
          return { ...prev, items };
        });
      });
    } catch (e) {
      console.error(e);
    }
  }, [user?.id, updateCategoryState]);

  const checkIsRead = useCallback((notif: AppNotification) => {
    if (!user?.id) return false;
    return notif.read_by?.includes(user.id) || false;
  }, [user?.id]);

  const checkCategoryHasUnread = useCallback((cat: NotificationCategory) => {
    if (cat === 'all') return categories.all.items.some(n => !checkIsRead(n));

    // Check locally in all items first
    const hasUnreadInAll = categories.all.items.some(n => !checkIsRead(n) && getCategoryForType(n.type) === cat);
    if (hasUnreadInAll) return true;

    // Fallback to checking the category's own items just in case
    return categories[cat].items.some(n => !checkIsRead(n));
  }, [categories, checkIsRead]);

  return (
    <NotificationContext.Provider value={{
      categories,
      activeCategory,
      setActiveCategory,
      unreadCount,
      refreshNotifications,
      loadMoreNotifications,
      markAsRead,
      markAllAsRead,
      checkIsRead,
      checkCategoryHasUnread,
      handleSSENotification
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

