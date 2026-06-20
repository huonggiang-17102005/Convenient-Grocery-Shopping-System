import * as RecipeRepo from '../repo/recipe.repo.js';
import type { Recipe } from '../models/Recipe.js';
import { NotFoundError, ForbiddenError, InternalServerError } from '../errors/CommonError.js';
import * as notificationService from './notification.service.js';
import supabase from '../config/db.config.js';

/**
 * Get all private recipes for a family, mapped with isFavorited for the current user
 */
export const getFamilyRecipes = async (familyId: string, userId: string) => {
  const recipes = await RecipeRepo.getFamilyRecipes(familyId);
  const favorites = await RecipeRepo.getUserFavoriteRecipes(userId);
  const favIds = new Set(favorites.map(r => r.id));

  return recipes.map(recipe => ({
    ...recipe,
    isFavorited: favIds.has(recipe.id),
  }));
};

/**
 * Get all system recipes, mapped with isFavorited for the current user
 */
export const getSystemRecipes = async (userId: string) => {
  const recipes = await RecipeRepo.getSystemRecipes();
  const favorites = userId ? await RecipeRepo.getUserFavoriteRecipes(userId) : [];
  const favIds = new Set(favorites.map(r => r.id));

  return recipes.map(recipe => ({
    ...recipe,
    isFavorited: favIds.has(recipe.id),
  }));
};

/**
 * Get all public community recipes
 */
export const getCommunityRecipes = async (userId: string) => {
  const recipes = await RecipeRepo.getCommunityRecipes();
  const favorites = userId ? await RecipeRepo.getUserFavoriteRecipes(userId) : [];
  const favIds = new Set(favorites.map(r => r.id));
  
  // Format for frontend (frontend expects `author` object)
  return recipes.map(recipe => ({
    id: recipe.id,
    author: {
      id: recipe.author?.id,
      name: recipe.author?.full_name || 'Người dùng Ẩn danh',
      avatarEmoji: recipe.author?.avatar || '👤',
    },
    description: recipe.description || '',
    recipe: {
      ...recipe,
      author: undefined, // remove raw author object from nested recipe
      isFavorited: favIds.has(recipe.id),
    },
    postedAt: recipe.created_at,
    likes: recipe.likes_count || 0,
    isLiked: false, // We don't have a user_liked_recipes table yet
  }));
};

/**
 * Get user's favorite recipes
 */
export const getFavoriteRecipes = async (userId: string) => {
  const recipes = await RecipeRepo.getUserFavoriteRecipes(userId);
  return recipes.map(recipe => ({
    ...recipe,
    isFavorited: true,
  }));
};

/**
 * Create a new private recipe
 */
export const createRecipe = async (authorId: string, data: any) => {
  const newRecipe: Partial<Recipe> = {
    author_id: authorId,
    name: data.name,
    description: data.description || null,
    image_url: data.image_url || null,
    image_public_id: data.image_public_id || null,
    cooking_time: data.cookingTimeMinutes || data.cooking_time,
    difficulty: data.difficulty || 'Dễ',
    servings: data.servings || 1,
    ingredients: data.ingredients || [],
    instructions: data.steps ? data.steps.map((s: any) => s.description || s) : data.instructions || [],
    visibility: 'Private',
    likes_count: 0,
  };

  return RecipeRepo.createRecipe(newRecipe);
};

/**
 * Update a recipe
 */
export const updateRecipe = async (recipeId: string, authorId: string, data: any) => {
  const recipe = await RecipeRepo.getRecipeById(recipeId);
  
  if (recipe.author_id !== authorId) {
    throw new ForbiddenError('Bạn không có quyền sửa công thức này.');
  }

  const updateData: Partial<Recipe> = {
    name: data.name,
    description: data.description,
    image_url: data.image_url,
    image_public_id: data.image_public_id,
    cooking_time: data.cookingTimeMinutes || data.cooking_time,
    difficulty: data.difficulty,
    servings: data.servings,
    ingredients: data.ingredients,
    instructions: data.steps ? data.steps.map((s: any) => s.description || s) : data.instructions,
  };

  // Remove undefined fields
  Object.keys(updateData).forEach(key => {
    if ((updateData as any)[key] === undefined) {
      delete (updateData as any)[key];
    }
  });

  return RecipeRepo.updateRecipe(recipeId, updateData);
};

/**
 * Delete a recipe
 */
export const deleteRecipe = async (recipeId: string, authorId: string) => {
  const recipe = await RecipeRepo.getRecipeById(recipeId);
  
  if (recipe.author_id !== authorId) {
    throw new ForbiddenError('Bạn không có quyền xóa công thức này.');
  }

  await RecipeRepo.deleteRecipe(recipeId);
};

/**
 * Share a recipe to community (sets to Pending)
 */
