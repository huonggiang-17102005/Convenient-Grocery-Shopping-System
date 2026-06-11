export interface ShoppingItem {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  imageUrl: string;
  imagePublicId: string;
  isBought: boolean;
  assigneeId: string | null;
}

export interface ShoppingList {
  id: string;
  family_id: string | null;
  title: string;
  target_date: string | null;
  status: 'Planning' | 'Shopping' | 'Completed' | null;
  items: ShoppingItem[];
  created_at?: string;
  updated_at?: string;
}