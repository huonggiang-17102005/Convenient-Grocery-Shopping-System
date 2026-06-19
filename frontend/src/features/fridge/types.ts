export type StorageType = 'Tất cả' | 'Ngăn mát' | 'Ngăn đông' | 'Khô';
// Allow any string but keep autocomplete
export type FoodCategory = string & {};

export interface FoodItem {
  id: string;
  emoji: string;
  name: string;
  quantity: number;
  unit?: string;
  daysRemaining: number;
  category: FoodCategory;
  storageType: StorageType;
  expiryDate?: string;
  image?: string;
  imagePublicId?: string;
}
