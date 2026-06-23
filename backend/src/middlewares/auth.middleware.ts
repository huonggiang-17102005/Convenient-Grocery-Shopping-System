import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import supabase from '../config/db.config.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

  // Cho phép lấy token từ query parameter để hỗ trợ EventSource (SSE)
  if (!token && req.query.token) {
    token = req.query.token as string;
  }

  if (!token) {
    res.status(401).json({ message: 'Không tìm thấy Token xác thực' });
    return;
  }

  jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
    if (err) {
      res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
      return;
    }
    
    try {
      // Lấy thông tin user mới nhất từ DB để có family_id và role chính xác
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', decoded.id)
        .single();
        
      if (!error && user) {
        req.user = user;
      } else {
        req.user = decoded; // Fallback
      }
    } catch (e) {
      req.user = decoded; // Fallback
    }
    
    next();
  });
};
