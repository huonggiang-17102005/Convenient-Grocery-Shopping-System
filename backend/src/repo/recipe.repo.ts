import supabase from '../config/db.config.js';
import type { Recipe } from '../models/Recipe.js';
import { InternalServerError, NotFoundError } from '../errors/CommonError.js';

export const getFamilyRecipes = async (familyId: string): Promise<Recipe[]> => {
  // First get all users in the family
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('family_id', familyId);

  if (userError) {
    console.error('Error fetching users for family recipes:', userError);
    throw new InternalServerError('Không thể lấy danh sách thành viên.');
  }

  const userIds = users.map((u: any) => u.id);

  if (userIds.length === 0) return [];

  // Get recipes created by these users that are Private
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .in('author_id', userIds)
    .eq('visibility', 'Private')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching family recipes:', error);
    throw new InternalServerError('Không thể lấy danh sách công thức.');
  }

  return data as Recipe[];
};

export const getSystemRecipes = async (): Promise<Recipe[]> => {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .is('author_id', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching system recipes:', error);
    throw new InternalServerError('Không thể lấy danh sách công thức hệ thống.');
  }

  return data as Recipe[];
};

export const getCommunityRecipes = async (): Promise<any[]> => {
  // Fetch public recipes with author info
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      author:users!author_id(id, full_name, avatar)
    `)
    .eq('visibility', 'Public')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching community recipes:', error);
    throw new InternalServerError('Không thể lấy danh sách công thức cộng đồng.');
  }

  return data;
};

export const getRecipeById = async (id: string): Promise<Recipe> => {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    throw new NotFoundError('Không tìm thấy công thức này.');
  }

  return data as Recipe;
};

export const createRecipe = async (recipe: Partial<Recipe>): Promise<Recipe> => {
  const { data, error } = await supabase
    .from('recipes')
    .insert([recipe])
    .select()
    .single();

  if (error) {
    console.error('Error creating recipe:', error);
    throw new InternalServerError('Không thể tạo công thức.');
  }

  return data as Recipe;
};

export const updateRecipe = async (id: string, recipeData: Partial<Recipe>): Promise<Recipe> => {
  const { data, error } = await supabase
    .from('recipes')
    .update(recipeData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating recipe:', error);
    throw new InternalServerError('Không thể cập nhật công thức.');
  }

  return data as Recipe;
};

export const deleteRecipe = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting recipe:', error);
    throw new InternalServerError('Không thể xóa công thức.');
  }
};

export const getUserFavoriteRecipes = async (userId: string): Promise<Recipe[]> => {
  // Query junction table and join with recipes
  const { data, error } = await supabase
    .from('user_favorite_recipes')
    .select(`
      recipe_id,
      recipes (*)
    `)
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching favorite recipes:', error);
    throw new InternalServerError('Không thể lấy danh sách công thức yêu thích.');
  }

  return data.map((d: any) => d.recipes) as Recipe[];
};

export const checkFavorite = async (userId: string, recipeId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('user_favorite_recipes')
    .select('*')
    .eq('user_id', userId)
    .eq('recipe_id', recipeId)
    .maybeSingle();

  if (error) return false;
  return !!data;
};

export const toggleFavorite = async (userId: string, recipeId: string): Promise<boolean> => {
  const isFav = await checkFavorite(userId, recipeId);

  if (isFav) {
    // Remove
    const { error } = await supabase
      .from('user_favorite_recipes')
      .delete()
      .eq('user_id', userId)
      .eq('recipe_id', recipeId);

    if (error) throw new InternalServerError('Lỗi khi bỏ yêu thích.');
    return false;
  } else {
    // Add
    const { error } = await supabase
      .from('user_favorite_recipes')
      .insert([{ user_id: userId, recipe_id: recipeId }]);

    if (error) throw new InternalServerError('Lỗi khi thêm yêu thích.');
    return true;
  }
};

export const updateRecipeLikes = async (recipeId: string, increment: boolean): Promise<number> => {
  const recipe = await getRecipeById(recipeId);
  const currentLikes = recipe.likes_count || 0;
  const newLikes = increment ? currentLikes + 1 : Math.max(0, currentLikes - 1);

  const { data, error } = await supabase
    .from('recipes')
    .update({ likes_count: newLikes })
    .eq('id', recipeId)
    .select('likes_count')
    .single();

  if (error) throw new InternalServerError('Không thể cập nhật lượt thích.');
  return data.likes_count;
};

// Utilities for Shopping List integration
export const getFridgeItems = async (familyId: string): Promise<any[]> => {
  const { data, error } = await supabase
    .from('fridge_items')
    .select('*')
    .eq('family_id', familyId);

  if (error) return [];
  return data;
};

export const getOrCreateShoppingList = async (familyId: string, userId: string): Promise<any> => {
  // Try to find an active shopping list (Planning or Shopping)
  const { data: activeList, error: err } = await supabase
    .from('shopping_lists')
    .select('*')
    .eq('family_id', familyId)
    .in('status', ['Planning', 'Shopping'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (activeList) return activeList;

  // Create a new one
  const newList = {
    family_id: familyId,
    title: 'Danh sách cần mua (Tự động)',
    status: 'Planning',
    target_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] // tomorrow
  };

  const { data: created, error: createErr } = await supabase
    .from('shopping_lists')
    .insert([newList])
    .select()
    .single();

  if (createErr) throw new InternalServerError('Không thể tạo Shopping List.');
  return created;
};
