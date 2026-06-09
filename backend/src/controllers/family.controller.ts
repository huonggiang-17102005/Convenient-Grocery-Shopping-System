import type { Response } from 'express';
import supabase from '../config/db.config.js';
import type { AuthRequest } from '../middlewares/auth.middleware.js';

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
