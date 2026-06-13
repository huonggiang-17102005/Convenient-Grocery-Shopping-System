import * as userRepo from '../repo/user.repo.js';
import { NotFoundError } from '../errors/CommonError.js';

export const getMe = async (userId: string) => {
  const user = await userRepo.findById(userId);
  if (!user) throw new NotFoundError('Không tìm thấy người dùng');
  return user;
};
