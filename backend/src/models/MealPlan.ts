export interface MealPlanItem {
  id: string;
  meal_plan_id: string;
  recipe_id: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | string;
  created_at?: string;
  recipe?: any; // populated by join
}

export interface MealPlan {
  id: string;
  family_id: string | null;
  date: string;
  created_at?: string;
  updated_at?: string;
  items?: MealPlanItem[];
}