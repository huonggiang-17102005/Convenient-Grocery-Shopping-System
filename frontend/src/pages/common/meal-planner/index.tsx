// src/pages/common/meal-planner/index.tsx
// Wrapper theo role — truyền đúng role prop xuống MealPlannerFeature
import { MealPlannerFeature } from '@/features/meal-planner';

export function HomemakerMealPlanner() {
  return <MealPlannerFeature role="homemaker" />;
}

export function MemberMealPlanner() {
  return <MealPlannerFeature role="member" />;
}
