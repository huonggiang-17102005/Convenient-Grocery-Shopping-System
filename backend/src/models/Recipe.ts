export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id: string;
  author_id: string;
  name: string;
  description: string;
  image_url: string;
  image_public_id: string;
  cooking_time: number;
  difficulty: 'Dễ' | 'Trung bình' | 'Khó';
  servings: number;
  ingredients: Ingredient[];
  instructions: string[];
  visibility: 'Private' | 'Public';
  likes_count: number;
  created_at?: string;
  updated_at?: string;
}