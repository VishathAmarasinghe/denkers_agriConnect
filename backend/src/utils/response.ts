import { Response } from 'express';
import { AppError } from './errors';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}

export class ResponseHandler {
  /**
   * Send success response
   */
  static success<T>(
    res: Response,
    data?: T,
    message: string = 'Operation successful',
    statusCode: number = 200
  ): void {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    res.status(statusCode).json(response);
  }

  /**
   * Send error response
   */
  static error(
    res: Response,
    message: string = 'Operation failed',
    statusCode: number = 500,
    errors?: string[]
  ): void {
    const response: ApiResponse = {
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString(),
    };

    res.status(statusCode).json(response);
  }

  /**
   * Send validation error response
   */
  static validationError(
    res: Response,
    errors: string[],
    message: string = 'Validation failed'
  ): void {
    this.error(res, message, 400, errors);
  }

  /**
   * Send not found response
   */
  static notFound(
    res: Response,
    message: string = 'Resource not found'
  ): void {
    this.error(res, message, 404);
  }

  /**
   * Send unauthorized response
   */
  static unauthorized(
    res: Response,
    message: string = 'Authentication required'
  ): void {
    this.error(res, message, 401);
  }

  /**
   * Send forbidden response
   */
  static forbidden(
    res: Response,
    message: string = 'Access denied'
  ): void {
    this.error(res, message, 403);
  }

  /**
   * Send conflict response
   */
  static conflict(
    res: Response,
    message: string = 'Resource conflict'
  ): void {
    this.error(res, message, 409);
  }

  /**
   * Send paginated response
   */
  static paginated<T>(
    res: Response,
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    },
    message: string = 'Data retrieved successfully'
  ): void {
    const response: ApiResponse<T[]> = {
      success: true,
      message,
      data,
      pagination,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  }

  /**
   * Handle async operations with error catching
   */
  static asyncHandler<T>(
    fn: (req: any, res: Response, next: any) => Promise<T>
  ) {
    return (req: any, res: Response, next: any) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }
}

export default ResponseHandler;
