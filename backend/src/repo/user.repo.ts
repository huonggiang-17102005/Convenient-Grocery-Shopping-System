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

export const findByEmail = async (email: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) throw new InternalServerError('Lỗi truy vấn bảng users theo email');
  return data;
};

export const updateProfile = async (userId: string, full_name: string, email: string) => {
  const { data, error } = await supabase
    .from('users')
    .update({ full_name, email })
    .eq('id', userId)
    .select('*')
    .single();

  if (error) throw new InternalServerError('Lỗi khi cập nhật thông tin người dùng');
  return data;
};

export const updateAvatar = async (userId: string, avatar: string) => {
  const { data, error } = await supabase
    .from('users')
    .update({ avatar })
    .eq('id', userId)
    .select('*')
    .single();

  if (error) throw new InternalServerError('Lỗi khi cập nhật avatar');
  return data;
};

export const updatePassword = async (userId: string, passwordHash: string) => {
  const { data, error } = await supabase
    .from('users')
    .update({ password: passwordHash })
    .eq('id', userId)
    .select('*')
    .single();

  if (error) throw new InternalServerError('Lỗi khi đổi mật khẩu');
  return data;
};
