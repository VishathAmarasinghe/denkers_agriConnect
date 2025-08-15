import { Request, Response, NextFunction } from 'express';
import { ApiResponse, ValidationError, ResponseServiceInterface } from '../types';

class ResponseService implements ResponseServiceInterface {
  /**
   * Send success response
   */
  success<T>(res: Response, data: T, message: string = 'Success', statusCode: number = 200): void {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data
    };
    
    res.status(statusCode).json(response);
  }

  /**
   * Send error response
   */
  error(res: Response, message: string, statusCode: number = 500, errors?: string[]): void {
    const response: ApiResponse = {
      success: false,
      message,
      errors
    };
    
    res.status(statusCode).json(response);
  }

  /**
   * Send validation error response
   */
  validationError(res: Response, errors: ValidationError[]): void {
    const response: ApiResponse = {
      success: false,
      message: 'Validation failed',
      errors: errors.map(error => `${error.field}: ${error.message}`)
    };
    
    res.status(400).json(response);
  }

  /**
   * Send paginated response
   */
  paginated<T>(res: Response, data: T[], pagination: any, message: string = 'Data retrieved successfully'): void {
    const response: ApiResponse<T[]> = {
      success: true,
      message,
      data,
      pagination
    };
    
    res.json(response);
  }

  /**
   * Send rate limit error response
   */
  rateLimitError(res: Response): void {
    this.error(res, 'Too many requests. Please try again later.', 429);
  }

  /**
   * Async handler wrapper for error handling
   */
  asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
    return (req: Request, res: Response, next: NextFunction): void => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * 404 Not Found handler
   */
  notFoundHandler(req: Request, res: Response): void {
    this.error(res, `Route ${req.originalUrl} not found`, 404);
  }

  /**
   * Global error handler
   */
  errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
    console.error('Error:', err);
    
    // Handle specific error types
    if (err.name === 'ValidationError') {
      return this.error(res, 'Validation failed', 400, [err.message]);
    }
    
    if (err.name === 'UnauthorizedError') {
      return this.error(res, 'Unauthorized access', 401);
    }
    
    if (err.name === 'ForbiddenError') {
      return this.error(res, 'Access forbidden', 403);
    }
    
    if (err.name === 'NotFoundError') {
      return this.error(res, 'Resource not found', 404);
    }
    
    // Default error
    this.error(res, 'Internal server error', 500);
  }
}

export default new ResponseService();
