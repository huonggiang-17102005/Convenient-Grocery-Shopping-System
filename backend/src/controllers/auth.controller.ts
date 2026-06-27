import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import supabase from '../config/db.config.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, full_name } = req.body;

    if (!email || !password || !full_name) {
      res.status(400).json({ message: 'Vui lòng cung cấp đủ họ tên, email và mật khẩu' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
      return;
    }

    // Kiểm tra xem email đã tồn tại chưa
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      res.status(400).json({ message: 'Email đã được sử dụng' });
      return;
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Default role and family_id, default avatar is 😊
    const role = 'User';
    const avatar = '😊';
    
    // Thêm user vào db
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        { email, password: passwordHash, full_name, avatar, role, family_id: null }
      ])
      .select()
      .single();

    if (insertError) {
      console.error(insertError);
      res.status(500).json({ message: 'Lỗi khi tạo tài khoản trên Database' });
      return;
    }

    // Tạo token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, family_id: newUser.family_id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ message: 'Đăng ký thành công', token, user: newUser });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server nội bộ', error: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Vui lòng cung cấp email và mật khẩu' });
      return;
    }

    // Tìm user qua email
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (fetchError || !user) {
      res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
      return;
    }

    if (user.status && user.status.toLowerCase() === 'locked') {
      res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa bởi quản trị viên' });
      return;
    }

    // So sánh mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
      return;
    }

    // Tạo token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, family_id: user.family_id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({ message: 'Đăng nhập thành công', token, user });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server nội bộ', error: error.message });
  }
};
