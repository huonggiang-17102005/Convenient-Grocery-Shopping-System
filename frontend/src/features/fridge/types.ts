export type StorageType = 'Tất cả' | 'Ngăn mát' | 'Ngăn đông' | 'Khô';
export type FoodCategory = 'Tất cả' | 'Thịt cá' | 'Rau củ quả' | 'Trứng' | 'Chất lỏng' | 'Đồ khô' | 'Gia vị' | 'Khác';

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
}
