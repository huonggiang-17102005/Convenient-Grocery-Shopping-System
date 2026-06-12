import * as shoppingListRepo from '../repo/shopping-list.repo.js';
import * as fridgeRepo from '../repo/fridge.repo.js';
import type { ShoppingList } from '../models/ShoppingList.js';
import type { ShoppingListItem } from '../models/ShoppingListItem.js';
import type { FridgeItem } from '../models/FridgeItem.js';
import { BadRequestError, NotFoundError } from '../errors/CommonError.js';

// --- Shopping Lists ---
export const getListsByFamilyId = async (familyId: string): Promise<(ShoppingList & { items: ShoppingListItem[] })[]> => {
  if (!familyId) {
    throw new BadRequestError('Mã ID của gia đình (familyId) không được để trống.');
  }

  const lists = await shoppingListRepo.getListsByFamilyId(familyId);

  // Lấy items cho từng list
  const listsWithItems = await Promise.all(
    lists.map(async (list) => {
      const items = await shoppingListRepo.getItemsByListId(list.id);
      return { ...list, items };
    })
  );

  return listsWithItems;
};

// Get list by ID
export const getListById = async (listId: string): Promise<ShoppingList & { items: ShoppingListItem[] }> => {
  if (!listId) {
    throw new BadRequestError('Mã ID của danh sách (listId) không được để trống.');
  }

  const list = await shoppingListRepo.getListById(listId);
  const items = await shoppingListRepo.getItemsByListId(listId);

  return { ...list, items };
};

// Create list
export const createList = async (payload: {
  family_id: string;
  title: string;
  target_date?: string | null;
  status?: ShoppingList['status'];
}): Promise<ShoppingList> => {
  const { family_id, title, target_date = null, status = 'Planning' } = payload;

  if (!family_id) {
    throw new BadRequestError('Mã ID của gia đình (family_id) không được để trống.');
  }

  if (!title || !title.trim()) {
    throw new BadRequestError('Tên danh sách mua sắm (title) không được để trống.');
  }

  return await shoppingListRepo.createList({
    family_id,
    title: title.trim(),
    target_date: target_date ?? null,
    status: status ?? 'Planning',
  });
};

// Update list
export const updateList = async (
  listId: string,
  payload: {
    title?: string;
    status?: ShoppingList['status'];
    target_date?: string | null;
  }
): Promise<ShoppingList> => {
  if (!listId) {
    throw new BadRequestError('Mã ID của danh sách (listId) không được để trống.');
  }

  // Kiểm tra list có tồn tại không
  await shoppingListRepo.getListById(listId);

  const updateData: Partial<Pick<ShoppingList, 'title' | 'status' | 'target_date'>> = {};

  if (payload.title !== undefined) {
    if (!payload.title.trim()) {
      throw new BadRequestError('Tên danh sách mua sắm không được để trống.');
    }
    updateData.title = payload.title.trim();
  }

  if (payload.status !== undefined) {
    updateData.status = payload.status;
  }

  if (payload.target_date !== undefined) {
    updateData.target_date = payload.target_date;
  }

  return await shoppingListRepo.updateList(listId, updateData);
};

// Delete list
export const deleteList = async (listId: string): Promise<void> => {
  if (!listId) {
    throw new BadRequestError('Mã ID của danh sách (listId) không được để trống.');
  }

  // Kiểm tra list có tồn tại không
  await shoppingListRepo.getListById(listId);

  await shoppingListRepo.deleteList(listId);
};

