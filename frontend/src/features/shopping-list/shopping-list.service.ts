import type { ShoppingItem, FoodCategory } from './types';
import type { FoodItem, StorageType, FoodCategory as FridgeCategory } from '../fridge';

// Mock initial data for Shopping List
const INITIAL_SHOPPING_ITEMS: ShoppingItem[] = [
  {
    id: 's1',
    name: 'Thịt bò',
    category: 'Thịt cá',
    quantity: 500,
    unit: 'g',
    isBought: true,
    assigneeId: 'Shin',
    deadlineDate: '2026-06-11', // Today
    deadlineTime: '12:00'
  },
  {
    id: 's2',
    name: 'Cà chua',
    category: 'Rau củ',
    quantity: 3,
    unit: 'quả',
    isBought: false,
    assigneeId: 'Shin',
    deadlineDate: '2026-06-12',
    deadlineTime: '18:00'
  }
];

// Mock initial data for Refrigerator (for sync)
const INITIAL_FRIDGE_ITEMS = [
  { id: '1', emoji: '🥕', name: 'Cà rốt', quantity: 3, daysRemaining: 7, category: 'Rau củ', storageType: 'Ngăn mát' },
  { id: '2', emoji: '🥩', name: 'Thịt bò', quantity: 1, daysRemaining: 1, category: 'Thịt cá', storageType: 'Ngăn đông' },
  { id: '3', emoji: '🥛', name: 'Sữa tươi', quantity: 2, daysRemaining: 3, category: 'Đồ uống', storageType: 'Ngăn mát' },
  { id: '4', emoji: '🧅', name: 'Hành tây', quantity: 4, daysRemaining: 5, category: 'Rau củ', storageType: 'Khô' },
];

const LOCAL_STORAGE_KEY = 'homemaker_shopping_items';
const FRIDGE_LOCAL_STORAGE_KEY = 'homemaker_fridge_items';

const getCategoryEmoji = (category: FoodCategory): string => {
  switch (category) {
    case 'Thịt cá': return '🥩';
    case 'Rau củ': return '🍅';
    case 'Đồ uống': return '🥛';
    case 'Đồ khô': return '🍞';
    case 'Gia vị': return '🌶️';
    default: return '📦';
  }
};

export const shoppingService = {
  getShoppingItems(): ShoppingItem[] {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!data) {
      this.saveShoppingItems(INITIAL_SHOPPING_ITEMS);
      return INITIAL_SHOPPING_ITEMS;
    }
    return JSON.parse(data);
  },

  saveShoppingItems(items: ShoppingItem[]) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  },

  syncItemToFridge(item: ShoppingItem) {
    let fridgeItems: FoodItem[];
    const data = localStorage.getItem(FRIDGE_LOCAL_STORAGE_KEY);
    if (!data) {
      // Use existing mock fridge items as base
      fridgeItems = [...INITIAL_FRIDGE_ITEMS] as unknown as FoodItem[];
    } else {
      fridgeItems = JSON.parse(data);
    }

    // Try to find if item exists in fridge by name (case-insensitive)
    const existingIndex = fridgeItems.findIndex(
      (f: FoodItem) => f.name.toLowerCase() === item.name.toLowerCase()
    );

    if (existingIndex !== -1) {
      // Add quantity
      fridgeItems[existingIndex].quantity += item.quantity;
    } else {
      const newFridgeItem: FoodItem = {
        id: 'fridge_' + Date.now() + Math.random().toString(36).substr(2, 4),
        emoji: getCategoryEmoji(item.category),
        name: item.name,
        quantity: item.quantity,
        daysRemaining: 7, // default 7 days shelf life
        category: item.category as FridgeCategory,
        storageType: (item.category === 'Thịt cá' ? 'Ngăn đông' : 'Ngăn mát') as StorageType
      };
      fridgeItems.push(newFridgeItem);
    }

    localStorage.setItem(FRIDGE_LOCAL_STORAGE_KEY, JSON.stringify(fridgeItems));
  }
};
