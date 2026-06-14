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

// UUID Mapping to frontend names 'Shin' & 'Kat' (Hima in db)
const UUID_TO_NAME: Record<string, string> = {
  'd1fd2b6f-7778-4419-99a4-8eafc2ba0619': 'Shin',
  '5b7e60c4-28e5-48a8-92c5-6b5f9349c7ca': 'Kat'
};

const NAME_TO_UUID: Record<string, string> = {
  'Shin': 'd1fd2b6f-7778-4419-99a4-8eafc2ba0619',
  'Kat': '5b7e60c4-28e5-48a8-92c5-6b5f9349c7ca'
};

const mapBackendToFrontend = (item: any): ShoppingItem => {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    quantity: Number(item.quantity),
    unit: item.unit,
    isBought: item.isBought,
    assigneeId: item.assigneeId ? (UUID_TO_NAME[item.assigneeId] || null) : null,
    deadlineDate: item.deadlineDate,
    deadlineTime: item.deadlineTime,
    imageUrl: item.imageUrl,
    imagePublicId: item.imagePublicId
  };
};

const mapFrontendToBackend = (itemData: any) => {
  const mapped: any = { ...itemData };
  if (itemData.assigneeId !== undefined) {
    mapped.assigneeId = itemData.assigneeId ? (NAME_TO_UUID[itemData.assigneeId] || null) : null;
  }
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

  async updateShoppingItem(id: string, itemData: Partial<ShoppingItem>): Promise<ShoppingItem> {
    const response = await api.patch(`/items/${id}`, mapFrontendToBackend(itemData));
    return mapBackendToFrontend(response.data);
  },

  async deleteShoppingItem(id: string): Promise<void> {
    await api.delete(`/items/${id}`);
  }
};
