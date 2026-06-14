export type FoodCategory = 'Thịt cá' | 'Rau củ quả' | 'Trứng' | 'Chất lỏng' | 'Đồ khô' | 'Gia vị' | 'Khác';

export interface ShoppingItem {
  id: string;
  name: string;
  category: FoodCategory;
  quantity: number;
  unit: string;
  isBought: boolean;
  assigneeId: 'Kat' | 'Shin' | string | null;
  deadlineDate: string; // YYYY-MM-DD
  deadlineTime: string; // HH:mm
  imageUrl?: string | null;
  imagePublicId?: string | null;
}

export interface FamilyMember {
  id: 'Kat' | 'Shin';
  name: string;
  avatarColor: string;
}
