import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: `${API_URL}/fridge`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fridgeService = {
  getFamilyFridge: async (familyId: string) => {
    const response = await api.get(`/family/${familyId}`);
    return response.data;
  },
  deductInventory: async (familyId: string, ingredients: { name: string; category: string; amountValue: string; amountUnit: string }[]) => {
    const response = await api.post('/deduct', { familyId, ingredients });
    return response.data;
  },
  getExpiringItems: async (familyId: string) => {
    const response = await api.get(`/family/${familyId}/expiring`);
    return response.data;
  },
  addFridgeItem: async (data: any) => {
    const response = await api.post('/', data);
    return response.data;
  },
  updateFridgeItem: async (id: string, data: any) => {
    const response = await api.put(`/${id}`, data);
    return response.data;
  },
  throwAwayFridgeItem: async (id: string) => {
    const response = await api.delete(`/${id}/waste`);
    return response.data;
  }
};
