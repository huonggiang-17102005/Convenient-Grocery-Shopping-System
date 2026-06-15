import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Recipe, CommunityPost } from '../features/recipes/types';
import { recipesService } from '../features/recipes/recipes.service';
import { useAuth } from './AuthContext';

interface RecipesContextType {
  recipes: Recipe[];
  setRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;
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
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshRecipes = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const [familyRecipes, favRecipes, posts] = (await Promise.all([
        user.family_id ? recipesService.getFamilyRecipes().catch(() => []) : Promise.resolve([]),
        recipesService.getFavoriteRecipes().catch(() => []),
        recipesService.getCommunityRecipes().catch(() => []),
      ])) as [Recipe[], Recipe[], CommunityPost[]];
      
      const favMap = new Map<string, boolean>(favRecipes.map(r => [r.id, true]));
      const allRecipes = familyRecipes.map(r => ({
        ...r,
        isFavorited: r.isFavorited || favMap.has(r.id),
      }));
      
      setRecipes(allRecipes);
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
        recipes, setRecipes, 
        favoriteRecipes, setFavoriteRecipes, 
        communityPosts, setCommunityPosts, 
        refreshRecipes, isLoading 
      }}
    >
      {children}
    </RecipesContext.Provider>
  );
};
