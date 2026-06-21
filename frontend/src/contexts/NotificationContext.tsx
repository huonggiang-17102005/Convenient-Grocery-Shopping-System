import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AppNotification } from '../types/notification';

export type NotificationCategory = 'all' | 'family' | 'fridge' | 'shopping' | 'recipe' | 'meal';

export interface CategoryData {
  items: AppNotification[];
  hasMore: boolean;
  isLoading: boolean;
}

interface NotificationContextProps {
  categories: Record<NotificationCategory, CategoryData>;
  activeCategory: NotificationCategory;
  setActiveCategory: (cat: NotificationCategory) => void;
  unreadCount: number;
  refreshNotifications: (cat?: NotificationCategory) => Promise<void>;
  loadMoreNotifications: (cat?: NotificationCategory) => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  checkIsRead: (id: string) => boolean;
  checkCategoryHasUnread: (cat: NotificationCategory) => boolean;
  handleSSENotification: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

const initialCategoryState = (): Record<NotificationCategory, CategoryData> => ({
  all: { items: [], hasMore: true, isLoading: false },
  family: { items: [], hasMore: true, isLoading: false },
  fridge: { items: [], hasMore: true, isLoading: false },
  shopping: { items: [], hasMore: true, isLoading: false },
  recipe: { items: [], hasMore: true, isLoading: false },
  meal: { items: [], hasMore: true, isLoading: false },
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Record<NotificationCategory, CategoryData>>(() => {
    const cached = localStorage.getItem('cached_notifications_all');
    const state = initialCategoryState();
    if (cached) {
      state.all.items = JSON.parse(cached);
    }
    return state;
  });
  
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>('all');

  const [readIds, setReadIds] = useState<Set<string>>(() => {
    const cachedIds = localStorage.getItem('read_notification_ids');
    return cachedIds ? new Set(JSON.parse(cachedIds)) : new Set();
  });

  const limit = 20;

  // Optimistic Cache sync cho tab 'all'
  useEffect(() => {
    localStorage.setItem('cached_notifications_all', JSON.stringify(categories.all.items));
  }, [categories.all.items]);

  useEffect(() => {
    localStorage.setItem('read_notification_ids', JSON.stringify(Array.from(readIds)));
  }, [readIds]);

  const [serverTotalCount, setServerTotalCount] = useState<number>(0);

  const fetchApi = async (offset: number, cat: NotificationCategory) => {
    const token = localStorage.getItem('token');
    if (!token) return { data: [], totalCount: 0 };
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/notifications?limit=${limit}&offset=${offset}&category=${cat}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      return json.success ? { data: json.data, totalCount: json.totalCount || 0 } : { data: [], totalCount: 0 };
    } catch (err) {
      console.error('Lỗi khi fetch notifications', err);
      return { data: [], totalCount: 0 };
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
    const { data, totalCount } = await fetchApi(0, cat);
    if (cat === 'all') {
      setServerTotalCount(totalCount);
    }
    updateCategoryState(cat, prev => ({
      ...prev,
      items: data,
      hasMore: data.length === limit,
      isLoading: false
    }));
  }, [activeCategory, updateCategoryState]);

  const activeCategoryRef = React.useRef(activeCategory);
  useEffect(() => {
    activeCategoryRef.current = activeCategory;
  }, [activeCategory]);

  const getCategoryForType = (type: string): NotificationCategory => {
    const familyTypes = ['FAMILY_JOIN', 'FAMILY_LEAVE', 'FAMILY_ROLE'];
    const fridgeTypes = ['ADD', 'CONSUME', 'UPDATE', 'WASTE', 'EXPIRE'];
    const shoppingTypes = ['TASK_ASSIGN', 'TASK_UNASSIGN', 'TASK_COMPLETE', 'TASK_DELETE', 'TASK_OVERDUE'];
    const recipeTypes = ['LIKE'];

    if (familyTypes.includes(type)) return 'family';
    if (fridgeTypes.includes(type)) return 'fridge';
    if (shoppingTypes.includes(type)) return 'shopping';
    if (recipeTypes.includes(type)) return 'recipe';
    return 'all';
  };

  const handleSSENotification = useCallback(async (payload?: any) => {
    const currentActive = activeCategoryRef.current;
    await refreshNotifications('all');
    
    if (payload && payload.type) {
      const targetCat = getCategoryForType(payload.type);
      if (targetCat !== 'all') {
        await refreshNotifications(targetCat);
      }
      if (currentActive !== 'all' && currentActive !== targetCat) {
        await refreshNotifications(currentActive);
      }
    } else {
      if (currentActive !== 'all') {
        await refreshNotifications(currentActive);
      }
    }
  }, [refreshNotifications]);

  const loadMoreNotifications = useCallback(async (cat: NotificationCategory = activeCategory) => {
    const catData = categories[cat];
    if (catData.isLoading || !catData.hasMore) return;
    
    updateCategoryState(cat, prev => ({ ...prev, isLoading: true }));
    const { data } = await fetchApi(catData.items.length, cat);
    
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
          isLoading: false
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
      categories.all.items.forEach(n => next.add(n.id));
      return next;
    });
  }, [categories.all.items]);

  const checkIsRead = useCallback((id: string) => {
    return readIds.has(id);
  }, [readIds]);

  const checkCategoryHasUnread = useCallback((cat: NotificationCategory) => {
    if (cat === 'all') return categories.all.items.some(n => !readIds.has(n.id));
    
    // Check locally in all items first
    const hasUnreadInAll = categories.all.items.some(n => !readIds.has(n.id) && getCategoryForType(n.type) === cat);
    if (hasUnreadInAll) return true;
    
    // Fallback to checking the category's own items just in case
    return categories[cat].items.some(n => !readIds.has(n.id));
  }, [categories, readIds]);

  // Calculate true unread count by subtracting local readIds size from server total count
  // If serverTotalCount is less than the loaded unread count (unlikely), fallback to local calculate
  const loadedUnreadCount = categories.all.items.filter(n => !readIds.has(n.id)).length;
  const unreadCount = Math.max(loadedUnreadCount, serverTotalCount - readIds.size);

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

