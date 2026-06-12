import supabase from '../config/db.config.js';
import type { ShoppingList } from '../models/ShoppingList.js';
import type { ShoppingListItem } from '../models/ShoppingListItem.js';
import { InternalServerError, NotFoundError } from '../errors/CommonError.js';

// --- Shopping Lists ---
export const getListsByFamilyId = async (familyId: string): Promise<ShoppingList[]> => {
  const { data, error } = await supabase
    .from('shopping_lists')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Lỗi khi lấy shopping lists:', error);
    throw new InternalServerError('Không thể lấy danh sách mua sắm từ cơ sở dữ liệu.');
  }

  return data as ShoppingList[];
};

// Get list by ID
export const getListById = async (listId: string): Promise<ShoppingList> => {
  const { data, error } = await supabase
    .from('shopping_lists')
    .select('*')
    .eq('id', listId)
    .single();

  if (error || !data) {
    throw new NotFoundError(`Không tìm thấy danh sách mua sắm với ID: ${listId}`);
  }

  return data as ShoppingList;
};

// Create list
export const createList = async (
  payload: Pick<ShoppingList, 'family_id' | 'title' | 'target_date' | 'status'>
): Promise<ShoppingList> => {
  const { data, error } = await supabase
    .from('shopping_lists')
    .insert([payload])
    .select()
    .single();

  if (error || !data) {
    console.error('Lỗi khi tạo shopping list:', error);
    throw new InternalServerError('Không thể tạo danh sách mua sắm mới.');
  }

  return data as ShoppingList;
};

// Update list
export const updateList = async (
  listId: string,
  payload: Partial<Pick<ShoppingList, 'title' | 'status' | 'target_date'>>
): Promise<ShoppingList> => {
  const { data, error } = await supabase
    .from('shopping_lists')
    .update(payload)
    .eq('id', listId)
    .select()
    .single();

  if (error || !data) {
    console.error('Lỗi khi cập nhật shopping list:', error);
    throw new InternalServerError('Không thể cập nhật danh sách mua sắm.');
  }

  return data as ShoppingList;
};

// Delete list
export const deleteList = async (listId: string): Promise<void> => {
  const { error } = await supabase
    .from('shopping_lists')
    .delete()
    .eq('id', listId);

  if (error) {
    console.error('Lỗi khi xóa shopping list:', error);
    throw new InternalServerError('Không thể xóa danh sách mua sắm.');
  }
};

// --- Shopping List Items ---
export const getItemsByListId = async (listId: string): Promise<ShoppingListItem[]> => {
  const { data, error } = await supabase
    .from('shopping_list_items')
    .select('*')
    .eq('list_id', listId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Lỗi khi lấy shopping list items:', error);
    throw new InternalServerError('Không thể lấy danh sách mặt hàng.');
  }

  return data as ShoppingListItem[];
};

// Create item
export const createItem = async (
  payload: Omit<ShoppingListItem, 'id' | 'created_at' | 'updated_at'>
): Promise<ShoppingListItem> => {
  const { data, error } = await supabase
    .from('shopping_list_items')
    .insert([payload])
    .select()
    .single();

  if (error || !data) {
    console.error('Lỗi khi thêm item vào shopping list:', error);
    throw new InternalServerError('Không thể thêm mặt hàng vào danh sách.');
  }

  return data as ShoppingListItem;
};

// Update item
export const updateItem = async (
  itemId: string,
  payload: Partial<Omit<ShoppingListItem, 'id' | 'list_id' | 'created_at' | 'updated_at'>>
): Promise<ShoppingListItem> => {
  const { data, error } = await supabase
    .from('shopping_list_items')
    .update(payload)
    .eq('id', itemId)
    .select()
    .single();

  if (error || !data) {
    console.error('Lỗi khi cập nhật item:', error);
    throw new InternalServerError('Không thể cập nhật mặt hàng.');
  }

  return data as ShoppingListItem;
};

// Toggle item bought
export const toggleItemBought = async (itemId: string): Promise<ShoppingListItem> => {
  // Lấy trạng thái hiện tại
  const { data: current, error: fetchError } = await supabase
    .from('shopping_list_items')
    .select('is_bought')
    .eq('id', itemId)
    .single();

  if (fetchError || !current) {
    throw new NotFoundError(`Không tìm thấy mặt hàng với ID: ${itemId}`);
  }

  // Flip trạng thái
  const { data, error } = await supabase
    .from('shopping_list_items')
    .update({ is_bought: !current.is_bought })
    .eq('id', itemId)
    .select()
    .single();

  if (error || !data) {
    console.error('Lỗi khi toggle is_bought:', error);
    throw new InternalServerError('Không thể cập nhật trạng thái mặt hàng.');
  }

  return data as ShoppingListItem;
};

// Delete item
export const deleteItem = async (itemId: string): Promise<void> => {
  const { error } = await supabase
    .from('shopping_list_items')
    .delete()
    .eq('id', itemId);

  if (error) {
    console.error('Lỗi khi xóa item:', error);
    throw new InternalServerError('Không thể xóa mặt hàng khỏi danh sách.');
  }
};
