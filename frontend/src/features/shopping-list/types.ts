export type FoodCategory = 'Thịt cá' | 'Rau củ' | 'Đồ khô' | 'Gia vị' | 'Đồ uống' | 'Khác';

/** Item trong shopping list — tương ứng bảng shopping_list_items */
export interface ShoppingItem {
  id: string;
  list_id: string;
  name: string;
  category: FoodCategory;
  quantity: number;
  unit: string;
  image_url: string | null;
  image_public_id: string | null;
  is_bought: boolean;
  assignee_id: string | null; // UUID của user trong DB
  deadline_date: string | null; // YYYY-MM-DD
  deadline_time: string | null; // HH:mm
  created_at?: string;
  updated_at?: string;
}

/** Shopping list — tương ứng bảng shopping_lists */
export interface ShoppingList {
  id: string;
  family_id: string;
  title: string;
  target_date: string | null;
  status: 'Planning' | 'Shopping' | 'Completed';
  items: ShoppingItem[];
  created_at?: string;
  updated_at?: string;
}

/** Payload để tạo mới item */
export interface CreateItemPayload {
  name: string;
  category: FoodCategory;
  quantity: number;
  unit: string;
  assignee_id?: string | null;
  deadline_date?: string | null;
  deadline_time?: string | null;
}

/** Payload để cập nhật item */
export type UpdateItemPayload = Partial<CreateItemPayload & { is_bought: boolean }>;
