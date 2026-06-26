import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { WeekPlan, MealKey } from '../features/meal-planner/types';
import type { Recipe } from '../features/recipes/types';
import { mealPlannerService } from '../features/meal-planner/mealPlanner.service';
import { recipesService } from '../features/recipes/recipes.service';
import { useAuth } from './AuthContext';

export interface CookIngredient {
  name: string;
  category: string;
  amountValue: string;
  amountUnit: string;
}

export interface MealItem {
  session: 'morning' | 'noon' | 'evening';
  dish: string;
}

interface MealPlannerContextType {
  plansByWeek: Record<string, WeekPlan>;
  setPlansByWeek: React.Dispatch<React.SetStateAction<Record<string, WeekPlan>>>;
  availableRecipes: Recipe[];
  setAvailableRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;
  fetchWeekPlan: (startDate: string, endDate: string, force?: boolean) => Promise<WeekPlan | null>;
  getTodayPlan: () => { todayMeals: MealItem[], todayIngredients: CookIngredient[] };
  isLoading: boolean;
}

const MealPlannerContext = createContext<MealPlannerContextType>({
  plansByWeek: {},
  setPlansByWeek: () => {},
  availableRecipes: [],
  setAvailableRecipes: () => {},
  fetchWeekPlan: async () => null,
  getTodayPlan: () => ({ todayMeals: [], todayIngredients: [] }),
  isLoading: false,
});

export const useMealPlannerContext = () => useContext(MealPlannerContext);

