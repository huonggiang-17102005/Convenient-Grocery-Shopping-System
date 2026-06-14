import type { ShoppingListItem } from './ShoppingListItem.js';

export interface ShoppingList {
  id: string;
  family_id: string | null;
  title: string;
  target_date: string | null;
  status: 'Planning' | 'Shopping' | 'Completed' | null;
  items?: ShoppingListItem[];
  created_at?: string;
  updated_at?: string;
}