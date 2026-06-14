export interface InventoryLog {
  id: string;
  family_id: string | null;
  category: string;
  action_type: string;
  amount: number;
  unit: string;
  created_at?: string;
}
