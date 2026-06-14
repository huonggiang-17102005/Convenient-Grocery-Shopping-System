import supabase from '../config/db.config.js';

export const mealPlannerService = {
  getMealPlan: async (familyId: string, startDate: string, endDate: string) => {
    // Query meal_plans and join meal_plan_items and recipes
    const { data: plans, error } = await supabase
      .from('meal_plans')
      .select('*, meal_plan_items(*, recipes(*))')
      .eq('family_id', familyId)
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) {
      console.error('Error fetching meal plans:', error);
      throw error;
    }

    // Flatten plans to the structure expected by the frontend
    const result: any[] = [];
    if (plans) {
      for (const plan of plans) {
        if (plan.meal_plan_items && plan.meal_plan_items.length > 0) {
          for (const item of plan.meal_plan_items) {
            if (item.recipes) {
              result.push({
                id: item.id, // item id (used for deletion in frontend)
                date: plan.date,
                meal_type: item.meal_type,
                people_count: plan.people_count,
                recipes: item.recipes // nested recipe details
              });
            }
          }
        }
      }
    }
    
    // Sort by date ascending
    result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return result;
  },

  addMealPlan: async (
    familyId: string, 
    userId: string, 
    recipeId: string, 
    date: string, 
    mealType: string,
    peopleCount: number
  ) => {
    // 1. Find or create the meal plan parent row for that date
    let { data: plan, error: findError } = await supabase
      .from('meal_plans')
      .select('id')
      .eq('family_id', familyId)
      .eq('date', date)
      .maybeSingle();

    if (findError) {
      console.error('Error finding meal plan parent:', findError);
      throw findError;
    }

    if (!plan) {
      const { data: newPlan, error: insertError } = await supabase
        .from('meal_plans')
        .insert({
          family_id: familyId,
          date: date,
          people_count: peopleCount
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('Error inserting meal plan parent:', insertError);
        throw insertError;
      }
      plan = newPlan;
    } else {
      // Update people_count if it changed
      await supabase
        .from('meal_plans')
        .update({ people_count: peopleCount })
        .eq('id', plan.id);
    }

    // 2. Insert into meal_plan_items
    const { data: item, error: itemError } = await supabase
      .from('meal_plan_items')
      .insert({
        meal_plan_id: plan.id,
        recipe_id: recipeId,
        meal_type: mealType
      })
      .select('*, recipes(*)')
      .single();

    if (itemError) {
      console.error('Error inserting meal plan item:', itemError);
      throw itemError;
    }

    return {
      id: item.id,
      date: date,
      meal_type: item.meal_type,
      people_count: peopleCount,
      recipes: item.recipes
    };
  },

  removeMealPlan: async (familyId: string, id: string) => {
    const { error } = await supabase
      .from('meal_plan_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error removing meal plan item:', error);
      throw error;
    }
    return { message: 'Đã xóa khỏi kế hoạch' };
  }
};
