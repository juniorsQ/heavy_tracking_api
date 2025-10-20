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
  headers: any;
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    logger.info('Auth header:', authHeader);
    
    if (!authHeader) {
      logger.error('No authorization header');
      res.status(401).json({
        success: false,
        error: 'Authorization header required'
      });
      return;
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    logger.info('Extracted token:', token.substring(0, 20) + '...');

    if (!token) {
      logger.error('No token found');
      res.status(401).json({
        success: false,
        error: 'Access token required'
      });
      return;
    }

    logger.info('Verifying token...');
    const decoded = JWTUtils.verifyToken(token);
    logger.info('Token decoded successfully:', decoded);
    
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(403).json({
      success: false,
      error: 'Invalid or expired token',
      details: error.message
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

  // Check if it's a custom API error
  if ((error as any).statusCode) {
    res.status((error as any).statusCode).json({
      success: false,
      error: error.message,
      details: (error as any).details
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

export const validateRequest = (schema: any, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const data = source === 'body' ? req.body : source === 'query' ? req.query : req.params;
    const { error } = schema.validate(data);
    
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
