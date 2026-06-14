export interface FridgeItem {
  id: string;
  family_id: string | null;
  name: string;
  quantity: number;
  unit: string;
  category: string | null;
  image_url: string | null;
  image_public_id: string | null;
  location: string | null;
  expiration_date: string;
  is_wasted: boolean | null;
  created_at?: string;
  updated_at?: string;
}