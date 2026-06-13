import supabase from '../config/db.config.js';
import { InternalServerError } from '../errors/CommonError.js';

export const findById = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw new InternalServerError('Lỗi truy vấn bảng users');
  return data;
};
