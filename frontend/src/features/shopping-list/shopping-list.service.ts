import api from '@/services/api';
import type { ShoppingList, ShoppingItem, CreateItemPayload, UpdateItemPayload } from './types';

// --- Family Members ---

export interface FamilyMemberDTO {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  status: string | null;
}

// Get family members
export const getFamilyMembers = async (): Promise<FamilyMemberDTO[]> => {
  const response = await api.get('/api/families/members');
  return response.data.data as FamilyMemberDTO[];
};

// --- Shopping Lists ---
export const getListsByFamilyId = async (familyId: string): Promise<ShoppingList[]> => {
  const response = await api.get(`/api/shopping-lists/family/${familyId}`);
  return response.data.data as ShoppingList[];
};

// Get list by ID
export const getListById = async (listId: string): Promise<ShoppingList> => {
  const response = await api.get(`/api/shopping-lists/${listId}`);
  return response.data.data as ShoppingList;
};

// Create list
export const createList = async (payload: {
  family_id: string;
  title: string;
  target_date?: string | null;
  status?: ShoppingList['status'];
}): Promise<ShoppingList> => {
  const response = await api.post('/api/shopping-lists', payload);
  return response.data.data as ShoppingList;
};

// Update list
export const updateList = async (
  listId: string,
  payload: { title?: string; status?: ShoppingList['status']; target_date?: string | null }
): Promise<ShoppingList> => {
  const response = await api.put(`/api/shopping-lists/${listId}`, payload);
  return response.data.data as ShoppingList;
};

// Delete list
export const deleteList = async (listId: string): Promise<void> => {
  await api.delete(`/api/shopping-lists/${listId}`);
};

// --- Shopping List Items ---
export const createItem = async (listId: string, payload: CreateItemPayload): Promise<ShoppingItem> => {
  const response = await api.post(`/api/shopping-lists/${listId}/items`, payload);
  return response.data.data as ShoppingItem;
};

// Update item
export const updateItem = async (
  listId: string,
  itemId: string,
  payload: UpdateItemPayload
): Promise<ShoppingItem> => {
  const response = await api.put(`/api/shopping-lists/${listId}/items/${itemId}`, payload);
  return response.data.data as ShoppingItem;
};

// Toggle item bought
export const toggleItemBought = async (listId: string, itemId: string): Promise<ShoppingItem> => {
  const response = await api.patch(`/api/shopping-lists/${listId}/items/${itemId}/toggle`);
  return response.data.data as ShoppingItem;
};

// Delete item
export const deleteItem = async (listId: string, itemId: string): Promise<void> => {
  await api.delete(`/api/shopping-lists/${listId}/items/${itemId}`);
};

// --- Fridge Sync ---
export const addItemToFridge = async (
  listId: string,
  itemId: string,
  familyId: string,
  expirationDate: string,
): Promise<void> => {
  await api.post(`/api/shopping-lists/${listId}/items/${itemId}/add-to-fridge`, {
    family_id: familyId,
    expiration_date: expirationDate,
  });
};


