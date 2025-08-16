import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest, JWTPayload } from '../types';
import AuthService from '../services/auth';
import ResponseService from '../services/response';

/**
 * Authentication middleware
 * Verifies JWT token and adds user info to request
 */
export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return ResponseService.error(res, 'Access token required', 401);
  }

  try {
    const decoded = AuthService.verifyToken(token);
    if (!decoded) {
      return ResponseService.error(res, 'Invalid or expired token', 401);
    }

    // Add user info to request
    req.user = decoded;
    next();
  } catch (error) {
    return ResponseService.error(res, 'Invalid token', 401);
  }
};

/**
 * Role-based access control middleware
 * Checks if user has required role (supports both database and application roles)
 */
export const requireRole = (requiredRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return ResponseService.error(res, 'Authentication required', 401);
    }

    // Check if user has any of the required roles
    // Support both database roles (admin, farmer, field_officer) and application roles (admin.agriConnect, farmer.agriConnect, field_officer.agriConnect)
    const userRole = req.user.role;
    const hasRequiredRole = requiredRoles.some(requiredRole => {
      // Direct match
      if (userRole === requiredRole) return true;
      
      // Application role match (e.g., admin.agriConnect matches admin)
      if (userRole === `${requiredRole}.agriConnect`) return true;
      
      // Database role match (e.g., admin matches admin.agriConnect)
      if (userRole.endsWith('.agriConnect') && userRole.startsWith(requiredRole + '.')) return true;
      
      return false;
    });

    if (!hasRequiredRole) {
      return ResponseService.error(res, 'Insufficient permissions', 403);
    }

    next();
  };
};

/**
 * Admin-only access middleware
 */
export const requireAdmin = requireRole(['admin']);

/**
 * Farmer-only access middleware
 */
export const requireFarmer = requireRole(['farmer']);

/**
 * Farmer or admin access middleware
 */
export const requireFarmerOrAdmin = requireRole(['farmer', 'admin']);

/**
 * Field officer or admin access middleware
 */
export const requireFieldOfficerOrAdmin = requireRole(['field_officer', 'admin']);

/**
 * Optional authentication middleware
 * Adds user info if token is present, but doesn't require it
 */
export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = AuthService.verifyToken(token);
      if (decoded) {
        req.user = decoded;
      }
    } catch (error) {
      // Token is invalid, but we continue without authentication
      console.warn('Invalid token in optional auth:', error);
    }
  }

  next();
};

/**
 * Rate limiting middleware (basic implementation)
 */
export const rateLimit = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const clientId = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();

    // Get or create client record
    let clientRecord = requests.get(clientId);
    if (!clientRecord || now > clientRecord.resetTime) {
      clientRecord = { count: 0, resetTime: now + windowMs };
      requests.set(clientId, clientRecord);
    }

    // Check rate limit
    if (clientRecord.count >= maxRequests) {
      return ResponseService.rateLimitError(res);
    }

    // Increment request count
    clientRecord.count++;
    next();
  };
};

/**
 * API key authentication middleware
 */
export const requireApiKey = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;

  if (!apiKey || apiKey !== process.env.API_KEY) {
    return ResponseService.error(res, 'Valid API key required', 401);
  }

  next();
};

/**
 * CORS middleware configuration
 */
export const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};

/**
 * Request logging middleware
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });

  next();
};

/**
 * Require authentication middleware
 */
export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return ResponseService.error(res, 'Authentication token required', 401);
  }

  try {
    const decoded = AuthService.verifyToken(token);
    if (!decoded) {
      return ResponseService.error(res, 'Invalid or expired token', 401);
    }

    // Add user info to request
    req.user = decoded;
    next();
  } catch (error) {
    return ResponseService.error(res, 'Invalid token', 401);
  }
};

/**
 * Error handling middleware
 */
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error('Error:', err);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return ResponseService.error(res, 'Validation failed', 400, [err.message]);
  }
  
  if (err.name === 'UnauthorizedError') {
    return ResponseService.error(res, 'Unauthorized access', 401);
  }
  
  if (err.name === 'ForbiddenError') {
    return ResponseService.error(res, 'Access forbidden', 403);
  }
  
  if (err.name === 'NotFoundError') {
    return ResponseService.error(res, 'Resource not found', 404);
  }
  
  // Default error
  ResponseService.error(res, 'Internal server error', 500);
};
