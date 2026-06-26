import axios from 'axios';
import type { MealKey } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: `${API_URL}/meal-planner`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const mealPlannerService = {
  getMealPlan: async (startDate: string, endDate: string) => {
    const response = await api.get('/', { params: { startDate, endDate } });
    return response.data;
  },

  addMealPlan: async (recipeIds: string | string[], date: string, mealType: MealKey, peopleCount: number) => {
    const payload = Array.isArray(recipeIds) ? recipeIds : [recipeIds];
    const response = await api.post('', { recipeId: payload, date, mealType, peopleCount });
    return response.data;
  },

  updateServings: async (date: string, mealType: MealKey, peopleCount: number) => {
    const response = await api.patch('/servings', { date, mealType, peopleCount });
    return response.data;
  },

  removeMealPlan: async (id: string) => {
    const response = await api.delete(`/${id}`);
    return response.data;
  }
};