export const shareToCommunity = async (recipeId: string, authorId: string, description: string) => {
  const recipe = await RecipeRepo.getRecipeById(recipeId);
  
  if (recipe.author_id !== authorId) {
    throw new ForbiddenError('Bạn không có quyền chia sẻ công thức này.');
  }

  return RecipeRepo.updateRecipe(recipeId, {
    visibility: 'Pending',
    description: description,
  });
};

/**
 * Toggle favorite
 */
export const toggleFavorite = async (userId: string, recipeId: string) => {
  const isFavorited = await RecipeRepo.toggleFavorite(userId, recipeId);
  return { isFavorited };
};

/**
 * Toggle like for a community post
 */
export const toggleLike = async (recipeId: string, user: any) => {
  const newLikes = await RecipeRepo.updateRecipeLikes(recipeId, true);
  
  // Create notification for the author
  const recipe = await RecipeRepo.getRecipeById(recipeId);
  if (recipe && recipe.author_id && recipe.author_id !== user.id) {
    // Get author's family_id
    const { data: author } = await supabase.from('users').select('family_id').eq('id', recipe.author_id).single();
    if (author && author.family_id) {
      const actorName = user.full_name || user.email || 'Một thành viên';
      await notificationService.createNotification(
        author.family_id,
        'LIKE',
        'Thích công thức',
        `${actorName} đã thích công thức ${recipe.name} của bạn.`,
        { user_id: user.id, actor_name: actorName, item_name: recipe.name, recipe_id: recipe.id }
      );
    }
  }

  return { likes: newLikes, isLiked: true };
};

/**
 * Add missing ingredients to shopping list
 */
export const addToShoppingList = async (recipeId: string, familyId: string, userId: string) => {
  const recipe = await RecipeRepo.getRecipeById(recipeId);
  const fridgeItems = await RecipeRepo.getFridgeItems(familyId);
  
  const missingItems: any[] = [];
  
  for (const ing of recipe.ingredients) {
    const categoryMatch = ing.category || 'Khác';
    const inFridge = fridgeItems.find(f => 
      f.category === categoryMatch && 
      f.name.toLowerCase() === ing.name.toLowerCase()
    );
    
    if (categoryMatch === 'Gia vị') {
      // Gia vị: chỉ kiểm tra xem có trong tủ không, không trừ định lượng
      if (!inFridge) {
        missingItems.push({
          name: ing.name,
          category: categoryMatch,
          quantity: 0,
          unit: ing.unit || '',
          imageUrl: '',
          imagePublicId: '',
          isBought: false,
          assigneeId: null
        });
      }
    } else {
      // Các loại khác: kiểm tra định lượng
      const fridgeQty = inFridge ? inFridge.quantity : 0;
      if (fridgeQty < ing.quantity) {
        missingItems.push({
          name: ing.name,
          category: categoryMatch,
          quantity: ing.quantity - fridgeQty,
          unit: ing.unit || '',
          imageUrl: '',
          imagePublicId: '',
          isBought: false,
          assigneeId: null
        });
      }
    }
  }

  if (missingItems.length === 0) {
    return { message: 'Đã đủ nguyên liệu trong tủ lạnh.' };
  }

  const shoppingList = await RecipeRepo.getOrCreateShoppingList(familyId, userId);
  
  // Fetch existing items for this list
  const { data: existingItems, error: fetchErr } = await supabase
    .from('shopping_list_items')
    .select('*')
    .eq('list_id', shoppingList.id);

  if (fetchErr) {
    console.error('Error fetching existing items in addToShoppingList:', fetchErr);
    throw new InternalServerError('Không thể lấy danh sách mua sắm hiện tại.');
  }

  for (const missing of missingItems) {
    const existing = existingItems.find((i: any) => 
      i.category === missing.category && 
      i.name.toLowerCase() === missing.name.toLowerCase()
    );

    if (existing) {
      const newQty = Number(existing.quantity) + missing.quantity;
      const { error: updateErr } = await supabase
        .from('shopping_list_items')
        .update({ quantity: newQty })
        .eq('id', existing.id);

      if (updateErr) {
        console.error('Error updating item quantity in addToShoppingList:', updateErr);
        throw new InternalServerError('Không thể cập nhật số lượng nguyên liệu mua sắm.');
      }
    } else {
      const { error: insertErr } = await supabase
        .from('shopping_list_items')
        .insert({
          list_id: shoppingList.id,
          name: missing.name,
          category: missing.category,
          quantity: missing.quantity || 1,
          unit: missing.unit,
          is_bought: false,
          deadline_date: new Date().toISOString().split('T')[0]
        });

      if (insertErr) {
        console.error('Error inserting item in addToShoppingList:', insertErr);
        throw new InternalServerError('Không thể thêm nguyên liệu vào danh sách mua sắm.');
      }
    }
  }
  
  return { message: `Đã thêm ${missingItems.length} nguyên liệu vào danh sách mua sắm.`, missingItems };
};
