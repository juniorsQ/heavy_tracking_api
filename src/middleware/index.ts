import { Request, Response, NextFunction } from 'express';
import { JWTUtils } from '../utils';
import { ApiError } from '../types';
import logger from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access token required'
      });
      return;
    }

    const decoded = JWTUtils.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(403).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
};

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Unhandled error:', error);

  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      success: false,
      error: error.message,
      details: error.details
    });
    return;
  }

  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
};

export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        error: error.details[0].message
      });
      return;
    }
    next();
  };
};
