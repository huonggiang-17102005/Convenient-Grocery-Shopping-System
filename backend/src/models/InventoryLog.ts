export interface InventoryLog {
  id: string;
  family_id: string | null;
  action_type: string;
  category: string;
  unit: string;
  amount: number;
  created_at?: string;
}
