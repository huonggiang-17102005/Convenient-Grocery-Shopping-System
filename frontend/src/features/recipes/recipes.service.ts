import axios from 'axios';
import type { Recipe, CommunityPost } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create a configured axios instance
const api = axios.create({
  baseURL: `${API_URL}/recipes`,
});

// Interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Mapper to convert backend recipe shape to frontend expected shape
const mapBackendToFrontendRecipe = (item: any): Recipe => {
  return {
    id: item.id,
    name: item.name,
    emoji: item.emoji || '🍽️', // Backend doesn't have emoji yet, default to icon
    imageUrl: item.image_url,
    cookTimeMinutes: item.cooking_time || 30,
    difficulty: item.difficulty || 'Dễ',
    servings: item.servings || 4,
    ingredients: (item.ingredients || []).map((ing: any, i: number) => ({
      id: `ing_${i}`,
      category: ing.category || 'Khác',
      name: ing.name,
      amount: ing.quantity || 0,
      unit: ing.unit || '',
      imageUrl: ing.image_url,
    })),
    steps: (item.instructions || []).map((inst: string, i: number) => ({
      id: `step_${i}`,
      description: inst,
    })),
    isFavorited: !!item.isFavorited,
  };
};

export const recipesService = {
  getFamilyRecipes: async (): Promise<Recipe[]> => {
    const response = await api.get('/family');
    return response.data.map(mapBackendToFrontendRecipe);
  },

  getCommunityRecipes: async (): Promise<CommunityPost[]> => {
    const response = await api.get('/community');
    return response.data.map((post: any) => ({
      id: post.id, // Using recipe id as post id for simplicity
      author: post.author,
      description: post.description,
      recipe: mapBackendToFrontendRecipe(post.recipe),
      postedAt: post.postedAt,
      likes: post.likes,
      isLiked: post.isLiked,
    }));
  },

  getFavoriteRecipes: async (): Promise<Recipe[]> => {
    const response = await api.get('/favorites');
    return response.data.map(mapBackendToFrontendRecipe);
  },

  createRecipe: async (recipe: Omit<Recipe, 'id' | 'isFavorited'>): Promise<Recipe> => {
    const response = await api.post('', recipe);
    return mapBackendToFrontendRecipe(response.data);
  },

  updateRecipe: async (id: string, recipe: Partial<Recipe>): Promise<Recipe> => {
    const response = await api.put(`/${id}`, recipe);
    return mapBackendToFrontendRecipe(response.data);
  },

  deleteRecipe: async (id: string): Promise<void> => {
    await api.delete(`/${id}`);
  },

  shareToCommunity: async (id: string, description: string): Promise<Recipe> => {
    const response = await api.post(`/${id}/share`, { description });
    return response.data;
  },

  toggleFavorite: async (id: string): Promise<{ isFavorited: boolean }> => {
    const response = await api.post(`/${id}/favorite`);
    return response.data;
  },

  toggleLike: async (id: string): Promise<{ likes: number; isLiked: boolean }> => {
    const response = await api.post(`/${id}/like`);
    return response.data;
  },

  addToShoppingList: async (id: string): Promise<{ message: string; missingItems: any[] }> => {
    const response = await api.post(`/${id}/shopping-list`);
    return response.data;
  },
};
