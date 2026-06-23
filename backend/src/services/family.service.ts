import * as familyRepo from '../repo/family.repo.js';
import * as userRepo from '../repo/user.repo.js';
import * as inventoryLogRepo from '../repo/inventoryLog.repo.js';
import * as notificationService from './notification.service.js';
import supabase from '../config/db.config.js';
import { BadRequestError, ForbiddenError, NotFoundError, InternalServerError } from '../errors/CommonError.js';

export const joinFamily = async (userId: string, code: string) => {
  if (!code) throw new BadRequestError('Vui lòng cung cấp mã nhóm');
  
  const { data: family, error: findFamilyError } = await supabase
    .from('families')
    .select('id, name')
    .eq('invite_code', code)
    .single();

  if (findFamilyError || !family) {
    throw new NotFoundError('Mã nhóm không hợp lệ hoặc không tồn tại');
  }

  const { error: updateUserError } = await supabase
    .from('users')
    .update({ family_id: family.id })
    .eq('id', userId);

  if (updateUserError) {
    throw new InternalServerError('Lỗi khi tham gia nhóm');
  }

  const user = await userRepo.findById(userId);
  if (user) {
    const actorName = user.full_name || user.email || 'Thành viên mới';
    await notificationService.createNotification(
      family.id,
      'FAMILY_JOIN',
      'Thành viên mới',
      `${actorName} đã tham gia gia đình.`,
      { user_id: userId, full_name: user.full_name }
    );
  }

  return family;
};

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

  const updatedUser = await familyRepo.leaveFamilyRepo(userId);

  const actorName = currentUser.full_name || currentUser.email || 'Thành viên';
  await notificationService.createNotification(
    familyId,
    'FAMILY_LEAVE',
    'Thành viên rời nhóm',
    `${actorName} đã rời khỏi gia đình.`,
    { user_id: userId, full_name: currentUser.full_name }
  );

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

  // Gửi sự kiện SSE trước khi xóa dữ liệu trong DB
  import('./sse.service.js').then(sseService => {
    sseService.broadcastToUser(familyId, targetUserId, 'KICKED_FROM_FAMILY', { message: 'Bạn đã bị xóa khỏi gia đình' });
  }).catch(() => {});

  const updatedUser = await familyRepo.kickUserRepo(targetUserId);

  const actorName = targetUser.full_name || targetUser.email || 'Thành viên';
  await notificationService.createNotification(
    familyId,
    'FAMILY_LEAVE',
    'Thành viên rời nhóm',
    `${actorName} đã bị xóa khỏi gia đình.`,
    { user_id: targetUserId, full_name: targetUser.full_name }
  );

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

  const oldHomemakerName = currentUser.full_name || currentUser.email || 'Người nội trợ cũ';
  const newHomemakerName = targetUser.full_name || targetUser.email || 'Người nội trợ mới';

  await notificationService.createNotification(
    familyId,
    'FAMILY_ROLE',
    'Thay đổi vai trò',
    `${oldHomemakerName} đã nhường quyền Người nội trợ cho ${newHomemakerName}.`,
    { old_homemaker_id: currentUserId, new_homemaker_id: targetUserId }
  );

  return updatedTargetUser;
};

const CATEGORY_COLORS: Record<string, string> = {
  'Thịt cá': '#EF5350',
  'Rau củ': '#66BB6A',
  'Đồ uống': '#42A5F5',
  'Trứng': '#FFA726',
  'Đồ khô': '#8D6E63',
  'Gia vị': '#AB47BC',
};

export const getWasteStatistics = async (familyId: string, month: number, year: number) => {
  if (!familyId) throw new BadRequestError('Thiếu family_id');
  
  const logs = await inventoryLogRepo.getLogsByFamilyAndMonth(familyId, month, year);
  
  const statsMap: Record<string, { total: number, consumed: number, wasted: number, unit: string }> = {};
  
  for (const log of logs) {
    const cat = log.category || 'Khác';
    if (!statsMap[cat]) {
      statsMap[cat] = { total: 0, consumed: 0, wasted: 0, unit: log.unit || '' };
    }
    
    if (log.action_type === 'add') {
      statsMap[cat].total += log.amount;
    } else if (log.action_type === 'consume') {
      statsMap[cat].consumed += log.amount;
    } else if (log.action_type === 'waste' || log.action_type === 'expire') {
      statsMap[cat].wasted += log.amount;
    }
    
    if (!statsMap[cat].unit && log.unit) {
      statsMap[cat].unit = log.unit;
    }
  }
  
  const result = [];
  for (const [name, data] of Object.entries(statsMap)) {
    const actualTotal = Math.max(data.total, data.consumed + data.wasted);
    
    let consumedPercent = 0;
    let wastedPercent = 0;
    
    if (actualTotal > 0) {
      consumedPercent = Math.round((data.consumed / actualTotal) * 100);
      wastedPercent = Math.round((data.wasted / actualTotal) * 100);
    }
    
    result.push({
      name,
      total: actualTotal,
      unit: data.unit,
      consumed: data.consumed,
      consumedPercent,
      wasted: data.wasted,
      wastedPercent,
      color: CATEGORY_COLORS[name] || '#9E9E9E'
    });
  }
  
  return result.sort((a, b) => b.wastedPercent - a.wastedPercent);
};
