import { supabase } from '../config/supabase.config';

export const mealPlannerService = {
  getMealPlan: async (familyId: string, startDate: string, endDate: string) => {
    const { data, error } = await supabase
      .from('meal_plans')
      .select('*, recipes!inner(*)')
      .eq('family_id', familyId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) throw error;
    return data;
  },

  addMealPlan: async (
    familyId: string, 
    userId: string, 
    recipeId: string, 
    date: string, 
    mealType: string
  ) => {
    // Thêm món ăn vào kế hoạch
    const { data, error } = await supabase
      .from('meal_plans')
      .insert([
        {
          family_id: familyId,
          added_by: userId,
          recipe_id: recipeId,
          date,
          meal_type: mealType
        }
      ])
      .select('*, recipes!inner(*)')
      .single();

    if (error) throw error;
    return data;
  },

  removeMealPlan: async (familyId: string, id: string) => {
    const { error } = await supabase
      .from('meal_plans')
      .delete()
      .eq('id', id)
      .eq('family_id', familyId);

    if (error) throw error;
    return { message: 'Đã xóa khỏi kế hoạch' };
  }
};
