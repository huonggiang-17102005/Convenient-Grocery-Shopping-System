import axios from 'axios';
import type { ShoppingItem } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: `${API_URL}/shopping-list`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const mapBackendToFrontend = (item: any): ShoppingItem => {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    quantity: Number(item.quantity),
    unit: item.unit,
    isBought: item.isBought,
    assigneeId: item.assigneeId || null,
    deadlineDate: item.deadlineDate,
    deadlineTime: item.deadlineTime,
    imageUrl: item.imageUrl,
    imagePublicId: item.imagePublicId
  };
};

const mapFrontendToBackend = (itemData: any) => {
  const mapped: any = { ...itemData };
  // assigneeId is now a real string (UUID) or null, pass it exactly as is
  return mapped;
};

export const shoppingService = {
  async getShoppingItems(): Promise<ShoppingItem[]> {
    const response = await api.get('/items');
    return response.data.map(mapBackendToFrontend);
  },

  async createShoppingItem(itemData: Omit<ShoppingItem, 'id' | 'isBought' | 'assigneeId'>): Promise<ShoppingItem> {
    const response = await api.post('/items', mapFrontendToBackend(itemData));
    return mapBackendToFrontend(response.data);
  },

  async updateShoppingItem(id: string, itemData: Partial<ShoppingItem> & { location?: string, expirationDate?: string }): Promise<ShoppingItem> {
    const response = await api.patch(`/items/${id}`, mapFrontendToBackend(itemData));
    return mapBackendToFrontend(response.data);
  },

  async deleteShoppingItem(id: string): Promise<void> {
    await api.delete(`/items/${id}`);
  }
};