// --- Shopping List Items ---
export const createItem = async (
  listId: string,
  payload: {
    name: string;
    category: string;
    quantity: number;
    unit: string;
    image_url?: string | null;
    image_public_id?: string | null;
    assignee_id?: string | null;
    deadline_date?: string | null;
    deadline_time?: string | null;
  }
): Promise<ShoppingListItem> => {
  if (!listId) {
    throw new BadRequestError('Mã ID của danh sách (listId) không được để trống.');
  }

  if (!payload.name || !payload.name.trim()) {
    throw new BadRequestError('Tên mặt hàng không được để trống.');
  }

  if (!payload.quantity || payload.quantity <= 0) {
    throw new BadRequestError('Số lượng phải lớn hơn 0.');
  }

  if (!payload.unit || !payload.unit.trim()) {
    throw new BadRequestError('Đơn vị không được để trống.');
  }

  // Kiểm tra list có tồn tại không
  await shoppingListRepo.getListById(listId);

  return await shoppingListRepo.createItem({
    list_id: listId,
    name: payload.name.trim(),
    category: payload.category || 'Khác',
    quantity: payload.quantity,
    unit: payload.unit.trim(),
    image_url: payload.image_url ?? null,
    image_public_id: payload.image_public_id ?? null,
    is_bought: false,
    assignee_id: payload.assignee_id ?? null,
    deadline_date: payload.deadline_date ?? null,
    deadline_time: payload.deadline_time ?? null,
  });
};

// Update item
export const updateItem = async (
  listId: string,
  itemId: string,
  payload: Partial<{
    name: string;
    category: string;
    quantity: number;
    unit: string;
    image_url: string | null;
    image_public_id: string | null;
    is_bought: boolean;
    assignee_id: string | null;
    deadline_date: string | null;
    deadline_time: string | null;
  }>
): Promise<ShoppingListItem> => {
  if (!listId || !itemId) {
    throw new BadRequestError('listId và itemId không được để trống.');
  }

  if (payload.name !== undefined && !payload.name.trim()) {
    throw new BadRequestError('Tên mặt hàng không được để trống.');
  }

  if (payload.quantity !== undefined && payload.quantity <= 0) {
    throw new BadRequestError('Số lượng phải lớn hơn 0.');
  }

  // Kiểm tra list tồn tại
  await shoppingListRepo.getListById(listId);

  return await shoppingListRepo.updateItem(itemId, payload);
};

// Toggle item bought
export const toggleItemBought = async (listId: string, itemId: string): Promise<ShoppingListItem> => {
  if (!listId || !itemId) {
    throw new BadRequestError('listId và itemId không được để trống.');
  }

  // Kiểm tra list tồn tại
  await shoppingListRepo.getListById(listId);

  return await shoppingListRepo.toggleItemBought(itemId);
};

// Delete item
export const deleteItem = async (listId: string, itemId: string): Promise<void> => {
  if (!listId || !itemId) {
    throw new BadRequestError('listId và itemId không được để trống.');
  }

  // Kiểm tra list tồn tại
  await shoppingListRepo.getListById(listId);

  await shoppingListRepo.deleteItem(itemId);
};

// --- Sync to Fridge (always new item) ---
export const addItemToFridge = async (
  listId: string,
  itemId: string,
  payload: {
    family_id: string;
    expiration_date: string;
    location?: string | null;
    image_url?: string | null;
    image_public_id?: string | null;
  }
): Promise<FridgeItem> => {
  if (!listId || !itemId) {
    throw new BadRequestError('listId và itemId không được để trống.');
  }
  if (!payload.family_id) {
    throw new BadRequestError('family_id không được để trống.');
  }
  if (!payload.expiration_date) {
    throw new BadRequestError('Ngày hết hạn (expiration_date) không được để trống.');
  }

  // Lấy thông tin item
  const items = await shoppingListRepo.getItemsByListId(listId);
  const item = items.find((i) => i.id === itemId);
  if (!item) {
    throw new NotFoundError(`Không tìm thấy mặt hàng ID: ${itemId} trong danh sách ${listId}`);
  }

  // Luôn tạo record MỚI — không kiểm tra trùng tên vì hạn sử dụng có thể khác
  return await fridgeRepo.createFridgeItem({
    family_id: payload.family_id,
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    category: item.category,
    image_url: payload.image_url ?? item.image_url ?? null,
    image_public_id: payload.image_public_id ?? item.image_public_id ?? null,
    location: payload.location ?? null,
    expiration_date: payload.expiration_date,
    is_wasted: false,
  });
};

