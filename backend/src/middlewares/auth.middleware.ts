import type { Request, Response, NextFunction } from 'express';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  // Logic kiểm tra JWT token sẽ được triển khai ở đây
  next();
};