export const MealPlannerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [plansByWeek, setPlansByWeek] = useState<Record<string, WeekPlan>>({});
  const [availableRecipes, setAvailableRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Lấy danh sách công thức nấu ăn 1 lần
  useEffect(() => {
    if (!user?.family_id) return;
    Promise.all([
      recipesService.getFamilyRecipes().catch(() => []),
      recipesService.getFavoriteRecipes().catch(() => [])
    ]).then(([family, favs]) => {
      const map = new Map<string, Recipe>();
      // Chỉ lấy các công thức gia đình là Private và được tạo bởi thành viên gia đình (authorId !== null)
      family.forEach(r => {
        if (r.visibility === 'Private' && r.authorId !== null) {
          map.set(r.id, r);
        }
      });
      // Lấy tất cả các công thức trong danh sách yêu thích
      favs.forEach(r => map.set(r.id, r));
      setAvailableRecipes(Array.from(map.values()));
    });
  }, [user]);

  const fetchWeekPlan = useCallback(async (startDate: string, endDate: string, force: boolean = false) => {
    if (!user?.family_id) return null;
    const cacheKey = `${startDate}_${endDate}`;
    
    if (!force && plansByWeek[cacheKey]) {
      return plansByWeek[cacheKey];
    }

    try {
      setIsLoading(true);
      const plans = await mealPlannerService.getMealPlan(startDate, endDate);
      
      const newPlan: WeekPlan = {
        mon: { breakfast: [], lunch: [], dinner: [] },
        tue: { breakfast: [], lunch: [], dinner: [] },
        wed: { breakfast: [], lunch: [], dinner: [] },
        thu: { breakfast: [], lunch: [], dinner: [] },
        fri: { breakfast: [], lunch: [], dinner: [] },
        sat: { breakfast: [], lunch: [], dinner: [] },
        sun: { breakfast: [], lunch: [], dinner: [] },
      };

      plans.forEach((p: any) => {
        const parts = p.date.split('-');
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const dVal = parseInt(parts[2], 10);
        const d = new Date(y, m, dVal);
        const dayOfWeek = d.getDay();
        const keys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        const key = keys[dayOfWeek];
        if (newPlan[key] && newPlan[key][p.meal_type as MealKey]) {
          newPlan[key][p.meal_type as MealKey].push({
            id: p.id,
            people_count: p.people_count,
            isCooked: p.isCooked ?? false,
            isShopped: p.isShopped ?? false,
            recipe: {
              id: p.recipes.id,
              name: p.recipes.name,
              emoji: p.recipes.emoji || '🍽️',
              cookTimeMinutes: p.recipes.cooking_time || 30,
              imageUrl: p.recipes.image_url,
              difficulty: (p.recipes.difficulty as 'Dễ' | 'Trung bình' | 'Khó') || ('Dễ' as 'Dễ'),
              servings: p.recipes.servings || 1,
              ingredients: (p.recipes.ingredients || []).map((ing: any, i: number) => ({
                id: ing.id || `ing_${i}`,
                category: ing.category || 'Khác',
                name: ing.name,
                amount: Number(ing.quantity ?? ing.amount ?? 0),
                unit: ing.unit || '',
                imageUrl: ing.imageUrl || ing.image_url || '',
              })),
              steps: p.recipes.instructions ? p.recipes.instructions.map((desc: string, i: number) => ({ id: `s_${i}`, description: desc })) : [],
              isFavorited: false,
              calories: p.recipes.calories || 0,
              protein: p.recipes.protein || 0,
              fat: p.recipes.fat || 0,
              carbs: p.recipes.carbs || 0
            }
          });
        }
      });

      setPlansByWeek(prev => ({ ...prev, [cacheKey]: newPlan }));
      return newPlan;
    } catch (err) {
      console.error('Lỗi khi tải thực đơn tuần:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, plansByWeek]);

  // Dashboard helper
  const getTodayPlan = useCallback(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMon);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const formatDate = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${dd}`;
    };

    const cacheKey = `${formatDate(monday)}_${formatDate(sunday)}`;
    const currentWeekPlan = plansByWeek[cacheKey];

    const mealMap: Record<string, string[]> = { breakfast: [], lunch: [], dinner: [] };
    const ingMap = new Map<string, CookIngredient>();

    if (currentWeekPlan) {
      const keys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
      const key = keys[dayOfWeek];
      const todayMealsObj = currentWeekPlan[key];

      if (todayMealsObj) {
        ['breakfast', 'lunch', 'dinner'].forEach((mealKey) => {
          const arr = todayMealsObj[mealKey as MealKey] || [];
          arr.forEach(pm => {
            if (pm.recipe.name) {
              mealMap[mealKey].push(pm.recipe.name + (pm.isCooked ? ' (Đã nấu)' : ''));
            }
            if (pm.isCooked) return; // Skip cooked items for ingredient calculation!
            if (pm.recipe.ingredients) {
              const multiplier = (pm.people_count || 1) / (pm.recipe.servings || 1);
              pm.recipe.ingredients.forEach(ing => {
                const ik = ing.name.toLowerCase();
                const current = ingMap.get(ik);
                const parsedAmount = Number(ing.amount ?? (ing as any).quantity) || 0;
                const addedAmount = parsedAmount * multiplier;
                if (current) {
                  const newVal = parseFloat(current.amountValue) + addedAmount;
                  current.amountValue = String(Math.round(newVal * 100) / 100);
                } else {
                  ingMap.set(ik, {
                    name: ing.name,
                    category: ing.category || 'Khác',
                    amountValue: String(Math.round(addedAmount * 100) / 100),
                    amountUnit: ing.unit
                  });
                }
              });
            }
          });
        });
      }
    }

    const todayMeals: MealItem[] = [
      { session: 'morning', dish: mealMap.breakfast.length > 0 ? mealMap.breakfast.join(', ') : 'Chưa có kế hoạch' },
      { session: 'noon', dish: mealMap.lunch.length > 0 ? mealMap.lunch.join(', ') : 'Chưa có kế hoạch' },
      { session: 'evening', dish: mealMap.dinner.length > 0 ? mealMap.dinner.join(', ') : 'Chưa có kế hoạch' }
    ];

    return {
      todayMeals,
      todayIngredients: Array.from(ingMap.values())
    };
  }, [plansByWeek]);

  // Load current week on mount
  useEffect(() => {
    if (!user?.family_id) return;
    const today = new Date();
    const diffToMon = today.getDay() === 0 ? -6 : 1 - today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMon);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const formatDate = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${dd}`;
    };

    fetchWeekPlan(formatDate(monday), formatDate(sunday));
  }, [user, fetchWeekPlan]);

  return (
    <MealPlannerContext.Provider value={{ plansByWeek, setPlansByWeek, availableRecipes, setAvailableRecipes, fetchWeekPlan, getTodayPlan, isLoading }}>
      {children}
    </MealPlannerContext.Provider>
  );
};
