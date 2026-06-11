export interface Meal {
  mealType: 'Breakfast' | 'Lunch' | 'Dinner';
  recipeId: string;
}

export interface MealPlan {
  id: string;
  family_id: string | null;
  date: string;
  meals: Meal[];
  created_at?: string;
  updated_at?: string;
}