import type { Response } from 'express';
import supabase from '../config/db.config.js';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
import * as familyService from '../services/family.service.js';
export const createFamily = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    const user = req.user; // Từ middleware

    if (!name) {
      res.status(400).json({ message: 'Vui lòng cung cấp tên nhóm gia đình' });
      return;
    }

    if (!user || !user.id) {
      res.status(401).json({ message: 'Không tìm thấy thông tin người dùng' });
      return;
    }

    // Tạo mã ngẫu nhiên: FC-{4 số}-{2 chữ cái in hoa}
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randomChars = chars.charAt(Math.floor(Math.random() * chars.length)) + chars.charAt(Math.floor(Math.random() * chars.length));
    const invite_code = `FC-${randomDigits}-${randomChars}`;

    // Thêm nhóm mới vào db
    const { data: newFamily, error: insertFamilyError } = await supabase
      .from('families')
      .insert([
        { name, homemaker_id: user.id, invite_code }
      ])
      .select()
      .single();

    if (insertFamilyError) {
      console.error('Lỗi khi insert family:', insertFamilyError);
      res.status(500).json({ message: 'Lỗi khi tạo nhóm trên Database', error: insertFamilyError.message });
      return;
    }

    // Cập nhật lại family_id cho người tạo
    const { error: updateUserError } = await supabase
      .from('users')
      .update({ family_id: newFamily.id })
      .eq('id', user.id);

    if (updateUserError) {
      console.error('Lỗi khi update user family_id:', updateUserError);
    }

    res.status(201).json({
      message: 'Tạo nhóm thành công',
      family: newFamily
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server nội bộ', error: error.message });
  }
};

export const joinFamily = async (req: AuthRequest, res: Response) => {
  const { code } = req.body;
  const user = req.user;

  if (!user || !user.id) {
    return res.status(401).json({ message: 'Không tìm thấy thông tin người dùng' });
  }

  const family = await familyService.joinFamily(user.id, code);

  return res.status(200).json({
    message: 'Tham gia nhóm thành công',
    family
  });
};

export const getFamilyInfo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      res.status(401).json({ message: 'Không tìm thấy thông tin người dùng' });
      return;
    }

    // 1. Lấy thông tin user để biết family_id hiện tại
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('family_id')
      .eq('id', user.id)
      .single();

    let familyId = userData?.family_id;

    // Fallback: Nếu không có family_id nhưng user là homemaker của một nhóm nào đó
    let fallbackErrorObj: any = null;
    if (!familyId) {
      const { data: fallbackFamilies, error: fallbackError } = await supabase
        .from('families')
        .select('id')
        .eq('homemaker_id', user.id)
        .limit(1);
        
      if (fallbackError) {
        console.error('Fallback query error:', fallbackError);
        fallbackErrorObj = fallbackError;
      }
        
      if (fallbackFamilies && fallbackFamilies.length > 0) {
        familyId = fallbackFamilies[0].id;
        // Thử cập nhật lại
        await supabase.from('users').update({ family_id: familyId }).eq('id', user.id);
      }
    }

    if (!familyId) {
      res.status(404).json({ 
        message: 'Người dùng chưa có nhóm', 
        debug_fallback_error: fallbackErrorObj 
      });
      return;
    }

    // 2. Lấy thông tin family
    const { data: family, error: familyError } = await supabase
      .from('families')
      .select('id, name, invite_code')
      .eq('id', familyId)
      .single();

    if (familyError || !family) {
      res.status(404).json({ 
        message: 'Không tìm thấy thông tin nhóm gia đình',
        debug_family_error: familyError,
        debug_family_id: familyId
      });
      return;
    }

    res.status(200).json({ family });
  } catch (error: any) {
    console.error('Lỗi lấy thông tin gia đình:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const updateFamilyInfo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    const { name, dailyCalorieTarget } = req.body;

    if (!user || !user.id || !user.family_id) {
      res.status(401).json({ message: 'Không tìm thấy thông tin nhóm gia đình của người dùng.' });
      return;
    }

    // Kiểm tra quyền: Chỉ Homemaker (chủ gia đình) mới được sửa thông tin nhóm
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !userData || userData.role !== 'Homemaker') {
      res.status(403).json({ message: 'Chỉ Người nội trợ (Chủ gia đình) mới có quyền chỉnh sửa cài đặt nhóm.' });
      return;
    }

    const updateFields: any = {};
    if (name !== undefined) updateFields.name = name;
    // if (dailyCalorieTarget !== undefined) {
    //   updateFields.daily_calorie_target = Number(dailyCalorieTarget);
    // }

    if (Object.keys(updateFields).length === 0) {
      res.status(400).json({ message: 'Không có dữ liệu chỉnh sửa.' });
      return;
    }

    const { data: updatedFamily, error: updateError } = await supabase
      .from('families')
      .update(updateFields)
      .eq('id', user.family_id)
      .select()
      .single();

    if (updateError) {
      console.error('Lỗi cập nhật family:', updateError);
      res.status(500).json({ message: 'Lỗi khi cập nhật cài đặt nhóm trên database.' });
      return;
    }

    res.status(200).json({
      message: 'Cập nhật cài đặt nhóm thành công',
      family: updatedFamily
    });
  } catch (error: any) {
    console.error('Lỗi khi cập nhật cài đặt nhóm:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const getMembers = async (req: AuthRequest, res: Response) => {
  const familyId = req.user?.family_id as string;
  const members = await familyService.getMembers(familyId);
  return res.status(200).json({ success: true, data: members });
};

export const leaveFamily = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id as string;
  const familyId = req.user?.family_id as string;
  await familyService.leaveFamily(userId, familyId);
  return res.status(200).json({ success: true, message: 'Đã rời khỏi gia đình thành công' });
};

export const removeMember = async (req: AuthRequest, res: Response) => {
  const currentUserId = req.user?.id as string;
  const familyId = req.user?.family_id as string;
  const targetUserId = req.params.userId as string;
  
  await familyService.removeMember(currentUserId, targetUserId, familyId);
  return res.status(200).json({ success: true, message: 'Đã xóa thành viên khỏi gia đình' });
};

export const transferHomemaker = async (req: AuthRequest, res: Response) => {
  const currentUserId = req.user?.id as string;
  const familyId = req.user?.family_id as string;
  const { newHomemakerId } = req.body;

  await familyService.transferHomemaker(currentUserId, newHomemakerId, familyId);
  return res.status(200).json({ success: true, message: 'Nhường quyền Homemaker thành công' });
};

export const getWasteStats = async (req: AuthRequest, res: Response) => {
  const familyId = req.user?.family_id as string;
  const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
  const year = parseInt(req.query.year as string) || new Date().getFullYear();

  if (!familyId) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin gia đình' });
  }

  const stats = await familyService.getWasteStatistics(familyId, month, year);
  return res.status(200).json({ success: true, data: stats });
};
