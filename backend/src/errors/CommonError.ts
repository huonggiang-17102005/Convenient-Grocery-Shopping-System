import { AppError } from './AppError.js';
import { ErrorCode } from './ErrorCode.js';

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(404, ErrorCode.NOT_FOUND, message);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Invalid request data') {
    super(400, ErrorCode.BAD_REQUEST, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(401, ErrorCode.UNAUTHORIZED, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden') {
    super(403, ErrorCode.FORBIDDEN, message);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(500, ErrorCode.INTERNAL_SERVER_ERROR, message);
  }
}
