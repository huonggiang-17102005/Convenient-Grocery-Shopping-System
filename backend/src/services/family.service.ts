import * as familyRepo from '../repo/family.repo.js';
import * as userRepo from '../repo/user.repo.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../errors/CommonError.js';

export const getMembers = async (familyId: string) => {
  if (!familyId) throw new BadRequestError('Thiếu family_id');
  const members = await familyRepo.getFamilyMembers(familyId);
  return members;
};

export const leaveFamily = async (userId: string, familyId: string) => {
  if (!familyId) throw new BadRequestError('Bạn chưa tham gia gia đình nào');
  
  // Lấy danh sách thành viên để kiểm tra
  const members = await familyRepo.getFamilyMembers(familyId);
  const currentUser = members.find(m => m.id === userId);
  
  if (!currentUser) throw new NotFoundError('Không tìm thấy người dùng trong gia đình này');

  // Nếu là Homemaker rời đi, phải nhường quyền trước (trừ khi là người duy nhất)
  if (currentUser.role === 'Homemaker' && members.length > 1) {
    throw new BadRequestError('Bạn là Homemaker. Vui lòng nhường quyền cho người khác trước khi rời nhóm.');
  }

  const updatedUser = await familyRepo.removeUserFromFamily(userId);
  return updatedUser;
};

export const removeMember = async (currentUserId: string, targetUserId: string, familyId: string) => {
  if (!familyId) throw new BadRequestError('Thiếu thông tin gia đình');
  if (currentUserId === targetUserId) {
    throw new BadRequestError('Không thể tự xóa bản thân bằng chức năng này, vui lòng dùng chức năng Rời nhóm');
  }

  // Kiểm tra quyền của người dùng hiện tại
  const currentUser = await userRepo.findById(currentUserId);
  if (!currentUser || currentUser.family_id !== familyId || currentUser.role !== 'Homemaker') {
    throw new ForbiddenError('Chỉ Homemaker mới có quyền xóa thành viên');
  }

  // Kiểm tra target user
  const targetUser = await userRepo.findById(targetUserId);
  if (!targetUser || targetUser.family_id !== familyId) {
    throw new NotFoundError('Thành viên này không tồn tại trong gia đình');
  }

  const updatedUser = await familyRepo.removeUserFromFamily(targetUserId);
  return updatedUser;
};

export const transferHomemaker = async (currentUserId: string, targetUserId: string, familyId: string) => {
  if (!familyId) throw new BadRequestError('Thiếu thông tin gia đình');
  if (currentUserId === targetUserId) {
    throw new BadRequestError('Bạn đang là Homemaker rồi');
  }

  // Kiểm tra quyền của người dùng hiện tại
  const currentUser = await userRepo.findById(currentUserId);
  if (!currentUser || currentUser.family_id !== familyId || currentUser.role !== 'Homemaker') {
    throw new ForbiddenError('Chỉ Homemaker mới có quyền nhường quyền');
  }

  // Kiểm tra target user
  const targetUser = await userRepo.findById(targetUserId);
  if (!targetUser || targetUser.family_id !== familyId) {
    throw new NotFoundError('Người nhận quyền không tồn tại trong gia đình');
  }

  const updatedTargetUser = await familyRepo.transferHomemakerRole(currentUserId, targetUserId);
  return updatedTargetUser;
};
