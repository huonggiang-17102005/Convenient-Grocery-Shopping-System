export interface MealPlanItem {
  id: string;
  meal_plan_id: string;
  recipe_id: string;
  meal_type: 'Breakfast' | 'Lunch' | 'Dinner';
  created_at?: string;
  // Optional relations populated by joins
  recipe?: any; 
}

export interface MealPlan {
  id: string;
  family_id: string | null;
  date: string;
  created_at?: string;
  updated_at?: string;
  // Optional relations populated by joins
  items?: MealPlanItem[];
}