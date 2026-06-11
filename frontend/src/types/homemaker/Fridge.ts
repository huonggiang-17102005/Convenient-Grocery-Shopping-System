export type StorageType = 'Tất cả' | 'Ngăn mát' | 'Ngăn đông' | 'Khô';
export type FoodCategory = 'Tất cả' | 'Rau củ' | 'Thịt cá' | 'Đồ khô' | 'Gia vị' | 'Chất lỏng' | 'Khác';

export interface FoodItem {
  id: string;
  emoji: string;
  name: string;
  quantity: number;
  daysRemaining: number;
  category: FoodCategory;
  storageType: StorageType;
}
