export interface MealPlan {
  id: string;
  family_id: string | null;
  added_by: string | null;
  recipe_id: string;
  date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | string;
  people_count: number;
  created_at?: string;
  updated_at?: string;
  // Optional relations populated by joins
  recipes?: any;
}