import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ShoppingItem } from '../features/shopping-list/types';
import { shoppingService } from '../features/shopping-list/shopping-list.service';
import { useAuth } from './AuthContext';

interface ShoppingListContextType {
  items: ShoppingItem[];
  setItems: React.Dispatch<React.SetStateAction<ShoppingItem[]>>;
  refreshShoppingList: () => Promise<void>;
  isLoading: boolean;
}

const ShoppingListContext = createContext<ShoppingListContextType>({
  items: [],
  setItems: () => {},
  refreshShoppingList: async () => {},
  isLoading: false,
});

export const useShoppingListContext = () => useContext(ShoppingListContext);



export const ShoppingListProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<ShoppingItem[]>(() => {
    const cached = localStorage.getItem('cached_shopping_items');
    return cached ? JSON.parse(cached) : [];
  });
  const [isLoading, setIsLoading] = useState(false);

  const refreshShoppingList = useCallback(async () => {
    // Chỉ tải nếu user đã có nhóm gia đình
    if (!user?.family_id) {
      setItems([]);
      return;
    }
    
    try {
      setIsLoading(true);
      const data = await shoppingService.getShoppingItems();
      setItems(data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách mua sắm:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fetch data lần đầu
  useEffect(() => {
    refreshShoppingList();
  }, [refreshShoppingList]);



  // Cập nhật localStorage mỗi khi items thay đổi
  useEffect(() => {
    localStorage.setItem('cached_shopping_items', JSON.stringify(items));
  }, [items]);

  return (
    <ShoppingListContext.Provider value={{ items, setItems, refreshShoppingList, isLoading }}>
      {children}
    </ShoppingListContext.Provider>
  );
};
