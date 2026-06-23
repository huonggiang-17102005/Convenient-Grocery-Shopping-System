import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
import * as userService from '../services/user.service.js';
import supabase from '../config/db.config.js';

export const getMe = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id as string;
  const user = await userService.getMe(userId);
  return res.status(200).json({ success: true, data: user });
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id as string;
  const { full_name, email } = req.body;
  const updatedUser = await userService.updateProfile(userId, full_name, email);
  return res.status(200).json({ success: true, data: updatedUser, message: 'Cập nhật thông tin thành công' });
};

export const updateAvatar = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id as string;
  const { avatar } = req.body;
  const updatedUser = await userService.updateAvatar(userId, avatar);
  return res.status(200).json({ success: true, data: updatedUser, message: 'Cập nhật ảnh đại diện thành công' });
};

export const updatePassword = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id as string;
  const { current_password, new_password } = req.body;
  await userService.updatePassword(userId, current_password, new_password);
  return res.status(200).json({ success: true, message: 'Đổi mật khẩu thành công' });
};

export const updateRole = async (req: AuthRequest, res: Response) => {
  const { role } = req.body;
  const userId = req.user?.id;

  if (role !== null && role !== 'Homemaker' && role !== 'Member') {
    return res.status(400).json({ message: 'Vai trò không hợp lệ' });
  }

  const { error: updateRoleError } = await supabase
    .from('users')
    .update({ role })
    .eq('id', userId);

  if (updateRoleError) {
    console.error('Lỗi khi update role:', updateRoleError);
    return res.status(500).json({ message: 'Lỗi server khi cập nhật vai trò', error: updateRoleError.message });
  }

  return res.status(200).json({ message: 'Cập nhật vai trò thành công', role });
};
