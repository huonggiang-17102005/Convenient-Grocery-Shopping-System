// Shared types for MealPlanner feature

import type { Recipe } from '../recipes/types';

export type { Recipe };

export type MealKey = 'breakfast' | 'lunch' | 'dinner';

export interface PlannedMeal {
  id: string; // The meal_plan id from database
  recipe: Recipe;
}

export interface DayMeals {
  breakfast: PlannedMeal[];
  lunch: PlannedMeal[];
  dinner: PlannedMeal[];
}

export type WeekPlan = Record<string, DayMeals>;
