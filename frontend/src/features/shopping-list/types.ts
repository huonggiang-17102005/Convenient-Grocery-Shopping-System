export type FoodCategory = 'Thịt cá' | 'Rau củ' | 'Đồ khô' | 'Gia vị' | 'Đồ uống' | 'Khác';

export interface ShoppingItem {
  id: string;
  name: string;
  category: FoodCategory;
  quantity: number;
  unit: string;
  isBought: boolean;
  assigneeId: 'Kat' | 'Shin' | null;
  deadlineDate: string; // YYYY-MM-DD
  deadlineTime: string; // HH:mm
}

export interface FamilyMember {
  id: 'Kat' | 'Shin';
  name: string;
  avatarColor: string;
}
