import supabase from '../config/db.config.js';
import { InternalServerError } from '../errors/CommonError.js';
import type { CategoryUnit } from '../models/CategoryUnit.js';

export const fetchAllCategoryUnits = async (): Promise<CategoryUnit[]> => {
  const { data, error } = await supabase
    .from('category_units')
    .select('*')
    .eq('is_visible', true);

  if (error) {
    console.error('Lỗi khi truy vấn DB category_units:', error);
    throw new InternalServerError('Không thể lấy danh mục thực phẩm từ máy chủ.');
  }

  return data as CategoryUnit[];
};
