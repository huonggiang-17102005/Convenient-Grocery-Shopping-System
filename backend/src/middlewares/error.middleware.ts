import { AppError } from "../errors/AppError.js";
import type { Request, Response, NextFunction } from "express";
import { errorHandlerInstance } from "../errors/ErrorHandler.js";
import { ErrorCode } from "../errors/ErrorCode.js";

const errorMiddleware = async (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await errorHandlerInstance.handleError(err, req);

  if (err instanceof AppError) {
    return res.status(err.statusCode || 500).json({
      success: false,
      error_code: err.errorCode,
      message: err.message,
    });
  } else {
    return res.status(500).json({
      success: false,
      error_code: ErrorCode.INTERNAL_SERVER_ERROR,
      message: "Đã có lỗi hệ thống xảy ra!",
    });
  }
};

export default errorMiddleware;
