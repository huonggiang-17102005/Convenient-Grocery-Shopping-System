import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { FoodItem, FoodCategory, StorageType } from '../features/fridge/types';
import { useAuth } from './AuthContext';
import { fridgeService } from '../features/fridge/fridge.service';

const mapCategoryToEmoji = (category: string) => {
  const map: Record<string, string> = {
    'Thịt cá': '🥩',
    'Rau củ quả': '🥕',
    'Trứng': '🥚',
    'Chất lỏng': '🥛',
    'Đồ khô': '🌾',
    'Gia vị': '🧂',
  };
  return map[category] || '🍽️';
};

const mapBackendToFrontend = (item: any): FoodItem => {
  const expDate = new Date(item.expiration_date || new Date());
  const diffDays = Math.ceil((expDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return {
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    unit: item.unit || '',
    category: (item.category || 'Khác') as FoodCategory,
    storageType: (item.location || 'Ngăn mát') as StorageType,
    daysRemaining: diffDays > 0 ? diffDays : 0,
    emoji: mapCategoryToEmoji(item.category || ''),
    expiryDate: item.expiration_date,
    image: item.image_url || undefined,
  };
};

interface FridgeContextType {
  items: FoodItem[];
  setItems: React.Dispatch<React.SetStateAction<FoodItem[]>>;
  refreshFridge: () => Promise<void>;
  isLoading: boolean;
}

const FridgeContext = createContext<FridgeContextType>({
  items: [],
  setItems: () => {},
  refreshFridge: async () => {},
  isLoading: false,
});

export const useFridgeContext = () => useContext(FridgeContext);

export const FridgeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<FoodItem[]>(() => {
    const cached = localStorage.getItem('cached_fridge_items');
    return cached ? JSON.parse(cached) : [];
  });
  const [isLoading, setIsLoading] = useState(false);

  // Sync cache whenever items change
  useEffect(() => {
    localStorage.setItem('cached_fridge_items', JSON.stringify(items));
  }, [items]);

  const refreshFridge = useCallback(async () => {
    try {
      const familyId = user?.family_id;
      
      if (!familyId) {
        setItems([]);
        return;
      }

      setIsLoading(true);

      const result = await fridgeService.getFamilyFridge(familyId);

      if (result.success) {
        const formattedItems = result.data.map(mapBackendToFrontend);
        setItems(formattedItems);
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu tủ lạnh:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fetch lần đầu
  useEffect(() => {
    refreshFridge();
  }, [refreshFridge]);

  return (
    <FridgeContext.Provider value={{ items, setItems, refreshFridge, isLoading }}>
      {children}
    </FridgeContext.Provider>
  );
};

export default FridgeContext;
