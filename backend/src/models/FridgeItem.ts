export interface FridgeItem {
  id: string;
  family_id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  image_url: string;
  image_public_id: string;
  location: string;
  expiration_date: string;
  is_wasted: boolean;
  created_at?: string;
  updated_at?: string;
}