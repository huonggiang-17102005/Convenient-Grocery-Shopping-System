// Shared types for MealPlanner feature

export interface Recipe {
  id: string;
  name: string;
  emoji: string;
  duration: string; // e.g. '25 phút'
}

export type MealKey = 'breakfast' | 'lunch' | 'dinner';

export interface DayMeals {
  breakfast: Recipe[];
  lunch: Recipe[];
  dinner: Recipe[];
}

export type WeekPlan = Record<string, DayMeals>;
