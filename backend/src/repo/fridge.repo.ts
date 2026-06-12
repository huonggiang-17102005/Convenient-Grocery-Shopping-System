import supabase from '../config/supabase.config.js';
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

/**
 * Thêm mừ́i một fridge item
 */
export const createFridgeItem = async (
  payload: Omit<FridgeItem, 'id' | 'created_at' | 'updated_at'>
): Promise<FridgeItem> => {
  const { data, error } = await supabase
    .from('fridge_items')
    .insert([payload])
    .select()
    .single();

  if (error || !data) {
    console.error('Lỗi khi thêm fridge item:', error);
    throw new InternalServerError('Không thể thêm thực phẩm vào tủ lạnh.');
  }

  return data as FridgeItem;
};

/**
 * Upsert: Nếu cùng tên + gia đình đã tồn tại thì cộng thêm số lượng, ngược lại tạo mớọi
 */
export const upsertFridgeItem = async (
  payload: Omit<FridgeItem, 'id' | 'created_at' | 'updated_at'>
): Promise<FridgeItem> => {
  // Kiểm tra xem item cùng tên đã tồn tại trong gia đình chưa
  const { data: existing } = await supabase
    .from('fridge_items')
    .select('id, quantity')
    .eq('family_id', payload.family_id)
    .ilike('name', payload.name) // so sánh không phân biệt hoa thường
    .maybeSingle();

  if (existing) {
    // Cộng thêm số lượng
    const { data, error } = await supabase
      .from('fridge_items')
      .update({ quantity: existing.quantity + payload.quantity })
      .eq('id', existing.id)
      .select()
      .single();

    if (error || !data) {
      throw new InternalServerError('Không thể cập nhật số lượng trong tủ lạnh.');
    }
    return data as FridgeItem;
  }

  // Tạo mới
  return await createFridgeItem(payload);
};
