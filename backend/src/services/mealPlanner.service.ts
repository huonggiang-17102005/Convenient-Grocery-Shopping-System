import supabase from '../config/db.config.js';
import * as notificationService from './notification.service.js';

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
    recipeIdOrIds: string | string[], 
    date: string, 
    mealType: string,
    peopleCount: number,
    user?: any
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
    const recipeIds = Array.isArray(recipeIdOrIds) ? recipeIdOrIds : [recipeIdOrIds];
    
    if (recipeIds.length === 0) return [];

    const insertData = recipeIds.map(rId => ({
      meal_plan_id: plan.id,
      recipe_id: rId,
      meal_type: mealType
    }));

    const { data: items, error: itemError } = await supabase
      .from('meal_plan_items')
      .insert(insertData)
      .select('*, recipes(*)');

    if (itemError) {
      console.error('Error inserting meal plan item:', itemError);
      throw itemError;
    }

    if (user && items && items.length > 0) {
      const actorName = user.full_name || user.email || 'Một thành viên';
      const formattedDate = new Date(date).toLocaleDateString('vi-VN');
      
      const recipeNames = items.filter(i => i.recipes).map(i => i.recipes.name).join(', ');
      
      const mealTypeMap: Record<string, string> = { breakfast: 'Sáng', lunch: 'Trưa', dinner: 'Tối' };
      const vietnameseMealType = mealTypeMap[mealType] || mealType;
      
      await notificationService.createNotification(
        familyId,
        'MEAL_PLAN_ADD',
        'Thêm món vào thực đơn',
        `${actorName} đã thêm món ${recipeNames} vào bữa ${vietnameseMealType} ngày ${formattedDate}.`,
        { 
          user_id: user.id, 
          actor_name: actorName, 
          recipe_names: recipeNames,
          meal_type: mealType,
          date: date
        }
      );
    }

    return items.map(item => ({
      id: item.id,
      date: date,
      meal_type: item.meal_type,
      people_count: peopleCount,
      recipes: item.recipes
    }));
  },

  removeMealPlan: async (familyId: string, id: string, user?: any) => {
    // Fetch details first to notify
    const { data: item } = await supabase
      .from('meal_plan_items')
      .select('*, meal_plans(date), recipes(name)')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('meal_plan_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error removing meal plan item:', error);
      throw error;
    }

    if (user && item && item.recipes && item.meal_plans) {
      const actorName = user.full_name || user.email || 'Một thành viên';
      const formattedDate = new Date(item.meal_plans.date).toLocaleDateString('vi-VN');
      
      const mealTypeMap: Record<string, string> = { breakfast: 'Sáng', lunch: 'Trưa', dinner: 'Tối' };
      const vietnameseMealType = mealTypeMap[item.meal_type] || item.meal_type;

      await notificationService.createNotification(
        familyId,
        'MEAL_PLAN_REMOVE',
        'Xóa món khỏi thực đơn',
        `${actorName} đã xóa món ${item.recipes.name} khỏi bữa ${vietnameseMealType} ngày ${formattedDate}.`,
        { 
          user_id: user.id, 
          actor_name: actorName, 
          recipe_name: item.recipes.name,
          meal_type: item.meal_type,
          date: item.meal_plans.date
        }
      );
    }

    return { message: 'Đã xóa khỏi kế hoạch' };
  }
};
