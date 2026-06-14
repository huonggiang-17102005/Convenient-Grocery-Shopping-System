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
