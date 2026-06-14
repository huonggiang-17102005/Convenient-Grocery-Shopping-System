import type { Request, NextFunction } from 'express';
import { AppError } from './AppError.js';

class ErrorHandler {
  public async handleError(
    error: Error,
    req?: Request,
    next?: NextFunction
  ): Promise<void> {
    if (this.isTrustedError(error)) {
      // Lỗi bình thường (do người dùng sai). Không cần in log đỏ.
      // (Nếu có Logger thì dùng logger.info() ở đây)
    } else {
      // Lỗi hệ thống nghiêm trọng, bắt buộc in log báo động
      console.error('Lỗi hệ thống không lường trước:', error);
      // Sau này cấu hình thêm: Gửi Sentry và tắt server an toàn ở đây
    }
  }

  private isTrustedError(err: Error): boolean {
    return err instanceof AppError;
  }
}

export const errorHandlerInstance = new ErrorHandler();

