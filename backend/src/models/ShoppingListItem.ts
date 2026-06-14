export interface ShoppingListItem {
  id: string;
  list_id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  image_url: string | null;
  image_public_id: string | null;
  is_bought: boolean;
  assignee_id: string | null; // UUID referencing users.id
  deadline_date: string | null; // YYYY-MM-DD
  deadline_time: string | null; // HH:mm
  created_at?: string;
  updated_at?: string;
}
