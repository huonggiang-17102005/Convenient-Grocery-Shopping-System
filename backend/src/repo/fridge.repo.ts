import supabase from '../config/db.config.js';
import type { FridgeItem } from '../models/FridgeItem.js';
import { InternalServerError } from '../errors/CommonError.js';

export const getItemsByFamilyId = async (familyId: string): Promise<FridgeItem[]> => {
  const { data, error } = await supabase
    .from('fridge_items')
    .select('*')
    .eq('family_id', familyId);

  if (error) {
    console.error('Lỗi khi truy vấn bảng fridge_items:', error);
    throw new InternalServerError('Không thể lấy danh sách nguyên liệu từ máy chủ cơ sở dữ liệu.');
  }

  return data as FridgeItem[];
};

export const updateItemQuantity = async (id: string, newQuantity: number): Promise<void> => {
  const { error } = await supabase
    .from('fridge_items')
    .update({ quantity: newQuantity })
    .eq('id', id);

  if (error) {
    console.error('Lỗi khi cập nhật số lượng fridge_items:', error);
    throw new InternalServerError('Không thể cập nhật số lượng nguyên liệu.');
  }
};

export const deleteItem = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('fridge_items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Lỗi khi xóa fridge_items:', error);
    throw new InternalServerError('Không thể xóa nguyên liệu.');
  }
};

export const getItemById = async (id: string): Promise<FridgeItem | null> => {
  const { data, error } = await supabase
    .from('fridge_items')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Lỗi khi lấy fridge_items:', error);
    throw new InternalServerError('Không thể truy xuất thông tin nguyên liệu.');
  }

  return data as FridgeItem | null;
};

export const addItem = async (itemData: Partial<FridgeItem>): Promise<FridgeItem> => {
  const { data, error } = await supabase
    .from('fridge_items')
    .insert([itemData])
    .select()
    .single();

  if (error) {
    console.error('Lỗi khi thêm fridge_items:', error);
    throw new InternalServerError('Không thể thêm nguyên liệu vào tủ lạnh.');
  }

  return data as FridgeItem;
};

export const updateItem = async (id: string, updateData: Partial<FridgeItem>): Promise<FridgeItem> => {
  const { data, error } = await supabase
    .from('fridge_items')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Lỗi khi cập nhật fridge_items:', error);
    throw new InternalServerError('Không thể cập nhật thông tin nguyên liệu.');
  }

  return data as FridgeItem;
};

export const getExpiredUnwastedItems = async (): Promise<FridgeItem[]> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('fridge_items')
    .select('*')
    .lt('expiration_date', today.toISOString())
    .is('is_wasted', false);

  if (error) {
    console.error('Lỗi khi lấy getExpiredUnwastedItems:', error);
    throw new InternalServerError('Không thể lấy danh sách nguyên liệu hết hạn.');
  }

  return data as FridgeItem[];
};

export const markItemsAsWasted = async (ids: string[]): Promise<void> => {
  if (!ids || ids.length === 0) return;

  const { error } = await supabase
    .from('fridge_items')
    .update({ is_wasted: true })
    .in('id', ids);

  if (error) {
    console.error('Lỗi khi markItemsAsWasted:', error);
    throw new InternalServerError('Không thể cập nhật trạng thái lãng phí.');
  }
};
