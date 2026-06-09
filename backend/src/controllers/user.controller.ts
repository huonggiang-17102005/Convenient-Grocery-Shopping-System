import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
import supabase from '../config/db.config.js';

export const updateRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Người dùng chưa xác thực' });
      return;
    }

    if (!role || (role !== 'Homemaker' && role !== 'Member')) {
      res.status(400).json({ message: 'Vai trò không hợp lệ' });
      return;
    }

    const { error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId);

    if (error) {
      console.error(error);
      res.status(500).json({ message: `Lỗi Database: ${error.message}` });
      return;
    }

    res.status(200).json({ message: 'Cập nhật vai trò thành công', role });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server nội bộ', error: error.message });
  }
};
