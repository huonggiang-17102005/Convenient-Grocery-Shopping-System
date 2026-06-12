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
