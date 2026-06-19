// Allow any string but keep autocomplete for some common ones
export type FoodCategory = string & {};

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
