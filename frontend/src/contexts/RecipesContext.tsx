import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { Recipe, CommunityPost } from '../features/recipes/types';
import { recipesService } from '../features/recipes/recipes.service';
import { useAuth } from './AuthContext';
import { useFridgeContext } from './FridgeContext';
import { isIngredientMatch } from '../utils/ingredientMatcher';

interface RecipesContextType {
  recipes: Recipe[];
  setRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;
  systemRecipes: Recipe[];
  setSystemRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;
  favoriteRecipes: Recipe[];
  setFavoriteRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;
  communityPosts: CommunityPost[];
  setCommunityPosts: React.Dispatch<React.SetStateAction<CommunityPost[]>>;
  refreshRecipes: () => Promise<void>;
  isLoading: boolean;
}

const RecipesContext = createContext<RecipesContextType>({
  recipes: [],
  setRecipes: () => {},
  systemRecipes: [],
  setSystemRecipes: () => {},
  favoriteRecipes: [],
  setFavoriteRecipes: () => {},
  communityPosts: [],
  setCommunityPosts: () => {},
  refreshRecipes: async () => {},
  isLoading: false,
});

export const useRecipesContext = () => useContext(RecipesContext);

export const RecipesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { items: fridgeItems } = useFridgeContext();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [systemRecipes, setSystemRecipes] = useState<Recipe[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Lọc ra các đồ sắp hết hạn trong tủ lạnh
  const expiringFridgeItems = useMemo(() => {
    return (fridgeItems || []).filter((item) => item.daysRemaining != null && item.daysRemaining <= 3);
  }, [fridgeItems]);

  // 2. Hàm map cờ ưu tiên vào từng công thức
  const mapRecipePriority = useCallback(
    (recipe: Recipe): Recipe => {
      let expiringCount = 0;
      const mappedIngredients = recipe.ingredients.map((ing) => {
        const isExp = expiringFridgeItems.some((item) => isIngredientMatch(ing.name, item.name));
        if (isExp) expiringCount++;
        return { ...ing, isExpiringSoon: isExp };
      });

      return {
        ...recipe,
        ingredients: mappedIngredients,
        isPriority: expiringCount > 0,
        expiringCount,
      };
    },
    [expiringFridgeItems]
  );

  // 3. Tính toán lại danh sách hiển thị tự động khi recipes hoặc fridgeItems thay đổi
  const mappedRecipes = useMemo(() => recipes.map(mapRecipePriority), [recipes, mapRecipePriority]);
  const mappedSystemRecipes = useMemo(() => systemRecipes.map(mapRecipePriority), [systemRecipes, mapRecipePriority]);
  const mappedFavoriteRecipes = useMemo(() => favoriteRecipes.map(mapRecipePriority), [favoriteRecipes, mapRecipePriority]);
  const mappedCommunityPosts = useMemo(
    () =>
      communityPosts.map((post) => ({
        ...post,
        recipe: mapRecipePriority(post.recipe),
      })),
    [communityPosts, mapRecipePriority]
  );

  const refreshRecipes = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const [familyRecipes, sysRecipes, favRecipes, posts] = (await Promise.all([
        user.family_id ? recipesService.getFamilyRecipes().catch(() => []) : Promise.resolve([]),
        recipesService.getSystemRecipes().catch(() => []),
        recipesService.getFavoriteRecipes().catch(() => []),
        recipesService.getCommunityRecipes().catch(() => []),
      ])) as [Recipe[], Recipe[], Recipe[], CommunityPost[]];
      
      const favMap = new Map<string, boolean>(favRecipes.map(r => [r.id, true]));
      const allRecipes = familyRecipes.map(r => ({
        ...r,
        isFavorited: r.isFavorited || favMap.has(r.id),
      }));
      
      const allSystemRecipes = sysRecipes.map(r => ({
        ...r,
        isFavorited: r.isFavorited || favMap.has(r.id),
      }));
      
      setRecipes(allRecipes);
      setSystemRecipes(allSystemRecipes);
      setFavoriteRecipes(favRecipes);
      setCommunityPosts(posts);
    } catch (error) {
      console.error('Lỗi tải danh sách công thức:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshRecipes();
  }, [refreshRecipes]);

  return (
    <RecipesContext.Provider 
      value={{ 
        recipes: mappedRecipes, setRecipes, 
        systemRecipes: mappedSystemRecipes, setSystemRecipes,
        favoriteRecipes: mappedFavoriteRecipes, setFavoriteRecipes, 
        communityPosts: mappedCommunityPosts, setCommunityPosts, 
        refreshRecipes, isLoading 
      }}
    >
      {children}
    </RecipesContext.Provider>
  );
};
