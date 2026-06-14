import bcrypt from 'bcrypt';
import * as userRepo from '../repo/user.repo.js';
import { NotFoundError, BadRequestError } from '../errors/CommonError.js';

export const getMe = async (userId: string) => {
  const user = await userRepo.findById(userId);
  if (!user) throw new NotFoundError('Không tìm thấy người dùng');
  return user;
};

export const updateProfile = async (userId: string, full_name: string, email: string) => {
  if (!full_name || !email) throw new BadRequestError('Vui lòng cung cấp đủ họ tên và email');
  
  // Kiểm tra xem email mới đã được sử dụng bởi người khác chưa
  const existingUser = await userRepo.findByEmail(email);
  if (existingUser && existingUser.id !== userId) {
    throw new BadRequestError('Email này đã được sử dụng bởi một tài khoản khác!');
  }

  const updatedUser = await userRepo.updateProfile(userId, full_name, email);
  return updatedUser;
};

export const updateAvatar = async (userId: string, avatar: string) => {
  if (!avatar) throw new BadRequestError('Vui lòng cung cấp avatar');
  const updatedUser = await userRepo.updateAvatar(userId, avatar);
  return updatedUser;
};

export const updatePassword = async (userId: string, current_password: string, new_password: string) => {
  if (!current_password || !new_password) {
    throw new BadRequestError('Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới');
  }
  if (new_password.length < 6) {
    throw new BadRequestError('Mật khẩu mới phải có ít nhất 6 ký tự');
  }

  const user = await userRepo.findById(userId);
  if (!user || !user.password) throw new NotFoundError('Không tìm thấy thông tin người dùng');

  const isMatch = await bcrypt.compare(current_password, user.password);
  if (!isMatch) {
    throw new BadRequestError('Mật khẩu hiện tại không chính xác');
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(new_password, saltRounds);
  
  const updatedUser = await userRepo.updatePassword(userId, passwordHash);
  return updatedUser;
};
