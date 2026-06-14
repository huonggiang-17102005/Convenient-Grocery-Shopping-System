export interface Ingredient {
  category?: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id: string;
  author_id: string | null;
  name: string;
  description: string | null;
  image_url: string | null;
  image_public_id: string | null;
  cooking_time: number | null;
  difficulty: 'Dễ' | 'Trung bình' | 'Khó' | null;
  servings: number;
  ingredients: Ingredient[];
  instructions: string[];
  visibility: 'Private' | 'Public' | 'Pending' | null;
  likes_count: number | null;
  created_at?: string;
  updated_at?: string;
}